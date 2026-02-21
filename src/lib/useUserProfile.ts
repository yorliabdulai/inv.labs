/**
 * Re-export useUserProfile from the shared context.
 * All components should import from here — the hook reads from a single
 * shared context loaded once at the dashboard layout level.
 */
export {
    useUserProfile,
    UserProfileProvider,
    type UserProfile,
    type AuthUser,
    type UserProfileContextValue,
} from "./UserProfileContext";
