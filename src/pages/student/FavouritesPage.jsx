import React from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CANTEENS } from '../../data/mockData';
import CanteenCard from '../../components/canteen/CanteenCard';
import EmptyState from '../../components/common/EmptyState';

export default function FavouritesPage() {
  const { favourites } = useAuth();

  const favCanteens = CANTEENS.filter(c => favourites.includes(c.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brandText-primary dark:text-cream">
          Saved Canteens & Cafes
        </h1>
        <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
          Quick access to your preferred campus dining and essential spots
        </p>
      </div>

      {favCanteens.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favourite canteens yet"
          description="Click the heart icon on any canteen card to pin your favorite campus food joints here."
          actionText="Explore Campus Canteens"
          actionLink="/student/canteens"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favCanteens.map(canteen => (
            <CanteenCard key={canteen.id} canteen={canteen} />
          ))}
        </div>
      )}
    </div>
  );
}
