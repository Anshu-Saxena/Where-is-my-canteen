import React, { useState } from 'react';
import { Store, Clock, Phone, MapPin, Check, Save } from 'lucide-react';

export default function OwnerSettingsPage() {
  const [openingHours, setOpeningHours] = useState('8:30 AM - 9:00 PM');
  const [isOpenNow, setIsOpenNow] = useState(true);
  const [allowPayAtCounter, setAllowPayAtCounter] = useState(true);
  const [managerPhone, setManagerPhone] = useState('+91 98712 34567');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brandText-primary dark:text-cream">
          Canteen Operational Settings
        </h1>
        <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
          Configure operating hours, contact telephone, and counter payment policies
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-sage/20 text-forest dark:text-sage border border-sage/40 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Operational settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-subtle space-y-5">
        <h3 className="font-bold text-sm text-brandText-primary dark:text-cream pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark flex items-center gap-2">
          <Store className="w-4 h-4 text-forest dark:text-sage" />
          <span>Nescafe & Central Cafeteria</span>
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1 text-brandText-secondary dark:text-brandText-darkSecondary">
              Canteen Live Status
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOpenNow(true)}
                className={`px-4 py-2 rounded-xl font-semibold transition ${
                  isOpenNow
                    ? 'bg-primary text-white'
                    : 'bg-cream-100 text-brandText-secondary dark:text-brandText-darkSecondary border border-brandBorder-light dark:border-brandBorder-dark'
                }`}
              >
                ● Open for Pre-Orders
              </button>
              <button
                type="button"
                onClick={() => setIsOpenNow(false)}
                className={`px-4 py-2 rounded-xl font-semibold transition ${
                  !isOpenNow
                    ? 'bg-red-600 text-white'
                    : 'bg-cream-100 text-brandText-secondary dark:text-brandText-darkSecondary border border-brandBorder-light dark:border-brandBorder-dark'
                }`}
              >
                ● Temporarily Closed
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-brandText-secondary dark:text-brandText-darkSecondary">
                Daily Operating Hours
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-brandText-secondary dark:text-brandText-darkSecondary">
                Kitchen Manager Helpline
              </label>
              <input
                type="text"
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-brandText-primary dark:text-cream"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start justify-between gap-4 p-4 rounded-xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark cursor-pointer">
              <div>
                <p className="font-semibold text-brandText-primary dark:text-cream">
                  Allow "Pay at Counter" for students
                </p>
                <p className="text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
                  Allows students to book tokens without immediate UPI/card prepayment
                </p>
              </div>
              <input
                type="checkbox"
                checked={allowPayAtCounter}
                onChange={(e) => setAllowPayAtCounter(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-forest focus:ring-forest accent-forest"
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-brandBorder-light dark:border-brandBorder-dark flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-forest/90 transition flex items-center gap-1.5 shadow-subtle"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
