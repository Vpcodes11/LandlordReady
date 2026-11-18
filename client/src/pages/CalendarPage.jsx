import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, CheckCircle2, Clock, AlertTriangle, 
  ShieldAlert, Mail, Bell, Filter, RefreshCw, Send, Check, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

export function CalendarPage({ tasks, properties, onRefresh }) {
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const filteredTasks = tasks.filter(t => {
    if (filterProperty !== 'all' && t.property_id !== filterProperty) return false;
    if (filterStatus === 'overdue' && t.status !== 'overdue') return false;
    if (filterStatus === 'due_soon' && t.status !== 'due_soon') return false;
    if (filterStatus === 'completed' && t.status !== 'completed') return false;
    if (filterStatus === 'pending' && t.status === 'completed') return false;
    return true;
  });

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;
    try {
      await api.updateTask(task.id, { status: newStatus, completed_at: completedAt });
      onRefresh();
    } catch (err) {
      alert('Error updating task: ' + err.message);
    }
  };

  const handleSimulateReminders = async () => {
    setSimulating(true);
    try {
      const res = await api.simulateReminders();
      setSimulationResult(res);
      if (res.dispatches && res.dispatches.length > 0) {
        setSelectedEmail(res.dispatches[0]);
      }
      onRefresh();
    } catch (err) {
      alert('Failed to simulate reminders: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Compliance Calendar & Reminders
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              60 / 30 / 7-Day Alerts Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Auto-generated obligations: annual Gas Safety (CP12), 5-yr EICR, EPC, PRS Database fees, rent review windows, and deposit prescribed info.
          </p>
        </div>

        <button
          onClick={handleSimulateReminders}
          disabled={simulating}
          className="inline-flex items-center text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-sm transition-all whitespace-nowrap"
        >
          {simulating ? (
            <RefreshCw className="w-4 h-4 mr-1.5 animate-spin text-sky-400" />
          ) : (
            <Mail className="w-4 h-4 mr-1.5 text-sky-400" />
          )}
          Simulate Email Dispatch (60/30/7d)
        </button>
      </div>

      {/* Simulation Results Drawer / Modal */}
      {simulationResult && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-sky-700" />
              <h3 className="text-sm font-bold text-sky-950">
                Simulated Automated Email Dispatch ({simulationResult.reminders_sent_count} Dispatches Triggered)
              </h3>
            </div>
            <button
              onClick={() => setSimulationResult(null)}
              className="text-xs font-semibold text-sky-800 hover:text-sky-950"
            >
              Dismiss
            </button>
          </div>

          <p className="text-xs text-sky-800">
            LandlordReady's automated daemon checked your portfolio tasks against 60-day, 30-day, and 7-day statutory reminder windows. Below are the generated emails:
          </p>

          {simulationResult.dispatches.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
              {/* Email List */}
              <div className="space-y-2 lg:col-span-1">
                {simulationResult.dispatches.map((d, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedEmail(d)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                      selectedEmail === d
                        ? 'bg-white border-sky-500 shadow-sm'
                        : 'bg-sky-100/60 border-sky-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-sky-900">
                      {d.stage}
                    </span>
                    <strong className="text-slate-900 truncate block text-xs">{d.title}</strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Due: {d.dueDate}</span>
                  </button>
                ))}
              </div>

              {/* Selected Email Preview */}
              {selectedEmail && (
                <div className="lg:col-span-2 bg-white rounded-xl border border-sky-200 p-5 text-xs text-slate-700 space-y-3 shadow-sm">
                  <div className="border-b border-slate-100 pb-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>To: <strong className="text-slate-700">{selectedEmail.to}</strong></span>
                      <span className="font-semibold text-sky-700">{selectedEmail.stage}</span>
                    </div>
                    <div className="font-bold text-sm text-slate-900">
                      Subject: {selectedEmail.subject}
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {selectedEmail.bodyText}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-600 bg-white p-4 rounded-xl border border-sky-100">
              No tasks currently fall into the 60d, 30d, or 7d dispatch window, or alerts for the current period have already been sent.
            </p>
          )}
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 mr-1" />
          <span className="font-semibold text-slate-700">Filter By:</span>

          <select
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none"
          >
            <option value="all">All Properties</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.address_line1} ({p.postcode})</option>
            ))}
          </select>

          <div className="flex items-center space-x-1 pl-2">
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'pending', label: 'Pending' },
              { id: 'due_soon', label: 'Due Soon' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'completed', label: 'Completed' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  filterStatus === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-slate-400 font-medium">
          Showing {filteredTasks.length} tasks
        </span>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-800">No tasks matching your filter.</p>
              <p>All compliance obligations are either up to date or completed.</p>
            </div>
          ) : (
            filteredTasks.map((t) => {
              const isOverdue = t.status === 'overdue';
              const isDueSoon = t.status === 'due_soon';
              const isCompleted = t.status === 'completed';

              return (
                <div 
                  key={t.id} 
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isCompleted ? 'bg-slate-50/60 opacity-60' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <button
                      onClick={() => handleToggleComplete(t)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-sky-500 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {t.title}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                          isOverdue ? 'bg-red-100 text-red-800' :
                          isDueSoon ? 'bg-amber-100 text-amber-800' :
                          isCompleted ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                        {t.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span className="font-medium text-slate-600">
                          📍 {t.address_line1}, {t.postcode}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Due: <strong className={`ml-1 ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>{t.due_date}</strong>
                        </span>
                        <span>•</span>
                        <span className="text-slate-500">
                          Reminders: 60d ({t.reminder_60d_sent ? '✓' : '—'}), 30d ({t.reminder_30d_sent ? '✓' : '—'}), 7d ({t.reminder_7d_sent ? '✓' : '—'})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleComplete(t)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                        isCompleted
                          ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {isCompleted ? 'Mark Pending' : 'Mark Done'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
