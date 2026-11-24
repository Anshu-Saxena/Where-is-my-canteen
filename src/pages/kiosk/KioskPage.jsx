import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle2,
  Utensils,
  Banknote,
  CreditCard,
  Smartphone,
  ArrowLeft,
  ArrowRight,
  LogOut,
  QrCode,
  Store
} from 'lucide-react';
import { useSlots } from '../../contexts/SlotContext';
import { useOrders } from '../../contexts/OrderContext';
import { usePayments } from '../../contexts/PaymentContext';
import { useUniversity } from '../../contexts/UniversityContext';
import { useAuth } from '../../contexts/AuthContext';
import { canteenService } from '../../services/api';
import { paymentService } from '../../services/paymentService';
import { formatCurrency } from '../../utils/formatters';

/**
 * Self-service kiosk.
 *
 * Full-screen, touch-first ordering flow intended for a tablet installed in a
 * canteen. It reuses the SAME ordering backend as the student app
 * (OrderContext.createOrder + SlotContext capacity checks) — there is no
 * separate database or order system. It keeps a kiosk-local cart so that a
 * device never overwrites a signed-in student's cart on the same browser.
 */

const PAYMENT_METHODS = [
  { id: 'Pay at Counter', label: 'Pay at Counter', hint: 'Cash / UPI at the till', icon: Banknote },
  { id: 'UPI', label: 'UPI', hint: 'Scan & pay (test)', icon: Smartphone },
  { id: 'Card', label: 'Card', hint: 'Debit / credit (test)', icon: CreditCard }
];

const AUTO_RESET_SECONDS = 25;

export default function KioskPage() {
  const { createOrder } = useOrders();
  const { createPayment, runSandboxPayment, reconcilePaymentResult } = usePayments();
  const { getSlots, loadSlots, isSlotFull, remainingInSlot } = useSlots();
  const { selectedCampus } = useUniversity();
  const { user } = useAuth();

  const [canteens, setCanteens] = useState([]);
  const [canteenId, setCanteenId] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categorySearch, setCategorySearch] = useState('');

  const [cart, setCart] = useState([]);
  const [step, setStep] = useState('browse'); // browse | cart | checkout | confirm
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Pay at Counter');
  const [guestName, setGuestName] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [countdown, setCountdown] = useState(AUTO_RESET_SECONDS);

  const canteen = useMemo(
    () => canteens.find(c => c.id === canteenId) || null,
    [canteens, canteenId]
  );

  const slots = getSlots(canteenId);

  // Load campus canteens
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await canteenService.getCanteens({ campusId: selectedCampus?.id });
        if (active) {
          setCanteens(data);
          setCanteenId(current => data.some(item => item.id === current) ? current : data[0]?.id || '');
        }
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [selectedCampus]);

  useEffect(() => {
    if (!canteenId) return;
    loadSlots(canteenId).catch(error => setError(error.message));
  }, [canteenId, loadSlots]);

  // Load menu for the selected canteen
  useEffect(() => {
    if (!canteenId) {
      setMenuItems([]);
      return undefined;
    }
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const items = await canteenService.getMenuItems(canteenId);
        if (active) setMenuItems(items.filter(i => i.available));
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [canteenId]);

  // Auto-reset countdown on the confirmation screen (typical kiosk behaviour)
  useEffect(() => {
    if (step !== 'confirm') return;
    setCountdown(AUTO_RESET_SECONDS);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          resetKiosk();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const categories = useMemo(() => {
    const set = new Set(menuItems.map(i => i.category));
    return ['All', ...Array.from(set)];
  }, [menuItems]);

  const visibleItems = menuItems.filter(item => {
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;
    if (categorySearch.trim() && !item.name.toLowerCase().includes(categorySearch.toLowerCase())) return false;
    return true;
  });

  const subtotal = cart.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const taxes = Number((subtotal * 0.05).toFixed(2));
  const convenienceFee = cart.length > 0 ? 5 : 0;
  const grandTotal = subtotal + taxes + convenienceFee;
  const itemCount = cart.reduce((acc, it) => acc + it.quantity, 0);

  const addItem = (item) => {
    setCart(prev => {
      const key = `${item.id}-Standard`;
      const existing = prev.find(ci => ci.cartKey === key);
      if (existing) {
        return prev.map(ci => (ci.cartKey === key ? { ...ci, quantity: ci.quantity + 1 } : ci));
      }
      return [
        ...prev,
        {
          cartKey: key,
          id: item.id,
          name: item.name,
          image: item.image,
          unitPrice: item.price,
          quantity: 1,
          customization: 'Standard'
        }
      ];
    });
  };

  const changeQty = (cartKey, delta) => {
    setCart(prev =>
      prev
        .map(ci => (ci.cartKey === cartKey ? { ...ci, quantity: ci.quantity + delta } : ci))
        .filter(ci => ci.quantity > 0)
    );
  };

  const resetKiosk = () => {
    setCart([]);
    setSelectedSlotId(null);
    setPaymentMethod('Pay at Counter');
    setGuestName('');
    setError('');
    setPlacedOrder(null);
    setStep('browse');
    setActiveCategory('All');
  };

  const goToCheckout = () => {
    if (cart.length === 0) return;
    const firstOpen = slots.find(s => !isSlotFull(s));
    setSelectedSlotId(prev => prev || firstOpen?.id || null);
    setError('');
    setStep('checkout');
  };

  const handlePlaceOrder = async () => {
    setError('');
    if (!canteen) {
      setError('Choose an available canteen before placing an order.');
      return;
    }
    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    setPlacing(true);
    try {
      const paymentConfig = paymentMethod === 'Pay at Counter'
        ? null
        : await paymentService.getConfig();
      if (paymentConfig &&
          !paymentConfig.configured &&
          !paymentConfig.sandboxEnabled) {
        throw new Error('Online payments are not configured. Choose Pay at Counter instead.');
      }

      const slot = slots.find(s => s.id === selectedSlotId) || null;
      const order = await Promise.resolve(
        createOrder({
          items: cart.map(ci => ({
            id: ci.id,
            name: ci.name,
            unitPrice: ci.unitPrice,
            quantity: ci.quantity,
            customization: ci.customization
          })),
          canteen,
          university: selectedUniversity || { name: 'Campus University' },
          campus: selectedCampus || { name: 'Main Campus' },
          pickupSlot: slot,
          paymentMethod,
          subtotal,
          taxes,
          convenienceFee,
          grandTotal,
          customer: { name: guestName.trim() || 'Kiosk Guest' },
          orderType: 'kiosk'
        })
      );

      const isOffline = paymentMethod === 'Pay at Counter';
      if (!isOffline) {
        if (paymentConfig.configured) {
          const initialized = await createPayment({ orderId: order.id, isKiosk: true });
          const result = await paymentService.openCheckout({
            checkout: initialized.checkout,
            order,
            user: null,
            isKiosk: true
          });
          if (result) reconcilePaymentResult(result);
        } else if (paymentConfig.sandboxEnabled) {
          await runSandboxPayment({ orderId: order.id, outcome: 'SUCCESS', isKiosk: true });
        } else {
          throw new Error('Online payments are not configured. Choose Pay at Counter instead.');
        }
      } else {
        await createPayment({ orderId: order.id, isKiosk: true });
      }

      setPlacedOrder(order);
      setStep('confirm');
    } catch (err) {
      setError(err.message || 'Could not place the order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  /* ------------------------------- CONFIRM ------------------------------- */
  if (step === 'confirm' && placedOrder) {
    return (
      <div className="min-h-screen w-full bg-forest text-cream flex flex-col items-center justify-center px-6 py-10 text-center">
        <CheckCircle2 className="w-20 h-20 text-sage mb-4" />
        <p className="text-lg text-sage-200 font-semibold">Order confirmed — please collect your token</p>

        <div className="my-8">
          <p className="text-sm uppercase tracking-widest text-sage-200 font-bold mb-1">Your token</p>
          <p className="text-[110px] leading-none font-extrabold font-mono">{placedOrder.tokenNumber}</p>
          <p className="text-xl font-semibold mt-3">Order #{placedOrder.id}</p>
        </div>

        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <ConfirmTile label="Canteen" value={placedOrder.canteenName} />
          <ConfirmTile label="Pickup slot" value={placedOrder.pickupSlot || 'Collect now'} />
          <ConfirmTile label="Total" value={formatCurrency(placedOrder.totalAmount)} />
        </div>

        <p className="text-sm text-sage-200 max-w-xl mb-8">
          Keep this token number. It will be called at the counter — or shown on the pickup shelf screen once your food
          is ready.
        </p>

        <button
          onClick={resetKiosk}
          className="px-8 py-4 rounded-2xl bg-sage text-forest text-lg font-bold hover:bg-sage-400 transition"
        >
          Start a new order
        </button>
        <p className="text-xs text-sage-200 mt-4">Resetting automatically in {countdown}s…</p>
      </div>
    );
  }

  /* --------------------------- BROWSE / CART / CHECKOUT --------------------------- */
  return (
    <div className="min-h-screen w-full bg-cream dark:bg-brandBg-dark flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white dark:bg-brandCard-dark border-b border-brandBorder-light dark:border-brandBorder-dark px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-11 h-11 rounded-2xl bg-primary text-white grid place-items-center shrink-0">
            <Store className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <p className="text-2xs font-bold uppercase tracking-wider text-primary">Self-service kiosk</p>
            <select
              value={canteenId}
              onChange={(e) => {
                setCanteenId(e.target.value);
                setCart([]);
                setActiveCategory('All');
              }}
              className="font-display text-base font-bold bg-transparent text-brandText-primary dark:text-cream focus:outline-none pr-1"
            >
              {canteens.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-brandText-secondary dark:text-brandText-darkSecondary">
            <QrCode className="w-4 h-4" />
            {user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Guest ordering enabled'}
          </span>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark text-xs font-semibold text-brandText-primary dark:text-cream hover:bg-cream-100 dark:hover:bg-brandBorder-dark/40 transition"
          >
            <LogOut className="w-4 h-4" />
            Exit
          </Link>
        </div>
      </header>

      {step === 'browse' ? (
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Category rail */}
          <aside className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark p-3 lg:p-4">
            <p className="hidden lg:block text-2xs font-bold uppercase tracking-wider text-brandText-secondary mb-3">
              Categories
            </p>
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-5 py-4 rounded-2xl text-base font-bold transition text-left ${
                    activeCategory === cat
                      ? 'bg-primary text-white shadow-subtle'
                      : 'bg-cream-100 dark:bg-brandBorder-dark/40 text-brandText-primary dark:text-cream hover:bg-cream-200 dark:hover:bg-brandBorder-dark'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </aside>

          {/* Menu grid */}
          <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 pb-40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h1 className="font-display text-2xl font-extrabold text-brandText-primary dark:text-cream">
                {activeCategory === 'All' ? 'Choose your food' : activeCategory}
              </h1>
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search dishes…"
                className="w-full sm:w-72 px-4 py-3 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark text-base text-brandText-primary dark:text-cream focus:outline-none focus:border-primary"
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="rounded-3xl overflow-hidden bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark">
                    <div className="h-44 bg-cream-200 dark:bg-brandBorder-dark animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-3/4 bg-cream-200 dark:bg-brandBorder-dark rounded animate-pulse" />
                      <div className="h-4 w-1/3 bg-cream-200 dark:bg-brandBorder-dark rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="text-center py-20">
                <Utensils className="w-10 h-10 mx-auto text-brandText-secondary mb-3" />
                <p className="text-lg font-semibold text-brandText-primary dark:text-cream">No items available</p>
                <p className="text-sm text-brandText-secondary mt-1">Try another category or canteen.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {visibleItems.map(item => {
                  const inCart = cart.find(ci => ci.cartKey === `${item.id}-Standard`);
                  return (
                    <div
                      key={item.id}
                      className="rounded-3xl overflow-hidden bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle flex flex-col"
                    >
                      <div className="relative h-44 bg-cream-200 dark:bg-brandBorder-dark">
                        <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 w-6 h-6 rounded-md bg-white grid place-items-center">
                          <span className={`w-3 h-3 rounded-sm border-2 ${item.isVeg ? 'border-sage-600' : 'border-rose-600'}`} />
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-base text-brandText-primary dark:text-cream leading-snug line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-xl font-extrabold text-forest dark:text-sage mt-2">
                          {formatCurrency(item.price)}
                        </p>

                        <div className="mt-auto pt-4">
                          {inCart ? (
                            <div className="flex items-center justify-between gap-2 bg-cream-100 dark:bg-brandBorder-dark/40 rounded-2xl p-1.5">
                              <button
                                onClick={() => changeQty(inCart.cartKey, -1)}
                                className="w-11 h-11 rounded-xl bg-white dark:bg-brandCard-dark grid place-items-center text-brandText-primary dark:text-cream"
                              >
                                <Minus className="w-5 h-5" />
                              </button>
                              <span className="text-lg font-extrabold text-brandText-primary dark:text-cream">{inCart.quantity}</span>
                              <button
                                onClick={() => addItem(item)}
                                className="w-11 h-11 rounded-xl bg-primary text-white grid place-items-center"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addItem(item)}
                              className="w-full py-3.5 rounded-2xl bg-primary text-white text-base font-bold hover:bg-primary-600 transition flex items-center justify-center gap-2"
                            >
                              <Plus className="w-5 h-5" />
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      ) : step === 'cart' ? (
        /* ------------------------------- CART ------------------------------- */
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-3xl mx-auto">
            <button onClick={() => setStep('browse')} className="inline-flex items-center gap-2 text-sm font-semibold text-brandText-secondary hover:text-forest dark:hover:text-cream mb-5">
              <ArrowLeft className="w-4 h-4" /> Add more items
            </button>

            <h1 className="font-display text-2xl font-extrabold text-brandText-primary dark:text-cream mb-5">Your order</h1>

            <div className="bg-white dark:bg-brandCard-dark rounded-3xl border border-brandBorder-light dark:border-brandBorder-dark p-5 sm:p-6 space-y-4">
              {cart.map(ci => (
                <div key={ci.cartKey} className="flex items-center gap-4">
                  <img src={ci.image} alt={ci.name} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base text-brandText-primary dark:text-cream truncate">{ci.name}</p>
                    <p className="text-sm text-brandText-secondary dark:text-brandText-darkSecondary">{formatCurrency(ci.unitPrice)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeQty(ci.cartKey, -1)} className="w-10 h-10 rounded-xl bg-cream-100 dark:bg-brandBorder-dark/40 grid place-items-center">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-brandText-primary dark:text-cream">{ci.quantity}</span>
                    <button onClick={() => changeQty(ci.cartKey, 1)} className="w-10 h-10 rounded-xl bg-primary text-white grid place-items-center">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="w-20 text-right font-bold text-brandText-primary dark:text-cream">
                    {formatCurrency(ci.unitPrice * ci.quantity)}
                  </p>
                </div>
              ))}

              <BillSummary subtotal={subtotal} taxes={taxes} convenienceFee={convenienceFee} grandTotal={grandTotal} />
            </div>
          </div>
        </main>
      ) : (
        /* ----------------------------- CHECKOUT ----------------------------- */
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <button onClick={() => setStep('cart')} className="inline-flex items-center gap-2 text-sm font-semibold text-brandText-secondary hover:text-forest dark:hover:text-cream">
              <ArrowLeft className="w-4 h-4" /> Back to order
            </button>

            <h1 className="font-display text-2xl font-extrabold text-brandText-primary dark:text-cream">Checkout</h1>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            {/* Pickup slot */}
            <section className="bg-white dark:bg-brandCard-dark rounded-3xl border border-brandBorder-light dark:border-brandBorder-dark p-5 sm:p-6">
              <h2 className="font-bold text-base text-brandText-primary dark:text-cream mb-3">Pickup time</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <SlotButton
                  active={selectedSlotId === null}
                  onClick={() => setSelectedSlotId(null)}
                  title="Collect now"
                  subtitle="Fastest available"
                />
                {slots.map(s => {
                  const full = isSlotFull(s);
                  return (
                    <SlotButton
                      key={s.id}
                      active={selectedSlotId === s.id}
                      disabled={full}
                      onClick={() => !full && setSelectedSlotId(s.id)}
                      title={s.time}
                      subtitle={full ? 'Slot full' : `${remainingInSlot(s)} left`}
                    />
                  );
                })}
              </div>
            </section>

            {/* Payment */}
            <section className="bg-white dark:bg-brandCard-dark rounded-3xl border border-brandBorder-light dark:border-brandBorder-dark p-5 sm:p-6">
              <h2 className="font-bold text-base text-brandText-primary dark:text-cream mb-1">Payment method</h2>
              <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mb-3">
                Online payments run in test mode until a gateway is connected — no real charge is made.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PAYMENT_METHODS.map(m => {
                  const Icon = m.icon;
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-4 rounded-2xl border text-left transition ${
                        active
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                          : 'border-brandBorder-light dark:border-brandBorder-dark hover:border-primary-200'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${active ? 'text-primary' : 'text-brandText-secondary'}`} />
                      <p className="font-bold text-sm text-brandText-primary dark:text-cream">{m.label}</p>
                      <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">{m.hint}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Guest name */}
            <section className="bg-white dark:bg-brandCard-dark rounded-3xl border border-brandBorder-light dark:border-brandBorder-dark p-5 sm:p-6">
              <h2 className="font-bold text-base text-brandText-primary dark:text-cream mb-1">Name for the token</h2>
              <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mb-3">
                Optional — leave blank for a guest order.
              </p>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Riya"
                className="w-full px-4 py-3.5 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-base text-brandText-primary dark:text-cream focus:outline-none focus:border-primary"
              />
            </section>

            <div className="bg-white dark:bg-brandCard-dark rounded-3xl border border-brandBorder-light dark:border-brandBorder-dark p-5 sm:p-6">
              <BillSummary subtotal={subtotal} taxes={taxes} convenienceFee={convenienceFee} grandTotal={grandTotal} />
            </div>
          </div>
        </main>
      )}

      {/* Bottom action bar */}
      {step !== 'confirm' && (
        <footer className="sticky bottom-0 z-20 bg-white dark:bg-brandCard-dark border-t border-brandBorder-light dark:border-brandBorder-dark px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-2xs uppercase font-bold tracking-wider text-brandText-secondary">Total</p>
            <p className="text-2xl font-extrabold text-brandText-primary dark:text-cream">{formatCurrency(grandTotal)}</p>
          </div>

          {step === 'browse' ? (
            <button
              onClick={() => setStep('cart')}
              disabled={itemCount === 0}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-primary text-white text-lg font-bold hover:bg-primary-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              View order
              {itemCount > 0 && (
                <span className="ml-1 min-w-[26px] h-6 px-1.5 rounded-full bg-white text-primary text-sm font-extrabold grid place-items-center">
                  {itemCount}
                </span>
              )}
            </button>
          ) : step === 'cart' ? (
            <button
              onClick={goToCheckout}
              disabled={itemCount === 0}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-primary text-white text-lg font-bold hover:bg-primary-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Checkout
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-forest text-cream text-lg font-bold hover:bg-forest-light transition disabled:opacity-60"
            >
              <CheckCircle2 className="w-5 h-5" />
              {placing ? 'Placing…' : 'Place order & get token'}
            </button>
          )}
        </footer>
      )}
    </div>
  );
}

function SlotButton({ active, disabled, onClick, title, subtitle }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-4 rounded-2xl border text-left transition ${
        disabled
          ? 'border-brandBorder-light dark:border-brandBorder-dark bg-cream-100/50 dark:bg-brandBorder-dark/20 opacity-50 cursor-not-allowed'
          : active
          ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
          : 'border-brandBorder-light dark:border-brandBorder-dark hover:border-primary-200'
      }`}
    >
      <p className="font-bold text-sm text-brandText-primary dark:text-cream">{title}</p>
      <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">{subtitle}</p>
    </button>
  );
}

function BillSummary({ subtotal, taxes, convenienceFee, grandTotal }) {
  return (
    <div className="pt-4 border-t border-brandBorder-light dark:border-brandBorder-dark space-y-2 text-sm">
      <Row label="Item subtotal" value={formatCurrency(subtotal)} />
      <Row label="GST (5%)" value={formatCurrency(taxes)} />
      <Row label="Convenience fee" value={formatCurrency(convenienceFee)} />
      <div className="flex items-center justify-between pt-2 border-t border-brandBorder-light dark:border-brandBorder-dark">
        <span className="font-bold text-brandText-primary dark:text-cream">Total payable</span>
        <span className="font-extrabold text-lg text-forest dark:text-sage">{formatCurrency(grandTotal)}</span>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-brandText-secondary dark:text-brandText-darkSecondary">
      <span>{label}</span>
      <span className="font-medium text-brandText-primary dark:text-cream">{value}</span>
    </div>
  );
}

function ConfirmTile({ label, value }) {
  return (
    <div className="bg-cream/10 rounded-2xl px-4 py-4 border border-cream/20">
      <p className="text-2xs uppercase tracking-wider text-sage-200 font-bold">{label}</p>
      <p className="text-base font-bold mt-1 break-words">{value}</p>
    </div>
  );
}
