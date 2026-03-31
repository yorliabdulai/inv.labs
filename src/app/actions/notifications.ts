"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
    | 'learning'
    | 'portfolio'
    | 'gamification'
    | 'mission'
    | 'founding_member'
    | 'challenge';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    is_read: boolean;
    metadata: Record<string, any> | null;
    created_at: string;
}

// ─── Anti-spam helpers ────────────────────────────────────────────────────────

/**
 * Returns count of notifications sent to a user today.
 */
async function getTodayCount(supabase: any, userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfDay.toISOString());

    return count ?? 0;
}

/**
 * Returns true if a notification of this type was sent within `hours` hours.
 */
async function recentOfType(
    supabase: any,
    userId: string,
    type: NotificationType,
    hours: number
): Promise<boolean> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', type)
        .gte('created_at', since);

    return (count ?? 0) > 0;
}

// ─── Core functions ───────────────────────────────────────────────────────────

/**
 * createNotification — inserts a notification with anti-spam guards.
 *
 * Anti-spam rules:
 *   1. Max 3 notifications per user per day (high priority bypasses this).
 *   2. No duplicate type within 48 hours (high priority bypasses this).
 *   3. Returns null if suppressed.
 */
export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    priority: NotificationPriority = 'low',
    metadata?: Record<string, any>
): Promise<Notification | null> {
    // Use service client so server actions can create notifications for any user
    const supabase = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Anti-spam: daily cap (not for high priority)
    if (priority !== 'high') {
        const todayCount = await getTodayCount(supabase, userId);
        if (todayCount >= 3) return null;
    }

    // Anti-spam: no duplicate type within 48h (not for high priority)
    if (priority !== 'high') {
        const isDuplicate = await recentOfType(supabase, userId, type, 48);
        if (isDuplicate) return null;
    }

    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            title,
            message,
            type,
            priority,
            metadata: metadata ?? null,
        })
        .select()
        .single();

    if (error) {
        console.error('[notifications] createNotification error:', error);
        return null;
    }

    return data as Notification;
}

/**
 * getUserNotifications — fetches notifications for the current signed-in user.
 */
export async function getUserNotifications(
    limit: number = 30,
    onlyUnread: boolean = false
): Promise<Notification[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (onlyUnread) query = query.eq('is_read', false);

    const { data, error } = await query;
    if (error) {
        console.error('[notifications] getUserNotifications error:', error);
        return [];
    }
    return data as Notification[];
}

/**
 * getUnreadCount — returns the count of unread notifications for the current user.
 */
export async function getUnreadCount(): Promise<number> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

    if (error) return 0;
    return count ?? 0;
}

/**
 * markNotificationRead — marks a single notification as read.
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);
}

/**
 * markAllNotificationsRead — marks all notifications as read for the current user.
 */
export async function markAllNotificationsRead(): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
}

// ─── Trigger helpers (called from XP / gamification actions) ──────────────────

export async function notifyLevelUp(userId: string, level: number, levelName: string) {
    return createNotification(
        userId,
        `Level Up! You're now Level ${level}`,
        `Welcome to the ${levelName} tier. Your investing knowledge is growing.`,
        'gamification',
        'high',
        { level }
    );
}

export async function notifyAchievementUnlocked(userId: string, achievementName: string, achievementKey: string) {
    return createNotification(
        userId,
        `Achievement unlocked: ${achievementName}`,
        `You earned the "${achievementName}" badge. Keep building your investor profile.`,
        'gamification',
        'medium',
        { achievement_key: achievementKey }
    );
}

export async function notifyXPBatch(userId: string, totalXP: number) {
    return createNotification(
        userId,
        `+${totalXP} XP earned today`,
        `You're making consistent progress. Every XP point brings you closer to the next level.`,
        'learning',
        'low',
        { xp: totalXP }
    );
}

export async function notifyStreakMilestone(userId: string, streakDays: number) {
    return createNotification(
        userId,
        `${streakDays}-day streak!`,
        `You've been active for ${streakDays} days in a row. Consistency is the investor's greatest edge.`,
        'gamification',
        'medium',
        { streak: streakDays }
    );
}

export async function notifyLessonCompleted(userId: string, courseTitle: string) {
    return createNotification(
        userId,
        `Lesson complete`,
        `You finished a lesson in "${courseTitle}". Keep learning — knowledge compounds too.`,
        'learning',
        'low',
        { course: courseTitle }
    );
}

export async function notifyCourseCompleted(userId: string, courseTitle: string, xpAwarded: number) {
    return createNotification(
        userId,
        `Course complete: ${courseTitle}`,
        `You earned ${xpAwarded} XP for completing the full course. Outstanding!`,
        'learning',
        'medium',
        { course: courseTitle, xp: xpAwarded }
    );
}

export async function notifyFoundingMember(userId: string) {
    return createNotification(
        userId,
        `Founding Member — Congratulations`,
        `You are one of the first members of inv.labs. Your Founding Member badge is permanent.`,
        'founding_member',
        'high'
    );
}

export async function notifyChallengeInviteAccepted(inviterId: string, joinerName: string, challengeTitle: string, bonusXP: number) {
    return createNotification(
        inviterId,
        `${joinerName} joined your challenge`,
        `Your friend joined "${challengeTitle}". You earned ${bonusXP} bonus XP for the invite!`,
        'challenge',
        'medium',
        { bonus_xp: bonusXP }
    );
}

export async function notifyChallengeCompleted(userId: string, challengeTitle: string, xpAwarded: number) {
    return createNotification(
        userId,
        `Challenge complete: ${challengeTitle}`,
        `You completed the challenge and earned ${xpAwarded} bonus XP. Impressive!`,
        'challenge',
        'high',
        { xp: xpAwarded }
    );
}

/**
 * checkLeaderboardRank — queries the leaderboard and fires a notification +
 * a real email when the user has reached the #1 position.
 *
 * Called from awardXP after every trade or XP event.
 * Guarded by the 48-hour anti-spam on the 'gamification' type for in-app,
 * and a separate last_rank1_email_at timestamp to avoid spamming the email.
 */
export async function checkLeaderboardRank(userId: string, currentXP: number) {
    try {
        const supabase = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Count users with MORE XP than current user
        const { count: aboveCount } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .gt('knowledge_xp', currentXP);

        const rank = (aboveCount ?? 0) + 1;

        // Check top-3 milestones
        const milestones = [
            { rank: 1, label: '#1 on the leaderboard', priority: 'high' as const },
            { rank: 2, label: '#2 on the leaderboard', priority: 'medium' as const },
            { rank: 3, label: '#3 on the leaderboard', priority: 'medium' as const },
        ];

        const milestone = milestones.find(m => m.rank === rank);
        if (!milestone) return;

        // In-app notification (guarded by anti-spam)
        await createNotification(
            userId,
            rank === 1 ? `🥇 You're #1 on the leaderboard!` : `You climbed to ${milestone.label}`,
            rank === 1
                ? `Your trading and learning have paid off. You're leading the entire inv.labs leaderboard with ${currentXP} XP.`
                : `Impressive progress! You've reached ${milestone.label} with ${currentXP} XP. Keep going.`,
            'gamification',
            milestone.priority,
            { rank, xp: currentXP }
        );

        // For rank 1, also send a real email (once per 7 days)
        if (rank === 1) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('last_rank1_email_at, full_name')
                .eq('id', userId)
                .single();

            const lastEmail = profile?.last_rank1_email_at
                ? new Date(profile.last_rank1_email_at).getTime()
                : 0;
            const daysSince = (Date.now() - lastEmail) / (1000 * 60 * 60 * 24);

            if (daysSince >= 7) {
                // Fetch auth email via service client
                const { data: authUser } = await supabase.auth.admin.getUserById(userId);
                if (authUser?.user?.email) {
                    await sendEmail(
                        { id: userId, email: authUser.user.email, full_name: profile?.full_name ?? null },
                        'leaderboard_rank1',
                        { subject: '🥇 You just reached #1 on the leaderboard!', xp: currentXP }
                    );

                    // Update timestamp to throttle future emails
                    await supabase
                        .from('profiles')
                        .update({ last_rank1_email_at: new Date().toISOString() })
                        .eq('id', userId);
                }
            }
        }
    } catch (err) {
        // Non-critical — don't throw, just log
        console.error('[notifications] checkLeaderboardRank error:', err);
    }
}
