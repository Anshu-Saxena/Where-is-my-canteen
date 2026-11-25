import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, ShoppingBag, Heart, User } from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';

export default function BottomNavigation() {
  const { activeOrders } = useOrders();
  const location = useLocation();

  const links = [
    { to: '/student/dashboard', icon: Home, label: 'Home' },
    { to: '/student/canteens', icon: Compass, label: 'Explore' },
    { to: '/student/orders', icon: ShoppingBag, label: 'Orders', badge: activeOrders.length || null },
    { to: '/student/favourites', icon: Heart, label: 'Saved' },
    { to: '/student/profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FFF9F1] dark:bg-brandBg-dark border-t border-brandBorder-light dark:border-brandBorder-dark pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around px-1.5 py-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => {
                const active = isActive ||
                  (link.to === '/student/canteens' && location.pathname.startsWith('/student/canteen/'));
                return `relative flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl transition-colors text-2xs ${
                  active
                    ? 'text-primary dark:text-softOrange-200 font-bold'
                    : 'text-brandText-secondary dark:text-brandText-darkSecondary font-medium'
                }`;
              }}
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon className={`w-[22px] h-[22px] ${
                      isActive || (link.to === '/student/canteens' && location.pathname.startsWith('/student/canteen/'))
                        ? 'stroke-[2.1]'
                        : 'stroke-[1.7]'
                    }`} />
                    {link.badge ? (
                      <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[9px] font-bold grid place-items-center">
                        {link.badge}
                      </span>
                    ) : null}
                  </span>
                  <span>{link.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
