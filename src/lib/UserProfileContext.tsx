"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    cash_balance: number;
    username: string | null;
    created_at: string | null;
}

export interface AuthUser {
    id: string;
    email: string | null;
    user_metadata: { full_name?: string; avatar_url?: string };
}

export interface UserProfileContextValue {
    user: AuthUser | null;
    profile: UserProfile | null;
    loading: boolean;
    displayName: string;
    displayInitial: string;
    firstName: string;
    refetch: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const UserProfileContext = createContext<UserProfileContextValue>({
    user: null,
    profile: null,
    loading: true,
    displayName: "Trader",
    displayInitial: "T",
    firstName: "Trader",
    refetch: () => { },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STARTING_BALANCE = 10000;

function deriveName(profile: UserProfile | null, user: AuthUser | null): string {
    return (
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.email?.split("@")[0] ||
        "Trader"
    );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [trigger, setTrigger] = useState(0);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                // 1. Get the authenticated user
                const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
                if (authErr || !authUser || !mountedRef.current) {
                    if (mountedRef.current) setLoading(false);
                    return;
                }
                if (mountedRef.current) setUser(authUser as AuthUser);

                // 2. Fetch the profile row
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("id, full_name, avatar_url, cash_balance, username, created_at")
                    .eq("id", authUser.id)
                    .single();

                if (!mountedRef.current) return;

                if (profileData) {
                    const balance = Number(profileData.cash_balance ?? 0);

                    if (balance <= 0) {
                        // Show balance optimistically immediately
                        if (mountedRef.current) {
                            setProfile({ ...(profileData as UserProfile), cash_balance: STARTING_BALANCE });
                        }
                        // Fire-and-forget DB seed (avoids AbortError blocking the UI)
                        supabase
                            .from("profiles")
                            .update({ cash_balance: STARTING_BALANCE })
                            .eq("id", authUser.id)
                            .then(({ error }) => {
                                if (error) console.warn("balance seed:", error.message);
                            });
                    } else {
                        if (mountedRef.current) setProfile(profileData as UserProfile);
                    }
                } else {
                    // No profile yet — create with GH₵10,000
                    const fullName = authUser.user_metadata?.full_name || null;
                    const { data: newProfile } = await supabase
                        .from("profiles")
                        .insert({
                            id: authUser.id,
                            full_name: fullName,
                            cash_balance: STARTING_BALANCE,
                        })
                        .select("id, full_name, avatar_url, cash_balance, username, created_at")
                        .single();

                    if (mountedRef.current) {
                        setProfile(
                            newProfile
                                ? (newProfile as UserProfile)
                                : {
                                    id: authUser.id,
                                    full_name: fullName,
                                    avatar_url: null,
                                    cash_balance: STARTING_BALANCE,
                                    username: null,
                                    created_at: null,
                                }
                        );
                    }
                }
            } catch (err: any) {
                if (err?.name !== "AbortError") console.error("UserProfileContext error:", err);
            } finally {
                if (mountedRef.current) setLoading(false);
            }
        }

        load();
    }, [trigger]);

    // Listen for Supabase auth state changes (login / logout)
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                setTrigger(t => t + 1);
            }
            if (event === "SIGNED_OUT") {
                setUser(null);
                setProfile(null);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const refetch = useCallback(() => setTrigger(t => t + 1), []);

    const rawName = deriveName(profile, user);
    const firstName = rawName.split(" ")[0];

    const value: UserProfileContextValue = {
        user,
        profile,
        loading,
        displayName: rawName,
        displayInitial: firstName.charAt(0).toUpperCase(),
        firstName,
        refetch,
    };

    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Use this hook in any component inside the dashboard to get the shared user profile.
 * The profile is loaded ONCE at the layout level and cached — no per-component fetches.
 */
export function useUserProfile(): UserProfileContextValue {
    return useContext(UserProfileContext);
}
