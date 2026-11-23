import React from 'react';
import { Plus, Star } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function FoodCard({ item, onSelect }) {
  return (
    <div
      onClick={() => onSelect(item)}
      className="group card p-3.5 flex gap-4 cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:border-sage-300 dark:hover:border-sage-600"
    >
      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`w-3.5 h-3.5 shrink-0 rounded-[3px] border flex items-center justify-center ${
                item.isVeg ? 'border-sage-700' : 'border-rose-600'
              }`}
              title={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-sage-700' : 'bg-rose-600'}`} />
            </span>
            <span className="text-2xs font-semibold text-brandText-secondary dark:text-brandText-darkSecondary uppercase tracking-wider truncate">
              {item.category}
            </span>
            {item.isSpecial && (
              <span className="shrink-0 text-2xs font-semibold px-2 py-0.5 rounded-full bg-softOrange-100 text-softOrange-700 dark:bg-softOrange-950/60 dark:text-softOrange-300">
                Special
              </span>
            )}
          </div>

          <h4 className="font-display text-sm sm:text-[15px] font-bold text-brandText-primary dark:text-brandText-darkPrimary group-hover:text-forest dark:group-hover:text-sage-300 transition-colors line-clamp-1 mb-1">
            {item.name}
          </h4>

          <p className="text-2xs sm:text-xs text-brandText-secondary dark:text-brandText-darkSecondary line-clamp-2 leading-relaxed">
            {item.description}
          </p>
          <span className="inline-flex items-center gap-1.5 mt-1.5 text-2xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary">
            <span className={`w-1.5 h-1.5 rounded-full ${item.available ? 'bg-primary' : 'bg-brandText-secondary'}`} />
            {item.available ? 'Available now' : 'Currently unavailable'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-[15px] sm:text-base font-bold text-brandText-primary dark:text-brandText-darkPrimary">
              {formatCurrency(item.price)}
            </span>
            {item.rating && (
              <span className="inline-flex items-center gap-0.5 text-2xs text-brandText-secondary dark:text-brandText-darkSecondary font-medium">
                <Star className="w-3 h-3 fill-accent text-accent" />
                {item.rating}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            disabled={!item.available}
            className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              item.available
                ? 'bg-sage-100 dark:bg-forest/50 text-forest dark:text-cream hover:bg-forest hover:text-cream shadow-subtle'
                : 'bg-cream-200 dark:bg-brandBorder-dark/40 text-brandText-secondary cursor-not-allowed'
            }`}
          >
            {item.available ? (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[2.4]" />
                Add
              </>
            ) : (
              'Sold out'
            )}
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="relative w-24 h-24 sm:w-[104px] sm:h-[104px] shrink-0 rounded-2xl overflow-hidden bg-cream-200 dark:bg-brandBorder-dark">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {!item.available && (
          <div className="absolute inset-0 bg-brandText-primary/60 backdrop-blur-[1px] grid place-items-center">
            <span className="text-2xs font-bold text-white uppercase tracking-wider">Sold out</span>
          </div>
        )}
      </div>
    </div>
  );
}
