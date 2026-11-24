import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, Heart, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function CanteenCard({ canteen }) {
  const { isFavourite, toggleFavourite } = useAuth();
  const [favoriteError, setFavoriteError] = useState('');
  const fav = isFavourite(canteen.id);

  return (
    <div className="group card overflow-hidden flex flex-col transition-all duration-200 hover:shadow-card-hover hover:border-sage-300 dark:hover:border-sage-600">
      {/* Cover */}
      <div className="relative h-40 w-full overflow-hidden bg-cream-200 dark:bg-brandBorder-dark">
        <img
          src={canteen.coverImage}
          alt={canteen.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brandText-primary/60 via-transparent to-transparent" />

        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-semibold backdrop-blur-md ${
            canteen.isOpen ? 'bg-forest/90 text-cream' : 'bg-brandText-primary/70 text-white'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${canteen.isOpen ? 'bg-sage-300' : 'bg-rose-400'}`} />
          {canteen.isOpen ? 'Open now' : 'Closed'}
        </span>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavourite(canteen.id).catch(error => setFavoriteError(error.message));
          }}
          aria-label="Save to favourites"
          className="absolute top-2.5 right-2.5 w-8 h-8 grid place-items-center rounded-full bg-brandText-primary/35 hover:bg-brandText-primary/55 backdrop-blur-md text-white transition-colors"
        >
          <Heart className={`w-4 h-4 transition ${fav ? 'fill-accent text-accent' : 'text-white'}`} />
        </button>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <span className="inline-flex items-center gap-1.5 bg-brandText-primary/40 backdrop-blur-md px-2 py-0.5 rounded-lg text-2xs font-medium">
            <Clock className="w-3 h-3 text-sage-300" />
            {canteen.estimatedPrepTime}
          </span>
          <span className="inline-flex items-center gap-1 bg-white/95 dark:bg-brandCard-dark/95 px-2 py-0.5 rounded-lg text-2xs font-bold text-brandText-primary dark:text-cream shadow-subtle">
            <Star className="w-3 h-3 fill-accent text-accent" />
            {canteen.rating}
            <span className="font-medium text-brandText-secondary">({canteen.reviewsCount})</span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {favoriteError && <p className="mb-2 text-[10px] text-rose-600">{favoriteError}</p>}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display text-[15px] font-bold text-brandText-primary dark:text-brandText-darkPrimary group-hover:text-forest dark:group-hover:text-sage-300 transition-colors line-clamp-1">
              {canteen.name}
            </h3>
            <span className="shrink-0 text-2xs font-semibold px-2 py-0.5 rounded-lg bg-cream-100 dark:bg-brandBorder-dark text-brandText-secondary dark:text-brandText-darkSecondary">
              {canteen.priceRange}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mb-3">
            <MapPin className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400 shrink-0" />
            <span className="line-clamp-1">{canteen.location}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {canteen.categories.slice(0, 3).map((cat, idx) => (
              <span
                key={idx}
                className="text-2xs font-medium px-2 py-0.5 rounded-md bg-cream-100 dark:bg-brandBorder-dark/60 text-brandText-secondary dark:text-brandText-darkSecondary border border-brandBorder-light dark:border-brandBorder-dark"
              >
                {cat}
              </span>
            ))}
            {canteen.pureVeg && (
              <span className="text-2xs font-medium px-2 py-0.5 rounded-md bg-sage-100 dark:bg-forest/50 text-forest dark:text-sage-200 border border-sage-200 dark:border-forest">
                Pure veg
              </span>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-brandBorder-light dark:border-brandBorder-dark flex items-center justify-between gap-2">
          <span className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary truncate">
            {canteen.openingHours}
          </span>
          <Link
            to={`/student/canteen/${canteen.id}`}
            className="shrink-0 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-600 transition-colors shadow-subtle"
          >
            View menu
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
