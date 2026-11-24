import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Building,
  ShieldCheck,
  Check,
  GraduationCap,
  ChefHat,
  Landmark,
  Globe2
} from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import BrandLogo from '../common/BrandLogo';
import { useAuth } from '../../contexts/AuthContext';
import { useUniversity } from '../../contexts/UniversityContext';
import { useCart } from '../../contexts/CartContext';
import { useOrders } from '../../contexts/OrderContext';

const ROLE_OPTIONS = [
  { role: 'student', label: 'Student', icon: GraduationCap },
  { role: 'canteen_owner', label: 'Canteen Owner', icon: ChefHat },
  { role: 'university_admin', label: 'University Admin', icon: Landmark },
  { role: 'platform_admin', label: 'Platform Admin', icon: Globe2 }
];

export default function Navbar() {
  const { user, role, logout, login } = useAuth();
  const { selectedUniversity, selectedCampus } = useUniversity();
  const { itemCount } = useCart();
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead
  } = useOrders();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRoleSwitch = async (newRole) => {
    try {
      await login(newRole);
      setIsProfileOpen(false);
      if (newRole === 'canteen_owner') navigate('/owner/dashboard');
      else if (newRole === 'university_admin') navigate('/university-admin/dashboard');
      else if (newRole === 'platform_admin') navigate('/platform-admin/dashboard');
      else navigate('/student/dashboard');
    } catch (error) {
      window.alert(error.message);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/student/canteens?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const isStudentRole = ['student', 'staff', 'guest'].includes(role);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFF9F1] dark:bg-brandBg-dark border-b border-brandBorder-light dark:border-brandBorder-dark">
      <div className="w-full px-4 sm:px-6 xl:px-9 h-[68px] flex items-center justify-between gap-3 sm:gap-5">
        {/* Brand, shown in the header when the desktop sidebar is hidden */}
        <div className="flex flex-1 items-center gap-3 min-w-0">
          <Link to="/" className="flex md:hidden items-center gap-2.5 group shrink-0">
            <BrandLogo className="w-10 h-10 rounded-xl shadow-subtle" />
            <span className="hidden min-[380px]:block leading-tight">
      <span className="block font-display font-bold text-[12px] min-[430px]:text-[13px] leading-tight tracking-tight text-brandText-primary dark:text-cream">
        Where is my<br />Canteen
              </span>
            </span>
          </Link>

          {/* Search */}
          {isStudentRole && (
            <form onSubmit={handleSearch} className="relative hidden md:block w-full max-w-[520px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brandText-secondary" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search for food, drinks or essentials..."
                aria-label="Search menu"
                className="w-full h-10 rounded-full border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark pl-10 pr-4 text-xs text-brandText-primary dark:text-cream placeholder:text-brandText-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100"
              />
            </form>
          )}

          {/* Campus selector */}
          <Link
            to="/select-university"
            title="Switch campus"
            className="hidden xl:flex items-center gap-2 pl-2.5 pr-3 py-1.5 ml-auto rounded-xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark hover:border-primary-300 transition-colors text-2xs text-brandText-secondary dark:text-brandText-darkSecondary"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span className="font-semibold text-brandText-primary dark:text-brandText-darkPrimary truncate max-w-[120px]">
              {selectedUniversity?.shortName || selectedUniversity?.name}
            </span>
            <span className="text-brandBorder-light dark:text-brandBorder-dark">|</span>
            <span className="truncate max-w-[130px]">{selectedCampus?.name?.split(',')[0]}</span>
            <span className="font-bold text-primary">Switch</span>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle className="hidden sm:grid" />

          {isStudentRole && (
            <Link
              to="/student/cart"
              title="Your tray"
              className="relative w-9 h-9 grid place-items-center rounded-xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark text-brandText-primary dark:text-brandText-darkPrimary hover:border-primary-300 hover:text-primary transition-colors shadow-subtle"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold grid place-items-center ring-2 ring-[#FFF9F1] dark:ring-[#33302D]">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifyOpen((v) => !v);
                setIsProfileOpen(false);
              }}
              aria-label="Notifications"
              className="relative w-9 h-9 grid place-items-center rounded-xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark text-brandText-primary dark:text-brandText-darkPrimary hover:border-primary-300 transition-colors shadow-subtle"
            >
              <Bell className="w-4 h-4 stroke-[1.8]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold grid place-items-center ring-2 ring-[#FFF9F1] dark:ring-[#33302D]">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {isNotifyOpen && (
              <div className="absolute right-0 mt-2 w-[320px] sm:w-[360px] rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-elevated overflow-hidden z-50 animate-scaleIn origin-top-right">
                <div className="flex items-center justify-between px-4 py-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
                  <h4 className="font-display font-bold text-[13px] text-brandText-primary dark:text-cream">
                    Order updates
                  </h4>
                  {unreadNotificationsCount > 0 && (
                    <button onClick={markAllNotificationsRead} className="text-2xs font-semibold text-primary hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="divide-y divide-brandBorder-light dark:divide-brandBorder-dark max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-xs text-brandText-secondary dark:text-brandText-darkSecondary">
                      Order status updates will appear here.
                    </p>
                  ) : notifications.map(notification => (
                    <Link
                      key={notification.id}
                      to={`/student/orders/${encodeURIComponent(notification.orderId)}`}
                      onClick={() => {
                        markNotificationRead(notification.id);
                        setIsNotifyOpen(false);
                      }}
                      className="block px-4 py-3 hover:bg-cream-50 dark:hover:bg-brandBorder-dark/40 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        {notification.unread && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-brandText-primary dark:text-cream">
                              {notification.title}
                            </span>
                            <span className="text-2xs text-brandText-secondary whitespace-nowrap">
                              {new Date(notification.createdAt).toLocaleTimeString('en-IN', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-2xs text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5 leading-relaxed">
                            {notification.desc}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Account menu */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileOpen((v) => !v);
                setIsNotifyOpen(false);
              }}
              className="flex items-center gap-2 p-1 pr-1 sm:pr-2.5 rounded-xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark hover:border-primary-300 transition-colors shadow-subtle"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt={user?.name || 'User'}
                className="w-7 h-7 rounded-lg object-cover"
              />
              <span className="hidden lg:block text-left leading-tight">
                <span className="block text-2xs font-semibold text-brandText-primary dark:text-cream max-w-[100px] truncate">
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
                <span className="block text-2xs text-brandText-secondary capitalize">
                  {user?.userCategory || role?.replace('_', ' ')}
                </span>
              </span>
              <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-brandText-secondary transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-[290px] rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-elevated p-2.5 z-50 animate-scaleIn origin-top-right">
                <div className="px-2.5 py-2.5 border-b border-brandBorder-light dark:border-brandBorder-dark">
                  <p className="font-display font-bold text-[13px] text-brandText-primary dark:text-cream">{user?.name}</p>
                  <p className="text-2xs text-brandText-secondary truncate mt-0.5">{user?.email}</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-softOrange-100 dark:bg-brandBorder-dark text-brandText-primary dark:text-brandText-darkPrimary text-2xs font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    {user?.userCategory || role?.replace('_', ' ')}
                  </span>
                </div>

                <Link
                  to="/select-university"
                  onClick={() => setIsProfileOpen(false)}
                  className="mt-1 flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-brandText-secondary dark:text-brandText-darkSecondary hover:bg-cream-50 dark:hover:bg-brandBorder-dark/50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-primary" />
                    Change campus
                  </span>
                  <span className="text-2xs font-bold text-primary">
                    {selectedUniversity?.shortName || 'Select'}
                  </span>
                </Link>

                <div className="mt-1 pt-2 border-t border-brandBorder-light dark:border-brandBorder-dark">
                  <p className="px-2.5 pb-1.5 text-2xs font-bold uppercase tracking-wider text-brandText-secondary">
                    Demo role switcher
                  </p>
                  <div className="space-y-0.5">
                    {ROLE_OPTIONS.map(({ role: r, label, icon: Icon }) => {
                      const active = role === r;
                      return (
                        <button
                          key={r}
                          onClick={() => handleRoleSwitch(r)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                            active
                              ? 'bg-softOrange-100 dark:bg-brandBorder-dark text-brandText-primary dark:text-brandText-darkPrimary font-semibold'
                              : 'text-brandText-secondary dark:text-brandText-darkSecondary hover:bg-cream-50 dark:hover:bg-brandBorder-dark/40'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                          </span>
                          {active && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-1.5 pt-2 border-t border-brandBorder-light dark:border-brandBorder-dark">
                  <button
                    onClick={async () => {
                      try {
                        await logout();
                        setIsProfileOpen(false);
                        navigate('/login');
                      } catch (error) {
                        window.alert(error.message);
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isStudentRole && (
        <form onSubmit={handleSearch} className="md:hidden px-4 pb-3 relative">
          <Search className="absolute left-7 top-[13px] w-4 h-4 text-brandText-secondary" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search food, drinks or essentials..."
            aria-label="Search menu"
            className="w-full h-10 rounded-full border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark pl-10 pr-4 text-xs text-brandText-primary dark:text-cream placeholder:text-brandText-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100"
          />
        </form>
      )}
    </header>
  );
}
