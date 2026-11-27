import React, { useState } from 'react';
import { 
  ShieldCheck, ArrowRight, Sparkles, CheckCircle2, AlertTriangle, 
  FileText, Calendar, Building, Download, HelpCircle, Star, Scale, 
  ChevronRight, Lock, Clock, ExternalLink, Flame, Zap, Award
} from 'lucide-react';

export function LandingPage({ setActiveTab }) {
  const [activeScenario, setActiveScenario] = useState('rent');

  const scenarios = {
    rent: {
      question: "Can I raise the rent by 12% next month?",
      answer: "Under the Renters' Rights Act, rent review clauses are void. You can ONLY increase rent once every 12 months using statutory Section 13 (Form 4). You MUST give at least 2 full months' notice proposing open market rent.",
      penalty: "Unlawful increases are void. Tenants can challenge at First-tier Tribunal.",
      tag: "Form 4 Section 13"
    },
    pet: {
      question: "My tenant asked to keep a dog. Can I say no?",
      answer: "You cannot issue blanket bans. You must respond in writing within 42 days. You can only refuse on reasonable statutory grounds (e.g., superior lease ban). You can legally require the tenant to hold pet damage insurance.",
      penalty: "Unreasonable refusal can be sanctioned by the Landlord Ombudsman.",
      tag: "42-Day Statutory Window"
    },
    sale: {
      question: "Can I sell the property and evict the tenant with Section 21?",
      answer: "NO. Section 21 no-fault eviction is abolished. To sell, you must use reformed Section 8 Ground 1A. However, Ground 1A CANNOT be used during the first 12 months of tenancy and requires 4 months' statutory notice.",
      penalty: "Illegal eviction carries criminal liability, unlimited fines, and £30,000 civil penalty.",
      tag: "Reformed Section 8 Ground 1A"
    },
    arrears: {
      question: "Tenant is 2 months behind on rent. Can I evict immediately?",
      answer: "Under the new law, mandatory possession under Ground 8 requires at least 3 months' arrears (up from 2 months) both at notice service and court hearing, with 4 weeks' notice. Always verify no disrepair claims exist.",
      penalty: "Defective notice will be struck out by County Court with costs.",
      tag: "Mandatory Ground 8 (3 Months)"
    }
  };

  return (
    <div className="bg-warm-canvas min-h-screen text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 border-b border-slate-200/80">
        {/* Decorative subtle ambient gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-amber-100/40 via-sky-50/30 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pinterest Luxury Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-sm text-xs font-semibold text-slate-800 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="tracking-wide uppercase text-[10px] font-bold text-slate-500">
                England Housing Law
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-900 font-serif italic text-xs">
                Renters' Rights Act 2025/2026 Ready
              </span>
            </div>

            {/* Editorial Serif Headline */}
            <h1 className="text-4xl sm:text-6xl font-serif font-extrabold text-slate-950 tracking-tight leading-[1.1]">
              Sleep soundly.<br />
              <span className="font-display italic font-normal text-slate-800">
                Let England compliance run on autopilot.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-sans font-normal">
              Section 21 is abolished. Fixed terms are gone. Civil penalties reach <strong className="text-slate-900 font-semibold">£30,000+</strong> plus 24-month Rent Repayment Orders. LandlordReady gives self-managing private landlords in England an automated compliance calendar, statutory document generator, and legal concierge.
            </p>

            {/* Dual CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={() => setActiveTab('free-check')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-2xl bg-slate-950 text-white font-semibold text-sm shadow-xl shadow-slate-900/15 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all group"
              >
                <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>Check My Property Free (2 Mins)</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-white text-slate-800 font-semibold text-sm border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <Building className="w-4 h-4 text-slate-500" />
                <span>Explore Live Portfolio Demo</span>
              </button>
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero login required for score</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified GOV.UK legal sources</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>14-day free trial on paid plans</span>
              </div>
            </div>
          </div>

          {/* 2. PINTEREST MOODBOARD / BENTO HERO VISUAL */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              {/* Card 1: Main Portfolio Status (Large Left Bento) */}
              <div className="md:col-span-7 editorial-card p-6 sm:p-8 flex flex-col justify-between bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Live Compliance Status
                      </span>
                    </div>
                    <span className="text-xs font-serif font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Protected 365 Days
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-slate-950">
                        14b Camden Road
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        London NW1 9HL • Camden Council • 2 Bed Flat
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-serif font-extrabold text-slate-900">
                        94<span className="text-sm font-sans font-medium text-slate-400">/100</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                        Full Compliance
                      </span>
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-medium text-slate-700">Gas CP12 Valid (to Apr 2027)</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-medium text-slate-700">EICR 5-Year Tested (Band Sat)</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-medium text-slate-700">Deposit In DPS (£2,250)</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-medium text-slate-700">Periodic Agreement Aligned</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Tenants: Sophie Taylor & Oliver Evans</span>
                  <span className="font-semibold text-slate-900">£1,950 / month</span>
                </div>
              </div>

              {/* Card 2 & 3: Right Stacked Bento */}
              <div className="md:col-span-5 flex flex-col gap-5">
                {/* Statutory Notice Preview */}
                <div className="editorial-card p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                      <span className="uppercase font-bold tracking-wider text-[10px] text-amber-400">
                        Official Form Generator
                      </span>
                      <span>Section 13 (Form 4)</span>
                    </div>

                    <h4 className="font-serif text-lg font-bold text-white leading-snug">
                      Statutory Rent Increase Notice
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Auto-computes required 2-month notice window and attaches market rent evidence under Renters' Rights Act rules.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Direct GOV.UK Form 4 Link</span>
                    <span className="text-emerald-400 font-semibold flex items-center">
                      Auto-Populated <ArrowRight className="w-3 h-3 ml-1" />
                    </span>
                  </div>
                </div>

                {/* 60/30/7-Day Radar */}
                <div className="editorial-card p-6 bg-[#FAF7F0] border border-[#E8DFC8] flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">
                      Proactive Alerts
                    </span>
                    <Clock className="w-4 h-4 text-amber-700" />
                  </div>

                  <div>
                    <div className="font-serif font-bold text-slate-900 text-base">
                      60 • 30 • 7-Day Warning Radar
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Never wake up to an expired Gas Safety CP12 or missed deposit prescribed info deadline.
                    </p>
                  </div>

                  <div className="mt-3 flex items-center space-x-2 text-[11px] font-semibold text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Email & In-App Alerts Synchronized</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE 2026 RENTERS' RIGHTS ACT SHAKEUP: WHY SPREADSHEETS FAIL */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
            England Private Rented Sector Reforms
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-950 tracking-tight">
            The old way of managing tenancies is now dangerous.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The Renters' Rights Act shifts strict liability onto private landlords. Here is what happens when you manage via memory or spreadsheets vs LandlordReady.
          </p>
        </div>

        {/* Editorial Comparison Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Nightmare Box */}
          <div className="rounded-3xl p-7 bg-red-50/50 border border-red-200/80 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                ✕
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-red-950">
                  Manual Spreadsheets & Memory
                </h3>
                <p className="text-xs text-red-800">High risk of catastrophic statutory fines</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start">
                <span className="text-red-600 font-bold mr-2 text-sm">✕</span>
                <span><strong>Missed Information Sheet:</strong> Section 8 possession order legally barred in court; civil fine up to £7,000.</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 font-bold mr-2 text-sm">✕</span>
                <span><strong>Section 21 Served:</strong> Notice is completely void. Tenant remains; landlord faces harassment/eviction prosecution.</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 font-bold mr-2 text-sm">✕</span>
                <span><strong>Invalid Rent Increase:</strong> Informal rent hikes challenged at First-tier Tribunal; landlord ordered to repay excess.</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 font-bold mr-2 text-sm">✕</span>
                <span><strong>Expired Gas CP12:</strong> Unlimited criminal fine and up to 6 months imprisonment under 1998 Regulations.</span>
              </li>
            </ul>
          </div>

          {/* Autopilot Box */}
          <div className="rounded-3xl p-7 bg-white border border-emerald-300 shadow-md space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-950">
                  LandlordReady Compliance Autopilot
                </h3>
                <p className="text-xs text-emerald-700 font-semibold">100% statutory England alignment</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Information Sheet Tracked:</strong> Proof of delivery receipt generated before move-in to safeguard possession.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Reformed Section 8 Guidance:</strong> Statutory Ground 1A (sale) & Ground 8 thresholds guided with solicitor triggers.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Official Form 4 Notice:</strong> 2 months statutory notice auto-calculated with comparable market rent justification.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>60/30/7-Day Radar:</strong> CP12, EICR, EPC, and PRS Database renewals logged and notified with zero delays.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE "CAN I DO THIS?" LIVE SHOWCASE */}
      <section className="py-20 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Statutory Concierge</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
              "Can I do this?"
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select any real-world landlord scenario to see how LandlordReady answers strictly from the rules table with statutory steps and solicitor caveats:
            </p>
          </div>

          {/* Scenario Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'rent', label: 'Raise Rent by 12%' },
              { id: 'pet', label: 'Tenant Wants a Dog' },
              { id: 'sale', label: 'Sell Property & Evict' },
              { id: 'arrears', label: 'Tenant in 2 Months Arrears' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveScenario(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeScenario === tab.id
                    ? 'bg-white text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scenario Answer Card */}
          <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-sky-400" />
                <h3 className="font-serif font-bold text-lg text-white">
                  "{scenarios[activeScenario].question}"
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                {scenarios[activeScenario].tag}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {scenarios[activeScenario].answer}
            </p>

            <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-300 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-red-200 block font-semibold">Statutory Legal Penalty:</strong>
                <span>{scenarios[activeScenario].penalty}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Logged to property audit trail</span>
              <button
                onClick={() => setActiveTab('can-i-do-this')}
                className="text-sky-400 hover:text-sky-300 font-semibold flex items-center"
              >
                Ask Custom Question in App <ChevronRight className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL PINTEREST BENTO: CORE CAPABILITIES */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Engineered For England Self-Managers
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-950 tracking-tight">
            Everything in one high-precision vault.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="editorial-card p-7 space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-xl text-slate-950">Compliance Calendar</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Auto-generates every task: Gas CP12 annual inspections, EICR 5-year wiring checks, EPC renewals, and statutory 30-day deposit prescribed info countdowns.
              </p>
            </div>
            <div className="text-xs text-sky-600 font-semibold flex items-center pt-2">
              <span>Includes 60/30/7-day email alerts</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="editorial-card p-7 space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-xl text-slate-950">Statutory Document Generator</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Create official Section 13 Form 4 rent notices, pet response determinations, and Awaab's Law damp logs filled directly from your property database.
              </p>
            </div>
            <div className="text-xs text-indigo-600 font-semibold flex items-center pt-2">
              <span>Always links official GOV.UK forms</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="editorial-card p-7 space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-xl text-slate-950">1-Click Compliance Packs</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Instantly compile an unassailable PDF evidence pack summarizing property licensing, active certificates, tenancy records, and statutory declarations.
              </p>
            </div>
            <div className="text-xs text-emerald-600 font-semibold flex items-center pt-2">
              <span>Ready for lenders, insurers & buyers</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="py-20 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-slate-950 tracking-tight">
          Find out where your properties stand today.
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Take the free 2-minute compliance check. Get your 0–100 score, complete Red/Amber/Green penalty list, and printable audit PDF.
        </p>

        <div className="pt-2">
          <button
            onClick={() => setActiveTab('free-check')}
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-slate-950 text-white font-bold text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Launch Free 2-Minute Diagnostic</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </section>
    </div>
  );
}
