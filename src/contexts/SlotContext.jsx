import React, { createContext, useCallback, useContext, useState } from 'react';
import { apiRequest } from '../services/apiClient';
import { indiaDateString } from '../utils/dates';

const SlotContext = createContext();

function serviceDate() {
  return indiaDateString();
}

export function SlotProvider({ children }) {
  const [slotsByCanteen, setSlotsByCanteen] = useState({});
  const [loadingCanteens, setLoadingCanteens] = useState({});

  const loadSlots = useCallback(async canteenId => {
    setLoadingCanteens(previous => ({ ...previous, [canteenId]: true }));
    try {
      const query = new URLSearchParams({ date: serviceDate() });
      const result = await apiRequest(
        `/canteens/${encodeURIComponent(canteenId)}/slots?${query}`
      );
      setSlotsByCanteen(previous => ({ ...previous, [canteenId]: result.slots }));
      return result.slots;
    } finally {
      setLoadingCanteens(previous => ({ ...previous, [canteenId]: false }));
    }
  }, []);

  const getSlots = canteenId => slotsByCanteen[canteenId] || [];

  const isSlotFull = useCallback(
    slot => !slot.isAvailable || slot.currentBookings >= slot.capacity,
    []
  );

  const remainingInSlot = slot =>
    Math.max(0, slot.capacity - slot.currentBookings);

  const addSlot = async (canteenId, { time, capacity }) => {
    const result = await apiRequest(`/owner/canteens/${encodeURIComponent(canteenId)}/slots`, {
      method: 'POST',
      body: { serviceDate: serviceDate(), time, capacity: Number.parseInt(capacity, 10) || 20 }
    });
    setSlotsByCanteen(previous => ({
      ...previous,
      [canteenId]: [...(previous[canteenId] || []), result.slot]
    }));
    return result.slot;
  };

  const updateSlot = async (canteenId, slotId, patch) => {
    const result = await apiRequest(
      `/owner/canteens/${encodeURIComponent(canteenId)}/slots/${encodeURIComponent(slotId)}`,
      { method: 'PATCH', body: patch }
    );
    setSlotsByCanteen(previous => ({
      ...previous,
      [canteenId]: (previous[canteenId] || []).map(slot =>
        slot.id === slotId ? result.slot : slot
      )
    }));
    return result.slot;
  };

  const toggleSlot = async (canteenId, slotId) => {
    const slot = getSlots(canteenId).find(item => item.id === slotId);
    if (!slot) throw new Error('Pickup slot is no longer available.');
    return updateSlot(canteenId, slotId, { isAvailable: !slot.isAvailable });
  };

  const deleteSlot = async (canteenId, slotId) => {
    await apiRequest(
      `/owner/canteens/${encodeURIComponent(canteenId)}/slots/${encodeURIComponent(slotId)}`,
      { method: 'DELETE' }
    );
    setSlotsByCanteen(previous => ({
      ...previous,
      [canteenId]: (previous[canteenId] || []).filter(slot => slot.id !== slotId)
    }));
  };

  return (
    <SlotContext.Provider
      value={{
        slotsByCanteen,
        loadingCanteens,
        loadSlots,
        getSlots,
        isSlotFull,
        remainingInSlot,
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
