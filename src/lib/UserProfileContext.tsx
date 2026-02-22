"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    cash_balance: number;
    username: string | null;
    created_at: string | null;
}

export interface UserProfileContextValue {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    displayName: string;
    displayInitial: string;
    firstName: string;
    refetch: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined);

const STARTING_BALANCE = 10000;

// ─── Provider ─────────────────────────────────────────────────────────────────

interface UserProfileProviderProps {
    children: React.ReactNode;
    initialUser: User | null;
    initialProfile: UserProfile | null;
}

/**
 * UserProfileProvider with Server-to-Client Hydration.
 * 
 * By accepting initialUser and initialProfile from a Server Component Layout,
 * we ensure that the user's name and balance are visible immediately on load
 * with ZERO flash-of-unauthenticated-content.
 */
export function UserProfileProvider({
    children,
    initialUser,
    initialProfile
}: UserProfileProviderProps) {
    const [user, setUser] = useState<User | null>(initialUser);
    const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(!initialUser);
    const mountedRef = useRef(true);
    const fetchingRef = useRef(false);
    const supabase = createBrowserClient();

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const fetchProfile = useCallback(async (authUser: User) => {
        if (!mountedRef.current || fetchingRef.current) return;
        fetchingRef.current = true;
        setLoading(true);

        try {
            const { data: existing } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", authUser.id)
                .single();

            if (!mountedRef.current) return;

            if (existing) {
                setProfile(existing as UserProfile);
            }
        } catch (err) {
            console.error("[UserProfileContext] Refresh error:", err);
        } finally {
            fetchingRef.current = false;
            if (mountedRef.current) {
                setLoading(false);
                setInitializing(false);
            }
        }
    }, [supabase]);

    useEffect(() => {
        // HYDRATION: If we have a user but no profile, fetch it immediately
        if (user && !profile && !fetchingRef.current) {
            fetchProfile(user);
        } else if (user && profile) {
            setInitializing(false);
        } else if (!user) {
            setInitializing(false);
        }
    }, [user, profile, fetchProfile]);

    useEffect(() => {
        let isEffectActive = true;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isEffectActive) return;

            if (session?.user) {
                setUser(session.user);
                if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                    await fetchProfile(session.user);
                }
            } else {
                setUser(null);
                setProfile(null);
                setLoading(false);
                setInitializing(false);
            }
        });

        return () => {
            isEffectActive = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile, supabase]);

    const refetch = useCallback(() => {
        if (user) fetchProfile(user);
    }, [user, fetchProfile]);

    // Name Resolution Logic (Shared with Server logic for consistency)
    const rawName =
        profile?.full_name?.trim() ||
        (user?.user_metadata?.full_name as string | undefined)?.trim() ||
        user?.email?.split("@")[0] ||
        "";

    const firstName = rawName.split(" ")[0] || "";

    const value: UserProfileContextValue = {
        user,
        profile,
        loading,
        displayName: rawName || "Trader",
        displayInitial: (firstName.charAt(0) || "T").toUpperCase(),
        firstName: firstName || "Trader",
        refetch,
    };

    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
}

export function useUserProfile(): UserProfileContextValue {
    const context = useContext(UserProfileContext);
    if (!context) {
        throw new Error("useUserProfile must be used within a UserProfileProvider");
    }
    return context;
}
