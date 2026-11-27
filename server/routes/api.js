import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { evaluateCompliance } from '../utils/complianceEngine.js';
import { answerLandlordQuestion } from '../utils/canIDoThisAssistant.js';
import { requireAuth, requirePlan, effectivePlan, PLAN_LIMITS, currentUser, rateLimit } from '../lib/auth.js';
import { certificateStatus, taskStatus, daysUntil, refreshStatuses, today } from '../lib/reminders.js';

const router = express.Router();

// ----------------------------------------------------
// Private file storage (certificates). Never served statically: see GET /files/:name.
// ----------------------------------------------------
const dataDir = process.env.DATA_DIR || path.join(path.dirname(new URL(import.meta.url).pathname), '../../data');
export const uploadsDir = path.join(dataDir, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const ALLOWED = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.heic', '.webp']);
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    // The owner's id is part of the name, so ownership can be checked on download.
    filename: (req, file, cb) => cb(null, `${req.user.id}__${crypto.randomBytes(12).toString('hex')}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, ALLOWED.has(path.extname(file.originalname).toLowerCase())),
});

const isoDay = (d) => d.toISOString().slice(0, 10);
const addDays = (n) => isoDay(new Date(today().getTime() + n * 86400000));
const ownProperty = (userId, propertyId) => (propertyId ? db.prepare('SELECT * FROM properties WHERE id = ? AND user_id = ?').get(propertyId, userId) : null);
const fail = (res, err) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
};

// ----------------------------------------------------
// 1. PUBLIC: rules, free check, templates, regulation feed, session
// ----------------------------------------------------
router.get('/rules', (_req, res) => {
  try {
    res.json({ success: true, rules: db.prepare('SELECT * FROM rules ORDER BY effective_date ASC').all() });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/me', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.json({ success: true, user: null });
  const plan = effectivePlan(user);
  res.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name },
    plan,
    properties_limit: PLAN_LIMITS[plan],
    trial_ends_at: user.trial_ends_at,
  });
});

router.post('/check', (req, res) => {
  try {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();
    if (!rateLimit(`check:${ip}`, 30, 3600)) return res.status(429).json({ success: false, error: 'Too many checks. Please try again later.' });
    const answers = req.body || {};
    const rules = db.prepare('SELECT * FROM rules').all();
    const evaluation = evaluateCompliance(answers, rules);
    const checkId = 'chk-' + uuidv4();
    db.prepare(`
      INSERT INTO checks (id, email, postcode, property_type, tenancy_start_date, answers, score, red_count, amber_count, green_count, results)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(checkId, answers.email || null, answers.postcode || null, answers.property_type || 'Unknown', answers.tenancy_start_date || null,
      JSON.stringify(answers), evaluation.score || 0, evaluation.red_count || 0, evaluation.amber_count || 0, evaluation.green_count || 0, JSON.stringify(evaluation));
    res.json({ success: true, check_id: checkId, evaluation });
  } catch (err) {
    fail(res, err);
  }
});

router.post('/check/email', (req, res) => {
  try {
    const { check_id, email } = req.body || {};
    if (!check_id || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    db.prepare('UPDATE checks SET email = ? WHERE id = ?').run(String(email).trim().slice(0, 254), check_id);
    res.json({ success: true, message: 'Saved. You can download your full report now.' });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/check/:id', (req, res) => {
  try {
    const check = db.prepare('SELECT * FROM checks WHERE id = ?').get(req.params.id);
    if (!check) return res.status(404).json({ success: false, error: 'Check result not found.' });
    res.json({ success: true, check: { ...check, answers: JSON.parse(check.answers), results: JSON.parse(check.results) } });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/templates', (_req, res) => {
  try {
    res.json({ success: true, templates: db.prepare('SELECT * FROM templates ORDER BY name ASC').all() });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/regulation-updates', (_req, res) => {
  try {
    const updates = db.prepare('SELECT * FROM regulation_updates ORDER BY effective_date DESC').all();
    res.json({ success: true, updates: updates.map((u) => ({ ...u, actions_required: u.actions_required ? JSON.parse(u.actions_required) : [] })) });
  } catch (err) {
    fail(res, err);
  }
});

// ----------------------------------------------------
// Everything below needs a signed-in landlord and only touches their own data.
// ----------------------------------------------------
router.use(requireAuth);
router.use((_req, _res, next) => {
  refreshStatuses();
  next();
});

// 2. PROFILE ------------------------------------------------
router.get('/profile', (req, res) => {
  const u = req.user;
  const plan = effectivePlan(u);
  res.json({
    success: true,
    profile: { id: u.id, email: u.email, name: u.name, phone: u.phone, company_name: u.company_name, trial_ends_at: u.trial_ends_at },
    subscription: {
      plan_id: plan === 'trial' ? 'trial' : plan,
      status: u.subscription_status,
      billing_cycle: u.billing_cycle,
      properties_limit: PLAN_LIMITS[plan],
      has_billing: Boolean(u.billing_customer_id),
    },
  });
});

router.put('/profile', (req, res) => {
  try {
    const { name, phone, company_name } = req.body || {};
    db.prepare('UPDATE profiles SET name = ?, phone = ?, company_name = ? WHERE id = ?').run(name || null, phone || null, company_name || null, req.user.id);
    res.json({ success: true, profile: db.prepare('SELECT id, email, name, phone, company_name FROM profiles WHERE id = ?').get(req.user.id) });
  } catch (err) {
    fail(res, err);
  }
});

// Invoices live in the Dodo customer portal ("Manage billing").
router.get('/orders', (_req, res) => res.json({ success: true, orders: [] }));

// 3. PROPERTIES ---------------------------------------------
function scoreProperty(p, certificates) {
  let score = 100;
  const latest = (type) => certificates.filter((c) => c.type === type).sort((a, b) => (a.expiry_date < b.expiry_date ? 1 : -1))[0];
  const gas = latest('gas_safety');
  const eicr = latest('eicr');
  const epc = latest('epc');
  if (!gas || gas.status === 'expired') score -= 25;
  else if (gas.status === 'expiring_soon') score -= 5;
  if (!eicr || eicr.status === 'expired') score -= 20;
  if (!epc || epc.status === 'expired' || ['F', 'G'].includes((epc.rating || '').toUpperCase())) score -= 25;
  if (p.hmo && p.licensing_status !== 'compliant') score -= 20;
  return Math.max(0, Math.min(100, score));
}

function enrichProperty(p) {
  const tenancies = db.prepare('SELECT * FROM tenancies WHERE property_id = ?').all(p.id).map((t) => ({ ...t, tenants: JSON.parse(t.tenants), deposit: JSON.parse(t.deposit) }));
  const certificates = db.prepare('SELECT * FROM certificates WHERE property_id = ?').all(p.id);
  const tasks = db.prepare('SELECT * FROM tasks WHERE property_id = ?').all(p.id);
  const score = scoreProperty(p, certificates);
  if (score !== p.compliance_score) db.prepare('UPDATE properties SET compliance_score = ? WHERE id = ?').run(score, p.id);
  return {
    ...p,
    compliance_score: score,
    tenancies,
    certificates,
    tasks_count: tasks.length,
    overdue_tasks_count: tasks.filter((t) => t.status === 'overdue').length,
    due_soon_tasks_count: tasks.filter((t) => t.status === 'due_soon').length,
  };
}

router.get('/properties', (req, res) => {
  try {
    const properties = db.prepare('SELECT * FROM properties WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json({ success: true, properties: properties.map(enrichProperty) });
  } catch (err) {
    fail(res, err);
  }
});

const insertTask = () =>
  db.prepare(`INSERT INTO tasks (id, property_id, tenancy_id, type, title, description, due_date, status, priority, source_rule_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
function addTask({ property_id, tenancy_id = null, type, title, description, due_date, priority, rule = null }) {
  insertTask().run('tsk-' + uuidv4(), property_id, tenancy_id, type, title, description, due_date, taskStatus({ due_date }), priority, rule);
}

router.post('/properties', requirePlan, (req, res) => {
  try {
    const b = req.body || {};
    if (!b.address_line1 || !b.city || !b.postcode) return res.status(400).json({ success: false, error: 'Address line 1, city, and postcode are required.' });

    const limit = PLAN_LIMITS[effectivePlan(req.user)];
    const count = db.prepare('SELECT COUNT(*) as count FROM properties WHERE user_id = ?').get(req.user.id).count;
    if (count >= limit) {
      return res.status(403).json({ success: false, limit_reached: true, error: `Your plan covers ${limit} propert${limit === 1 ? 'y' : 'ies'}. Upgrade to add more.` });
    }

    const propId = 'prop-' + uuidv4();
    db.prepare(`
      INSERT INTO properties (id, user_id, address_line1, address_line2, city, postcode, local_authority, property_type, bedrooms, hmo, hmo_licence_number, licensing_type, licensing_status, compliance_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(propId, req.user.id, b.address_line1, b.address_line2 || null, b.city, String(b.postcode).toUpperCase(), b.local_authority || null,
      b.property_type || null, parseInt(b.bedrooms) || null, b.hmo ? 1 : 0, b.hmo_licence_number || null, b.licensing_type || 'none', b.licensing_status || 'not_required');

    // Starter tasks: record the certificates the law requires. Real renewal dates are set when a certificate is added.
    addTask({ property_id: propId, type: 'certificate_upload', title: 'Add your current Gas Safety Certificate (CP12)', description: 'Needed every 12 months where there is a gas appliance. Add it so we can track the renewal date.', due_date: addDays(14), priority: 'high', rule: 'rule-gas-safety' });
    addTask({ property_id: propId, type: 'certificate_upload', title: 'Add your current Electrical (EICR) report', description: 'Needed at least every 5 years. Add it so we can track the renewal date.', due_date: addDays(14), priority: 'high', rule: 'rule-eicr' });
    addTask({ property_id: propId, type: 'certificate_upload', title: 'Add your Energy Performance Certificate (EPC)', description: 'Valid for 10 years; the property must meet the minimum rating to be let.', due_date: addDays(14), priority: 'medium', rule: 'rule-epc' });
    addTask({ property_id: propId, type: 'alarm_test', title: 'Check smoke and carbon monoxide alarms', description: 'Smoke alarm on every storey with living space; CO alarm in rooms with a fixed combustion appliance. Test at the start of each tenancy.', due_date: addDays(14), priority: 'high', rule: 'rule-smoke-co-alarms' });

    res.json({ success: true, property: enrichProperty(db.prepare('SELECT * FROM properties WHERE id = ?').get(propId)) });
  } catch (err) {
    fail(res, err);
  }
});

router.put('/properties/:id', (req, res) => {
  try {
    if (!ownProperty(req.user.id, req.params.id)) return res.status(404).json({ success: false, error: 'Property not found.' });
    const b = req.body || {};
    db.prepare(`
      UPDATE properties SET
        address_line1 = COALESCE(?, address_line1), address_line2 = COALESCE(?, address_line2), city = COALESCE(?, city),
        postcode = COALESCE(?, postcode), local_authority = COALESCE(?, local_authority), property_type = COALESCE(?, property_type),
        bedrooms = COALESCE(?, bedrooms), hmo = COALESCE(?, hmo), hmo_licence_number = COALESCE(?, hmo_licence_number),
        licensing_type = COALESCE(?, licensing_type), licensing_status = COALESCE(?, licensing_status), prs_database_status = COALESCE(?, prs_database_status)
      WHERE id = ? AND user_id = ?
    `).run(b.address_line1 ?? null, b.address_line2 ?? null, b.city ?? null, b.postcode ?? null, b.local_authority ?? null, b.property_type ?? null,
      b.bedrooms ?? null, b.hmo === undefined ? null : b.hmo ? 1 : 0, b.hmo_licence_number ?? null, b.licensing_type ?? null, b.licensing_status ?? null,
      b.prs_database_status ?? null, req.params.id, req.user.id);
    res.json({ success: true, property: db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id) });
  } catch (err) {
    fail(res, err);
  }
});

router.delete('/properties/:id', (req, res) => {
  try {
    if (!ownProperty(req.user.id, req.params.id)) return res.status(404).json({ success: false, error: 'Property not found.' });
    const files = db.prepare('SELECT stored_file FROM certificates WHERE property_id = ? AND stored_file IS NOT NULL').all(req.params.id);
    db.transaction(() => {
      db.prepare('DELETE FROM tasks WHERE property_id = ?').run(req.params.id);
      db.prepare('DELETE FROM certificates WHERE property_id = ?').run(req.params.id);
      db.prepare('DELETE FROM tenancies WHERE property_id = ?').run(req.params.id);
      db.prepare('DELETE FROM documents WHERE property_id = ?').run(req.params.id);
      db.prepare('UPDATE qa_logs SET property_id = NULL WHERE property_id = ?').run(req.params.id);
      db.prepare('DELETE FROM properties WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    })();
    for (const f of files) fs.promises.unlink(path.join(uploadsDir, path.basename(f.stored_file))).catch(() => {});
    res.json({ success: true, message: 'Property and its records deleted.' });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/properties/:id/pack', (req, res) => {
  try {
    const property = ownProperty(req.user.id, req.params.id);
    if (!property) return res.status(404).json({ success: false, error: 'Property not found.' });
    res.json({
      success: true,
      pack: {
        generated_at: new Date().toISOString(),
        property,
        tenancies: db.prepare('SELECT * FROM tenancies WHERE property_id = ?').all(property.id).map((t) => ({ ...t, tenants: JSON.parse(t.tenants), deposit: JSON.parse(t.deposit) })),
        certificates: db.prepare('SELECT * FROM certificates WHERE property_id = ? ORDER BY expiry_date DESC').all(property.id),
        tasks: db.prepare('SELECT * FROM tasks WHERE property_id = ? ORDER BY due_date ASC').all(property.id),
        documents: db.prepare('SELECT * FROM documents WHERE property_id = ? ORDER BY created_at DESC').all(property.id),
        qa_logs: db.prepare('SELECT * FROM qa_logs WHERE property_id = ? AND user_id = ? ORDER BY created_at DESC').all(property.id, req.user.id),
        verified_rules_count: db.prepare('SELECT COUNT(*) as c FROM rules').get().c,
        authority_jurisdiction: 'England',
      },
    });
  } catch (err) {
    fail(res, err);
  }
});

// 4. TENANCIES ----------------------------------------------
router.post('/tenancies', requirePlan, (req, res) => {
  try {
    const b = req.body || {};
    if (!b.property_id || !b.start_date || !b.rent_amount) return res.status(400).json({ success: false, error: 'Property, start date, and rent amount are required.' });
    if (!ownProperty(req.user.id, b.property_id)) return res.status(404).json({ success: false, error: 'Property not found.' });
    const tenants = Array.isArray(b.tenants) ? b.tenants.filter((t) => t && t.name) : [];
    if (tenants.length === 0) return res.status(400).json({ success: false, error: 'Add at least one tenant name.' });

    const tenancyId = 'ten-' + uuidv4();
    const deposit = {
      amount: parseFloat(b.deposit_amount) || 0,
      scheme: b.deposit_scheme || null,
      deposit_ref: b.deposit_ref || null,
      protected_date: b.deposit_protected_date || null,
      prescribed_info_given: Boolean(b.prescribed_info_given),
    };
    db.prepare(`
      INSERT INTO tenancies (id, property_id, tenants, start_date, tenancy_type, rent_amount, rent_frequency, rent_last_increased_date, deposit, information_sheet_given, status)
      VALUES (?, ?, ?, ?, 'periodic', ?, ?, ?, ?, ?, 'active')
    `).run(tenancyId, b.property_id, JSON.stringify(tenants), b.start_date, parseFloat(b.rent_amount), b.rent_frequency || 'monthly',
      b.rent_last_increased_date || null, JSON.stringify(deposit), b.information_sheet_given ? 1 : 0);

    const start = new Date(b.start_date);
    if (deposit.amount > 0 && !deposit.prescribed_info_given) {
      const due = new Date(start.getTime() + 30 * 86400000);
      addTask({ property_id: b.property_id, tenancy_id: tenancyId, type: 'deposit_prescribed_info', title: 'Protect the deposit and serve the prescribed information', description: 'The deposit must be protected in a government-approved scheme and the prescribed information given to the tenant within 30 days of receiving it.', due_date: isoDay(due), priority: 'urgent', rule: 'rule-deposit-protection' });
    }
    if (!b.information_sheet_given) {
      addTask({ property_id: b.property_id, tenancy_id: tenancyId, type: 'information_sheet', title: 'Give the tenant the required information sheet', description: 'Check the current government requirement for the tenancy information sheet and record when you gave it.', due_date: addDays(7), priority: 'high', rule: null });
    }
    const review = new Date(start);
    review.setFullYear(review.getFullYear() + 1);
    addTask({ property_id: b.property_id, tenancy_id: tenancyId, type: 'rent_review', title: 'Earliest date for a rent review', description: 'Rent can be increased at most once a year, using the statutory notice procedure with at least two months’ notice.', due_date: isoDay(review), priority: 'medium', rule: 'rule-rent-increase-process' });

    const created = db.prepare('SELECT * FROM tenancies WHERE id = ?').get(tenancyId);
    res.json({ success: true, tenancy: { ...created, tenants: JSON.parse(created.tenants), deposit: JSON.parse(created.deposit) } });
  } catch (err) {
    fail(res, err);
  }
});

// 5. CERTIFICATES & FILES ----------------------------------
router.get('/certificates', (req, res) => {
  try {
    const { property_id } = req.query;
    const rows = property_id
      ? db.prepare('SELECT c.* FROM certificates c JOIN properties p ON c.property_id = p.id WHERE p.user_id = ? AND c.property_id = ? ORDER BY c.expiry_date ASC').all(req.user.id, property_id)
      : db.prepare('SELECT c.* FROM certificates c JOIN properties p ON c.property_id = p.id WHERE p.user_id = ? ORDER BY c.expiry_date ASC').all(req.user.id);
    res.json({ success: true, certificates: rows });
  } catch (err) {
    fail(res, err);
  }
});

router.post('/certificates/upload', requirePlan, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Upload a PDF or image (max 15 MB).' });
  res.json({ success: true, file_path: `/api/files/${req.file.filename}`, file_name: req.file.originalname, file_size: req.file.size, mime_type: req.file.mimetype });
});

router.get('/files/:name', (req, res) => {
  const name = path.basename(req.params.name);
  if (!name.startsWith(`${req.user.id}__`)) return res.status(404).json({ success: false, error: 'File not found.' });
  const full = path.join(uploadsDir, name);
  if (!fs.existsSync(full)) return res.status(404).json({ success: false, error: 'File not found.' });
  res.setHeader('Cache-Control', 'private, no-store');
  res.sendFile(full);
});

router.post('/certificates', requirePlan, (req, res) => {
  try {
    const b = req.body || {};
    if (!b.property_id || !b.type || !b.issue_date || !b.expiry_date) return res.status(400).json({ success: false, error: 'Property, certificate type, issue date, and expiry date are required.' });
    if (!ownProperty(req.user.id, b.property_id)) return res.status(404).json({ success: false, error: 'Property not found.' });
    let storedFile = null;
    if (b.file_path) {
      const name = path.basename(String(b.file_path));
      if (!name.startsWith(`${req.user.id}__`)) return res.status(400).json({ success: false, error: 'Invalid file.' });
      storedFile = name;
    }
    const certId = 'cert-' + uuidv4();
    const status = certificateStatus(b.expiry_date);
    db.prepare(`
      INSERT INTO certificates (id, property_id, type, certificate_number, issue_date, expiry_date, status, rating, engineer_or_assessor, file_path, file_name, notes, stored_file)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(certId, b.property_id, b.type, b.certificate_number || null, b.issue_date, b.expiry_date, status, b.rating || null, b.engineer_or_assessor || null,
      storedFile ? `/api/files/${storedFile}` : null, b.file_name || null, b.notes || null, storedFile);

    // The "add your certificate" starter task is done once one is added.
    db.prepare("UPDATE tasks SET status = 'completed', completed_at = datetime('now') WHERE property_id = ? AND type = 'certificate_upload' AND source_rule_id = ? AND status != 'completed'")
      .run(b.property_id, { gas_safety: 'rule-gas-safety', eicr: 'rule-eicr', epc: 'rule-epc' }[b.type] || '');

    const titles = { gas_safety: 'Renew Gas Safety Certificate (CP12)', eicr: 'Renew Electrical Installation Condition Report (EICR)', epc: 'Renew Energy Performance Certificate (EPC)', smoke_co: 'Smoke and CO alarm check', hmo_licence: 'Renew HMO licence' };
    addTask({ property_id: b.property_id, type: 'certificate_renewal', title: titles[b.type] || 'Renew certificate', description: `Certificate ${b.certificate_number || ''} expires on ${b.expiry_date}. Book the inspection before then.`.replace('  ', ' '), due_date: b.expiry_date, priority: 'high', rule: { gas_safety: 'rule-gas-safety', eicr: 'rule-eicr', epc: 'rule-epc' }[b.type] || null });

    res.json({ success: true, certificate: db.prepare('SELECT * FROM certificates WHERE id = ?').get(certId) });
  } catch (err) {
    fail(res, err);
  }
});

// 6. TASKS ---------------------------------------------------
router.get('/tasks', (req, res) => {
  try {
    const { property_id, status } = req.query;
    let q = `SELECT t.*, p.address_line1, p.city, p.postcode FROM tasks t JOIN properties p ON t.property_id = p.id WHERE p.user_id = ?`;
    const params = [req.user.id];
    if (property_id) {
      q += ' AND t.property_id = ?';
      params.push(property_id);
    }
    if (status) {
      q += ' AND t.status = ?';
      params.push(status);
    }
    res.json({ success: true, tasks: db.prepare(q + ' ORDER BY t.due_date ASC').all(...params) });
  } catch (err) {
    fail(res, err);
  }
});

router.post('/tasks', requirePlan, (req, res) => {
  try {
    const b = req.body || {};
    if (!b.title || !b.due_date) return res.status(400).json({ success: false, error: 'Title and due date are required.' });
    if (!ownProperty(req.user.id, b.property_id)) return res.status(404).json({ success: false, error: 'Property not found.' });
    const id = 'tsk-' + uuidv4();
    insertTask().run(id, b.property_id, null, b.type || 'general', b.title, b.description || '', b.due_date, taskStatus({ due_date: b.due_date }), b.priority || 'medium', null);
    res.json({ success: true, task: db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) });
  } catch (err) {
    fail(res, err);
  }
});

router.patch('/tasks/:id', (req, res) => {
  try {
    const task = db.prepare('SELECT t.* FROM tasks t JOIN properties p ON t.property_id = p.id WHERE t.id = ? AND p.user_id = ?').get(req.params.id, req.user.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found.' });
    const { status, due_date } = req.body || {};
    const nextDue = due_date || task.due_date;
    const nextStatus = status === 'completed' ? 'completed' : taskStatus({ status: 'pending', due_date: nextDue });
    const completedAt = nextStatus === 'completed' ? task.completed_at || new Date().toISOString() : null;
    // A new due date re-arms the reminders.
    const reset = due_date && due_date !== task.due_date ? ', reminder_60d_sent = 0, reminder_30d_sent = 0, reminder_7d_sent = 0' : '';
    db.prepare(`UPDATE tasks SET status = ?, due_date = ?, completed_at = ?${reset} WHERE id = ?`).run(nextStatus, nextDue, completedAt, task.id);
    res.json({ success: true, task: db.prepare('SELECT * FROM tasks WHERE id = ?').get(task.id) });
  } catch (err) {
    fail(res, err);
  }
});

/** Preview of upcoming reminder emails (they are sent automatically every day). */
router.post('/tasks/simulate-reminders', (req, res) => {
  try {
    const tasks = db.prepare(`SELECT t.*, p.address_line1, p.postcode FROM tasks t JOIN properties p ON t.property_id = p.id WHERE p.user_id = ? AND t.status != 'completed' ORDER BY t.due_date ASC`).all(req.user.id);
    const dispatches = tasks
      .map((t) => ({ t, d: daysUntil(t.due_date) }))
      .filter(({ d }) => d <= 60)
      .map(({ t, d }) => ({
        taskId: t.id,
        to: req.user.email,
        subject: d < 0 ? `Overdue: ${t.title} – ${t.address_line1}` : `Due in ${d} days: ${t.title} – ${t.address_line1}`,
        stage: d < 0 ? 'Overdue' : d <= 7 ? '7-day reminder' : d <= 30 ? '30-day reminder' : '60-day reminder',
        dueDate: t.due_date,
        diffDays: d,
        title: t.title,
        bodyText: `${t.title} for ${t.address_line1}, ${t.postcode} is ${d < 0 ? `overdue by ${-d} days` : `due in ${d} days`} (${t.due_date}).`,
      }));
    res.json({ success: true, preview: true, reminders_sent_count: 0, dispatches, message: 'Reminders are emailed automatically at 60, 30 and 7 days. This is a preview.' });
  } catch (err) {
    fail(res, err);
  }
});

// 7. DOCUMENTS ------------------------------------------------
router.post('/documents/generate', requirePlan, (req, res) => {
  try {
    const { template_slug, property_id, custom_values = {} } = req.body || {};
    const template = db.prepare('SELECT * FROM templates WHERE slug = ?').get(template_slug);
    if (!template) return res.status(404).json({ success: false, error: 'Document template not found.' });
    const property = ownProperty(req.user.id, property_id);
    if (!property) return res.status(404).json({ success: false, error: 'Choose one of your properties.' });
    const tenancy = db.prepare("SELECT * FROM tenancies WHERE property_id = ? AND status = 'active' ORDER BY start_date DESC").get(property.id);

    // Only real data or what the landlord typed. Anything missing stays a visible placeholder:
    // a notice must never contain invented amounts, dates or evidence.
    const add = (what) => `[ADD: ${what}]`;
    const money = (n) => (typeof n === 'number' && n > 0 ? n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null);
    const deposit = tenancy ? JSON.parse(tenancy.deposit) : null;
    const rent = tenancy ? Number(tenancy.rent_amount) : null;
    const cv = (k) => (typeof custom_values[k] === 'string' && custom_values[k].trim() ? custom_values[k].trim() : null);
    const epc = db.prepare("SELECT rating FROM certificates WHERE property_id = ? AND type = 'epc' ORDER BY expiry_date DESC").get(property.id);
    const values = {
      property_address: `${property.address_line1}${property.address_line2 ? ', ' + property.address_line2 : ''}, ${property.city} ${property.postcode}`,
      tenant_names: tenancy ? JSON.parse(tenancy.tenants).map((t) => t.name).join(', ') : add('tenant name(s)'),
      start_date: tenancy?.start_date || add('tenancy start date'),
      rent_amount: money(rent) || add('current rent'),
      current_rent: money(rent) || add('current rent'),
      deposit_amount: money(deposit?.amount) || add('deposit amount'),
      deposit_limit: rent ? ((rent * 12) / 52 * 5).toFixed(2) : add('deposit cap (5 weeks’ rent)'),
      scheme_name: deposit?.scheme || add('deposit protection scheme'),
      new_rent: cv('new_rent') || add('proposed new rent'),
      effective_date: cv('effective_date') || add('date the new rent starts (at least 2 months after serving)'),
      last_increase_date: tenancy?.rent_last_increased_date || cv('last_increase_date') || add('date of the last rent increase'),
      market_evidence: cv('market_evidence') || add('evidence of comparable local rents'),
      pet_description: cv('pet_description') || add('description of the pet requested'),
      request_date: cv('request_date') || add('date the tenant made the request'),
      response_date: isoDay(new Date()),
      refusal_reasons: cv('refusal_reasons') || add('decision and reasons'),
      reported_date: cv('reported_date') || add('date the issue was reported'),
      ack_date: cv('ack_date') || add('date you acknowledged the report'),
      inspection_date: cv('inspection_date') || add('inspection date'),
      contractor_appointed: cv('contractor_appointed') || add('contractor name'),
      work_start_date: cv('work_start_date') || add('date works start'),
      completion_date: cv('completion_date') || add('expected completion date'),
      issue_description: cv('issue_description') || add('description of the hazard'),
      served_date: isoDay(new Date()),
      epc_rating: epc?.rating || add('EPC rating'),
    };
    let content = template.content_template;
    for (const [k, v] of Object.entries(values)) content = content.replaceAll(`{{${k}}}`, v);
    const missing = (content.match(/\[ADD: [^\]]+\]/g) || []).length;

    const docId = 'doc-' + uuidv4();
    db.prepare('INSERT INTO documents (id, property_id, template_id, title, category, content) VALUES (?, ?, ?, ?, ?, ?)')
      .run(docId, property.id, template.id, `${template.name} - ${property.address_line1}`, template.category, content);
    res.json({
      success: true,
      document: db.prepare('SELECT * FROM documents WHERE id = ?').get(docId),
      missing_fields: missing,
      official_gov_url: template.official_gov_url,
      guidance_text: template.guidance_text,
    });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/documents', (req, res) => {
  try {
    const { property_id } = req.query;
    const rows = property_id
      ? db.prepare('SELECT d.* FROM documents d JOIN properties p ON d.property_id = p.id WHERE p.user_id = ? AND d.property_id = ? ORDER BY d.created_at DESC').all(req.user.id, property_id)
      : db.prepare('SELECT d.* FROM documents d JOIN properties p ON d.property_id = p.id WHERE p.user_id = ? ORDER BY d.created_at DESC').all(req.user.id);
    res.json({ success: true, documents: rows });
  } catch (err) {
    fail(res, err);
  }
});

// 8. "CAN I DO THIS?" (rules-based, not legal advice) ----------
router.post('/qa', requirePlan, (req, res) => {
  try {
    const { question, property_id } = req.body || {};
    if (!question || !String(question).trim()) return res.status(400).json({ success: false, error: 'A question is required.' });
    const property = property_id ? ownProperty(req.user.id, property_id) : null;
    const result = answerLandlordQuestion(String(question).slice(0, 2000), property, db.prepare('SELECT * FROM rules').all());
    const logId = 'qa-' + uuidv4();
    db.prepare('INSERT INTO qa_logs (id, user_id, property_id, question, answer, relevant_rule_ids, solicitor_advised) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(logId, req.user.id, property?.id || null, question, result.answer, JSON.stringify(result.relevant_rules.map((r) => r.id)), result.solicitor_advised);
    res.json({ success: true, qa_log_id: logId, result });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/qa', (req, res) => {
  try {
    const { property_id } = req.query;
    const logs = property_id
      ? db.prepare('SELECT * FROM qa_logs WHERE user_id = ? AND property_id = ? ORDER BY created_at DESC').all(req.user.id, property_id)
      : db.prepare('SELECT * FROM qa_logs WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json({ success: true, logs: logs.map((l) => ({ ...l, relevant_rule_ids: l.relevant_rule_ids ? JSON.parse(l.relevant_rule_ids) : [] })) });
  } catch (err) {
    fail(res, err);
  }
});

// 9. REGULATION UPDATE BROADCAST (operators only: ADMIN_EMAILS) ---
router.post('/regulation-updates', (req, res) => {
  try {
    const admins = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (!admins.includes(String(req.user.email).toLowerCase())) return res.status(403).json({ success: false, error: 'Only the LandlordReady team can publish regulation updates.' });
    const b = req.body || {};
    if (!b.title || !b.summary || !b.topic || !b.effective_date || !b.source_url) {
      return res.status(400).json({ success: false, error: 'Title, summary, topic, effective date and official source URL are required.' });
    }
    const actions = Array.isArray(b.actions_required) ? b.actions_required : [];
    const updateId = 'upd-' + uuidv4();
    db.prepare(`INSERT INTO regulation_updates (id, title, summary, topic, effective_date, affected_regions, impact_severity, source_url, actions_required, broadcast_sent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`)
      .run(updateId, b.title, b.summary, b.topic, b.effective_date, b.affected_regions || 'England', b.impact_severity || 'medium', b.source_url, JSON.stringify(actions));
    // One task per property for every landlord.
    const properties = db.prepare('SELECT id FROM properties').all();
    for (const p of properties) {
      addTask({ property_id: p.id, type: 'statutory_update', title: `Regulation change: ${b.title}`, description: `${b.summary}${actions.length ? ` Actions: ${actions.join('; ')}` : ''} Source: ${b.source_url}`, due_date: b.effective_date, priority: b.impact_severity === 'high' ? 'urgent' : 'medium' });
    }
    res.json({ success: true, update_id: updateId, tasks_created_count: properties.length });
  } catch (err) {
    fail(res, err);
  }
});

export default router;
