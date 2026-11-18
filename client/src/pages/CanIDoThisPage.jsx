import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, Sparkles, Send, Scale, AlertTriangle, ExternalLink, 
  History, Building, ShieldAlert, CheckCircle2, RefreshCw, MessageSquare
} from 'lucide-react';
import { api } from '../services/api';

export function CanIDoThisPage({ properties }) {
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    properties.length > 0 ? properties[0].id : ''
  );
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [qaLogs, setQaLogs] = useState([]);

  const quickQuestions = [
    'Can I raise the rent by 15%?',
    'Can I sell the property and ask the tenant to leave?',
    'Tenant wants a pet cat, can I say no?',
    'Tenant is 2 months behind on rent, what grounds do I have?',
    'Can I serve a Section 21 notice to end the tenancy?',
    'Can I inspect the property tomorrow without warning?',
    'Tenant reported damp and black mould on bedroom wall'
  ];

  useEffect(() => {
    loadQALogs();
  }, [selectedPropertyId]);

  const loadQALogs = async () => {
    try {
      const res = await api.getQALogs(selectedPropertyId);
      setQaLogs(res.logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAsk = async (textToAsk = question) => {
    if (!textToAsk.trim()) return;
    setLoading(true);
    setCurrentResponse(null);
    try {
      const res = await api.askQA(textToAsk, selectedPropertyId);
      setCurrentResponse(res.result);
      setQuestion('');
      loadQALogs();
    } catch (err) {
      alert('Failed to get guidance: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              "Can I Do This?" Legal Assistant
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Rules-Only Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Answers derived strictly from the England statutory rules database and Renters' Rights Act. Explains procedural steps, statutory deadlines, and specifies when to instruct a solicitor.
          </p>
        </div>

        {/* Property Context Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Property Context:</span>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {properties.map(p => (
              <option key={p.id} value={p.id}>
                {p.address_line1} ({p.postcode})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Question Box & Response */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ask Question Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <label className="block text-sm font-bold text-slate-900">
              Ask any landlord compliance or tenant scenario question:
            </label>

            <div className="relative">
              <textarea
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. My tenant requested a medium-sized dog. Do I have to agree? What insurance can I demand?"
                className="w-full p-4 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <button
                onClick={() => handleAsk()}
                disabled={loading || !question.trim()}
                className="absolute right-3 bottom-3 inline-flex items-center text-xs font-bold bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl shadow-sm transition-all"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Ask Assistant</span>
                    <Send className="w-3.5 h-3.5 ml-1.5" />
                  </>
                )}
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
                Common Landlord Scenarios:
              </span>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuestion(q);
                      handleAsk(q);
                    }}
                    className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Assistant Response Display */}
          {currentResponse && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn space-y-4 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{currentResponse.topic}</h3>
                    <span className="text-[11px] text-slate-400">Strictly Verified England Housing Law</span>
                  </div>
                </div>

                {currentResponse.solicitor_advised === 1 ? (
                  <span className="inline-flex items-center text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-600" />
                    Solicitor Instruction Advised
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Self-Managing Procedure
                  </span>
                )}
              </div>

              {/* Formatted Markdown Response Body */}
              <div className="prose prose-slate text-xs max-w-none space-y-3 text-slate-800 leading-relaxed">
                <div dangerouslySetInnerHTML={{ 
                  __html: currentResponse.answer
                    .replace(/### (.*?)\n/g, '<h3 class="text-base font-bold text-slate-900 mt-2 mb-1">$1</h3>')
                    .replace(/#### (.*?)\n/g, '<h4 class="text-xs font-bold text-slate-900 mt-2 mb-1">$1</h4>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-sky-600 underline font-semibold hover:text-sky-800">$1</a>')
                    .replace(/> (.*?)\n/g, '<blockquote class="border-l-4 border-sky-500 pl-3 py-1 my-2 text-slate-600 bg-sky-50/50 rounded-r">$1</blockquote>')
                    .replace(/\n- /g, '<br/>• ')
                    .replace(/\n1\. /g, '<br/>1. ')
                    .replace(/\n2\. /g, '<br/>2. ')
                    .replace(/\n3\. /g, '<br/>3. ')
                }} />
              </div>

              {/* Source Rules Box */}
              {currentResponse.relevant_rules && currentResponse.relevant_rules.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Statutory Authorities Cited:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentResponse.relevant_rules.map(rule => (
                      <a
                        key={rule.id}
                        href={rule.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-[11px] font-semibold text-sky-700 bg-white border border-sky-200 px-2.5 py-1 rounded-md hover:bg-sky-50"
                      >
                        {rule.topic} ({rule.phase}) <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Persistent Q&A Audit Log */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Property Audit Log</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {qaLogs.length} Queries
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Every question asked is time-stamped and logged against this property for your legal records and dispute defense.
            </p>

            <div className="space-y-3 pt-2 max-h-[500px] overflow-y-auto">
              {qaLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No previous legal queries recorded for this property yet.
                </p>
              ) : (
                qaLogs.map(l => (
                  <div 
                    key={l.id} 
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition-colors text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(l.created_at).toLocaleDateString('en-GB')}</span>
                      {l.solicitor_advised === 1 ? (
                        <span className="text-red-700 font-bold bg-red-100 px-1.5 py-0.2 rounded">
                          Solicitor Advised
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded">
                          Self-Managed
                        </span>
                      )}
                    </div>
                    <strong className="text-slate-900 block text-xs">
                      "{l.question}"
                    </strong>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {l.answer.replace(/[#*]/g, '').slice(0, 110)}...
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
