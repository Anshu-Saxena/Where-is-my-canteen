import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Plus, Clock, Store, ShoppingBag, Coffee, Info } from 'lucide-react';
import { useExpress } from '../../contexts/ExpressContext';
import { useMenu } from '../../contexts/MenuContext';
import { useCart } from '../../contexts/CartContext';
import { useUniversity } from '../../contexts/UniversityContext';
import { canteenService } from '../../services/api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatCurrency } from '../../utils/formatters';

/**
 * Dedicated Express Counter page.
 *
 * Express items (tea / coffee / snacks / pre-packed food) skip the regular
 * kitchen queue: shorter preparation time, a designated counter and an express
 * token. Orders still go through the shared cart + checkout and the same
 * ordering backend.
 */
export default function ExpressOrderPage() {
  const { getExpressConfig, isExpressItem, loadExpressConfig } = useExpress();
  const { getMenuItems, loadMenuItems } = useMenu();
  const { addToCart, itemCount, grandTotal, activeCanteen } = useCart();
  const { selectedCampus } = useUniversity();

  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const expressCanteens = canteens.filter(canteen => getExpressConfig(canteen.id)?.enabled);
  const [canteenId, setCanteenId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    canteenService.getCanteens({ campusId: selectedCampus?.id })
      .then(async result => {
        if (active) setCanteens(result);
        const requests = result.flatMap(canteen => [
          loadExpressConfig(canteen.id),
          loadMenuItems(canteen.id)
        ]);
        const outcomes = await Promise.allSettled(requests);
        const failure = outcomes.find(outcome => outcome.status === 'rejected');
        if (active && failure) setLoadError(failure.reason.message);
      })
      .catch(error => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadExpressConfig, loadMenuItems, selectedCampus?.id]);

  useEffect(() => {
    if (!canteenId && expressCanteens.length) setCanteenId(expressCanteens[0].id);
  }, [canteenId, expressCanteens]);

  const canteen = canteens.find(item => item.id === canteenId) || null;
  const config = canteen ? getExpressConfig(canteen.id) : null;
  const expressItems = canteen
    ? getMenuItems(canteen.id).filter(item => isExpressItem(canteen.id, item.id))
    : [];

  if (loading) {
    return <LoadingSkeleton count={4} />;
  }

  if (loadError) {
    return (
      <EmptyState
        title="Express counters could not be loaded"
        description={loadError}
        actionText="Explore Canteens"
        actionLink="/student/canteens"
      />
    );
  }

  if (expressCanteens.length === 0) {
    return (
      <EmptyState
        title="No express counters available"
        description="Canteen owners have not enabled an express counter right now. Please check back later."
        actionText="Explore Canteens"
        actionLink="/student/canteens"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card rounded-3xl p-5 sm:p-6 border-l-4 border-l-softOrange-500">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-softOrange-100 dark:bg-softOrange-950/50 text-softOrange-600 dark:text-softOrange-300 grid place-items-center shrink-0">
            <Zap className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-brandText-primary dark:text-cream">
              Express Counter
            </h1>
            <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-1 max-w-2xl">
              Grab tea, coffee, snacks and pre-packed food without waiting in the main queue.
              Express orders are prepared separately and issued a fast-track express token.
            </p>
          </div>
        </div>
      </div>

      {/* Canteen selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {expressCanteens.map(c => (
          <button
            key={c.id}
            onClick={() => setCanteenId(c.id)}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition ${
              canteenId === c.id
                ? 'bg-primary text-white shadow-subtle'
                : 'bg-white dark:bg-brandCard-dark text-brandText-secondary dark:text-brandText-darkSecondary border border-brandBorder-light dark:border-brandBorder-dark hover:border-sage'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Counter meta */}
      {config && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card rounded-2xl p-4 flex items-center gap-3">
            <Store className="w-5 h-5 text-forest dark:text-sage-300 stroke-[2]" />
            <div>
              <p className="text-2xs uppercase font-bold tracking-wider text-brandText-secondary">Counter</p>
              <p className="text-sm font-semibold text-brandText-primary dark:text-cream">{config.counterName}</p>
            </div>
          </div>
          <div className="card rounded-2xl p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-forest dark:text-sage-300 stroke-[2]" />
            <div>
              <p className="text-2xs uppercase font-bold tracking-wider text-brandText-secondary">Prep time</p>
              <p className="text-sm font-semibold text-brandText-primary dark:text-cream">
                ~{config.prepTimeMinutes} mins
              </p>
            </div>
          </div>
          <div className="card rounded-2xl p-4 flex items-center gap-3">
            <Coffee className="w-5 h-5 text-forest dark:text-sage-300 stroke-[2]" />
            <div>
              <p className="text-2xs uppercase font-bold tracking-wider text-brandText-secondary">Eligible items</p>
              <p className="text-sm font-semibold text-brandText-primary dark:text-cream">{expressItems.length} items</p>
            </div>
          </div>
        </div>
      )}

      {/* Express item grid */}
      {expressItems.length === 0 ? (
        <EmptyState
          title="No express items yet"
          description="This canteen has not assigned any express items. Try another canteen."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {expressItems.map(item => (
            <div key={item.id} className="card p-4 flex gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-brandBorder-light dark:border-brandBorder-dark"
                loading="lazy"
              />
              <div className="flex-1 min-w-0 flex flex-col">
                <h4 className="font-display text-sm font-bold text-brandText-primary dark:text-cream line-clamp-1">
                  {item.name}
                </h4>
                <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary line-clamp-2 mt-0.5">
                  {item.description}
                </p>
                <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-brandText-primary dark:text-cream">
                    {formatCurrency(item.price)}
                  </span>
                  <button
                    type="button"
                    disabled={!item.available}
                    onClick={() => addToCart(item, canteen, '', 0, 1)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      item.available
                        ? 'bg-sage-100 dark:bg-forest/50 text-forest dark:text-cream hover:bg-forest hover:text-cream shadow-subtle'
                        : 'bg-cream-200 dark:bg-brandBorder-dark/40 text-brandText-secondary cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.4]" />
                    {item.available ? 'Quick add' : 'Sold out'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start gap-2 text-2xs text-brandText-secondary dark:text-brandText-darkSecondary">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>
          Add express items to your tray, then check out as usual. If your entire tray is
          express-eligible you'll receive a fast-track express token for the designated counter.
        </span>
      </div>

      {/* Floating tray bar */}
      {itemCount > 0 && activeCanteen?.id === canteenId && (
        <div className="fixed bottom-16 md:bottom-6 left-4 right-4 max-w-lg mx-auto z-40 bg-primary text-white p-3.5 sm:p-4 rounded-2xl shadow-elevated flex items-center justify-between border border-forest-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cream text-forest flex items-center justify-center font-extrabold text-sm shadow-subtle">
              {itemCount}
            </div>
            <div>
              <p className="text-xs font-semibold text-sage-200">Express tray</p>
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
    </div>
  );
}
