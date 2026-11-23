import React, { useState } from 'react';
import { Clock, Plus, Trash2, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { PICKUP_SLOTS } from '../../data/mockData';

export default function OwnerSlotsPage() {
  const [slots, setSlots] = useState(PICKUP_SLOTS);
  const [prepTimeEstimate, setPrepTimeEstimate] = useState('10-15 mins');
  const [savedNotice, setSavedNotice] = useState(false);

  const toggleSlotAvailability = (slotId) => {
    setSlots(prev =>
      prev.map(s => (s.id === slotId ? { ...s, isAvailable: !s.isAvailable } : s))
    );
  };

  const handleUpdateCapacity = (slotId, newCapacity) => {
    setSlots(prev =>
      prev.map(s => (s.id === slotId ? { ...s, capacity: parseInt(newCapacity, 10) || 20 } : s))
    );
  };

  const handleSave = () => {
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

      {/* Global Prep Time Setting */}
      <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-brandText-primary dark:text-cream">
            Average Kitchen Preparation Time Estimate
          </h3>
          <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
            Shown to students on the canteen discovery card
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={prepTimeEstimate}
            onChange={(e) => setPrepTimeEstimate(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-xs font-semibold text-brandText-primary dark:text-cream"
          >
            <option value="5-10 mins">5-10 mins (Express / Snacks)</option>
            <option value="10-15 mins">10-15 mins (Standard Meals)</option>
            <option value="15-20 mins">15-20 mins (Heavy Thalis / Fresh Dosa)</option>
            <option value="20-25 mins">20-25 mins (Peak Rush)</option>
          </select>
        </div>
      </div>

      {/* Slot Allocation Grid */}
      <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-subtle space-y-4">
        <h3 className="font-bold text-sm text-brandText-primary dark:text-cream pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
          Daily 15-Minute Windows & Max Tokens
        </h3>

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
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brandText-primary dark:text-cream">
                  <Clock className="w-3.5 h-3.5 text-forest dark:text-sage" />
                  <span>{slot.time}</span>
                </div>
                <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
                  Booked today: <strong>{slot.currentBookings}</strong> / {slot.capacity}
                </p>
              </div>

              <div className="flex items-center gap-2">
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
                  onClick={() => toggleSlotAvailability(slot.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                    slot.isAvailable
                      ? 'bg-sage/20 text-forest dark:text-sage border border-sage/40'
                      : 'bg-cream-200 dark:bg-brandBorder-dark/40 text-brandText-secondary dark:text-brandText-darkSecondary'
                  }`}
                >
                  {slot.isAvailable ? 'Enabled' : 'Paused'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
