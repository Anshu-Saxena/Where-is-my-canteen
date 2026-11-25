import React, { createContext, useCallback, useContext, useState } from 'react';
import { apiRequest } from '../services/apiClient';
import { canteenService } from '../services/api';

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [items, setItems] = useState([]);
  const [menuErrors, setMenuErrors] = useState({});

  const loadMenuItems = useCallback(async canteenId => {
    try {
      const menuItems = await canteenService.getMenuItems(canteenId);
      setItems(previous => [
        ...previous.filter(item => item.canteenId !== canteenId),
        ...menuItems
      ]);
      setMenuErrors(previous => ({ ...previous, [canteenId]: '' }));
      return menuItems;
    } catch (error) {
      setMenuErrors(previous => ({ ...previous, [canteenId]: error.message }));
      throw error;
    }
  }, []);

  const getMenuItems = (canteenId, category = 'All') =>
    items.filter(item =>
      item.canteenId === canteenId && (category === 'All' || item.category === category)
    );

  const getItemById = id => items.find(item => item.id === id);

  const updateStoredItem = item => {
    setItems(previous => previous.map(current => current.id === item.id ? item : current));
    return item;
  };

  const toggleAvailability = async itemId => {
    const item = getItemById(itemId);
    if (!item) throw new Error('Menu item is no longer available.');
    const result = await apiRequest(
      `/owner/canteens/${encodeURIComponent(item.canteenId)}/menu/${encodeURIComponent(itemId)}`,
      { method: 'PATCH', body: { available: !item.available } }
    );
    return updateStoredItem(result.item);
  };

  const addItem = async item => {
    const { canteenId, id, ...data } = item;
    const result = await apiRequest(
      `/owner/canteens/${encodeURIComponent(canteenId)}/menu`,
      { method: 'POST', body: data }
    );
    setItems(previous => [result.item, ...previous]);
    return result.item;
  };

  const updateItem = async (itemId, patch) => {
    const current = getItemById(itemId);
    if (!current) throw new Error('Menu item is no longer available.');
    const { id, canteenId, ...data } = patch;
    const result = await apiRequest(
      `/owner/canteens/${encodeURIComponent(current.canteenId)}/menu/${encodeURIComponent(itemId)}`,
      { method: 'PATCH', body: data }
    );
    return updateStoredItem(result.item);
  };

  const deleteItem = async itemId => {
    const item = getItemById(itemId);
    if (!item) throw new Error('Menu item is no longer available.');
    await apiRequest(
      `/owner/canteens/${encodeURIComponent(item.canteenId)}/menu/${encodeURIComponent(itemId)}`,
      { method: 'DELETE' }
    );
    setItems(previous => previous.filter(current => current.id !== itemId));
  };

  return (
    <MenuContext.Provider
      value={{
        items,
        menuErrors,
        loadMenuItems,
        getMenuItems,
        getItemById,
        toggleAvailability,
        addItem,
        updateItem,
        deleteItem
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within MenuProvider');
  return context;
}
