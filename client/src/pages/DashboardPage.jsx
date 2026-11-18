import React, { useState } from 'react';
import { 
  Building, CheckCircle2, AlertTriangle, ShieldAlert, 
  Calendar, FileText, ArrowRight, Download, Plus, 
  Sparkles, ShieldCheck, ChevronRight, RefreshCw, Home
} from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';
import { downloadCompliancePackPDF } from '../utils/pdfGenerator';
import { api } from '../services/api';

export function DashboardPage({ properties, tasks, setActiveTab, onSelectProperty, onRefresh }) {
  const [exportingId, setExportingId] = useState(null);

  // Compute portfolio statistics
  const totalProps = properties.length;
  const avgScore = totalProps > 0 
    ? Math.round(properties.reduce((acc, p) => acc + (p.compliance_score || 0), 0) / totalProps)
    : 100;

  const overdueTasks = tasks.filter(t => t.status === 'overdue');
  const dueSoonTasks = tasks.filter(t => t.status === 'due_soon');

  const handleExportPack = async (propertyId) => {
    setExportingId(propertyId);
    try {
      const res = await api.getPropertyPack(propertyId);
      downloadCompliancePackPDF(res.pack);
    } catch (err) {
      alert('Error exporting compliance pack: ' + err.message);
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Portfolio Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Portfolio Compliance Autopilot
            </h1>
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
              Active Protection
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking {totalProps} properties in England against the Renters' Rights Act 2025/2026 and safety standards.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('properties')}
            className="inline-flex items-center text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Property
          </button>
          <button
            onClick={() => setActiveTab('free-check')}
            className="inline-flex items-center text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <ShieldCheck className="w-4 h-4 mr-1.5 text-sky-600" />
            Run Free Check
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Average Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Portfolio Health
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{avgScore}</span>
              <span className="text-xs font-medium text-slate-400">/ 100</span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1.5 inline-block ${
              avgScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {avgScore >= 80 ? 'Robust Coverage' : 'Attention Needed'}
            </span>
          </div>
          <div className="w-16 h-16">
            <ScoreGauge score={avgScore} size={64} strokeWidth={7} />
          </div>
        </div>

        {/* Metric 2: Overdue Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Overdue Actions
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-red-600">{overdueTasks.length}</span>
              <span className="text-xs text-slate-400">strict liability</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {overdueTasks.length > 0 ? 'Fines & Section 8 ban risk' : 'Zero overdue items'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Upcoming Deadlines */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Due Next 30 Days
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-amber-600">{dueSoonTasks.length}</span>
              <span className="text-xs text-slate-400">renewals</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Automated reminders active
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Properties Registered */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Managed Properties
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{totalProps}</span>
              <span className="text-xs text-slate-400">of 5 allowance</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Self-managing portfolio
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Home className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Critical Overdue Banner (if any) */}
      {overdueTasks.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-950">
                Action Required: {overdueTasks[0].title}
              </h4>
              <p className="text-xs text-red-800 mt-0.5">
                {overdueTasks[0].description} (Due on {overdueTasks[0].due_date})
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('calendar')}
            className="inline-flex items-center text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl whitespace-nowrap shadow-sm transition-colors"
          >
            Resolve in Calendar
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>
        </div>
      )}

      {/* Properties Matrix */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Portfolio Properties</h2>
            <p className="text-xs text-slate-500">Live compliance status and certificate validity per property</p>
          </div>
          <button
            onClick={() => setActiveTab('properties')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center"
          >
            Manage All Properties <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map((property) => {
            const certs = property.certificates || [];
            const gasCert = certs.find(c => c.type === 'gas_safety');
            const eicrCert = certs.find(c => c.type === 'eicr');
            const epcCert = certs.find(c => c.type === 'epc');

            const score = property.compliance_score || 85;

            return (
              <div 
                key={property.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {property.property_type} • {property.bedrooms} Bed
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {property.address_line1}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {property.city}, {property.postcode}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-extrabold px-2 py-0.5 rounded-lg border ${
                        score >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        score >= 65 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {score}/100
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-0.5">SCORE</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {property.hmo ? (
                      <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
                        HMO Licensed
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
                        Single Household
                      </span>
                    )}

                    <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                      {property.local_authority || 'Council'}
                    </span>
                  </div>

                  {/* Safety Matrix Mini List */}
                  <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Gas CP12:</span>
                      <span className={`font-semibold ${
                        !gasCert || gasCert.status === 'expired' ? 'text-red-600' :
                        gasCert.status === 'expiring_soon' ? 'text-amber-600' : 'text-emerald-700'
                      }`}>
                        {!gasCert ? 'Missing' : gasCert.status === 'expired' ? 'EXPIRED' : 'Valid'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">EICR (5-Yr):</span>
                      <span className={`font-semibold ${
                        !eicrCert || eicrCert.status === 'expired' ? 'text-red-600' : 'text-emerald-700'
                      }`}>
                        {eicrCert ? `Valid (${eicrCert.expiry_date.split('-')[0]})` : 'Missing'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">EPC Rating:</span>
                      <span className="font-semibold text-slate-800">
                        Band {epcCert ? epcCert.rating : 'D'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleExportPack(property.id)}
                    disabled={exportingId === property.id}
                    className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-sky-600 py-1.5 transition-colors"
                    title="Export Lender & Insurer Compliance Pack PDF"
                  >
                    {exportingId === property.id ? (
                      <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    )}
                    <span>Compliance Pack</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onSelectProperty) onSelectProperty(property);
                      setActiveTab('properties');
                    }}
                    className="inline-flex items-center text-xs font-bold text-sky-600 hover:text-sky-700 py-1.5"
                  >
                    <span>View Vault</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Grid: Document Generator & "Can I Do This?" */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Document Generator Box */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold">Statutory Document Generator</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Auto-fill official Section 13 rent increase notices (Form 4), pet request determinations, Awaab's Law damp logs, and periodic tenancy checklists from your property database.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Links to official GOV.UK forms</span>
            <button
              onClick={() => setActiveTab('documents')}
              className="inline-flex items-center text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 px-3.5 py-2 rounded-xl transition-colors"
            >
              Generate Documents
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>
        </div>

        {/* "Can I Do This?" Assistant Box */}
        <div className="bg-gradient-to-br from-sky-900 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <h3 className="text-lg font-bold">"Can I Do This?" Legal Assistant</h3>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              Ask real scenarios: rent hikes, selling the property, pet requests, rent arrears, and eviction under reformed Section 8. Strict statutory answers with source links and solicitor advisories.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-sky-800/60 flex items-center justify-between">
            <span className="text-[11px] text-sky-200">Logged to property audit trail</span>
            <button
              onClick={() => setActiveTab('can-i-do-this')}
              className="inline-flex items-center text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 px-3.5 py-2 rounded-xl transition-colors"
            >
              Ask Assistant
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
