import React, { createContext, useCallback, useContext, useState } from 'react';
import { apiRequest } from '../services/apiClient';
import { generateCanteenPickupSlots, indiaDateString } from '../utils/dates';
import { CANTEENS } from '../data/mockData';

const SlotContext = createContext();

function serviceDate() {
  return indiaDateString();
}

function slotKey(canteenId, dateStr = serviceDate()) {
  return `${canteenId}::${dateStr}`;
}

export function SlotProvider({ children }) {
  const [slotsByKey, setSlotsByKey] = useState({});
  const [loadingCanteens, setLoadingCanteens] = useState({});
  const [selectedPickup, setSelectedPickup] = useState(() => {
    try {
      const saved = localStorage.getItem('wmc_selected_pickup');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const selectPickupWindow = useCallback((canteenId, dateStr, slot) => {
    const next = slot ? { canteenId, date: dateStr, slot } : null;
    setSelectedPickup(next);
    if (next) {
      localStorage.setItem('wmc_selected_pickup', JSON.stringify(next));
    } else {
      localStorage.removeItem('wmc_selected_pickup');
    }
  }, []);

  const loadSlots = useCallback(async (canteenId, dateStr = serviceDate(), canteenObj = null) => {
    const key = slotKey(canteenId, dateStr);
    setLoadingCanteens(previous => ({ ...previous, [canteenId]: true }));
    const resolvedCanteen = canteenObj || CANTEENS.find(c => c.id === canteenId) || null;
    try {
      const query = new URLSearchParams({ date: dateStr });
      const result = await apiRequest(
        `/canteens/${encodeURIComponent(canteenId)}/slots?${query}`
      );
      const rawSlots = Array.isArray(result.slots) ? result.slots : [];
      const merged = resolvedCanteen
        ? generateCanteenPickupSlots(resolvedCanteen, dateStr, rawSlots)
        : rawSlots;
      setSlotsByKey(previous => ({ ...previous, [key]: merged }));
      return merged;
    } catch (error) {
      const isOffline =
        error?.status === 500 ||
        error?.status === 503 ||
        error?.message?.includes('Cannot reach');
      if (!isOffline) throw error;
      const existing = slotsByKey[key] || [];
      const generated = resolvedCanteen
        ? generateCanteenPickupSlots(resolvedCanteen, dateStr, existing)
        : existing;
      setSlotsByKey(previous => ({ ...previous, [key]: generated }));
      return generated;
    } finally {
      setLoadingCanteens(previous => ({ ...previous, [canteenId]: false }));
    }
  }, []);

  const getSlots = (canteenId, dateStr = serviceDate()) =>
    slotsByKey[slotKey(canteenId, dateStr)] || [];

  const isSlotFull = useCallback(
    slot => !slot || !slot.isAvailable || slot.currentBookings >= slot.capacity || Boolean(slot.isPast),
    []
  );

  const remainingInSlot = slot =>
    Math.max(0, (slot?.capacity ?? 0) - (slot?.currentBookings ?? 0));

  const recordSlotBooking = useCallback((canteenId, dateStr, slotId) => {
    const key = slotKey(canteenId, dateStr || serviceDate());
    setSlotsByKey(previous => {
      const list = previous[key];
      if (!list) return previous;
      return {
        ...previous,
        [key]: list.map(slot => {
          if (slot.id !== slotId) return slot;
          const nextBookings = Math.min(slot.capacity, (slot.currentBookings || 0) + 1);
          const remaining = Math.max(0, slot.capacity - nextBookings);
          const isFull = !slot.isAvailable || remaining === 0;
          return {
            ...slot,
            currentBookings: nextBookings,
            remaining,
            isFull,
            status: slot.isPast ? 'past' : isFull ? 'full' : remaining <= 5 ? 'limited' : 'available'
          };
        })
      };
    });
  }, []);

  const addSlot = async (canteenId, { time, capacity, date = serviceDate() }) => {
    const result = await apiRequest(`/owner/canteens/${encodeURIComponent(canteenId)}/slots`, {
      method: 'POST',
      body: { serviceDate: date, time, capacity: Number.parseInt(capacity, 10) || 20 }
    });
    const key = slotKey(canteenId, date);
    setSlotsByKey(previous => ({
      ...previous,
      [key]: [...(previous[key] || []), result.slot]
    }));
    return result.slot;
  };

  const updateSlot = async (canteenId, slotId, patch, date = serviceDate()) => {
    const result = await apiRequest(
      `/owner/canteens/${encodeURIComponent(canteenId)}/slots/${encodeURIComponent(slotId)}`,
      { method: 'PATCH', body: patch }
    );
    const key = slotKey(canteenId, date);
    setSlotsByKey(previous => ({
      ...previous,
      [key]: (previous[key] || []).map(slot =>
        slot.id === slotId ? result.slot : slot
      )
    }));
    return result.slot;
  };

  const toggleSlot = async (canteenId, slotId, date = serviceDate()) => {
    const slot = getSlots(canteenId, date).find(item => item.id === slotId);
    if (!slot) throw new Error('Pickup slot is no longer available.');
    return updateSlot(canteenId, slotId, { isAvailable: !slot.isAvailable }, date);
  };

  const deleteSlot = async (canteenId, slotId, date = serviceDate()) => {
    await apiRequest(
      `/owner/canteens/${encodeURIComponent(canteenId)}/slots/${encodeURIComponent(slotId)}`,
      { method: 'DELETE' }
    );
    const key = slotKey(canteenId, date);
    setSlotsByKey(previous => ({
      ...previous,
      [key]: (previous[key] || []).filter(slot => slot.id !== slotId)
    }));
  };

  return (
    <SlotContext.Provider
      value={{
        slotsByKey,
        loadingCanteens,
        selectedPickup,
        selectPickupWindow,
        loadSlots,
        getSlots,
        isSlotFull,
        remainingInSlot,
        recordSlotBooking,
        addSlot,
        updateSlot,
        toggleSlot,
        deleteSlot
      }}
    >
      {children}
    </SlotContext.Provider>
  );
}

export function useSlots() {
  const context = useContext(SlotContext);
  if (!context) throw new Error('useSlots must be used within SlotProvider');
  return context;
}
