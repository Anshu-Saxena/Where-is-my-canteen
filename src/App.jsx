import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { UniversityProvider } from './contexts/UniversityContext';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <UniversityProvider>
            <CartProvider>
              <OrderProvider>
                <AppRoutes />
              </OrderProvider>
            </CartProvider>
          </UniversityProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
