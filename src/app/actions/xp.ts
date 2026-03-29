"use server";

import { createClient } from "@/lib/supabase/server";
import { XP_VALUES, XPEventType, getLevelForXP } from "@/lib/gamification-config";
import { revalidatePath } from "next/cache";

export async function awardXP(eventType: XPEventType, metadata: any = {}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const xp_value = XP_VALUES[eventType];
    if (xp_value === undefined) return { error: "Invalid event type" };

    try {
        // 1. Log the event
        const { error: eventError } = await supabase
            .from('xp_events')
            .insert({
                user_id: user.id,
                event_type: eventType,
                xp_value: xp_value,
                metadata: metadata
            });

        if (eventError) throw eventError;

        // 2. Fetch current profile to compute new level
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('knowledge_xp, level, ato_questions_count, lessons_completed_count, videos_watched_count, portfolio_reviews_count, total_trades')
            .eq('id', user.id)
            .single();

        if (profileError) throw profileError;

        const newXP = (profile.knowledge_xp || 0) + xp_value;
        const newLevelData = getLevelForXP(newXP);
        const levelUp = newLevelData.level > profile.level;

        // 3. Update profile
        const updateData: any = {
            knowledge_xp: newXP,
            level: newLevelData.level
        };

        // Update specific counters based on event type
        if (eventType === 'ATO_QUESTION') updateData.ato_questions_count = (profile.ato_questions_count || 0) + 1;
        if (eventType === 'LESSON_COMPLETED') updateData.lessons_completed_count = (profile.lessons_completed_count || 0) + 1;
        if (eventType === 'VIDEO_WATCHED') updateData.videos_watched_count = (profile.videos_watched_count || 0) + 1;
        if (eventType === 'PORTFOLIO_REVIEW') updateData.portfolio_reviews_count = (profile.portfolio_reviews_count || 0) + 1;

        const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id);

        if (updateError) throw updateError;

        // 4. Check for relevant daily missions to mark as complete
        const today = new Date().toISOString().split('T')[0];
        const missionMapping: Record<XPEventType, string> = {
            'ATO_QUESTION': 'ask_ato',
            'VIDEO_WATCHED': 'watch_video',
            'PORTFOLIO_REVIEW': 'review_portfolio',
            'EXPLORE_STOCK': 'explore_stock',
            'LESSON_COMPLETED': 'complete_lesson',
            'STOCK_TRADE_BUY': '',
            'STOCK_TRADE_SELL': '',
            'MF_INVESTMENT': '',
            'DAILY_LOGIN': '',
            'COURSE_COMPLETED': '',
            'STREAK_3_DAY': '',
            'STREAK_7_DAY': '',
            'STREAK_30_DAY': ''
        };

        const missionKey = missionMapping[eventType];
        if (missionKey && !metadata.isMission) {
            await supabase
                .from('user_daily_missions')
                .update({ completed: true, completed_at: new Date().toISOString() })
                .eq('user_id', user.id)
                .eq('mission_key', missionKey)
                .eq('assigned_date', today)
                .eq('completed', false);
        }

        // 5. Check for new achievements
        await checkAchievements(user.id);

        revalidatePath('/dashboard');
        
        return { 
            success: true, 
            xp_awarded: xp_value, 
            new_xp: newXP, 
            level_up: levelUp, 
            new_level: newLevelData.level 
        };
    } catch (error) {
        console.error("Error awarding XP:", error);
        return { error: "Failed to award XP" };
    }
}

async function checkAchievements(userId: string) {
    const supabase = await createClient();
    
    // Fetch profile and current achievements
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
    const { data: earnedAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_key')
        .eq('user_id', userId);

    if (!profile) return;
    
    const earnedKeys = new Set(earnedAchievements?.map(a => a.achievement_key) || []);

    const newAchievements: { user_id: string; achievement_key: string }[] = [];

    // Common logic for checking and adding
    const addIfMissing = (key: string) => {
        if (!earnedKeys.has(key)) {
            newAchievements.push({ user_id: userId, achievement_key: key });
        }
    };

    // Achievement: Curious Mind (10 Ato questions)
    if (profile.ato_questions_count >= 10) addIfMissing('curious_mind');
    
    // Achievement: Knowledge Builder (5 lessons)
    if (profile.lessons_completed_count >= 5) addIfMissing('knowledge_builder');
    
    // Achievement: Market Student (10 videos)
    if (profile.videos_watched_count >= 10) addIfMissing('market_student');
    
    // Achievement: Portfolio Builder (25 trades) - although handled in SQL, good to have here too
    if (profile.total_trades >= 25) addIfMissing('portfolio_builder');

    if (newAchievements.length > 0) {
        await supabase.from('user_achievements').insert(newAchievements);
    }
}

export async function getUserGamificationData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const [profileRes, achievementsRes, missionsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_achievements').select('*').eq('user_id', user.id),
        supabase.from('user_daily_missions').select('*').eq('user_id', user.id).eq('assigned_date', new Date().toISOString().split('T')[0])
    ]);

    return {
        profile: profileRes.data,
        achievements: achievementsRes.data || [],
        dailyMissions: missionsRes.data || []
    };
}

export async function recordDailyLogin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const today = new Date().toISOString().split('T')[0];
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('last_active_date, streak_count, longest_streak')
        .eq('id', user.id)
        .single();

    if (!profile) return { error: "Profile not found" };

    if (profile.last_active_date === today) {
        return { success: true, alreadyLogged: true };
    }

    // Logic for streak
    let newStreak = 1;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (profile.last_active_date === yesterdayStr) {
        newStreak = (profile.streak_count || 0) + 1;
    }

    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            last_active_date: today,
            streak_count: newStreak,
            longest_streak: Math.max(newStreak, profile.longest_streak || 0)
        })
        .eq('id', user.id);

    if (updateError) return { error: "Failed to update login" };

    // Award XP for login
    await awardXP('DAILY_LOGIN');

    // Check streak milestones
    if (newStreak === 3) await awardXP('STREAK_3_DAY');
    if (newStreak === 7) await awardXP('STREAK_7_DAY');
    if (newStreak === 30) await awardXP('STREAK_30_DAY');

    return { success: true, newStreak };
}

export async function recordPortfolioReview() {
    return await awardXP('PORTFOLIO_REVIEW');
}

export async function recordExploreStock(symbol: string) {
    return await awardXP('EXPLORE_STOCK', { symbol });
}

export async function getDailyMissions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const today = new Date().toISOString().split('T')[0];

    const { data: missions, error } = await supabase
        .from('user_daily_missions')
        .select('*')
        .eq('user_id', user.id)
        .eq('assigned_date', today);

    if (error) return [];
    
    // If no missions for today, generate them
    if (!missions || missions.length === 0) {
        const newMissions = await generateDailyMissions(user.id);
        return newMissions;
    }

    return missions;
}

async function generateDailyMissions(userId: string) {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    const MISSION_POOL = [
        { key: 'watch_video', title: 'Watch an educational video', xp: 25 },
        { key: 'ask_ato', title: 'Ask Ato a financial question', xp: 15 },
        { key: 'review_portfolio', title: 'Review your portfolio', xp: 20 },
        { key: 'explore_stock', title: 'Explore a new stock', xp: 10 },
        { key: 'complete_lesson', title: 'Complete a lesson', xp: 50 },
    ];

    // Pick 3 random missions
    const selected = MISSION_POOL.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    const dbMissions = selected.map(m => ({
        user_id: userId,
        mission_key: m.key,
        assigned_date: today,
        xp_reward: m.xp,
        completed: false
    }));

    const { data, error } = await supabase
        .from('user_daily_missions')
        .insert(dbMissions)
        .select();

    if (error) {
        console.error("Error generating missions:", error);
        return [];
    }
    return data;
}

export async function completeMission(missionKey: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const today = new Date().toISOString().split('T')[0];

    const { data: mission, error: fetchErr } = await supabase
        .from('user_daily_missions')
        .select('*')
        .eq('user_id', user.id)
        .eq('mission_key', missionKey)
        .eq('assigned_date', today)
        .single();

    if (fetchErr || !mission || mission.completed) return { error: "Mission already completed or not found" };

    const { error: updateErr } = await supabase
        .from('user_daily_missions')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('id', mission.id);

    if (updateErr) return { error: "Failed to complete mission" };

    // Find the right event type for XP mapping
    let eventType: XPEventType = 'DAILY_LOGIN'; // Fallback
    if (missionKey === 'ask_ato') eventType = 'ATO_QUESTION';
    if (missionKey === 'watch_video') eventType = 'VIDEO_WATCHED';
    if (missionKey === 'review_portfolio') eventType = 'PORTFOLIO_REVIEW';
    if (missionKey === 'explore_stock') eventType = 'EXPLORE_STOCK';
    if (missionKey === 'complete_lesson') eventType = 'LESSON_COMPLETED';

    return await awardXP(eventType, { missionId: mission.id, isMission: true });
}
