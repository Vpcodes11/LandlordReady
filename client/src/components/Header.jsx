import React from 'react';
import { ShieldCheck, CheckCircle2, Calendar, FileText, HelpCircle, Bell, Home, Crown, Sparkles, Building2 } from 'lucide-react';

export function Header({ activeTab, setActiveTab, profile, subscription, overdueCount = 0 }) {
  const navItems = [
    { id: 'free-check', label: 'Am I Compliant?', icon: ShieldCheck, highlight: true },
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'properties', label: 'Properties & Vault', icon: Building2 },
    { id: 'calendar', label: 'Calendar', icon: Calendar, badge: overdueCount > 0 ? overdueCount : null },
    { id: 'documents', label: 'Document Generator', icon: FileText },
    { id: 'can-i-do-this', label: '"Can I Do This?"', icon: HelpCircle },
    { id: 'regulations', label: 'Law Updates', icon: Bell },
    { id: 'pricing', label: 'Pricing', icon: Crown }
  ];

  const planName = (subscription?.plan_id || 'portfolio').toUpperCase();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      {/* Top England Statutory Banner */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs text-slate-300 flex flex-wrap justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            England Jurisdiction Verified
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Renters' Rights Act 2025/2026 Phase 1 (1 May 2026) & Safety Regulations Engine
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-slate-400 text-[11px] hidden md:inline">
            Logged in as: <strong className="text-slate-200">{profile?.name || 'Marcus Holloway'}</strong>
          </span>
          <button
            onClick={() => setActiveTab('pricing')}
            className="inline-flex items-center text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded hover:bg-amber-500/20 transition-colors"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {planName} Plan ({subscription?.properties_limit || 5} Properties)
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-600/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold tracking-tight text-white">LandlordReady</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/30">
                  Autopilot
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">England Landlord Compliance</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    item.highlight && !isActive
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
                      : isActive
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-red-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Tab Select */}
          <div className="lg:hidden flex items-center">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:ring-sky-500 focus:outline-none"
            >
              {navItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} {item.badge ? `(${item.badge} overdue)` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
