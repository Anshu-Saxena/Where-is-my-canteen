import React, { useEffect, useState } from 'react';
import { Building2, Search, CheckCircle2, MapPin, PlusCircle, X } from 'lucide-react';
import { adminService } from '../../services/api';
import { INDIA_STATES_AND_UTS, INSTITUTION_TYPES } from '../../data/indiaInstitutions';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

export default function PlatformUniversitiesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Add institution modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [type, setType] = useState('Private University');
  const [campusName, setCampusName] = useState('');
  const [campusLocation, setCampusLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let active = true;
    adminService
      .getPlatformAdminData()
      .then(res => {
        if (active) setData(res);
      })
      .catch(err => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleAddInstitution = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const created = await adminService.createUniversity({
        name: name.trim(),
        shortName: shortName.trim() || name.trim().slice(0, 12),
        city: city.trim(),
        state,
        type,
        campusName: campusName.trim() || `${city.trim()} Campus`,
        campusLocation: campusLocation.trim() || `${city.trim()}, ${state}`
      });
      setData(prev => ({
        ...prev,
        universities: [created, ...(prev?.universities || [])]
      }));
      setIsAddOpen(false);
      setName('');
      setShortName('');
      setCity('');
      setCampusName('');
      setCampusLocation('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton count={4} />;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  const universities = (data?.universities || []).filter(u => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q) ||
      u.state?.toLowerCase().includes(q) ||
      u.type?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brandText-primary dark:text-cream">
            Registered Universities &amp; Colleges
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            All partner institutions onboarded to the Where is my Canteen network ({universities.length})
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-semibold transition-colors shadow-subtle"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Institution</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brandText-secondary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search universities by name, city, state or type..."
          className="field pl-10 text-xs sm:text-sm"
        />
      </div>

      {universities.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No universities found"
          description="Try clearing your search query."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {universities.map(uni => (
            <div key={uni.id} className="card p-5 flex items-start justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <h3 className="font-bold text-sm text-brandText-primary dark:text-cream truncate">
                  {uni.name}
                </h3>
                <p className="text-xs text-brandText-secondary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{uni.city}, {uni.state}</span>
                </p>
                <p className="text-2xs text-brandText-secondary">
                  {uni.type || 'University'} · Campuses: <strong>{uni.campuses?.length || uni.totalCampuses || 1}</strong>
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-100 text-forest text-[11px] font-bold shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                {uni.status || (uni.verified ? 'Verified' : 'Active')}
              </span>
            </div>
          ))}
        </div>
      )}

      {isAddOpen && (
        <div
          onClick={() => setIsAddOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-elevated space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-brandText-primary dark:text-cream">
                Add New Institution
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-full hover:bg-cream-100 dark:hover:bg-brandBorder-dark"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {formError && <p className="text-xs text-rose-600">{formError}</p>}
            <form onSubmit={handleAddInstitution} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Institution Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. GLA University"
                  className="field"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Short Name *</label>
                  <input
                    type="text"
                    required
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="e.g. GLA"
                    className="field"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mathura"
                    className="field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">State / UT</label>
                  <select value={state} onChange={(e) => setState(e.target.value)} className="field">
                    {INDIA_STATES_AND_UTS.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="field">
                    {INSTITUTION_TYPES.filter(t => t !== 'All').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Initial Campus Name</label>
                <input
                  type="text"
                  value={campusName}
                  onChange={(e) => setCampusName(e.target.value)}
                  placeholder="e.g. Mathura Main Campus"
                  className="field"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Campus Address</label>
                <input
                  type="text"
                  value={campusLocation}
                  onChange={(e) => setCampusLocation(e.target.value)}
                  placeholder="Full campus address"
                  className="field"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-600"
                >
                  {saving ? 'Saving...' : 'Create Institution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
