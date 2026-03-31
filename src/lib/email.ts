/**
 * Email Abstraction Layer — powered by Resend
 * ─────────────────────────────────────────────────────────────────────────────
 * Requires: RESEND_API_KEY in .env.local
 * From address: set RESEND_FROM_EMAIL (default: noreply@inv.labs)
 *
 * If RESEND_API_KEY is not set, falls back to console.log so dev mode
 * works without a key configured.
 */

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'inv.labs <noreply@inv.labs>';
const APP_URL    = process.env.NEXT_PUBLIC_APP_URL  || 'https://inv.labs';

// ─── Types ────────────────────────────────────────────────────────────────────

export type EmailTemplate =
    | 'inactivity_3d'
    | 'inactivity_7d'
    | 'inactivity_14d'
    | 'inactivity_30d'
    | 'weekly_digest'
    | 'account_created'
    | 'first_trade'
    | 'level_milestone'
    | 'challenge_invite'
    | 'challenge_completed'
    | 'leaderboard_rank1';

export interface EmailUser {
    id: string;
    email: string;
    full_name: string | null;
}

export interface EmailPayload {
    subject: string;
    preview?: string;
    [key: string]: any;
}

// ─── HTML builder ─────────────────────────────────────────────────────────────

function buildHtml(opts: {
    subject: string;
    firstName: string;
    body: string;
    badgeEmoji?: string;
    ctaLabel?: string;
    ctaUrl?: string;
}): string {
    const { firstName, body, ctaLabel, ctaUrl, badgeEmoji, subject } = opts;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #1f1f1f;border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid #1f1f1f;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.15em;text-transform:uppercase;">inv.labs</p>
        </td></tr>

        <!-- Badge -->
        ${badgeEmoji ? `<tr><td align="center" style="padding:32px 40px 0;">
          <div style="width:64px;height:64px;background:#1a1a2e;border:1px solid #2d2d6e;border-radius:16px;font-size:28px;line-height:64px;text-align:center;">${badgeEmoji}</div>
        </td></tr>` : ''}

        <!-- Body -->
        <tr><td style="padding:32px 40px 24px;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;">Hello, ${firstName}</p>
          <div style="font-size:15px;line-height:1.7;color:#d1d5db;">${body}</div>
        </td></tr>

        <!-- CTA -->
        ${ctaLabel && ctaUrl ? `<tr><td style="padding:0 40px 32px;">
          <a href="${ctaUrl}" style="display:inline-block;padding:14px 28px;background:#4f46e5;color:#fff;font-size:13px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.05em;">
            ${ctaLabel} &rarr;
          </a>
        </td></tr>` : ''}

        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid #1f1f1f;">
          <p style="margin:0;font-size:11px;color:#4b5563;">You&apos;re receiving this because you&apos;re a member of inv.labs. <a href="${APP_URL}/dashboard/settings" style="color:#6366f1;text-decoration:none;">Manage notifications</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Per-template content ─────────────────────────────────────────────────────

interface TemplateContent {
    subject: string;
    badgeEmoji: string;
    body: string;
    ctaLabel: string;
    ctaUrl: string;
}

function getTemplateContent(
    template: EmailTemplate,
    payload: EmailPayload
): TemplateContent {
    const drift = payload.driftPercent !== undefined && payload.driftPercent !== null
        ? `${Number(payload.driftPercent) >= 0 ? '+' : ''}${Number(payload.driftPercent).toFixed(1)}%`
        : null;

    switch (template) {
        case 'inactivity_3d':
            return {
                subject: drift ? `Your portfolio would have moved ${drift} since your last visit` : `Your investor journey is waiting`,
                badgeEmoji: '📈',
                body: drift
                    ? `<p>Based on market movements, <strong>your portfolio would have changed by ${drift}</strong> since you last logged in.</p><p>Markets don't wait. Log in to see exactly where you stand and make your next move.</p>`
                    : `<p>You haven't visited inv.labs in a few days. Your portfolio and daily missions are waiting for you.</p>`,
                ctaLabel: 'Check My Portfolio',
                ctaUrl: `${APP_URL}/dashboard/portfolio`,
            };
        case 'inactivity_7d':
            return {
                subject: drift ? `Markets moved ${drift} while you were away` : `The Ghana Stock Exchange has been active`,
                badgeEmoji: '🏦',
                body: drift
                    ? `<p>A lot can happen in a week on the GSE. <strong>Your portfolio has seen estimated movement of ${drift}</strong> since your last visit.</p><p>Your investment journey doesn't pause. Come back and see what's changed.</p>`
                    : `<p>It's been a week since your last visit. GSE stocks and mutual funds have been moving — log in to stay on top of your portfolio.</p>`,
                ctaLabel: 'View Portfolio',
                ctaUrl: `${APP_URL}/dashboard/portfolio`,
            };
        case 'inactivity_14d':
            return {
                subject: `Can you catch up on the leaderboard? Here's where you stand.`,
                badgeEmoji: '🏆',
                body: `<p>It's been two weeks since we last saw you. Traders on the inv.labs leaderboard have been earning XP and climbing the ranks.</p><p>Log in to complete your daily missions and take back your position.</p>`,
                ctaLabel: 'View Leaderboard',
                ctaUrl: `${APP_URL}/dashboard/leaderboard`,
            };
        case 'inactivity_30d':
            return {
                subject: `It's time to reactivate your inv.labs portfolio`,
                badgeEmoji: '⚡',
                body: `<p>Your inv.labs account has been dormant for over a month. A lot has changed — new lessons, updated stock prices, and fresh daily missions are waiting.</p><p>Your virtual GH&#8373;10,000 portfolio is still intact. Pick up where you left off.</p>`,
                ctaLabel: 'Return to inv.labs',
                ctaUrl: `${APP_URL}/dashboard`,
            };
        case 'leaderboard_rank1':
            return {
                subject: `🥇 You just reached #1 on the leaderboard!`,
                badgeEmoji: '🥇',
                body: `<p>You did it. You've climbed to the <strong>#1 spot on the inv.labs leaderboard</strong> with ${payload.xp || 0} XP.</p><p>This is a real milestone. Keep trading, learning, and building your edge — the top is yours to defend.</p>`,
                ctaLabel: 'See Leaderboard',
                ctaUrl: `${APP_URL}/dashboard/leaderboard`,
            };
        case 'weekly_digest':
            return {
                subject: `Your inv.labs weekly digest`,
                badgeEmoji: '📊',
                body: `<p>Here's your week at a glance:</p><ul style="padding-left:20px;color:#9ca3af;"><li>XP earned: <strong style="color:#d1d5db;">${payload.xp_this_week || 0}</strong></li><li>Lessons completed: <strong style="color:#d1d5db;">${payload.lessons_this_week || 0}</strong></li><li>Current rank: <strong style="color:#d1d5db;">#${payload.rank || '—'}</strong></li><li>Current level: <strong style="color:#d1d5db;">Level ${payload.level || 1}</strong></li></ul>`,
                ctaLabel: 'Open Dashboard',
                ctaUrl: `${APP_URL}/dashboard`,
            };
        case 'account_created':
            return {
                subject: `Welcome to inv.labs`,
                badgeEmoji: '🚀',
                body: `<p>Your account is set up and your virtual portfolio of <strong>GH&#8373;10,000</strong> is ready to invest.</p><p>Start by exploring the GSE stocks, taking a lesson in the Academy, or asking Ato your first financial question.</p>`,
                ctaLabel: 'Start Investing',
                ctaUrl: `${APP_URL}/dashboard`,
            };
        case 'first_trade':
            return {
                subject: `You made your first trade on inv.labs!`,
                badgeEmoji: '🎯',
                body: `<p>Your first trade is on the books — ${payload.symbol ? `<strong>${payload.symbol}</strong>` : 'a GSE stock or fund'}.</p><p>Every great investor started with a first trade. Keep building your portfolio and learning as you go.</p>`,
                ctaLabel: 'View Portfolio',
                ctaUrl: `${APP_URL}/dashboard/portfolio`,
            };
        case 'level_milestone':
            return {
                subject: `Level Up! You're now Level ${payload.level}`,
                badgeEmoji: '⬆️',
                body: `<p>Congratulations — you've reached <strong>Level ${payload.level}: ${payload.level_name || ''}</strong> on inv.labs.</p><p>Each level unlocks more depth in how you understand the market. Keep going.</p>`,
                ctaLabel: 'View My Profile',
                ctaUrl: `${APP_URL}/dashboard/profile`,
            };
        case 'challenge_invite':
            return {
                subject: `You've been invited to a challenge on inv.labs`,
                badgeEmoji: '🎯',
                body: `<p><strong>${payload.inviter_name || 'A trader'}</strong> has invited you to join the <strong>"${payload.challenge_title}"</strong> challenge on inv.labs.</p><p>Compete for XP, climb the challenge leaderboard, and earn a bonus reward when it ends.</p>`,
                ctaLabel: 'Join Challenge',
                ctaUrl: payload.invite_url || `${APP_URL}/challenges/join`,
            };
        case 'challenge_completed':
            return {
                subject: `You completed the "${payload.challenge_title}" challenge!`,
                badgeEmoji: '🏅',
                body: `<p>The <strong>${payload.challenge_title}</strong> challenge is over and you've earned <strong>${payload.xp_awarded || 0} bonus XP</strong>.</p><p>Your discipline paid off. Look out for new challenges to join.</p>`,
                ctaLabel: 'See My Progress',
                ctaUrl: `${APP_URL}/dashboard`,
            };
    }
}

// ─── Main sendEmail ───────────────────────────────────────────────────────────

/**
 * sendEmail — sends a transactional email via Resend.
 *
 * Falls back to console.log if RESEND_API_KEY is not configured (dev mode).
 */
export async function sendEmail(
    user: EmailUser,
    template: EmailTemplate,
    payload: EmailPayload
): Promise<{ success: boolean; error?: string }> {
    const firstName = user.full_name?.split(' ')[0] || 'Investor';
    const content = getTemplateContent(template, payload);
    const subject = payload.subject || content.subject;
    const html = buildHtml({ ...content, subject, firstName });

    if (!resend) {
        // Dev fallback — Resend not configured
        console.log('[EMAIL_SENT]', { to: user.email, template, subject, payload });
        return { success: true };
    }

    try {
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: user.email,
            subject,
            html,
        });

        if (error) {
            console.error('[email] Resend error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        console.error('[email] sendEmail threw:', err);
        return { success: false, error: err.message };
    }
}

// ─── Subject builder (used by cron) ──────────────────────────────────────────

export function getInactivitySubject(
    template: EmailTemplate,
    driftPercent?: number
): string {
    const drift = driftPercent !== undefined
        ? `${driftPercent >= 0 ? '+' : ''}${driftPercent.toFixed(1)}%`
        : null;

    switch (template) {
        case 'inactivity_3d':
            return drift ? `Your portfolio would have moved ${drift} since your last visit` : `Your investor journey is waiting`;
        case 'inactivity_7d':
            return drift ? `Markets moved ${drift} while you were away` : `The Ghana Stock Exchange has been active. See what you missed.`;
        case 'inactivity_14d':
            return `Can you catch up on the leaderboard? Here's where you stand.`;
        case 'inactivity_30d':
            return `It's time to reactivate your inv.labs portfolio.`;
        default:
            return `An update from inv.labs`;
    }
}
