import React, { createContext, useCallback, useContext, useState } from 'react';
import { apiRequest } from '../services/apiClient';
import { useMenu } from './MenuContext';
import { MENU_ITEMS } from '../data/mockData';

const ComboContext = createContext();

function buildDemoCombos(canteenId) {
  const items = MENU_ITEMS.filter(i => i.canteenId === canteenId && i.available);
  if (items.length < 2) return [];
  const first = items[0];
  const second = items[1];
  const original = first.price + second.price;
  const comboPrice = Math.max(20, Math.round(original * 0.85));
  return [
    {
      id: `combo-${canteenId}-1`,
      canteenId,
      name: `${first.name.split(' ').slice(0, 2).join(' ')} + ${second.name.split(' ').slice(0, 2).join(' ')} Combo`,
      description: `Value meal pairing ${first.name} with ${second.name}.`,
      image: first.image,
      price: comboPrice,
      available: true,
      items: [
        { itemId: first.id, itemName: first.name, quantity: 1 },
        { itemId: second.id, itemName: second.name, quantity: 1 }
      ]
    }
  ];
}

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
      const offline = error?.status === 500 || error?.status === 503 || error?.message?.includes('Cannot reach');
      if (offline) {
        const demoCombos = buildDemoCombos(canteenId);
        setCombos(previous => [
          ...previous.filter(combo => combo.canteenId !== canteenId),
          ...demoCombos
        ]);
        setComboErrors(previous => ({ ...previous, [canteenId]: '' }));
        return demoCombos;
      }
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
