import crypto from 'crypto';
import { db } from '../db/database.js';

const COOKIE = 'lr_session';
const MAX_AGE_S = 60 * 60 * 24 * 30;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET is not set');
  return s || 'dev-session-secret';
}

const b64 = (buf) => Buffer.from(buf).toString('base64url');
const sign = (payload) => b64(crypto.createHmac('sha256', secret()).update(payload).digest());

/** Signed cookie value: base64url(json).signature */
export function createSessionCookie(userId, sessionVersion = 0) {
  const payload = b64(JSON.stringify({ uid: userId, sv: sessionVersion, exp: Math.floor(Date.now() / 1000) + MAX_AGE_S }));
  const value = `${payload}.${sign(payload)}`;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_S}${secure}`;
}

export const clearSessionCookie = () => `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function currentUser(req) {
  const raw = readCookie(req, COOKIE);
  if (!raw || !raw.includes('.')) return null;
  const [payload, sig] = raw.split('.');
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!data.uid || data.exp < Date.now() / 1000) return null;
    const user = db.prepare('SELECT * FROM profiles WHERE id = ?').get(data.uid);
    if (!user || (user.session_version || 0) !== (data.sv || 0)) return null;
    return user;
  } catch {
    return null;
  }
}

/** Express middleware: 401 unless signed in. Sets req.user. */
export function requireAuth(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ success: false, error: 'Please sign in.', auth_required: true });
  req.user = user;
  next();
}

export const PLAN_LIMITS = { free: 0, trial: 5, starter: 1, portfolio: 5, pro: 15 };

/** The plan the user is entitled to right now: paid plan, the 14-day trial, or free (check only). */
export function effectivePlan(user) {
  const paid = ['starter', 'portfolio', 'pro'].includes(user.subscription_tier) && ['active', 'past_due'].includes(user.subscription_status);
  if (paid) return user.subscription_tier;
  if (user.trial_ends_at && new Date(user.trial_ends_at) > new Date()) return 'trial';
  return 'free';
}

/** Middleware for features that need a paid plan or the trial. */
export function requirePlan(req, res, next) {
  if (effectivePlan(req.user) === 'free') {
    return res.status(402).json({ success: false, plan_required: true, error: 'Your free trial has ended. Choose a plan to keep using the compliance tools.' });
  }
  next();
}

export const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
export const randomToken = () => crypto.randomBytes(32).toString('base64url');

/** Small fixed-window counter in SQLite. True when allowed. */
export function rateLimit(key, limit, windowSec) {
  const now = Date.now();
  const row = db.prepare('SELECT count, expires_at FROM rate_limits WHERE key = ?').get(key);
  if (!row || row.expires_at < now) {
    db.prepare('INSERT OR REPLACE INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?)').run(key, now + windowSec * 1000);
    return true;
  }
  if (row.count >= limit) return false;
  db.prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?').run(key);
  return true;
}
