import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Store,
  ArrowRight,
  Timer
} from 'lucide-react';
import { useUniversity } from '../../contexts/UniversityContext';
import { useCart } from '../../contexts/CartContext';
import { useSlots } from '../../contexts/SlotContext';
import { canteenService } from '../../services/api';
import { indiaDateString, upcomingIndiaDates, INDIA_TIMEZONE } from '../../utils/dates';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const STATUS_BADGE = {
  available: {
    label: 'Available',
    classes: 'bg-sage-100 text-forest dark:bg-forest/50 dark:text-sage-200'
  },
  limited: {
    label: 'Limited',
    classes: 'bg-softOrange-100 text-softOrange-700 dark:bg-softOrange-950/60 dark:text-softOrange-300'
  },
  full: {
    label: 'Full',
    classes: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
  },
  past: {
    label: 'Past',
    classes: 'bg-cream-200 text-brandText-secondary dark:bg-brandBorder-dark dark:text-brandText-darkSecondary'
  }
};

export default function PickupWindowPage() {
  const { selectedCampus } = useUniversity();
  const { activeCanteen, cartItems } = useCart();
  const {
    loadSlots,
    getSlots,
    isSlotFull,
    remainingInSlot,
    selectedPickup,
    selectPickupWindow
  } = useSlots();
  const navigate = useNavigate();

  const dates = useMemo(() => upcomingIndiaDates(3), []);
  const [canteens, setCanteens] = useState([]);
  const [selectedCanteenId, setSelectedCanteenId] = useState(
    () => activeCanteen?.id || selectedPickup?.canteenId || ''
  );
  const [selectedDate, setSelectedDate] = useState(
    () => selectedPickup?.date || indiaDateString()
  );
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    canteenService
      .getCanteens({ campusId: selectedCampus?.id })
      .then(data => {
        if (!active) return;
        setCanteens(data);
        setSelectedCanteenId(prev => {
          if (prev && data.some(c => c.id === prev)) return prev;
          if (activeCanteen?.id && data.some(c => c.id === activeCanteen.id)) {
            return activeCanteen.id;
          }
          return data[0]?.id || '';
        });
      })
      .catch(err => {
        if (active) setErrorMsg(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedCampus?.id, activeCanteen?.id]);

  const currentCanteen = useMemo(
    () => canteens.find(c => c.id === selectedCanteenId) || null,
    [canteens, selectedCanteenId]
  );

  useEffect(() => {
    if (!currentCanteen) return;
    let active = true;
    setSlotsLoading(true);
    setErrorMsg('');
    loadSlots(currentCanteen.id, selectedDate, currentCanteen)
      .catch(err => {
        if (active) setErrorMsg(err.message);
      })
      .finally(() => {
        if (active) setSlotsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentCanteen, selectedDate, loadSlots]);

  const slots = currentCanteen ? getSlots(currentCanteen.id, selectedDate) : [];
  const availableSlotsCount = slots.filter(slot => !isSlotFull(slot)).length;

  const currentSelection =
    selectedPickup &&
    selectedPickup.canteenId === selectedCanteenId &&
    selectedPickup.date === selectedDate
      ? selectedPickup.slot
      : null;

  const estimatedPrep = useMemo(() => {
    if (cartItems.length > 0 && activeCanteen?.id === selectedCanteenId) {
      return currentCanteen?.estimatedPrepTime || '10-15 mins';
    }
    return currentCanteen?.estimatedPrepTime || '10-15 mins';
  }, [cartItems.length, activeCanteen?.id, selectedCanteenId, currentCanteen]);

  if (loading) {
    return <LoadingSkeleton count={4} />;
  }

  if (canteens.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="No canteens available"
        description="Select a campus with active canteens to schedule a pickup window."
        actionText="Select Campus"
        actionLink="/select-university"
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brandText-primary dark:text-cream">
            Pickup Window Scheduler
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Reserve a live pickup slot based on canteen opening hours ({INDIA_TIMEZONE} / IST)
          </p>
        </div>
        <Link
          to="/student/pickup"
          className="text-xs font-semibold text-primary hover:underline"
        >
          View Ready Shelf Status →
        </Link>
      </div>

      {errorMsg && (
        <div role="alert" className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Canteen & Date Selection */}
      <div className="card rounded-3xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brandText-primary dark:text-cream mb-2">
              Select Canteen
            </label>
            <select
              value={selectedCanteenId}
              onChange={(e) => setSelectedCanteenId(e.target.value)}
              className="field text-xs sm:text-sm font-semibold"
              aria-label="Select canteen for pickup"
            >
              {canteens.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.openingHours})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brandText-primary dark:text-cream mb-2">
              Select Pickup Date (IST)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {dates.map(d => {
                const active = selectedDate === d.date;
                return (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setSelectedDate(d.date)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      active
                        ? 'bg-primary text-white border-primary shadow-subtle'
                        : 'bg-white dark:bg-brandCard-dark text-brandText-primary dark:text-cream border-brandBorder-light dark:border-brandBorder-dark hover:border-primary-300'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{d.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Canteen hours & prep info bar */}
        {currentCanteen && (
          <div className="pt-3 border-t border-brandBorder-light dark:border-brandBorder-dark flex flex-wrap items-center gap-4 text-xs text-brandText-secondary dark:text-brandText-darkSecondary">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Hours: <strong className="text-brandText-primary dark:text-cream">{currentCanteen.openingHours}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-forest dark:text-sage-300" />
              Est. Prep Time: <strong className="text-brandText-primary dark:text-cream">{estimatedPrep}</strong>
            </span>
            <span className="ml-auto font-semibold text-forest dark:text-sage-300">
              {availableSlotsCount} {availableSlotsCount === 1 ? 'slot' : 'slots'} open
            </span>
          </div>
        )}
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 card rounded-3xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display font-bold text-sm text-brandText-primary dark:text-cream">
              Pickup Time Slots
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-sage-100 text-forest font-semibold">Available</span>
              <span className="px-2 py-0.5 rounded-full bg-softOrange-100 text-softOrange-700 font-semibold">Limited (≤5)</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">Full</span>
              <span className="px-2 py-0.5 rounded-full bg-cream-200 text-brandText-secondary font-semibold">Past</span>
            </div>
          </div>

          {slotsLoading ? (
            <LoadingSkeleton count={4} />
          ) : slots.length === 0 || availableSlotsCount === 0 && slots.every(s => s.isPast) ? (
            <EmptyState
              icon={Clock}
              title="No pickup slots remaining for this date"
              description={`All pickup windows for ${currentCanteen?.name || 'this canteen'} on ${selectedDate} have passed or closed. Try selecting Tomorrow.`}
              actionText="Switch to Tomorrow"
              onAction={() => setSelectedDate(dates[1]?.date || selectedDate)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slots.map(slot => {
                const disabled = isSlotFull(slot);
                const selected = currentSelection?.id === slot.id;
                const badge = STATUS_BADGE[slot.status] || STATUS_BADGE.available;
                const rem = remainingInSlot(slot);

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectPickupWindow(selectedCanteenId, selectedDate, slot)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      disabled
                        ? 'opacity-55 cursor-not-allowed bg-cream-100 dark:bg-brandBorder-dark/20 border-brandBorder-light dark:border-brandBorder-dark'
                        : selected
                        ? 'border-primary bg-softOrange-50/70 dark:bg-primary/15 ring-2 ring-primary/30'
                        : 'bg-white dark:bg-brandCard-dark border-brandBorder-light dark:border-brandBorder-dark hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs sm:text-sm text-brandText-primary dark:text-cream">
                        {slot.startTime} – {slot.endTime}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary">
                      <span>
                        {slot.isPast
                          ? 'Slot window closed'
                          : slot.isFull
                          ? '0 spots remaining'
                          : `${rem} of ${slot.capacity} spots left`}
                      </span>
                      {selected && (
                        <span className="inline-flex items-center gap-1 font-bold text-primary">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Pickup Summary */}
        <div className="lg:col-span-4 card rounded-3xl p-5 space-y-4 sticky top-24">
          <h3 className="font-display font-bold text-sm text-brandText-primary dark:text-cream pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
            Selected Pickup Summary
          </h3>

          {currentSelection ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-brandText-secondary block">Canteen</span>
                <strong className="text-brandText-primary dark:text-cream">{currentCanteen?.name}</strong>
              </div>
              <div>
                <span className="text-brandText-secondary block">Pickup Date</span>
                <strong className="text-brandText-primary dark:text-cream">{selectedDate} (IST)</strong>
              </div>
              <div>
                <span className="text-brandText-secondary block">Time Window</span>
                <strong className="text-primary text-sm">{currentSelection.time}</strong>
              </div>
              <div>
                <span className="text-brandText-secondary block">Remaining Capacity</span>
                <strong className="text-brandText-primary dark:text-cream">
                  {remainingInSlot(currentSelection)} / {currentSelection.capacity} spots
                </strong>
              </div>
              <div>
                <span className="text-brandText-secondary block">Est. Preparation Time</span>
                <strong className="text-brandText-primary dark:text-cream">{estimatedPrep}</strong>
              </div>

              <div className="pt-3 border-t border-brandBorder-light dark:border-brandBorder-dark space-y-2">
                {cartItems.length > 0 && activeCanteen?.id === selectedCanteenId ? (
                  <button
                    type="button"
                    onClick={() => navigate('/student/checkout')}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-subtle"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    to={`/student/canteen/${selectedCanteenId}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-subtle"
                  >
                    <span>Order from {currentCanteen?.name?.split(' ')[0]}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary leading-relaxed">
              Choose an available time slot on the left to reserve your pickup window. Your selection will be pre-filled at checkout.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
