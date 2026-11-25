import React, { createContext, useCallback, useContext, useState } from 'react';
import { apiRequest } from '../services/apiClient';
import { MENU_ITEMS } from '../data/mockData';

const ExpressContext = createContext();

const DEFAULT_CONFIG = {
  enabled: false,
  counterName: 'Express Counter',
  prepTimeMinutes: 5,
  itemIds: []
};

function buildDemoExpress(canteenId) {
  const quickItems = MENU_ITEMS.filter(
    i =>
      i.canteenId === canteenId &&
      i.available &&
      (['Beverages', 'Snacks'].includes(i.category) || (i.preparationTime || 10) <= 7)
  );
  return {
    enabled: quickItems.length > 0,
    counterName: 'Express Grab & Go Counter',
    prepTimeMinutes: 5,
    itemIds: quickItems.map(i => i.id)
  };
}

export function ExpressProvider({ children }) {
  const [configByCanteen, setConfigByCanteen] = useState({});
  const [loadingCanteens, setLoadingCanteens] = useState({});
  const [expressErrors, setExpressErrors] = useState({});

  const loadExpressConfig = useCallback(async canteenId => {
    setLoadingCanteens(previous => ({ ...previous, [canteenId]: true }));
    try {
      const result = await apiRequest(`/canteens/${encodeURIComponent(canteenId)}/express`);
      setConfigByCanteen(previous => ({ ...previous, [canteenId]: result.express }));
      setExpressErrors(previous => ({ ...previous, [canteenId]: '' }));
      return result.express;
    } catch (error) {
      const offline = error?.status === 500 || error?.status === 503 || error?.message?.includes('Cannot reach');
      if (offline) {
        const demoConfig = buildDemoExpress(canteenId);
        setConfigByCanteen(previous => ({ ...previous, [canteenId]: demoConfig }));
        setExpressErrors(previous => ({ ...previous, [canteenId]: '' }));
        return demoConfig;
      }
      setExpressErrors(previous => ({ ...previous, [canteenId]: error.message }));
      throw error;
    } finally {
      setLoadingCanteens(previous => ({ ...previous, [canteenId]: false }));
    }
  }, []);

  const getExpressConfig = canteenId => configByCanteen[canteenId] || null;

  const updateExpressConfig = async (canteenId, patch) => {
    const config = {
      ...DEFAULT_CONFIG,
      ...(configByCanteen[canteenId] || {}),
      ...patch
    };
    const result = await apiRequest(`/owner/canteens/${encodeURIComponent(canteenId)}/express`, {
      method: 'PUT',
      body: config
    });
    setConfigByCanteen(previous => ({ ...previous, [canteenId]: result.express }));
    setExpressErrors(previous => ({ ...previous, [canteenId]: '' }));
    return result.express;
  };

  const toggleExpress = canteenId => {
    const config = configByCanteen[canteenId] || DEFAULT_CONFIG;
    return updateExpressConfig(canteenId, { enabled: !config.enabled });
  };

  const isExpressItem = (canteenId, itemId) =>
    Boolean(configByCanteen[canteenId]?.itemIds?.includes(itemId));

  const setExpressItems = (canteenId, itemIds) =>
    updateExpressConfig(canteenId, { itemIds });

  const toggleExpressItem = (canteenId, itemId) => {
    const current = configByCanteen[canteenId]?.itemIds || [];
    const itemIds = current.includes(itemId)
      ? current.filter(id => id !== itemId)
      : [...current, itemId];
    return setExpressItems(canteenId, itemIds);
  };

  const isFullyExpress = (canteenId, itemIds = []) => {
    const config = configByCanteen[canteenId];
    if (!config?.enabled || itemIds.length === 0) return false;
    return itemIds.every(id => config.itemIds.includes(id));
  };

  return (
    <ExpressContext.Provider
      value={{
        configByCanteen,
        loadingCanteens,
        expressErrors,
        loadExpressConfig,
        getExpressConfig,
        updateExpressConfig,
        toggleExpress,
        isExpressItem,
        setExpressItems,
        toggleExpressItem,
        isFullyExpress
      }}
    >
      {children}
    </ExpressContext.Provider>
  );
}

export function useExpress() {
  const context = useContext(ExpressContext);
  if (!context) throw new Error('useExpress must be used within ExpressProvider');
  return context;
}
