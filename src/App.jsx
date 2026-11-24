import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { UniversityProvider } from './contexts/UniversityContext';
import { CartProvider } from './contexts/CartContext';
import { MenuProvider } from './contexts/MenuContext';
import { SlotProvider } from './contexts/SlotContext';
import { PickupProvider } from './contexts/PickupContext';
import { ExpressProvider } from './contexts/ExpressContext';
import { ComboProvider } from './contexts/ComboContext';
import { OrderProvider } from './contexts/OrderContext';
import { PaymentProvider } from './contexts/PaymentContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <UniversityProvider>
            <MenuProvider>
              <CartProvider>
                <SlotProvider>
                  <PickupProvider>
                    <ExpressProvider>
                      <ComboProvider>
                        <OrderProvider>
                          <PaymentProvider>
                            <AppRoutes />
                          </PaymentProvider>
                        </OrderProvider>
                      </ComboProvider>
                    </ExpressProvider>
                  </PickupProvider>
                </SlotProvider>
              </CartProvider>
            </MenuProvider>
          </UniversityProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
