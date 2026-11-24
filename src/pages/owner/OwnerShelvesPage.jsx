import React, { useEffect, useState } from 'react';
import {
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Wand2,
  MapPin,
  X,
  ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrderContext';
import { usePickup } from '../../contexts/PickupContext';
import { formatDateTime } from '../../utils/formatters';

export default function OwnerShelvesPage() {
  const { user } = useAuth();
  const canteenId = user?.canteenId || 'canteen-1';
  const canteenName = user?.canteenName || 'Canteen';

  const { orders, assignShelf, markCollected } = useOrders();
  const {
    getShelfConfig,
    loadShelfConfig,
    saveShelfConfig,
    toggleShelvesEnabled,
    updateShelfConfig,
    addShelf,
    removeShelf,
    nextAvailableShelf,
    loadingCanteens
  } = usePickup();

  const config = getShelfConfig(canteenId);
  const readyOrders = orders.filter(o => o.canteenId === canteenId && o.status === 'Ready for Pickup');
  const collectedOrders = orders
    .filter(o => o.canteenId === canteenId && o.status === 'Completed' && o.collectedAt)
    .slice(0, 8);
  const uncollected = readyOrders.filter(o => !o.collectedAt);

  const [newShelf, setNewShelf] = useState('');
  const [shelfError, setShelfError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const [instructions, setInstructions] = useState(config.instructions);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadShelfConfig(canteenId).catch(error => setShelfError(error.message));
  }, [canteenId, loadShelfConfig]);

  useEffect(() => {
    setInstructions(config.instructions);
  }, [config.instructions]);

  const usedLabels = readyOrders.map(o => o.pickupShelf).filter(Boolean);

  const handleAddShelf = () => {
    const res = addShelf(canteenId, newShelf);
    setShelfError(res.success ? '' : res.message);
    if (res.success) setNewShelf('');
  };

  const handleAutoAssign = async (orderId) => {
    const shelf = nextAvailableShelf(canteenId, usedLabels);
    if (shelf) {
      try {
        await assignShelf(orderId, shelf);
        setShelfError('');
      } catch (error) {
        setShelfError(error.message);
      }
    }
    else setShelfError('No free shelf available. Add more shelves or free one up.');
  };

  const handleAssignShelf = async (orderId, shelf) => {
    try {
      await assignShelf(orderId, shelf);
      setShelfError('');
    } catch (error) {
      setShelfError(error.message);
    }
  };

  const handleCollect = async orderId => {
    try {
      await markCollected(orderId);
      setShelfError('');
    } catch (error) {
      setShelfError(error.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setShelfError('');
    try {
      await saveShelfConfig(canteenId, { instructions });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    } catch (error) {
      setShelfError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brandText-primary dark:text-cream">
            Pickup Shelves &amp; Collection
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Assign prepared orders to a shelf and record collection — for {canteenName}
          </p>
        </div>
        <button
          type="button"
          disabled={saving || Boolean(loadingCanteens[canteenId])}
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-forest/90 transition flex items-center gap-1.5 shadow-subtle"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-sage/20 text-forest dark:text-sage border border-sage/40 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Shelf configuration saved successfully!</span>
        </div>
      )}

      {/* Shelf configuration */}
      <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
          <h3 className="font-bold text-sm text-brandText-primary dark:text-cream">Shelf Configuration</h3>
          <button
            type="button"
            disabled={Boolean(loadingCanteens[canteenId])}
            onClick={() => toggleShelvesEnabled(canteenId)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
              config.enabled
                ? 'bg-sage/20 text-forest dark:text-sage border border-sage/40'
                : 'bg-cream-200 dark:bg-brandBorder-dark/40 text-brandText-secondary dark:text-brandText-darkSecondary'
            }`}
          >
            {config.enabled ? 'Shelves Enabled' : 'Shelves Disabled'}
          </button>
        </div>

        <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary">
          Not every canteen has physical pickup shelves. Disable this if students should collect at the counter instead.
        </p>

        {config.enabled && (
          <>
            <label className="flex items-center gap-2 text-xs font-medium text-brandText-primary dark:text-cream">
              <input
                type="checkbox"
                checked={config.autoAssign}
                onChange={(e) => updateShelfConfig(canteenId, { autoAssign: e.target.checked })}
                className="accent-forest"
              />
              Suggest the next free shelf automatically for new ready orders
            </label>

            <div>
              <p className="text-xs font-semibold text-brandText-primary dark:text-cream mb-2">Shelf labels</p>
              <div className="flex flex-wrap gap-2">
                {config.shelves.length === 0 && (
                  <span className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary">No shelves added yet.</span>
                )}
                {config.shelves.map(label => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark text-xs font-mono font-bold text-brandText-primary dark:text-cream"
                  >
                    {label}
                    <button type="button" onClick={() => removeShelf(canteenId, label)} className="text-rose-500 hover:text-rose-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  value={newShelf}
                  onChange={(e) => setNewShelf(e.target.value)}
                  placeholder="e.g. C1"
                  className="w-28 px-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-xs font-medium text-brandText-primary dark:text-cream uppercase"
                />
                <button
                  type="button"
                  onClick={handleAddShelf}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-forest/90 transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add shelf
                </button>
              </div>
              {shelfError && <p className="text-2xs text-rose-600 mt-2">{shelfError}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-brandText-primary dark:text-cream mb-1.5">
                Collection instructions shown to students
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-xs text-brandText-primary dark:text-cream resize-none"
              />
            </div>
          </>
        )}
      </div>

      {/* Pickup management */}
      <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
          <h3 className="font-bold text-sm text-brandText-primary dark:text-cream">Ready for Pickup</h3>
          <span className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary">
            {uncollected.length} awaiting collection
          </span>
        </div>

        {readyOrders.length === 0 ? (
          <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary py-6 text-center">
            No orders are marked ready for pickup right now.
          </p>
        ) : (
          <div className="space-y-3">
            {readyOrders.map(order => (
              <div
                key={order.id}
                className="p-4 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-cream-100 dark:bg-brandBorder-dark/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-forest text-cream grid place-items-center font-mono font-bold text-sm">
                      {order.tokenNumber}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brandText-primary dark:text-cream">
                        #{order.id} · {order.customerName}
                      </p>
                      <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
                        Slot {order.pickupSlot} · {order.items.length} items
                      </p>
                    </div>
                  </div>

                  {config.enabled && (
                    <div className="text-right shrink-0">
                      <p className="text-[10px] uppercase font-bold text-brandText-secondary tracking-wide">Shelf</p>
                      <p className="font-mono font-extrabold text-forest dark:text-sage text-base">
                        {order.pickupShelf || '—'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {config.enabled && (
                    <>
                      <select
                        value={order.pickupShelf || ''}
                        onChange={(e) => handleAssignShelf(order.id, e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-xs font-semibold text-brandText-primary dark:text-cream"
                      >
                        <option value="">Assign shelf…</option>
                        {config.shelves.map(label => (
                          <option key={label} value={label}>{label}</option>
                        ))}
                      </select>
                      {config.autoAssign && (
                        <button
                          type="button"
                          onClick={() => handleAutoAssign(order.id)}
                          className="px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-semibold hover:bg-secondary-700 transition flex items-center gap-1.5"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          Auto-assign
                        </button>
                      )}
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCollect(order.id)}
                    className="px-3 py-1.5 rounded-lg bg-sage text-forest text-xs font-bold hover:bg-sage/90 transition flex items-center gap-1.5 ml-auto"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Collected
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collection records */}
      <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
          <h3 className="font-bold text-sm text-brandText-primary dark:text-cream flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-forest dark:text-sage" />
            Collection Records
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-sage/15 border border-sage/40">
            <p className="text-2xl font-extrabold text-forest dark:text-sage">{collectedOrders.length}</p>
            <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">Collected recently</p>
          </div>
          <div className="p-4 rounded-xl bg-softOrange-50 dark:bg-softOrange-950/30 border border-softOrange-200 dark:border-softOrange-900">
            <p className="text-2xl font-extrabold text-softOrange-700 dark:text-softOrange-300">{uncollected.length}</p>
            <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">Uncollected</p>
          </div>
        </div>

        {collectedOrders.length > 0 && (
          <div className="divide-y divide-brandBorder-light dark:divide-brandBorder-dark">
            {collectedOrders.map(order => (
              <div key={order.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <Package className="w-4 h-4 text-forest dark:text-sage shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-brandText-primary dark:text-cream truncate">
                      #{order.id} · Token {order.tokenNumber}
                    </p>
                    <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5 flex items-center gap-2">
                      {order.pickupShelf && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Shelf {order.pickupShelf}
                        </span>
                      )}
                      <span>Collected {formatDateTime(order.collectedAt)}</span>
                    </p>
                  </div>
                </div>
                <span className="text-2xs font-bold text-forest dark:text-sage shrink-0">Collected</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
