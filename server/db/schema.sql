-- LandlordReady Compliance Database Schema (England Jurisdiction)

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  company_name TEXT,
  subscription_tier TEXT DEFAULT 'starter',
  billing_cycle TEXT DEFAULT 'monthly',
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  local_authority TEXT,
  property_type TEXT DEFAULT 'Terraced',
  bedrooms INTEGER DEFAULT 2,
  hmo INTEGER DEFAULT 0,
  hmo_licence_number TEXT,
  licensing_type TEXT DEFAULT 'none',
  licensing_status TEXT DEFAULT 'not_required',
  prs_database_status TEXT DEFAULT 'pending_regional_launch',
  compliance_score INTEGER DEFAULT 85,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS tenancies (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  tenants TEXT NOT NULL, -- JSON array of tenant details
  start_date TEXT NOT NULL,
  end_date TEXT,
  tenancy_type TEXT DEFAULT 'periodic', -- 'periodic' (Renters Rights Act) or 'legacy_ast'
  rent_amount REAL NOT NULL,
  rent_frequency TEXT DEFAULT 'monthly',
  rent_last_increased_date TEXT,
  deposit TEXT NOT NULL, -- JSON object: scheme, amount, ref, protected_date, prescribed_info_given
  information_sheet_given INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'gas_safety', 'eicr', 'epc', 'smoke_co', 'legionella', 'hmo_licence'
  certificate_number TEXT,
  issue_date TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  status TEXT DEFAULT 'valid', -- 'valid', 'expiring_soon', 'expired'
  rating TEXT, -- e.g. 'C' for EPC, 'Satisfactory' for EICR
  engineer_or_assessor TEXT,
  file_path TEXT,
  file_name TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  tenancy_id TEXT,
  type TEXT NOT NULL, -- 'certificate_renewal', 'prs_database', 'rent_review', 'deposit_prescribed_info', 'alarm_test', 'licensing_renewal', 'information_sheet', 'repair_deadline'
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'due_soon', 'overdue', 'completed'
  priority TEXT DEFAULT 'medium', -- 'urgent', 'high', 'medium', 'low'
  source_rule_id TEXT,
  reminder_60d_sent INTEGER DEFAULT 0,
  reminder_30d_sent INTEGER DEFAULT 0,
  reminder_7d_sent INTEGER DEFAULT 0,
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (property_id) REFERENCES properties(id),
  FOREIGN KEY (source_rule_id) REFERENCES rules(id)
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  property_id TEXT,
  template_id TEXT,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- 'tenancy', 'notice', 'pet_request', 'repair_log', 'certificate', 'pack'
  content TEXT,
  file_path TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  required_inputs TEXT, -- JSON schema / array of keys
  content_template TEXT,
  official_gov_url TEXT,
  guidance_text TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS qa_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  property_id TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  relevant_rule_ids TEXT, -- JSON array of rule IDs
  solicitor_advised INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS regulation_updates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  topic TEXT NOT NULL,
  effective_date TEXT,
  affected_regions TEXT,
  impact_severity TEXT DEFAULT 'medium', -- 'high', 'medium', 'low', 'info'
  source_url TEXT,
  actions_required TEXT, -- JSON array of action checklist
  broadcast_sent INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  jurisdiction TEXT DEFAULT 'England',
  phase TEXT NOT NULL,
  effective_date TEXT,
  topic TEXT NOT NULL,
  rule TEXT NOT NULL,
  penalty TEXT NOT NULL,
  source_url TEXT NOT NULL,
  last_verified_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'verified',
  guidance_notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS checks (
  id TEXT PRIMARY KEY,
  email TEXT,
  postcode TEXT,
  property_type TEXT,
  tenancy_start_date TEXT,
  answers TEXT NOT NULL, -- JSON string of all submitted answers
  score INTEGER NOT NULL,
  red_count INTEGER DEFAULT 0,
  amber_count INTEGER DEFAULT 0,
  green_count INTEGER DEFAULT 0,
  results TEXT NOT NULL, -- JSON string of categorized checklist items with penalties
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL, -- 'free', 'starter', 'portfolio', 'pro'
  status TEXT DEFAULT 'active',
  current_period_start TEXT,
  current_period_end TEXT,
  cancel_at_period_end INTEGER DEFAULT 0,
  properties_limit INTEGER DEFAULT 1,
  price_amount REAL DEFAULT 7.00,
  billing_cycle TEXT DEFAULT 'monthly',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  subscription_id TEXT,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'GBP',
  status TEXT DEFAULT 'paid',
  invoice_number TEXT,
  invoice_url TEXT,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_user ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_property ON tenancies(property_id);
CREATE INDEX IF NOT EXISTS idx_certificates_property ON certificates(property_id);
CREATE INDEX IF NOT EXISTS idx_tasks_property ON tasks(property_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date, status);
CREATE INDEX IF NOT EXISTS idx_rules_topic ON rules(topic);
CREATE INDEX IF NOT EXISTS idx_documents_property ON documents(property_id);
CREATE INDEX IF NOT EXISTS idx_qa_logs_property ON qa_logs(property_id);
