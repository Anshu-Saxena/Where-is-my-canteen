import React, { useEffect, useState } from 'react';
import { Clock, Plus, Trash2, CheckCircle2, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSlots } from '../../contexts/SlotContext';

export default function OwnerSlotsPage() {
  const { user } = useAuth();
  const canteenId = user?.canteenId || 'canteen-1';
  const canteenName = user?.canteenName || 'Canteen';

  const { getSlots, loadSlots, addSlot, updateSlot, toggleSlot, deleteSlot, remainingInSlot } = useSlots();
  const slots = getSlots(canteenId);

  const [newTime, setNewTime] = useState('');
  const [newCapacity, setNewCapacity] = useState('20');
  const [savedNotice, setSavedNotice] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');

  useEffect(() => {
    loadSlots(canteenId).catch(error => setErrorNotice(error.message));
  }, [canteenId]);

  const handleAddSlot = async () => {
    setErrorNotice('');
    if (!newTime.trim()) {
      setErrorNotice('Please enter a time window, e.g. 12:30 PM - 12:35 PM');
      return;
    }
    try {
      await addSlot(canteenId, { time: newTime.trim(), capacity: newCapacity });
      setNewTime('');
      setNewCapacity('20');
    } catch (error) {
      setErrorNotice(error.message);
    }
  };

  const handleUpdateCapacity = async (slotId, newCapacity) => {
    try {
      await updateSlot(canteenId, slotId, { capacity: parseInt(newCapacity, 10) || 20 });
      setErrorNotice('');
    } catch (error) {
      setErrorNotice(error.message);
    }
  };

  const handleToggleSlot = async slotId => {
    try {
      await toggleSlot(canteenId, slotId);
      setErrorNotice('');
    } catch (error) {
      setErrorNotice(error.message);
    }
  };

  const handleDeleteSlot = async slotId => {
    try {
      await deleteSlot(canteenId, slotId);
      setErrorNotice('');
    } catch (error) {
      setErrorNotice(error.message);
    }
  };

  const handleSave = () => {
    // Changes are persisted live via the slot store; this confirms to the owner.
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brandText-primary dark:text-cream">
            Pickup Slots & Capacity Management
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Configure 15-minute order limits to prevent kitchen overcrowding during lunch rush
          </p>
        </div>

        <button
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
          <span>Pickup slot configuration saved successfully!</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs">
          {errorNotice}
        </div>
      )}

      {/* Add new slot */}
      <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-5 shadow-subtle space-y-3">
        <h3 className="font-bold text-sm text-brandText-primary dark:text-cream">
          Create a new pickup window
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            placeholder="e.g. 12:30 PM - 12:35 PM"
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-xs font-medium text-brandText-primary dark:text-cream"
          />
          <input
            type="number"
            value={newCapacity}
            onChange={(e) => setNewCapacity(e.target.value)}
            placeholder="Max orders"
            className="w-full sm:w-32 px-3.5 py-2.5 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-xs font-medium text-brandText-primary dark:text-cream"
          />
          <button
            type="button"
            onClick={handleAddSlot}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-forest/90 transition flex items-center justify-center gap-1.5 shadow-subtle"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* Slot Allocation Grid */}
      <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
          <h3 className="font-bold text-sm text-brandText-primary dark:text-cream">
            Daily 15-Minute Windows &amp; Max Tokens
          </h3>
          <span className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary">{canteenName}</span>
        </div>

        {slots.length === 0 ? (
          <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary py-6 text-center">
            No pickup slots configured yet. Add your first window above.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {slots.map(slot => (
              <div
                key={slot.id}
                className={`p-4 rounded-xl border transition flex items-center justify-between gap-3 ${
                  slot.isAvailable
                    ? 'border-brandBorder-light dark:border-brandBorder-dark bg-cream-100 dark:bg-brandBorder-dark/40'
                    : 'border-brandBorder-light dark:border-brandBorder-dark bg-cream-100/40 opacity-60'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-brandText-primary dark:text-cream">
                    <Clock className="w-3.5 h-3.5 text-forest dark:text-sage shrink-0" />
                    <span className="truncate">{slot.time}</span>
                  </div>
                  <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
                    Booked today: <strong>{slot.currentBookings}</strong> / {slot.capacity} · {remainingInSlot(slot)} left
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-xs text-brandText-secondary dark:text-brandText-darkSecondary">
                    <span>Max:</span>
                    <input
                      type="number"
                      value={slot.capacity}
                      onChange={(e) => handleUpdateCapacity(slot.id, e.target.value)}
                      className="w-14 px-2 py-1 rounded-lg border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-xs text-center font-bold text-brandText-primary dark:text-cream"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleSlot(slot.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                      slot.isAvailable
                        ? 'bg-sage/20 text-forest dark:text-sage border border-sage/40'
                        : 'bg-cream-200 dark:bg-brandBorder-dark/40 text-brandText-secondary dark:text-brandText-darkSecondary'
                    }`}
                  >
                    {slot.isAvailable ? 'Enabled' : 'Paused'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(slot.id)}
                    title="Delete slot"
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
