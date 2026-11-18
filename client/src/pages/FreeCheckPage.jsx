import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, 
  ExternalLink, ArrowRight, ArrowLeft, Download, Mail, Building, 
  FileCheck, HelpCircle, Lock, RefreshCw, Sparkles, Scale, Info
} from 'lucide-react';
import { api } from '../services/api';
import { ScoreGauge } from '../components/ScoreGauge';
import { downloadComplianceReportPDF } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';

export function FreeCheckPage({ setActiveTab, onCompleteSave }) {
  // Wizard state
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [checkId, setCheckId] = useState(null);

  // Email capture state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [captureEmail, setCaptureEmail] = useState('');
  const [landlordName, setLandlordName] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Form answers
  const [answers, setAnswers] = useState({
    country: 'England',
    postcode: 'SW1A 1AA',
    property_type: 'Terraced',
    bedrooms: 2,
    tenancy_start_date: '2025-04-01',
    tenancy_type: 'periodic', // 'periodic' or 'fixed_ast'
    deposit_taken: true,
    deposit_protected: true,
    prescribed_info_given: true,
    information_sheet_given: false, // Default demonstrating RRA check
    has_gas: true,
    gas_cert_date: '2025-10-15', // Might be expiring or expired
    eicr_date: '2023-04-10',
    epc_rating: 'D',
    epc_date: '2022-01-15',
    smoke_co_alarms: true,
    is_hmo: false,
    licensing_area: 'unknown',
    rent_last_increased_date: '2025-01-10',
    prs_database_registered: false
  });

  const [activeListTab, setActiveListTab] = useState('red');

  const updateAnswer = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (answers.country !== 'England') {
      return; // stopped by jurisdiction gate
    }
    if (step < 5) {
      setStep(step + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else {
      submitAudit();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const submitAudit = async () => {
    setSubmitting(true);
    try {
      const res = await api.submitCheck(answers);
      setResult(res.evaluation);
      setCheckId(res.check_id);
      setStep(6); // Results view
      window.scrollTo({ top: 80, behavior: 'smooth' });

      if (res.evaluation.score >= 80) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err) {
      alert('Error running compliance check: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async (e) => {
    if (e) e.preventDefault();
    if (!captureEmail) {
      setEmailModalOpen(true);
      return;
    }
    setDownloadingPdf(true);
    try {
      if (checkId) {
        await api.saveCheckEmail(checkId, captureEmail, landlordName);
        setEmailSaved(true);
      }
      downloadComplianceReportPDF(result, answers, captureEmail, landlordName);
      setEmailModalOpen(false);
    } catch (err) {
      console.error(err);
      downloadComplianceReportPDF(result, answers, captureEmail, landlordName);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>Free 2-Minute Diagnostic • England Tenancies Only</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          "Am I Compliant?"
        </h1>
        <p className="mt-2 text-slate-600 text-sm leading-relaxed">
          Check your properties against the <strong>Renters' Rights Act 2025/2026</strong> and all statutory safety obligations in England. Get an instant score (0–100), plain-English fixes, and exact statutory penalties.
        </p>
      </div>

      {step <= 5 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          {/* Progress Bar */}
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                {step}
              </span>
              <span>Step {step} of 5</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-900 font-semibold">
                {step === 1 && 'Jurisdiction & Location'}
                {step === 2 && 'Tenancy Structure & Rent'}
                {step === 3 && 'Deposit & Information Sheet'}
                {step === 4 && 'Safety Certificates (CP12, EICR, EPC, Alarms)'}
                {step === 5 && 'HMO, Licensing & PRS Database'}
              </span>
            </div>
            <span className="text-xs text-sky-600 font-medium">No login required</span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* STEP 1: Jurisdiction & Property */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">
                    Where is the rental property located?
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Important: Housing law is strictly devolved. LandlordReady is calibrated exclusively for England.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['England', 'Wales', 'Scotland', 'Northern Ireland'].map((country) => (
                      <button
                        key={country}
                        type="button"
                        onClick={() => updateAnswer('country', country)}
                        className={`p-3 rounded-xl border text-left text-sm font-semibold transition-all ${
                          answers.country === country
                            ? country === 'England'
                              ? 'border-sky-600 bg-sky-50 text-sky-950 ring-2 ring-sky-600/20'
                              : 'border-red-500 bg-red-50 text-red-950 ring-2 ring-red-500/20'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span>{country}</span>
                          {answers.country === country && country === 'England' && (
                            <CheckCircle2 className="w-4 h-4 text-sky-600" />
                          )}
                          {answers.country === country && country !== 'England' && (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal block">
                          {country === 'England' ? 'Supported jurisdiction' : 'Separate legal framework'}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Devolution Warning Banner */}
                  {answers.country !== 'England' && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
                      <div className="flex items-center space-x-2 font-bold text-sm text-amber-950">
                        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <span>Devolved Housing Law: Stop & Advice</span>
                      </div>
                      <p>
                        The Renters' Rights Act and the regulations checked by LandlordReady apply <strong>strictly in England</strong>. 
                        {answers.country === 'Wales' && ' Residential lettings in Wales are governed by the Renting Homes (Wales) Act 2016 and standard occupation contracts.'}
                        {answers.country === 'Scotland' && ' Private tenancies in Scotland are governed by the Private Housing (Tenancies) (Scotland) Act 2016.'}
                        {answers.country === 'Northern Ireland' && ' Tenancies in NI are governed by the Private Tenancies (Northern Ireland) Order 2006.'}
                      </p>
                      <p className="font-semibold text-amber-950">
                        Please consult a local legal professional qualified in {answers.country}.
                      </p>
                    </div>
                  )}
                </div>

                {answers.country === 'England' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Property Postcode (England)
                      </label>
                      <input
                        type="text"
                        value={answers.postcode}
                        onChange={(e) => updateAnswer('postcode', e.target.value.toUpperCase())}
                        placeholder="e.g. M14 5RT or NW1 9HL"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Property Type
                      </label>
                      <select
                        value={answers.property_type}
                        onChange={(e) => updateAnswer('property_type', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                      >
                        <option value="Terraced">Terraced House</option>
                        <option value="Semi-Detached">Semi-Detached House</option>
                        <option value="Detached">Detached House</option>
                        <option value="Flat / Apartment">Flat / Purpose-Built Flat</option>
                        <option value="Converted Flat">Converted Victorian / Period Flat</option>
                        <option value="Maisonette">Maisonette</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Tenancy Structure & Rent */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">
                    What is the current tenancy structure?
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Under Renters' Rights Act Phase 1 (from 1 May 2026), fixed terms are abolished.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateAnswer('tenancy_type', 'periodic')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        answers.tenancy_type === 'periodic'
                          ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-600/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-sm mb-1 flex items-center justify-between">
                        <span>Periodic / Rolling Monthly Tenancy</span>
                        {answers.tenancy_type === 'periodic' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                      </div>
                      <p className="text-xs text-slate-600">
                        Monthly rolling contract. Aligned with the Renters' Rights Act periodic framework.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateAnswer('tenancy_type', 'fixed_ast')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        answers.tenancy_type === 'fixed_ast'
                          ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-600/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-sm mb-1 flex items-center justify-between">
                        <span>Fixed-Term AST (e.g. 6 or 12 months)</span>
                        {answers.tenancy_type === 'fixed_ast' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                      </div>
                      <p className="text-xs text-slate-600">
                        Traditional AST with a fixed end date. Will automatically convert to periodic on 1 May 2026.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tenancy Start Date
                    </label>
                    <input
                      type="date"
                      value={answers.tenancy_start_date}
                      onChange={(e) => updateAnswer('tenancy_start_date', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      When was rent last increased?
                    </label>
                    <input
                      type="date"
                      value={answers.rent_last_increased_date}
                      onChange={(e) => updateAnswer('rent_last_increased_date', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Under RRA rules, rent can only be increased once every 12 months using Form 4.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Deposit & Information Sheet */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-900">
                      Did you take a security deposit?
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => updateAnswer('deposit_taken', true)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${answers.deposit_taken ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => updateAnswer('deposit_taken', false)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${!answers.deposit_taken ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                      >
                        No Deposit
                      </button>
                    </div>
                  </div>

                  {answers.deposit_taken && (
                    <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={answers.deposit_protected}
                          onChange={(e) => updateAnswer('deposit_protected', e.target.checked)}
                          className="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            Protected in an authorized scheme within 30 days
                          </span>
                          <span className="text-[11px] text-slate-600">
                            Registered with DPS, TDS, or MyDeposits within 30 calendar days of receipt.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={answers.prescribed_info_given}
                          onChange={(e) => updateAnswer('prescribed_info_given', e.target.checked)}
                          className="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            Statutory Prescribed Information & Scheme Leaflet served on tenant
                          </span>
                          <span className="text-[11px] text-slate-600">
                            Official scheme certificate signed by landlord and served within 30 days.
                          </span>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-bold text-slate-900 mb-1">
                    Did you provide the mandatory statutory Information Sheet / "How to Rent" guide?
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Under the Renters' Rights Act, failure to serve the official Information Sheet before move-in invalidates eviction under Section 8 and risks £7,000 civil fines.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateAnswer('information_sheet_given', true)}
                      className={`p-3.5 rounded-xl border text-left font-semibold text-sm transition-all ${
                        answers.information_sheet_given
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/20'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span>Yes, Served & Confirmed</span>
                        {answers.information_sheet_given && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal block">Written receipt on file</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateAnswer('information_sheet_given', false)}
                      className={`p-3.5 rounded-xl border text-left font-semibold text-sm transition-all ${
                        !answers.information_sheet_given
                          ? 'border-red-500 bg-red-50 text-red-950 ring-2 ring-red-500/20'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span>No / Not Sure</span>
                        {!answers.information_sheet_given && <AlertTriangle className="w-4 h-4 text-red-600" />}
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal block">High risk of invalidating notice</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Safety Certificates */}
            {step === 4 && (
              <div className="space-y-6">
                {/* Gas Safety */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                        Gas Safety Certificate (CP12)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Annual statutory requirement for all gas appliances & flues.
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => updateAnswer('has_gas', true)}
                        className={`px-3 py-1 rounded text-xs font-semibold ${answers.has_gas ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                      >
                        Gas Present
                      </button>
                      <button
                        type="button"
                        onClick={() => updateAnswer('has_gas', false)}
                        className={`px-3 py-1 rounded text-xs font-semibold ${!answers.has_gas ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                      >
                        All Electric
                      </button>
                    </div>
                  </div>

                  {answers.has_gas && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Date of Last Gas Safety Check (CP12)
                      </label>
                      <input
                        type="date"
                        value={answers.gas_cert_date}
                        onChange={(e) => updateAnswer('gas_cert_date', e.target.value)}
                        className="w-full sm:w-64 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  )}
                </div>

                {/* EICR */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                      Electrical Safety (EICR - 5 Year)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Electrical Installation Condition Report by registered electrician. Max £30,000 fine for non-compliance.
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date of Most Recent EICR Inspection
                    </label>
                    <input
                      type="date"
                      value={answers.eicr_date}
                      onChange={(e) => updateAnswer('eicr_date', e.target.value)}
                      className="w-full sm:w-64 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* EPC & Alarms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      EPC Energy Rating (Band A to G)
                    </label>
                    <select
                      value={answers.epc_rating}
                      onChange={(e) => updateAnswer('epc_rating', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                      <option value="A">Band A (Highest Efficiency)</option>
                      <option value="B">Band B</option>
                      <option value="C">Band C (Proposed future benchmark)</option>
                      <option value="D">Band D</option>
                      <option value="E">Band E (Current Minimum Legal Standard)</option>
                      <option value="F">Band F (ILLEGAL to let without exemption)</option>
                      <option value="G">Band G (ILLEGAL to let without exemption)</option>
                      <option value="UNKNOWN">Unknown / Not on register</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Smoke & Carbon Monoxide Alarms
                    </label>
                    <label className="flex items-center space-x-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={answers.smoke_co_alarms}
                        onChange={(e) => updateAnswer('smoke_co_alarms', e.target.checked)}
                        className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                      />
                      <span className="text-xs text-slate-700">
                        Working smoke on every floor & CO in rooms with combustion appliances, tested on tenancy start date.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: HMO, Licensing & PRS Database */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="text-sm font-bold text-slate-900 block">
                        Is this property a House in Multiple Occupation (HMO)?
                      </label>
                      <span className="text-xs text-slate-500">
                        Let to 5+ individuals from 2+ households sharing bathroom or kitchen facilities.
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => updateAnswer('is_hmo', true)}
                        className={`px-3 py-1 rounded text-xs font-semibold ${answers.is_hmo ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                      >
                        Yes (HMO)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateAnswer('is_hmo', false)}
                        className={`px-3 py-1 rounded text-xs font-semibold ${!answers.is_hmo ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                      >
                        No (Single Family)
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Local Authority Licensing Status (Selective or Additional Licensing)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Many London boroughs and city councils require selective licences for every private rental.
                  </p>
                  <select
                    value={answers.licensing_area}
                    onChange={(e) => updateAnswer('licensing_area', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="compliant">Licensed & Compliant (or not required by council)</option>
                    <option value="unknown">Unknown / Not checked with local council</option>
                    <option value="selective">Selective Licensing designated area (Unlicensed)</option>
                    <option value="additional">Additional Licensing area (Unlicensed)</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      National PRS Database (Phase 2 Status)
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                      Rolling Out By Area
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Under the Renters' Rights Act Phase 2, all landlords and rental dwellings in England must register on the government's centralized Private Rented Sector Database. Early pilot onboarding is live in selected regions (London, West Midlands, Manchester).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Previous Step
              </button>
            ) : <div />}

            <button
              type="button"
              disabled={answers.country !== 'England' || submitting}
              onClick={handleNext}
              className={`inline-flex items-center text-xs font-bold px-5 py-2.5 rounded-xl text-white shadow-md transition-all ${
                answers.country !== 'England'
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/20 hover:scale-[1.02]'
              }`}
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Legislation...
                </>
              ) : step === 5 ? (
                <>
                  Calculate Compliance Score
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: AUDIT RESULTS DISPLAY */}
      {step === 6 && result && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Score Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Score Gauge */}
              <div className="flex justify-center md:border-r md:border-slate-100 pr-0 md:pr-6">
                <ScoreGauge score={result.score} size={170} />
              </div>

              {/* Summary Text */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    England Housing Compliance Report
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    result.score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    result.score >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {result.overall_status}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                  {result.score >= 85 ? 'Strong Compliance Foundation' :
                   result.score >= 60 ? 'Remedial Action Required' :
                   'High Financial & Legal Exposure'}
                </h2>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {result.summary}
                </p>

                {/* PDF Report Trigger Button */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setEmailModalOpen(true)}
                    className="inline-flex items-center text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4 mr-2 text-sky-400" />
                    Download Full Report PDF
                  </button>

                  <button
                    onClick={() => {
                      if (onCompleteSave) onCompleteSave(answers, result);
                      setActiveTab('properties');
                    }}
                    className="inline-flex items-center text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Add Property to LandlordReady Vault
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Tabs: Red / Amber / Green */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
              <button
                onClick={() => setActiveListTab('red')}
                className={`flex-1 py-3.5 px-4 text-center border-b-2 flex items-center justify-center space-x-2 transition-colors ${
                  activeListTab === 'red'
                    ? 'border-red-600 bg-white text-red-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Critical Breaches ({result.red_count})</span>
              </button>

              <button
                onClick={() => setActiveListTab('amber')}
                className={`flex-1 py-3.5 px-4 text-center border-b-2 flex items-center justify-center space-x-2 transition-colors ${
                  activeListTab === 'amber'
                    ? 'border-amber-600 bg-white text-amber-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Upcoming Deadlines ({result.amber_count})</span>
              </button>

              <button
                onClick={() => setActiveListTab('green')}
                className={`flex-1 py-3.5 px-4 text-center border-b-2 flex items-center justify-center space-x-2 transition-colors ${
                  activeListTab === 'green'
                    ? 'border-emerald-600 bg-white text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Fully Compliant ({result.green_count})</span>
              </button>
            </div>

            <div className="p-6">
              {/* RED LIST */}
              {activeListTab === 'red' && (
                <div className="space-y-4">
                  {result.red_items.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      <p className="font-semibold text-slate-800">No critical statutory breaches detected!</p>
                      <p>Your property complies with core possession and safety requirements.</p>
                    </div>
                  ) : (
                    result.red_items.map((item) => (
                      <div key={item.id} className="p-4 sm:p-5 rounded-xl border border-red-200 bg-red-50/40 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start space-x-2.5">
                            <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                              <p className="text-xs text-slate-600 mt-0.5">{item.issue}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded whitespace-nowrap">
                            Statutory Breach
                          </span>
                        </div>

                        {/* Plain-English Fix */}
                        <div className="p-3 rounded-lg bg-white border border-red-100 text-xs text-slate-700 space-y-1">
                          <strong className="text-slate-900 block font-semibold">How to fix (Plain English):</strong>
                          <p>{item.plain_english_fix}</p>
                        </div>

                        {/* Statutory Penalty & Source */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pt-1 border-t border-red-100 gap-2">
                          <div className="text-red-700 font-semibold">
                            ⚠️ Potential Penalty: <span className="font-bold text-red-900">{item.penalty}</span>
                          </div>
                          {item.source_url && (
                            <a
                              href={item.source_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-sky-700 hover:text-sky-900 font-semibold text-[11px]"
                            >
                              Official GOV.UK Source <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* AMBER LIST */}
              {activeListTab === 'amber' && (
                <div className="space-y-4">
                  {result.amber_items.map((item) => (
                    <div key={item.id} className="p-4 sm:p-5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-2.5">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                            <p className="text-xs text-slate-600 mt-0.5">{item.issue}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded whitespace-nowrap">
                          Action Advised
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-white border border-amber-100 text-xs text-slate-700">
                        <strong className="text-slate-900 block font-semibold">Action needed:</strong>
                        <p>{item.plain_english_fix}</p>
                      </div>

                      {item.source_url && (
                        <div className="text-right">
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-sky-700 hover:text-sky-900 font-semibold text-[11px]"
                          >
                            GOV.UK Guidance <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* GREEN LIST */}
              {activeListTab === 'green' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.green_items.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">{item.status_desc}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                          {item.rule_topic}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reset / Check another property */}
          <div className="text-center pt-4">
            <button
              onClick={() => {
                setStep(1);
                setResult(null);
              }}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-4"
            >
              ← Test another property or adjust answers
            </button>
          </div>
        </div>
      )}

      {/* Email Capture & PDF Export Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Download Full Compliance Audit PDF
            </h3>
            <p className="text-xs text-slate-600 mt-1 mb-4 leading-relaxed">
              We'll prepare your formatted executive PDF report including penalty summaries, statutory references, and plain-English action items.
            </p>

            <form onSubmit={handleDownloadPdf} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Full Name / Entity
                </label>
                <input
                  type="text"
                  required
                  value={landlordName}
                  onChange={(e) => setLandlordName(e.target.value)}
                  placeholder="e.g. Marcus Holloway"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address for Report
                </label>
                <input
                  type="email"
                  required
                  value={captureEmail}
                  onChange={(e) => setCaptureEmail(e.target.value)}
                  placeholder="marcus@example.co.uk"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={downloadingPdf}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center"
                >
                  {downloadingPdf ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Export PDF Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
