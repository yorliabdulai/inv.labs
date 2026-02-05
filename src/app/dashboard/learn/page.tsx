"use client";

import { BookOpen, Clock, ChevronRight, PlayCircle, Lightbulb, Bookmark, Trophy, Star, CheckCircle, Target, Users, Award, TrendingUp, GraduationCap, BarChart3, PieChart, DollarSign, Shield } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function LearnPage() {
    const learningPaths = [
        {
            title: "Market Fundamentals",
            description: "Master the basics of stock market investing",
            progress: 75,
            totalLessons: 12,
            completedLessons: 9,
            level: "Intermediate",
            color: "indigo",
            icon: BarChart3,
            estimatedTime: "4h 30m"
        },
        {
            title: "Technical Analysis",
            description: "Learn to read charts and predict market movements",
            progress: 45,
            totalLessons: 15,
            completedLessons: 7,
            level: "Advanced",
            color: "purple",
            icon: TrendingUp,
            estimatedTime: "6h 15m"
        },
        {
            title: "Risk Management",
            description: "Protect your capital with proven strategies",
            progress: 60,
            totalLessons: 8,
            completedLessons: 5,
            level: "Intermediate",
            color: "emerald",
            icon: Shield,
            estimatedTime: "3h 45m"
        }
    ];

    const featuredLessons = [
        {
            title: "Understanding GSE Market Structure",
            category: "Market Fundamentals",
            readTime: "5 min",
            type: "Article",
            difficulty: "Beginner",
            description: "An in-depth look at how the Ghana Stock Exchange operates, from listing requirements to trading sessions.",
            image: "/api/placeholder/400/200",
            rating: 4.8,
            students: 1247
        },
        {
            title: "P/E Ratio Deep Dive",
            category: "Fundamental Analysis",
            readTime: "8 min",
            type: "Video",
            difficulty: "Intermediate",
            description: "How to use Price-to-Earnings ratios to identify undervalued stocks in Ghana's banking sector.",
            image: "/api/placeholder/400/200",
            rating: 4.9,
            students: 892
        },
        {
            title: "Dividend Investing Strategy",
            category: "Income Investing",
            readTime: "6 min",
            type: "Interactive",
            difficulty: "Intermediate",
            description: "Balance dividend yields with capital growth in your Ghana-focused portfolio.",
            image: "/api/placeholder/400/200",
            rating: 4.7,
            students: 654
        }
    ];

    const achievements = [
        { title: "First Trade", description: "Complete your first stock transaction", earned: true, icon: Trophy },
        { title: "Market Master", description: "Score 90% on fundamentals quiz", earned: true, icon: Award },
        { title: "Risk Manager", description: "Complete risk management course", earned: false, icon: Shield },
        { title: "Portfolio Builder", description: "Create a diversified portfolio", earned: false, icon: PieChart }
    ];

    return (
        <div className="pb-16 space-y-4 md:space-y-8">
            <DashboardHeader />

            {/* Learning Hub Header - Mobile Optimized */}
            <div className="glass-card p-4 md:p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 flex-shrink-0">
                            <GraduationCap size={24} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl md:text-3xl font-black text-[#1A1C4E] tracking-tight">Learning Hub</h1>
                            <p className="text-indigo-600 font-medium text-sm md:text-base">Master investing with expert-led courses and Ghana market insights</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="bg-white/60 rounded-xl p-3 md:p-4 border border-white/50 flex-1 sm:flex-none">
                            <div className="text-center">
                                <div className="text-xl md:text-2xl font-black text-indigo-600">Level 3</div>
                                <div className="text-[10px] md:text-xs font-bold text-indigo-500 uppercase tracking-wider">Investor</div>
                            </div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-3 md:p-4 border border-white/50 flex-1 sm:flex-none">
                            <div className="text-center">
                                <div className="text-xl md:text-2xl font-black text-purple-600">850</div>
                                <div className="text-[10px] md:text-xs font-bold text-purple-500 uppercase tracking-wider">XP Points</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Learning Paths - Mobile Optimized */}
            <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-black text-[#1A1C4E]">Learning Paths</h2>
                    <button className="text-xs md:text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors min-h-[44px] px-2 touch-manipulation">View All</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    {learningPaths.map((path, i) => (
                        <div key={i} className="glass-card p-4 md:p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100 hover:border-indigo-200 touch-manipulation active:scale-[0.98]">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                    path.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                                    path.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                                    'bg-emerald-100 text-emerald-600'
                                }`}>
                                    <path.icon size={18} />
                                </div>
                                <div className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider ${
                                    path.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                                    path.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {path.level}
                                </div>
                            </div>

                            <h3 className="text-base md:text-lg font-black text-[#1A1C4E] mb-2 group-hover:text-indigo-600 transition-colors">
                                {path.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                {path.description}
                            </p>

                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</span>
                                    <span className="text-xs md:text-sm font-black text-gray-800">{path.progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r ${
                                        path.color === 'indigo' ? 'from-indigo-500 to-indigo-600' :
                                        path.color === 'purple' ? 'from-purple-500 to-purple-600' :
                                        'from-emerald-500 to-emerald-600'
                                    } rounded-full transition-all duration-1000`} style={{ width: `${path.progress}%` }}></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] md:text-xs font-bold text-gray-500 mb-4">
                                <span>{path.completedLessons}/{path.totalLessons} lessons</span>
                                <span>{path.estimatedTime}</span>
                            </div>

                            <button className={`w-full py-3 md:py-3 font-black rounded-xl transition-all duration-200 text-xs md:text-sm min-h-[48px] touch-manipulation active:scale-95 ${
                                path.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100' :
                                path.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-100' :
                                'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100'
                            }`}>
                                Continue Learning
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Featured Lessons - Mobile Optimized */}
            <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-black text-[#1A1C4E]">Featured Lessons</h2>
                    <button className="px-3 md:px-4 py-2 bg-indigo-600 text-white font-black rounded-xl text-xs md:text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 min-h-[44px] touch-manipulation active:scale-95">
                        Browse All
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {featuredLessons.map((lesson, i) => (
                        <div key={i} className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100 hover:border-indigo-200 touch-manipulation active:scale-[0.98]">
                            {/* Lesson Image Placeholder */}
                            <div className="h-32 bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center ${
                                        lesson.type === "Video" ? "bg-red-500" :
                                        lesson.type === "Interactive" ? "bg-emerald-500" :
                                        "bg-indigo-500"
                                    }`}>
                                        {lesson.type === "Video" ? <PlayCircle size={20} className="text-white ml-1" /> :
                                         lesson.type === "Interactive" ? <Target size={20} className="text-white" /> :
                                         <BookOpen size={20} className="text-white" />}
                                    </div>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <div className={`px-2 py-1 rounded-lg text-[10px] md:text-xs font-black ${
                                        lesson.difficulty === "Beginner" ? "bg-green-500 text-white" :
                                        lesson.difficulty === "Intermediate" ? "bg-yellow-500 text-white" :
                                        "bg-red-500 text-white"
                                    }`}>
                                        {lesson.difficulty}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 md:p-6">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="text-[10px] md:text-xs font-bold text-indigo-600 uppercase tracking-wider">{lesson.category}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className="text-[10px] md:text-xs font-medium text-gray-500 flex items-center gap-1">
                                        <Clock size={10} /> {lesson.readTime}
                                    </span>
                                </div>

                                <h3 className="text-base md:text-lg font-black text-[#1A1C4E] mb-2 group-hover:text-indigo-600 transition-colors leading-tight">
                                    {lesson.title}
                                </h3>

                                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                                    {lesson.description}
                                </p>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-1">
                                        <Star size={12} className="text-yellow-500 fill-current" />
                                        <span className="text-xs md:text-sm font-bold text-gray-800">{lesson.rating}</span>
                                        <span className="text-[10px] md:text-xs text-gray-500">({lesson.students})</span>
                                    </div>
                                    <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        {lesson.type}
                                    </div>
                                </div>

                                <button className="w-full py-3 bg-gray-50 text-gray-800 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-200 text-xs md:text-sm min-h-[48px] touch-manipulation active:scale-95">
                                    Start Lesson
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Achievements & Progress - Mobile Optimized */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                {/* Achievements */}
                <div className="glass-card p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                        <Trophy size={18} className="text-yellow-500" />
                        <h3 className="text-base md:text-lg font-black text-[#1A1C4E]">Achievements</h3>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        {achievements.map((achievement, i) => (
                            <div key={i} className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border transition-all touch-manipulation active:scale-[0.98] ${
                                achievement.earned
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : 'bg-gray-50 border-gray-200 opacity-60'
                            }`}>
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                    achievement.earned
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-gray-300 text-gray-500'
                                }`}>
                                    <achievement.icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-gray-800 text-sm md:text-base">{achievement.title}</h4>
                                    <p className="text-xs md:text-sm text-gray-600">{achievement.description}</p>
                                </div>
                                {achievement.earned && (
                                    <CheckCircle size={18} className="text-yellow-500 flex-shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Learning Stats */}
                <div className="glass-card p-4 md:p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                        <BarChart3 size={18} className="text-emerald-600" />
                        <h3 className="text-base md:text-lg font-black text-[#1A1C4E]">Learning Stats</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                        <div className="bg-white/60 rounded-xl p-3 md:p-4 border border-white/50">
                            <div className="text-xl md:text-2xl font-black text-emerald-600">21</div>
                            <div className="text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider">Lessons Completed</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-3 md:p-4 border border-white/50">
                            <div className="text-xl md:text-2xl font-black text-blue-600">850</div>
                            <div className="text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-wider">XP Earned</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-3 md:p-4 border border-white/50">
                            <div className="text-xl md:text-2xl font-black text-purple-600">12h</div>
                            <div className="text-[10px] md:text-xs font-bold text-purple-600 uppercase tracking-wider">Time Invested</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-3 md:p-4 border border-white/50">
                            <div className="text-xl md:text-2xl font-black text-orange-600">3</div>
                            <div className="text-[10px] md:text-xs font-bold text-orange-600 uppercase tracking-wider">Certificates</div>
                        </div>
                    </div>

                    <div className="bg-white/60 rounded-xl p-3 md:p-4 border border-white/50">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs md:text-sm font-bold text-gray-700">Next Milestone</span>
                            <span className="text-xs md:text-sm font-black text-emerald-600">150 XP</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
                        </div>
                        <div className="text-[10px] md:text-xs text-gray-600">Complete 2 more lessons to reach Level 4</div>
                    </div>
                </div>
            </div>

            {/* Quick Access - Mobile Optimized */}
            <div className="glass-card p-4 md:p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                    <div className="flex-1">
                        <h3 className="text-base md:text-lg font-black mb-1">Daily Learning Challenge</h3>
                        <p className="text-indigo-100 text-xs md:text-sm">Complete today's lesson to earn bonus XP and unlock rewards</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full md:w-auto">
                        <button className="w-full sm:w-auto px-4 md:px-6 py-3 bg-white text-indigo-600 font-black rounded-xl hover:bg-gray-50 transition-all duration-200 text-xs md:text-sm shadow-lg shadow-indigo-200/50 min-h-[48px] touch-manipulation active:scale-95">
                            Start Challenge
                        </button>
                        <button className="w-full sm:w-auto px-4 md:px-6 py-3 bg-indigo-500 text-white font-black rounded-xl hover:bg-indigo-400 transition-all duration-200 text-xs md:text-sm min-h-[48px] touch-manipulation active:scale-95">
                            View Progress
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
