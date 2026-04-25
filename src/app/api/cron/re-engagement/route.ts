import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, getInactivitySubject, type EmailTemplate, type EmailPayload } from '@/lib/email';

export const dynamic = 'force-dynamic';

// ─── Supabase service client (bypasses RLS) ────────────────────────────────
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// ─── Inactivity thresholds ─────────────────────────────────────────────────
const THRESHOLDS = [
    { days: 30, template: 'inactivity_30d' as EmailTemplate },
    { days: 14, template: 'inactivity_14d' as EmailTemplate },
    { days:  7, template: 'inactivity_7d'  as EmailTemplate },
    { days:  3, template: 'inactivity_3d'  as EmailTemplate },
];

// Anti-spam: never email the same inactivity template within 7 days
const INACTIVITY_EMAIL_COOLDOWN_DAYS = 7;

// Don't email users who signed up within 48 hours
const MIN_ACCOUNT_AGE_HOURS = 48;

// ─── Portfolio drift estimate ──────────────────────────────────────────────
/**
 * Approximate the portfolio change since a timestamp using stored change_percent
 * from the stocks table. This is a rough heuristic — it multiplies the stored
 * daily change_percent by the number of days since last visit to produce an
 * attention-grabbing curiosity figure.
 *
 * "Your portfolio would have changed by +3.2% since your last visit."
 */
async function estimatePortfolioDrift(
    userId: string,
    daysSinceActive: number
): Promise<number | null> {
    const supabase = getSupabaseAdmin();
    try {
        // Get user's holdings with current prices
        const { data: holdings } = await supabase
            .from('holdings')
            .select('symbol, quantity, average_cost')
            .eq('user_id', userId)
            .gt('quantity', 0);

        if (!holdings || holdings.length === 0) return null;

        const symbols = holdings.map(h => h.symbol);

        const { data: stocks } = await supabase
            .from('stocks')
            .select('symbol, current_price, change_percent')
            .in('symbol', symbols);

        if (!stocks || stocks.length === 0) return null;

        const stockMap = new Map(stocks.map(s => [s.symbol, s]));

        let totalValue = 0;
        let totalCost = 0;

        for (const h of holdings) {
            const stock = stockMap.get(h.symbol);
            const currentPrice = stock?.current_price ?? h.average_cost;
            totalValue += h.quantity * currentPrice;
            totalCost += h.quantity * h.average_cost;
        }

        if (totalCost === 0) return null;

        // Extrapolate: average daily drift compounded over daysSinceActive
        // We use a simplified linear approximation to keep it honest
        const avgDailyChangePct = stocks.reduce((sum, s) => sum + (s.change_percent ?? 0), 0) / stocks.length;
        const estimatedDrift = avgDailyChangePct * Math.min(daysSinceActive, 7); // cap at 7 days of signal

        // Clamp to a believable range
        return Math.max(-15, Math.min(15, estimatedDrift));
    } catch {
        return null;
    }
}

// ─── Route handler ─────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
    const supabase = getSupabaseAdmin();
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const results: { userId: string; email: string; template: string; sent: boolean }[] = [];
        let processed = 0;

        // Fetch all users with their last_active_at and email
        // We join auth.users for email via the service client
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, last_active_at, last_inactivity_email_at, created_at')
            .order('last_active_at', { ascending: true, nullsFirst: true });

        if (profilesError) throw profilesError;
        if (!profiles || profiles.length === 0) {
            return NextResponse.json({ message: 'No profiles to process', processed: 0 });
        }

        for (const profile of profiles) {
            processed++;

            // Skip users created within last 48 hours
            const accountAgeHours = (now.getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60);
            if (accountAgeHours < MIN_ACCOUNT_AGE_HOURS) continue;

            // Skip if no last_active_at (never logged in after signup)
            const lastActiveAt = profile.last_active_at ? new Date(profile.last_active_at) : null;
            if (!lastActiveAt) continue;

            const daysSinceActive = (now.getTime() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);

            // Not inactive enough — skip
            if (daysSinceActive < 3) continue;

            // Anti-spam: skip if we emailed them within the cooldown period
            if (profile.last_inactivity_email_at) {
                const daysSinceEmail = (now.getTime() - new Date(profile.last_inactivity_email_at).getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceEmail < INACTIVITY_EMAIL_COOLDOWN_DAYS) continue;
            }

            // Determine which threshold bucket applies (largest first)
            const bucket = THRESHOLDS.find(t => daysSinceActive >= t.days);
            if (!bucket) continue;

            // Fetch the user's auth email (service client can read auth.users)
            const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
            if (!authUser?.user?.email) continue;

            const user = {
                id: profile.id,
                email: authUser.user.email,
                full_name: profile.full_name,
            };

            // Compute portfolio drift for curiosity hook
            const driftPercent = await estimatePortfolioDrift(profile.id, Math.floor(daysSinceActive));

            const subject = getInactivitySubject(bucket.template, driftPercent ?? undefined);

            // Build template-specific payload
            const payload: EmailPayload = {
                subject,
                preview: subject,
                firstName: profile.full_name?.split(' ')[0] || 'Investor',
                daysSinceActive: Math.floor(daysSinceActive),
                driftPercent,
            };

            if (bucket.template === 'inactivity_7d' || bucket.template === 'inactivity_3d') {
                payload.ctaLabel = 'Check My Portfolio';
                payload.ctaUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://inv.labs'}/dashboard/portfolio`;
            } else if (bucket.template === 'inactivity_14d') {
                payload.ctaLabel = 'View Leaderboard';
                payload.ctaUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://inv.labs'}/dashboard/leaderboard`;
            } else {
                payload.ctaLabel = 'Return to inv.labs';
                payload.ctaUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://inv.labs'}/dashboard`;
            }

            // Send (currently logs to console)
            const { success } = await sendEmail(user, bucket.template, payload);

            if (success) {
                // Update last_inactivity_email_at to enforce cooldown
                await supabase
                    .from('profiles')
                    .update({ last_inactivity_email_at: now.toISOString() })
                    .eq('id', profile.id);

                results.push({ userId: profile.id, email: user.email, template: bucket.template, sent: true });
            }
        }

        return NextResponse.json({
            success: true,
            processed,
            emailsSent: results.length,
            results,
        });

    } catch (error: any) {
        console.error('[re-engagement cron] Error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred running re-engagement cron' }, { status: 500 });
    }
}
