import React, { useState } from 'react';
import { 
  Building, Plus, FileText, Upload, Calendar, ShieldCheck, 
  Trash2, Download, ExternalLink, RefreshCw, AlertCircle, CheckCircle2,
  Users, Key, ShieldAlert, FileCheck, ArrowRight, X
} from 'lucide-react';
import { api } from '../services/api';
import { downloadCompliancePackPDF } from '../utils/pdfGenerator';

export function PropertiesPage({ properties, onRefresh, subscription, setActiveTab }) {
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    properties.length > 0 ? properties[0].id : null
  );

  // Modals
  const [addPropModalOpen, setAddPropModalOpen] = useState(false);
  const [addCertModalOpen, setAddCertModalOpen] = useState(false);
  const [addTenancyModalOpen, setAddTenancyModalOpen] = useState(false);
  const [exportingPack, setExportingPack] = useState(false);

  // Form states
  const [newProp, setNewProp] = useState({
    address_line1: '',
    address_line2: '',
    city: 'London',
    postcode: '',
    local_authority: 'Local Council',
    property_type: 'Flat / Apartment',
    bedrooms: 2,
    hmo: false,
    licensing_type: 'none',
    licensing_status: 'compliant'
  });

  const [newCert, setNewCert] = useState({
    type: 'gas_safety',
    certificate_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    rating: 'Pass / Safe',
    engineer_or_assessor: '',
    notes: ''
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [newTenancy, setNewTenancy] = useState({
    tenant_name: '',
    tenant_email: '',
    tenant_phone: '',
    start_date: new Date().toISOString().split('T')[0],
    rent_amount: '1850',
    rent_frequency: 'monthly',
    deposit_amount: '2134',
    deposit_scheme: 'Deposit Protection Service (DPS Custodial)',
    deposit_ref: 'DPS-NEW-' + Math.floor(Math.random() * 899999 + 100000),
    prescribed_info_given: false
  });

  const activeProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    try {
      await api.createProperty(newProp);
      setAddPropModalOpen(false);
      setNewProp({
        address_line1: '',
        address_line2: '',
        city: 'London',
        postcode: '',
        local_authority: 'Local Council',
        property_type: 'Flat / Apartment',
        bedrooms: 2,
        hmo: false,
        licensing_type: 'none',
        licensing_status: 'compliant'
      });
      onRefresh();
    } catch (err) {
      if (err.data?.limit_reached) {
        alert(err.message);
        setActiveTab('pricing');
      } else {
        alert('Failed to add property: ' + err.message);
      }
    }
  };

  const handleCreateCertificate = async (e) => {
    e.preventDefault();
    if (!activeProperty) return;
    setUploading(true);
    try {
      let file_path = null;
      let file_name = null;

      if (uploadFile) {
        const uploadRes = await api.uploadCertificateFile(uploadFile);
        file_path = uploadRes.file_path;
        file_name = uploadRes.file_name;
      }

      await api.createCertificate({
        property_id: activeProperty.id,
        ...newCert,
        file_path,
        file_name
      });

      setAddCertModalOpen(false);
      setUploadFile(null);
      setNewCert({
        type: 'gas_safety',
        certificate_number: '',
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        rating: 'Pass / Safe',
        engineer_or_assessor: '',
        notes: ''
      });
      onRefresh();
    } catch (err) {
      alert('Failed to save certificate: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateTenancy = async (e) => {
    e.preventDefault();
    if (!activeProperty) return;
    try {
      await api.createTenancy({
        property_id: activeProperty.id,
        tenants: [
          {
            name: newTenancy.tenant_name,
            email: newTenancy.tenant_email,
            phone: newTenancy.tenant_phone,
            is_lead: true
          }
        ],
        start_date: newTenancy.start_date,
        rent_amount: parseFloat(newTenancy.rent_amount),
        rent_frequency: newTenancy.rent_frequency,
        deposit_amount: parseFloat(newTenancy.deposit_amount),
        deposit_scheme: newTenancy.deposit_scheme,
        deposit_ref: newTenancy.deposit_ref,
        prescribed_info_given: newTenancy.prescribed_info_given
      });
      setAddTenancyModalOpen(false);
      onRefresh();
    } catch (err) {
      alert('Failed to register tenancy: ' + err.message);
    }
  };

  const handleExportPack = async () => {
    if (!activeProperty) return;
    setExportingPack(true);
    try {
      const res = await api.getPropertyPack(activeProperty.id);
      downloadCompliancePackPDF(res.pack);
    } catch (err) {
      alert('Error generating compliance pack: ' + err.message);
    } finally {
      setExportingPack(false);
    }
  };

  const handleDeleteProperty = async (propId) => {
    if (confirm('Are you sure you want to remove this property and its document vault records?')) {
      try {
        await api.deleteProperty(propId);
        onRefresh();
      } catch (err) {
        alert('Failed to delete property: ' + err.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Properties & Document Vault
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              {properties.length} / {subscription?.properties_limit || 5} Properties
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Store tenancies, safety certificates, and legal documentation. Export compliance packs for lenders, buyers, or tribunals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setAddPropModalOpen(true)}
            className="inline-flex items-center text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Property
          </button>
        </div>
      </div>

      {/* Property Switcher Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {properties.map((p) => {
          const isSelected = p.id === (activeProperty?.id);
          const score = p.compliance_score || 85;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPropertyId(p.id)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs truncate max-w-[180px]">
                  {p.address_line1}
                </span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                  isSelected ? 'bg-sky-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                }`}>
                  {score}/100
                </span>
              </div>
              <span className={`text-[11px] block mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                {p.postcode} • {p.city}
              </span>
            </button>
          );
        })}
      </div>

      {activeProperty && (
        <div className="space-y-6">
          {/* Active Property Information Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900">
                  {activeProperty.address_line1} {activeProperty.address_line2 ? `, ${activeProperty.address_line2}` : ''}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {activeProperty.property_type}
                </span>
                {activeProperty.hmo ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    HMO
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {activeProperty.city}, {activeProperty.postcode} • Local Authority: {activeProperty.local_authority || 'Not Specified'} • Licensing: {activeProperty.licensing_type.toUpperCase()}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportPack}
                disabled={exportingPack}
                className="inline-flex items-center text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-sm transition-colors"
              >
                {exportingPack ? (
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                )}
                Export Compliance Pack (PDF)
              </button>

              <button
                onClick={() => handleDeleteProperty(activeProperty.id)}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors"
                title="Delete Property"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Tenancy & Safety Certificates */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Tenancy Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-sky-600" />
                    <h3 className="text-base font-bold text-slate-900">Current Tenancy & Deposit</h3>
                  </div>
                  {(!activeProperty.tenancies || activeProperty.tenancies.length === 0) && (
                    <button
                      onClick={() => setAddTenancyModalOpen(true)}
                      className="inline-flex items-center text-xs font-bold text-sky-600 hover:text-sky-700"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Tenancy Details
                    </button>
                  )}
                </div>

                {activeProperty.tenancies && activeProperty.tenancies.length > 0 ? (
                  activeProperty.tenancies.map((t) => (
                    <div key={t.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div>
                          <span className="font-bold text-slate-900 text-sm">
                            {(t.tenants || []).map(tn => tn.name).join(', ')}
                          </span>
                          <span className="text-slate-500 block text-[11px]">
                            {(t.tenants || []).map(tn => tn.email).join(', ')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 text-sm">
                            £{t.rent_amount?.toLocaleString('en-GB', { minimumFractionDigits: 2 })} / mo
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded block mt-0.5">
                            Periodic Rolling Tenancy
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Commencement Date</span>
                          <span className="font-semibold">{t.start_date}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Deposit Scheme & Ref</span>
                          <span className="font-semibold">{t.deposit?.scheme || 'DPS'} ({t.deposit?.deposit_ref})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Prescribed Info Served</span>
                          <span className={`font-semibold ${t.deposit?.prescribed_info_given ? 'text-emerald-700' : 'text-red-600'}`}>
                            {t.deposit?.prescribed_info_given ? '✓ Served & Signed' : '⚠️ Pending Service'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                    <p className="font-semibold text-slate-800">No active tenancy logged for this property.</p>
                    <p className="text-[11px] mt-0.5">Add tenancy details to automatically track deposit deadlines and annual rent reviews.</p>
                    <button
                      onClick={() => setAddTenancyModalOpen(true)}
                      className="mt-3 inline-flex items-center text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 px-3.5 py-1.5 rounded-lg border border-sky-200"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Tenancy
                    </button>
                  </div>
                )}
              </div>

              {/* Safety Certificates Matrix & Uploader */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-bold text-slate-900">Safety Certificates & Inspection Records</h3>
                  </div>
                  <button
                    onClick={() => setAddCertModalOpen(true)}
                    className="inline-flex items-center text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    Upload Certificate
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                        <th className="pb-2.5">Obligation</th>
                        <th className="pb-2.5">Rating / Cert Ref</th>
                        <th className="pb-2.5">Expiry Date</th>
                        <th className="pb-2.5">Status</th>
                        <th className="pb-2.5 text-right">Document</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(activeProperty.certificates || []).map((c) => {
                        const isExpired = c.status === 'expired';
                        const isExpiring = c.status === 'expiring_soon';
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/50">
                            <td className="py-3 font-bold text-slate-900">
                              {c.type === 'gas_safety' && 'Gas Safety (CP12)'}
                              {c.type === 'eicr' && 'Electrical (EICR)'}
                              {c.type === 'epc' && 'Energy (EPC)'}
                              {c.type === 'smoke_co' && 'Smoke / CO Test'}
                              {c.type === 'hmo_licence' && 'HMO Licence'}
                            </td>
                            <td className="py-3 text-slate-600">
                              <span className="font-semibold text-slate-800">{c.rating || 'Valid'}</span>
                              {c.certificate_number && (
                                <span className="block text-[10px] text-slate-400">{c.certificate_number}</span>
                              )}
                            </td>
                            <td className="py-3 text-slate-700 font-medium">
                              {c.expiry_date}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isExpired ? 'bg-red-100 text-red-800' :
                                isExpiring ? 'bg-amber-100 text-amber-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {c.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              {c.file_path ? (
                                <a
                                  href={c.file_path}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center text-sky-600 hover:text-sky-800 font-semibold text-[11px]"
                                >
                                  <FileText className="w-3.5 h-3.5 mr-1" />
                                  View
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[11px]">No file</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Col: Document Vault & Quick Generator */}
            <div className="space-y-6">
              {/* Document Vault per Property */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileCheck className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-bold text-slate-900">Document Vault</h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Encrypted
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Repository of generated agreements, rent notices, certificates, and compliance packs for {activeProperty.address_line1}.
                </p>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setActiveTab('documents')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Generate Rent Increase Notice</span>
                      <span className="text-[11px] text-slate-500">Statutory Form 4 Section 13 notice</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('documents')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Pet Request Determination</span>
                      <span className="text-[11px] text-slate-500">Consent or lawful grounds within 42 days</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('documents')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Awaab's Law Repair Log</span>
                      <span className="text-[11px] text-slate-500">24h / 14-day statutory investigation milestones</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* PRS Database Info Card */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-sky-400" />
                  <h4 className="font-bold text-sm">National PRS Database</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Status for {activeProperty.postcode}: <strong className="text-amber-400">Pre-Registration Pending</strong>. 
                  All England landlords must register each let dwelling and pay an annual fee once the regional portal goes live.
                </p>
                <div className="pt-2">
                  <a
                    href="https://www.gov.uk/government/publications/guide-to-the-renters-rights-bill/guide-to-the-renters-rights-bill#private-rented-sector-database"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-semibold text-sky-300 hover:text-sky-200"
                  >
                    Read Government Guidance <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Property */}
      {addPropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Property to Portfolio</h3>
              <button onClick={() => setAddPropModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  value={newProp.address_line1}
                  onChange={(e) => setNewProp(prev => ({ ...prev, address_line1: e.target.value }))}
                  placeholder="e.g. 52 Highfield Road"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={newProp.address_line2}
                  onChange={(e) => setNewProp(prev => ({ ...prev, address_line2: e.target.value }))}
                  placeholder="e.g. Flat 3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProp.city}
                    onChange={(e) => setNewProp(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. Manchester"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Postcode (England) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProp.postcode}
                    onChange={(e) => setNewProp(prev => ({ ...prev, postcode: e.target.value.toUpperCase() }))}
                    placeholder="e.g. M14 5RT"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Property Type
                  </label>
                  <select
                    value={newProp.property_type}
                    onChange={(e) => setNewProp(prev => ({ ...prev, property_type: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="Terraced">Terraced</option>
                    <option value="Semi-Detached">Semi-Detached</option>
                    <option value="Detached">Detached</option>
                    <option value="Flat / Apartment">Flat / Apartment</option>
                    <option value="Maisonette">Maisonette</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newProp.bedrooms}
                    onChange={(e) => setNewProp(prev => ({ ...prev, bedrooms: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Local Authority / Council
                </label>
                <input
                  type="text"
                  value={newProp.local_authority}
                  onChange={(e) => setNewProp(prev => ({ ...prev, local_authority: e.target.value }))}
                  placeholder="e.g. Manchester City Council"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProp.hmo}
                    onChange={(e) => setNewProp(prev => ({ ...prev, hmo: e.target.checked }))}
                    className="w-4 h-4 text-sky-600 rounded"
                  />
                  <span>This property is an HMO (House in Multiple Occupation)</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAddPropModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20"
                >
                  Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Certificate */}
      {addCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Upload Safety Certificate</h3>
              <button onClick={() => setAddCertModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCertificate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Certificate Type
                </label>
                <select
                  value={newCert.type}
                  onChange={(e) => setNewCert(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="gas_safety">Gas Safety Certificate (CP12 - Annual)</option>
                  <option value="eicr">Electrical Installation Condition Report (EICR - 5 Yr)</option>
                  <option value="epc">Energy Performance Certificate (EPC - 10 Yr)</option>
                  <option value="smoke_co">Smoke & Carbon Monoxide Alarm Record</option>
                  <option value="hmo_licence">HMO / Council Property Licence</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Certificate / Reference Number
                </label>
                <input
                  type="text"
                  value={newCert.certificate_number}
                  onChange={(e) => setNewCert(prev => ({ ...prev, certificate_number: e.target.value }))}
                  placeholder="e.g. CP12-884920"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newCert.issue_date}
                    onChange={(e) => setNewCert(prev => ({ ...prev, issue_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newCert.expiry_date}
                    onChange={(e) => setNewCert(prev => ({ ...prev, expiry_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Engineer or Assessor Details
                </label>
                <input
                  type="text"
                  value={newCert.engineer_or_assessor}
                  onChange={(e) => setNewCert(prev => ({ ...prev, engineer_or_assessor: e.target.value }))}
                  placeholder="e.g. John Smith (Gas Safe #554890)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload PDF or Image Document
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAddCertModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20"
                >
                  {uploading ? 'Saving...' : 'Save to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Tenancy */}
      {addTenancyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Tenancy to Property</h3>
              <button onClick={() => setAddTenancyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenancy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lead Tenant Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTenancy.tenant_name}
                  onChange={(e) => setNewTenancy(prev => ({ ...prev, tenant_name: e.target.value }))}
                  placeholder="e.g. Emma Watson"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newTenancy.tenant_email}
                    onChange={(e) => setNewTenancy(prev => ({ ...prev, tenant_email: e.target.value }))}
                    placeholder="tenant@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newTenancy.tenant_phone}
                    onChange={(e) => setNewTenancy(prev => ({ ...prev, tenant_phone: e.target.value }))}
                    placeholder="07890 000000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Commencement Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newTenancy.start_date}
                    onChange={(e) => setNewTenancy(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Rent (£) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newTenancy.rent_amount}
                    onChange={(e) => setNewTenancy(prev => ({ ...prev, rent_amount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl space-y-3">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Deposit Protection (Housing Act 2004)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-600 block">Deposit Amount (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTenancy.deposit_amount}
                      onChange={(e) => setNewTenancy(prev => ({ ...prev, deposit_amount: e.target.value }))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block">Scheme</label>
                    <select
                      value={newTenancy.deposit_scheme}
                      onChange={(e) => setNewTenancy(prev => ({ ...prev, deposit_scheme: e.target.value }))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    >
                      <option value="Deposit Protection Service (DPS Custodial)">DPS Custodial</option>
                      <option value="Tenancy Deposit Scheme (TDS Insured)">TDS Insured</option>
                      <option value="MyDeposits">MyDeposits</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={newTenancy.prescribed_info_given}
                    onChange={(e) => setNewTenancy(prev => ({ ...prev, prescribed_info_given: e.target.checked }))}
                    className="w-4 h-4 text-sky-600 rounded"
                  />
                  <span>Statutory Prescribed Information countersigned</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAddTenancyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20"
                >
                  Save Tenancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
