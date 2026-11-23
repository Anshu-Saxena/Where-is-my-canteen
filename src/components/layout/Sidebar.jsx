import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  ShoppingBag,
  Heart,
  Star,
  User,
  Settings,
  LayoutDashboard,
  ClipboardList,
  Utensils,
  Clock,
  TrendingUp,
  Building2,
  FileCheck2,
  Globe2,
  Layers,
  BadgeCheck,
  ReceiptText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUniversity } from '../../contexts/UniversityContext';
import { useOrders } from '../../contexts/OrderContext';
import { useCart } from '../../contexts/CartContext';
import BrandLogo from '../common/BrandLogo';

export default function Sidebar() {
  const { role } = useAuth();
  const { selectedUniversity, selectedCampus } = useUniversity();
  const { activeOrders } = useOrders();
  const { itemCount } = useCart();
  const location = useLocation();

  const studentLinks = [
    { to: '/student/dashboard', icon: Home, label: 'Home' },
    { to: '/student/canteens', icon: Compass, label: 'Explore Menu' },
    { to: '/student/orders', icon: ShoppingBag, label: 'My Orders', badge: activeOrders.length || null, exact: true },
    { to: '/student/orders?tab=history', icon: ReceiptText, label: 'Order History', history: true },
    { to: '/student/profile', icon: User, label: 'Profile' },
    { to: '/student/cart', icon: ShoppingBag, label: 'Cart', badge: itemCount || null },
    { to: '/student/favourites', icon: Heart, label: 'Favourites', secondary: true },
    { to: '/student/reviews', icon: Star, label: 'Reviews', secondary: true },
    { to: '/student/settings', icon: Settings, label: 'Settings', secondary: true }
  ];

  const ownerLinks = [
    { to: '/owner/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/owner/orders', icon: ClipboardList, label: 'Kitchen Orders', badge: activeOrders.length || 3 },
    { to: '/owner/menu', icon: Utensils, label: 'Food Menu' },
    { to: '/owner/categories', icon: Layers, label: 'Categories' },
    { to: '/owner/slots', icon: Clock, label: 'Pickup Slots' },
    { to: '/owner/reviews', icon: Star, label: 'Reviews' },
    { to: '/owner/analytics', icon: TrendingUp, label: 'Sales Analytics' },
    { to: '/owner/settings', icon: Settings, label: 'Settings' }
  ];

  const uniAdminLinks = [
    { to: '/university-admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/university-admin/campuses', icon: Building2, label: 'Campuses' },
    { to: '/university-admin/canteens', icon: Utensils, label: 'Canteens & Approvals' },
    { to: '/university-admin/reports', icon: ClipboardList, label: 'Student Complaints' },
    { to: '/university-admin/settings', icon: Settings, label: 'Settings' }
  ];

  const platformAdminLinks = [
    { to: '/platform-admin/dashboard', icon: Globe2, label: 'Platform Overview' },
    { to: '/platform-admin/universities', icon: Building2, label: 'Registered Universities' },
    { to: '/platform-admin/requests', icon: FileCheck2, label: 'Verification Requests', badge: 2 },
    { to: '/platform-admin/settings', icon: Settings, label: 'System Health' }
  ];

  let currentNavLinks = studentLinks;
  let portalTitle = 'Student Portal';

  if (role === 'canteen_owner') {
    currentNavLinks = ownerLinks;
    portalTitle = 'Canteen Manager';
  } else if (role === 'university_admin') {
    currentNavLinks = uniAdminLinks;
    portalTitle = 'University Admin';
  } else if (role === 'platform_admin') {
    currentNavLinks = platformAdminLinks;
    portalTitle = 'Platform Admin';
  }

  const homePath = role === 'canteen_owner'
    ? '/owner/dashboard'
    : role === 'university_admin'
    ? '/university-admin/dashboard'
    : role === 'platform_admin'
    ? '/platform-admin/dashboard'
    : role
    ? '/student/dashboard'
    : '/';
  const isHistory = location.pathname === '/student/orders' && new URLSearchParams(location.search).get('tab') === 'history';

  return (
    <aside className="hidden md:flex sticky top-0 h-screen w-[228px] lg:w-[248px] shrink-0 flex-col justify-between border-r border-brandBorder-light dark:border-brandBorder-dark bg-[#FFF9F1] dark:bg-brandBg-dark px-3.5 lg:px-4 py-5">
      <div>
        <Link to={homePath} className="flex items-center gap-2.5 px-2 pb-5 mb-4 border-b border-brandBorder-light dark:border-brandBorder-dark">
          <BrandLogo className="w-10 h-10 rounded-xl shadow-subtle shrink-0" />
          <span className="font-display font-bold text-[13px] leading-tight tracking-tight text-brandText-primary dark:text-cream">
            Where is my<br />Canteen
          </span>
        </Link>

        <div className="flex items-center gap-2 px-2 mb-2">
          <BadgeCheck className="w-3.5 h-3.5 text-primary" />
          <span className="text-2xs font-bold uppercase tracking-wider text-brandText-secondary dark:text-brandText-darkSecondary">
            {portalTitle}
          </span>
        </div>

        <nav className="space-y-1">
          {currentNavLinks.map((link) => {
            const Icon = link.icon;
            const active = link.history
              ? isHistory
              : link.to.startsWith('/student/orders')
              ? location.pathname === '/student/orders' && !isHistory
              : location.pathname === link.to || (!link.exact && location.pathname.startsWith(`${link.to}/`));
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-[13px] transition-colors duration-150 ${
                  active
                    ? 'bg-primary text-white font-semibold shadow-subtle'
                    : 'text-brandText-primary dark:text-brandText-darkPrimary hover:bg-cream-200/70 dark:hover:bg-brandBorder-dark/40 font-medium'
                } ${link.secondary ? 'mt-1 text-xs' : ''}`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0 stroke-[1.8]" />
                  <span className="truncate">{link.label}</span>
                </span>
                {link.badge ? (
                  <span className={`shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-2xs font-bold grid place-items-center ${active ? 'bg-white text-primary' : 'bg-softOrange-200 text-brandText-primary'}`}>
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 mt-4 border-t border-brandBorder-light dark:border-brandBorder-dark">
        <div className="px-3 py-3 rounded-xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark">
          <p className="text-2xs font-bold uppercase tracking-wider text-brandText-secondary">Current campus</p>
          <p className="text-xs font-semibold text-brandText-primary dark:text-cream truncate mt-1">
            {selectedUniversity?.shortName || selectedUniversity?.name}
          </p>
          <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary truncate mt-0.5">
            {selectedCampus?.name}
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 text-2xs font-semibold text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Verified &amp; active
          </div>
        </div>
      </div>
    </aside>
  );
}
