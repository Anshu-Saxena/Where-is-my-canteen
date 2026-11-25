import React, { useState } from 'react';
import { ShieldCheck, Save, Check, Bell, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUniversity } from '../../contexts/UniversityContext';

export default function UniversitySettingsPage() {
  const { user } = useAuth();
  const { selectedUniversity } = useUniversity();

  const [autoApproveMenus, setAutoApproveMenus] = useState(false);
  const [requireHygieneAudit, setRequireHygieneAudit] = useState(true);
  const [maxSlotWindowMinutes, setMaxSlotWindowMinutes] = useState('30');
  const [complianceEmail, setComplianceEmail] = useState(user?.email || 'campus.admin@dtu.ac.in');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-brandText-primary dark:text-cream">
          University Governance Settings
        </h1>
        <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
          Configure compliance policies, vendor onboarding rules, and notifications for {selectedUniversity?.name}
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-sage-100 text-forest border border-sage-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>University governance settings saved.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="card p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-sm text-brandText-primary dark:text-cream">
            Compliance &amp; Vendor Onboarding
          </h2>
        </div>

        <label className="flex items-start justify-between gap-4 cursor-pointer text-xs">
          <div>
            <p className="font-semibold text-brandText-primary dark:text-cream">
              Require FSSAI &amp; Hygiene Audit Before Onboarding
            </p>
            <p className="text-brandText-secondary mt-0.5">
              New canteen vendors must pass campus safety verification before accepting orders
            </p>
          </div>
          <input
            type="checkbox"
            checked={requireHygieneAudit}
            onChange={(e) => setRequireHygieneAudit(e.target.checked)}
            className="mt-1 w-4 h-4 accent-primary"
          />
        </label>

        <label className="flex items-start justify-between gap-4 cursor-pointer text-xs">
          <div>
            <p className="font-semibold text-brandText-primary dark:text-cream">
              Auto-Approve Menu Price Revisions
            </p>
            <p className="text-brandText-secondary mt-0.5">
              Allow verified canteens to update menu prices without manual admin sign-off
            </p>
          </div>
          <input
            type="checkbox"
            checked={autoApproveMenus}
            onChange={(e) => setAutoApproveMenus(e.target.checked)}
            className="mt-1 w-4 h-4 accent-primary"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div>
            <label className="block font-semibold mb-1.5 text-brandText-primary dark:text-cream flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Standard Pickup Window (mins)
            </label>
            <select
              value={maxSlotWindowMinutes}
              onChange={(e) => setMaxSlotWindowMinutes(e.target.value)}
              className="field"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1.5 text-brandText-primary dark:text-cream flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-primary" />
              Compliance Alert Email
            </label>
            <input
              type="email"
              value={complianceEmail}
              onChange={(e) => setComplianceEmail(e.target.value)}
              className="field"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-brandBorder-light dark:border-brandBorder-dark flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-colors shadow-subtle"
          >
            <Save className="w-4 h-4" />
            <span>Save Policies</span>
          </button>
        </div>
      </form>
    </div>
  );
}
