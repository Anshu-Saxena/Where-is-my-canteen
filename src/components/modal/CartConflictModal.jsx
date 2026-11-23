import React from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export default function CartConflictModal() {
  const { conflictModal, resolveConflict, activeCanteen } = useCart();

  if (!conflictModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brandText-primary/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-brandCard-dark rounded-3xl max-w-md w-full p-6 shadow-elevated border border-brandBorder-light dark:border-brandBorder-dark animate-scaleIn">
        <div className="w-12 h-12 rounded-2xl bg-softOrange-50 dark:bg-softOrange-950/60 text-softOrange-500 grid place-items-center mb-4">
          <AlertCircle className="w-6 h-6 stroke-[1.8]" />
        </div>

        <h3 className="font-display text-lg font-bold text-brandText-primary dark:text-cream mb-2">
          Start a new order?
        </h3>

        <p className="text-xs sm:text-[13px] text-brandText-secondary dark:text-brandText-darkSecondary mb-4 leading-relaxed">
          Your tray currently contains items from{' '}
          <strong className="text-brandText-primary dark:text-cream">{activeCanteen?.name}</strong>. Each campus
          kitchen prepares its own tray, so items can only be ordered from one counter at a time.
        </p>

        <div className="flex items-center justify-between gap-3 rounded-xl bg-cream-50 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark p-3 mb-6 text-xs">
          <span className="text-brandText-secondary dark:text-brandText-darkSecondary">Adding item from</span>
          <span className="font-semibold text-forest dark:text-cream truncate">
            {conflictModal.pendingCanteen?.name}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => resolveConflict(false)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark text-brandText-primary dark:text-cream font-semibold hover:bg-cream-50 dark:hover:bg-brandBorder-dark/50 transition-colors text-xs"
          >
            Keep current tray
          </button>
          <button
            type="button"
            onClick={() => resolveConflict(true)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-600 transition-colors text-xs inline-flex items-center justify-center gap-2 shadow-subtle"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
            Discard &amp; add
          </button>
        </div>
      </div>
    </div>
  );
}
