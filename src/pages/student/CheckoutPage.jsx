import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Banknote,
  Smartphone,
  MapPin
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useUniversity } from '../../contexts/UniversityContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrderContext';
import { useSlots } from '../../contexts/SlotContext';
import { useExpress } from '../../contexts/ExpressContext';
import { usePayments } from '../../contexts/PaymentContext';
import { paymentService } from '../../services/paymentService';
import { formatCurrency } from '../../utils/formatters';

export default function CheckoutPage() {
  const { cartItems, activeCanteen, subtotal, taxes, convenienceFee, grandTotal, clearCart } = useCart();
  const { selectedUniversity, selectedCampus } = useUniversity();
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const { getSlots, loadSlots, isSlotFull, remainingInSlot } = useSlots();
  const { isFullyExpress } = useExpress();
  const { createPayment, runSandboxPayment, reconcilePaymentResult } = usePayments();
  const navigate = useNavigate();

  const [paymentConfig, setPaymentConfig] = useState(null);
  const gatewayConfigured = Boolean(paymentConfig?.configured);
  // A tray made up entirely of express-eligible items gets a fast-track token.
  const isExpressOrder =
    !!activeCanteen && isFullyExpress(activeCanteen.id, cartItems.map(ci => ci.id));

  // Steps: 1. Details -> 2. Pickup Slot -> 3. Payment -> 4. Confirm
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('aarav@okaxis');
  const [sandboxOutcome, setSandboxOutcome] = useState('SUCCESS');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');

  // Editable user details for this checkout
  const [fullName, setFullName] = useState(user?.name || 'Aarav Sharma');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [rollNumber, setRollNumber] = useState(user?.rollNumber || '2023/CS/104');

  useEffect(() => {
    let active = true;
    paymentService.getConfig()
      .then(config => {
        if (active) setPaymentConfig(config);
      })
      .catch(error => {
        if (active) setErrorNotice(error.message);
      });
    return () => {
      active = false;
    };
  }, []);

  // Live slot list from the shared pickup-slot store (reflects current bookings)
  const slots = activeCanteen ? getSlots(activeCanteen.id) : [];

  useEffect(() => {
    if (!activeCanteen || cartItems.length === 0) {
      navigate('/student/cart');
      return;
    }
    let active = true;
    loadSlots(activeCanteen.id)
      .then(loadedSlots => {
        if (!active) return;
        setSelectedSlot(current =>
          current || loadedSlots.find(slot => !isSlotFull(slot)) || null
        );
      })
      .catch(error => {
        if (active) setErrorNotice(error.message);
      });
    return () => {
      active = false;
    };
  }, [activeCanteen?.id, cartItems.length, isSlotFull, loadSlots, navigate]);

  const handleNextStep = () => {
    setErrorNotice('');
    if (currentStep === 1) {
      if (!fullName.trim() || !phone.trim()) {
        setErrorNotice('Please fill in your name and contact phone.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedSlot) {
        setErrorNotice('Please select an available pickup time slot.');
        return;
      }
      // Re-check against the latest capacity before continuing (server-style guard).
      const latest = slots.find(s => s.id === selectedSlot.id);
      if (!latest || isSlotFull(latest)) {
        setSelectedSlot(null);
        setErrorNotice('That pickup slot just got fully booked. Please choose another slot.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    setErrorNotice('');
    let createdOrder = null;

    try {
      if (paymentMethod !== 'Pay at Counter' &&
          (!paymentConfig || (!paymentConfig.configured && !paymentConfig.sandboxEnabled))) {
        throw new Error('Online payments are not configured. Choose Pay at Counter or contact the canteen.');
      }

      const order = await createOrder({
        items: cartItems,
        canteen: activeCanteen,
        university: selectedUniversity,
        campus: selectedCampus,
        pickupSlot: selectedSlot,
        paymentMethod,
        subtotal,
        taxes,
        convenienceFee,
        grandTotal,
        orderType: isExpressOrder ? 'express' : 'standard',
        customer: {
          ...user,
          name: fullName,
          phone,
          rollNumber
        }
      });
      createdOrder = order;

      const isOffline = paymentMethod === 'Pay at Counter';
      if (isOffline) {
        const result = await createPayment({ orderId: order.id });
        reconcilePaymentResult({ payment: result.payment });
      } else if (gatewayConfigured) {
        const initialized = await createPayment({ orderId: order.id });
        const result = await paymentService.openCheckout({
          checkout: initialized.checkout,
          order,
          user
        });
        if (result) reconcilePaymentResult(result);
      } else if (paymentConfig?.sandboxEnabled) {
        await runSandboxPayment({ orderId: order.id, outcome: sandboxOutcome });
      } else {
        throw new Error('Online payments are not configured. Choose Pay at Counter or contact the canteen.');
      }

      clearCart();
      setIsProcessing(false);
      navigate(`/student/orders/${order.id}`);
    } catch (err) {
      setIsProcessing(false);
      if (createdOrder) {
        clearCart();
        navigate(`/student/orders/${createdOrder.id}`, {
          state: { paymentError: err.message }
        });
        return;
      }
      if (err?.code === 'SLOT_UNAVAILABLE') {
        setErrorNotice(err.message);
        setCurrentStep(2);
        setSelectedSlot(null);
      } else {
        setErrorNotice(err.message || 'Order placement failed. Please try again.');
      }
    }
  };

  const steps = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Pickup Slot' },
    { num: 3, label: 'Payment' },
    { num: 4, label: 'Confirm' }
  ];

  const paymentOptions = [
    {
      key: 'UPI',
      icon: Smartphone,
      title: 'UPI',
      desc: 'Google Pay, PhonePe, Paytm, BHIM — zero processing fee',
      badge: 'Recommended'
    },
    {
      key: 'Card',
      icon: CreditCard,
      title: 'Debit / Credit Card',
      desc: 'RuPay, Visa, MasterCard via encrypted bank gateway'
    },
    {
      key: 'Pay at Counter',
      icon: Banknote,
      title: 'Pay at Counter',
      desc: 'Settle at the collection window when you show your token',
      hidden: !activeCanteen?.acceptsPayAtCounter
    }
  ].filter(o => !o.hidden);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Checkout Progress Stepper */}
      <div className="card rounded-3xl p-4 sm:p-5">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((st, i) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            return (
              <React.Fragment key={st.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isCompleted || isCurrent
                        ? 'bg-primary text-white'
                        : 'bg-cream-200 dark:bg-brandBorder-dark text-brandText-secondary'
                    } ${isCurrent ? 'ring-4 ring-sage-200 dark:ring-forest/40' : ''}`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4 stroke-[2]" /> : st.num}
                  </div>
                  <span
                    className={`text-2xs font-semibold mt-1.5 hidden sm:block ${
                      isCurrent ? 'text-forest dark:text-cream font-bold' : 'text-brandText-secondary dark:text-brandText-darkSecondary'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      currentStep > st.num ? 'bg-forest' : 'bg-brandBorder-light dark:bg-brandBorder-dark'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {errorNotice && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Interactive Step Section (8 Cols) */}
        <div className="lg:col-span-8 card rounded-3xl p-5 sm:p-6">
          {/* STEP 1: USER & ORDER DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-brandText-primary dark:text-cream">
                  Contact &amp; pickup verification
                </h2>
                <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
                  Your token SMS and pickup alert will be sent to these details
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold mb-1.5 text-brandText-primary dark:text-brandText-darkPrimary">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="field"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold mb-1.5 text-brandText-primary dark:text-brandText-darkPrimary">
                      Mobile phone (for token SMS)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="field"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1.5 text-brandText-primary dark:text-brandText-darkPrimary">
                      Roll no. / staff ID
                    </label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="field"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-cream-100 dark:bg-brandBorder-dark/30 border border-brandBorder-light dark:border-brandBorder-dark text-xs space-y-1">
                <p className="font-semibold text-forest dark:text-cream flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 stroke-[2]" />
                  {activeCanteen?.name}
                </p>
                <p className="text-brandText-secondary dark:text-brandText-darkSecondary pl-5">{activeCanteen?.location}</p>
              </div>

              <div className="divide-y divide-brandBorder-light dark:divide-brandBorder-dark">
                {cartItems.map(item => (
                  <div key={item.cartKey} className="py-2.5 flex justify-between items-center gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-brandText-primary dark:text-cream truncate">
                        {item.quantity}× {item.name}
                      </p>
                      {item.customization && (
                        <p className="text-brandText-secondary dark:text-brandText-darkSecondary text-2xs mt-0.5 truncate">{item.customization}</p>
                      )}
                    </div>
                    <span className="font-semibold text-brandText-primary dark:text-cream tabular-nums shrink-0">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <StepFooter
                backLabel="Modify tray"
                backTo="/student/cart"
                nextLabel="Select pickup slot"
                onNext={handleNextStep}
              />
            </div>
          )}

          {/* STEP 2: SELECT PICKUP TIME SLOT */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-brandText-primary dark:text-cream">
                  Pickup time window
                </h2>
                <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
                  Choose a 15-minute slot to keep your counter wait time minimal
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {slots.map(s => {
                  const isSelected = selectedSlot?.id === s.id;
                  const isFull = isSlotFull(s);
                  const remaining = remainingInSlot(s);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={isFull}
                      onClick={() => setSelectedSlot(s)}
                      className={`p-3.5 rounded-2xl border text-left transition-colors flex items-center justify-between ${
                        isFull
                          ? 'border-brandBorder-light dark:border-brandBorder-dark bg-cream-100/40 dark:bg-brandBorder-dark/20 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'border-forest bg-sage-50 dark:bg-forest/40 ring-1 ring-forest'
                          : 'border-brandBorder-light dark:border-brandBorder-dark hover:border-sage'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-brandText-primary dark:text-cream">
                          <Clock className="w-3.5 h-3.5 text-forest dark:text-sage-300 stroke-[2]" />
                          <span>{s.time}</span>
                        </div>
                        <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
                          {isFull ? 'Slot full' : `${remaining} of ${s.capacity} left`}
                        </p>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-forest dark:text-cream stroke-[2]" />
                      )}
                    </button>
                  );
                })}
              </div>

              <StepFooter
                backLabel="Back"
                onBack={() => setCurrentStep(1)}
                nextLabel="Proceed to payment"
                onNext={handleNextStep}
              />
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-brandText-primary dark:text-cream">
                  Choose payment mode
                </h2>
                <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
                  Select how you would like to settle this order
                </p>
              </div>

              <div className="space-y-3">
                {paymentOptions.map(({ key, icon: Icon, title, desc, badge }) => {
                  const active = paymentMethod === key;
                  return (
                    <label
                      key={key}
                      className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-colors ${
                        active
                          ? 'border-forest bg-sage-50/60 dark:bg-forest/30 ring-1 ring-forest'
                          : 'border-brandBorder-light dark:border-brandBorder-dark hover:border-sage'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={active}
                        onChange={() => setPaymentMethod(key)}
                        className="mt-1 accent-forest focus:ring-forest"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-brandText-primary dark:text-cream flex items-center gap-2">
                            <Icon className="w-4 h-4 text-forest dark:text-sage-300 stroke-[2]" />
                            {title}
                          </span>
                          {badge && (
                            <span className="text-2xs font-bold text-forest dark:text-sage-200 bg-sage-100 dark:bg-forest/60 px-2 py-0.5 rounded-full">
                              {badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
                          {desc}
                        </p>
                        {key === 'UPI' && active && (
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="your-vpa@upi"
                            className="field mt-3 sm:w-72"
                          />
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {paymentMethod !== 'Pay at Counter' && !gatewayConfigured && paymentConfig?.sandboxEnabled && (
                <div className="p-3.5 rounded-2xl bg-softOrange-50 dark:bg-softOrange-950/40 border border-softOrange-200 dark:border-softOrange-800 text-xs text-softOrange-700 dark:text-softOrange-300 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 stroke-[2]" />
                    <span>
                      <strong className="font-bold">Test mode.</strong> Live gateway credentials are not
                      configured in this environment, so no real charge can be made. Choose the outcome
                      below to exercise each payment state.
                    </span>
                  </div>
                  <select
                    value={sandboxOutcome}
                    onChange={(e) => setSandboxOutcome(e.target.value)}
                    className="field"
                  >
                    <option value="SUCCESS">Simulate: payment success</option>
                    <option value="PENDING">Simulate: payment pending</option>
                    <option value="FAILED">Simulate: payment failed</option>
                    <option value="CANCELLED">Simulate: payment cancelled</option>
                  </select>
                </div>
              )}
              {paymentMethod !== 'Pay at Counter' && paymentConfig && !gatewayConfigured && !paymentConfig.sandboxEnabled && (
                <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">
                  Online payments are unavailable right now. You can choose Pay at Counter instead.
                </p>
              )}

              <StepFooter
                backLabel="Back"
                onBack={() => setCurrentStep(2)}
                nextLabel="Review order"
                onNext={handleNextStep}
              />
            </div>
          )}

          {/* STEP 4: ORDER CONFIRMATION */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-brandText-primary dark:text-cream">
                  Confirm &amp; reserve token
                </h2>
                <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
                  Review your summary before submitting to the kitchen
                </p>
              </div>

              <div className="bg-cream-100 dark:bg-brandBorder-dark/40 rounded-2xl p-4 border border-brandBorder-light dark:border-brandBorder-dark space-y-3 text-xs">
                <SummaryRow label="Canteen" value={activeCanteen?.name} />
                <SummaryRow label="Pickup slot" value={selectedSlot?.time} valueClass="text-forest dark:text-sage-300" />
                <SummaryRow label="Customer" value={`${fullName} · ${phone}`} />
                <SummaryRow label="Payment mode" value={paymentMethod} />
              </div>

              <div className="p-3.5 rounded-2xl bg-softOrange-50 dark:bg-softOrange-950/40 border border-softOrange-200 dark:border-softOrange-800 text-xs text-softOrange-700 dark:text-softOrange-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 stroke-[2]" />
                <span>Free cancellation is available while the order remains in “Order Placed” status.</span>
              </div>

              <div className="pt-4 border-t border-brandBorder-light dark:border-brandBorder-dark flex justify-between items-center gap-3">
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={isProcessing}
                  className="text-xs font-semibold text-brandText-secondary hover:text-brandText-primary dark:hover:text-cream flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={isProcessing}
                  className="px-5 sm:px-6 py-3 rounded-2xl bg-primary hover:bg-primary-600 text-cream text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shadow-subtle disabled:opacity-60"
                >
                  {isProcessing ? (
                    <span>Generating kitchen token…</span>
                  ) : (
                    <>
                      <span>Confirm &amp; place order</span>
                      <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary (4 Cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="card rounded-3xl p-5 sm:p-6 space-y-4">
            <h3 className="font-semibold text-sm text-brandText-primary dark:text-cream pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
              Order breakdown
            </h3>

            <div className="space-y-2.5 text-xs">
              <SummaryRow label="Items subtotal" value={formatCurrency(subtotal)} light />
              <SummaryRow label="Taxes & GST (5%)" value={formatCurrency(taxes)} light />
              <SummaryRow label="Campus slot fee" value={formatCurrency(convenienceFee)} light />

              <div className="pt-3 border-t border-brandBorder-light dark:border-brandBorder-dark flex justify-between items-center">
                <span className="font-semibold text-sm text-brandText-primary dark:text-cream">Total</span>
                <span className="font-bold text-lg text-forest dark:text-sage-300 tabular-nums">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {selectedSlot && (
              <div className="p-3.5 rounded-2xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark text-xs">
                <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary uppercase font-bold tracking-wide">Pickup window</p>
                <p className="font-bold text-forest dark:text-cream mt-0.5">{selectedSlot.time}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepFooter({ backLabel, backTo, onBack, nextLabel, onNext }) {
  return (
    <div className="pt-4 border-t border-brandBorder-light dark:border-brandBorder-dark flex justify-between items-center gap-3">
      {backTo ? (
        <Link
          to={backTo}
          className="text-xs font-semibold text-brandText-secondary hover:text-brandText-primary dark:hover:text-cream flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
          <span>{backLabel}</span>
        </Link>
      ) : (
        <button
          onClick={onBack}
          className="text-xs font-semibold text-brandText-secondary hover:text-brandText-primary dark:hover:text-cream flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
          <span>{backLabel}</span>
        </button>
      )}
      <button
        onClick={onNext}
        className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-600 text-cream text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-subtle"
      >
        <span>{nextLabel}</span>
        <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
      </button>
    </div>
  );
}

function SummaryRow({ label, value, valueClass = '', light = false }) {
  return (
    <div className="flex justify-between items-center gap-3">
      <span className={light ? 'text-brandText-secondary dark:text-brandText-darkSecondary' : 'text-brandText-secondary'}>
        {label}
      </span>
      <span className={`font-semibold tabular-nums ${valueClass || (light ? 'text-brandText-primary dark:text-cream' : 'text-brandText-primary dark:text-cream')}`}>
        {value}
      </span>
    </div>
  );
}
