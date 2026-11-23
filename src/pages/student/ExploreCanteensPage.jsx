import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Star,
  Leaf,
  Clock,
  RotateCcw,
  Store,
  BookOpen,
  Package
} from 'lucide-react';
import { useUniversity } from '../../contexts/UniversityContext';
import { canteenService } from '../../services/api';
import CanteenCard from '../../components/canteen/CanteenCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export default function ExploreCanteensPage() {
  const { selectedCampus } = useUniversity();
  const [searchParams, setSearchParams] = useSearchParams();

  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') === 'Daily Essentials' ? 'Essentials' : searchParams.get('category') || 'All'
  );
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [priceFilter, setPriceFilter] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  const categories = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Stationery', 'Essentials', 'Fast Food'];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await canteenService.getCanteens({ campusId: selectedCampus?.id });
        setCanteens(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCampus]);

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
    const category = searchParams.get('category') || 'All';
    setSelectedCategory(category === 'Daily Essentials' ? 'Essentials' : category);
  }, [searchParams]);

  const filteredCanteens = useMemo(() => {
    const categoryFilter = selectedCategory === 'Essentials' ? 'Daily Essentials' : selectedCategory;
    return canteens
      .filter(c => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = c.name.toLowerCase().includes(q);
          const matchDesc = c.description.toLowerCase().includes(q);
          const matchCat = c.categories.some(cat => cat.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        // Category
        if (categoryFilter !== 'All' && !c.categories.includes(categoryFilter)) {
          return false;
        }

        // Open now
        if (openNowOnly && !c.isOpen) {
          return false;
        }

        // Veg only
        if (vegOnly && !c.pureVeg) {
          return false;
        }

        // Rating
        if (minRating > 0 && c.rating < minRating) {
          return false;
        }

        // Price range
        if (priceFilter !== 'All' && c.priceRange !== priceFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'popularity') return b.reviewsCount - a.reviewsCount;
        if (sortBy === 'price_low') return a.priceRange.length - b.priceRange.length;
        return 0;
      });
  }, [canteens, search, selectedCategory, openNowOnly, vegOnly, minRating, priceFilter, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setOpenNowOnly(false);
    setVegOnly(false);
    setMinRating(0);
    setPriceFilter('All');
    setSortBy('rating');
  };

  const hasActiveFilters = search || selectedCategory !== 'All' || openNowOnly || vegOnly || minRating > 0 || priceFilter !== 'All';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brandText-primary dark:text-cream">
            Browse Menu &amp; Essentials
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Verified food &amp; daily essentials counters in {selectedCampus?.name}
          </p>
        </div>
        {!loading && (
          <span className="text-2xs font-semibold text-brandText-secondary dark:text-brandText-darkSecondary bg-cream-100 dark:bg-brandBorder-dark/50 border border-brandBorder-light dark:border-brandBorder-dark px-3 py-1.5 rounded-full">
            {filteredCanteens.length} {filteredCanteens.length === 1 ? 'counter' : 'counters'}
          </span>
        )}
      </div>

      {/* Search & Top Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brandText-secondary" />
          <input
            type="text"
            placeholder="Search canteens, dishes, beverages, stationery..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field pl-10 py-3 text-xs sm:text-sm"
          />
        </div>

        {/* Sort selector */}
        <div className="relative flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="field appearance-none cursor-pointer py-3 pr-9 pl-3.5 font-semibold w-full sm:w-auto"
            aria-label="Sort canteens"
          >
            <option value="rating">Highest Rated</option>
            <option value="popularity">Most Popular</option>
            <option value="price_low">Budget First</option>
          </select>
          <SlidersHorizontal className="absolute right-3 w-3.5 h-3.5 text-brandText-secondary pointer-events-none" />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-white shadow-subtle'
                : 'bg-white dark:bg-brandCard-dark text-brandText-secondary dark:text-brandText-darkSecondary border border-brandBorder-light dark:border-brandBorder-dark hover:border-sage hover:text-brandText-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Quick Filter Badges Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Open Now toggle */}
        <button
          onClick={() => setOpenNowOnly(!openNowOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors font-medium ${
            openNowOnly
              ? 'bg-sage-100 dark:bg-forest/50 text-forest dark:text-cream border-sage-300 dark:border-forest font-bold'
              : 'bg-white dark:bg-brandCard-dark text-brandText-secondary border-brandBorder-light dark:border-brandBorder-dark'
          }`}
        >
          <Clock className="w-3.5 h-3.5 stroke-[1.8]" />
          <span>Open Now</span>
        </button>

        {/* Veg Only toggle */}
        <button
          onClick={() => setVegOnly(!vegOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors font-medium ${
            vegOnly
              ? 'bg-sage-100 dark:bg-forest/50 text-forest dark:text-cream border-sage-300 dark:border-forest font-bold'
              : 'bg-white dark:bg-brandCard-dark text-brandText-secondary border-brandBorder-light dark:border-brandBorder-dark'
          }`}
        >
          <Leaf className="w-3.5 h-3.5 stroke-[1.8]" />
          <span>Pure Veg</span>
        </button>

        {/* 4.5+ Rating toggle */}
        <button
          onClick={() => setMinRating(minRating === 4.5 ? 0 : 4.5)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors font-medium ${
            minRating === 4.5
              ? 'bg-softOrange-50 dark:bg-softOrange-950/40 text-softOrange-600 dark:text-softOrange-300 border-softOrange-200 dark:border-softOrange-800 font-bold'
              : 'bg-white dark:bg-brandCard-dark text-brandText-secondary border-brandBorder-light dark:border-brandBorder-dark'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-accent text-accent" />
          <span>4.5+ Rated</span>
        </button>

        {/* Budget Friendly toggle */}
        <button
          onClick={() => setPriceFilter(priceFilter === '₹' ? 'All' : '₹')}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border transition-colors font-medium ${
            priceFilter === '₹'
              ? 'bg-sage-100 dark:bg-forest/50 text-forest dark:text-cream border-sage-300 dark:border-forest font-bold'
              : 'bg-white dark:bg-brandCard-dark text-brandText-secondary border-brandBorder-light dark:border-brandBorder-dark'
          }`}
        >
          <span>₹ Budget Friendly</span>
        </button>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-2xl text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition ml-auto"
          >
            <RotateCcw className="w-3 h-3 stroke-[2]" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Canteen List Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : filteredCanteens.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No canteens match your selection"
          description="Try selecting a different category or clearing your active filters."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCanteens.map(canteen => (
            <CanteenCard key={canteen.id} canteen={canteen} />
          ))}
        </div>
      )}
    </div>
  );
}
