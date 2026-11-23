import React from 'react';

function Shimmer({ className = '' }) {
  return (
    <div className={`relative overflow-hidden bg-cream-200 dark:bg-brandBorder-dark rounded-xl ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 dark:via-white/5 to-transparent" />
    </div>
  );
}

export default function LoadingSkeleton({ count = 3, type = 'card' }) {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((_, i) => (
          <div key={i} className="card p-4">
            <Shimmer className="h-44 rounded-2xl mb-4" />
            <Shimmer className="h-4 w-3/4 mb-2.5" />
            <Shimmer className="h-3 w-1/2 mb-4" />
            <div className="flex justify-between items-center pt-3 border-t border-brandBorder-light dark:border-brandBorder-dark">
              <Shimmer className="h-3 w-1/4" />
              <Shimmer className="h-8 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((_, i) => (
        <Shimmer key={i} className="h-20" />
      ))}
    </div>
  );
}
