// Comprehensive Seed Data for LandlordReady (England)
// Accurate to Renters' Rights Act 2025/2026 & Existing Statutory Regulations

export const SEED_RULES = [
  {
    id: 'rule-rra-phase1',
    jurisdiction: 'England',
    phase: 'Phase 1 - Transition (1 May 2026)',
    effective_date: '2026-05-01',
    topic: 'Renters Rights Act Phase 1 Overview',
    rule: 'From 1 May 2026, all existing and newly created assured tenancies in England convert simultaneously to periodic rolling tenancies. Fixed terms are abolished and Section 21 no-fault evictions cease entirely.',
    penalty: 'Unlawful eviction carries criminal penalties, unlimited fines, and up to £30,000 civil penalty plus 24-month Rent Repayment Orders (RRO).',
    source_url: 'https://www.gov.uk/government/publications/renters-rights-bill-2024-overview',
    last_verified_at: '2026-11-18',
    status: 'verified',
    guidance_notes: 'Landlords cannot issue new fixed-term contracts from 1 May 2026. Existing ASTs will automatically be treated as statutory periodic tenancies.'
  },
  {
    id: 'rule-s21-abolition',
    jurisdiction: 'England',
    phase: 'Phase 1 - Transition (1 May 2026)',
    effective_date: '2026-05-01',
    topic: 'Section 21 Abolition',
    rule: 'Section 21 "no fault" evictions are completely abolished. Landlords can only regain possession using reformed Section 8 grounds (e.g. Ground 1 moving in, Ground 1A selling property, Ground 8 rent arrears).',
    penalty: 'Any attempt to serve an invalid Section 21 notice is null and void. Harassment or unlawful eviction carries unlimited criminal fines and up to 2 years imprisonment (Protection from Eviction Act 1977).',
    source_url: 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill/guide-to-the-renters-rights-bill#abolishing-section-21-evictions',
    last_verified_at: '2026-11-18',
    status: 'verified',
    guidance_notes: 'Ground 1A (selling) and Ground 1 (moving in) cannot be used in the first 12 months of a tenancy and require 4 months statutory notice. Re-letting or marketing for rent within 12 months after eviction is illegal.'
  },
  {
    id: 'rule-periodic-tenancies',
    jurisdiction: 'England',
    phase: 'Phase 1 - Transition (1 May 2026)',
    effective_date: '2026-05-01',
    topic: 'Periodic Tenancies',
    rule: 'All assured shorthold tenancies (ASTs) become rolling periodic tenancies. Tenants can terminate the tenancy at any time by giving 2 months notice in writing. Fixed terms of 6, 12, or 24 months are prohibited.',
    penalty: 'Clauses attempting to enforce fixed lock-in terms or tenant penalty fees are unenforceable and breach the Tenant Fees Act 2019 (fines up to £5,000 first breach, £30,000 subsequent).',
    source_url: 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill/guide-to-the-renters-rights-bill#tenancy-structure',
    last_verified_at: '2026-11-18',
    status: 'verified',
    guidance_notes: 'Ensure agreement paperwork does not contain fixed end dates. Rent must be collected monthly or weekly.'
  },
  {
    id: 'rule-info-sheet',
    jurisdiction: 'England',
    phase: 'Phase 1 - Transition (1 May 2026)',
    effective_date: '2026-05-01',
    topic: 'Information Sheet Requirement',
    rule: 'Landlords must provide tenants with the official government statutory Information Sheet (replacing the How to Rent booklet) before or on the day the tenancy commences, as well as upon any statutory update.',
    penalty: 'Failure to serve the Information Sheet bars the landlord from obtaining an order for possession under Section 8, and local authorities may impose a civil financial penalty up to £7,000.',
    source_url: 'https://www.gov.uk/government/publications/how-to-rent',
    last_verified_at: '2026-11-18',
    status: 'verified',
    guidance_notes: 'Always obtain written or electronic confirmation of receipt from all named tenants on or prior to handover.'
  },
  {
    id: 'rule-rent-increase-process',
    jurisdiction: 'England',
    phase: 'Phase 1 - Transition (1 May 2026)',
    effective_date: '2026-05-01',
    topic: 'Rent Increase Process',
    rule: 'Rent increases can only be implemented once every 12 months using the statutory Section 13 (Form 4) notice procedure. Landlords must give at least 2 full months notice to the tenant, proposing the open market rate.',
    penalty: 'Rent review clauses in agreements are void. Any unofficial or coercive increase is invalid; tenants may challenge in the First-tier Tribunal, which can order rent repayment and determine fair market rent.',
    source_url: 'https://www.gov.uk/government/publications/rent-increase-form-4',
    last_verified_at: '2026-11-18',
    status: 'verified',
    guidance_notes: 'Rental bidding wars are prohibited: landlords and agents cannot solicit or accept offers above the advertised rent. The tribunal will not set rent higher than the landlord requested.'
  },
  {
    id: 'rule-pets-rights',
    jurisdiction: 'England',
    phase: 'Phase 1 - Transition (1 May 2026)',
    effective_date: '2026-05-01',
    topic: 'Pets in Lets',
    rule: 'Tenants have a statutory right to request keeping a pet. Landlords cannot unreasonably refuse and must give a written response with reasons within 42 days (extendable by 7 days if superior landlord consent is required).',
    penalty: 'Unreasonable refusal or blanket bans can be referred by the tenant to the Landlord Ombudsman, which can order consent, compensation, and issue sanctions against the landlord.',
    source_url: 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill/guide-to-the-renters-rights-bill#pets-in-lets',
    last_verified_at: '2026-11-18',
    status: 'verified',
    guidance_notes: 'Landlords are legally entitled to require the tenant to purchase pet damage insurance or pay the reasonable costs of the landlord insuring against pet damage.'
  },
  {
    id: 'rule-prs-database',
    jurisdiction: 'England',
    phase: 'Phase 2 - Roll-out (Late 2026 / 2027)',
    effective_date: '2026-10-01',
    topic: 'PRS Database Registration',
    rule: 'Mandatory registration of all private landlords and rental dwellings on the new national Private Rented Sector (PRS) Database. Information on compliance, gas/electric certs, and council enforcement is logged.',
    penalty: 'Operating without valid registration incurs initial local authority fines up to £7,000, escalating to £40,000 or criminal prosecution for persistent breaches. Unregistered landlords cannot serve Section 8 notices.',
    source_url: 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill/guide-to-the-renters-rights-bill#private-rented-sector-database',
    last_verified_at: '2026-11-18',
    status: 'verified',
    guidance_notes: 'Rolling out regionally. Landlords must register both themselves and each let property, pay an annual registration fee, and upload current safety certificates.'
  },
  {
    id: 'rule-ombudsman',
    jurisdiction: 'England',
    phase: 'Phase 2 - Roll-out (Late 2026 / 2027)',
    effective_date: '2026-10-01',
    topic: 'Landlord Ombudsman Membership',
    rule: 'Every private landlord in England must join the government-approved Private Rented Sector Landlord Ombudsman Scheme, providing free dispute resolution for tenants without requiring court action.',
    penalty: 'Failing to join the Ombudsman results in civil penalties up to £7,000 for initial non-compliance, up to £40,000, and potential banning orders for persistent non-members.',
    source_url: 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill/guide-to-the-renters-rights-bill#landlord-ombudsman',
    last_verified_at: '2026-11-18',
    status: 'verified',
    guidance_notes: 'The Ombudsman can order landlords to apologize, carry out repairs, take corrective action, or pay financial compensation up to £25,000.'
  },
  {
    id: 'rule-deposit-protection',
    jurisdiction: 'England',
    phase: 'Statutory Requirement (Housing Act 2004)',
    effective_date: '2007-04-06',
    topic: 'Tenancy Deposit Protection & Prescribed Info',
    rule: 'Any tenancy deposit taken must be registered with a government-approved scheme (DPS, TDS, or MyDeposits) within 30 calendar days of receipt. Prescribed Information and scheme leaflet must be served on tenant within the same 30 days.',
    penalty: 'Tenant can claim compensation of 1x to 3x the deposit amount in County Court. Landlord is legally barred from using Section 8 Ground 1/1A until deposit is returned in full or court claims resolved.',
    source_url: 'https://www.gov.uk/tenancy-deposit-protection',
    last_verified_at: '2026-11-18',
    status: 'verified',
    guidance_notes: 'Deposit amount is legally capped under the Tenant Fees Act 2019 at 5 weeks rent (if annual rent is under £50,000) or 6 weeks rent (if £50k+).'
  },
  {
    id: 'rule-gas-safety',
    jurisdiction: 'England',
    phase: 'Statutory Safety (Gas Safety Regs 1998)',
    effective_date: '1998-10-31',
    topic: 'Gas Safety Certificate (CP12)',
    rule: 'An annual gas safety check must be conducted by a Gas Safe registered engineer on every gas appliance and flue. A copy of the record (CP12) must be provided to new tenants before move-in, and to existing tenants within 28 days of check.',
    penalty: 'Unlimited fine and up to 6 months imprisonment under the Health and Safety at Work etc. Act 1974. Failure to provide CP12 severely compromises possession proceedings.',
    source_url: 'https://www.gov.uk/renting-out-a-property/landlord-responsibilities#gas-safety',
    last_verified_at: '2026-11-18',
    status: 'verified',
    guidance_notes: 'Record-keeping: Landlords must retain copies of each Gas Safety check for at least 2 years.'
  },
  {
    id: 'rule-eicr',
    jurisdiction: 'England',
    phase: 'Statutory Safety (Electrical Standards 2020)',
    effective_date: '2020-07-01',
    topic: 'Electrical Installation Condition Report (EICR)',
    rule: 'Fixed electrical installations must be inspected and tested by a qualified person at intervals of no more than 5 years. Landlord must supply a copy of satisfactory report to tenant within 28 days, or before move-in for new tenants.',
    penalty: 'Local housing authorities can impose civil penalties up to £30,000 per breach under the Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020.',
    source_url: 'https://www.gov.uk/government/publications/electrical-safety-standards-in-the-private-rented-sector-guidance-for-landlords-tenants-and-local-authorities',
    last_verified_at: '2026-11-18',
    status: 'verified',
    guidance_notes: 'If the report indicates further investigative work or C1/C2/FI codes, the landlord must complete remedial works within 28 days (or shorter if specified) and provide written confirmation.'
  },
  {
    id: 'rule-epc',
    jurisdiction: 'England',
    phase: 'Statutory Energy (MEES Regulations 2015)',
    effective_date: '2018-04-01',
    topic: 'Energy Performance Certificate (EPC)',
    rule: 'Rental properties must possess an active EPC (valid for 10 years) with a minimum energy rating of band E or above. Letting a property rated F or G without a registered valid exemption on the PRS Exemptions Register is unlawful.',
    penalty: 'Civil financial penalty up to £5,000 per property imposed by local trading standards / housing authority.',
    source_url: 'https://www.gov.uk/guidance/domestic-private-rented-property-minimum-energy-efficiency-standard-landlord-guidance',
    last_verified_at: '2026-11-18',
    status: 'verified',
    guidance_notes: 'Future regulations may require EPC rating C. A copy of the EPC must be provided to the prospective tenant free of charge before entering into a tenancy.'
  },
  {
    id: 'rule-smoke-co-alarms',
    jurisdiction: 'England',
    phase: 'Statutory Safety (Alarms Regulations 2022)',
    effective_date: '2022-10-01',
    topic: 'Smoke and Carbon Monoxide Alarms',
    rule: 'Landlords must ensure at least one working smoke alarm is installed on each storey of living accommodation. A carbon monoxide alarm must be equipped in any room containing a fixed combustion appliance (e.g. gas boiler, fire). Alarms must be tested on day 1 of every tenancy.',
    penalty: 'Local authority civil penalty of up to £5,000 following failure to comply with a remedial notice within 28 days.',
    source_url: 'https://www.gov.uk/government/publications/smoke-and-carbon-monoxide-alarm-england-regulations-2015-guidance-for-landlords',
    last_verified_at: '2026-11-18',
    status: 'verified',
    guidance_notes: 'Must repair or replace any alarm as soon as reasonably informed by the tenant that it is faulty.'
  },
  {
    id: 'rule-hmo-licensing',
    jurisdiction: 'England',
    phase: 'Statutory Housing Act 2004',
    effective_date: '2006-04-06',
    topic: 'HMO & Selective Licensing',
    rule: 'Mandatory licensing applies to any House in Multiple Occupation (HMO) occupied by 5 or more persons from 2 or more households sharing amenities. Additional and selective licensing schemes apply to certain local authorities and postcodes.',
    penalty: 'Unlimited fine upon criminal conviction, civil penalty up to £30,000, and Rent Repayment Orders (RRO) forcing repayment of up to 24 months of tenant rent or housing benefit.',
    source_url: 'https://www.gov.uk/house-in-multiple-occupation-licence',
    last_verified_at: '2026-11-18',
    status: 'verified',
    guidance_notes: 'Always check the local council licensing designation for your specific postcode. An unlicensed property cannot be repossessed and leaves the landlord vulnerable to RRO claims.'
  },
  {
    id: 'rule-awaabs-law',
    jurisdiction: 'England',
    phase: 'Renters Rights Act / Social Housing Extension',
    effective_date: '2026-05-01',
    topic: 'Awaabs Law & Decent Homes Standard',
    rule: 'Awaabs Law is extended to the private rented sector. Landlords must investigate reported hazards (including damp and mould) within strict statutory timelines (e.g. investigate within 14 calendar days, emergency hazards made safe within 24 hours, repairs commenced within 7 days).',
    penalty: 'Enforcement notices by local council, civil fines up to £30,000, compensation orders via Ombudsman or county court, and liability for tenant health damages.',
    source_url: 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill/guide-to-the-renters-rights-bill#decent-homes-standard-and-awaabs-law',
    last_verified_at: '2026-11-18',
    status: 'verified',
    guidance_notes: 'Maintain meticulous written records of tenant complaints, dates of inspection, specialist contractor quotes, and proof of repairs completed.'
  }
];

export const SEED_TEMPLATES = [
  {
    id: 'tmpl-periodic-checklist',
    slug: 'periodic-tenancy-checklist',
    name: 'Periodic Tenancy Compliance Checklist (RRA 2025/2026)',
    category: 'tenancy',
    description: 'Statutory onboarding checklist verifying all legal obligations under the Renters Rights Act periodic tenancy regime before key exchange.',
    required_inputs: JSON.stringify(['property_address', 'tenant_names', 'start_date', 'rent_amount', 'deposit_amount', 'scheme_name']),
    official_gov_url: 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill',
    guidance_text: 'Use this checklist prior to issuing keys. From 1 May 2026, fixed terms cannot be agreed. Confirm delivery of the mandatory Information Sheet and all certificates.',
    content_template: `LANDLORD COMPLIANCE ONBOARDING CHECKLIST
Under Renters' Rights Act 2025/2026 & England Statutory Requirements

PROPERTY: {{property_address}}
TENANT(S): {{tenant_names}}
TENANCY COMMENCEMENT DATE: {{start_date}}
MONTHLY RENT: £{{rent_amount}}
DEPOSIT TAKEN: £{{deposit_amount}}

[1] STATUTORY PERIODIC TENANCY STRUCTURE
[x] Tenancy drafted as statutory monthly periodic (no fixed end date or lock-in clauses)
[x] Tenant informed of 2-month written notice requirement to end tenancy
[x] Rent review clause excluded (statutory Section 13 process only)

[2] MANDATORY PRE-COMMENCEMENT DOCUMENTS
[x] Official Statutory Information Sheet served prior to commencement
[x] Valid Energy Performance Certificate (EPC) rated E or above provided
[x] Valid Gas Safety Certificate (CP12) from Gas Safe engineer provided
[x] Valid Electrical Installation Condition Report (EICR - 5 yr) provided
[x] Written proof of receipt countersigned by tenant(s)

[3] DEPOSIT PROTECTION (STRICT 30-DAY CLOCK)
[x] Deposit protected with {{scheme_name}}
[x] Statutory Prescribed Information completed and signed
[x] Scheme terms and conditions leaflet attached
[x] Deposit amount verified within 5 weeks' rent limit (£{{deposit_limit}})

[4] SAFETY ON DAY 1
[x] Working smoke alarm tested and verified on every habitable storey
[x] Carbon monoxide alarm tested in every room with fixed combustion appliance
[x] Move-in inspection report with dated photographic record completed

Signed by Landlord: _________________________ Date: _________________
Received by Tenant(s): _____________________ Date: _________________`
  },
  {
    id: 'tmpl-s13-rent-notice',
    slug: 'rent-increase-section13',
    name: 'Section 13 Rent Increase Notice (Form 4)',
    category: 'notice',
    description: 'Statutory rent increase workflow and official notice details under Section 13 Housing Act 1988 as amended by the Renters Rights Act.',
    required_inputs: JSON.stringify(['property_address', 'tenant_names', 'current_rent', 'new_rent', 'effective_date', 'market_evidence']),
    official_gov_url: 'https://www.gov.uk/government/publications/rent-increase-form-4',
    guidance_text: 'Under the Renters Rights Act, rent can only be increased once every 12 months using Form 4. You MUST give at least 2 full months notice before the new rent takes effect. Official form must be used.',
    content_template: `NOTICE OF INCREASE OF RENT UNDER SECTION 13(2) OF THE HOUSING ACT 1988
(As amended by the Renters' Rights Act)

OFFICIAL FORM GUIDANCE:
Landlords in England MUST use the official government Form 4 (Landlord's notice proposing a new rent under an Assured Periodic Tenancy).
Direct download of official GOV.UK Form 4:
https://www.gov.uk/government/publications/rent-increase-form-4

SUMMARY OF PROPOSED TERMS:
To Tenant(s): {{tenant_names}}
Premises: {{property_address}}

1. Current Rent: £{{current_rent}} per calendar month
2. Proposed New Rent: £{{new_rent}} per calendar month
3. Date New Rent is to Start: {{effective_date}} (Minimum 2 months statutory notice given)
4. Last Date Rent was Increased: {{last_increase_date}} (Must be 12+ months prior)

MARKET RENT JUSTIFICATION:
{{market_evidence}}

STATUTORY RIGHTS OF THE TENANT:
- If you do not accept the proposed rent, you must apply to the First-tier Tribunal (Property Chamber) before the starting date in paragraph 3.
- The Tribunal will determine the open market rent. Under Renters' Rights Act rules, the Tribunal cannot determine a rent higher than the landlord's proposed figure, and the determination takes effect from the Tribunal decision date (no backdating to the notice date).

Landlord Signature: _______________________ Date Served: _______________
Method of Service: [ ] Hand delivered  [ ] First class post  [ ] Permitted email`
  },
  {
    id: 'tmpl-pet-response',
    slug: 'pet-request-response',
    name: 'Response to Tenant Pet Request',
    category: 'pet_request',
    description: 'Formal landlord determination regarding tenant pet application under Renters Rights Act statutory timelines (42 days).',
    required_inputs: JSON.stringify(['property_address', 'tenant_names', 'pet_description', 'decision_type', 'insurance_details', 'refusal_reasons']),
    official_gov_url: 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill/guide-to-the-renters-rights-bill#pets-in-lets',
    guidance_text: 'You must respond within 42 days of receiving a written pet request. You cannot unreasonably withhold consent. You can make consent conditional upon pet damage insurance.',
    content_template: `LANDLORD STATUTORY RESPONSE TO PET REQUEST
Under the Renters' Rights Act 2025/2026

To: {{tenant_names}}
Property: {{property_address}}
Date of Request Received: {{request_date}}
Date of This Response: {{response_date}} (Within 42 days statutory limit)
Requested Pet: {{pet_description}}

DETERMINATION:
[ ] CONDITIONAL APPROVAL GRANTED
Consent is hereby granted subject to the following statutory conditions:
1. Pet Damage Insurance: In accordance with Section 16B of the Housing Act 1988, the tenant must obtain and maintain a valid pet damage insurance policy covering accidental damage to the premises, fixtures, and fittings caused by the animal. Proof of insurance must be provided to the landlord within 14 days and annually upon renewal.
2. Reasonable Welfare: The pet must be cared for in accordance with the Animal Welfare Act 2006 and must not cause nuisance, noise nuisance, or distress to neighbors or other occupants.
3. End-of-Tenancy: The tenant must ensure the premises are professionally cleaned / treated for pet allergens and fleas at the end of the tenancy.

[ ] APPLICATION REFUSED ON REASONABLE STATUTORY GROUNDS
Consent is respectfully declined on the following reasonable grounds:
{{refusal_reasons}}
(Note: Blanket bans or arbitrary refusals are invalid. Superior leasehold covenants prohibiting pets or verified medical allergies in shared HMO dwellings are accepted grounds).

Landlord / Agent: _________________________ Date: _________________`
  },
  {
    id: 'tmpl-awaabs-repair-tracker',
    slug: 'repair-tracker-awaabs',
    name: 'Awaab\'s Law PRS Repair & Damp Hazard Log',
    category: 'repair_log',
    description: 'Statutory compliance log tracking tenant maintenance notices, investigation timelines, and remediation within mandatory deadlines.',
    required_inputs: JSON.stringify(['property_address', 'issue_description', 'hazard_level', 'reported_date', 'inspection_date', 'contractor_appointed', 'completion_date']),
    official_gov_url: 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill/guide-to-the-renters-rights-bill#decent-homes-standard-and-awaabs-law',
    guidance_text: 'Emergency hazards (loss of heat, structural collapse, gas leak, severe electrical hazard) must be made safe within 24 hours. Damp/mould investigations must commence within 14 days.',
    content_template: `HAZARD INVESTIGATION & REMEDIATION COMPLIANCE LOG
In compliance with Awaab's Law Private Rented Sector Standards & Housing Health and Safety Rating System (HHSRS)

PROPERTY: {{property_address}}
TENANT: {{tenant_names}}

1. REPORT OF HAZARD
- Date & Time Reported: {{reported_date}}
- Reported By: [ ] Tenant Email  [ ] Tenant Phone  [ ] In-person
- Nature of Hazard: {{issue_description}}
- Category Classification: [ ] Emergency (24-hr safety risk)  [ ] High (Damp/mould/heating)  [ ] Routine

2. STATUTORY TIMELINE MILESTONES
- Initial Acknowledgment: Sent within 24 hours (Date: {{ack_date}})
- Physical Investigation: Statutory deadline 14 days (Actual Date: {{inspection_date}})
- Specialist Appointed: {{contractor_appointed}} (Gas Safe / NIC EIC / Damp surveyor)
- Remediation Commenced: Statutory deadline 7 days post-survey (Date: {{work_start_date}})
- Final Completion & Retest: {{completion_date}}

3. VERIFICATION & PRESERVATION OF EVIDENCE
- Pre-repair photographic evidence archived: [x] YES
- Specialist contractor written report on file: [x] YES
- Tenant written confirmation of satisfactory remediation: [x] YES

Signed: __________________________ (Landlord / Appointed Surveyor)`
  },
  {
    id: 'tmpl-tenant-pack-checklist',
    slug: 'tenant-info-pack',
    name: 'Tenant Mandatory Information Pack Receipt',
    category: 'tenancy',
    description: 'Documented proof of service for statutory documents required to preserve possession rights in England.',
    required_inputs: JSON.stringify(['property_address', 'tenant_names', 'delivery_method', 'served_date']),
    official_gov_url: 'https://www.gov.uk/government/publications/how-to-rent',
    guidance_text: 'Failure to prove service of these documents will invalidate possession proceedings under Section 8 and trigger local authority enforcement.',
    content_template: `STATUTORY TENANT INFORMATION PACK - PROOF OF SERVICE
England Domestic Tenancies

Property: {{property_address}}
Tenant Names: {{tenant_names}}
Date Served: {{served_date}}
Method of Service: [ ] Hand delivered with signature  [ ] Email with acknowledged receipt  [ ] Tracked Postal Delivery

I/We hereby acknowledge receipt of current versions of the following statutory compliance documents:
1. [ ] Government "Information Sheet" / How to Rent Guide (Current version at start of tenancy)
2. [ ] Valid Energy Performance Certificate (EPC) - Current Rating: {{epc_rating}}
3. [ ] Current Gas Safety Certificate (CP12) issued by Gas Safe Engineer
4. [ ] Electrical Installation Condition Report (EICR) satisfactory report
5. [ ] Deposit Protection Certificate & Prescribed Information (Housing Act 2004)
6. [ ] Smoke & Carbon Monoxide Alarm verification confirmation (tested day 1)
7. [ ] Local Authority Property Licence (if HMO / Selective Licensing area)

Tenant Signature(s):
1. _______________________________ Date: _______________
2. _______________________________ Date: _______________`
  }
];

export const SEED_PROFILE = {
  id: 'usr-demo-landlord-01',
  email: 'marcus.landlord@example.co.uk',
  name: 'Marcus Holloway',
  phone: '07700 900123',
  company_name: 'Holloway Residential Property Ltd',
  subscription_tier: 'portfolio',
  billing_cycle: 'monthly',
  subscription_status: 'active',
  trial_ends_at: '2026-12-02T12:00:00Z',
  created_at: '2026-11-01T09:00:00Z'
};

export const SEED_PROPERTIES = [
  {
    id: 'prop-london-01',
    user_id: 'usr-demo-landlord-01',
    address_line1: '14b Camden Road',
    address_line2: 'Flat 2',
    city: 'London',
    postcode: 'NW1 9HL',
    local_authority: 'Camden Council',
    property_type: 'Flat / Apartment',
    bedrooms: 2,
    hmo: 0,
    hmo_licence_number: null,
    licensing_type: 'selective',
    licensing_status: 'compliant',
    prs_database_status: 'pending_regional_launch',
    compliance_score: 92,
    created_at: '2026-11-01T10:00:00Z'
  },
  {
    id: 'prop-mcr-02',
    user_id: 'usr-demo-landlord-01',
    address_line1: '28 Oxford Grove',
    address_line2: '',
    city: 'Manchester',
    postcode: 'M14 5RT',
    local_authority: 'Manchester City Council',
    property_type: 'Terraced',
    bedrooms: 4,
    hmo: 1,
    hmo_licence_number: 'MCC-HMO-2024-8841',
    licensing_type: 'mandatory_hmo',
    licensing_status: 'compliant',
    prs_database_status: 'pending_regional_launch',
    compliance_score: 78,
    created_at: '2026-11-02T11:00:00Z'
  },
  {
    id: 'prop-bristol-03',
    user_id: 'usr-demo-landlord-01',
    address_line1: '7 Clifton Heights',
    address_line2: '',
    city: 'Bristol',
    postcode: 'BS8 1EJ',
    local_authority: 'Bristol City Council',
    property_type: 'Semi-Detached',
    bedrooms: 3,
    hmo: 0,
    hmo_licence_number: null,
    licensing_type: 'none',
    licensing_status: 'not_required',
    prs_database_status: 'pending_regional_launch',
    compliance_score: 84,
    created_at: '2026-11-03T14:00:00Z'
  }
];

export const SEED_TENANCIES = [
  {
    id: 'ten-london-01',
    property_id: 'prop-london-01',
    tenants: JSON.stringify([
      { name: 'Sophie Taylor', email: 'sophie.taylor@example.com', phone: '07890 123456', is_lead: true },
      { name: 'Oliver Evans', email: 'oliver.evans@example.com', phone: '07890 654321', is_lead: false }
    ]),
    start_date: '2025-06-01',
    end_date: null,
    tenancy_type: 'periodic',
    rent_amount: 1950.00,
    rent_frequency: 'monthly',
    rent_last_increased_date: '2025-06-01',
    deposit: JSON.stringify({
      amount: 2250.00,
      scheme: 'Deposit Protection Service (DPS Custodial)',
      deposit_ref: 'DPS-88492019',
      protected_date: '2025-06-10',
      prescribed_info_given: true,
      prescribed_info_date: '2025-06-12'
    }),
    information_sheet_given: 1,
    status: 'active',
    created_at: '2025-06-01T10:00:00Z'
  },
  {
    id: 'ten-mcr-02',
    property_id: 'prop-mcr-02',
    tenants: JSON.stringify([
      { name: 'Liam Davies', email: 'liam.davies@example.com', phone: '07711 223344', is_lead: true },
      { name: 'Aiden Miller', email: 'aiden.miller@example.com', phone: '07711 334455', is_lead: false },
      { name: 'Chloe Wilson', email: 'chloe.wilson@example.com', phone: '07711 445566', is_lead: false },
      { name: 'Zoe Brown', email: 'zoe.brown@example.com', phone: '07711 556677', is_lead: false }
    ]),
    start_date: '2025-09-01',
    end_date: null,
    tenancy_type: 'periodic',
    rent_amount: 2400.00,
    rent_frequency: 'monthly',
    rent_last_increased_date: '2025-09-01',
    deposit: JSON.stringify({
      amount: 2769.23,
      scheme: 'Tenancy Deposit Scheme (TDS Insured)',
      deposit_ref: 'TDS-EW-992144',
      protected_date: '2025-09-15',
      prescribed_info_given: true,
      prescribed_info_date: '2025-09-18'
    }),
    information_sheet_given: 1,
    status: 'active',
    created_at: '2025-09-01T11:00:00Z'
  },
  {
    id: 'ten-bristol-03',
    property_id: 'prop-bristol-03',
    tenants: JSON.stringify([
      { name: 'Eleanor Ward', email: 'eleanor.ward@example.com', phone: '07800 112233', is_lead: true }
    ]),
    start_date: '2024-11-01',
    end_date: null,
    tenancy_type: 'periodic',
    rent_amount: 1600.00,
    rent_frequency: 'monthly',
    rent_last_increased_date: '2025-11-01',
    deposit: JSON.stringify({
      amount: 1846.15,
      scheme: 'MyDeposits',
      deposit_ref: 'MYD-665512',
      protected_date: '2024-11-10',
      prescribed_info_given: true,
      prescribed_info_date: '2024-11-12'
    }),
    information_sheet_given: 1,
    status: 'active',
    created_at: '2024-11-01T12:00:00Z'
  }
];

export const SEED_CERTIFICATES = [
  {
    id: 'cert-cp12-london',
    property_id: 'prop-london-01',
    type: 'gas_safety',
    certificate_number: 'CP12-LON-90812',
    issue_date: '2026-04-15',
    expiry_date: '2027-04-14',
    status: 'valid',
    rating: 'Pass / Safe',
    engineer_or_assessor: 'Gary Matthews (Gas Safe #554890)',
    file_path: '/uploads/demo-cp12-london.pdf',
    file_name: 'CP12_Gas_Safety_14b_Camden.pdf',
    notes: 'Worcester Bosch Combi boiler inspected. Flue analysis clear. Tested cooker and meter.'
  },
  {
    id: 'cert-eicr-london',
    property_id: 'prop-london-01',
    type: 'eicr',
    certificate_number: 'EICR-2023-4411',
    issue_date: '2023-05-10',
    expiry_date: '2028-05-09',
    status: 'valid',
    rating: 'Satisfactory',
    engineer_or_assessor: 'London Volt Electricals (NICEIC #3321)',
    file_path: '/uploads/demo-eicr-london.pdf',
    file_name: 'EICR_Certificate_Camden.pdf',
    notes: 'Dual RCD consumer unit installed. All circuits tested satisfactory.'
  },
  {
    id: 'cert-epc-london',
    property_id: 'prop-london-01',
    type: 'epc',
    certificate_number: '9840-0012-3456-7890-1122',
    issue_date: '2024-03-01',
    expiry_date: '2034-02-28',
    status: 'valid',
    rating: 'B (82)',
    engineer_or_assessor: 'Green Energy Assessors Ltd',
    file_path: '/uploads/demo-epc-london.pdf',
    file_name: 'EPC_Rating_B_Camden.pdf',
    notes: 'High efficiency double glazing and combi heating. Fully compliant with MEES.'
  },
  {
    id: 'cert-smoke-london',
    property_id: 'prop-london-01',
    type: 'smoke_co',
    certificate_number: 'SMK-LON-2025-06',
    issue_date: '2025-06-01',
    expiry_date: '2026-06-01',
    status: 'valid',
    rating: 'Pass',
    engineer_or_assessor: 'Marcus Holloway (Landlord Check-in)',
    file_path: null,
    file_name: null,
    notes: 'Aico optical smoke alarm in hallway and heat alarm in kitchen tested. CO alarm tested in utility cupboard.'
  },
  {
    id: 'cert-cp12-mcr',
    property_id: 'prop-mcr-02',
    type: 'gas_safety',
    certificate_number: 'CP12-MCR-2025-11',
    issue_date: '2025-11-20',
    expiry_date: '2026-11-19',
    status: 'expiring_soon',
    rating: 'Pass / Safe',
    engineer_or_assessor: 'Northern Gas Techs (Gas Safe #440112)',
    file_path: '/uploads/demo-cp12-mcr.pdf',
    file_name: 'CP12_Manchester_HMO.pdf',
    notes: 'Annual check due immediately. Commercial sized system boiler in basement.'
  },
  {
    id: 'cert-eicr-mcr',
    property_id: 'prop-mcr-02',
    type: 'eicr',
    certificate_number: 'EICR-MCR-2022-77',
    issue_date: '2022-08-15',
    expiry_date: '2027-08-14',
    status: 'valid',
    rating: 'Satisfactory',
    engineer_or_assessor: 'MCR City Sparkies Ltd',
    file_path: '/uploads/demo-eicr-mcr.pdf',
    file_name: 'EICR_Manchester_HMO.pdf',
    notes: 'Emergency lighting and interlinked fire alarm panel included in 5-year check.'
  },
  {
    id: 'cert-epc-mcr',
    property_id: 'prop-mcr-02',
    type: 'epc',
    certificate_number: '0123-4567-8901-2345-6789',
    issue_date: '2021-09-12',
    expiry_date: '2031-09-11',
    status: 'valid',
    rating: 'D (65)',
    engineer_or_assessor: 'Northwest EPC Surveys',
    file_path: '/uploads/demo-epc-mcr.pdf',
    file_name: 'EPC_Rating_D_Manchester.pdf',
    notes: 'Band D complies with current MEES min E. Loft insulation topped up.'
  },
  {
    id: 'cert-hmo-mcr',
    property_id: 'prop-mcr-02',
    type: 'hmo_licence',
    certificate_number: 'MCC-HMO-2024-8841',
    issue_date: '2024-02-01',
    expiry_date: '2029-01-31',
    status: 'valid',
    rating: 'Licensed (Max 5 Occupants)',
    engineer_or_assessor: 'Manchester City Council Private Rented Team',
    file_path: '/uploads/demo-hmo-mcr.pdf',
    file_name: 'HMO_Mandatory_Licence_MCC.pdf',
    notes: '5-year licence granted for 4 unrelated student/professional occupants.'
  },
  {
    id: 'cert-cp12-bristol',
    property_id: 'prop-bristol-03',
    type: 'gas_safety',
    certificate_number: 'CP12-BRS-2025-10',
    issue_date: '2025-10-10',
    expiry_date: '2026-10-09',
    status: 'expired',
    rating: 'Expired - Urgent Renewal',
    engineer_or_assessor: 'Avon Gas Services',
    file_path: null,
    file_name: null,
    notes: 'OVERDUE! Urgent check required to avoid Health & Safety prosecution.'
  },
  {
    id: 'cert-epc-bristol',
    property_id: 'prop-bristol-03',
    type: 'epc',
    certificate_number: '1122-3344-5566-7788-9900',
    issue_date: '2022-04-18',
    expiry_date: '2032-04-17',
    status: 'valid',
    rating: 'C (74)',
    engineer_or_assessor: 'South West Energy Ratings',
    file_path: '/uploads/demo-epc-bristol.pdf',
    file_name: 'EPC_Rating_C_Bristol.pdf',
    notes: 'Valid until 2032. Cavity wall insulation and modern combi boiler.'
  }
];

export const SEED_TASKS = [
  {
    id: 'tsk-bristol-gas-overdue',
    property_id: 'prop-bristol-03',
    tenancy_id: 'ten-bristol-03',
    type: 'certificate_renewal',
    title: 'URGENT: Gas Safety CP12 Certificate Expired',
    description: 'The annual Gas Safety Certificate expired on 09 Oct 2026. Book a Gas Safe registered engineer immediately to conduct annual CP12 check and provide copy to Eleanor Ward within 28 days.',
    due_date: '2026-10-09',
    status: 'overdue',
    priority: 'urgent',
    source_rule_id: 'rule-gas-safety',
    reminder_60d_sent: 1,
    reminder_30d_sent: 1,
    reminder_7d_sent: 1,
    completed_at: null
  },
  {
    id: 'tsk-mcr-gas-due',
    property_id: 'prop-mcr-02',
    tenancy_id: 'ten-mcr-02',
    type: 'certificate_renewal',
    title: 'Renew Annual Gas Safety Certificate (CP12)',
    description: 'Gas safety inspection expires in 24 hours. Contact Northern Gas Techs to execute check for 28 Oxford Grove.',
    due_date: '2026-11-19',
    status: 'due_soon',
    priority: 'high',
    source_rule_id: 'rule-gas-safety',
    reminder_60d_sent: 1,
    reminder_30d_sent: 1,
    reminder_7d_sent: 1,
    completed_at: null
  },
  {
    id: 'tsk-rra-phase1-all',
    property_id: 'prop-london-01',
    tenancy_id: 'ten-london-01',
    type: 'information_sheet',
    title: 'Serve Mandatory Renters\' Rights Information Sheet',
    description: 'Serve the updated statutory Information Sheet to Sophie Taylor and Oliver Evans to comply with Renters\' Rights Act Phase 1 transition.',
    due_date: '2026-05-01',
    status: 'pending',
    priority: 'high',
    source_rule_id: 'rule-info-sheet',
    reminder_60d_sent: 0,
    reminder_30d_sent: 0,
    reminder_7d_sent: 0,
    completed_at: null
  },
  {
    id: 'tsk-prs-database-reg',
    property_id: 'prop-london-01',
    tenancy_id: null,
    type: 'prs_database',
    title: 'Register Property on New National PRS Database',
    description: 'Prepare documentation and safety certificates for registration on the government PRS Database platform prior to regional enforcement date.',
    due_date: '2026-10-01',
    status: 'pending',
    priority: 'medium',
    source_rule_id: 'rule-prs-database',
    reminder_60d_sent: 0,
    reminder_30d_sent: 0,
    reminder_7d_sent: 0,
    completed_at: null
  },
  {
    id: 'tsk-rent-review-bristol',
    property_id: 'prop-bristol-03',
    tenancy_id: 'ten-bristol-03',
    type: 'rent_review',
    title: 'Annual Rent Review Window Opens (Section 13)',
    description: 'Rent was last adjusted on 01 Nov 2025. You are legally eligible to propose a new market rent using statutory Form 4 with a minimum 2-month notice period.',
    due_date: '2026-11-01',
    status: 'due_soon',
    priority: 'medium',
    source_rule_id: 'rule-rent-increase-process',
    reminder_60d_sent: 1,
    reminder_30d_sent: 1,
    reminder_7d_sent: 0,
    completed_at: null
  },
  {
    id: 'tsk-smoke-check-london',
    property_id: 'prop-london-01',
    tenancy_id: 'ten-london-01',
    type: 'alarm_test',
    title: 'Annual Smoke & Carbon Monoxide Alarm Working Verification',
    description: 'Test all alarms, replace backup 9V batteries, and document functioning status in compliance with Smoke & CO Alarm Regulations 2022.',
    due_date: '2026-06-01',
    status: 'pending',
    priority: 'medium',
    source_rule_id: 'rule-smoke-co-alarms',
    reminder_60d_sent: 0,
    reminder_30d_sent: 0,
    reminder_7d_sent: 0,
    completed_at: null
  }
];

export const SEED_REGULATION_UPDATES = [
  {
    id: 'upd-rra-phase1-date',
    title: 'Renters\' Rights Act: Phase 1 Transition Date Confirmed for 1 May 2026',
    summary: 'The Ministry of Housing, Communities and Local Government has formally confirmed the transition date. Fixed-term ASTs will convert automatically to periodic tenancies across England without exception.',
    topic: 'Renters Rights Act Phase 1',
    effective_date: '2026-05-01',
    affected_regions: 'England (All Local Authorities)',
    impact_severity: 'high',
    source_url: 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill',
    actions_required: JSON.stringify([
      'Audit existing tenancy agreements for unlawful lock-in clauses or automatic renewal penalties',
      'Download the official new statutory Information Sheet',
      'Ensure all rent increase plans follow the 2-month Section 13 notice window'
    ]),
    broadcast_sent: 1
  },
  {
    id: 'upd-prs-database-rollout',
    title: 'PRS Database: Pilot Launch in Greater London & West Midlands Announced',
    summary: 'The digital landlord and property database portal opens for early voluntary onboarding from Autumn 2026 ahead of mandatory enforcement in 2027.',
    topic: 'PRS Database & Ombudsman',
    effective_date: '2026-10-01',
    affected_regions: 'Greater London, West Midlands, Greater Manchester',
    impact_severity: 'medium',
    source_url: 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill/guide-to-the-renters-rights-bill#private-rented-sector-database',
    actions_required: JSON.stringify([
      'Verify digital copies of Gas Safety (CP12), EICR, and EPC are saved in your Document Vault',
      'Prepare landlord identity verification documents',
      'Review membership details for the upcoming Mandatory Ombudsman Scheme'
    ]),
    broadcast_sent: 1
  },
  {
    id: 'upd-awaabs-law-prs',
    title: 'Awaab\'s Law Guidance Published for Private Landlords',
    summary: 'Statutory timelines published: damp and mould hazards must be physically inspected within 14 calendar days, emergency structural or health risks resolved within 24 hours.',
    topic: 'Awaabs Law & Decent Homes',
    effective_date: '2026-05-01',
    affected_regions: 'England (All Local Authorities)',
    impact_severity: 'high',
    source_url: 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill/guide-to-the-renters-rights-bill#decent-homes-standard-and-awaabs-law',
    actions_required: JSON.stringify([
      'Establish written repair protocol with approved local contractors',
      'Use the LandlordReady Repair Tracker to log all incoming tenant notices and photo evidence',
      'Provide emergency 24-hour contact details to active tenants'
    ]),
    broadcast_sent: 1
  }
];

export const SEED_SUBSCRIPTIONS = [
  {
    id: 'sub-demo-01',
    user_id: 'usr-demo-landlord-01',
    plan_id: 'portfolio',
    status: 'active',
    current_period_start: '2026-11-01T00:00:00Z',
    current_period_end: '2026-12-01T00:00:00Z',
    cancel_at_period_end: 0,
    properties_limit: 5,
    price_amount: 19.00,
    billing_cycle: 'monthly'
  }
];

export const SEED_ORDERS = [
  {
    id: 'ord-inv-2026-1101',
    user_id: 'usr-demo-landlord-01',
    subscription_id: 'sub-demo-01',
    amount: 19.00,
    currency: 'GBP',
    status: 'paid',
    invoice_number: 'LR-INV-2026-0049',
    invoice_url: '#',
    description: 'Portfolio Plan (Up to 5 properties) - Monthly Billing'
  }
];
