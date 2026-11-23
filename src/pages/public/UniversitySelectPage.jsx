import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Building,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Clock,
  ArrowRight
} from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';
import { useUniversity } from '../../contexts/UniversityContext';
import { useAuth } from '../../contexts/AuthContext';
import BrandLogo from '../../components/common/BrandLogo';

export default function UniversitySelectPage() {
  const { universities, selectedUniversity, selectedCampus, selectUniversityAndCampus, recentlyVisited } = useUniversity();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeUni, setActiveUni] = useState(selectedUniversity || universities[0]);

  const filteredUniversities = useMemo(() => {
    if (!searchTerm.trim()) return universities;
    const q = searchTerm.toLowerCase();
    return universities.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.state.toLowerCase().includes(q) ||
        u.shortName.toLowerCase().includes(q)
    );
  }, [universities, searchTerm]);

  const handleSelectCampus = (uni, campus) => {
    selectUniversityAndCampus(uni, campus);
    navigate('/student/dashboard');
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
            <span className="text-xs font-medium text-brandText-secondary">
              Logged in as <strong className="text-brandText-primary dark:text-cream">{user?.name}</strong>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
        {/* Title & Search */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-forest dark:text-sage-300 uppercase tracking-wider">
            Campus Network
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brandText-primary dark:text-cream mt-1">
            Select Your Institution & Campus
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-2">
            Connect to your institution's verified food courts and cafeterias
          </p>

          {/* Search Bar */}
          <div className="relative mt-6 max-w-lg mx-auto">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-brandText-secondary" />
            <input
              type="text"
              placeholder="Search by university name, city (e.g. Delhi, Mumbai, Manipal)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark text-xs sm:text-sm text-brandText-primary dark:text-cream placeholder:text-brandText-secondary focus:outline-none focus:border-sage shadow-subtle"
            />
          </div>
        </div>

        {/* Recently Visited Campuses (if any) */}
        {recentlyVisited.length > 0 && !searchTerm && (
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
                    <Building className="w-3.5 h-3.5 text-forest dark:text-sage-300 group-hover:scale-105 transition-transform stroke-[1.8]" />
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-brandText-secondary mb-2">
              Universities & Colleges ({filteredUniversities.length})
            </h3>

            {filteredUniversities.map(uni => {
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
                  <div className="flex items-center gap-3.5">
                    <img
                      src={uni.logo}
                      alt={uni.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-brandText-primary dark:text-cream">
                          {uni.name}
                        </h4>
                        {uni.verified && (
                          <span title="Verified Campus" className="inline-flex">
                            <CheckCircle2 className="w-4 h-4 text-forest dark:text-sage-300 stroke-[2]" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-brandText-secondary mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
                        <span>{uni.city}, {uni.state}</span>
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
            })}
          </div>

          {/* Campuses of Selected University (5 Cols) */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-white dark:bg-brandCard-dark rounded-3xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-soft">
              <div className="pb-4 border-b border-brandBorder-light dark:border-brandBorder-dark">
                <span className="text-[11px] font-bold uppercase tracking-wider text-forest dark:text-sage-300">
                  Step 2: Choose Campus
                </span>
                <h3 className="font-extrabold text-base sm:text-lg text-brandText-primary dark:text-cream mt-1">
                  {activeUni?.name}
                </h3>
                <p className="text-xs text-brandText-secondary mt-0.5">
                  Select your campus location to browse active canteens
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {activeUni?.campuses.map(campus => {
                  const isCurrentCampus = selectedCampus?.id === campus.id && selectedUniversity?.id === activeUni.id;

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
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-100 text-forest dark:bg-forest/60 dark:text-cream">
                            Main Campus
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-brandText-secondary leading-relaxed mb-3">
                        {campus.location}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-brandBorder-light dark:border-brandBorder-dark text-xs">
                        <span className="text-brandText-secondary font-medium">
                          🍴 {campus.canteensCount} Food Canteens
                        </span>

                        <button
                          type="button"
                          onClick={() => handleSelectCampus(activeUni, campus)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-bold text-xs bg-primary text-white hover:bg-primary-600 transition shadow-subtle"
                        >
                          <span>{isCurrentCampus ? 'Continue' : 'Select'}</span>
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
