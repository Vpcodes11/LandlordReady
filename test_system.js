// Integration test: starts the real server on a throwaway database and exercises the API.
//   node test_system.js
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lr-test-'));
process.env.DATA_DIR = dataDir;
process.env.PORT = process.env.PORT || '5099';
process.env.SESSION_SECRET = 'test-secret-0123456789abcdef0123456789';
const base = `http://localhost:${process.env.PORT}`;

const { server } = await import('./server/server.js');
const { db } = await import('./server/db/database.js');

let failures = 0;
const assert = (cond, name) => {
  console.log(`${cond ? '✅ PASS' : '❌ FAIL'}: ${name}`);
  if (!cond) failures++;
};
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

async function signIn(email) {
  const token = crypto.randomBytes(16).toString('hex');
  db.prepare('INSERT INTO login_tokens (token_hash, email, expires_at) VALUES (?, ?, ?)').run(sha(token), email, Date.now() + 60000);
  const res = await fetch(`${base}/api/auth/verify`, { method: 'POST', body: new URLSearchParams({ token }), redirect: 'manual' });
  return res.headers.get('set-cookie').split(';')[0];
}
const client = (cookie) => async (p, opts = {}) => {
  const headers = { ...(cookie ? { cookie } : {}), ...(opts.body && typeof opts.body === 'string' ? { 'Content-Type': 'application/json' } : {}) };
  const res = await fetch(`${base}${p}`, { ...opts, headers });
  const type = res.headers.get('content-type') || '';
  return { status: res.status, body: type.includes('json') ? await res.json() : null };
};

try {
  await new Promise((r) => setTimeout(r, 300));
  const anon = client(null);
  const rules = await anon('/api/rules');
  assert(rules.body.rules?.length >= 12, 'Rules seeded (12+)');
  assert(db.prepare('SELECT COUNT(*) c FROM profiles').get().c === 0, 'No demo landlord in a fresh database');

  const check = await anon('/api/check', { method: 'POST', body: JSON.stringify({ postcode: 'LS1 1AA' }) });
  assert(check.status === 200 && typeof check.body.evaluation?.score === 'number', 'Free check works without an account');
  assert((await anon('/api/properties')).status === 401, 'Properties need sign-in');

  const aCookie = await signIn('a@test.dev');
  const bCookie = await signIn('b@test.dev');
  const a = client(aCookie);
  const b = client(bCookie);
  const me = await a('/api/me');
  assert(me.body.plan === 'trial' && me.body.properties_limit === 5, 'New account starts on the 14-day trial');

  const prop = await a('/api/properties', { method: 'POST', body: JSON.stringify({ address_line1: '1 Test St', city: 'Leeds', postcode: 'ls1 1aa' }) });
  assert(prop.status === 200 && prop.body.property.postcode === 'LS1 1AA', 'Landlord A adds a property');
  const pid = prop.body.property.id;

  const today = new Date().toISOString().slice(0, 10);
  const tasks = (await a(`/api/tasks?property_id=${pid}`)).body.tasks;
  assert(tasks.length === 4 && tasks.every((t) => t.due_date > today), 'Starter tasks are dated from today');

  assert((await b(`/api/properties/${pid}/pack`)).status === 404, "Landlord B cannot read A's property");
  assert((await b(`/api/properties/${pid}`, { method: 'DELETE' })).status === 404, "Landlord B cannot delete A's property");
  assert((await b('/api/tasks')).body.tasks.length === 0, "Landlord B sees none of A's tasks");
  assert((await b('/api/tenancies', { method: 'POST', body: JSON.stringify({ property_id: pid, start_date: today, rent_amount: 900, tenants: [{ name: 'X' }] }) })).status === 404, "Landlord B cannot add a tenancy to A's property");

  const ten = await a('/api/tenancies', { method: 'POST', body: JSON.stringify({ property_id: pid, start_date: today, rent_amount: 1200, deposit_amount: 1300, tenants: [{ name: 'Jo Bloggs' }] }) });
  assert(ten.status === 200, 'Tenancy added');
  const types = (await a(`/api/tasks?property_id=${pid}`)).body.tasks.map((t) => t.type);
  assert(types.includes('deposit_prescribed_info') && types.includes('information_sheet'), 'Deposit and information-sheet tasks created when not yet done');

  const templates = (await anon('/api/templates')).body.templates;
  const doc = await a('/api/documents/generate', { method: 'POST', body: JSON.stringify({ template_slug: templates[0].slug, property_id: pid }) });
  const content = doc.body.document?.content || '';
  assert(doc.status === 200 && !content.includes('Camden') && !content.includes('2,050'), 'Documents contain no invented addresses or evidence');
  assert(content.includes('1 Test St'), 'Documents use the real property address');

  const qa = await a('/api/qa', { method: 'POST', body: JSON.stringify({ question: 'Can I increase the rent?' }) });
  assert(qa.status === 200 && Boolean(qa.body.result?.answer), '"Can I do this?" answers');
  assert((await b('/api/qa')).body.logs.length === 0, 'Q&A history is private');

  const fd = new FormData();
  fd.append('file', new Blob(['%PDF-1.4 test'], { type: 'application/pdf' }), 'gas.pdf');
  const up = await client(aCookie)('/api/certificates/upload', { method: 'POST', body: fd });
  assert(up.status === 200 && up.body.file_path?.startsWith('/api/files/'), 'Certificate upload is stored privately');
  assert((await client(aCookie)(up.body.file_path)).status === 200, 'Owner can download the file');
  assert((await client(bCookie)(up.body.file_path)).status === 404, "Another landlord can't download it");
  assert((await anon(up.body.file_path)).status === 401, "Anonymous visitors can't download it");

  db.prepare("UPDATE profiles SET trial_ends_at = '2000-01-01' WHERE email = 'a@test.dev'").run();
  assert((await a('/api/properties', { method: 'POST', body: JSON.stringify({ address_line1: '2 Test St', city: 'Leeds', postcode: 'LS1' }) })).status === 402, 'Writing needs a plan once the trial ends');
  assert((await a('/api/properties')).status === 200, 'Data stays readable after the trial');
  assert((await a('/api/regulation-updates', { method: 'POST', body: JSON.stringify({ title: 'x' }) })).status === 403, 'Only admins publish regulation updates');
} catch (e) {
  console.error(e);
  failures++;
} finally {
  server.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
  console.log(failures ? `\n${failures} test(s) failed` : '\nAll tests passed');
  process.exit(failures ? 1 : 0);
}
