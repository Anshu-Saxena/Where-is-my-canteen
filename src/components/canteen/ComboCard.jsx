import React from 'react';
import { Plus, Package, AlertTriangle, Sparkles } from 'lucide-react';
import { useCombos } from '../../contexts/ComboContext';
import { useMenu } from '../../contexts/MenuContext';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatters';

/**
 * Combo meal card. Reads pricing + availability from the combo store (which in
 * turn derives availability from the live menu), and adds the combo to the
 * shared cart as a single bundled line item.
 */
export default function ComboCard({ combo, canteen, onAdded }) {
  const { getComboPricing, getComboAvailability } = useCombos();
  const { getItemById } = useMenu();
  const { addToCart } = useCart();

  const { originalPrice, savings, discountPct } = getComboPricing(combo);
  const { available, unavailableItems } = getComboAvailability(combo);

  const includedItems = (combo.items || [])
    .map(line => {
      const item = getItemById(line.itemId);
      return item ? { name: item.name, quantity: line.quantity, isVeg: item.isVeg } : null;
    })
    .filter(Boolean);
  const isVeg = includedItems.length > 0 && includedItems.every(i => i.isVeg);
  const includedSummary = includedItems.map(i => `${i.quantity}× ${i.name}`).join(', ');

  const handleAdd = () => {
    if (!available) return;
    addToCart(
      {
        id: combo.id,
        name: `${combo.name} (Combo)`,
        price: combo.price,
        image: combo.image,
        isVeg
      },
      canteen,
      includedSummary || 'Combo meal',
      0,
      1
    );
    if (onAdded) onAdded(combo);
  };

  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="relative h-36 w-full bg-cream-200 dark:bg-brandBorder-dark">
        {combo.image ? (
          <img
            src={combo.image}
            alt={combo.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-brandText-secondary">
            <Package className="w-8 h-8" />
          </div>
        )}
        {discountPct > 0 && (
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-softOrange-500 text-white text-2xs font-bold shadow-subtle">
            <Sparkles className="w-3 h-3 stroke-[2.4]" />
            Save {discountPct}%
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h4 className="font-display text-sm font-bold text-brandText-primary dark:text-cream line-clamp-1">
          {combo.name}
        </h4>
        {combo.description && (
          <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary line-clamp-2 mt-0.5">
            {combo.description}
          </p>
        )}

        <ul className="mt-2.5 space-y-1">
          {includedItems.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5 text-2xs text-brandText-primary dark:text-brandText-darkPrimary">
              <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-sage-700' : 'bg-rose-600'}`} />
              <span className="truncate">{item.quantity}× {item.name}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-forest dark:text-sage-300">
              {formatCurrency(combo.price)}
            </span>
            {originalPrice > combo.price && (
              <span className="text-2xs text-brandText-secondary line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>

          {available ? (
            <button
              type="button"
              onClick={handleAdd}
              className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sage-100 dark:bg-forest/50 text-forest dark:text-cream hover:bg-forest hover:text-cream text-xs font-semibold transition-colors shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.4]" />
              Add combo to tray
            </button>
          ) : (
            <div className="mt-2.5 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cream-200/70 dark:bg-brandBorder-dark/40 text-2xs text-brandText-secondary dark:text-brandText-darkSecondary">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-2">
                Unavailable — {unavailableItems.length ? `sold out: ${unavailableItems.join(', ')}` : 'disabled by canteen'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
