import React, { useEffect, useState } from 'react';
import { Star, ShieldCheck, Search } from 'lucide-react';
import { adminService } from '../../services/api';

export default function UniversityCanteensPage() {
  const [canteens, setCanteens] = useState([]);
  const [search, setSearch] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    adminService.getUniversityAdminData()
      .then(data => {
        if (active) setCanteens(data.canteensList);
      })
      .catch(error => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = canteens.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brandText-primary dark:text-cream">
            University Canteens & Vendor Licences
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Oversee canteen vendor contracts, food pricing guidelines, and hygiene compliance
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-brandText-secondary dark:text-brandText-darkSecondary" />
          <input
            type="text"
            placeholder="Search vendor or canteen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark text-xs text-brandText-primary dark:text-cream focus:outline-none focus:ring-2 focus:ring-sage"
          />
        </div>
      </div>

      {loadError && <p className="text-xs text-rose-600">{loadError}</p>}
      {loading && <p className="text-xs text-brandText-secondary">Loading university canteens…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(c => (
          <div
            key={c.id}
            className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-5 shadow-subtle space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <img
                  src={c.coverImage || ''}
                  alt={c.name}
                  className="w-16 h-16 rounded-xl object-cover border border-brandBorder-light dark:border-brandBorder-dark"
                />
                <div className="flex items-center gap-1 bg-softOrange/20 px-2.5 py-1 rounded-xl text-xs font-bold text-softOrange">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{c.rating}</span>
                </div>
              </div>

              <h3 className="font-bold text-base text-brandText-primary dark:text-cream">
                {c.name}
              </h3>
              <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">{c.location}</p>

              <div className="mt-3 p-3 rounded-xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark text-xs space-y-1">
                <p className="text-brandText-secondary dark:text-brandText-darkSecondary">Manager: <strong className="text-brandText-primary dark:text-cream">{c.ownerName}</strong></p>
                <p className="text-brandText-secondary dark:text-brandText-darkSecondary">Contact: {c.contactNumber}</p>
                <p className="text-brandText-secondary dark:text-brandText-darkSecondary">Operating: {c.openingHours}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-brandBorder-light dark:border-brandBorder-dark flex items-center justify-between text-xs">
              <span className="text-forest dark:text-sage font-medium flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Registered Canteen</span>
              </span>
              <span className="text-brandText-secondary dark:text-brandText-darkSecondary">
                {c.categories.length} Food Categories
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
