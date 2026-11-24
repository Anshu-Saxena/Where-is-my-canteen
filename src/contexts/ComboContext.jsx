import React, { createContext, useCallback, useContext, useState } from 'react';
import { apiRequest } from '../services/apiClient';
import { useMenu } from './MenuContext';

const ComboContext = createContext();

export function ComboProvider({ children }) {
  const { getItemById } = useMenu();
  const [combos, setCombos] = useState([]);
  const [comboErrors, setComboErrors] = useState({});

  const loadCombos = useCallback(async canteenId => {
    try {
      const result = await apiRequest(`/canteens/${encodeURIComponent(canteenId)}/combos`);
      setCombos(previous => [
        ...previous.filter(combo => combo.canteenId !== canteenId),
        ...result.combos
      ]);
      setComboErrors(previous => ({ ...previous, [canteenId]: '' }));
      return result.combos;
    } catch (error) {
      setComboErrors(previous => ({ ...previous, [canteenId]: error.message }));
      throw error;
    }
  }, []);

  const getCombos = canteenId =>
    canteenId ? combos.filter(combo => combo.canteenId === canteenId) : combos;

  const getComboById = id => combos.find(combo => combo.id === id);

  const addCombo = async ({ canteenId, ...data }) => {
    const result = await apiRequest(`/owner/canteens/${encodeURIComponent(canteenId)}/combos`, {
      method: 'POST',
      body: data
    });
    setCombos(previous => [result.combo, ...previous]);
    return result.combo;
  };

  const updateCombo = async (comboId, patch) => {
    const current = getComboById(comboId);
    if (!current) throw new Error('Combo is no longer available.');
    const result = await apiRequest(
      `/owner/canteens/${encodeURIComponent(current.canteenId)}/combos/${encodeURIComponent(comboId)}`,
      { method: 'PATCH', body: patch }
    );
    setCombos(previous => previous.map(combo => combo.id === comboId ? result.combo : combo));
    return result.combo;
  };

  const deleteCombo = async comboId => {
    const current = getComboById(comboId);
    if (!current) throw new Error('Combo is no longer available.');
    await apiRequest(
      `/owner/canteens/${encodeURIComponent(current.canteenId)}/combos/${encodeURIComponent(comboId)}`,
      { method: 'DELETE' }
    );
    setCombos(previous => previous.filter(combo => combo.id !== comboId));
  };

  const toggleComboAvailability = async comboId => {
    const current = getComboById(comboId);
    if (!current) throw new Error('Combo is no longer available.');
    const result = await apiRequest(
      `/owner/canteens/${encodeURIComponent(current.canteenId)}/combos/${encodeURIComponent(comboId)}/availability`,
      { method: 'PATCH', body: { available: !current.available } }
    );
    setCombos(previous => previous.map(combo => combo.id === comboId ? result.combo : combo));
    return result.combo;
  };

  const getComboPricing = combo => {
    const originalPrice = (combo.items || []).reduce((sum, line) => {
      const item = getItemById(line.itemId);
      return sum + (item ? item.price * line.quantity : 0);
    }, 0);
    const savings = Math.max(0, originalPrice - combo.price);
    const discountPct = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;
    return { originalPrice, savings, discountPct };
  };

  const getComboAvailability = combo => {
    if (!combo) return { available: false, unavailableItems: [] };
    const unavailableItems = [];
    (combo.items || []).forEach(line => {
      const item = getItemById(line.itemId);
      if (!item) unavailableItems.push(line.itemName || 'Removed item');
      else if (!item.available) unavailableItems.push(item.name);
    });
    return {
      available: combo.available && unavailableItems.length === 0,
      unavailableItems
    };
  };

  return (
    <ComboContext.Provider
      value={{
        combos,
        comboErrors,
        loadCombos,
        getCombos,
        getComboById,
        addCombo,
        updateCombo,
        deleteCombo,
        toggleComboAvailability,
        getComboPricing,
        getComboAvailability
      }}
    >
      {children}
    </ComboContext.Provider>
  );
}

export function useCombos() {
  const context = useContext(ComboContext);
  if (!context) throw new Error('useCombos must be used within ComboProvider');
  return context;
}
