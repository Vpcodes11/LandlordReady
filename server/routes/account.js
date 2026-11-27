import express from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { createSessionCookie, clearSessionCookie, requireAuth, rateLimit, sha256, randomToken } from '../lib/auth.js';
import { sendEmail, esc } from '../lib/email.js';
import { billingEnabled, productId, createCheckout, changePlan, getSubscription, tagSubscription, portalUrl, applySubscription, verifyWebhook, PLANS, CYCLES } from '../lib/billing.js';

const appUrl = () => (process.env.APP_URL || 'http://localhost:5000').replace(/\/$/, '');
const TRIAL_DAYS = 14;

/** Mounted at /api/auth and /api/billing (JSON) */
export const accountRouter = express.Router();

// ---- Sign in with an emailed link (no passwords) ----
accountRouter.post('/auth/request', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();
  if (!rateLimit(`login:${sha256(email)}`, 5, 3600) || !rateLimit(`login-ip:${ip}`, 20, 3600)) {
    return res.status(429).json({ success: false, error: 'Too many sign-in emails. Please wait a bit and try again.' });
  }
  const token = randomToken();
  db.prepare('INSERT INTO login_tokens (token_hash, email, expires_at) VALUES (?, ?, ?)').run(sha256(token), email, Date.now() + 20 * 60000);
  const link = `${appUrl()}/auth/verify?token=${encodeURIComponent(token)}`;
  try {
    await sendEmail({
      to: email,
      subject: 'Your LandlordReady sign-in link',
      text: `Sign in to LandlordReady: ${link}\n\nThe link works once and expires in 20 minutes. If you didn't ask for it, ignore this email.`,
      html: `<p>Click to sign in to LandlordReady. The link works once and expires in 20 minutes.</p><p><a href="${esc(link)}">Sign in</a></p><p style="color:#64748b;font-size:12px">If you didn't ask for this, ignore this email.</p>`,
    });
  } catch (e) {
    console.error('login email failed', e.message);
    return res.status(502).json({ success: false, error: 'We could not send the email. Please try again.' });
  }
  res.json({ success: true });
});

/** The emailed link opens a page with a button; the POST uses the token (link scanners can't). */
export function verifyPage(req, res) {
  const token = esc(String(req.query.token || ''));
  res.type('html').send(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in · LandlordReady</title></head>
<body style="font-family:system-ui,sans-serif;background:#FAF9F5;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
<form method="post" action="/api/auth/verify" style="text-align:center"><h1 style="font-size:22px">Sign in to LandlordReady</h1>
<input type="hidden" name="token" value="${token}"><button style="background:#0284c7;color:#fff;border:0;border-radius:10px;padding:12px 24px;font-size:15px;cursor:pointer">Continue</button></form></body></html>`);
}

accountRouter.post('/auth/verify', express.urlencoded({ extended: false }), (req, res) => {
  const token = String(req.body?.token || '');
  const row = token ? db.prepare('SELECT * FROM login_tokens WHERE token_hash = ?').get(sha256(token)) : null;
  if (!row || row.used_at || row.expires_at < Date.now()) return res.redirect(303, '/?signin=expired');
  const claimed = db.prepare('UPDATE login_tokens SET used_at = ? WHERE token_hash = ? AND used_at IS NULL').run(Date.now(), row.token_hash);
  if (claimed.changes !== 1) return res.redirect(303, '/?signin=expired');

  let user = db.prepare('SELECT * FROM profiles WHERE email = ?').get(row.email);
  if (!user) {
    const id = 'usr-' + crypto.randomUUID();
    const trialEnds = new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString();
    db.prepare("INSERT INTO profiles (id, email, subscription_tier, billing_cycle, subscription_status, trial_ends_at) VALUES (?, ?, 'free', 'monthly', 'none', ?)").run(id, row.email, trialEnds);
    user = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
  }
  res.setHeader('Set-Cookie', createSessionCookie(user.id, user.session_version || 0));
  res.redirect(303, '/?signedin=1');
});

accountRouter.post('/auth/logout', (_req, res) => {
  res.setHeader('Set-Cookie', clearSessionCookie());
  res.json({ success: true });
});

// ---- Billing (Dodo Payments subscriptions) ----
accountRouter.post('/billing/checkout', requireAuth, async (req, res) => {
  const { plan_id, billing_cycle } = req.body || {};
  if (!PLANS.includes(plan_id) || !CYCLES.includes(billing_cycle)) return res.status(400).json({ success: false, error: 'Choose a plan.' });
  const pid = productId(plan_id, billing_cycle);
  if (!billingEnabled() || !pid) return res.status(503).json({ success: false, error: 'Payments are not switched on yet.' });
  try {
    const u = req.user;
    if (u.billing_subscription_id && ['active', 'past_due'].includes(u.subscription_status)) {
      await changePlan(u.billing_subscription_id, pid);
      return res.json({ success: true, changed: true, message: 'Plan change requested. It applies once the payment for the difference is confirmed.' });
    }
    const url = await createCheckout({ productId: pid, user: u, returnUrl: `${appUrl()}/api/billing/return` });
    res.json({ success: true, checkout_url: url });
  } catch (e) {
    console.error('checkout failed', e.message);
    res.status(502).json({ success: false, error: 'We could not open the checkout. Please try again.' });
  }
});

accountRouter.get('/billing/return', requireAuth, async (req, res) => {
  const id = String(req.query.subscription_id || '');
  if (!id || !billingEnabled()) return res.redirect(303, '/?billing=pending');
  try {
    const sub = await getSubscription(id);
    const tagged = sub.metadata?.user_id ? String(sub.metadata.user_id) : null;
    const owns = tagged ? tagged === req.user.id : String(sub.customer?.email || '').toLowerCase() === req.user.email;
    if (!owns) return res.redirect(303, '/?billing=error');
    applySubscription(req.user.id, sub);
    if (!tagged) await tagSubscription(sub.subscription_id, { user_id: req.user.id }).catch(() => {});
    res.redirect(303, '/?billing=success');
  } catch (e) {
    console.error('billing return failed', e.message);
    res.redirect(303, '/?billing=pending');
  }
});

accountRouter.post('/billing/portal', requireAuth, async (req, res) => {
  if (!billingEnabled() || !req.user.billing_customer_id) return res.status(400).json({ success: false, error: 'No billing account yet.' });
  try {
    res.json({ success: true, url: await portalUrl(req.user.billing_customer_id, `${appUrl()}/`) });
  } catch (e) {
    console.error('portal failed', e.message);
    res.status(502).json({ success: false, error: 'Could not open billing. Please try again.' });
  }
});

/** Dodo webhook. Mounted with express.raw() before the JSON parser (the signature covers the raw body). */
export function billingWebhook(req, res) {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!secret) return res.status(500).json({ error: 'not configured' });
  const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
  if (!verifyWebhook(raw, req.headers, secret)) return res.status(401).json({ error: 'bad signature' });
  const webhookId = String(req.headers['webhook-id'] || '');
  if (webhookId && db.prepare('SELECT 1 FROM webhook_events WHERE id = ?').get(webhookId)) return res.json({ received: true, duplicate: true });
  let outcome = 'ignored';
  try {
    const event = JSON.parse(raw);
    if (event.type?.startsWith('subscription.') && event.data?.subscription_id) {
      const sub = event.data;
      const userId = sub.metadata?.user_id ? String(sub.metadata.user_id) : db.prepare('SELECT id FROM profiles WHERE billing_subscription_id = ?').get(sub.subscription_id)?.id;
      if (userId) outcome = applySubscription(userId, sub);
    }
    if (webhookId) db.prepare('INSERT OR IGNORE INTO webhook_events (id, type) VALUES (?, ?)').run(webhookId, event.type || 'unknown');
  } catch (e) {
    console.error('webhook failed', e.message);
    return res.status(500).json({ error: 'processing failed' });
  }
  res.json({ received: true, outcome });
}
