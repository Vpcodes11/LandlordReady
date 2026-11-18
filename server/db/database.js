import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  SEED_RULES,
  SEED_TEMPLATES,
  SEED_PROFILE,
  SEED_PROPERTIES,
  SEED_TENANCIES,
  SEED_CERTIFICATES,
  SEED_TASKS,
  SEED_REGULATION_UPDATES,
  SEED_SUBSCRIPTIONS,
  SEED_ORDERS
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'landlordready.db');
export const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);

  // Check if rules are seeded
  const rulesCount = db.prepare('SELECT COUNT(*) as count FROM rules').get().count;
  if (rulesCount === 0) {
    console.log('[DB] Seeding compliance rules for England...');
    const insertRule = db.prepare(`
      INSERT INTO rules (id, jurisdiction, phase, effective_date, topic, rule, penalty, source_url, last_verified_at, status, guidance_notes)
      VALUES (@id, @jurisdiction, @phase, @effective_date, @topic, @rule, @penalty, @source_url, @last_verified_at, @status, @guidance_notes)
    `);

    const insertManyRules = db.transaction((rules) => {
      for (const rule of rules) {
        insertRule.run(rule);
      }
    });
    insertManyRules(SEED_RULES);
  }

  // Check if templates are seeded
  const tmplCount = db.prepare('SELECT COUNT(*) as count FROM templates').get().count;
  if (tmplCount === 0) {
    console.log('[DB] Seeding official document templates...');
    const insertTmpl = db.prepare(`
      INSERT INTO templates (id, slug, name, category, description, required_inputs, content_template, official_gov_url, guidance_text)
      VALUES (@id, @slug, @name, @category, @description, @required_inputs, @content_template, @official_gov_url, @guidance_text)
    `);

    const insertManyTmpl = db.transaction((templates) => {
      for (const t of templates) {
        insertTmpl.run(t);
      }
    });
    insertManyTmpl(SEED_TEMPLATES);
  }

  // Check if profile exists
  const profileCount = db.prepare('SELECT COUNT(*) as count FROM profiles').get().count;
  if (profileCount === 0) {
    console.log('[DB] Seeding default demo landlord profile and portfolio...');
    
    // Profile
    db.prepare(`
      INSERT INTO profiles (id, email, name, phone, company_name, subscription_tier, billing_cycle, subscription_status, trial_ends_at, created_at)
      VALUES (@id, @email, @name, @phone, @company_name, @subscription_tier, @billing_cycle, @subscription_status, @trial_ends_at, @created_at)
    `).run(SEED_PROFILE);

    // Properties
    const insertProp = db.prepare(`
      INSERT INTO properties (id, user_id, address_line1, address_line2, city, postcode, local_authority, property_type, bedrooms, hmo, hmo_licence_number, licensing_type, licensing_status, prs_database_status, compliance_score, created_at)
      VALUES (@id, @user_id, @address_line1, @address_line2, @city, @postcode, @local_authority, @property_type, @bedrooms, @hmo, @hmo_licence_number, @licensing_type, @licensing_status, @prs_database_status, @compliance_score, @created_at)
    `);
    for (const p of SEED_PROPERTIES) {
      insertProp.run(p);
    }

    // Tenancies
    const insertTenancy = db.prepare(`
      INSERT INTO tenancies (id, property_id, tenants, start_date, end_date, tenancy_type, rent_amount, rent_frequency, rent_last_increased_date, deposit, information_sheet_given, status, created_at)
      VALUES (@id, @property_id, @tenants, @start_date, @end_date, @tenancy_type, @rent_amount, @rent_frequency, @rent_last_increased_date, @deposit, @information_sheet_given, @status, @created_at)
    `);
    for (const t of SEED_TENANCIES) {
      insertTenancy.run(t);
    }

    // Certificates
    const insertCert = db.prepare(`
      INSERT INTO certificates (id, property_id, type, certificate_number, issue_date, expiry_date, status, rating, engineer_or_assessor, file_path, file_name, notes)
      VALUES (@id, @property_id, @type, @certificate_number, @issue_date, @expiry_date, @status, @rating, @engineer_or_assessor, @file_path, @file_name, @notes)
    `);
    for (const c of SEED_CERTIFICATES) {
      insertCert.run(c);
    }

    // Tasks
    const insertTask = db.prepare(`
      INSERT INTO tasks (id, property_id, tenancy_id, type, title, description, due_date, status, priority, source_rule_id, reminder_60d_sent, reminder_30d_sent, reminder_7d_sent, completed_at)
      VALUES (@id, @property_id, @tenancy_id, @type, @title, @description, @due_date, @status, @priority, @source_rule_id, @reminder_60d_sent, @reminder_30d_sent, @reminder_7d_sent, @completed_at)
    `);
    for (const tk of SEED_TASKS) {
      insertTask.run(tk);
    }

    // Regulation Updates
    const insertUpd = db.prepare(`
      INSERT INTO regulation_updates (id, title, summary, topic, effective_date, affected_regions, impact_severity, source_url, actions_required, broadcast_sent)
      VALUES (@id, @title, @summary, @topic, @effective_date, @affected_regions, @impact_severity, @source_url, @actions_required, @broadcast_sent)
    `);
    for (const u of SEED_REGULATION_UPDATES) {
      insertUpd.run(u);
    }

    // Subscriptions
    const insertSub = db.prepare(`
      INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end, properties_limit, price_amount, billing_cycle)
      VALUES (@id, @user_id, @plan_id, @status, @current_period_start, @current_period_end, @cancel_at_period_end, @properties_limit, @price_amount, @billing_cycle)
    `);
    for (const s of SEED_SUBSCRIPTIONS) {
      insertSub.run(s);
    }

    // Orders
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, user_id, subscription_id, amount, currency, status, invoice_number, invoice_url, description)
      VALUES (@id, @user_id, @subscription_id, @amount, @currency, @status, @invoice_number, @invoice_url, @description)
    `);
    for (const o of SEED_ORDERS) {
      insertOrder.run(o);
    }
  }

  console.log('[DB] LandlordReady database initialized successfully.');
}
