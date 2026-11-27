import { createHmac, timingSafeEqual } from 'crypto';
import { db } from '../db/database.js';

/**
 * Dodo Payments subscriptions in GBP (merchant of record: handles UK VAT, pays out to you).
 * Six subscription products in the Dodo dashboard; IDs in env vars:
 *   DODO_PRODUCT_STARTER_MONTHLY / _ANNUAL      £7 / £70
 *   DODO_PRODUCT_PORTFOLIO_MONTHLY / _ANNUAL    £19 / £190
 *   DODO_PRODUCT_PRO_MONTHLY / _ANNUAL          £39 / £390
 * The 14-day trial is given in the app from signup, so set no trial on the Dodo products.
 */

export const PLANS = ['starter', 'portfolio', 'pro'];
export const CYCLES = ['monthly', 'annual'];

const apiBase = () =>
  process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';

export const billingEnabled = () => Boolean(process.env.DODO_PAYMENTS_API_KEY);
export const productId = (plan, cycle) => process.env[`DODO_PRODUCT_${plan.toUpperCase()}_${cycle.toUpperCase()}`];

export function planForProduct(id) {
  for (const plan of PLANS) for (const cycle of CYCLES) if (id && productId(plan, cycle) === id) return { plan, cycle };
  return null;
}

async function dodo(path, init = {}) {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`, ...(init.headers || {}) },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Dodo ${init.method || 'GET'} ${path} failed: ${res.status} ${(await res.text().catch(() => '')).slice(0, 300)}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function createCheckout({ productId: pid, user, returnUrl }) {
  const res = await dodo('/checkouts', {
    method: 'POST',
    body: JSON.stringify({
      product_cart: [{ product_id: pid, quantity: 1 }],
      customer: { email: user.email, ...(user.name ? { name: user.name } : {}) },
      metadata: { user_id: user.id },
      return_url: returnUrl,
    }),
  });
  return res.checkout_url;
}

export const getSubscription = (id) => dodo(`/subscriptions/${encodeURIComponent(id)}`);
export const tagSubscription = (id, metadata) => dodo(`/subscriptions/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ metadata }) });
export const changePlan = (id, pid) =>
  dodo(`/subscriptions/${encodeURIComponent(id)}/change-plan`, {
    method: 'POST',
    body: JSON.stringify({ product_id: pid, quantity: 1, proration_billing_mode: 'prorated_immediately', on_payment_failure: 'prevent_change' }),
  });
export async function portalUrl(customerId, returnUrl) {
  const res = await dodo(`/customers/${encodeURIComponent(customerId)}/customer-portal/session?return_url=${encodeURIComponent(returnUrl)}`, { method: 'POST' });
  return res.link;
}

const keepsAccess = (status) => status === 'active' || status === 'past_due';

/** Writes the subscription's current state onto the user. Safe to call repeatedly. */
export function applySubscription(userId, sub) {
  const user = db.prepare('SELECT * FROM profiles WHERE id = ?').get(userId);
  if (!user) return 'ignored';
  // A late event about an old subscription must not downgrade a newer one.
  if (user.billing_subscription_id && user.billing_subscription_id !== sub.subscription_id && !keepsAccess(sub.status)) return 'ignored';
  const mapped = planForProduct(sub.product_id);
  const terminal = ['expired', 'failed', 'cancelled'].includes(sub.status);
  db.prepare(`UPDATE profiles SET subscription_tier = ?, billing_cycle = ?, subscription_status = ?, billing_subscription_id = ?, billing_customer_id = ? WHERE id = ?`).run(
    mapped && keepsAccess(sub.status) ? mapped.plan : 'free',
    mapped ? mapped.cycle : user.billing_cycle,
    sub.status,
    terminal ? null : sub.subscription_id,
    sub.customer?.customer_id || user.billing_customer_id,
    userId,
  );
  return 'updated';
}

/** Standard Webhooks signature check (what Dodo uses). */
export function verifyWebhook(rawBody, headers, secret, toleranceSec = 300) {
  const id = headers['webhook-id'];
  const ts = headers['webhook-timestamp'];
  const sigHeader = headers['webhook-signature'];
  if (!id || !ts || !sigHeader) return false;
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > toleranceSec) return false;
  const key = Buffer.from(secret.startsWith('whsec_') ? secret.slice(6) : secret, 'base64');
  const expected = Buffer.from(createHmac('sha256', key).update(`${id}.${ts}.${rawBody}`).digest('base64'));
  return String(sigHeader).split(' ').some((part) => {
    const [version, sig] = part.split(',', 2);
    if (version !== 'v1' || !sig) return false;
    const given = Buffer.from(sig);
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}
