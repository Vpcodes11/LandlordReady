import React, { useState, useEffect } from 'react';
import { 
  Check, Crown, Sparkles, ShieldCheck, Zap, 
  Clock, ArrowRight, Receipt, ExternalLink, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';

export function PricingPage({ profile, subscription, onRefresh, setActiveTab }) {
  const [billingCycle, setBillingCycle] = useState(subscription?.billing_cycle || 'monthly');
  const [upgradingPlan, setUpgradingPlan] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.getOrders();
      setOrders(res.orders || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpgrade = async (planId) => {
    setUpgradingPlan(planId);
    try {
      const res = await api.upgradeSubscription(planId, billingCycle);
      alert(res.message);
      onRefresh();
      loadOrders();
    } catch (err) {
      alert('Upgrade error: ' + err.message);
    } finally {
      setUpgradingPlan(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free Hook',
      tagline: 'Instant diagnostic score & summary',
      monthlyPrice: 0,
      annualPrice: 0,
      properties: '1 check',
      popular: false,
      features: [
        '2-minute compliance check',
        '0-100 compliance score',
        'Red / Amber / Green audit list',
        'Statutory penalty estimates',
        'Full Report PDF export (with email)'
      ]
    },
    {
      id: 'starter',
      name: 'Starter',
      tagline: 'Single rental autopilot',
      monthlyPrice: 7,
      annualPrice: 70, // 2 months free
      properties: '1 Property',
      popular: false,
      features: [
        '1 Property fully tracked',
        'Automated statutory compliance calendar',
        '60 / 30 / 7-day email reminders',
        'Full Document Generator (Form 4, Pets)',
        '"Can I Do This?" Rules Assistant',
        'Document Vault (Certs & Notices)',
        '14-Day Free Trial included'
      ]
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      tagline: 'For growing self-managers',
      monthlyPrice: 19,
      annualPrice: 190, // 2 months free
      properties: 'Up to 5 Properties',
      popular: true,
      features: [
        'Up to 5 Properties fully managed',
        'Multi-property dashboard & scores',
        'One-click "Compliance Pack" PDF exports',
        'All automated calendar reminders',
        'Renters\' Rights Act Phase 1 transition tools',
        'Regional PRS Database tracking',
        'Persistent Q&A legal audit trail',
        '14-Day Free Trial included'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      tagline: 'Multi-let portfolios & HMOs',
      monthlyPrice: 39,
      annualPrice: 390, // 2 months free
      properties: 'Up to 15 Properties',
      popular: false,
      features: [
        'Up to 15 Properties tracked',
        'Dedicated HMO licensing management',
        'Priority legal rules desk support',
        'Bulk document generator & pack exports',
        'Full tenant communications log',
        'Awaab\'s Law emergency repair tracker',
        '14-Day Free Trial included'
      ]
    }
  ];

  const currentPlan = subscription?.plan_id || 'portfolio';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Pricing Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Transparent Pricing • 14-Day Free Trial on Paid Plans</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Simple, Predictable Compliance Protection
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Avoid £30,000 civil penalties, court possession bars, and Rent Repayment Orders. Free compliance check as the hook, ongoing peace of mind on monthly or annual subscription.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="pt-4 flex items-center justify-center space-x-3">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
              billingCycle === 'monthly'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Monthly Billing
          </button>

          <button
            onClick={() => setBillingCycle('annual')}
            className={`relative text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              billingCycle === 'annual'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
              2 Months Free
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.id;
          const price = billingCycle === 'annual' ? p.annualPrice : p.monthlyPrice;
          const displayPrice = billingCycle === 'annual' 
            ? (p.annualPrice > 0 ? `£${p.annualPrice}` : '£0') 
            : (p.monthlyPrice > 0 ? `£${p.monthlyPrice}` : '£0');

          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all relative ${
                p.popular
                  ? 'border-sky-600 shadow-lg ring-2 ring-sky-600/20'
                  : 'border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {p.properties}
                  </span>
                </div>
                <p className="text-xs text-slate-500 min-h-[32px]">{p.tagline}</p>

                {/* Price Display */}
                <div className="mt-4 mb-6 pt-4 border-t border-slate-100 flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-slate-900">{displayPrice}</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {p.id === 'free' ? 'forever' : billingCycle === 'annual' ? '/year' : '/month'}
                  </span>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-slate-100">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold cursor-default"
                  >
                    Current Plan
                  </button>
                ) : p.id === 'free' ? (
                  <button
                    onClick={() => setActiveTab('free-check')}
                    className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
                  >
                    Run Free Check
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(p.id)}
                    disabled={upgradingPlan === p.id}
                    className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center"
                  >
                    {upgradingPlan === p.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Start 14-Day Free Trial</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders / Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Receipt className="w-5 h-5 text-slate-700" />
          <h3 className="text-base font-bold text-slate-900">Billing History & Invoices</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5">Invoice #</th>
                <th className="pb-2.5">Description</th>
                <th className="pb-2.5">Amount</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No previous invoices found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-3 text-slate-700 font-medium">
                      {new Date(o.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-900">
                      {o.invoice_number}
                    </td>
                    <td className="py-3 text-slate-600">
                      {o.description}
                    </td>
                    <td className="py-3 font-semibold text-slate-900">
                      £{o.amount.toFixed(2)} {o.currency}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {o.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => alert(`Downloading VAT invoice ${o.invoice_number}...`)}
                        className="text-sky-600 hover:text-sky-800 font-semibold text-[11px]"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
