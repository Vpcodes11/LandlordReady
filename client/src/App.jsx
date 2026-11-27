import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { FreeCheckPage } from './pages/FreeCheckPage';
import { DashboardPage } from './pages/DashboardPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { CalendarPage } from './pages/CalendarPage';
import { DocumentGeneratorPage } from './pages/DocumentGeneratorPage';
import { CanIDoThisPage } from './pages/CanIDoThisPage';
import { RegulationUpdatesPage } from './pages/RegulationUpdatesPage';
import { PricingPage } from './pages/PricingPage';
import { LoginPage } from './pages/LoginPage';
import { api } from './services/api';
import { RefreshCw, ShieldAlert } from 'lucide-react';

// Pages that need an account. Landing, free check, law updates and pricing are public.
const PROTECTED = new Set(['dashboard', 'properties', 'calendar', 'documents', 'can-i-do-this']);
const params = new URLSearchParams(window.location.search);

function App() {
  const [activeTab, setActiveTabRaw] = useState(params.get('signin') === 'expired' ? 'login' : params.get('signedin') ? 'dashboard' : params.get('billing') ? 'pricing' : 'landing');
  const [me, setMe] = useState(null);
  const [notice, setNotice] = useState(
    params.get('billing') === 'success' ? 'Thank you, your plan is active.' : params.get('billing') === 'pending' ? 'Your payment is being confirmed. Refresh in a minute.' : null
  );
  const signedIn = Boolean(me?.user);
  const setActiveTab = (tab) => setActiveTabRaw(tab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // App data state
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [properties, setProperties] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    if (params.toString()) window.history.replaceState(null, '', window.location.pathname);
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const session = await api.me();
      setMe(session);
      if (!session.user) {
        const updsRes = await api.getRegulationUpdates();
        setUpdates(updsRes.updates || []);
        setProfile(null);
        setSubscription(null);
        setProperties([]);
        setTasks([]);
        return;
      }
      const [profRes, propsRes, tasksRes, updsRes] = await Promise.all([
        api.getProfile(),
        api.getProperties(),
        api.getTasks(),
        api.getRegulationUpdates()
      ]);

      setProfile(profRes.profile);
      setSubscription(profRes.subscription);
      setProperties(propsRes.properties || []);
      setTasks(tasksRes.tasks || []);
      setUpdates(updsRes.updates || []);
      if (propsRes.properties?.length > 0 && !selectedProperty) {
        setSelectedProperty(propsRes.properties[0]);
      }
    } catch (err) {
      console.error('Data load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await api.logout().catch(() => {});
    setMe(null);
    setActiveTab('landing');
    loadAllData();
  };

  const handleAddCheckedProperty = async (answers, evalResult) => {
    if (!signedIn) {
      setActiveTab('login');
      return;
    }
    try {
      await api.createProperty({
        address_line1: `Rental property${answers.postcode ? ` (${answers.postcode})` : ''} – edit address`,
        city: answers.city || 'England',
        postcode: answers.postcode || 'TBC',
        property_type: answers.property_type || 'Terraced',
        bedrooms: answers.bedrooms || 2,
        hmo: answers.is_hmo,
        licensing_type: answers.licensing_area || 'none',
        licensing_status: answers.licensing_area === 'compliant' ? 'compliant' : 'not_required'
      });
      loadAllData();
      setActiveTab('properties');
    } catch (err) {
      console.error(err);
    }
  };

  const overdueCount = tasks.filter(t => t.status === 'overdue').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center animate-bounce">
          <RefreshCw className="w-6 h-6 animate-spin text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-serif font-bold">LandlordReady Autopilot</h2>
          <p className="text-xs text-slate-400">Loading statutory compliance engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        subscription={subscription}
        overdueCount={overdueCount}
        signedIn={signedIn}
        onSignOut={handleSignOut}
      />

      <main className="flex-1">
        {error && (
          <div className="max-w-7xl mx-auto px-4 mt-4">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Notice: {error}</span>
              </div>
              <button 
                onClick={loadAllData} 
                className="font-bold underline ml-2 hover:text-red-950"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {notice && (
          <div className="max-w-7xl mx-auto px-4 mt-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex justify-between">
              <span>{notice}</span>
              <button onClick={() => setNotice(null)} className="underline text-xs">Close</button>
            </div>
          </div>
        )}

        {(activeTab === 'login' || (PROTECTED.has(activeTab) && !signedIn)) && (
          <LoginPage expired={params.get('signin') === 'expired'} />
        )}

        {activeTab === 'landing' && (
          <LandingPage
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'free-check' && (
          <FreeCheckPage
            setActiveTab={setActiveTab}
            onCompleteSave={handleAddCheckedProperty}
          />
        )}

        {activeTab === 'dashboard' && signedIn && (
          <DashboardPage
            properties={properties}
            tasks={tasks}
            setActiveTab={setActiveTab}
            onSelectProperty={setSelectedProperty}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'properties' && signedIn && (
          <PropertiesPage
            properties={properties}
            subscription={subscription}
            onRefresh={loadAllData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'calendar' && signedIn && (
          <CalendarPage
            tasks={tasks}
            properties={properties}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'documents' && signedIn && (
          <DocumentGeneratorPage
            properties={properties}
          />
        )}

        {activeTab === 'can-i-do-this' && signedIn && (
          <CanIDoThisPage
            properties={properties}
          />
        )}

        {activeTab === 'regulations' && (
          <RegulationUpdatesPage
            updates={updates}
            properties={properties}
            onRefresh={loadAllData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'pricing' && (
          <PricingPage
            profile={profile}
            subscription={subscription}
            signedIn={signedIn}
            onRefresh={loadAllData}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
