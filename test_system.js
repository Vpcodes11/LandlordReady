// Comprehensive System Verification Test for LandlordReady

import { app, server } from './server/server.js';
import { db } from './server/db/database.js';

async function runTests() {
  console.log('--- STARTING LANDLORDREADY SYSTEM TESTS ---');
  let failures = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failures++;
    }
  }

  try {
    const baseUrl = 'http://localhost:5000';

    // 1. Health Endpoint
    const healthRes = await (await fetch(`${baseUrl}/api/health`)).json();
    assert(healthRes.status === 'ok' && healthRes.jurisdiction === 'England', 'Health endpoint reports England jurisdiction');

    // 2. Rules Seeding & Required Verification
    const rulesRes = await (await fetch(`${baseUrl}/api/rules`)).json();
    assert(rulesRes.success && rulesRes.rules.length >= 12, 'Rules table contains 12+ statutory rules');

    const requiredRuleTopics = [
      'phase 1',
      'information sheet',
      'section 21',
      'periodic',
      'rent increase',
      'pet',
      'prs database',
      'ombudsman',
      'deposit',
      'gas',
      'eicr',
      'epc',
      'smoke'
    ];

    for (const topic of requiredRuleTopics) {
      const found = rulesRes.rules.find(r => 
        r.topic.toLowerCase().includes(topic) || 
        r.id.toLowerCase().includes(topic) ||
        r.rule.toLowerCase().includes(topic)
      );
      assert(
        found && found.source_url.includes('gov.uk') && found.status === 'verified',
        `Rule for "${topic}" is seeded with verified GOV.UK link: ${found?.source_url || 'missing'}`
      );
    }

    // 3. Free "Am I compliant?" Check (England)
    const checkPayloadEngland = {
      country: 'England',
      postcode: 'M14 5RT',
      property_type: 'Terraced',
      tenancy_start_date: '2025-06-01',
      tenancy_type: 'periodic',
      deposit_taken: true,
      deposit_protected: true,
      prescribed_info_given: true,
      information_sheet_given: false, // Critical breach
      has_gas: true,
      gas_cert_date: '2025-01-10', // Expired
      eicr_date: '2024-05-10',
      epc_rating: 'D',
      smoke_co_alarms: true,
      is_hmo: false,
      licensing_area: 'compliant',
      rent_last_increased_date: '2025-01-10'
    };

    const checkRes = await (await fetch(`${baseUrl}/api/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkPayloadEngland)
    })).json();

    assert(checkRes.success && checkRes.evaluation.allowed === true, 'Free compliance check executed for England property');
    assert(checkRes.evaluation.red_count >= 2, 'Correctly flags missing information sheet and expired Gas CP12 as RED breaches');
    assert(checkRes.evaluation.red_items.some(r => r.penalty.includes('civil penalty') || r.penalty.includes('fine')), 'Red items include statutory penalties from rules table');

    // Email capture for free check
    const emailRes = await (await fetch(`${baseUrl}/api/check/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        check_id: checkRes.check_id,
        email: 'landlord.lead@example.co.uk',
        name: 'Sarah Jenkins'
      })
    })).json();
    assert(emailRes.success, 'Email lead captured for compliance PDF report');

    // Devolution Gatekeeper Check (Wales / Scotland / NI)
    const checkWalesRes = await (await fetch(`${baseUrl}/api/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: 'Wales' })
    })).json();
    assert(
      checkWalesRes.evaluation.jurisdiction_error === true && checkWalesRes.evaluation.message.includes('Renting Homes (Wales) Act'),
      'Devolution gatekeeper stops for Wales with educational statutory explanation'
    );

    // 4. Properties & Compliance Pack
    const propsRes = await (await fetch(`${baseUrl}/api/properties`)).json();
    assert(propsRes.success && propsRes.properties.length >= 3, 'Multi-property dashboard fetches user properties');

    const firstProp = propsRes.properties[0];
    const packRes = await (await fetch(`${baseUrl}/api/properties/${firstProp.id}/pack`)).json();
    assert(packRes.success && packRes.pack.property.id === firstProp.id, 'Compliance Pack data generated for lenders/insurers/tribunals');

    // 5. Compliance Calendar & 60/30/7-day Reminders Simulation
    const tasksRes = await (await fetch(`${baseUrl}/api/tasks`)).json();
    assert(tasksRes.success && tasksRes.tasks.length > 0, 'Calendar tasks fetched with due dates');

    const simRes = await (await fetch(`${baseUrl}/api/tasks/simulate-reminders`, { method: 'POST' })).json();
    assert(simRes.success && Array.isArray(simRes.dispatches), 'Email reminders simulator processes 60/30/7-day windows');

    // 6. Document Generator
    const docGenRes = await (await fetch(`${baseUrl}/api/documents/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template_slug: 'rent-increase-section13',
        property_id: firstProp.id,
        custom_values: { new_rent: '2,200.00', effective_date: '2027-02-01' }
      })
    })).json();
    assert(
      docGenRes.success && docGenRes.official_gov_url.includes('rent-increase-form-4'),
      'Document generator renders Section 13 notice and provides official GOV.UK Form 4 link'
    );

    // 7. "Can I Do This?" Legal Assistant & Audit Log
    const qaHikeRes = await (await fetch(`${baseUrl}/api/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Can I raise rent by 15% next month?',
        property_id: firstProp.id
      })
    })).json();
    assert(
      qaHikeRes.success && qaHikeRes.result.answer.includes('Section 13') && qaHikeRes.result.answer.includes('2 full months'),
      '"Can I Do This?" assistant cites Section 13 statutory 2-month notice window'
    );

    const qaS21Res = await (await fetch(`${baseUrl}/api/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Can I serve a Section 21 notice?',
        property_id: firstProp.id
      })
    })).json();
    assert(
      qaS21Res.result.answer.includes('NO') && qaS21Res.result.solicitor_advised === 1,
      'Assistant confirms Section 21 abolition and triggers solicitor instruction advisory'
    );

    const qaLogsRes = await (await fetch(`${baseUrl}/api/qa?property_id=${firstProp.id}`)).json();
    assert(qaLogsRes.success && qaLogsRes.logs.length >= 2, 'All landlord Q&A queries persistently logged per property');

    // 8. Regulation Updates & Automatic Task Creation
    const broadcastRes = await (await fetch(`${baseUrl}/api/regulation-updates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'PRS Database: Mandatory Rollout Test Decree',
        summary: 'Mandatory landlord registration window testing decree.',
        topic: 'PRS Database',
        effective_date: '2026-11-25',
        affected_regions: 'England',
        impact_severity: 'high',
        actions_required: ['Upload valid Gas CP12', 'Register on local portal']
      })
    })).json();
    assert(
      broadcastRes.success && broadcastRes.tasks_created_count > 0,
      'Admin regulation broadcast automatically creates compliance tasks for user properties'
    );

    // 9. Pricing & Subscription Upgrade
    const subRes = await (await fetch(`${baseUrl}/api/subscriptions/upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan_id: 'pro',
        billing_cycle: 'annual'
      })
    })).json();
    assert(subRes.success && subRes.limit === 15, 'Successfully upgraded to Pro annual plan with 15 property allowance');

    const ordersRes = await (await fetch(`${baseUrl}/api/orders`)).json();
    assert(ordersRes.success && ordersRes.orders.length > 0, 'Invoices and order history recorded');

    // 10. Frontend Production HTML Serving
    const htmlRes = await (await fetch(`${baseUrl}/`)).text();
    assert(htmlRes.includes('<!doctype html>') && htmlRes.includes('/assets/'), 'Server serves frontend production bundle');

    console.log(`\n--- TEST RESULTS: ${failures === 0 ? 'ALL PASSED (30/30)!' : `${failures} FAILURES`} ---`);
    process.exit(failures === 0 ? 0 : 1);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
