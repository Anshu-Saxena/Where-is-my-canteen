import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatters';
import EmptyState from '../../components/common/EmptyState';

export default function CartPage() {
  const {
    cartItems,
    activeCanteen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    taxes,
    convenienceFee,
    grandTotal
  } = useCart();

  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your tray is empty"
        description="Explore canteen menus, freshly brewed beverages, stationery and daily essentials to add items to your tray."
        actionText="Browse Campus Canteens"
        actionLink="/student/canteens"
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brandText-primary dark:text-cream">
            Your Tray
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Pre-ordering from <strong className="text-forest dark:text-sage-300 font-semibold">{activeCanteen?.name}</strong>
          </p>
        </div>

        <button
          onClick={clearCart}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
          <span className="hidden sm:inline">Clear tray</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cart Items List (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          {cartItems.map((item) => (
            <div key={item.cartKey} className="card p-3.5 sm:p-4">
              <div className="flex items-start gap-3.5">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover flex-shrink-0 bg-cream-200 dark:bg-brandBorder-dark"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 ${
                            item.isVeg ? 'border-forest' : 'border-rose-600'
                          }`}
                          title={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-forest' : 'bg-rose-600'}`} />
                        </span>
                        <h4 className="font-semibold text-sm text-brandText-primary dark:text-brandText-darkPrimary truncate">
                          {item.name}
                        </h4>
                      </div>
                      {item.customization && (
                        <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5 line-clamp-1">
                          {item.customization}
                        </p>
                      )}
                      <p className="text-xs font-semibold text-forest dark:text-sage-300 mt-1">
                        {formatCurrency(item.unitPrice)} <span className="font-normal text-brandText-secondary">each</span>
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartKey)}
                      className="p-1.5 -m-1.5 text-brandText-secondary hover:text-rose-600 transition-colors shrink-0"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4 stroke-[1.8]" />
                    </button>
                  </div>

                  {/* Quantity Controls & Line Total */}
                  <div className="flex items-center justify-between gap-3 mt-3">
                    <div className="flex items-center gap-1 bg-cream-100 dark:bg-brandBorder-dark/50 p-1 rounded-full border border-brandBorder-light dark:border-brandBorder-dark">
                      <button
                        onClick={() => updateQuantity(item.cartKey, -1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-brandText-primary dark:text-cream hover:bg-white dark:hover:bg-brandCard-dark transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[2]" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-brandText-primary dark:text-brandText-darkPrimary tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartKey, 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-brandText-primary dark:text-cream hover:bg-white dark:hover:bg-brandCard-dark transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2]" />
                      </button>
                    </div>

                    <span className="text-sm font-bold text-brandText-primary dark:text-brandText-darkPrimary tabular-nums">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-1">
            <Link
              to={`/student/canteen/${activeCanteen?.id || 'canteen-1'}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest dark:text-sage-300 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
              <span>Add more from {activeCanteen?.name || 'this canteen'}</span>
            </Link>
          </div>
        </div>

        {/* Bill Summary (4 Cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="card p-5 sm:p-6 space-y-4 rounded-3xl">
            <h3 className="font-semibold text-sm text-brandText-primary dark:text-cream pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
              Price Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-brandText-secondary dark:text-brandText-darkSecondary">
                <span>Items subtotal</span>
                <span className="font-semibold text-brandText-primary dark:text-brandText-darkPrimary tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brandText-secondary dark:text-brandText-darkSecondary">
                <span>Taxes &amp; GST (5%)</span>
                <span className="font-semibold text-brandText-primary dark:text-brandText-darkPrimary tabular-nums">{formatCurrency(taxes)}</span>
              </div>
              <div className="flex justify-between text-brandText-secondary dark:text-brandText-darkSecondary">
                <span>Convenience fee</span>
                <span className="font-semibold text-brandText-primary dark:text-brandText-darkPrimary tabular-nums">{formatCurrency(convenienceFee)}</span>
              </div>

              <div className="pt-3 border-t border-brandBorder-light dark:border-brandBorder-dark flex justify-between items-center">
                <span className="font-semibold text-sm text-brandText-primary dark:text-cream">Total amount</span>
                <span className="font-bold text-lg text-forest dark:text-sage-300 tabular-nums">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-2xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark text-2xs text-brandText-secondary dark:text-brandText-darkSecondary leading-relaxed">
              <ShieldCheck className="w-3.5 h-3.5 text-forest dark:text-sage-300 stroke-[2] flex-shrink-0 mt-px" />
              <span>Reserve a 15-minute pickup slot — your digital kitchen token is generated at checkout.</span>
            </div>

            <button
              onClick={() => navigate('/student/checkout')}
              className="w-full py-3 rounded-2xl bg-primary hover:bg-primary-600 text-cream font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-subtle"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </button>

            <Link
              to="/student/canteens"
              className="block text-center text-xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary hover:text-forest dark:hover:text-sage-300 transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
