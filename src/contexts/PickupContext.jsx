import React, { createContext, useCallback, useContext, useState } from 'react';
import { apiRequest } from '../services/apiClient';

const PickupContext = createContext();

const DEFAULT_INSTRUCTIONS =
  'Walk up to the pickup shelf area and collect the bag matching your token number. If staff are present at the counter, show your order token.';

function emptyConfig(canteenId) {
  return {
    canteenId,
    enabled: false,
    autoAssign: false,
    shelves: [],
    instructions: DEFAULT_INSTRUCTIONS
  };
}

export function PickupProvider({ children }) {
  const [shelfConfigByCanteen, setShelfConfigByCanteen] = useState({});
  const [loadingCanteens, setLoadingCanteens] = useState({});
  const [pickupErrors, setPickupErrors] = useState({});

  const loadShelfConfig = useCallback(async canteenId => {
    setLoadingCanteens(previous => ({ ...previous, [canteenId]: true }));
    try {
      const result = await apiRequest(`/canteens/${encodeURIComponent(canteenId)}/pickup`);
      setShelfConfigByCanteen(previous => ({ ...previous, [canteenId]: result.pickup }));
      setPickupErrors(previous => ({ ...previous, [canteenId]: '' }));
      return result.pickup;
    } catch (error) {
      setPickupErrors(previous => ({ ...previous, [canteenId]: error.message }));
      throw error;
    } finally {
      setLoadingCanteens(previous => ({ ...previous, [canteenId]: false }));
    }
  }, []);

  const getShelfConfig = canteenId =>
    shelfConfigByCanteen[canteenId] || emptyConfig(canteenId);

  const updateShelfConfig = (canteenId, patch) => {
    setShelfConfigByCanteen(previous => ({
      ...previous,
      [canteenId]: {
        ...emptyConfig(canteenId),
        ...previous[canteenId],
        ...patch
      }
    }));
  };

  const saveShelfConfig = async (canteenId, overrides = {}) => {
    const config = { ...getShelfConfig(canteenId), ...overrides };
    const result = await apiRequest(`/owner/canteens/${encodeURIComponent(canteenId)}/pickup`, {
      method: 'PUT',
      body: config
    });
    setShelfConfigByCanteen(previous => ({ ...previous, [canteenId]: result.pickup }));
    setPickupErrors(previous => ({ ...previous, [canteenId]: '' }));
    return result.pickup;
  };

  const toggleShelvesEnabled = canteenId => {
    const current = getShelfConfig(canteenId);
    const enabled = !current.enabled;
    updateShelfConfig(canteenId, {
      enabled,
      shelves: enabled && current.shelves.length === 0 ? ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'] : current.shelves,
      autoAssign: enabled ? current.autoAssign : false
    });
  };

  const addShelf = (canteenId, label) => {
    const clean = (label || '').trim().toUpperCase();
    if (!clean) return { success: false, message: 'Enter a shelf label, e.g. C1' };
    const current = getShelfConfig(canteenId);
    if (current.shelves.includes(clean)) {
      return { success: false, message: `Shelf ${clean} already exists.` };
    }
    updateShelfConfig(canteenId, { shelves: [...current.shelves, clean] });
    return { success: true, message: `Shelf ${clean} added.` };
  };

  const removeShelf = (canteenId, label) => {
    const current = getShelfConfig(canteenId);
    updateShelfConfig(canteenId, {
      shelves: current.shelves.filter(shelf => shelf !== label)
    });
  };

  const nextAvailableShelf = (canteenId, usedLabels = []) => {
    const { shelves } = getShelfConfig(canteenId);
    return shelves.find(label => !usedLabels.includes(label)) || null;
  };

  return (
    <PickupContext.Provider
      value={{
        shelfConfigByCanteen,
        loadingCanteens,
        pickupErrors,
        loadShelfConfig,
        getShelfConfig,
        updateShelfConfig,
        saveShelfConfig,
        toggleShelvesEnabled,
        addShelf,
        removeShelf,
        nextAvailableShelf
      }}
    >
      {children}
    </PickupContext.Provider>
  );
}

export function usePickup() {
  const context = useContext(PickupContext);
  if (!context) throw new Error('usePickup must be used within PickupProvider');
  return context;
}
