import React, { useState } from 'react';
import {
  Bell,
  Moon,
  Sun,
  Shield,
  Smartphone,
  Check
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/common/ThemeToggle';

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();

  const [orderReadyAlerts, setOrderReadyAlerts] = useState(true);
  const [slotReminders, setSlotReminders] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brandText-primary dark:text-cream">
          App Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
          Customize notifications, display theme, and counter alert sounds
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-sage-100 text-forest border border-sage-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 stroke-[2]" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Theme Settings */}
      <div className="bg-white dark:bg-brandCard-dark rounded-3xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-subtle space-y-4">
        <h3 className="font-bold text-sm text-brandText-primary dark:text-cream pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark flex items-center gap-2">
          {isDark ? <Moon className="w-4 h-4 text-forest dark:text-sage-300 stroke-[2]" /> : <Sun className="w-4 h-4 text-accent stroke-[2]" />}
          <span>Theme & Appearance</span>
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-xs text-brandText-primary dark:text-cream">
              Color Mode: <strong className="text-forest dark:text-sage-300">{isDark ? 'Charcoal Night' : 'Cream & Terracotta'}</strong>
            </p>
            <p className="text-xs text-brandText-secondary mt-0.5">
              Comfortable, natural tones for bright sunlight or evening reading
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-brandCard-dark rounded-3xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-subtle space-y-4">
        <h3 className="font-bold text-sm text-brandText-primary dark:text-cream pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark flex items-center gap-2">
          <Bell className="w-4 h-4 text-forest dark:text-sage-300 stroke-[2]" />
          <span>Notification & Alert Preferences</span>
        </h3>

        <div className="space-y-4 text-xs">
          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <p className="font-semibold text-brandText-primary dark:text-cream">
                Order Ready for Pickup Alerts
              </p>
              <p className="text-brandText-secondary mt-0.5">
                Receive vibration & notification when kitchen marks your food ready
              </p>
            </div>
            <input
              type="checkbox"
              checked={orderReadyAlerts}
              onChange={(e) => setOrderReadyAlerts(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-forest focus:ring-forest"
            />
          </label>

          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <p className="font-semibold text-brandText-primary dark:text-cream">
                Pickup Slot Reminder
              </p>
              <p className="text-brandText-secondary mt-0.5">
                5-minute alert before your chosen 15-minute slot window begins
              </p>
            </div>
            <input
              type="checkbox"
              checked={slotReminders}
              onChange={(e) => setSlotReminders(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-forest focus:ring-forest"
            />
          </label>

          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <p className="font-semibold text-brandText-primary dark:text-cream">
                Counter Audio Chimes
              </p>
              <p className="text-brandText-secondary mt-0.5">
                Pleasant sound when your digital token updates status
              </p>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-forest focus:ring-forest"
            />
          </label>

          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <p className="font-semibold text-brandText-primary dark:text-cream">
                Campus Specials & Fresh Menu Alerts
              </p>
              <p className="text-brandText-secondary mt-0.5">
                Periodic announcements of fresh breakfast specials and seasonal items
              </p>
            </div>
            <input
              type="checkbox"
              checked={promoAlerts}
              onChange={(e) => setPromoAlerts(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-forest focus:ring-forest"
            />
          </label>
        </div>

        <div className="pt-3 border-t border-brandBorder-light dark:border-brandBorder-dark flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-primary-600 transition shadow-subtle"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
