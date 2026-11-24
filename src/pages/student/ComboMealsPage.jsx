import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight } from 'lucide-react';
import { useCombos } from '../../contexts/ComboContext';
import { useUniversity } from '../../contexts/UniversityContext';
import { canteenService } from '../../services/api';
import ComboCard from '../../components/canteen/ComboCard';
import EmptyState from '../../components/common/EmptyState';

/**
 * Dedicated student Combo Meals page.
 * Aggregates published combos across all canteens, grouped by canteen so the
 * combo can be added to the shared cart from one place.
 */
export default function ComboMealsPage() {
  const { combos, loadCombos } = useCombos();
  const { selectedCampus } = useUniversity();
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    canteenService.getCanteens({ campusId: selectedCampus?.id })
      .then(async result => {
        if (active) setCanteens(result);
        const outcomes = await Promise.allSettled(result.map(canteen => loadCombos(canteen.id)));
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
  }, [loadCombos, selectedCampus?.id]);

  const groups = canteens
    .map(canteen => ({
      canteen,
      combos: combos.filter(c => c.canteenId === canteen.id)
    }))
    .filter(group => group.combos.length > 0);

  if (loading) {
    return <p className="text-xs text-brandText-secondary">Loading combo meals...</p>;
  }
  if (loadError && groups.length === 0) {
    return <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">{loadError}</p>;
  }
  if (groups.length === 0) {
    return (
      <EmptyState
        title="No combo meals available"
        description="Canteen owners have not published any combo meals yet. Check back soon for value bundles."
        actionText="Explore Canteens"
        actionLink="/student/canteens"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="card rounded-3xl p-5 sm:p-6 border-l-4 border-l-softOrange-500">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-softOrange-100 dark:bg-softOrange-950/50 text-softOrange-600 dark:text-softOrange-300 grid place-items-center shrink-0">
            <Sparkles className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-brandText-primary dark:text-cream">
              Combo Meals
            </h1>
            <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary mt-1 max-w-2xl">
              Bundled meals at a lower price. A combo is available only while every
              included item is in stock.
            </p>
          </div>
        </div>
      </div>

      {loadError && <p className="text-xs text-rose-600">{loadError}</p>}

      {groups.map(({ canteen, combos: canteenCombos }) => (
        <section key={canteen.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-sm text-brandText-primary dark:text-cream">
              {canteen.name}
            </h2>
            <Link
              to={`/student/canteen/${canteen.id}`}
              className="inline-flex items-center gap-0.5 text-2xs font-semibold text-forest dark:text-sage-300 hover:underline"
            >
              View canteen <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {canteenCombos.map(combo => (
              <ComboCard key={combo.id} combo={combo} canteen={canteen} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
