import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Building,
  ShieldCheck,
  User as UserIcon,
  X,
  Plus,
  Store,
  Loader2,
  Eye
} from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import BrandLogo from '../common/BrandLogo';
import FoodDetailModal from '../modal/FoodDetailModal';
import { useAuth } from '../../contexts/AuthContext';
import { useUniversity } from '../../contexts/UniversityContext';
import { useCart } from '../../contexts/CartContext';
import { useOrders } from '../../contexts/OrderContext';
import { canteenService } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const ROLE_LABELS = {
  student: 'Student',
  staff: 'Staff / Faculty',
  guest: 'Guest Visitor',
  canteen_owner: 'Canteen Owner',
  university_admin: 'University Admin',
  platform_admin: 'Platform Admin'
};

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const { selectedUniversity, selectedCampus, selectedCanteen, selectCanteen } = useUniversity();
  const { itemCount, activeCanteen, addToCart } = useCart();
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead
  } = useOrders();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);

  // Smart canteen-specific search state
  const [campusCanteens, setCampusCanteens] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [addedItemId, setAddedItemId] = useState('');
  const searchContainerRef = useRef(null);

  const isStudentRole = ['student', 'staff', 'guest'].includes(role);

  // Load canteens for the current campus so search always knows the valid campus canteens
  useEffect(() => {
    if (!isStudentRole || !selectedCampus?.id) {
      setCampusCanteens([]);
      return undefined;
    }
    let active = true;
    canteenService
      .getCanteens({ campusId: selectedCampus.id })
      .then(list => {
        if (!active) return;
        setCampusCanteens(list);
        if (selectedCanteen && !list.some(c => c.id === selectedCanteen.id)) {
          selectCanteen(list[0] || null);
        } else if (!selectedCanteen && list.length > 0) {
          const fromCart = activeCanteen && list.find(c => c.id === activeCanteen.id);
          selectCanteen(fromCart || list[0]);
        }
      })
      .catch(() => {
        if (active) setCampusCanteens([]);
      });
    return () => {
      active = false;
    };
  }, [isStudentRole, selectedCampus?.id]);

  const effectiveCanteen = useMemo(() => {
    if (selectedCanteen && campusCanteens.some(c => c.id === selectedCanteen.id)) {
      return selectedCanteen;
    }
    if (activeCanteen && campusCanteens.some(c => c.id === activeCanteen.id)) {
      return campusCanteenOrDefault(campusCanteens, activeCanteen.id);
    }
    return campusCanteens[0] || null;
  }, [selectedCanteen, activeCanteen, campusCanteens]);

  // Debounced canteen-specific product search
  useEffect(() => {
    if (!isStudentRole) return undefined;
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchError('');
      setIsSearching(false);
      return undefined;
    }
    if (!effectiveCanteen) {
      setSearchResults([]);
      setIsSearching(false);
      return undefined;
    }

    let active = true;
    setIsSearching(true);
    setSearchError('');
    const timer = setTimeout(async () => {
      try {
        const items = await canteenService.searchCanteenMenu(effectiveCanteen.id, trimmed, {
          availableOnly
        });
        if (!active) return;
        const unique = Array.from(new Map(items.map(i => [i.id, i])).values());
        setSearchResults(unique);
      } catch (err) {
        if (active) setSearchError(err.message || 'Search failed.');
      } finally {
        if (active) setIsSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isStudentRole, searchQuery, effectiveCanteen?.id, availableOnly]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchOpen(false);
    if (effectiveCanteen) {
      navigate(`/student/canteen/${effectiveCanteen.id}?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/student/canteens?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleQuickAdd = (item) => {
    if (!effectiveCanteen || !item.available) return;
    const added = addToCart(item, effectiveCanteen, '', 0, 1);
    if (added) {
      setAddedItemId(item.id);
      setTimeout(() => setAddedItemId(''), 1200);
    }
  };

  const profileRoute =
    role === 'canteen_owner'
      ? '/owner/settings'
      : role === 'university_admin'
      ? '/university-admin/settings'
      : role === 'platform_admin'
      ? '/platform-admin/settings'
      : '/student/profile';

  const roleLabel = user?.userCategory || ROLE_LABELS[role] || 'User';

  const renderSearchDropdown = () => {
    if (!isSearchOpen || !searchQuery.trim()) return null;

    return (
      <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-elevated z-50 overflow-hidden">
        {/* Dropdown header */}
        <div className="px-3.5 py-2.5 bg-cream-50 dark:bg-brandBorder-dark/30 border-b border-brandBorder-light dark:border-brandBorder-dark flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="font-semibold text-brandText-secondary flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-primary" />
            Searching in:{' '}
            <strong className="text-brandText-primary dark:text-cream">
              {effectiveCanteen ? effectiveCanteen.name : 'No canteen selected'}
            </strong>
          </span>
          <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-brandText-secondary">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="accent-primary w-3.5 h-3.5"
            />
            Available only
          </label>
        </div>

        {/* Results body */}
        <div className="max-h-[340px] overflow-y-auto divide-y divide-brandBorder-light dark:divide-brandBorder-dark">
          {!effectiveCanteen ? (
            <div className="px-4 py-6 text-center text-xs text-brandText-secondary">
              No canteens are registered for this campus yet.
            </div>
          ) : isSearching ? (
            <div className="px-4 py-6 flex items-center justify-center gap-2 text-xs text-brandText-secondary">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Searching {effectiveCanteen.name} menu...</span>
            </div>
          ) : searchError ? (
            <div className="px-4 py-5 text-center text-xs text-rose-600">{searchError}</div>
          ) : searchResults.length === 0 ? (
            <div className="px-4 py-6 text-center space-y-1">
              <p className="text-xs font-semibold text-brandText-primary dark:text-cream">
                No matching products in {effectiveCanteen.name}
              </p>
              <p className="text-[11px] text-brandText-secondary">
                Try a different dish name or switch canteen above.
              </p>
            </div>
          ) : (
            searchResults.map(item => (
              <div
                key={item.id}
                className="px-3.5 py-2.5 flex items-center gap-3 hover:bg-cream-50 dark:hover:bg-brandBorder-dark/30 transition-colors"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-11 h-11 rounded-xl object-cover bg-cream-200 dark:bg-brandBorder-dark shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        item.isVeg ? 'bg-sage-700' : 'bg-rose-600'
                      }`}
                      title={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
                    />
                    <p className="text-xs font-bold text-brandText-primary dark:text-cream truncate">
                      {item.name}
                    </p>
                  </div>
                  <p className="text-[11px] text-brandText-secondary truncate">
                    {item.category} · {effectiveCanteen.name} ·{' '}
                    <span className={item.available ? 'text-forest font-semibold' : 'text-rose-600 font-semibold'}>
                      {item.available ? 'Available' : 'Sold out'}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-bold text-brandText-primary dark:text-cream mr-1">
                    {formatCurrency(item.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setDetailItem(item);
                      setIsSearchOpen(false);
                    }}
                    title="View Details"
                    className="p-1.5 rounded-lg border border-brandBorder-light dark:border-brandBorder-dark text-brandText-secondary hover:text-primary hover:border-primary-300 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={!item.available}
                    onClick={() => handleQuickAdd(item)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                      !item.available
                        ? 'bg-cream-200 text-brandText-secondary cursor-not-allowed'
                        : addedItemId === item.id
                        ? 'bg-forest text-white'
                        : 'bg-primary text-white hover:bg-primary-600'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>{addedItemId === item.id ? 'Added' : 'Add'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FFF9F1] dark:bg-brandBg-dark border-b border-brandBorder-light dark:border-brandBorder-dark">
        <div className="w-full px-4 sm:px-6 xl:px-9 h-[68px] flex items-center justify-between gap-3 sm:gap-5">
          {/* Brand + Search */}
          <div className="flex flex-1 items-center gap-3 min-w-0">
            <Link to="/" className="flex md:hidden items-center gap-2.5 group shrink-0">
              <BrandLogo className="w-10 h-10 rounded-xl shadow-subtle" />
              <span className="hidden min-[380px]:block leading-tight">
                <span className="block font-display font-bold text-[12px] min-[430px]:text-[13px] leading-tight tracking-tight text-brandText-primary dark:text-cream">
                  Where is my<br />Canteen
                </span>
              </span>
            </Link>

            {/* Canteen-specific Smart Search (Desktop) */}
            {isStudentRole && (
              <div ref={searchContainerRef} className="relative hidden md:flex items-center gap-2 w-full max-w-[600px]">
                {campusCanteens.length > 0 && (
                  <select
                    value={effectiveCanteen?.id || ''}
                    onChange={(e) => {
                      const chosen = campusCanteens.find(c => c.id === e.target.value) || null;
                      selectCanteen(chosen);
                      setSearchResults([]);
                    }}
                    aria-label="Select canteen to search"
                    className="h-10 max-w-[180px] rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark px-2.5 text-xs font-semibold text-brandText-primary dark:text-cream truncate focus:outline-none focus:border-primary"
                  >
                    {campusCanteens.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}

                <form onSubmit={handleSearchSubmit} className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brandText-secondary pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsSearchOpen(true)}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setIsSearchOpen(true);
                    }}
                    placeholder={
                      effectiveCanteen
                        ? `Search in ${effectiveCanteen.name}...`
                        : 'Select a canteen to search products...'
                    }
                    aria-label="Search selected canteen menu"
                    className="w-full h-10 rounded-full border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark pl-10 pr-9 text-xs text-brandText-primary dark:text-cream placeholder:text-brandText-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        setIsSearchOpen(false);
                      }}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brandText-secondary hover:text-brandText-primary"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {renderSearchDropdown()}
                </form>
              </div>
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

            {/* Account menu (NO Demo Role Switcher) */}
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
                    {roleLabel}
                  </span>
                </span>
                <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-brandText-secondary transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-[280px] rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-elevated p-2.5 z-50 animate-scaleIn origin-top-right">
                  <div className="px-2.5 py-2.5 border-b border-brandBorder-light dark:border-brandBorder-dark flex items-center gap-3">
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={user?.name || 'User'}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-display font-bold text-[13px] text-brandText-primary dark:text-cream truncate">
                        {user?.name}
                      </p>
                      <p className="text-2xs text-brandText-secondary truncate mt-0.5">{user?.email}</p>
                      <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-softOrange-100 dark:bg-brandBorder-dark text-brandText-primary dark:text-brandText-darkPrimary text-[11px] font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        {roleLabel}
                      </span>
                    </div>
                  </div>

                  {isStudentRole && (
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
                  )}

                  <Link
                    to={profileRoute}
                    onClick={() => setIsProfileOpen(false)}
                    className="mt-0.5 flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-brandText-secondary dark:text-brandText-darkSecondary hover:bg-cream-50 dark:hover:bg-brandBorder-dark/50 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-primary" />
                    <span>Profile &amp; Settings</span>
                  </Link>

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

        {/* Mobile Search Bar */}
        {isStudentRole && (
          <div className="md:hidden px-4 pb-3 space-y-2 relative">
            {campusCanteens.length > 0 && (
              <select
                value={effectiveCanteen?.id || ''}
                onChange={(e) => {
                  const chosen = campusCanteens.find(c => c.id === e.target.value) || null;
                  selectCanteen(chosen);
                  setSearchResults([]);
                }}
                aria-label="Select canteen to search"
                className="w-full h-9 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark px-3 text-xs font-semibold text-brandText-primary dark:text-cream"
              >
                {campusCanteens.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-brandText-secondary pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setIsSearchOpen(true);
                }}
                placeholder={
                  effectiveCanteen
                    ? `Search in ${effectiveCanteen.name}...`
                    : 'Select a canteen to search...'
                }
                aria-label="Search menu"
                className="w-full h-10 rounded-full border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark pl-10 pr-9 text-xs text-brandText-primary dark:text-cream placeholder:text-brandText-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsSearchOpen(false);
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-3 text-brandText-secondary"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {renderSearchDropdown()}
            </form>
          </div>
        )}
      </header>

      <FoodDetailModal
        item={detailItem}
        canteen={effectiveCanteen}
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
      />
    </>
  );
}

function campusCanteenOrDefault(canteens, id) {
  return canteens.find(c => c.id === id) || canteens[0] || null;
}
