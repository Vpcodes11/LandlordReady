import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { evaluateCompliance } from '../utils/complianceEngine.js';
import { answerLandlordQuestion } from '../utils/canIDoThisAssistant.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer for document vault uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB limit

const DEFAULT_USER_ID = 'usr-demo-landlord-01';

// ----------------------------------------------------
// 1. RULES API
// ----------------------------------------------------
router.get('/rules', (req, res) => {
  try {
    const rules = db.prepare('SELECT * FROM rules ORDER BY effective_date ASC').all();
    res.json({ success: true, rules });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 2. FREE COMPLIANCE CHECK API (No login required)
// ----------------------------------------------------
router.post('/check', (req, res) => {
  try {
    const answers = req.body;
    const rules = db.prepare('SELECT * FROM rules').all();
    const evaluation = evaluateCompliance(answers, rules);

    const checkId = 'chk-' + uuidv4().slice(0, 8);
    const insertCheck = db.prepare(`
      INSERT INTO checks (id, email, postcode, property_type, tenancy_start_date, answers, score, red_count, amber_count, green_count, results)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCheck.run(
      checkId,
      answers.email || null,
      answers.postcode || null,
      answers.property_type || 'Unknown',
      answers.tenancy_start_date || null,
      JSON.stringify(answers),
      evaluation.score || 0,
      evaluation.red_count || 0,
      evaluation.amber_count || 0,
      evaluation.green_count || 0,
      JSON.stringify(evaluation)
    );

    res.json({
      success: true,
      check_id: checkId,
      evaluation
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/check/email', (req, res) => {
  try {
    const { check_id, email, name } = req.body;
    if (!check_id || !email) {
      return res.status(400).json({ success: false, error: 'Check ID and email are required.' });
    }

    db.prepare('UPDATE checks SET email = ? WHERE id = ?').run(email, check_id);

    res.json({
      success: true,
      message: `Full compliance report has been registered for ${email}. Ready for PDF download.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/check/:id', (req, res) => {
  try {
    const check = db.prepare('SELECT * FROM checks WHERE id = ?').get(req.params.id);
    if (!check) {
      return res.status(404).json({ success: false, error: 'Check result not found.' });
    }
    res.json({
      success: true,
      check: {
        ...check,
        answers: JSON.parse(check.answers),
        results: JSON.parse(check.results)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 3. PROFILE & SUBSCRIPTIONS
// ----------------------------------------------------
router.get('/profile', (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(DEFAULT_USER_ID);
    const subscription = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(DEFAULT_USER_ID);
    res.json({ success: true, profile, subscription });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/profile', (req, res) => {
  try {
    const { name, phone, company_name } = req.body;
    db.prepare('UPDATE profiles SET name = ?, phone = ?, company_name = ? WHERE id = ?')
      .run(name, phone, company_name, DEFAULT_USER_ID);
    const updated = db.prepare('SELECT * FROM profiles WHERE id = ?').get(DEFAULT_USER_ID);
    res.json({ success: true, profile: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/subscriptions/upgrade', (req, res) => {
  try {
    const { plan_id, billing_cycle } = req.body; // 'starter', 'portfolio', 'pro'
    const limits = { starter: 1, portfolio: 5, pro: 15 };
    const monthlyPrices = { starter: 7.00, portfolio: 19.00, pro: 39.00 };
    const annualPrices = { starter: 70.00, portfolio: 190.00, pro: 390.00 };

    const limit = limits[plan_id] || 1;
    const price = billing_cycle === 'annual' ? annualPrices[plan_id] : monthlyPrices[plan_id];

    // Update profile & subscription
    db.prepare('UPDATE profiles SET subscription_tier = ?, billing_cycle = ? WHERE id = ?')
      .run(plan_id, billing_cycle, DEFAULT_USER_ID);

    db.prepare(`
      UPDATE subscriptions 
      SET plan_id = ?, properties_limit = ?, price_amount = ?, billing_cycle = ?, status = 'active'
      WHERE user_id = ?
    `).run(plan_id, limit, price, billing_cycle, DEFAULT_USER_ID);

    // Create an order record
    const invoiceNumber = `LR-INV-${Date.now().toString().slice(-6)}`;
    db.prepare(`
      INSERT INTO orders (id, user_id, subscription_id, amount, currency, status, invoice_number, invoice_url, description)
      VALUES (?, ?, ?, ?, 'GBP', 'paid', ?, '#', ?)
    `).run(
      'ord-' + uuidv4().slice(0, 8),
      DEFAULT_USER_ID,
      'sub-demo-01',
      price,
      invoiceNumber,
      `LandlordReady ${plan_id.toUpperCase()} Plan (${billing_cycle}) - ${limit} Properties`
    );

    res.json({
      success: true,
      message: `Successfully upgraded to ${plan_id.toUpperCase()} (${billing_cycle})!`,
      plan_id,
      billing_cycle,
      limit
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/orders', (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(DEFAULT_USER_ID);
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 4. PROPERTIES & MULTI-PROPERTY DASHBOARD
// ----------------------------------------------------
router.get('/properties', (req, res) => {
  try {
    const properties = db.prepare('SELECT * FROM properties WHERE user_id = ? ORDER BY created_at DESC').all(DEFAULT_USER_ID);
    
    // Enrich with tenancy, certs count, overdue tasks count
    const enriched = properties.map(p => {
      const tenancies = db.prepare('SELECT * FROM tenancies WHERE property_id = ?').all(p.id).map(t => ({
        ...t,
        tenants: JSON.parse(t.tenants),
        deposit: JSON.parse(t.deposit)
      }));
      const certificates = db.prepare('SELECT * FROM certificates WHERE property_id = ?').all(p.id);
      const tasks = db.prepare('SELECT * FROM tasks WHERE property_id = ?').all(p.id);

      const overdueCount = tasks.filter(t => t.status === 'overdue').length;
      const dueSoonCount = tasks.filter(t => t.status === 'due_soon').length;

      // Calculate live compliance score based on certs & tenancy
      let score = 100;
      const gasCert = certificates.find(c => c.type === 'gas_safety');
      const eicrCert = certificates.find(c => c.type === 'eicr');
      const epcCert = certificates.find(c => c.type === 'epc');

      if (!gasCert || gasCert.status === 'expired') score -= 25;
      else if (gasCert.status === 'expiring_soon') score -= 5;

      if (!eicrCert || eicrCert.status === 'expired') score -= 20;
      if (!epcCert || epcCert.status === 'expired' || ['F', 'G'].includes((epcCert.rating || '').toUpperCase())) score -= 25;
      if (p.hmo && p.licensing_status !== 'compliant') score -= 20;

      score = Math.max(0, Math.min(100, score));

      // Update property compliance score in DB if changed
      db.prepare('UPDATE properties SET compliance_score = ? WHERE id = ?').run(score, p.id);

      return {
        ...p,
        compliance_score: score,
        tenancies,
        certificates,
        tasks_count: tasks.length,
        overdue_tasks_count: overdueCount,
        due_soon_tasks_count: dueSoonCount
      };
    });

    res.json({ success: true, properties: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/properties', (req, res) => {
  try {
    const {
      address_line1,
      address_line2,
      city,
      postcode,
      local_authority,
      property_type,
      bedrooms,
      hmo,
      hmo_licence_number,
      licensing_type,
      licensing_status
    } = req.body;

    if (!address_line1 || !city || !postcode) {
      return res.status(400).json({ success: false, error: 'Address line 1, city, and postcode are required.' });
    }

    // Check plan limits
    const sub = db.prepare('SELECT properties_limit FROM subscriptions WHERE user_id = ?').get(DEFAULT_USER_ID);
    const count = db.prepare('SELECT COUNT(*) as count FROM properties WHERE user_id = ?').get(DEFAULT_USER_ID).count;
    if (sub && count >= sub.properties_limit) {
      return res.status(403).json({
        success: false,
        limit_reached: true,
        error: `Property limit reached (${sub.properties_limit} property max on your current plan). Please upgrade to add more properties.`
      });
    }

    const propId = 'prop-' + uuidv4().slice(0, 8);
    db.prepare(`
      INSERT INTO properties (id, user_id, address_line1, address_line2, city, postcode, local_authority, property_type, bedrooms, hmo, hmo_licence_number, licensing_type, licensing_status, compliance_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 75)
    `).run(
      propId,
      DEFAULT_USER_ID,
      address_line1,
      address_line2 || null,
      city,
      postcode.toUpperCase(),
      local_authority || 'Local Council',
      property_type || 'Terraced',
      parseInt(bedrooms) || 2,
      hmo ? 1 : 0,
      hmo_licence_number || null,
      licensing_type || 'none',
      licensing_status || 'not_required'
    );

    // Auto-create initial statutory tasks for the newly added property
    const insertTask = db.prepare(`
      INSERT INTO tasks (id, property_id, type, title, description, due_date, status, priority, source_rule_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. Gas Safety Task
    insertTask.run(
      'tsk-' + uuidv4().slice(0, 8),
      propId,
      'certificate_renewal',
      'Obtain / Upload Annual Gas Safety CP12 Certificate',
      'Every gas appliance must have a valid CP12 check carried out by a Gas Safe registered engineer annually.',
      '2026-12-15',
      'pending',
      'urgent',
      'rule-gas-safety'
    );

    // 2. Smoke/CO Alarms Task
    insertTask.run(
      'tsk-' + uuidv4().slice(0, 8),
      propId,
      'alarm_test',
      'Verify Working Smoke & Carbon Monoxide Alarms',
      'Ensure smoke alarms on every habitable level and CO alarms in rooms with combustion appliances are tested.',
      '2026-12-01',
      'pending',
      'high',
      'rule-smoke-co-alarms'
    );

    // 3. PRS Database Task
    insertTask.run(
      'tsk-' + uuidv4().slice(0, 8),
      propId,
      'prs_database',
      'PRS National Database Onboarding Preparation',
      'Digitise compliance certs and prepare landlord registration for Phase 2 regional rollout.',
      '2026-10-01',
      'pending',
      'medium',
      'rule-prs-database'
    );

    const created = db.prepare('SELECT * FROM properties WHERE id = ?').get(propId);
    res.json({ success: true, property: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/properties/:id', (req, res) => {
  try {
    const {
      address_line1,
      address_line2,
      city,
      postcode,
      local_authority,
      property_type,
      bedrooms,
      hmo,
      hmo_licence_number,
      licensing_type,
      licensing_status,
      prs_database_status
    } = req.body;

    db.prepare(`
      UPDATE properties SET
        address_line1 = COALESCE(?, address_line1),
        address_line2 = COALESCE(?, address_line2),
        city = COALESCE(?, city),
        postcode = COALESCE(?, postcode),
        local_authority = COALESCE(?, local_authority),
        property_type = COALESCE(?, property_type),
        bedrooms = COALESCE(?, bedrooms),
        hmo = COALESCE(?, hmo),
        hmo_licence_number = COALESCE(?, hmo_licence_number),
        licensing_type = COALESCE(?, licensing_type),
        licensing_status = COALESCE(?, licensing_status),
        prs_database_status = COALESCE(?, prs_database_status)
      WHERE id = ? AND user_id = ?
    `).run(
      address_line1, address_line2, city, postcode, local_authority,
      property_type, bedrooms, hmo ? 1 : 0, hmo_licence_number,
      licensing_type, licensing_status, prs_database_status,
      req.params.id, DEFAULT_USER_ID
    );

    const updated = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
    res.json({ success: true, property: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/properties/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM tasks WHERE property_id = ?').run(req.params.id);
    db.prepare('DELETE FROM certificates WHERE property_id = ?').run(req.params.id);
    db.prepare('DELETE FROM tenancies WHERE property_id = ?').run(req.params.id);
    db.prepare('DELETE FROM documents WHERE property_id = ?').run(req.params.id);
    db.prepare('DELETE FROM properties WHERE id = ? AND user_id = ?').run(req.params.id, DEFAULT_USER_ID);

    res.json({ success: true, message: 'Property and associated records deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Full Compliance Pack Data Export (for lenders, insurers, tribunal, or buyers)
router.get('/properties/:id/pack', (req, res) => {
  try {
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
    if (!property) return res.status(404).json({ success: false, error: 'Property not found.' });

    const tenancies = db.prepare('SELECT * FROM tenancies WHERE property_id = ?').all(property.id).map(t => ({
      ...t,
      tenants: JSON.parse(t.tenants),
      deposit: JSON.parse(t.deposit)
    }));

    const certificates = db.prepare('SELECT * FROM certificates WHERE property_id = ? ORDER BY expiry_date DESC').all(property.id);
    const tasks = db.prepare('SELECT * FROM tasks WHERE property_id = ? ORDER BY due_date ASC').all(property.id);
    const documents = db.prepare('SELECT * FROM documents WHERE property_id = ? ORDER BY created_at DESC').all(property.id);
    const qa_logs = db.prepare('SELECT * FROM qa_logs WHERE property_id = ? ORDER BY created_at DESC').all(property.id);
    const rules = db.prepare('SELECT * FROM rules').all();

    res.json({
      success: true,
      pack: {
        generated_at: new Date().toISOString(),
        property,
        tenancies,
        certificates,
        tasks,
        documents,
        qa_logs,
        verified_rules_count: rules.length,
        authority_jurisdiction: 'England (Renters Rights Act 2025/2026 Compliant)'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 5. TENANCIES API
// ----------------------------------------------------
router.post('/tenancies', (req, res) => {
  try {
    const {
      property_id,
      tenants, // array of { name, email, phone }
      start_date,
      rent_amount,
      rent_frequency,
      deposit_amount,
      deposit_scheme,
      deposit_ref,
      prescribed_info_given
    } = req.body;

    if (!property_id || !start_date || !rent_amount) {
      return res.status(400).json({ success: false, error: 'Property ID, start date, and rent amount are required.' });
    }

    const tenancyId = 'ten-' + uuidv4().slice(0, 8);
    const depositObj = {
      amount: parseFloat(deposit_amount) || 0,
      scheme: deposit_scheme || 'Deposit Protection Service (DPS)',
      deposit_ref: deposit_ref || 'PENDING-REG',
      protected_date: new Date().toISOString().split('T')[0],
      prescribed_info_given: Boolean(prescribed_info_given)
    };

    db.prepare(`
      INSERT INTO tenancies (id, property_id, tenants, start_date, tenancy_type, rent_amount, rent_frequency, rent_last_increased_date, deposit, information_sheet_given, status)
      VALUES (?, ?, ?, ?, 'periodic', ?, ?, ?, ?, 1, 'active')
    `).run(
      tenancyId,
      property_id,
      JSON.stringify(tenants || [{ name: 'Primary Tenant', email: 'tenant@example.com' }]),
      start_date,
      parseFloat(rent_amount),
      rent_frequency || 'monthly',
      start_date,
      JSON.stringify(depositObj)
    );

    // Auto-create Deposit Prescribed Information task (30 day deadline)
    const startDateObj = new Date(start_date);
    const piDeadline = new Date(startDateObj);
    piDeadline.setDate(piDeadline.getDate() + 30);

    db.prepare(`
      INSERT INTO tasks (id, property_id, tenancy_id, type, title, description, due_date, status, priority, source_rule_id)
      VALUES (?, ?, ?, 'deposit_prescribed_info', 'Serve Deposit Prescribed Information & Scheme Terms', 'Strict 30-day statutory clock: deliver countersigned prescribed info to avoid 1x-3x penalties.', ?, 'pending', 'urgent', 'rule-deposit-protection')
    `).run('tsk-' + uuidv4().slice(0, 8), property_id, tenancyId, piDeadline.toISOString().split('T')[0]);

    // Auto-create Rent Review Eligibility task (12 months after start)
    const rentReviewDate = new Date(startDateObj);
    rentReviewDate.setFullYear(rentReviewDate.getFullYear() + 1);
    db.prepare(`
      INSERT INTO tasks (id, property_id, tenancy_id, type, title, description, due_date, status, priority, source_rule_id)
      VALUES (?, ?, ?, 'rent_review', 'Annual Rent Review Window Opens (Section 13 Form 4)', 'Eligible to propose statutory rent increase with 2 months notice.', ?, 'pending', 'medium', 'rule-rent-increase-process')
    `).run('tsk-' + uuidv4().slice(0, 8), property_id, tenancyId, rentReviewDate.toISOString().split('T')[0]);

    const created = db.prepare('SELECT * FROM tenancies WHERE id = ?').get(tenancyId);
    res.json({
      success: true,
      tenancy: {
        ...created,
        tenants: JSON.parse(created.tenants),
        deposit: JSON.parse(created.deposit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 6. CERTIFICATES & DOCUMENT VAULT UPLOADS
// ----------------------------------------------------
router.get('/certificates', (req, res) => {
  try {
    const { property_id } = req.query;
    let query = 'SELECT * FROM certificates';
    const params = [];
    if (property_id) {
      query += ' WHERE property_id = ?';
      params.push(property_id);
    }
    query += ' ORDER BY expiry_date ASC';
    const certs = db.prepare(query).all(...params);
    res.json({ success: true, certificates: certs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/certificates/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      file_path: fileUrl,
      file_name: req.file.originalname,
      file_size: req.file.size,
      mime_type: req.file.mimetype
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/certificates', (req, res) => {
  try {
    const {
      property_id,
      type, // 'gas_safety', 'eicr', 'epc', 'smoke_co', 'hmo_licence'
      certificate_number,
      issue_date,
      expiry_date,
      rating,
      engineer_or_assessor,
      file_path,
      file_name,
      notes
    } = req.body;

    if (!property_id || !type || !issue_date || !expiry_date) {
      return res.status(400).json({ success: false, error: 'Property ID, certificate type, issue date, and expiry date are required.' });
    }

    const certId = 'cert-' + uuidv4().slice(0, 8);
    const expDate = new Date(expiry_date);
    const today = new Date('2026-11-18');
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

    let status = 'valid';
    if (diffDays < 0) status = 'expired';
    else if (diffDays <= 30) status = 'expiring_soon';

    db.prepare(`
      INSERT INTO certificates (id, property_id, type, certificate_number, issue_date, expiry_date, status, rating, engineer_or_assessor, file_path, file_name, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      certId,
      property_id,
      type,
      certificate_number || null,
      issue_date,
      expiry_date,
      status,
      rating || null,
      engineer_or_assessor || null,
      file_path || null,
      file_name || null,
      notes || null
    );

    // Auto-create renewal task on calendar
    const taskTitles = {
      gas_safety: 'Renew Annual Gas Safety Certificate (CP12)',
      eicr: 'Renew 5-Year Electrical Installation Condition Report (EICR)',
      epc: 'Renew Energy Performance Certificate (EPC)',
      smoke_co: 'Annual Smoke & Carbon Monoxide Alarm Test',
      hmo_licence: 'Renew Council HMO Licence'
    };

    db.prepare(`
      INSERT INTO tasks (id, property_id, type, title, description, due_date, status, priority, source_rule_id)
      VALUES (?, ?, 'certificate_renewal', ?, ?, ?, ?, 'high', ?)
    `).run(
      'tsk-' + uuidv4().slice(0, 8),
      property_id,
      taskTitles[type] || 'Renew Safety Certificate',
      `Certificate ${certificate_number || ''} expires on ${expiry_date}. Ensure inspection is completed before expiration.`,
      expiry_date,
      status === 'expired' ? 'overdue' : (status === 'expiring_soon' ? 'due_soon' : 'pending'),
      type === 'gas_safety' ? 'rule-gas-safety' : (type === 'eicr' ? 'rule-eicr' : 'rule-epc')
    );

    const created = db.prepare('SELECT * FROM certificates WHERE id = ?').get(certId);
    res.json({ success: true, certificate: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 7. COMPLIANCE CALENDAR & TASKS
// ----------------------------------------------------
router.get('/tasks', (req, res) => {
  try {
    const { property_id, status } = req.query;
    let query = `
      SELECT t.*, p.address_line1, p.city, p.postcode 
      FROM tasks t
      JOIN properties p ON t.property_id = p.id
      WHERE p.user_id = ?
    `;
    const params = [DEFAULT_USER_ID];

    if (property_id) {
      query += ' AND t.property_id = ?';
      params.push(property_id);
    }
    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    query += ' ORDER BY t.due_date ASC';
    const tasks = db.prepare(query).all(...params);
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/tasks', (req, res) => {
  try {
    const { property_id, type, title, description, due_date, priority } = req.body;
    const taskId = 'tsk-' + uuidv4().slice(0, 8);

    db.prepare(`
      INSERT INTO tasks (id, property_id, type, title, description, due_date, status, priority)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(taskId, property_id, type || 'general', title, description || '', due_date, priority || 'medium');

    const created = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    res.json({ success: true, task: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/tasks/:id', (req, res) => {
  try {
    const { status, completed_at, due_date } = req.body;
    db.prepare(`
      UPDATE tasks 
      SET status = COALESCE(?, status),
          completed_at = COALESCE(?, completed_at),
          due_date = COALESCE(?, due_date)
      WHERE id = ?
    `).run(status, completed_at, due_date, req.params.id);

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json({ success: true, task: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Email Reminders Simulation (60/30/7 days before due date)
router.post('/tasks/simulate-reminders', (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(DEFAULT_USER_ID);
    const tasks = db.prepare(`
      SELECT t.*, p.address_line1, p.city, p.postcode
      FROM tasks t
      JOIN properties p ON t.property_id = p.id
      WHERE t.status != 'completed'
    `).all();

    const simulatedDispatches = [];
    const today = new Date('2026-11-18');

    for (const t of tasks) {
      const dueDate = new Date(t.due_date);
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      // 60-day reminder
      if (diffDays <= 60 && diffDays > 30 && !t.reminder_60d_sent) {
        db.prepare('UPDATE tasks SET reminder_60d_sent = 1 WHERE id = ?').run(t.id);
        simulatedDispatches.push({
          taskId: t.id,
          to: profile.email,
          subject: `[60-Day Reminder] Compliance action due for ${t.address_line1}`,
          stage: '60-day early notice',
          dueDate: t.due_date,
          diffDays,
          title: t.title,
          bodyText: `Dear ${profile.name},\n\nThis is your early statutory compliance reminder for ${t.address_line1}, ${t.postcode}.\n\nObligation: ${t.title}\nDue Date: ${t.due_date} (${diffDays} days remaining).\n\nEarly preparation ensures you maintain possession rights under the Renters' Rights Act.`
        });
      }
      // 30-day reminder
      else if (diffDays <= 30 && diffDays > 7 && !t.reminder_30d_sent) {
        db.prepare('UPDATE tasks SET reminder_30d_sent = 1 WHERE id = ?').run(t.id);
        simulatedDispatches.push({
          taskId: t.id,
          to: profile.email,
          subject: `[30-Day Alert] Action required soon: ${t.title}`,
          stage: '30-day urgent notice',
          dueDate: t.due_date,
          diffDays,
          title: t.title,
          bodyText: `Dear ${profile.name},\n\nAction Required: ${t.title} for ${t.address_line1} is due in ${diffDays} days on ${t.due_date}.\n\nPlease book certified contractors or serve paperwork before the statutory deadline.`
        });
      }
      // 7-day urgent reminder or overdue
      else if (diffDays <= 7 && !t.reminder_7d_sent) {
        db.prepare('UPDATE tasks SET reminder_7d_sent = 1 WHERE id = ?').run(t.id);
        simulatedDispatches.push({
          taskId: t.id,
          to: profile.email,
          subject: `[URGENT 7-Day / Overdue Alert] ${t.title} for ${t.address_line1}`,
          stage: diffDays < 0 ? 'Overdue Breach Alert' : '7-day final warning',
          dueDate: t.due_date,
          diffDays,
          title: t.title,
          bodyText: `URGENT COMPLIANCE NOTICE:\n${t.title} is ${diffDays < 0 ? `OVERDUE by ${Math.abs(diffDays)} days!` : `due in ${diffDays} days!`}\n\nFailure to comply carries fines up to £30,000 and invalidates Section 8 possession.`
        });
      }
    }

    res.json({
      success: true,
      reminders_sent_count: simulatedDispatches.length,
      dispatches: simulatedDispatches
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 8. DOCUMENT GENERATOR & TEMPLATES
// ----------------------------------------------------
router.get('/templates', (req, res) => {
  try {
    const templates = db.prepare('SELECT * FROM templates ORDER BY name ASC').all();
    res.json({ success: true, templates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/documents/generate', (req, res) => {
  try {
    const { template_slug, property_id, custom_values } = req.body;
    const template = db.prepare('SELECT * FROM templates WHERE slug = ?').get(template_slug);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Document template not found.' });
    }

    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(property_id);
    const tenancy = db.prepare("SELECT * FROM tenancies WHERE property_id = ? AND status = 'active'").get(property_id);

    let tenantsList = 'Tenant Name';
    let rentAmount = '1,500.00';
    let depositAmount = '1,730.00';
    let schemeName = 'Deposit Protection Service (DPS)';

    if (tenancy) {
      const parsedTenants = JSON.parse(tenancy.tenants);
      tenantsList = parsedTenants.map(t => t.name).join(', ');
      rentAmount = tenancy.rent_amount.toLocaleString('en-GB', { minimumFractionDigits: 2 });
      const parsedDep = JSON.parse(tenancy.deposit);
      depositAmount = (parsedDep.amount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 });
      schemeName = parsedDep.scheme || schemeName;
    }

    // Replace template placeholders
    let content = template.content_template;
    const values = {
      property_address: property ? `${property.address_line1}, ${property.city} ${property.postcode}` : '14b Camden Road, London NW1 9HL',
      tenant_names: tenantsList,
      start_date: tenancy ? tenancy.start_date : '2026-05-01',
      rent_amount: rentAmount,
      deposit_amount: depositAmount,
      deposit_limit: (parseFloat(rentAmount.replace(/,/g, '')) * 12 / 52 * 5).toFixed(2),
      scheme_name: schemeName,
      current_rent: rentAmount,
      new_rent: custom_values?.new_rent || (parseFloat(rentAmount.replace(/,/g, '')) * 1.05).toFixed(2),
      effective_date: custom_values?.effective_date || '2027-01-01',
      last_increase_date: tenancy?.rent_last_increased_date || '2025-06-01',
      market_evidence: custom_values?.market_evidence || 'Based on comparable local 2-bedroom rental listings within 0.5 miles over past 60 days averaging £2,050/month.',
      pet_description: custom_values?.pet_description || 'One domestic medium-sized cat (neutered and microchipped).',
      request_date: custom_values?.request_date || '2026-11-10',
      response_date: new Date().toISOString().split('T')[0],
      refusal_reasons: custom_values?.refusal_reasons || 'N/A - Conditional consent granted.',
      reported_date: custom_values?.reported_date || '2026-11-12',
      ack_date: '2026-11-13',
      inspection_date: custom_values?.inspection_date || '2026-11-16',
      contractor_appointed: custom_values?.contractor_appointed || 'Apex Specialist Environmental Surveys',
      work_start_date: '2026-11-20',
      completion_date: 'Pending completion',
      issue_description: custom_values?.issue_description || 'Condensation mould reported along external bedroom north wall.',
      served_date: new Date().toISOString().split('T')[0],
      epc_rating: 'B (82)'
    };

    for (const [key, val] of Object.entries(values)) {
      content = content.replaceAll(`{{${key}}}`, val);
    }

    const docId = 'doc-' + uuidv4().slice(0, 8);
    db.prepare(`
      INSERT INTO documents (id, property_id, template_id, title, category, content)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      docId,
      property_id,
      template.id,
      `${template.name} - ${property ? property.address_line1 : 'Property'}`,
      template.category,
      content
    );

    const docRecord = db.prepare('SELECT * FROM documents WHERE id = ?').get(docId);
    res.json({
      success: true,
      document: docRecord,
      official_gov_url: template.official_gov_url,
      guidance_text: template.guidance_text
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/documents', (req, res) => {
  try {
    const { property_id } = req.query;
    let query = 'SELECT * FROM documents';
    const params = [];
    if (property_id) {
      query += ' WHERE property_id = ?';
      params.push(property_id);
    }
    query += ' ORDER BY created_at DESC';
    const docs = db.prepare(query).all(...params);
    res.json({ success: true, documents: docs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 9. "CAN I DO THIS?" LEGAL ASSISTANT
// ----------------------------------------------------
router.post('/qa', (req, res) => {
  try {
    const { question, property_id } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, error: 'A question is required.' });
    }

    const rules = db.prepare('SELECT * FROM rules').all();
    let propertyContext = null;
    if (property_id) {
      propertyContext = db.prepare('SELECT * FROM properties WHERE id = ?').get(property_id);
    }

    const result = answerLandlordQuestion(question, propertyContext, rules);

    const logId = 'qa-' + uuidv4().slice(0, 8);
    db.prepare(`
      INSERT INTO qa_logs (id, user_id, property_id, question, answer, relevant_rule_ids, solicitor_advised)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      DEFAULT_USER_ID,
      property_id || null,
      question,
      result.answer,
      JSON.stringify(result.relevant_rules.map(r => r.id)),
      result.solicitor_advised
    );

    res.json({
      success: true,
      qa_log_id: logId,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/qa', (req, res) => {
  try {
    const { property_id } = req.query;
    let query = 'SELECT * FROM qa_logs';
    const params = [];
    if (property_id) {
      query += ' WHERE property_id = ?';
      params.push(property_id);
    }
    query += ' ORDER BY created_at DESC';
    const logs = db.prepare(query).all(...params);
    res.json({
      success: true,
      logs: logs.map(l => ({
        ...l,
        relevant_rule_ids: l.relevant_rule_ids ? JSON.parse(l.relevant_rule_ids) : []
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 10. REGULATION UPDATES FEED & ADMIN BROADCAST
// ----------------------------------------------------
router.get('/regulation-updates', (req, res) => {
  try {
    const updates = db.prepare('SELECT * FROM regulation_updates ORDER BY effective_date DESC').all();
    res.json({
      success: true,
      updates: updates.map(u => ({
        ...u,
        actions_required: u.actions_required ? JSON.parse(u.actions_required) : []
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/regulation-updates', (req, res) => {
  try {
    const { title, summary, topic, effective_date, affected_regions, impact_severity, source_url, actions_required } = req.body;
    if (!title || !summary || !topic) {
      return res.status(400).json({ success: false, error: 'Title, summary, and topic are required.' });
    }

    const updateId = 'upd-' + uuidv4().slice(0, 8);
    const actionsJson = JSON.stringify(actions_required || [
      'Review portfolio properties in affected local authorities',
      'Update compliance documents to reflect latest statutory guidance'
    ]);

    db.prepare(`
      INSERT INTO regulation_updates (id, title, summary, topic, effective_date, affected_regions, impact_severity, source_url, actions_required, broadcast_sent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      updateId,
      title,
      summary,
      topic,
      effective_date || '2026-10-01',
      affected_regions || 'England (All Regions)',
      impact_severity || 'medium',
      source_url || 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill',
      actionsJson
    );

    // Auto-create new compliance tasks for affected user properties!
    const properties = db.prepare('SELECT * FROM properties WHERE user_id = ?').all(DEFAULT_USER_ID);
    const createdTasks = [];
    const insertTask = db.prepare(`
      INSERT INTO tasks (id, property_id, type, title, description, due_date, status, priority)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `);

    for (const p of properties) {
      const taskId = 'tsk-' + uuidv4().slice(0, 8);
      const taskTitle = `Action Required: ${title}`;
      const taskDesc = `Statutory update: ${summary}. Actions: ${(actions_required || []).join('; ')}`;
      insertTask.run(taskId, p.id, 'statutory_update', taskTitle, taskDesc, effective_date || '2026-12-01', impact_severity === 'high' ? 'urgent' : 'medium');
      createdTasks.push({ taskId, property_id: p.id, title: taskTitle });
    }

    res.json({
      success: true,
      update_id: updateId,
      tasks_created_count: createdTasks.length,
      message: `Regulation update broadcasted successfully. Auto-created ${createdTasks.length} compliance tasks for your portfolio.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
