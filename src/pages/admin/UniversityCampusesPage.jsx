import React, { useState } from 'react';
import { Building2, Plus, MapPin, CheckCircle2 } from 'lucide-react';
import { UNIVERSITIES } from '../../data/mockData';

export default function UniversityCampusesPage() {
  const dtu = UNIVERSITIES[0];
  const [campuses, setCampuses] = useState(dtu.campuses);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCampuses([
      ...campuses,
      {
        id: `campus-${Date.now()}`,
        name,
        location,
        canteensCount: 1,
        isPopular: false
      }
    ]);
    setName('');
    setLocation('');
    setIsAdding(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brandText-primary dark:text-cream">
            Campus Locations Management
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Registered campuses under {dtu.name}
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-forest/90 transition flex items-center gap-2 shadow-subtle"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Campus</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-brandCard-dark p-5 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle space-y-3 text-xs">
          <h3 className="font-bold text-sm text-brandText-primary dark:text-cream">Add Campus Location</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Campus Name (e.g. West Campus, Kirti Nagar)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
            />
            <input
              type="text"
              required
              placeholder="Full Address & Pin Code"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark text-brandText-secondary dark:text-brandText-darkSecondary hover:text-brandText-primary dark:hover:text-cream"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-forest/90"
            >
              Register Campus
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campuses.map(campus => (
          <div
            key={campus.id}
            className="p-6 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-forest/10 dark:bg-forest/30 flex items-center justify-center text-forest dark:text-sage font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-brandText-primary dark:text-cream">
                    {campus.name}
                  </h3>
                </div>

                {campus.isPopular && (
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-sage/20 text-forest dark:text-sage">
                    Main Campus
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-2">
                <MapPin className="w-4 h-4 text-brandText-secondary dark:text-brandText-darkSecondary flex-shrink-0" />
                <span>{campus.location}</span>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-brandBorder-light dark:border-brandBorder-dark flex items-center justify-between text-xs">
              <span className="font-medium text-brandText-primary dark:text-cream">
                🍴 {campus.canteensCount} Active Canteens
              </span>
              <span className="text-forest dark:text-sage font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Operational</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
