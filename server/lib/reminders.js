import { db } from '../db/database.js';
import { sendEmail, esc } from './email.js';

const DAY = 86400000;
export const today = () => new Date(new Date().toISOString().slice(0, 10));
export const daysUntil = (date) => Math.ceil((new Date(date) - today()) / DAY);

/** Status from the real date (it used to be computed against a fixed "today"). */
export function taskStatus(task) {
  if (task.status === 'completed') return 'completed';
  const d = daysUntil(task.due_date);
  if (d < 0) return 'overdue';
  if (d <= 30) return 'due_soon';
  return 'pending';
}

export function certificateStatus(expiry) {
  const d = daysUntil(expiry);
  if (d < 0) return 'expired';
  if (d <= 30) return 'expiring_soon';
  return 'valid';
}

/** Keeps stored statuses in line with today's date (cheap; runs before reads and hourly). */
export function refreshStatuses() {
  const tasks = db.prepare("SELECT id, status, due_date FROM tasks WHERE status != 'completed'").all();
  const upd = db.prepare('UPDATE tasks SET status = ? WHERE id = ?');
  for (const t of tasks) {
    const s = taskStatus(t);
    if (s !== t.status) upd.run(s, t.id);
  }
  const certs = db.prepare('SELECT id, status, expiry_date FROM certificates').all();
  const updC = db.prepare('UPDATE certificates SET status = ? WHERE id = ?');
  for (const c of certs) {
    const s = certificateStatus(c.expiry_date);
    if (s !== c.status) updC.run(s, c.id);
  }
}

/**
 * Emails 60 / 30 / 7-day (and overdue) reminders for open tasks. Each stage is sent once per task.
 * Only landlords with a paid plan or an active trial get reminders.
 */
export async function sendDueReminders() {
  refreshStatuses();
  const rows = db.prepare(`
    SELECT t.*, p.address_line1, p.postcode, u.email, u.name, u.subscription_tier, u.subscription_status, u.trial_ends_at
    FROM tasks t JOIN properties p ON t.property_id = p.id JOIN profiles u ON p.user_id = u.id
    WHERE t.status != 'completed'
  `).all();
  let sent = 0;
  for (const t of rows) {
    const entitled =
      (['starter', 'portfolio', 'pro'].includes(t.subscription_tier) && ['active', 'past_due'].includes(t.subscription_status)) ||
      (t.trial_ends_at && new Date(t.trial_ends_at) > new Date());
    if (!entitled) continue;
    const d = daysUntil(t.due_date);
    let stage = null;
    if (d <= 7 && !t.reminder_7d_sent) stage = '7';
    else if (d <= 30 && d > 7 && !t.reminder_30d_sent) stage = '30';
    else if (d <= 60 && d > 30 && !t.reminder_60d_sent) stage = '60';
    if (!stage) continue;

    const when = d < 0 ? `was due on ${t.due_date} (${-d} days ago)` : `is due on ${t.due_date} (in ${d} days)`;
    const subject = d < 0 ? `Overdue: ${t.title} – ${t.address_line1}` : `${stage === '7' ? 'Due this week' : `Due in ${d} days`}: ${t.title} – ${t.address_line1}`;
    const text = `Hi ${t.name || 'there'},\n\n${t.title} for ${t.address_line1}, ${t.postcode} ${when}.\n\n${t.description || ''}\n\nOpen LandlordReady to mark it done or update the date: ${process.env.APP_URL || ''}\n\nLandlordReady tracks deadlines; it is not legal advice.`;
    try {
      await sendEmail({ to: t.email, subject, text, html: `<p>Hi ${esc(t.name || 'there')},</p><p><b>${esc(t.title)}</b> for ${esc(t.address_line1)}, ${esc(t.postcode)} ${esc(when)}.</p><p>${esc(t.description || '')}</p><p><a href="${esc(process.env.APP_URL || '')}">Open LandlordReady</a></p><p style="color:#64748b;font-size:12px">LandlordReady tracks deadlines; it is not legal advice.</p>` });
      // Mark this and any earlier stages as sent, so a late task doesn't get three emails at once.
      const cols = stage === '7' ? 'reminder_60d_sent = 1, reminder_30d_sent = 1, reminder_7d_sent = 1' : stage === '30' ? 'reminder_60d_sent = 1, reminder_30d_sent = 1' : 'reminder_60d_sent = 1';
      db.prepare(`UPDATE tasks SET ${cols} WHERE id = ?`).run(t.id);
      sent++;
    } catch (e) {
      console.error('reminder email failed', t.id, e.message);
    }
  }
  return sent;
}
