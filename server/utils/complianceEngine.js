// Compliance Calculation & Rules Verification Engine for England

export function evaluateCompliance(answers, rulesList = []) {
  // If jurisdiction is not England, return immediate stop result
  const country = (answers.country || 'England').trim().toLowerCase();
  if (country !== 'england') {
    return {
      allowed: false,
      jurisdiction_error: true,
      country: answers.country,
      message: `LandlordReady compliance autopilot is strictly calibrated for residential tenancies in England. ${answers.country} is subject to distinct devolved legislation (e.g., Renting Homes (Wales) Act 2016, Private Housing (Tenancies) (Scotland) Act 2016, or NI Private Tenancies Order). Please consult legal counsel in your respective home nation.`,
      score: 0,
      red_items: [],
      amber_items: [],
      green_items: []
    };
  }

  const red = [];
  const amber = [];
  const green = [];

  let score = 100;

  // Helper to find rule
  const findRule = (topicMatch) => {
    return rulesList.find(r => r.topic.toLowerCase().includes(topicMatch.toLowerCase())) || {
      penalty: 'Statutory financial penalty and restriction on Section 8 possession.',
      source_url: 'https://www.gov.uk/renting-out-a-property/landlord-responsibilities'
    };
  };

  const now = new Date('2026-11-18'); // system reference date

  // 1. Tenancy Type & Periodic Conversion (Renters Rights Act 2025/2026)
  const periodicRule = findRule('periodic');
  if (answers.tenancy_type === 'fixed_ast') {
    score -= 10;
    amber.push({
      id: 'chk-periodic-transition',
      title: 'Fixed-Term Tenancy Transition Notice',
      issue: 'You reported an ongoing fixed-term Assured Shorthold Tenancy (AST). Under the Renters\' Rights Act Phase 1 (effective 1 May 2026), fixed terms are abolished.',
      plain_english_fix: 'Your tenancy will automatically convert to a monthly periodic tenancy by statute on 1 May 2026. Review your tenancy agreement to remove illegal renewal fees or lock-in penalty clauses.',
      penalty: 'Attempting to enforce unlawful fixed lock-in periods breaches the Tenant Fees Act 2019 (civil penalty up to £5,000 for initial breach, up to £30,000 for repeated breach).',
      source_url: periodicRule.source_url,
      severity: 'AMBER'
    });
  } else {
    green.push({
      id: 'chk-periodic-ok',
      title: 'Periodic Tenancy Model Aligned',
      status_desc: 'Operating on a rolling periodic structure compliant with the new Renters\' Rights Act framework.',
      rule_topic: 'Periodic Tenancies'
    });
  }

  // 2. Deposit Protection & Prescribed Information
  const depositRule = findRule('deposit');
  if (answers.deposit_taken) {
    if (!answers.deposit_protected) {
      score -= 25;
      red.push({
        id: 'chk-deposit-unprotected',
        title: 'Tenancy Deposit Is Not Protected in an Authorized Scheme',
        issue: 'You took a financial deposit but it has not been registered in an approved government scheme (DPS, TDS, or MyDeposits).',
        plain_english_fix: 'Protect the deposit immediately in an approved custodial or insurance scheme. Under the Housing Act 2004, deposits must be registered within 30 days of receipt.',
        penalty: depositRule.penalty,
        source_url: depositRule.source_url,
        statutory_deadline: 'Strict 30 days from receipt',
        severity: 'RED'
      });
    } else if (!answers.prescribed_info_given) {
      score -= 15;
      red.push({
        id: 'chk-deposit-prescribed-info',
        title: 'Statutory Prescribed Information Not Served to Tenant',
        issue: 'Even though the deposit is registered, the official Prescribed Information certificate and scheme leaflet have not been signed and served on the tenant.',
        plain_english_fix: 'Generate the scheme\'s official Prescribed Information document, counter-sign it, and serve it to all named tenants with written proof of receipt.',
        penalty: 'County court can award the tenant 1x to 3x the deposit amount in compensation, and bars service of valid Section 8 possession notices.',
        source_url: depositRule.source_url,
        statutory_deadline: 'Within 30 days of receiving deposit',
        severity: 'RED'
      });
    } else {
      green.push({
        id: 'chk-deposit-compliant',
        title: 'Deposit Protected & Prescribed Information Served',
        status_desc: 'Deposit safely lodged in approved scheme with statutory documentation provided to tenants.',
        rule_topic: 'Tenancy Deposit Protection'
      });
    }
  }

  // 3. Information Sheet / How to Rent Guide
  const infoSheetRule = findRule('information sheet');
  if (!answers.information_sheet_given) {
    score -= 15;
    red.push({
      id: 'chk-info-sheet-missing',
      title: 'Mandatory Information Sheet / How to Rent Booklet Not Provided',
      issue: 'You have not served the statutory government Information Sheet before or at the start of the tenancy.',
      plain_english_fix: 'Download and serve the current official statutory Information Sheet / How to Rent guide immediately by email with read receipt or countersigned letter.',
      penalty: infoSheetRule.penalty,
      source_url: infoSheetRule.source_url,
      statutory_deadline: 'Mandatory before or on day 1 of tenancy',
      severity: 'RED'
    });
  } else {
    green.push({
      id: 'chk-info-sheet-ok',
      title: 'Statutory Information Sheet Served',
      status_desc: 'Official tenancy information served to tenants, protecting possession enforcement.',
      rule_topic: 'Information Sheet Requirement'
    });
  }

  // 4. Gas Safety Certificate (CP12)
  const gasRule = findRule('gas');
  if (answers.has_gas) {
    if (!answers.gas_cert_date) {
      score -= 25;
      red.push({
        id: 'chk-gas-missing',
        title: 'Missing or Unconfirmed Gas Safety Certificate (CP12)',
        issue: 'The property contains gas appliances (e.g. boiler, cooker, fire) but no valid annual Gas Safety check is on record.',
        plain_english_fix: 'Commission an urgent inspection by a Gas Safe registered engineer. Provide the resulting CP12 record to the tenant within 28 days and retain your copy for 2 years.',
        penalty: gasRule.penalty,
        source_url: gasRule.source_url,
        statutory_deadline: 'Annual check (every 12 months)',
        severity: 'RED'
      });
    } else {
      const gasDate = new Date(answers.gas_cert_date);
      const diffMonths = (now.getFullYear() - gasDate.getFullYear()) * 12 + (now.getMonth() - gasDate.getMonth());
      if (diffMonths > 12) {
        score -= 25;
        red.push({
          id: 'chk-gas-expired',
          title: 'Gas Safety Certificate (CP12) Is Expired / Overdue',
          issue: `Your last CP12 gas inspection was on ${answers.gas_cert_date}, which is older than 12 months.`,
          plain_english_fix: 'Book a Gas Safe engineer immediately. Gas safety is a strict criminal liability obligation in England under the Gas Safety (Installation and Use) Regulations 1998.',
          penalty: gasRule.penalty,
          source_url: gasRule.source_url,
          statutory_deadline: 'Expired - Renew immediately',
          severity: 'RED'
        });
      } else if (diffMonths >= 11) {
        score -= 5;
        amber.push({
          id: 'chk-gas-expiring',
          title: 'Gas Safety Certificate Expiring Within 30 Days',
          issue: `Your CP12 certificate expires soon (issued ${answers.gas_cert_date}).`,
          plain_english_fix: 'Schedule your annual inspection with a Gas Safe engineer now to maintain continuous coverage.',
          source_url: gasRule.source_url,
          severity: 'AMBER'
        });
      } else {
        green.push({
          id: 'chk-gas-valid',
          title: 'Gas Safety Certificate (CP12) In Date',
          status_desc: `Inspected within the past 12 months (${answers.gas_cert_date}) by Gas Safe engineer.`,
          rule_topic: 'Gas Safety (CP12)'
        });
      }
    }
  }

  // 5. Electrical Safety Standards (EICR)
  const eicrRule = findRule('eicr');
  if (!answers.eicr_date) {
    score -= 20;
    red.push({
      id: 'chk-eicr-missing',
      title: 'Missing Electrical Installation Condition Report (EICR)',
      issue: 'No 5-year electrical safety inspection is logged for the property.',
      plain_english_fix: 'Arrange an electrical safety inspection by a qualified, registered electrician (e.g. NICEIC, NAPIT). Remedial works for any C1/C2 codes must be finished within 28 days.',
      penalty: eicrRule.penalty,
      source_url: eicrRule.source_url,
      statutory_deadline: 'Mandatory every 5 years',
      severity: 'RED'
    });
  } else {
    const eicrDate = new Date(answers.eicr_date);
    const diffYears = (now.getFullYear() - eicrDate.getFullYear()) + (now.getMonth() - eicrDate.getMonth()) / 12;
    if (diffYears > 5) {
      score -= 20;
      red.push({
        id: 'chk-eicr-expired',
        title: 'EICR Electrical Inspection Is Expired',
        issue: `Your EICR test was conducted on ${answers.eicr_date}, exceeding the 5-year statutory maximum under the 2020 Regulations.`,
        plain_english_fix: 'Book a full periodic inspection and testing of fixed wiring with a certified electrician.',
        penalty: eicrRule.penalty,
        source_url: eicrRule.source_url,
        statutory_deadline: '5-year expiry breached',
        severity: 'RED'
      });
    } else {
      green.push({
        id: 'chk-eicr-valid',
        title: 'EICR Electrical Inspection Valid',
        status_desc: `Fixed wiring tested within the 5-year legal requirement (${answers.eicr_date}).`,
        rule_topic: 'Electrical Safety (EICR)'
      });
    }
  }

  // 6. Energy Performance Certificate (EPC)
  const epcRule = findRule('epc');
  const epcRating = (answers.epc_rating || '').toUpperCase();
  if (['F', 'G'].includes(epcRating)) {
    score -= 25;
    red.push({
      id: 'chk-epc-substandard',
      title: 'Sub-Standard EPC Rating (Band F or G)',
      issue: `Letting a domestic private rental property with an EPC rating of ${epcRating} is unlawful under MEES Regulations 2015 without an approved statutory exemption.`,
      plain_english_fix: 'Commission energy efficiency improvements (e.g. insulation, heating controls) to bring the rating to Band E or higher, or register an exemption on the PRS Exemptions Register.',
      penalty: epcRule.penalty,
      source_url: epcRule.source_url,
      statutory_deadline: 'Immediate - Unlawful to let without exemption',
      severity: 'RED'
    });
  } else if (!epcRating || epcRating === 'UNKNOWN') {
    score -= 10;
    amber.push({
      id: 'chk-epc-unknown',
      title: 'EPC Rating Unknown or Unconfirmed',
      issue: 'You have not confirmed an active Energy Performance Certificate for this dwelling.',
      plain_english_fix: 'Check the government EPC Register (find-energy-certificate.service.gov.uk) to verify the property rating and 10-year expiry date.',
      source_url: epcRule.source_url,
      severity: 'AMBER'
    });
  } else {
    green.push({
      id: 'chk-epc-compliant',
      title: `EPC Compliant (Band ${epcRating})`,
      status_desc: `Meets current Minimum Energy Efficiency Standard (MEES) band E or higher.`,
      rule_topic: 'Energy Performance (EPC)'
    });
  }

  // 7. Smoke and Carbon Monoxide Alarms
  const alarmRule = findRule('smoke');
  if (!answers.smoke_co_alarms) {
    score -= 15;
    red.push({
      id: 'chk-alarms-noncompliant',
      title: 'Smoke and Carbon Monoxide Alarms Inadequate / Untested',
      issue: 'Under the Smoke and Carbon Monoxide Alarm (England) Regulations 2022, you must have working smoke alarms on each storey, CO alarms in rooms with combustion appliances, and test them on tenancy day 1.',
      plain_english_fix: 'Fit required alarms immediately and record a written test log with tenant confirmation.',
      penalty: alarmRule.penalty,
      source_url: alarmRule.source_url,
      statutory_deadline: 'Tested on start date & kept in working order',
      severity: 'RED'
    });
  } else {
    green.push({
      id: 'chk-alarms-ok',
      title: 'Smoke & Carbon Monoxide Alarms Verified',
      status_desc: 'Installed on all required storeys and rooms with written test confirmation.',
      rule_topic: 'Smoke and Carbon Monoxide Alarms'
    });
  }

  // 8. HMO & Selective Licensing
  const hmoRule = findRule('hmo');
  if (answers.is_hmo && answers.licensing_area !== 'compliant') {
    score -= 20;
    red.push({
      id: 'chk-hmo-licence-risk',
      title: 'HMO Licensing Compliance Verification Required',
      issue: 'You noted this property is an HMO (multiple households sharing amenities). Letting an HMO without a mandatory or additional licence is a strict liability criminal offence.',
      plain_english_fix: 'Submit a licensing application to your local housing authority immediately. Once a valid application is submitted, you are legally protected from prosecution.',
      penalty: hmoRule.penalty,
      source_url: hmoRule.source_url,
      statutory_deadline: 'Application must be submitted prior to occupation',
      severity: 'RED'
    });
  } else if (answers.licensing_area === 'unknown') {
    score -= 5;
    amber.push({
      id: 'chk-licensing-unknown',
      title: 'Local Authority Selective Licensing Status Unknown',
      issue: 'Many councils in England operate Selective or Additional licensing schemes by postcode or ward.',
      plain_english_fix: 'Check your local council\'s private rented sector licensing webpage for this postcode to confirm if a selective licence is required.',
      source_url: 'https://www.gov.uk/house-in-multiple-occupation-licence',
      severity: 'AMBER'
    });
  } else {
    green.push({
      id: 'chk-licensing-ok',
      title: 'Property Licensing Status Accounted For',
      status_desc: 'Licensing requirements reviewed and compliant with local authority designations.',
      rule_topic: 'HMO & Selective Licensing'
    });
  }

  // 9. Rent Increase Frequency & Notice Procedure
  const rentIncRule = findRule('rent increase');
  if (answers.rent_last_increased_date) {
    const incDate = new Date(answers.rent_last_increased_date);
    const monthsSince = (now.getFullYear() - incDate.getFullYear()) * 12 + (now.getMonth() - incDate.getMonth());
    if (monthsSince < 12) {
      amber.push({
        id: 'chk-rent-inc-window',
        title: 'Rent Increase Restriction Window Active',
        issue: `Rent was increased on ${answers.rent_last_increased_date} (${monthsSince} months ago). Under Renters\' Rights Act rules, rent increases are limited to once every 12 months.`,
        plain_english_fix: `You cannot increase rent until ${12 - monthsSince} months from now. When eligible, you must serve statutory Form 4 with 2 months minimum notice.`,
        source_url: rentIncRule.source_url,
        severity: 'AMBER'
      });
    } else {
      green.push({
        id: 'chk-rent-inc-eligible',
        title: 'Eligible for Annual Rent Review',
        status_desc: 'More than 12 months have elapsed since last review. Form 4 notice procedure with 2 months notice can be utilized.',
        rule_topic: 'Rent Increase Process'
      });
    }
  }

  // 10. PRS Database Status (Phase 2 Rolling Out)
  const prsRule = findRule('prs database');
  amber.push({
    id: 'chk-prs-db-rollout',
    title: 'PRS National Database: Regional Roll-out Status',
    issue: 'The mandatory Private Rented Sector (PRS) Database is rolling out in phases across England. All landlords and properties will be required to register.',
    plain_english_fix: 'Ensure your safety certificates (Gas, EICR, EPC) are organized and digitised. LandlordReady will alert you when your local authority area opens for registration.',
    source_url: prsRule.source_url,
    severity: 'AMBER'
  });

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  let overall_status = 'Fully Protected';
  if (red.length > 0) {
    overall_status = red.length >= 2 ? 'At Critical Legal Risk' : 'Needs Immediate Remedial Action';
  } else if (amber.length > 0) {
    overall_status = 'Action Advised / Upcoming Deadlines';
  }

  return {
    allowed: true,
    jurisdiction_error: false,
    score,
    overall_status,
    red_count: red.length,
    amber_count: amber.length,
    green_count: green.length,
    red_items: red,
    amber_items: amber,
    green_items: green,
    summary: `Your property achieved a Compliance Score of ${score}/100. There are ${red.length} high-risk statutory items requiring immediate remediation to avoid fines up to £30,000+ or loss of possession rights.`
  };
}
