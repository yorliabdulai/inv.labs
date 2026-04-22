"use client";

import { Bell, X, CheckCheck, BookOpen, TrendingUp, Zap, Target, Award, Trophy, Loader2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getUserNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    type Notification,
    type NotificationType,
} from "@/app/actions/notifications";
import { createClient } from "@/lib/supabase/client";

// ─── Lightweight time-ago helper (no dependency) ───────────────────────────────
function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ─── Icon mapping by notification type ────────────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, {
    Icon: React.ElementType;
    bg: string;
    text: string;
    border: string;
}> = {
    learning:        { Icon: BookOpen,  bg: "bg-blue-500/10",     text: "text-blue-500",   border: "border-blue-500/20" },
    portfolio:       { Icon: TrendingUp, bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
    gamification:    { Icon: Zap,       bg: "bg-amber-500/10",    text: "text-amber-500",   border: "border-amber-500/20" },
    mission:         { Icon: Target,    bg: "bg-violet-500/10",   text: "text-violet-500",  border: "border-violet-500/20" },
    founding_member: { Icon: Award,     bg: "bg-yellow-500/10",   text: "text-yellow-500",  border: "border-yellow-500/20" },
    challenge:       { Icon: Trophy,    bg: "bg-primary/10",      text: "text-primary",     border: "border-primary/20" },
};

// ─── Grouping helpers ─────────────────────────────────────────────────────────

function groupByDate(notifications: Notification[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { label: string; items: Notification[] }[] = [];
    const todayItems: Notification[] = [];
    const yesterdayItems: Notification[] = [];
    const olderItems: Notification[] = [];

    for (const n of notifications) {
        const d = new Date(n.created_at);
        if (d >= today) todayItems.push(n);
        else if (d >= yesterday) yesterdayItems.push(n);
        else olderItems.push(n);
    }

    if (todayItems.length)     groups.push({ label: "Today",     items: todayItems });
    if (yesterdayItems.length) groups.push({ label: "Yesterday", items: yesterdayItems });
    if (olderItems.length)     groups.push({ label: "Earlier",   items: olderItems });

    return groups;
}

// ─── Single notification item ─────────────────────────────────────────────────

function NotificationItem({
    notification,
    onRead,
    onDelete,
}: {
    notification: Notification;
    onRead: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.gamification;
    const { Icon } = cfg;
    const timeText = timeAgo(notification.created_at);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            className={`relative flex gap-3 p-3 rounded-xl border transition-all cursor-pointer group
                ${notification.is_read
                    ? "bg-transparent border-transparent hover:bg-muted/30"
                    : "bg-card border-border hover:border-primary/20 shadow-sm"
                }`}
            onClick={() => !notification.is_read && onRead(notification.id)}
        >
            {/* Unread dot */}
            {!notification.is_read && (
                <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-primary" />
            )}

            {/* Icon */}
            <div className={`mt-0.5 w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border ${cfg.bg} ${cfg.border}`}>
                <Icon size={14} className={cfg.text} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6">
                <p className={`text-xs font-semibold leading-snug ${notification.is_read ? "text-muted-foreground" : "text-foreground"}`}>
                    {notification.title}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                    {notification.message}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium uppercase tracking-wider">
                    {timeText}
                </p>
            </div>

            {/* Delete button (visible on hover) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                }}
                className="absolute right-2 bottom-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 text-red-500 hover:bg-red-500/20"
                title="Delete notification"
                aria-label="Delete notification"
            >
                <Trash2 size={12} />
            </button>
        </motion.div>
    );
}

// ─── Notification bell + panel ────────────────────────────────────────────────

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // ── Fetch & poll ──────────────────────────────────────────────────────────
    const refresh = useCallback(async () => {
        const [notifs, count] = await Promise.all([
            getUserNotifications(30),
            getUnreadCount(),
        ]);
        setNotifications(notifs);
        setUnreadCount(count);
    }, []);

    // Initial load
    useEffect(() => { refresh(); }, [refresh]);

    // Poll every 60s as a lightweight realtime fallback
    useEffect(() => {
        const interval = setInterval(refresh, 60_000);
        return () => clearInterval(interval);
    }, [refresh]);

    // Supabase Realtime subscription (opt-in, works if Realtime is enabled on the table)
    useEffect(() => {
        const channel = supabase
            .channel('notifications-bell')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
            }, () => {
                refresh();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase, refresh]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Load notifications when panel opens
    const handleOpen = async () => {
        setOpen(prev => !prev);
        if (!open) {
            setLoading(true);
            await refresh();
            setLoading(false);
        }
    };

    // Mark single notification read
    const handleRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        await markNotificationRead(id);
    };

    // Delete notification
    const handleDelete = async (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        // Recalculate unread count if we deleted an unread notif
        const wasUnread = notifications.find(n => n.id === id && !n.is_read);
        if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
        
        await deleteNotification(id);
    };

    // Mark all read
    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        await markAllNotificationsRead();
    };

    const groups = groupByDate(notifications);

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <button
                id="notification-bell"
                onClick={handleOpen}
                aria-label={`${unreadCount} unread notifications`}
                className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition-all active:scale-95 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 shadow-sm"
            >
                <Bell size={20} className="text-zinc-700 dark:text-zinc-200 md:w-7 md:h-7" />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            key="badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-white rounded-full text-[10px] font-bold flex items-center justify-center leading-none ring-2 ring-background"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Slide-down panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="fixed inset-x-4 top-24 md:absolute md:top-[calc(100%+12px)] md:right-0 md:left-auto md:w-[380px] md:inset-x-auto max-h-[calc(100vh-120px)] md:max-h-[520px] flex flex-col bg-card border border-border rounded-2xl shadow-[0_24px_48px_-8px_rgba(0,0,0,0.25)] z-[999] overflow-hidden"
                        aria-label="Notification center"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Bell size={14} className="text-muted-foreground" />
                                <span className="text-xs font-bold text-foreground uppercase tracking-widest">
                                    Notifications
                                </span>
                                {unreadCount > 0 && (
                                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-muted"
                                        title="Mark all read"
                                    >
                                        <CheckCheck size={12} />
                                        All read
                                    </button>
                                )}
                                <button
                                    onClick={() => setOpen(false)}
                                    className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                    aria-label="Close notifications"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 size={20} className="animate-spin text-muted-foreground" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3 border border-border">
                                        <Bell size={20} className="text-muted-foreground" />
                                    </div>
                                    <p className="text-xs font-semibold text-muted-foreground">
                                        All caught up
                                    </p>
                                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                                        Notifications from your activity will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-2 space-y-3">
                                    {groups.map(group => (
                                        <div key={group.label}>
                                            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2 pb-1 pt-1">
                                                {group.label}
                                            </p>
                                            <div className="space-y-1">
                                                <AnimatePresence>
                                                    {group.items.map(n => (
                                                        <NotificationItem
                                                            key={n.id}
                                                            notification={n}
                                                            onRead={handleRead}
                                                            onDelete={handleDelete}
                                                        />
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
