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
import { api } from './services/api';
import { RefreshCw, ShieldAlert } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('landing');
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
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
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

  const handleAddCheckedProperty = async (answers, evalResult) => {
    try {
      await api.createProperty({
        address_line1: `Rental Dwelling (${answers.postcode || 'England'})`,
        city: 'England',
        postcode: answers.postcode || 'SW1A 1AA',
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

        {activeTab === 'dashboard' && (
          <DashboardPage
            properties={properties}
            tasks={tasks}
            setActiveTab={setActiveTab}
            onSelectProperty={setSelectedProperty}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'properties' && (
          <PropertiesPage
            properties={properties}
            subscription={subscription}
            onRefresh={loadAllData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarPage
            tasks={tasks}
            properties={properties}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentGeneratorPage
            properties={properties}
          />
        )}

        {activeTab === 'can-i-do-this' && (
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
