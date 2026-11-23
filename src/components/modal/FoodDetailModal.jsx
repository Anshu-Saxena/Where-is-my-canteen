import React, { useEffect, useState } from 'react';
import { X, Plus, Minus, Check, Sparkles, Star, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../contexts/CartContext';

export default function FoodDetailModal({ item, canteen, isOpen, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [addedNotice, setAddedNotice] = useState(false);

  // Reset local state whenever a different item is opened
  useEffect(() => {
    setQuantity(1);
    setSelectedOptions({});
    setAddedNotice(false);
  }, [item?.id]);

  if (!isOpen || !item) return null;

  const handleOptionChange = (customizationId, optionValue, price = 0) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [customizationId]: { value: optionValue, price }
    }));
  };

  const extraPrice = Object.values(selectedOptions).reduce((sum, opt) => sum + (opt.price || 0), 0);
  const unitPrice = item.price + extraPrice;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    const customSummary = Object.values(selectedOptions)
      .map((o) => o.value)
      .filter(Boolean)
      .join(', ');

    addToCart(item, canteen, customSummary, extraPrice, quantity);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brandText-primary/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-brandCard-dark w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-elevated border border-brandBorder-light dark:border-brandBorder-dark max-h-[92vh] flex flex-col animate-slideUp sm:animate-scaleIn">
        {/* Hero image */}
        <div className="relative h-56 sm:h-64 w-full shrink-0 overflow-hidden bg-cream-200 dark:bg-brandBorder-dark">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brandText-primary/70 via-transparent to-transparent" />

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 grid place-items-center rounded-full bg-brandText-primary/45 hover:bg-brandText-primary/65 text-white transition-colors backdrop-blur-sm"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-semibold backdrop-blur-md ${
                item.isVeg ? 'bg-forest/90 text-cream' : 'bg-rose-700/90 text-white'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-sage-300' : 'bg-rose-200'}`} />
              {item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
            </span>
            <span className="bg-brandText-primary/45 backdrop-blur-md text-white text-2xs px-2.5 py-1 rounded-full font-medium">
              {item.category}
            </span>
            <span
              className={`text-2xs px-2.5 py-1 rounded-full font-semibold backdrop-blur-md ${
                item.available ? 'bg-white/90 text-forest' : 'bg-rose-700/90 text-white'
              }`}
            >
              {item.available ? 'In stock' : 'Sold out'}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-xl font-bold text-brandText-primary dark:text-cream">
                {item.name}
              </h3>
              <span className="text-lg font-bold text-forest dark:text-sage-300 whitespace-nowrap">
                {formatCurrency(item.price)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-2xs text-brandText-secondary dark:text-brandText-darkSecondary">
              {item.rating && (
                <span className="inline-flex items-center gap-1 font-semibold text-brandText-primary dark:text-cream">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  {item.rating} rating
                </span>
              )}
              {canteen?.estimatedPrepTime && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {canteen.estimatedPrepTime} prep
                </span>
              )}
            </div>

            <p className="text-xs sm:text-[13px] text-brandText-secondary dark:text-brandText-darkSecondary mt-3 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Customizations */}
          {item.customizations && item.customizations.length > 0 && (
            <div className="pt-4 border-t border-brandBorder-light dark:border-brandBorder-dark space-y-4">
              <h4 className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-brandText-secondary dark:text-brandText-darkSecondary">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                Customize your order
              </h4>

              {item.customizations.map((cust) => (
                <div key={cust.id} className="space-y-2">
                  <span className="text-xs font-semibold text-brandText-primary dark:text-cream">{cust.name}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cust.options.map((opt, idx) => {
                      const isObj = typeof opt === 'object';
                      const optName = isObj ? opt.name : opt;
                      const optPrice = isObj ? opt.price : 0;
                      const isSelected = selectedOptions[cust.id]?.value === optName;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleOptionChange(cust.id, optName, optPrice)}
                          className={`flex items-center justify-between gap-2 p-3 rounded-xl border text-left text-xs transition-colors ${
                            isSelected
                              ? 'border-forest bg-sage-50 dark:bg-forest/30 text-forest dark:text-cream font-semibold'
                              : 'border-brandBorder-light dark:border-brandBorder-dark hover:border-sage-300 text-brandText-primary dark:text-brandText-darkPrimary'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={`w-4 h-4 rounded-full border grid place-items-center ${
                                isSelected ? 'border-forest dark:border-sage-300' : 'border-brandBorder-light dark:border-brandBorder-dark'
                              }`}
                            >
                              {isSelected && <span className="w-2 h-2 rounded-full bg-forest dark:bg-sage-300" />}
                            </span>
                            {optName}
                          </span>
                          {optPrice > 0 && (
                            <span className="text-forest dark:text-sage-300 font-semibold">
                              +{formatCurrency(optPrice)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky action footer */}
        <div className="p-4 sm:p-5 bg-cream-50 dark:bg-brandBorder-dark/40 border-t border-brandBorder-light dark:border-brandBorder-dark flex items-center gap-3 sm:gap-4">
          <div className="flex items-center bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark rounded-xl p-1 shadow-subtle">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              aria-label="Decrease quantity"
              className="w-8 h-8 rounded-lg grid place-items-center text-brandText-primary dark:text-cream hover:bg-cream-100 dark:hover:bg-brandBorder-dark transition-colors"
            >
              <Minus className="w-4 h-4 stroke-[2]" />
            </button>
            <span className="w-7 text-center text-sm font-bold text-brandText-primary dark:text-cream">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              aria-label="Increase quantity"
              className="w-8 h-8 rounded-lg grid place-items-center text-brandText-primary dark:text-cream hover:bg-cream-100 dark:hover:bg-brandBorder-dark transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={!item.available}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-subtle ${
              item.available
                ? 'bg-primary hover:bg-primary-600 text-cream'
                : 'bg-cream-200 dark:bg-brandBorder-dark text-brandText-secondary cursor-not-allowed'
            }`}
          >
            {addedNotice ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                Added to tray
              </>
            ) : item.available ? (
              <>
                Add to tray
                <span className="text-sage-200">·</span>
                {formatCurrency(totalPrice)}
              </>
            ) : (
              'Currently sold out'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
