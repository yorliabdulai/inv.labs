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

const UserProfileContext = createContext<UserProfileContextValue>({
    user: null,
    profile: null,
    loading: true,
    displayName: "",
    displayInitial: "",
    firstName: "",
    refetch: () => { },
});

const STARTING_BALANCE = 10000;

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Derive the best available display name for this user. */
function getDisplayName(profile: UserProfile | null, user: User | null): string {
    return (
        profile?.full_name?.trim() ||
        (user?.user_metadata?.full_name as string | undefined)?.trim() ||
        user?.email?.split("@")[0] ||
        ""
    );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const mountedRef = useRef(true);
    const fetchingRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    /**
     * Fetches and normalises the profile row for a given user.
     * - Creates the row if it doesn't exist
     * - Seeds GH₵10,000 if balance is missing
     * - Syncs full_name from user_metadata if the DB row has null
     */
    const fetchProfile = useCallback(async (authUser: User) => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        try {
            const { data: existingProfile } = await supabase
                .from("profiles")
                .select("id, full_name, avatar_url, cash_balance, username, created_at")
                .eq("id", authUser.id)
                .single();

            if (!mountedRef.current) return;

            const metaName = (authUser.user_metadata?.full_name as string | undefined) || null;

            if (existingProfile) {
                const balance = Number(existingProfile.cash_balance ?? 0);
                const needsBalance = balance <= 0;
                const needsName = !existingProfile.full_name && !!metaName;

                // Show data immediately (optimistic)
                if (mountedRef.current) {
                    setProfile({
                        ...(existingProfile as UserProfile),
                        cash_balance: needsBalance ? STARTING_BALANCE : balance,
                        full_name: needsName ? metaName : existingProfile.full_name,
                    });
                }

                // Fire-and-forget any necessary DB updates
                if (needsBalance || needsName) {
                    const updates: Record<string, unknown> = {};
                    if (needsBalance) updates.cash_balance = STARTING_BALANCE;
                    if (needsName) updates.full_name = metaName;

                    supabase
                        .from("profiles")
                        .update(updates)
                        .eq("id", authUser.id)
                        .then(({ error }) => {
                            if (error) console.warn("[profile] update error:", error.message);
                        });
                }
            } else {
                // No profile row yet — create it
                const { data: newProfile } = await supabase
                    .from("profiles")
                    .insert({
                        id: authUser.id,
                        full_name: metaName,
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
                                full_name: metaName,
                                avatar_url: null,
                                cash_balance: STARTING_BALANCE,
                                username: null,
                                created_at: null,
                            }
                    );
                }
            }
        } catch (err: any) {
            if (err?.name !== "AbortError") {
                console.error("[UserProfileContext] fetchProfile error:", err);
            }
        } finally {
            fetchingRef.current = false;
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        /**
         * onAuthStateChange is the SINGLE source of truth for auth state.
         *
         * The INITIAL_SESSION event fires synchronously with the cached session
         * on mount — so the user object is available instantly on every page
         * navigation, with zero network round-trips for the name display.
         *
         * We then fetch the full profile row from the DB in the background.
         */
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mountedRef.current) return;

            if (session?.user) {
                // Set user immediately — name shows from user_metadata right away
                setUser(session.user);
                // Then load full profile (balance, custom name, etc.)
                await fetchProfile(session.user);
            } else {
                // Signed out
                setUser(null);
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    const refetch = useCallback(() => {
        if (user) fetchProfile(user);
    }, [user, fetchProfile]);

    const rawName = getDisplayName(profile, user);
    const firstName = rawName.split(" ")[0];

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

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Use inside any component within the dashboard layout.
 * Returns the shared user profile loaded ONCE at the layout level.
 */
export function useUserProfile(): UserProfileContextValue {
    return useContext(UserProfileContext);
}
