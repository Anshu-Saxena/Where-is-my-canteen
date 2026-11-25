import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Star,
  Leaf,
  Clock,
  RotateCcw,
  Store,
  Utensils,
  CheckCircle2
} from 'lucide-react';
import { useUniversity } from '../../contexts/UniversityContext';
import { useMenu } from '../../contexts/MenuContext';
import { canteenService } from '../../services/api';
import CanteenCard from '../../components/canteen/CanteenCard';
import FoodCard from '../../components/canteen/FoodCard';
import FoodDetailModal from '../../components/modal/FoodDetailModal';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export default function ExploreCanteensPage() {
  const { selectedCampus } = useUniversity();
  const { loadMenuItems } = useMenu();
  const [searchParams, setSearchParams] = useSearchParams();

  const [canteens, setCanteens] = useState([]);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // View mode: 'menu' (Explore Menu) or 'canteens' (Canteen Selection)
  const [viewMode, setViewMode] = useState(() =>
    searchParams.get('view') === 'canteens' ? 'canteens' : 'menu'
  );

  // Filters & Sorting state
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') === 'Daily Essentials'
      ? 'Essentials'
      : searchParams.get('category') || 'All'
  );
  const [selectedCanteenId, setSelectedCanteenId] = useState('All');
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [priceFilter, setPriceFilter] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  const categories = [
    'All',
    'Breakfast',
    'Lunch',
    'Snacks',
    'Beverages',
    'Stationery',
    'Essentials',
    'Fast Food'
  ];

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const data = await canteenService.getCanteens({ campusId: selectedCampus?.id });
        if (!active) return;
        setCanteens(data);
        const menuArrays = await Promise.all(
          data.map(canteen => loadMenuItems(canteen.id).catch(() => []))
        );
        if (!active) return;
        setAllMenuItems(menuArrays.flat());
      } catch (e) {
        if (active) setLoadError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [selectedCampus?.id, loadMenuItems]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearch(q);
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category === 'Daily Essentials' ? 'Essentials' : category);
    }
    const view = searchParams.get('view');
    if (view === 'canteens' || view === 'menu') {
      setViewMode(view);
    }
  }, [searchParams]);

  const canteenById = useMemo(
    () => Object.fromEntries(canteens.map(c => [c.id, c])),
    [canteens]
  );

  const filteredCanteens = useMemo(() => {
    const categoryFilter = selectedCategory === 'Essentials' ? 'Daily Essentials' : selectedCategory;
    return canteens
      .filter(c => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = c.name.toLowerCase().includes(q);
          const matchDesc = (c.description || '').toLowerCase().includes(q);
          const matchCat = (c.categories || []).some(cat => cat.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchCat) return false;
        }
        if (categoryFilter !== 'All' && !(c.categories || []).includes(categoryFilter)) {
          return false;
        }
        if (openNowOnly && !c.isOpen) return false;
        if (vegOnly && !c.pureVeg) return false;
        if (minRating > 0 && c.rating < minRating) return false;
        if (priceFilter === 'budget' && c.priceRange !== '₹') return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'popularity') return (b.reviewsCount || 0) - (a.reviewsCount || 0);
        if (sortBy === 'price_low') return (a.priceRange || '').length - (b.priceRange || '').length;
        return 0;
      });
  }, [canteens, search, selectedCategory, openNowOnly, vegOnly, minRating, priceFilter, sortBy]);

  const filteredMenuItems = useMemo(() => {
    const categoryFilter = selectedCategory === 'Essentials' ? 'Daily Essentials' : selectedCategory;
    return allMenuItems
      .filter(item => {
        const parentCanteen = canteenById[item.canteenId];
        if (selectedCanteenId !== 'All' && item.canteenId !== selectedCanteenId) {
          return false;
        }
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = (item.name || '').toLowerCase().includes(q);
          const matchDesc = (item.description || '').toLowerCase().includes(q);
          const matchCat = (item.category || '').toLowerCase().includes(q);
          const matchCanteen = (parentCanteen?.name || '').toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat && !matchCanteen) return false;
        }
        if (categoryFilter !== 'All' && item.category !== categoryFilter) {
          return false;
        }
        if (openNowOnly && parentCanteen && !parentCanteen.isOpen) {
          return false;
        }
        if (availableOnly && item.available !== true) {
          return false;
        }
        if (vegOnly && item.isVeg !== true) {
          return false;
        }
        if (minRating > 0 && (item.rating || 0) < minRating) {
          return false;
        }
        if (priceFilter === 'under50' && Number(item.price) >= 50) return false;
        if (priceFilter === '50to100' && (Number(item.price) < 50 || Number(item.price) > 100)) return false;
        if (priceFilter === 'above100' && Number(item.price) <= 100) return false;
        if (priceFilter === 'budget' && Number(item.price) > 70) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'price_low') return (Number(a.price) || 0) - (Number(b.price) || 0);
        if (sortBy === 'price_high') return (Number(b.price) || 0) - (Number(a.price) || 0);
        if (sortBy === 'prep_fast') return (Number(a.preparationTime) || 99) - (Number(b.preparationTime) || 99);
        return (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0);
      });
  }, [
    allMenuItems,
    canteenById,
    selectedCanteenId,
    search,
    selectedCategory,
    openNowOnly,
    availableOnly,
    vegOnly,
    minRating,
    priceFilter,
    sortBy
  ]);

  const selectedItemId = searchParams.get('item');
  const selectedItemForModal = selectedItemId
    ? allMenuItems.find(item => item.id === selectedItemId) || null
    : null;
  const modalCanteen = selectedItemForModal
    ? canteenById[selectedItemForModal.canteenId] || null
    : null;

  const openItemModal = (item) => {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous);
      next.set('item', item.id);
      return next;
    });
  };

  const closeItemModal = () => {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous);
      next.delete('item');
      return next;
    }, { replace: true });
  };

  const handleSwitchView = (mode) => {
    setViewMode(mode);
    setSearchParams(previous => {
      const next = new URLSearchParams(previous);
      next.set('view', mode);
      return next;
    }, { replace: true });
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedCanteenId('All');
    setOpenNowOnly(false);
    setAvailableOnly(false);
    setVegOnly(false);
    setMinRating(0);
    setPriceFilter('All');
    setSortBy('rating');
  };

  const hasActiveFilters =
    search ||
    selectedCategory !== 'All' ||
    selectedCanteenId !== 'All' ||
    openNowOnly ||
    availableOnly ||
    vegOnly ||
    minRating > 0 ||
    priceFilter !== 'All';

  return (
    <div className="space-y-6">
      {/* Page Header & View Switcher */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brandText-primary dark:text-cream">
            {viewMode === 'menu' ? 'Explore Menu' : 'Campus Canteens'}
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            {viewMode === 'menu'
              ? `All food, beverages & essentials across ${selectedCampus?.name || 'campus'}`
              : `Verified food & daily essentials counters in ${selectedCampus?.name || 'campus'}`}
          </p>
        </div>

        <div className="inline-flex p-1 rounded-2xl bg-cream-100 dark:bg-brandBorder-dark/50 border border-brandBorder-light dark:border-brandBorder-dark">
          <button
            type="button"
            onClick={() => handleSwitchView('menu')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              viewMode === 'menu'
                ? 'bg-primary text-white shadow-subtle'
                : 'text-brandText-secondary dark:text-brandText-darkSecondary hover:text-brandText-primary'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Food Menu ({filteredMenuItems.length})</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchView('canteens')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              viewMode === 'canteens'
                ? 'bg-primary text-white shadow-subtle'
                : 'text-brandText-secondary dark:text-brandText-darkSecondary hover:text-brandText-primary'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Canteens ({filteredCanteens.length})</span>
          </button>
        </div>
      </div>

      {loadError && (
        <p role="alert" className="text-xs text-rose-600">{loadError}</p>
      )}

      {/* Search & Top Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brandText-secondary" />
          <input
            type="text"
            placeholder={
              viewMode === 'menu'
                ? 'Search dishes, beverages, snacks, or canteen name...'
                : 'Search canteens, cuisines, beverages, stationery...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field pl-10 py-3 text-xs sm:text-sm"
          />
        </div>

        {viewMode === 'menu' && canteens.length > 0 && (
          <select
            value={selectedCanteenId}
            onChange={(e) => setSelectedCanteenId(e.target.value)}
            className="field py-3 px-3.5 text-xs font-semibold w-full sm:w-52"
            aria-label="Filter by canteen"
          >
            <option value="All">All Canteens</option>
            {canteens.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}

        {/* Sort selector */}
        <div className="relative flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="field appearance-none cursor-pointer py-3 pr-9 pl-3.5 font-semibold w-full sm:w-auto text-xs"
            aria-label="Sort results"
          >
            <option value="rating">Highest Rated</option>
            {viewMode === 'menu' ? (
              <>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="prep_fast">Fastest Prep Time</option>
              </>
            ) : (
              <>
                <option value="popularity">Most Popular</option>
                <option value="price_low">Budget First</option>
              </>
            )}
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

        {viewMode === 'menu' && (
          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors font-medium ${
              availableOnly
                ? 'bg-sage-100 dark:bg-forest/50 text-forest dark:text-cream border-sage-300 dark:border-forest font-bold'
                : 'bg-white dark:bg-brandCard-dark text-brandText-secondary border-brandBorder-light dark:border-brandBorder-dark'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.8]" />
            <span>In Stock</span>
          </button>
        )}

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

        {viewMode === 'menu' ? (
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            aria-label="Price filter"
            className="px-3 py-1.5 rounded-full border bg-white dark:bg-brandCard-dark text-brandText-secondary dark:text-brandText-darkSecondary border-brandBorder-light dark:border-brandBorder-dark font-medium text-xs"
          >
            <option value="All">Any Price</option>
            <option value="under50">Under ₹50</option>
            <option value="50to100">₹50 – ₹100</option>
            <option value="above100">Above ₹100</option>
          </select>
        ) : (
          <button
            onClick={() => setPriceFilter(priceFilter === 'budget' ? 'All' : 'budget')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border transition-colors font-medium ${
              priceFilter === 'budget'
                ? 'bg-sage-100 dark:bg-forest/50 text-forest dark:text-cream border-sage-300 dark:border-forest font-bold'
                : 'bg-white dark:bg-brandCard-dark text-brandText-secondary border-brandBorder-light dark:border-brandBorder-dark'
            }`}
          >
            <span>₹ Budget Friendly</span>
          </button>
        )}

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

      {/* Content Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : viewMode === 'menu' ? (
        filteredMenuItems.length === 0 ? (
          <EmptyState
            icon={Utensils}
            title="No food items match your filters"
            description="Try searching a different dish, switching categories, or clearing your active filters."
            actionText="Clear All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMenuItems.map(item => {
              const parentCanteen = canteenById[item.canteenId];
              return (
                <div key={item.id} className="space-y-1">
                  <FoodCard item={item} onSelect={openItemModal} />
                  {parentCanteen && (
                    <div className="px-2 flex items-center justify-between text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary">
                      <Link
                        to={`/student/canteen/${parentCanteen.id}`}
                        className="inline-flex items-center gap-1 hover:text-primary font-medium truncate"
                      >
                        <Store className="w-3 h-3 shrink-0" />
                        <span>{parentCanteen.name}</span>
                      </Link>
                      <span>{parentCanteen.openingHours}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
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

      {/* Product Details Modal */}
      <FoodDetailModal
        item={selectedItemForModal}
        canteen={modalCanteen}
        isOpen={Boolean(selectedItemForModal)}
        onClose={closeItemModal}
      />
    </div>
  );
}
