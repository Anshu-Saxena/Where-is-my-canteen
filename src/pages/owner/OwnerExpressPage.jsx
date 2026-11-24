import React, { useState, useEffect } from 'react';
import { Zap, Check, Store, Clock, Save, CheckCircle2 } from 'lucide-react';
import { useExpress } from '../../contexts/ExpressContext';
import { useMenu } from '../../contexts/MenuContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';

/**
 * Owner management for the Express Counter.
 * Enables the counter, sets its display name + separate prep time and assigns
 * which menu items are eligible for express ordering.
 */
export default function OwnerExpressPage() {
  const { user } = useAuth();
  const canteenId = user?.canteenId;
  const {
    getExpressConfig,
    loadExpressConfig,
    updateExpressConfig,
    toggleExpress,
    toggleExpressItem,
    loadingCanteens
  } = useExpress();
  const { getMenuItems, loadMenuItems } = useMenu();
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!canteenId) return;
    let active = true;
    Promise.all([
      loadExpressConfig(canteenId),
      loadMenuItems(canteenId)
    ]).catch(error => {
      if (active) setLoadError(error.message);
    });
    return () => {
      active = false;
    };
  }, [canteenId, loadExpressConfig, loadMenuItems]);

  const config = getExpressConfig(canteenId) || {
    enabled: false,
    counterName: 'Express Counter',
    prepTimeMinutes: 5,
    itemIds: []
  };
  const items = canteenId ? getMenuItems(canteenId) : [];

  const [counterName, setCounterName] = useState(config.counterName);
  const [prepTime, setPrepTime] = useState(config.prepTimeMinutes);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCounterName(config.counterName);
    setPrepTime(config.prepTimeMinutes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.counterName, config.prepTimeMinutes]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await updateExpressConfig(canteenId, {
        counterName: counterName.trim() || 'Express Counter',
        prepTimeMinutes: parseInt(prepTime, 10) || 5
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brandText-primary dark:text-cream flex items-center gap-2">
          <Zap className="w-6 h-6 text-softOrange-500 stroke-[2.2]" />
          Express Counter
        </h1>
        <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
          Fast-track queue for tea, coffee, snacks and pre-packed food with a separate prep time
        </p>
      </div>

      {loadError && <p className="text-xs text-rose-600">{loadError}</p>}
      {saveError && <p className="text-xs text-rose-600">{saveError}</p>}

      {/* Enable toggle + settings */}
      <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle p-5 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm text-brandText-primary dark:text-cream">
              Express counter status
            </p>
            <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
              When enabled, students can order express-eligible items from a dedicated section.
            </p>
          </div>
          <button
            disabled={Boolean(loadingCanteens[canteenId])}
            onClick={async () => {
              setSaveError('');
              try {
                await toggleExpress(canteenId);
              } catch (error) {
                setSaveError(error.message);
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              config.enabled
                ? 'bg-sage/20 text-forest dark:text-sage border border-sage/40'
                : 'bg-cream-200 dark:bg-brandBorder-dark/50 text-brandText-secondary border border-brandBorder-light dark:border-brandBorder-dark'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${config.enabled ? 'bg-forest' : 'bg-brandText-secondary'}`} />
            {config.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-brandBorder-light dark:border-brandBorder-dark">
          <div className="sm:col-span-2">
            <label className="block font-medium text-xs text-brandText-secondary dark:text-brandText-darkSecondary mb-1 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" /> Counter name / collection point
            </label>
            <input
              type="text"
              value={counterName}
              onChange={(e) => setCounterName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-xs text-brandText-primary dark:text-cream"
            />
          </div>
          <div>
            <label className="block font-medium text-xs text-brandText-secondary dark:text-brandText-darkSecondary mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Express prep (mins)
            </label>
            <input
              type="number"
              min="1"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-xs text-brandText-primary dark:text-cream"
            />
          </div>
          <div className="sm:col-span-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-forest/90 transition flex items-center gap-1.5 shadow-subtle"
            >
              <Save className="w-4 h-4" />
              Save settings
            </button>
            {saved && (
              <span className="text-xs font-semibold text-forest dark:text-sage-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Eligible items */}
      <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark overflow-hidden shadow-subtle">
        <div className="px-5 py-4 border-b border-brandBorder-light dark:border-brandBorder-dark flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-brandText-primary dark:text-cream">Express-eligible items</h2>
            <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
              Select the quick items that should be served from the express counter
            </p>
          </div>
          <span className="text-2xs font-bold px-2.5 py-1 rounded-full bg-sage/20 text-forest dark:text-sage">
            {config.itemIds.length} selected
          </span>
        </div>

        <div className="divide-y divide-brandBorder-light dark:divide-brandBorder-dark">
          {items.map(item => {
            const selected = config.itemIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                disabled={Boolean(loadingCanteens[canteenId])}
                onClick={async () => {
                  setSaveError('');
                  try {
                    await toggleExpressItem(canteenId, item.id);
                  } catch (error) {
                    setSaveError(error.message);
                  }
                }}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-cream-100/50 dark:hover:bg-brandBorder-dark/30 transition"
              >
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    selected
                      ? 'bg-forest border-forest text-white'
                      : 'border-brandBorder-light dark:border-brandBorder-dark'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </span>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded-xl object-cover border border-brandBorder-light dark:border-brandBorder-dark"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-brandText-primary dark:text-cream truncate">
                    {item.name}
                  </p>
                  <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary">
                    {item.category} • {formatCurrency(item.price)}
                  </p>
                </div>
                {!item.available && (
                  <span className="text-2xs font-bold text-rose-600 dark:text-rose-400">Sold out</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
