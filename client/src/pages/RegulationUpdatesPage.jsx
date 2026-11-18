import React, { useState } from 'react';
import { 
  Bell, ExternalLink, Plus, Send, AlertTriangle, 
  CheckCircle2, Sparkles, Building, RefreshCw, X, ShieldAlert, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export function RegulationUpdatesPage({ updates, properties, onRefresh, setActiveTab }) {
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newUpdate, setNewUpdate] = useState({
    title: 'PRS Database: Mandatory Onboarding Phase Announced for North West & Yorkshire',
    summary: 'The Department for Housing has designated the mandatory landlord registration window for postcodes across Greater Manchester, Leeds, and Sheffield.',
    topic: 'PRS Database Regional Expansion',
    effective_date: '2026-11-01',
    affected_regions: 'Greater Manchester, West Yorkshire, South Yorkshire',
    impact_severity: 'high',
    source_url: 'https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill/guide-to-the-renters-rights-bill#private-rented-sector-database',
    action_1: 'Gather latest CP12 and EICR digital certificates',
    action_2: 'Check local borough portal link for landlord ID verification'
  });

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const actions = [newUpdate.action_1, newUpdate.action_2].filter(Boolean);
      const res = await api.postRegulationUpdate({
        title: newUpdate.title,
        summary: newUpdate.summary,
        topic: newUpdate.topic,
        effective_date: newUpdate.effective_date,
        affected_regions: newUpdate.affected_regions,
        impact_severity: newUpdate.impact_severity,
        source_url: newUpdate.source_url,
        actions_required: actions
      });

      alert(res.message);
      setBroadcastModalOpen(false);
      onRefresh();
    } catch (err) {
      alert('Failed to broadcast update: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Regulation Updates Feed
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              Live Statutory Tracking
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official statutory developments: Renters' Rights Act phase dates, regional PRS Database expansions, and consultation decrees.
          </p>
        </div>

        <button
          onClick={() => setBroadcastModalOpen(true)}
          className="inline-flex items-center text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-sm transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-1.5 text-sky-400" />
          Broadcast Update (Admin Simulation)
        </button>
      </div>

      {/* Impact on User's Portfolio Banner */}
      <div className="bg-gradient-to-r from-sky-900 to-indigo-900 text-white p-6 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <h2 className="text-sm font-bold uppercase tracking-wider">
            Automated Impact on Your Portfolio ({properties.length} Properties)
          </h2>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
          When statutory updates occur in England or specific local authority regions, LandlordReady cross-references your registered properties and automatically inserts actionable tasks with statutory deadlines into your Compliance Calendar.
        </p>
        <div className="flex items-center space-x-3 pt-1">
          <button
            onClick={() => setActiveTab('calendar')}
            className="inline-flex items-center text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 px-3.5 py-2 rounded-xl transition-colors"
          >
            Review Auto-Created Tasks
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>
        </div>
      </div>

      {/* Regulation Timeline Cards */}
      <div className="space-y-4">
        {updates.map((upd) => {
          const isHigh = upd.impact_severity === 'high';
          return (
            <div 
              key={upd.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isHigh ? 'bg-red-500 animate-pulse' : 'bg-sky-500'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {upd.topic}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                    isHigh ? 'bg-red-100 text-red-800' : 'bg-sky-100 text-sky-800'
                  }`}>
                    {upd.impact_severity} impact
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  Effective: <strong className="text-slate-700">{upd.effective_date}</strong>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {upd.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {upd.summary}
                </p>
              </div>

              {/* Regions & Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Affected Jurisdictions / Regions</span>
                  <span className="font-semibold text-slate-800">{upd.affected_regions || 'All England Authorities'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Action Checklist Auto-Created</span>
                  <ul className="space-y-1 text-slate-700">
                    {(upd.actions_required || []).map((act, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 mr-1.5 flex-shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {upd.source_url && (
                <div className="text-right pt-2 border-t border-slate-100">
                  <a
                    href={upd.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-bold text-sky-600 hover:text-sky-800"
                  >
                    Read Official Notice on GOV.UK <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Admin Broadcast Modal */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Broadcast Regulatory Update</h3>
                <p className="text-xs text-slate-500">Simulates admin broadcasting news to landlords and generating compliance tasks.</p>
              </div>
              <button onClick={() => setBroadcastModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Update Title *
                </label>
                <input
                  type="text"
                  required
                  value={newUpdate.title}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Topic / Category *
                </label>
                <input
                  type="text"
                  required
                  value={newUpdate.topic}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, topic: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={newUpdate.effective_date}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, effective_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Impact Severity
                  </label>
                  <select
                    value={newUpdate.impact_severity}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, impact_severity: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="high">High (Strict Statutory Deadline)</option>
                    <option value="medium">Medium (Preparatory / Review)</option>
                    <option value="low">Low (Advisory Information)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Affected Regions
                </label>
                <input
                  type="text"
                  value={newUpdate.affected_regions}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, affected_regions: e.target.value }))}
                  placeholder="e.g. Greater London, West Midlands"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Executive Summary *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newUpdate.summary}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-2 p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-800 block">Action Checklist to Auto-Create:</span>
                <input
                  type="text"
                  value={newUpdate.action_1}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, action_1: e.target.value }))}
                  placeholder="Action Item 1"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
                <input
                  type="text"
                  value={newUpdate.action_2}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, action_2: e.target.value }))}
                  placeholder="Action Item 2"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setBroadcastModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md shadow-sky-600/20 flex items-center"
                >
                  {submitting ? 'Broadcasting...' : 'Broadcast & Auto-Create Tasks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
