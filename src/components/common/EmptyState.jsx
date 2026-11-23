import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = ShoppingBag,
  title = "No items found",
  description = "There are no items matching your current filters or selection.",
  actionText,
  actionLink,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-14 rounded-3xl border border-dashed border-brandBorder-light dark:border-brandBorder-dark bg-white/60 dark:bg-brandCard-dark/40 animate-fadeIn">
      <div className="w-14 h-14 rounded-2xl bg-sage-100 dark:bg-forest/50 text-forest dark:text-sage-200 grid place-items-center mb-4">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>
      <h3 className="font-display text-[15px] font-bold text-brandText-primary dark:text-brandText-darkPrimary">
        {title}
      </h3>
      <p className="text-xs sm:text-[13px] text-brandText-secondary dark:text-brandText-darkSecondary max-w-sm mt-1.5 mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-600 transition-colors shadow-subtle"
        >
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-600 transition-colors shadow-subtle"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
