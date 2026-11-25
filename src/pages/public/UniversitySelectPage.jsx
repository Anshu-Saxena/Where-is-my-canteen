import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Building,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Clock,
  ArrowRight,
  X,
  PlusCircle,
  Check
} from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';
import { useUniversity } from '../../contexts/UniversityContext';
import { useAuth } from '../../contexts/AuthContext';
import BrandLogo from '../../components/common/BrandLogo';
import { INSTITUTION_TYPES, INDIA_STATES_AND_UTS } from '../../data/indiaInstitutions';
import EmptyState from '../../components/common/EmptyState';

export default function UniversitySelectPage() {
  const {
    universities,
    selectedUniversity,
    selectedCampus,
    selectUniversityAndCampus,
    recentlyVisited,
    isLoading,
    loadError
  } = useUniversity();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [activeUni, setActiveUni] = useState(null);

  // Request unlisted college modal state
  const [requestOpen, setRequestOpen] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqCity, setReqCity] = useState('');
  const [reqState, setReqState] = useState('Uttar Pradesh');
  const [reqType, setReqType] = useState('Private University');
  const [reqCampus, setReqCampus] = useState('');
  const [reqSubmitted, setReqSubmitted] = useState(false);

  const availableCities = useMemo(() => {
    const citySet = new Set();
    universities.forEach(u => {
      if (selectedState === 'All' || u.state === selectedState) {
        if (u.city) citySet.add(u.city);
        (u.campuses || []).forEach(c => {
          if (c.city) citySet.add(c.city);
        });
      }
    });
    return ['All', ...Array.from(citySet).sort()];
  }, [universities, selectedState]);

  const filteredUniversities = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return universities.filter(u => {
      if (selectedState !== 'All') {
        const matchesUniState = u.state === selectedState;
        const matchesCampusState = (u.campuses || []).some(c => c.state === selectedState);
        if (!matchesUniState && !matchesCampusState) return false;
      }
      if (selectedCity !== 'All') {
        const matchesUniCity = u.city?.toLowerCase() === selectedCity.toLowerCase();
        const matchesCampusCity = (u.campuses || []).some(
          c => c.city?.toLowerCase() === selectedCity.toLowerCase() ||
            c.location?.toLowerCase().includes(selectedCity.toLowerCase())
        );
        if (!matchesUniCity && !matchesCampusCity) return false;
      }
      if (selectedType !== 'All' && u.type !== selectedType) {
        return false;
      }
      if (q) {
        const matchesMain =
          u.name?.toLowerCase().includes(q) ||
          u.shortName?.toLowerCase().includes(q) ||
          u.city?.toLowerCase().includes(q) ||
          u.state?.toLowerCase().includes(q) ||
          u.type?.toLowerCase().includes(q);
        const matchesCampus = (u.campuses || []).some(
          c =>
            c.name?.toLowerCase().includes(q) ||
            c.location?.toLowerCase().includes(q) ||
            c.city?.toLowerCase().includes(q) ||
            c.state?.toLowerCase().includes(q)
        );
        if (!matchesMain && !matchesCampus) return false;
      }
      return true;
    });
  }, [universities, searchTerm, selectedState, selectedCity, selectedType]);

  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return filteredUniversities.slice(0, 6);
  }, [filteredUniversities, searchTerm]);

  useEffect(() => {
    if (filteredUniversities.length === 0) {
      setActiveUni(null);
      return;
    }
    setActiveUni(prev => {
      if (prev && filteredUniversities.some(u => u.id === prev.id)) return prev;
      if (selectedUniversity && filteredUniversities.some(u => u.id === selectedUniversity.id)) {
        return selectedUniversity;
      }
      return filteredUniversities[0];
    });
  }, [filteredUniversities, selectedUniversity]);

  const handleSelectCampus = (uni, campus) => {
    selectUniversityAndCampus(uni, campus);
    navigate('/student/dashboard');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedState('All');
    setSelectedCity('All');
    setSelectedType('All');
    setShowSuggestions(false);
  };

  const hasFilters =
    Boolean(searchTerm.trim()) ||
    selectedState !== 'All' ||
    selectedCity !== 'All' ||
    selectedType !== 'All';

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!reqName.trim() || !reqCity.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem('wmc_college_requests') || '[]');
      existing.unshift({
        id: `creq-${Date.now()}`,
        name: reqName.trim(),
        city: reqCity.trim(),
        state: reqState,
        type: reqType,
        campus: reqCampus.trim() || `${reqCity.trim()} Main Campus`,
        requestedAt: new Date().toISOString()
      });
      localStorage.setItem('wmc_college_requests', JSON.stringify(existing));
    } catch {
      // ignore storage errors
    }
    setReqSubmitted(true);
    setTimeout(() => {
      setReqSubmitted(false);
      setRequestOpen(false);
      setReqName('');
      setReqCity('');
      setReqCampus('');
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-brandBg-light dark:bg-brandBg-dark text-brandText-primary dark:text-brandText-darkPrimary flex flex-col transition-colors">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#FFF9F1] dark:bg-brandBg-dark border-b border-brandBorder-light dark:border-brandBorder-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-[13px] leading-tight text-brandText-primary dark:text-cream">
            <BrandLogo className="w-10 h-10 rounded-xl shadow-subtle" />
            <span>Where is my<br />Canteen</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user && (
              <span className="text-xs font-medium text-brandText-secondary hidden sm:inline">
                Logged in as <strong className="text-brandText-primary dark:text-cream">{user.name}</strong>
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
        {loadError && <p className="mb-4 text-xs text-rose-600">{loadError}</p>}

        {/* Title & Smart Institution Search */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="text-xs font-bold text-forest dark:text-sage-300 uppercase tracking-wider">
            All India Campus Network
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brandText-primary dark:text-cream mt-1">
            Select Your University &amp; Campus
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-2">
            Search verified central, state, private, deemed, engineering, medical &amp; management institutions across India
          </p>

          {/* Search Bar with Suggestions */}
          <div className="relative mt-6 max-w-2xl mx-auto text-left">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-brandText-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Search e.g. GLA University, DTU, Mathura, Noida, Delhi, Uttar Pradesh..."
              value={searchTerm}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              className="w-full pl-11 pr-10 py-3 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark text-xs sm:text-sm text-brandText-primary dark:text-cream placeholder:text-brandText-secondary focus:outline-none focus:border-primary shadow-subtle"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setShowSuggestions(false);
                }}
                aria-label="Clear search"
                className="absolute right-3 top-3 p-1 rounded-full text-brandText-secondary hover:text-brandText-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-elevated z-30 overflow-hidden divide-y divide-brandBorder-light dark:divide-brandBorder-dark">
                {suggestions.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveUni(item);
                      setSearchTerm(item.name);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-cream-50 dark:hover:bg-brandBorder-dark/40 text-left transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-brandText-primary dark:text-cream truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-brandText-secondary truncate">
                        {item.city}, {item.state} · {item.type || 'University'}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-primary shrink-0">
                      {item.campuses?.length || 1} campus{(item.campuses?.length || 1) > 1 ? 'es' : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* State, City & Institution Type Filters */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto">
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity('All');
              }}
              aria-label="Filter by state or UT"
              className="field text-xs font-semibold"
            >
              <option value="All">All States &amp; UTs</option>
              {INDIA_STATES_AND_UTS.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              aria-label="Filter by city"
              className="field text-xs font-semibold"
            >
              <option value="All">All Cities</option>
              {availableCities.filter(c => c !== 'All').map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter by institution type"
              className="field text-xs font-semibold"
            >
              {INSTITUTION_TYPES.map(t => (
                <option key={t} value={t}>{t === 'All' ? 'All Institution Types' : t}</option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <div className="mt-3 flex items-center justify-center gap-3 text-xs">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
              >
                <X className="w-3.5 h-3.5" />
                Clear selection &amp; filters
              </button>
            </div>
          )}
        </div>

        {/* Recently Visited Campuses */}
        {recentlyVisited.length > 0 && !hasFilters && (
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brandText-secondary mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-forest dark:text-sage-300 stroke-[2]" />
              Recently Visited Campuses
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {recentlyVisited.map((item, idx) => {
                const targetUni = universities.find(u => u.id === item.universityId);
                const targetCampus = targetUni?.campuses.find(c => c.id === item.campusId);

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (targetUni && targetCampus) {
                        handleSelectCampus(targetUni, targetCampus);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark hover:border-sage text-xs font-medium text-brandText-primary dark:text-cream transition shadow-subtle group"
                  >
                    <Building className="w-3.5 h-3.5 text-forest dark:text-sage-300 stroke-[1.8]" />
                    <span className="font-semibold">{item.universityName.split(' ')[0]}</span>
                    <span className="text-brandBorder-light dark:text-brandBorder-dark">•</span>
                    <span className="text-brandText-secondary">{item.campusName.split(',')[0]}</span>
                    <ChevronRight className="w-3 h-3 text-brandText-secondary group-hover:translate-x-0.5 transition-transform" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Universities List (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brandText-secondary">
                Universities &amp; Colleges ({filteredUniversities.length})
              </h3>
              <button
                type="button"
                onClick={() => setRequestOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>College not listed? Request addition</span>
              </button>
            </div>

            {isLoading ? (
              <p className="text-xs text-brandText-secondary">Loading institutions…</p>
            ) : filteredUniversities.length === 0 ? (
              <EmptyState
                icon={Building}
                title="No matching institutions found"
                description="Try clearing your filters or request to add your college or university to the platform."
                actionText="Request College Addition"
                onAction={() => setRequestOpen(true)}
              />
            ) : (
              filteredUniversities.map(uni => {
                const isSelected = activeUni?.id === uni.id;
                return (
                  <div
                    key={uni.id}
                    onClick={() => setActiveUni(uni)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-forest bg-white dark:bg-brandCard-dark shadow-soft ring-2 ring-forest/20'
                        : 'border-brandBorder-light dark:border-brandBorder-dark bg-white/80 dark:bg-brandCard-dark/60 hover:border-sage'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={uni.logo}
                        alt={uni.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm sm:text-base text-brandText-primary dark:text-cream truncate">
                            {uni.name}
                          </h4>
                          {uni.verified && (
                            <span title="Verified Institution" className="inline-flex shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-forest dark:text-sage-300 stroke-[2]" />
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-brandText-secondary mt-0.5">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
                            {uni.city}, {uni.state}
                          </span>
                          <span>•</span>
                          <span>{uni.type || 'University'}</span>
                          <span>•</span>
                          <span>{uni.campuses.length} Campus{uni.campuses.length > 1 ? 'es' : ''}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-2xl transition ${
                          isSelected
                            ? 'bg-primary text-white'
                            : 'bg-cream-100 dark:bg-brandBorder-dark text-brandText-primary dark:text-cream'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'View'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Campuses of Selected University (5 Cols) */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-white dark:bg-brandCard-dark rounded-3xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-soft">
              {activeUni ? (
                <>
                  <div className="pb-4 border-b border-brandBorder-light dark:border-brandBorder-dark">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-forest dark:text-sage-300">
                      Step 2: Choose Campus
                    </span>
                    <h3 className="font-extrabold text-base sm:text-lg text-brandText-primary dark:text-cream mt-1">
                      {activeUni.name}
                    </h3>
                    <p className="text-xs text-brandText-secondary mt-0.5">
                      {activeUni.type || 'Institution'} · {activeUni.city}, {activeUni.state}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    {activeUni.campuses.map(campus => {
                      const isCurrentCampus =
                        selectedCampus?.id === campus.id && selectedUniversity?.id === activeUni.id;

                      return (
                        <div
                          key={campus.id}
                          className="p-4 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark hover:border-sage transition bg-cream-50/50 dark:bg-brandBorder-dark/20"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 className="font-bold text-sm text-brandText-primary dark:text-cream">
                              {campus.name}
                            </h4>
                            {campus.isPopular && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-100 text-forest dark:bg-forest/60 dark:text-cream shrink-0">
                                Main Campus
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-brandText-secondary leading-relaxed mb-3">
                            {campus.location}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-brandBorder-light dark:border-brandBorder-dark text-xs">
                            <span className="text-brandText-secondary font-medium">
                              {campus.canteensCount} Food Canteen{campus.canteensCount === 1 ? '' : 's'}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleSelectCampus(activeUni, campus)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-bold text-xs bg-primary text-white hover:bg-primary-600 transition shadow-subtle"
                            >
                              <span>{isCurrentCampus ? 'Continue' : 'Select Campus'}</span>
                              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-xs text-brandText-secondary text-center py-6">
                  Select an institution on the left to view its campuses.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Request Unlisted Institution Modal */}
      {requestOpen && (
        <div
          onClick={() => setRequestOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-elevated space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-brandText-primary dark:text-cream">
                Request College / University Addition
              </h3>
              <button
                type="button"
                onClick={() => setRequestOpen(false)}
                className="p-1.5 rounded-full hover:bg-cream-100 dark:hover:bg-brandBorder-dark"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reqSubmitted ? (
              <div className="p-4 rounded-2xl bg-sage-100 text-forest text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Thank you! Your institution request has been recorded for platform admin review.</span>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Institution Name *</label>
                  <input
                    type="text"
                    required
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    placeholder="e.g. Banaras Hindu University"
                    className="field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={reqCity}
                      onChange={(e) => setReqCity(e.target.value)}
                      placeholder="e.g. Mathura"
                      className="field"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">State / UT</label>
                    <select
                      value={reqState}
                      onChange={(e) => setReqState(e.target.value)}
                      className="field"
                    >
                      {INDIA_STATES_AND_UTS.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Institution Type</label>
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value)}
                    className="field"
                  >
                    {INSTITUTION_TYPES.filter(t => t !== 'All').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Campus Name</label>
                  <input
                    type="text"
                    value={reqCampus}
                    onChange={(e) => setReqCampus(e.target.value)}
                    placeholder="e.g. Main Campus"
                    className="field"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestOpen(false)}
                    className="px-4 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-600"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
