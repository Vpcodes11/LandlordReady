import React from 'react';
import { 
  ShieldCheck, CheckCircle2, Calendar, FileText, HelpCircle, 
  Bell, Home, Crown, Sparkles, Building2, Compass
} from 'lucide-react';

export function Header({ activeTab, setActiveTab, profile, subscription, overdueCount = 0 }) {
  const navItems = [
    { id: 'landing', label: 'Overview', icon: Compass },
    { id: 'free-check', label: 'Am I Compliant?', icon: ShieldCheck, highlight: true },
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'properties', label: 'Properties & Vault', icon: Building2 },
    { id: 'calendar', label: 'Calendar', icon: Calendar, badge: overdueCount > 0 ? overdueCount : null },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'can-i-do-this', label: '"Can I Do This?"', icon: HelpCircle },
    { id: 'regulations', label: 'Law Updates', icon: Bell },
    { id: 'pricing', label: 'Pricing', icon: Crown }
  ];

  const planName = (subscription?.plan_id || 'portfolio').toUpperCase();

  return (
    <header className="bg-[#0F172A] border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm backdrop-blur-md">
      {/* Top England Statutory Banner */}
      <div className="bg-[#0A0F1D] px-4 py-1.5 text-xs text-slate-300 flex flex-wrap justify-between items-center border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            England Jurisdiction Verified
          </span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            Renters' Rights Act 2025/2026 Phase 1 (1 May 2026) & Safety Obligations
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-slate-400 text-[11px] hidden md:inline">
            Logged in: <strong className="text-slate-200">{profile?.name || 'Marcus Holloway'}</strong>
          </span>
          <button
            onClick={() => setActiveTab('pricing')}
            className="inline-flex items-center text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full hover:bg-amber-500/20 transition-colors"
          >
            <Sparkles className="w-2.5 h-2.5 mr-1" />
            {planName} Plan ({subscription?.properties_limit || 5} Props)
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Serif Editorial Touch */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-serif font-bold tracking-tight text-white">LandlordReady</span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-400 px-1.5 py-0.2 rounded border border-sky-500/30">
                  Autopilot
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5">England Landlord Compliance</p>
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
                  className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    item.highlight && !isActive
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                      : isActive
                      ? 'bg-sky-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-red-600 text-white animate-pulse">
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
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:ring-sky-500 focus:outline-none"
            >
              {navItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} {item.badge ? `(${item.badge} alert)` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
