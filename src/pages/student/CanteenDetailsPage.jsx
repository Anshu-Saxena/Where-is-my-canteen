import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  MapPin,
  Heart,
  Phone,
  Mail,
  Info,
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
  Share2,
  Sparkles
} from 'lucide-react';
import { canteenService, reviewService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useMenu } from '../../contexts/MenuContext';
import { useCombos } from '../../contexts/ComboContext';
import FoodCard from '../../components/canteen/FoodCard';
import FoodDetailModal from '../../components/modal/FoodDetailModal';
import ComboCard from '../../components/canteen/ComboCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';

export default function CanteenDetailsPage() {
  const { id } = useParams();
  const { isFavourite, toggleFavourite } = useAuth();
  const { itemCount, grandTotal, activeCanteen } = useCart();
  const { getMenuItems, loadMenuItems } = useMenu();
  const { getCombos, loadCombos } = useCombos();

  const [canteen, setCanteen] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [favouriteError, setFavouriteError] = useState('');

  // Tabs: 'menu' | 'reviews' | 'about'
  const [activeTab, setActiveTab] = useState('menu');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);

  const categories = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Stationery', 'Daily Essentials', 'Fast Food', 'Other'];

  // Live menu + combos from the shared stores (reflects owner availability edits)
  const menuItems = getMenuItems(id);
  const combos = getCombos(id);

  useEffect(() => {
    async function fetchCanteenData() {
      setLoading(true);
      try {
        const [c, r] = await Promise.all([
          canteenService.getCanteenById(id),
          reviewService.getCanteenReviews(id),
          loadMenuItems(id),
          loadCombos(id)
        ]);
        setCanteen(c);
        setReviews(r);
      } catch (e) {
        setLoadError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCanteenData();
  }, [id, loadMenuItems, loadCombos]);

  if (loading) {
    return <LoadingSkeleton count={4} />;
  }

  if (!canteen) {
    return (
      <EmptyState
        title="Canteen Not Found"
        description={loadError || 'The canteen you are looking for is not listed or has been temporarily closed.'}
        actionText="Back to Canteens"
        actionLink="/student/canteens"
      />
    );
  }

  const filteredItems = menuItems.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    return true;
  });

  const isCurrentCanteenInCart = activeCanteen?.id === canteen.id && itemCount > 0;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/student/canteens"
        className="inline-flex items-center gap-2 text-xs font-semibold text-brandText-secondary hover:text-forest dark:hover:text-cream transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explore Canteens</span>
      </Link>

      {/* Canteen Hero Header Card */}
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
        {/* Banner image */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-cream-200 dark:bg-brandBorder-dark">
          <img
            src={canteen.coverImage}
            alt={canteen.name}
            className="w-full h-full object-cover opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Top action icons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => {
                setFavouriteError('');
                toggleFavourite(canteen.id).catch(error => setFavouriteError(error.message));
              }}
              className="p-2.5 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition"
              title="Save to favourites"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavourite(canteen.id) ? 'fill-accent text-accent' : 'text-white'
                }`}
              />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: canteen.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Canteen link copied to clipboard!');
                }
              }}
              className="p-2.5 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition"
              title="Share canteen"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom badge overlay inside image */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3 text-white">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold backdrop-blur-md ${
                    canteen.isOpen
                      ? 'bg-forest/90 text-cream'
                      : 'bg-black/60 text-white'
                  }`}
                >
                  {canteen.isOpen ? 'Open Now' : 'Closed'}
                </span>
                <span className="text-xs bg-black/50 backdrop-blur-md px-3 py-0.5 rounded-full font-medium">
                  Prep: {canteen.estimatedPrepTime}
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold drop-shadow-sm">
                {canteen.name}
              </h1>
            </div>

            <div className="flex items-center gap-2 bg-white/95 dark:bg-brandCard-dark/95 text-brandText-primary dark:text-cream px-3 py-1 rounded-2xl font-bold text-xs sm:text-sm shadow-subtle">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span>{canteen.rating}</span>
              <span className="text-xs font-normal text-brandText-secondary">
                ({canteen.reviewsCount} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Canteen Location & Meta description */}
        <div className="p-5 sm:p-6 bg-white dark:bg-brandCard-dark flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-brandText-primary dark:text-brandText-darkPrimary">
              <MapPin className="w-4 h-4 text-forest dark:text-sage-300 flex-shrink-0" />
              <span>{canteen.location}</span>
              <span>•</span>
              <Clock className="w-4 h-4 text-brandText-secondary flex-shrink-0" />
              <span>{canteen.openingHours}</span>
            </div>
            <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary max-w-2xl leading-relaxed pt-1">
              {canteen.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canteen.categories.map((c, i) => (
              <span
                key={i}
                className="text-xs font-medium px-3 py-1 rounded-xl bg-cream-100 dark:bg-brandBorder-dark/60 text-brandText-primary dark:text-cream border border-brandBorder-light dark:border-brandBorder-dark"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation: Menu, Reviews, About */}
      {favouriteError && <p className="text-xs text-rose-600">{favouriteError}</p>}
      <div className="border-b border-brandBorder-light dark:border-brandBorder-dark">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-3 px-1 border-b-2 font-bold text-xs sm:text-sm transition ${
              activeTab === 'menu'
                ? 'border-forest text-forest dark:border-cream dark:text-cream'
                : 'border-transparent text-brandText-secondary hover:text-brandText-primary'
            }`}
          >
            Menu Items ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-1 border-b-2 font-bold text-xs sm:text-sm transition ${
              activeTab === 'reviews'
                ? 'border-forest text-forest dark:border-cream dark:text-cream'
                : 'border-transparent text-brandText-secondary hover:text-brandText-primary'
            }`}
          >
            Reviews & Ratings ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-1 border-b-2 font-bold text-xs sm:text-sm transition ${
              activeTab === 'about'
                ? 'border-forest text-forest dark:border-cream dark:text-cream'
                : 'border-transparent text-brandText-secondary hover:text-brandText-primary'
            }`}
          >
            About & Contact
          </button>
        </nav>
      </div>

      {/* Tab 1: Menu */}
      {activeTab === 'menu' && (
        <div className="space-y-5">
          {/* Combo Meals section (only when the owner has published combos) */}
          {combos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-softOrange-500 stroke-[2]" />
                <h3 className="font-display font-bold text-sm text-brandText-primary dark:text-cream">
                  Combo Meals
                </h3>
                <span className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary">
                  Bundled meals at a lower price
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {combos.map(combo => (
                  <ComboCard key={combo.id} combo={combo} canteen={canteen} />
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-subtle'
                    : 'bg-white dark:bg-brandCard-dark text-brandText-secondary dark:text-brandText-darkSecondary border border-brandBorder-light dark:border-brandBorder-dark hover:border-sage'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          {filteredItems.length === 0 ? (
            <EmptyState
              title="No items in this category"
              description="Select another category or view all dishes available today."
              actionText="Show All Items"
              onAction={() => setSelectedCategory('All')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map(item => (
                <FoodCard
                  key={item.id}
                  item={item}
                  onSelect={(item) => setSelectedItemForModal(item)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-brandCard-dark p-5 rounded-3xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
            <div>
              <h3 className="font-bold text-base text-brandText-primary dark:text-brandText-darkPrimary">
                Student & Faculty Feedback
              </h3>
              <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
                Authentic feedback from verified campus orders
              </p>
            </div>
            <Link
              to="/student/reviews"
              className="px-4 py-2 rounded-2xl bg-primary text-white text-xs font-semibold hover:bg-primary-600 transition shadow-subtle"
            >
              Write Review
            </Link>
          </div>

          <div className="space-y-3">
            {reviews.map(rev => (
              <div
                key={rev.id}
                className="bg-white dark:bg-brandCard-dark p-4 sm:p-5 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.userAvatar}
                      alt={rev.userName}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-brandText-primary dark:text-brandText-darkPrimary">
                        {rev.userName}
                      </h4>
                      <p className="text-[11px] text-brandText-secondary">{rev.userRole}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-cream-100 dark:bg-brandBorder-dark text-brandText-primary dark:text-cream px-2 py-0.5 rounded-lg text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                    <span>{rev.rating}.0</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-brandText-primary dark:text-brandText-darkPrimary leading-relaxed">
                  "{rev.comment}"
                </p>

                {rev.verifiedOrder && (
                  <div className="flex items-center gap-1 text-[11px] text-forest dark:text-sage-300 font-semibold pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Verified Campus Order</span>
                  </div>
                )}

                {rev.canteenResponse && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-cream-100 dark:bg-brandBorder-dark/40 border-l-2 border-forest text-xs">
                    <p className="font-bold text-forest dark:text-cream">Canteen Response:</p>
                    <p className="text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">{rev.canteenResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: About */}
      {activeTab === 'about' && (
        <div className="bg-white dark:bg-brandCard-dark rounded-3xl p-6 border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle space-y-6">
          <div>
            <h3 className="font-bold text-base text-brandText-primary dark:text-cream mb-2">
              About {canteen.name}
            </h3>
            <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary leading-relaxed">
              {canteen.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-brandBorder-light dark:border-brandBorder-dark">
            <div className="p-4 rounded-2xl bg-cream-100/70 dark:bg-brandBorder-dark/30 border border-brandBorder-light dark:border-brandBorder-dark">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brandText-secondary">
                Operating Schedule
              </span>
              <p className="font-semibold text-sm text-brandText-primary dark:text-cream mt-1">
                {canteen.openingHours}
              </p>
              <p className="text-xs text-brandText-secondary mt-0.5">Monday to Saturday</p>
            </div>

            <div className="p-4 rounded-2xl bg-cream-100/70 dark:bg-brandBorder-dark/30 border border-brandBorder-light dark:border-brandBorder-dark">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brandText-secondary">
                Campus Location
              </span>
              <p className="font-semibold text-sm text-brandText-primary dark:text-cream mt-1">
                {canteen.location}
              </p>
              <p className="text-xs text-brandText-secondary mt-0.5">Central Academic Walkway</p>
            </div>

            <div className="p-4 rounded-2xl bg-cream-100/70 dark:bg-brandBorder-dark/30 border border-brandBorder-light dark:border-brandBorder-dark">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brandText-secondary">
                Canteen Manager
              </span>
              <p className="font-semibold text-sm text-brandText-primary dark:text-cream mt-1">
                {canteen.ownerName}
              </p>
              <p className="text-xs text-brandText-secondary mt-0.5">{canteen.contactNumber}</p>
            </div>

            <div className="p-4 rounded-2xl bg-cream-100/70 dark:bg-brandBorder-dark/30 border border-brandBorder-light dark:border-brandBorder-dark">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brandText-secondary">
                Payment Modes
              </span>
              <p className="font-semibold text-sm text-brandText-primary dark:text-cream mt-1">
                UPI, Cards & Counter Pay
              </p>
              <p className="text-xs text-brandText-secondary mt-0.5">Instant Digital Receipts</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Tray Bar */}
      {isCurrentCanteenInCart && (
        <div className="fixed bottom-16 md:bottom-6 left-4 right-4 max-w-lg mx-auto z-40 bg-primary text-white p-3.5 sm:p-4 rounded-2xl shadow-elevated flex items-center justify-between border border-forest-light animate-slideUp">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cream text-forest flex items-center justify-center font-extrabold text-sm shadow-subtle">
              {itemCount}
            </div>
            <div>
              <p className="text-xs font-semibold text-sage-200">Current Tray</p>
              <p className="text-sm font-bold text-cream">{formatCurrency(grandTotal)}</p>
            </div>
          </div>

          <Link
            to="/student/cart"
            className="px-4 py-2 rounded-xl bg-accent hover:bg-softOrange-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-subtle"
          >
            <span>View Tray</span>
            <ShoppingBag className="w-3.5 h-3.5 stroke-[2]" />
          </Link>
        </div>
      )}

      {/* Food Details Modal */}
      <FoodDetailModal
        item={selectedItemForModal}
        canteen={canteen}
        isOpen={!!selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
      />
    </div>
  );
}
