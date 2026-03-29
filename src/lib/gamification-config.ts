export const XP_VALUES = {
    // Trading
    STOCK_TRADE_BUY: 10,
    STOCK_TRADE_SELL: 5,
    MF_INVESTMENT: 15,
    
    // Learning
    VIDEO_WATCHED: 25,
    LESSON_COMPLETED: 50,
    COURSE_COMPLETED: 200,
    
    // Engagement
    DAILY_LOGIN: 10,
    ATO_QUESTION: 5,
    PORTFOLIO_REVIEW: 10,
    EXPLORE_STOCK: 2,
    
    // Streak Bonuses
    STREAK_3_DAY: 50,
    STREAK_7_DAY: 150,
    STREAK_30_DAY: 1000,
} as const;

export type XPEventType = keyof typeof XP_VALUES;

export const LEVELS = [
    { level: 1, name: "Beginner Investor", minXP: 0, color: "#94a3b8" },
    { level: 2, name: "Market Explorer", minXP: 200, color: "#10b981" },
    { level: 3, name: "Portfolio Builder", minXP: 600, color: "#3b82f6" },
    { level: 4, name: "Strategy Thinker", minXP: 1200, color: "#8b5cf6" },
    { level: 5, name: "Confident Investor", minXP: 2500, color: "#f59e0b" },
    { level: 6, name: "Market Analyst", minXP: 5000, color: "#ef4444" },
    { level: 7, name: "Investment Strategist", minXP: 10000, color: "#ec4899" },
];

export const INVESTOR_JOURNEY_STAGES = [
    { id: 'beginner', name: 'Beginner', description: 'Learning basic concepts', minLevel: 1 },
    { id: 'explorer', name: 'Explorer', description: 'Exploring different assets', minLevel: 2 },
    { id: 'analyst', name: 'Analyst', description: 'Researching investments', minLevel: 4 },
    { id: 'strategist', name: 'Strategist', description: 'Building diversified portfolios', minLevel: 6 },
    { id: 'investor', name: 'Investor', description: 'Confident long-term participant', minLevel: 7 },
];

export const ACHIEVEMENTS = [
    // First Steps
    {
        key: 'first_trade',
        name: 'First Trade',
        description: 'Congratulations! You just made your first investment.',
        icon: 'Zap',
        category: 'First Steps'
    },
    {
        key: 'first_mf',
        name: 'Fund Pioneer',
        description: 'Started your journey with Mutual Funds.',
        icon: 'PieChart',
        category: 'First Steps'
    },
    {
        key: 'first_portfolio_review',
        name: 'Self-Aware',
        description: 'Reviewed your portfolio for the first time.',
        icon: 'Search',
        category: 'First Steps'
    },
    
    // Learning
    {
        key: 'curious_mind',
        name: 'Curious Mind',
        description: 'Asked Ato 10 financial questions.',
        icon: 'MessageSquare',
        category: 'Learning'
    },
    {
        key: 'knowledge_builder',
        name: 'Knowledge Builder',
        description: 'Completed 5 educational lessons.',
        icon: 'BookOpen',
        category: 'Learning'
    },
    {
        key: 'market_student',
        name: 'Market Student',
        description: 'Watched 10 educational videos.',
        icon: 'Play',
        category: 'Learning'
    },
    
    // Strategy
    {
        key: 'diversifier',
        name: 'Diversifier',
        description: 'Invested in multiple market sectors.',
        icon: 'Layers',
        category: 'Strategy'
    },
    {
        key: 'portfolio_builder',
        name: 'Portfolio Builder',
        description: 'Completed 25 trades.',
        icon: 'Briefcase',
        category: 'Strategy'
    },
    
    // Special
    {
        key: 'founding_member',
        name: 'Founding Member',
        description: 'One of the first 1,000 members of inv.labs.',
        icon: 'Award',
        category: 'Special'
    }
];

export function getLevelForXP(xp: number) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].minXP) {
            return LEVELS[i];
        }
    }
    return LEVELS[0];
}
