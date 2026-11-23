import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('wmc_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeCanteen, setActiveCanteen] = useState(() => {
    const saved = localStorage.getItem('wmc_cart_canteen');
    return saved ? JSON.parse(saved) : null;
  });

  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    pendingItem: null,
    pendingCanteen: null
  });

  useEffect(() => {
    localStorage.setItem('wmc_cart', JSON.stringify(cartItems));
    if (cartItems.length === 0) {
      setActiveCanteen(null);
      localStorage.removeItem('wmc_cart_canteen');
    }
  }, [cartItems]);

  useEffect(() => {
    if (activeCanteen) {
      localStorage.setItem('wmc_cart_canteen', JSON.stringify(activeCanteen));
    }
  }, [activeCanteen]);

  const addToCart = (item, canteen, customization = '', extraPrice = 0, quantity = 1) => {
    // Check if cart has items from a different canteen
    if (activeCanteen && activeCanteen.id !== canteen.id && cartItems.length > 0) {
      setConflictModal({
        isOpen: true,
        pendingItem: { item, customization, extraPrice, quantity },
        pendingCanteen: canteen
      });
      return false;
    }

    // Set active canteen
    if (!activeCanteen) {
      setActiveCanteen({
        id: canteen.id,
        name: canteen.name,
        location: canteen.location,
        acceptsPayAtCounter: canteen.acceptsPayAtCounter
      });
    }

    const cartKey = `${item.id}-${customization}`;

    setCartItems(prev => {
      const existingIndex = prev.findIndex(ci => ci.cartKey === cartKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            cartKey,
            id: item.id,
            canteenId: canteen.id,
            name: item.name,
            basePrice: item.price,
            unitPrice: item.price + extraPrice,
            image: item.image,
            isVeg: item.isVeg,
            customization: customization || 'Standard',
            quantity
          }
        ];
      }
    });

    return true;
  };

  const updateQuantity = (cartKey, delta) => {
    setCartItems(prev => {
      return prev
        .map(item => {
          if (item.cartKey === cartKey) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (cartKey) => {
    setCartItems(prev => prev.filter(item => item.cartKey !== cartKey));
  };

  const clearCart = () => {
    setCartItems([]);
    setActiveCanteen(null);
  };

  const resolveConflict = (proceedWithNew) => {
    if (proceedWithNew && conflictModal.pendingItem && conflictModal.pendingCanteen) {
      const { item, customization, extraPrice, quantity } = conflictModal.pendingItem;
      const canteen = conflictModal.pendingCanteen;
      const cartKey = `${item.id}-${customization}`;

      setActiveCanteen({
        id: canteen.id,
        name: canteen.name,
        location: canteen.location,
        acceptsPayAtCounter: canteen.acceptsPayAtCounter
      });

      setCartItems([
        {
          cartKey,
          id: item.id,
          canteenId: canteen.id,
          name: item.name,
          basePrice: item.price,
          unitPrice: item.price + extraPrice,
          image: item.image,
          isVeg: item.isVeg,
          customization: customization || 'Standard',
          quantity
        }
      ]);
    }
    setConflictModal({ isOpen: false, pendingItem: null, pendingCanteen: null });
  };

  // Calculations
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const taxes = Number((subtotal * 0.05).toFixed(2)); // 5% GST
  const convenienceFee = cartItems.length > 0 ? 5.00 : 0;
  const grandTotal = subtotal + taxes + convenienceFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        activeCanteen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        conflictModal,
        resolveConflict,
        itemCount,
        subtotal,
        taxes,
        convenienceFee,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
