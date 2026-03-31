// ============================================
// Email Notification System
// Uses Resend API (https://resend.com)
// Add RESEND_API_KEY to .env to enable emails
// ============================================

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'GolfGive <noreply@golfgive.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!RESEND_API_KEY) {
    // Email not configured — log to console in dev
    console.log(`[EMAIL - Not configured] To: ${to} | Subject: ${subject}`);
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
    return res.ok;
  } catch (err) {
    console.error('[EMAIL ERROR]', err);
    return false;
  }
}

// ── Welcome Email ──────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: 'Welcome to GolfGive 🏌️',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;">
        <h1 style="color:#1a2e1a;font-size:28px;margin-bottom:8px;">Welcome, ${name}! 👋</h1>
        <p style="color:#555;font-size:16px;line-height:1.6;">
          You're officially part of the GolfGive community — where your golf scores raise money for charity and win you prizes.
        </p>
        <div style="background:#f4f8f0;border-radius:12px;padding:20px;margin:24px 0;">
          <p style="margin:0;font-weight:bold;color:#2d5a2d;">Here's what to do next:</p>
          <ul style="color:#555;padding-left:20px;margin-top:12px;">
            <li>Log your last 5 Stableford scores</li>
            <li>Choose a charity to support</li>
            <li>Enter the next monthly draw</li>
          </ul>
        </div>
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#f59e0b;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px;">
          Go to your Dashboard →
        </a>
        <p style="color:#aaa;font-size:13px;margin-top:32px;">GolfGive — Golf that gives back.</p>
      </div>
    `,
  });
}

// ── Draw Result Email ──────────────────────────────────
export async function sendDrawResultEmail(
  to: string,
  name: string,
  month: string,
  year: number,
  winningNumbers: number[],
  userScores: number[]
) {
  const matchedNumbers = userScores.filter((s) => winningNumbers.includes(s));
  const didWin = matchedNumbers.length >= 3;

  return sendEmail({
    to,
    subject: didWin
      ? `🎉 You WON in the ${month} ${year} draw!`
      : `${month} ${year} Draw Results — GolfGive`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;">
        <h1 style="color:#1a2e1a;font-size:24px;">${didWin ? '🎉 Congratulations, you won!' : `${month} ${year} Draw Results`}</h1>
        <p style="color:#555;">Hi ${name},</p>
        <p style="color:#555;line-height:1.6;">
          ${didWin
            ? `Amazing news! You matched <strong>${matchedNumbers.length} numbers</strong> in the ${month} ${year} draw.`
            : `The ${month} ${year} draw has been completed. Here are the winning numbers:`
          }
        </p>
        <div style="background:#1a2e1a;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
          <p style="color:#aaa;font-size:12px;margin:0 0 12px;">Winning Numbers</p>
          <div style="display:flex;justify-content:center;gap:12px;">
            ${winningNumbers.map(n => `<span style="background:#f59e0b;color:#fff;width:40px;height:40px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;">${n}</span>`).join('')}
          </div>
        </div>
        ${didWin ? `
          <div style="background:#fef3c7;border-radius:12px;padding:16px;margin:16px 0;">
            <p style="margin:0;font-weight:bold;color:#92400e;">Your matched numbers: ${matchedNumbers.join(', ')}</p>
            <p style="margin:8px 0 0;color:#92400e;font-size:14px;">Head to your dashboard to submit your proof and claim your prize.</p>
          </div>
          <a href="${APP_URL}/dashboard" style="display:inline-block;background:#f59e0b;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
            Claim your prize →
          </a>
        ` : `
          <p style="color:#555;">Better luck next month! Keep logging your scores to stay in the draw.</p>
          <a href="${APP_URL}/draws" style="display:inline-block;background:#1a2e1a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
            View draw results →
          </a>
        `}
        <p style="color:#aaa;font-size:13px;margin-top:32px;">GolfGive — Golf that gives back.</p>
      </div>
    `,
  });
}

// ── Winner Alert Email ────────────────────────────────
export async function sendWinnerVerificationEmail(
  to: string,
  name: string,
  matchType: string,
  prizeAmount: number
) {
  return sendEmail({
    to,
    subject: `⏳ Prize verification required — GolfGive`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;">
        <h1 style="color:#1a2e1a;font-size:24px;">Prize Verification Required</h1>
        <p style="color:#555;">Hi ${name},</p>
        <p style="color:#555;line-height:1.6;">
          Congratulations on your <strong>${matchType}</strong> win worth <strong>£${prizeAmount.toFixed(2)}</strong>!
          To release your prize, please submit a screenshot of your scores from the golf platform as proof of your game data.
        </p>
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#f59e0b;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px;">
          Submit proof →
        </a>
        <p style="color:#aaa;font-size:13px;margin-top:32px;">GolfGive — Golf that gives back.</p>
      </div>
    `,
  });
}

// ── Payout Approved Email ─────────────────────────────
export async function sendPayoutApprovedEmail(
  to: string,
  name: string,
  prizeAmount: number
) {
  return sendEmail({
    to,
    subject: `✅ Your prize has been approved — GolfGive`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;">
        <h1 style="color:#1a2e1a;font-size:24px;">Prize Approved! 🎉</h1>
        <p style="color:#555;">Hi ${name}, your prize of <strong>£${prizeAmount.toFixed(2)}</strong> has been approved and will be paid shortly.</p>
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#f59e0b;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px;">
          View your winnings →
        </a>
        <p style="color:#aaa;font-size:13px;margin-top:32px;">GolfGive — Golf that gives back.</p>
      </div>
    `,
  });
}

// ── Subscription Confirmation Email ──────────────────
export async function sendSubscriptionConfirmationEmail(
  to: string,
  name: string,
  plan: string,
  renewalDate: string
) {
  return sendEmail({
    to,
    subject: `✅ Subscription confirmed — GolfGive`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;">
        <h1 style="color:#1a2e1a;font-size:24px;">You're subscribed!</h1>
        <p style="color:#555;">Hi ${name}, your <strong>${plan}</strong> subscription is now active.</p>
        <div style="background:#f4f8f0;border-radius:12px;padding:20px;margin:24px 0;">
          <p style="margin:0;color:#555;"><strong>Renewal date:</strong> ${renewalDate}</p>
        </div>
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#f59e0b;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Start logging scores →
        </a>
        <p style="color:#aaa;font-size:13px;margin-top:32px;">GolfGive — Golf that gives back.</p>
      </div>
    `,
  });
}
