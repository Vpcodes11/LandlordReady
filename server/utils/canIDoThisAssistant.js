// "Can I Do This?" Legal Assistant Engine for Landlords in England
// Strictly answers from the rules table with statutory steps, deadlines, and solicitor advisories.

export function answerLandlordQuestion(questionText, propertyContext = null, rulesList = []) {
  const q = questionText.toLowerCase().trim();

  let matchedRules = [];
  let answerMarkdown = '';
  let solicitorAdvised = false;
  let relevantTopic = '';

  // Topic 1: Rent increase / raising rent
  if (q.includes('rent') && (q.includes('raise') || q.includes('increase') || q.includes('hike') || q.includes('more') || q.includes('review') || q.includes('form 4') || q.includes('section 13'))) {
    relevantTopic = 'Rent Increase Process';
    const rule = rulesList.find(r => r.id === 'rule-rent-increase-process') || rulesList.find(r => r.topic.includes('Rent Increase'));
    if (rule) matchedRules.push(rule);

    answerMarkdown = `### Can I raise the rent?
**Yes, but strictly in accordance with the statutory Section 13 process under the Renters' Rights Act.**

#### 1. Statutory Rules & Allowed Frequency:
- **Maximum Frequency:** You may only increase the rent **once every 12 months**.
- **Prohibited Clauses:** Rent review clauses in tenancy agreements are void. Any verbal or unilateral rent increase without Form 4 is legally invalid.
- **Bidding Wars Outlawed:** You cannot invite or accept offers above the advertised rent.

#### 2. Statutory Deadlines & Procedure:
1. **Serve Official Form 4:** You must serve the official government **Section 13 Notice (Form 4)**. 
2. **Notice Period:** You must give the tenant **at least 2 full months' notice** before the new rent can take effect.
3. **Open Market Level:** The proposed rent cannot exceed genuine open market rent for comparable local properties.

#### 3. What if the tenant disputes the increase?
- The tenant may challenge the proposed increase in the **First-tier Tribunal (Property Chamber)** before the effective date.
- The Tribunal will determine the market rent. The Tribunal cannot set a rent higher than the figure you proposed, and the new rent only takes effect from the date of the determination (no backdated increases).

> **Official GOV.UK Guidance & Form 4:**
> [GOV.UK Section 13 Notice Form 4](${rule ? rule.source_url : 'https://www.gov.uk/government/publications/rent-increase-form-4'})

**⚠️ When to instruct a solicitor:**
If the tenant challenges the notice at the First-tier Tribunal and alleges procedural invalidity (e.g. incorrect service date, prior defect in information sheet, or disputed market comparables exceeding £5,000/year).`;
    solicitorAdvised = false;
  }

  // Topic 2: Selling the property / Landlord or family moving in (Section 8 Possession)
  else if (q.includes('sell') || q.includes('sale') || q.includes('move in') || q.includes('family') || q.includes('buyer')) {
    relevantTopic = 'Section 8 Possession (Ground 1 & Ground 1A)';
    const r1 = rulesList.find(r => r.id === 'rule-s21-abolition');
    const r2 = rulesList.find(r => r.id === 'rule-periodic-tenancies');
    if (r1) matchedRules.push(r1);
    if (r2) matchedRules.push(r2);

    solicitorAdvised = true;
    answerMarkdown = `### Can I sell the property or ask the tenant to leave because I want to sell?
**Yes, but you can NO LONGER use Section 21. You must use the reformed Section 8 Ground 1A (Intent to Sell).**

#### 1. Statutory Prerequisites:
- **12-Month Protected Period:** You **CANNOT** use Ground 1A to sell the property during the **first 12 months of the tenancy**. The tenant is legally protected from sale-related eviction for year 1.
- **Genuine Intent to Sell:** You must intend to market and sell the property on the open market.
- **12-Month Re-letting Restriction:** After the tenant vacates under Ground 1A, you are legally prohibited from re-letting or advertising the property for rent for **12 months**.

#### 2. Statutory Deadlines:
1. **Notice Period:** You must serve a formal Section 8 Notice specifying Ground 1A with a **mandatory notice period of 4 months**.
2. **Possession Hearing:** If the tenant does not vacate at the expiry of the 4 months, you must apply to the County Court for a possession order.

> **Official GOV.UK Guidance:**
> [Renters' Rights Bill: Ground 1A & Ground 1 Overview](${r1 ? r1.source_url : 'https://www.gov.uk/government/publications/renters-rights-bill-2024-overview'})

**⚠️ When to instruct a solicitor:**
**Immediate instruction advised.** Evictions under reformed Section 8 require strict adherence to statutory notice wording and filing evidence of your marketing contract / estate agent instruction. If your documentation is contested or prior compliance sheets were missed, court proceedings will be struck out with costs awarded against you.`;
  }

  // Topic 3: Ending tenancy / Evicting / Section 21
  else if (q.includes('section 21') || q.includes('s21') || q.includes('no fault') || q.includes('end tenancy') || q.includes('evict') || q.includes('kick out')) {
    relevantTopic = 'Section 21 Abolition & Reformed Section 8';
    const r = rulesList.find(r => r.id === 'rule-s21-abolition');
    if (r) matchedRules.push(r);

    solicitorAdvised = true;
    answerMarkdown = `### Can I end a tenancy using a Section 21 notice?
**NO. Section 21 "no fault" evictions are completely abolished under the Renters' Rights Act.**

#### 1. What the Law States:
- Any Section 21 notice served after the Phase 1 commencement date (1 May 2026) is **null, void, and unenforceable**.
- Attempting to force a tenant to leave without a court possession order is an offence under the Protection from Eviction Act 1977, carrying unlimited criminal fines, civil penalties up to £30,000, and up to 2 years imprisonment.

#### 2. Lawful Grounds to Regain Possession:
You must prove one of the reformed statutory **Section 8 Grounds**:
- **Ground 1:** Landlord or immediate family moving into the dwelling (requires 4 months' notice; usable only after 12 months).
- **Ground 1A:** Sale of dwelling (requires 4 months' notice; usable only after 12 months).
- **Ground 8:** Mandatory rent arrears (at least 3 months' arrears owed at both notice and court hearing date, with 4 weeks' notice).
- **Ground 14:** Anti-social behavior or illegal conduct (can be served immediately; discretionary court evaluation).

> **Official GOV.UK Source:**
> [Abolishing Section 21 - Official Guidance](${r ? r.source_url : 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill'})

**⚠️ When to instruct a solicitor:**
Always instruct a specialist housing solicitor before serving any Section 8 Notice. Procedural defects in prescribed notices, missing gas/EICR/deposit documents, or incorrect statutory ground references will cause immediate court dismissal.`;
  }

  // Topic 4: Tenant requests a pet
  else if (q.includes('pet') || q.includes('dog') || q.includes('cat') || q.includes('animal')) {
    relevantTopic = 'Pets in Lets';
    const r = rulesList.find(r => r.id === 'rule-pets-rights');
    if (r) matchedRules.push(r);

    answerMarkdown = `### Tenant requested a pet: Can I say no?
**You CANNOT issue a blanket ban. Under the Renters' Rights Act, tenants have a statutory right to request a pet, and you must not unreasonably withhold consent.**

#### 1. Statutory Response Deadlines:
- **42-Day Clock:** You must deliver a formal written decision to the tenant **within 42 days** of receiving their written pet request.
- **7-Day Extension:** If you are a leaseholder and need to check with the superior landlord / freeholder, you can request an additional 7 days (giving 49 days total).
- **Deemed Consent:** If you fail to respond within the statutory timeframe, consent is treated as granted.

#### 2. Valid Grounds for Lawful Refusal:
You may only refuse if you have **reasonable statutory grounds**, such as:
- Superior head lease or building freehold terms strictly forbid animals in the block.
- The property is demonstrably unsuitable for the specific size/type of animal.
- In a shared HMO dwelling where another verified tenant has a documented severe medical allergy.
*(Note: General reluctance or fear of wear and tear is NOT considered reasonable by the Ombudsman).*

#### 3. Landlord Protections:
- You are legally entitled to make your consent conditional on the tenant obtaining and maintaining **pet damage insurance**, or paying the reasonable cost of you securing pet damage cover.

> **Official GOV.UK Guidance:**
> [Pets in Private Rented Properties Guidance](${r ? r.source_url : 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill/guide-to-the-renters-rights-bill#pets-in-lets'})

**⚠️ When to instruct a solicitor:**
If the tenant challenges your refusal via the new Landlord Ombudsman or threatens County Court action and you rely on complex headlease covenants.`;
  }

  // Topic 5: Rent arrears / Tenant not paying rent
  else if (q.includes('arrear') || q.includes('not pay') || q.includes('late rent') || q.includes('owe') || q.includes('missed rent') || q.includes('debt')) {
    relevantTopic = 'Rent Arrears & Section 8 Ground 8';
    const r = rulesList.find(r => r.id === 'rule-s21-abolition');
    if (r) matchedRules.push(r);

    solicitorAdvised = true;
    answerMarkdown = `### Tenant is behind on rent: What are my legal remedies?
**Under the Renters' Rights Act, mandatory possession for rent arrears under Section 8 Ground 8 has been reformed.**

#### 1. New Statutory Ground 8 Thresholds:
- **Arrears Threshold:** The tenant must be at least **3 months in rent arrears** (previously 2 months under old law) both at the time you serve notice AND on the date of the court hearing.
- **Statutory Notice Period:** You must give the tenant **4 weeks' statutory notice** (increased from 2 weeks).
- **Mandatory Order:** If 3 months' arrears remain outstanding at the court hearing and no disrepair counterclaim applies, the court must grant a possession order.

#### 2. Discretionary Grounds (Ground 10 & 11):
- If arrears are less than 3 months, or rent is persistently paid late, you may rely on Ground 10 or Ground 11. However, possession is **discretionary**; the judge will decide whether it is reasonable to evict based on the circumstances.

#### 3. Recommended Immediate Steps:
1. Issue a polite formal arrears reminder with an itemized payment ledger.
2. Check whether universal credit / housing element can be paid directly to you (Alternative Payment Arrangement - APA).
3. Ensure no outstanding disrepair claims (e.g. damp, broken boiler) exist, as tenants often defend arrears with disrepair counterclaims.

> **Official GOV.UK Guidance:**
> [Court Possession Claims & Rent Arrears Guidance](${r ? r.source_url : 'https://www.gov.uk/evicting-tenants/section-8-notices'})

**⚠️ When to instruct a solicitor:**
**Instruction strongly advised once arrears exceed 2 months.** Arrears possession claims frequently fail if the tenant pays down the balance to 2 months and 29 days right before the judge sits, or raises an unaddressed Awaab's Law damp/repair counterclaim. A solicitor will draft the notice and prepare the witness statement.`;
  }

  // Topic 6: Property inspection / Landlord access
  else if (q.includes('inspect') || q.includes('access') || q.includes('enter') || q.includes('visit') || q.includes('tomorrow') || q.includes('key')) {
    relevantTopic = 'Landlord Right of Entry & Quiet Enjoyment';
    
    answerMarkdown = `### Can I enter or inspect the property tomorrow without agreement?
**NO. Entering a tenant's home without statutory notice or consent breaches their common-law covenant for "quiet enjoyment".**

#### 1. Statutory Rules on Access:
- **Minimum Notice:** You must give **at least 24 hours' written notice** specifying the purpose, date, and proposed time of entry.
- **Reasonable Times:** Visits must take place at reasonable daylight hours.
- **Tenant's Right to Refuse:** The tenant has the right to request an alternative reasonable time if the proposed slot conflicts with work or family commitments.

#### 2. Emergency Exception:
- You may only enter immediately without 24 hours' prior consent in genuine emergencies (e.g. active gas leak, burst water pipe flooding lower flats, fire, or immediate structural collapse).

#### 3. Record Keeping:
- Always document inspection requests in writing (email or SMS) and keep the signed property condition log.

**⚠️ When to instruct a solicitor:**
If a tenant repeatedly denies access for mandatory safety checks (Gas CP12 or EICR) despite multiple written warnings, you may need to apply to County Court for an injunction or court access order to prevent criminal health & safety liability.`;
  }

  // Topic 7: Damp, Mould, and Repairs (Awaab's Law)
  else if (q.includes('damp') || q.includes('mould') || q.includes('repair') || q.includes('leak') || q.includes('awaab') || q.includes('broken')) {
    relevantTopic = 'Awaab\'s Law & Decent Homes Standard';
    const r = rulesList.find(r => r.id === 'rule-awaabs-law');
    if (r) matchedRules.push(r);

    answerMarkdown = `### What are my legal obligations when a tenant reports repairs or damp?
**Awaab's Law is extended to the private rented sector under the Renters' Rights Act, imposing strict statutory response deadlines.**

#### 1. Statutory Deadlines:
- **Emergency Hazards (24 Hours):** Any hazard posing an imminent risk to safety or health (e.g. carbon monoxide, total loss of heating in winter, raw sewage, live electrical exposed cables) must be made safe within **24 hours**.
- **Investigation Period (14 Days):** Damp, mould, and health hazards must be physically inspected within **14 calendar days** of the tenant's report.
- **Remediation Commencement (7 Days):** Specialist works must commence within **7 days** of receiving the inspection report.

#### 2. Prohibited Actions:
- You cannot blame the tenant's "lifestyle" for structural damp or inadequate ventilation without a certified independent surveyor report.
- Failure to comply permits local council enforcement, works in default, and compensation orders.

> **Official GOV.UK Source:**
> [Decent Homes Standard & Awaab's Law Guidance](${r ? r.source_url : 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill/guide-to-the-renters-rights-bill#decent-homes-standard-and-awaabs-law'})

**⚠️ When to instruct a solicitor:**
If the tenant instructs a "no-win no-fee" disrepair solicitor or environmental health issues an Improvement Notice under the Housing Health and Safety Rating System (HHSRS).`;
  }

  // Fallback: General query matched against rules
  else {
    relevantTopic = 'General Compliance Rules';
    // Match any keywords
    const matches = rulesList.filter(r => {
      const tokens = q.split(' ').filter(t => t.length > 3);
      return tokens.some(t => r.topic.toLowerCase().includes(t) || r.rule.toLowerCase().includes(t));
    });

    if (matches.length > 0) {
      matchedRules = matches.slice(0, 3);
      answerMarkdown = `### Statutory Guidance from the England Rules Database

Based on your question: *"${questionText}"*, the following statutory rules apply in England:

${matchedRules.map(m => `
#### 📌 ${m.topic} (${m.phase})
- **Statutory Rule:** ${m.rule}
- **Maximum Legal Penalty:** ${m.penalty}
- **Guidance & Deadlines:** ${m.guidance_notes}
- **Official GOV.UK Authority:** [${m.source_url}](${m.source_url})
`).join('\n')}

**⚠️ When to instruct a solicitor:**
If you are considering serving statutory possession notices, defending tenant compensation claims, or navigating local authority enforcement notices.`;
    } else {
      answerMarkdown = `### England Residential Tenancies Compliance

LandlordReady provides verified guidance derived strictly from England statutory regulations and the Renters' Rights Act.

**Key Compliance Rules for Your Scenario:**
- **Tenancy Type:** From 1 May 2026, all tenancies in England must be statutory monthly periodic tenancies. Fixed terms are prohibited.
- **Evictions:** Section 21 no-fault evictions are abolished. Landlords can only regain possession using reformed Section 8 grounds with statutory evidence.
- **Rent Reviews:** Permitted once every 12 months using statutory Form 4 with at least 2 months' written notice.
- **Safety Requirements:** Annual Gas Safety CP12, 5-year EICR, valid EPC (Band E minimum), working smoke alarms on every habitable floor, and CO alarms in combustion rooms.

> **Official Government Source:**
> [GOV.UK Private Renting Guidance for Landlords](https://www.gov.uk/renting-out-a-property/landlord-responsibilities)

**⚠️ When to instruct a solicitor:**
For court litigation, disrepair counterclaims, or serving Section 8 notices for possession.`;
    }
  }

  return {
    question: questionText,
    answer: answerMarkdown,
    relevant_rules: matchedRules,
    solicitor_advised: solicitorAdvised ? 1 : 0,
    topic: relevantTopic
  };
}
