import React from 'react';
import { ShieldCheck, ExternalLink, Scale, CheckCircle2 } from 'lucide-react';

export function Footer({ setActiveTab }) {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <span>LandlordReady</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Compliance autopilot engineered specifically for small private landlords in England (1–10 properties, self-managing). Covering the Renters' Rights Act 2025/2026 and all recurring safety obligations.
            </p>
            <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Calibrated for England Jurisdiction</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('free-check')} className="hover:text-white transition-colors">
                  Free Compliance Check (Score 0-100)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition-colors">
                  Multi-Property Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('properties')} className="hover:text-white transition-colors">
                  Property & Document Vault
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('calendar')} className="hover:text-white transition-colors">
                  Compliance Calendar & Reminders
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('documents')} className="hover:text-white transition-colors">
                  Statutory Document Generator
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Assistant & Updates */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Legal & Rules</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('can-i-do-this')} className="hover:text-white transition-colors">
                  "Can I Do This?" Legal Assistant
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('regulations')} className="hover:text-white transition-colors">
                  Renters' Rights Act Feed
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('pricing')} className="hover:text-white transition-colors">
                  Subscription Plans & Free Trial
                </button>
              </li>
              <li>
                <a 
                  href="https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center text-sky-400 hover:text-sky-300"
                >
                  GOV.UK Renters' Rights Guide <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.gov.uk/government/publications/rent-increase-form-4" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center text-sky-400 hover:text-sky-300"
                >
                  GOV.UK Section 13 Form 4 <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>

          {/* Official Bodies */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Official Authorities</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://www.gov.uk/tenancy-deposit-protection" target="_blank" rel="noreferrer" className="inline-flex items-center hover:text-white">
                  Tenancy Deposit Protection (GOV.UK) <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="https://www.gassaferegister.co.uk" target="_blank" rel="noreferrer" className="inline-flex items-center hover:text-white">
                  Gas Safe Register <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="https://www.gov.uk/courts-tribunals/first-tier-tribunal-property-chamber" target="_blank" rel="noreferrer" className="inline-flex items-center hover:text-white">
                  First-tier Tribunal (Property) <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="https://find-energy-certificate.service.gov.uk" target="_blank" rel="noreferrer" className="inline-flex items-center hover:text-white">
                  Government EPC Register <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-slate-900 pt-6 text-[11px] text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>
              <strong>Legal Notice:</strong> LandlordReady is a compliance tracking and automated assistance platform strictly for tenancies in England. It does not provide regulated legal advice. If you face contested court possession proceedings or disrepair counterclaims, always instruct a qualified solicitor.
            </span>
          </div>
          <div className="text-right whitespace-nowrap">
            &copy; 2026 LandlordReady. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
