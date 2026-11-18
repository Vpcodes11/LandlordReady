import { jsPDF } from 'jspdf';

export function downloadComplianceReportPDF(evaluation, answers, email = '', name = '') {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  });

  const primaryColor = [15, 23, 42]; // slate-900
  const accentColor = [2, 132, 199]; // sky-600
  const redColor = [220, 38, 38]; // red-600
  const amberColor = [217, 119, 6]; // amber-600
  const greenColor = [22, 163, 74]; // green-600
  const grayColor = [100, 116, 139]; // slate-500

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('LandlordReady', 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text('England Residential Tenancy Compliance Audit | Renters\' Rights Act Aligned', 14, 23);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} | Jurisdiction: England`, 14, 29);

  // Score Badge in Header
  doc.setFillColor(evaluation.score >= 80 ? 22 : (evaluation.score >= 50 ? 217 : 220), evaluation.score >= 80 ? 163 : (evaluation.score >= 50 ? 119 : 38), evaluation.score >= 80 ? 74 : (evaluation.score >= 50 ? 6 : 38));
  doc.roundedRect(155, 7, 42, 24, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${evaluation.score}/100`, 176, 18, { align: 'center' });
  doc.setFontSize(7.5);
  doc.text('COMPLIANCE SCORE', 176, 25, { align: 'center' });

  let y = 48;

  // Property Details Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('AUDIT SUMMARY & PROPERTY DATA', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);
  doc.text(`Postcode: ${answers.postcode || 'Recorded'} | Type: ${answers.property_type || 'Residential'} | HMO: ${answers.is_hmo ? 'Yes' : 'No'}`, 18, y + 12);
  doc.text(`Client: ${name || 'Private Landlord'} (${email || 'Self-Managing'}) | Status: ${evaluation.overall_status}`, 18, y + 18);

  y += 32;

  // Summary Metrics Pills
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(14, y, 56, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...redColor);
  doc.setFontSize(9);
  doc.text(`CRITICAL BREACHES: ${evaluation.red_count}`, 18, y + 9);

  doc.setFillColor(254, 243, 199);
  doc.roundedRect(77, y, 56, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...amberColor);
  doc.text(`ATTENTION NEEDED: ${evaluation.amber_count}`, 81, y + 9);

  doc.setFillColor(240, 253, 244);
  doc.roundedRect(140, y, 56, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...greenColor);
  doc.text(`COMPLIANT ITEMS: ${evaluation.green_count}`, 144, y + 9);

  y += 22;

  // Section: Red Items (Breaches & Penalties)
  if (evaluation.red_items && evaluation.red_items.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...redColor);
    doc.text('CRITICAL LEGAL BREACHES & STATUTORY PENALTIES', 14, y);
    y += 5;

    for (const item of evaluation.red_items) {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(14, y, 182, 30, 2, 2, 'FD');

      // Left bar
      doc.setFillColor(...redColor);
      doc.rect(14, y, 3, 30, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...primaryColor);
      doc.text(item.title, 20, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const issueLines = doc.splitTextToSize(item.issue, 170);
      doc.text(issueLines.slice(0, 2), 20, y + 11);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...redColor);
      doc.setFontSize(7.5);
      const penaltyText = `Statutory Penalty: ${item.penalty}`;
      const penaltyLines = doc.splitTextToSize(penaltyText, 170);
      doc.text(penaltyLines.slice(0, 2), 20, y + 20);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...accentColor);
      doc.text(`Official Guidance: ${item.source_url}`, 20, y + 27);

      y += 34;
    }
  }

  // Section: Amber Items (Upcoming Actions)
  if (evaluation.amber_items && evaluation.amber_items.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...amberColor);
    doc.text('UPCOMING STATUTORY DEADLINES & WARNINGS', 14, y);
    y += 5;

    for (const item of evaluation.amber_items) {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(253, 230, 138);
      doc.roundedRect(14, y, 182, 22, 2, 2, 'FD');

      doc.setFillColor(...amberColor);
      doc.rect(14, y, 3, 22, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...primaryColor);
      doc.text(item.title, 20, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const fixLines = doc.splitTextToSize(`Action: ${item.plain_english_fix}`, 170);
      doc.text(fixLines.slice(0, 2), 20, y + 12);

      doc.setTextColor(...accentColor);
      doc.setFontSize(7.5);
      doc.text(`Authority: ${item.source_url}`, 20, y + 19);

      y += 26;
    }
  }

  // Footer Disclaimer
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text('Disclaimer: This report is generated by LandlordReady compliance engine based on user inputs and verified England housing legislation. It does not constitute formal legal advice. Where possession proceedings or contested tribunal disputes arise, instruct a qualified solicitor.', 14, 285, { maxWidth: 182 });

  doc.save(`LandlordReady-Compliance-Audit-${answers.postcode || 'England'}.pdf`);
}

export function downloadCompliancePackPDF(pack) {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  });

  const prop = pack.property;
  const primary = [15, 23, 42];
  const accent = [2, 132, 199];

  // Header Cover
  doc.setFillColor(...primary);
  doc.rect(0, 0, 210, 48, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('STATUTORY COMPLIANCE PACK', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);
  doc.text(`Official Portfolio Evidence for Lenders, Insurers, Buyers & Tribunals`, 14, 28);
  doc.text(`Property: ${prop.address_line1}, ${prop.city} ${prop.postcode}`, 14, 36);
  doc.text(`Local Housing Authority: ${prop.local_authority || 'England'} | Jurisdiction: England`, 14, 42);

  let y = 58;

  // Property Overview Table
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 34, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primary);
  doc.text('1. PROPERTY PROFILE & STATUTORY STATUS', 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Property Type: ${prop.property_type} | Bedrooms: ${prop.bedrooms} | HMO Classification: ${prop.hmo ? 'Yes (HMO)' : 'Standard Dwelling'}`, 18, y + 15);
  doc.text(`Licensing Designation: ${prop.licensing_type.toUpperCase()} | Status: ${prop.licensing_status.toUpperCase()}`, 18, y + 22);
  doc.text(`PRS National Database Status: ${prop.prs_database_status.toUpperCase()} | Portfolio Score: ${prop.compliance_score}/100`, 18, y + 29);

  y += 42;

  // Active Tenancies
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primary);
  doc.text('2. TENANCY AGREEMENT & DEPOSIT PROTECTION SUMMARY', 14, y);
  y += 6;

  if (pack.tenancies && pack.tenancies.length > 0) {
    for (const t of pack.tenancies) {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, 182, 30, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...primary);
      const tenantNames = (t.tenants || []).map(tn => tn.name).join(', ');
      doc.text(`Tenant(s): ${tenantNames} | Structure: Statutory Periodic`, 18, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Commencement Date: ${t.start_date} | Monthly Rent: £${t.rent_amount.toFixed(2)} | Rent Review Window: Annual (Sec 13)`, 18, y + 13);
      doc.text(`Deposit Amount: £${t.deposit.amount} | Protected Scheme: ${t.deposit.scheme}`, 18, y + 19);
      doc.text(`Deposit Reference: ${t.deposit.deposit_ref} | Prescribed Information Served: ${t.deposit.prescribed_info_given ? 'YES (Countersigned)' : 'PENDING'}`, 18, y + 25);

      y += 34;
    }
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No active tenancy record logged.', 18, y + 6);
    y += 12;
  }

  y += 4;

  // Safety Certificates Matrix
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primary);
  doc.text('3. STATUTORY SAFETY & CERTIFICATION MATRIX', 14, y);
  y += 6;

  if (pack.certificates && pack.certificates.length > 0) {
    for (const c of pack.certificates) {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, 182, 18, 2, 2, 'FD');

      const isExpired = c.status === 'expired';
      doc.setFillColor(isExpired ? 220 : 22, isExpired ? 38 : 163, isExpired ? 38 : 74);
      doc.rect(14, y, 3, 18, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primary);
      doc.text(`${c.type.toUpperCase().replace('_', ' ')}: Ref ${c.certificate_number || 'N/A'} - Rating: ${c.rating || 'Satisfactory'}`, 20, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Issued: ${c.issue_date} | Expiry: ${c.expiry_date} | Status: ${c.status.toUpperCase()} | Engineer: ${c.engineer_or_assessor || 'Qualified Professional'}`, 20, y + 13);

      y += 22;
    }
  }

  // Statutory Statement & Signature
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primary);
  doc.text('LANDLORD STATUTORY DECLARATION', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('I confirm that the certificates, tenancy records, and safety test records contained in this pack represent a true and accurate compliance log for the aforementioned residential property in accordance with the Housing Act 1988, the Renters\' Rights Act, and applicable safety regulations.', 14, y + 6, { maxWidth: 182 });

  doc.text('Signed: __________________________________   Date: ________________________', 14, y + 24);

  doc.save(`Compliance-Pack-${prop.postcode.replace(/\s+/g, '_')}.pdf`);
}
