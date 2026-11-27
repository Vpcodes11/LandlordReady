import React, { useState } from 'react';
import { ShieldCheck, Mail } from 'lucide-react';
import { api } from '../services/api';

export function LoginPage({ expired = false }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setState('sending');
    setError(null);
    try {
      await api.requestLogin(email);
      setState('sent');
    } catch (err) {
      setError(err.message);
      setState('idle');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mb-6">
        <ShieldCheck className="w-6 h-6 text-white" />
      </div>
      <h1 className="text-2xl font-serif font-bold text-slate-900">Sign in to LandlordReady</h1>
      <p className="text-sm text-slate-600 mt-2">
        We&apos;ll email you a sign-in link. New here? This creates your account with a 14-day free trial, no card needed.
      </p>
      {expired && <p className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">That link has expired or was already used. Request a new one.</p>}
      {state === 'sent' ? (
        <div className="mt-8 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
          Check <b>{email}</b> for your sign-in link. It expires in 20 minutes.
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-3">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.co.uk"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:border-sky-500"
          />
          <button disabled={state === 'sending'} className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
            <Mail className="w-4 h-4" /> {state === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
          </button>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}
