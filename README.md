# LandlordReady: Compliance Autopilot for Private Landlords in England

**LandlordReady** is an end-to-end statutory compliance autopilot specifically engineered for small private landlords in England (1–10 properties, self-managing). It provides automated tracking, legal document generation, statutory calendar alerts, and a rules-only AI legal assistant covering the **Renters' Rights Act 2025/2026** reforms and all recurring safety obligations in England.

---

## 🏛️ Legislative Scope & Jurisdiction
- **Jurisdiction:** **England only** (with active devolution gatekeepers that detect and advise users from Wales, Scotland, and Northern Ireland regarding their separate statutory regimes).
- **Primary Legislation Covered:**
  - **Renters' Rights Act 2025/2026 Phase 1 (Effective 1 May 2026):** Simultaneous transition of ASTs into periodic tenancies, complete abolition of Section 21 no-fault evictions, reformed Section 8 grounds, statutory 2-month Section 13 (Form 4) rent increase procedures, statutory tenant pet rights with 42-day determination windows, and mandatory Information Sheet service.
  - **Renters' Rights Act Phase 2 (Rollout):** Mandatory registration on the new national Private Rented Sector (PRS) Database and compulsory membership in the Landlord Ombudsman Scheme.
  - **Awaab's Law Extension to the PRS:** Strict statutory timelines for damp, mould, and emergency hazard investigation (24-hour emergency response, 14-day physical investigation, 7-day work start).
  - **Statutory Safety Obligations:**
    - Gas Safety (Installation and Use) Regulations 1998 (CP12 annual check)
    - Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020 (EICR 5-year check)
    - Energy Performance of Buildings (England and Wales) Regulations (EPC Band E minimum under MEES)
    - Smoke and Carbon Monoxide Alarm (England) Regulations 2015 & 2022 Amendment
    - Housing Act 2004 (Tenancy Deposit Protection in DPS/TDS/MyDeposits & strict 30-day Prescribed Information)
    - Housing Act 2004 Mandatory HMO Licensing & Local Authority Selective Licensing schemes

---

## ⚡ Core Feature Flows

### 1. Free "Am I Compliant?" Diagnostic Check (The Hook)
- **Zero-friction 2-minute diagnostic wizard** requiring no initial login.
- Detailed questions covering jurisdiction, tenancy start date, tenancy structure, deposit protection & prescribed info, mandatory Information Sheet, Gas Safety CP12 dates, EICR dates, EPC rating, smoke/CO alarms, HMO status, council selective licensing, rent review dates, and national PRS Database status.
- **Dynamic Scoring Engine (0–100):**
  - **Red List:** Immediate statutory breaches (e.g. unserved Information Sheet, expired Gas CP12, Band F/G EPC, unprotected deposit) with exact potential penalties (up to £30,000 civil penalty, Rent Repayment Orders, invalid Section 8 notice) and verified GOV.UK links.
  - **Amber List:** Upcoming deadlines and actions advised (e.g. 30-day gas safety expiry, regional PRS Database rollout).
  - **Green List:** Verified compliant obligations.
- **Email Lead Capture & Client-Side PDF Generation:** Instant download of a formatted **Executive Compliance Audit Report PDF** and 1-click option to save the property directly into LandlordReady.

### 2. Account & Properties Management (Document Vault)
- Manage portfolio properties with postcode lookup, local authority, bedrooms, HMO classification, and council licensing.
- Log tenancies with tenant names, contact details, start dates, monthly rent, and deposit protection references.
- **Encrypted Document Vault per property:** Upload and manage CP12 certificates, EICR reports, EPC certificates, HMO licences, and photographic alarm logs with expiration countdowns.

### 3. Compliance Calendar & Automated Reminders
- Auto-generated statutory calendar tasks: Gas CP12 annual renewals, 5-year EICR, EPC renewals, PRS Database annual registrations, rent review eligibility windows, and 30-day deposit prescribed information deadlines.
- **Automated Email Reminder Simulation (60 / 30 / 7 Days):**
  - Run the simulation daemon to inspect 60-day early notices, 30-day urgent alerts, and 7-day final breach warnings with formatted email body previews.

### 4. Statutory Document Generator
- Pre-seeded DB templates populated directly with live property and tenancy data:
  1. **Periodic Tenancy Agreement Compliance Checklist** (Aligned to Renters' Rights Act rules)
  2. **Section 13 Rent Increase Notice (Form 4)** with 2 months' notice calculation and market comparables
  3. **Landlord Response to Tenant Pet Request** (Conditional approval with pet insurance clause or lawful grounds for refusal within 42 days)
  4. **Awaab's Law PRS Repair & Damp Hazard Log** (Statutory 24h, 14-day, and 7-day milestones)
  5. **Mandatory Tenant Information Pack Receipt** (Proof of service for How to Rent, EPC, CP12, EICR)
- **Always links official GOV.UK forms and publications directly** where statutory forms are required by law.

### 5. "Can I Do This?" Legal Assistant
- Interactive compliance assistant answering landlord scenarios (rent increases, selling the property, pet requests, rent arrears, ending tenancies, property inspections, damp/mould repairs).
- **Strictly answers ONLY from the rules database** with legislative citations and official GOV.UK links.
- Explains procedural steps and strict statutory deadlines.
- **Explicitly flags when to instruct a qualified solicitor** (e.g. contested tribunal disputes, County Court possession proceedings, disrepair counterclaims).
- **Persistent Q&A Audit Log per property:** Saves every query and answer to provide an unassailable audit trail.

### 6. Regulation Updates Feed & Admin Broadcast
- Real-time statutory developments feed: confirmed Renters' Rights Act phase dates, regional PRS Database expansions, and consultation updates.
- **Admin Broadcast Simulator:** Post a regulatory update to automatically create new compliance calendar tasks across affected portfolio properties.

### 7. Multi-Property Dashboard & Compliance Pack PDF Export
- Portfolio-wide health gauge, average score, overdue strict liability items count, and properties grid.
- **Export "Compliance Pack" PDF per property:** One-click generation of a comprehensive, lender-ready, buyer-ready, insurer-ready, and tribunal-ready evidence pack summarizing property details, tenancies, deposit protection proof, and safety certificates.

### 8. Pricing & Subscriptions
- **Free:** Compliance check + score + PDF report.
- **Starter (£7/mo or £70/yr):** 1 Property fully tracked with reminders and document generator.
- **Portfolio (£19/mo or £190/yr):** Up to 5 Properties with multi-property dashboard and compliance pack PDF exports.
- **Pro (£39/mo or £390/yr):** Up to 15 Properties with priority legal rules support and HMO licensing tools.
- **Annual Plans:** Include 2 months free.
- **14-day free trial on all paid plans.**
- Order receipts and invoice history tracking.

---

## 🗄️ Database Architecture (SQLite with WAL Mode)
The system uses SQLite via `better-sqlite3` stored in `data/landlordready.db` with WAL mode enabled:
1. `profiles`: Landlord entity, subscription tier, trial status
2. `properties`: Addresses, postcode, local authority, HMO, licensing status, compliance score
3. `tenancies`: Tenant details (JSON), start date, monthly rent, deposit metadata (JSON)
4. `certificates`: CP12, EICR, EPC, Smoke/CO test records with expiry dates and file vault links
5. `tasks`: Auto-generated statutory obligations with 60d/30d/7d reminder dispatch markers
6. `documents`: Generated notices, checklists, and uploaded vault records
7. `templates`: Pre-seeded legal templates with GOV.UK form URLs and field schemas
8. `qa_logs`: Time-stamped questions, answers, cited rule IDs, and solicitor flags
9. `regulation_updates`: Statutory notices, affected regions, and action items
10. `rules`: Seeded England rules with phase, effective date, rule text, penalty, source URL, and verified status
11. `checks`: Free diagnostic check answers, scores, and lead capture records
12. `subscriptions`: Active plan, properties limit, billing cycle, and period dates
13. `orders`: Invoices, VAT receipts, and payment logs

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)

### Development Mode (Concurrent Server & Client)
```bash
# Run server on port 5000 and client on port 5173 concurrently:
npm run dev
```

### Production Mode
```bash
# Build the client bundle:
npm run build

# Start the unified server (serves API on port 5000 and client frontend):
npm start
```
Visit **http://localhost:5000** in your browser.

### Run System Test Suite
```bash
node test_system.js
```
Runs 30 automated integration tests verifying rules seeding, compliance calculations, devolution gatekeeper, document generator, "Can I Do This?" assistant, and PDF pack exports.
