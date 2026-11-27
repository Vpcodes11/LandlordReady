import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase, db } from './db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database first: the routers below prepare statements against it.
initDatabase();

const { default: apiRouter } = await import('./routes/api.js');
const { accountRouter, billingWebhook, verifyPage } = await import('./routes/account.js');
const { sendDueReminders } = await import('./lib/reminders.js');

const app = express();
const PORT = process.env.PORT || 5000;
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Webhook needs the raw body for its signature, so it is registered before the JSON parser.
app.post('/api/billing/webhook', express.raw({ type: '*/*', limit: '1mb' }), billingWebhook);
app.use(express.json({ limit: '1mb' }));

// Health: public status; with ?key=HEALTH_KEY it lists missing settings (never values).
app.get('/api/health', (req, res) => {
  let database = false;
  try {
    db.prepare('SELECT 1').get();
    database = true;
  } catch {}
  const secret = process.env.HEALTH_KEY;
  if (!secret || req.query.key !== secret) return res.status(database ? 200 : 503).json({ ok: database });
  const has = (n) => Boolean(process.env[n]);
  const checks = {
    database: database,
    DATA_DIR_persistent: has('DATA_DIR'),
    APP_URL: (process.env.APP_URL || '').startsWith('https://'),
    SESSION_SECRET: (process.env.SESSION_SECRET || '').length >= 32,
    RESEND_API_KEY: has('RESEND_API_KEY'),
    EMAIL_FROM: has('EMAIL_FROM'),
    DODO_PAYMENTS_API_KEY: has('DODO_PAYMENTS_API_KEY'),
    DODO_PAYMENTS_WEBHOOK_KEY: has('DODO_PAYMENTS_WEBHOOK_KEY'),
    products: ['STARTER', 'PORTFOLIO', 'PRO'].every((p) => has(`DODO_PRODUCT_${p}_MONTHLY`) && has(`DODO_PRODUCT_${p}_ANNUAL`)),
    ADMIN_EMAILS: has('ADMIN_EMAILS'),
  };
  res.json({ ready: Object.values(checks).every(Boolean), checks, dodo_mode: process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'live' : 'test' });
});

app.get('/auth/verify', verifyPage);
app.use('/api', accountRouter);
app.use('/api', apiRouter);

// Frontend (built React app)
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Reminder emails: hourly check (each stage is sent once per task).
const runReminders = () => sendDueReminders().then((n) => n && console.log(`[reminders] sent ${n}`)).catch((e) => console.error('[reminders]', e.message));
if (process.env.NODE_ENV === 'production' || process.env.SEND_REMINDERS === 'true') {
  setTimeout(runReminders, 60_000);
  setInterval(runReminders, 60 * 60_000);
}
// Expired sign-in tokens and rate-limit rows.
setInterval(() => {
  db.prepare('DELETE FROM login_tokens WHERE expires_at < ?').run(Date.now() - 86400000);
  db.prepare('DELETE FROM rate_limits WHERE expires_at < ?').run(Date.now());
}, 6 * 60 * 60_000);

const server = app.listen(PORT, () => console.log(`LandlordReady listening on http://localhost:${PORT}`));
export { app, server };
