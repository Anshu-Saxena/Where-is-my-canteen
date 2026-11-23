import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Coffee,
  Sandwich,
  Utensils,
  BookOpen,
  Package,
  CupSoda
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUniversity } from '../../contexts/UniversityContext';
import { useOrders } from '../../contexts/OrderContext';
import { canteenService } from '../../services/api';
import { MENU_ITEMS, CANTEENS } from '../../data/mockData';
import CanteenCard from '../../components/canteen/CanteenCard';
import FoodCard from '../../components/canteen/FoodCard';
import FoodDetailModal from '../../components/modal/FoodDetailModal';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { selectedCampus } = useUniversity();
  const { activeOrders } = useOrders();
  const navigate = useNavigate();

  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [modalCanteen, setModalCanteen] = useState(null);

  useEffect(() => {
    async function loadCanteens() {
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
    loadCanteens();
  }, [selectedCampus]);

  const openItemModal = (item) => {
    const parentCanteen = CANTEENS.find(c => c.id === item.canteenId) || CANTEENS[0];
    setModalCanteen(parentCanteen);
    setSelectedItemForModal(item);
  };

  const latestActiveOrder = activeOrders[0];
  const popularItems = [...MENU_ITEMS]
    .filter(item => item.available)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);
  const recommendedItems = MENU_ITEMS.filter(it => it.isRecommended).slice(0, 4);

  const categoryIcons = [
    { label: 'Breakfast', icon: Coffee, cat: 'Breakfast' },
    { label: 'Lunch', icon: Utensils, cat: 'Lunch' },
    { label: 'Snacks', icon: Sandwich, cat: 'Snacks' },
    { label: 'Beverages', icon: CupSoda, cat: 'Beverages' },
    { label: 'Stationery', icon: BookOpen, cat: 'Stationery' },
    { label: 'Essentials', icon: Package, cat: 'Daily Essentials' },
  ];

  return (
    <div className="space-y-7">
      {/* Welcome hero */}
      <section className="relative isolate overflow-hidden rounded-[18px] border border-softOrange-200 dark:border-brandBorder-dark bg-[#F8E9D7] dark:bg-brandCard-dark min-h-[250px] sm:min-h-[278px] flex items-center">
        <div className="absolute right-[-18px] top-[-50px] w-44 h-44 rounded-full border border-softOrange-200/80" />
        <div className="absolute right-24 bottom-[-92px] w-56 h-56 rounded-full border border-softOrange-200/80" />
        <div className="relative z-10 w-full grid grid-cols-1 min-[600px]:grid-cols-[0.95fr_1.05fr] items-center">
          <div className="px-5 py-7 sm:px-8 sm:py-9 md:py-10 max-w-[540px]">
            <p className="text-xs font-semibold text-brandText-secondary dark:text-brandText-darkSecondary">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
            </p>
            <h1 className="font-display text-[27px] sm:text-[34px] leading-[1.08] font-extrabold tracking-tight text-brandText-primary dark:text-cream mt-2">
              Good food.<br />Less waiting.
            </h1>
            <p className="text-xs sm:text-sm text-brandText-primary/80 dark:text-brandText-darkSecondary mt-3 leading-relaxed">
              Your campus favourites, ready when you are.
            </p>
            <Link
              to="/student/canteens"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-semibold transition-colors shadow-subtle"
            >
              Explore Menu
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="relative h-44 sm:h-52 min-[600px]:h-full min-[600px]:min-h-[250px] md:min-h-[278px] overflow-hidden">
            <img
              src="/api/ide/v1/text_to_image?prompt=Premium%20photorealistic%20cafe%20menu%20hero%20photography%2C%20juicy%20double%20cheeseburger%20with%20golden%20sesame%20bun%2C%20melted%20cheese%2C%20lettuce%20and%20tomato%20beside%20a%20clear%20cup%20of%20iced%20cola%20with%20ice%2C%20warm%20cream%20studio%20background%2C%20soft%20natural%20light%2C%20editorial%20food%20styling%2C%20no%20text%2C%20subject%20on%20right%20side&image_size=landscape_4_3"
              alt="A freshly made cheeseburger and iced drink"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = '/campusbite-hero.jpg';
              }}
              className="absolute inset-0 w-full h-full object-cover object-[58%_65%] min-[600px]:object-[58%_50%] mix-blend-multiply"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#F8E9D7] via-[#F8E9D7]/15 to-transparent min-[600px]:block hidden" />
            <span className="absolute bottom-4 right-5 rounded-full bg-white/90 text-brandText-primary text-2xs font-semibold px-3 py-1.5 shadow-subtle hidden sm:inline-flex">
              Made fresh on campus
            </span>
          </div>
        </div>
      </section>

      {/* Active order */}
      {latestActiveOrder && (
        <div className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-softOrange-100 text-primary grid place-items-center shrink-0">
              <Clock className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xs font-bold uppercase tracking-wider text-primary">Active order</span>
                <span className="px-2 py-0.5 rounded-lg bg-cream-100 text-brandText-primary font-mono font-bold text-2xs">
                  {latestActiveOrder.tokenNumber}
                </span>
              </div>
              <h3 className="font-display font-bold text-[15px] sm:text-base text-brandText-primary dark:text-cream">{latestActiveOrder.canteenName}</h3>
              <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
                Slot <strong className="text-brandText-primary dark:text-cream">{latestActiveOrder.pickupSlot}</strong> · {latestActiveOrder.items.length} items ·{' '}
                {formatCurrency(latestActiveOrder.totalAmount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <StatusBadge status={latestActiveOrder.status} />
            <Link
              to={`/student/orders/${latestActiveOrder.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-600 font-semibold text-xs transition-colors"
            >
              Track order
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
            </Link>
          </div>
        </div>
      )}

      {/* Categories */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-brandText-primary dark:text-cream">Explore Categories</h2>
            <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
              Food, drinks and daily essentials from campus counters
            </p>
          </div>
            <Link to="/student/canteens" className="shrink-0 text-xs font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
          {categoryIcons.map((c) => {
            const Icon = c.icon;
            const categoryImage = MENU_ITEMS.find(item => item.category === c.cat)?.image || MENU_ITEMS[0].image;
            return (
              <button
                key={c.label}
                onClick={() => navigate(`/student/canteens?category=${encodeURIComponent(c.cat)}`)}
                className="group card overflow-hidden flex flex-col text-left transition-all duration-200 hover:shadow-card-hover hover:border-primary-200"
              >
                <div className="relative aspect-[1.45] bg-cream-200 dark:bg-brandBorder-dark overflow-hidden">
                  <img src={categoryImage} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <span className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/90 text-primary grid place-items-center shadow-subtle">
                    <Icon className="w-4 h-4 stroke-[1.8]" />
                  </span>
                </div>
                <span className="text-xs font-semibold text-brandText-primary dark:text-brandText-darkPrimary px-2.5 py-2">
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Popular products */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-brandText-primary dark:text-cream">Popular Today</h2>
            <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">Campus favourites students come back for</p>
          </div>
          <Link to="/student/canteens" className="shrink-0 text-xs font-semibold text-primary hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {popularItems.map(item => (
            <FoodCard key={item.id} item={item} onSelect={() => openItemModal(item)} />
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-forest dark:text-sage-300 stroke-[2]" />
            <div>
              <h2 className="font-display text-base font-bold text-brandText-primary dark:text-cream">Recommended for you</h2>
              <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
                Picked from your favourite counters
              </p>
            </div>
          </div>
          <Link to="/student/canteens" className="shrink-0 text-xs font-semibold text-forest dark:text-sage-300 hover:underline">
            Explore menu
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recommendedItems.map(item => (
            <FoodCard key={item.id} item={item} onSelect={() => openItemModal(item)} />
          ))}
        </div>
      </section>

      {/* Popular canteens */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-brandText-primary dark:text-cream">Popular canteens</h2>
            <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">
              Verified counters in {selectedCampus?.name?.split(',')[0]}
            </p>
          </div>
          <Link to="/student/canteens" className="shrink-0 text-xs font-semibold text-forest dark:text-sage-300 hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map(i => (
              <div key={i} className="card overflow-hidden">
                <div className="h-40 bg-cream-200 dark:bg-brandBorder-dark animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-cream-200 dark:bg-brandBorder-dark rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-cream-200 dark:bg-brandBorder-dark rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : canteens.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-sage-100 dark:bg-forest/50 text-forest dark:text-sage-300 grid place-items-center mx-auto mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-brandText-primary dark:text-cream">No canteens listed yet</p>
            <p className="text-2xs text-brandText-secondary mt-1">Canteens for this campus will appear here once approved.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {canteens.slice(0, 3).map(canteen => (
              <CanteenCard key={canteen.id} canteen={canteen} />
            ))}
          </div>
        )}
      </section>

      {/* Product details modal */}
      <FoodDetailModal
        item={selectedItemForModal}
        canteen={modalCanteen}
        isOpen={!!selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
      />
    </div>
  );
}
