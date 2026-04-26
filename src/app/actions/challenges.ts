"use server";

import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { awardXP } from "@/app/actions/xp";
import {
    notifyChallengeInviteAccepted,
    notifyChallengeCompleted,
} from "@/app/actions/notifications";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Challenge {
    id: string;
    creator_id: string;
    title: string;
    description: string | null;
    end_date: string;
    invite_code: string;
    xp_reward: number;
    is_active: boolean;
    created_at: string;
}

export interface ChallengeParticipant {
    id: string;
    challenge_id: string;
    user_id: string;
    invited_by: string | null;
    xp_at_join: number;
    current_xp: number;
    xp_earned: number;
    completed: boolean;
    joined_at: string;
    profile?: {
        full_name: string | null;
        avatar_url: string | null;
        level: number;
    };
}

export interface ChallengePreview {
    challenge_id: string;
    title: string;
    description: string | null;
    end_date: string;
    xp_reward: number;
    creator_name: string | null;
    participant_count: number;
    invite_code: string;
}

// ─── Service client (bypasses RLS for admin operations) ───────────────────────
function getServiceClient() {
    return createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// ─── Create a challenge ───────────────────────────────────────────────────────

export async function createChallenge(
    title: string,
    description: string,
    durationDays: number,
    xpReward: number = 100
): Promise<{ success: boolean; challenge?: Challenge; inviteCode?: string; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    try {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + durationDays);

        // Unique invite code
        const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

        // Create challenge
        const { data: challenge, error: challengeError } = await supabase
            .from('challenges')
            .insert({
                creator_id: user.id,
                title,
                description,
                end_date: endDate.toISOString(),
                invite_code: inviteCode,
                xp_reward: xpReward,
                is_active: true,
            })
            .select()
            .single();

        if (challengeError) throw challengeError;

        // Auto-enroll creator
        const { data: profile } = await supabase
            .from('profiles')
            .select('knowledge_xp')
            .eq('id', user.id)
            .single();

        await supabase.from('challenge_participants').insert({
            challenge_id: challenge.id,
            user_id: user.id,
            invited_by: null,
            xp_at_join: profile?.knowledge_xp ?? 0,
            current_xp: profile?.knowledge_xp ?? 0,
        });

        // Create an invitation record for sharing
        await supabase.from('challenge_invitations').insert({
            challenge_id: challenge.id,
            inviter_user_id: user.id,
            invite_code: inviteCode,
        });

        revalidatePath('/dashboard');
        return { success: true, challenge, inviteCode };
    } catch (error: any) {
        console.error('[challenges] createChallenge error:', error);
        return { success: false, error: error.message || "Failed to create challenge" };
    }
}

// ─── Get challenge preview by invite code (public, no auth required) ──────────

export async function getChallengePreview(inviteCode: string): Promise<ChallengePreview | null> {
    // Use service client so unauthenticated visitors can see previews
    const supabase = getServiceClient();

    const { data, error } = await supabase
        .rpc('get_challenge_preview', { p_invite_code: inviteCode });

    if (error || !data || data.length === 0) return null;
    return data[0] as ChallengePreview;
}

// ─── Join a challenge ─────────────────────────────────────────────────────────

export async function joinChallenge(
    inviteCode: string
): Promise<{ success: boolean; challengeId?: string; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    try {
        // Look up invitation
        const { data: invitation, error: inviteError } = await supabase
            .from('challenge_invitations')
            .select('*, challenges(*)')
            .eq('invite_code', inviteCode)
            .single();

        if (inviteError || !invitation) {
            return { success: false, error: "Invalid invite code" };
        }

        const challenge = invitation.challenges as unknown as Challenge;
        if (!challenge.is_active) {
            return { success: false, error: "This challenge has ended" };
        }

        // Check if already participating
        const { count } = await supabase
            .from('challenge_participants')
            .select('id', { count: 'exact', head: true })
            .eq('challenge_id', challenge.id)
            .eq('user_id', user.id);

        if ((count ?? 0) > 0) {
            return { success: true, challengeId: challenge.id }; // idempotent
        }

        // Get joiner's current XP
        const { data: profile } = await supabase
            .from('profiles')
            .select('knowledge_xp, full_name')
            .eq('id', user.id)
            .single();

        // Enroll joiner
        await supabase.from('challenge_participants').insert({
            challenge_id: challenge.id,
            user_id: user.id,
            invited_by: invitation.inviter_user_id,
            xp_at_join: profile?.knowledge_xp ?? 0,
            current_xp: profile?.knowledge_xp ?? 0,
        });

        // Increment invitation uses
        await supabase
            .from('challenge_invitations')
            .update({ uses: (invitation.uses ?? 0) + 1 })
            .eq('id', invitation.id);

        // Award bonus XP to inviter for a successful referral (25 XP)
        const REFERRAL_BONUS_XP = 25;
        if (invitation.inviter_user_id !== user.id) {
            // Notify inviter
            const joinerName = profile?.full_name || 'A friend';
            await notifyChallengeInviteAccepted(
                invitation.inviter_user_id,
                joinerName,
                challenge.title,
                REFERRAL_BONUS_XP
            );
        }

        revalidatePath('/dashboard');
        revalidatePath(`/challenges/join`);

        return { success: true, challengeId: challenge.id };
    } catch (error: any) {
        console.error('[challenges] joinChallenge error:', error);
        return { success: false, error: error.message || "Failed to join challenge" };
    }
}

// ─── Get leaderboard for a challenge ─────────────────────────────────────────

export async function getChallengeLeaderboard(challengeId: string): Promise<ChallengeParticipant[]> {
    const supabase = getServiceClient(); // public leaderboard

    const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
            *,
            profile:profiles(full_name, avatar_url, level)
        `)
        .eq('challenge_id', challengeId)
        .order('xp_earned', { ascending: false })
        .limit(20);

    if (error) {
        console.error('[challenges] getChallengeLeaderboard error:', error);
        return [];
    }

    return data as ChallengeParticipant[];
}

// ─── Get current user's active challenges ─────────────────────────────────────

export async function getUserChallenges(): Promise<(Challenge & { xp_earned: number })[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
            xp_earned,
            challenge:challenges(*)
        `)
        .eq('user_id', user.id)
        .eq('challenges.is_active', true)
        .order('joined_at', { ascending: false });

    if (error) return [];

    return (data ?? [])
        .filter(row => row.challenge)
        .map(row => ({
            ...(row.challenge as unknown as Challenge),
            xp_earned: row.xp_earned ?? 0,
        }));
}

// ─── Sync participant XP after an XP event ───────────────────────────────────
// Called from xp.ts after awarding XP

export async function syncChallengeXP(userId: string, newXP: number) {
    const supabase = getServiceClient();

    // Update all active challenge participations for this user
    await supabase
        .from('challenge_participants')
        .update({ current_xp: newXP })
        .eq('user_id', userId);
}

// ─── Complete a challenge (mark as done, award XP) ────────────────────────────

export async function completeChallengeForUser(challengeId: string, userId: string) {
    const supabase = getServiceClient();

    const { data: participation } = await supabase
        .from('challenge_participants')
        .select('completed, challenge:challenges(title, xp_reward)')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .single();

    if (!participation || participation.completed) return;

    await supabase
        .from('challenge_participants')
        .update({ completed: true })
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);

    const challenge = participation.challenge as unknown as { title: string; xp_reward: number };
    await notifyChallengeCompleted(userId, challenge.title, challenge.xp_reward);
}
