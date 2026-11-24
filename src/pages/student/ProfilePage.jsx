import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building,
  ShoppingBag,
  LogOut,
  Save,
  Check,
  ChevronRight,
  Clock,
  Pencil
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUniversity } from '../../contexts/UniversityContext';
import { useOrders } from '../../contexts/OrderContext';
import OrderCard from '../../components/order/OrderCard';

export default function ProfilePage() {
  const { user, setUser, logout, role } = useAuth();
  const { selectedUniversity, selectedCampus } = useUniversity();
  const { orders, completedOrders } = useOrders();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preference, setPreference] = useState(user?.foodPreference || 'Vegetarian');
  const [category, setCategory] = useState(user?.userCategory || 'Student');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUser({
      ...user,
      name,
      phone,
      foodPreference: preference,
      userCategory: category
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const userOrderHistory = orders.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-brandText-primary dark:text-cream">
          Profile
        </h1>
        <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
          Manage your campus credentials, food preferences and order history
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-2xl bg-sage-100 dark:bg-forest/50 text-forest dark:text-cream border border-sage-300 dark:border-forest text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 stroke-[2]" />
          <span>Profile updated successfully</span>
        </div>
      )}

      {/* Profile Summary Card */}
      <div className="card rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
          alt={user?.name}
          className="w-20 h-20 rounded-2xl object-cover ring-2 ring-sage-200 dark:ring-forest flex-shrink-0"
        />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-brandText-primary dark:text-cream">
              {user?.name}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-sage-100 dark:bg-forest/60 text-forest dark:text-cream text-2xs font-bold uppercase tracking-wide">
              {user?.userCategory || role}
            </span>
          </div>

          <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary">
            {user?.department || 'Campus Member'} · ID{' '}
            <strong className="text-brandText-primary dark:text-cream font-semibold">{user?.rollNumber || '—'}</strong>
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-xs text-brandText-secondary dark:text-brandText-darkSecondary">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-forest dark:text-sage-300 stroke-[2]" />
              <span>{selectedUniversity?.shortName || 'Campus'} · {selectedCampus?.name?.split(',')[0]}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-forest dark:text-sage-300 stroke-[2]" />
              <span>{completedOrders.length} completed orders</span>
            </span>
          </div>
        </div>
      </div>

      {/* Editable Details */}
      <form onSubmit={handleSaveProfile} className="card rounded-3xl p-5 sm:p-6 space-y-5">
        <h3 className="font-semibold text-sm text-brandText-primary dark:text-cream pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
          Personal information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1.5 text-brandText-primary dark:text-brandText-darkPrimary">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1.5 text-brandText-primary dark:text-brandText-darkPrimary">
              Email address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="field bg-cream-100 dark:bg-brandBorder-dark/20 text-brandText-secondary cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1.5 text-brandText-primary dark:text-brandText-darkPrimary">
              Mobile number (for pickup SMS)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="field"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1.5 text-brandText-primary dark:text-brandText-darkPrimary">
              User category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="field"
            >
              <option value="Student">Student</option>
              <option value="Faculty / Professor">Faculty / Professor</option>
              <option value="Campus Staff">Campus Staff</option>
              <option value="Parent">Parent / Guardian Visitor</option>
              <option value="Guest">Guest Campus Visitor</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1.5 text-brandText-primary dark:text-brandText-darkPrimary">
              Dietary preference
            </label>
            <select
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
              className="field"
            >
              <option value="Vegetarian">Strictly Vegetarian (Veg only)</option>
              <option value="Eggetarian">Eggetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
              <option value="Jain">Jain (No onion / garlic)</option>
              <option value="Vegan">Vegan</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-brandBorder-light dark:border-brandBorder-dark flex flex-wrap justify-between items-center gap-3">
          <Link
            to="/select-university"
            className="text-xs font-semibold text-forest dark:text-sage-300 hover:underline flex items-center gap-1"
          >
            <Building className="w-3.5 h-3.5 stroke-[2]" />
            <span>Change university / campus</span>
          </Link>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-600 text-cream text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-subtle"
          >
            <Save className="w-3.5 h-3.5 stroke-[2]" />
            <span>Save changes</span>
          </button>
        </div>
      </form>

      {/* Recent Order History */}
      <div className="card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest dark:text-sage-300 stroke-[2]" />
            <h3 className="font-semibold text-sm text-brandText-primary dark:text-cream">
              Recent orders
            </h3>
          </div>
          <Link
            to="/student/orders"
            className="text-xs font-semibold text-forest dark:text-sage-300 hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {userOrderHistory.length === 0 ? (
            <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary py-2">
              No orders yet — your order history will appear here.
            </p>
          ) : (
            userOrderHistory.map(ord => (
              <OrderCard key={ord.id} order={ord} />
            ))
          )}
        </div>
      </div>

      {/* Account actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/student/settings"
          className="flex-1 py-3 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark text-brandText-primary dark:text-cream text-center font-semibold text-xs hover:bg-cream-100 dark:hover:bg-brandBorder-dark/40 transition-colors shadow-subtle inline-flex items-center justify-center gap-2"
        >
          <Pencil className="w-3.5 h-3.5 stroke-[2]" />
          <span>Notification &amp; alert settings</span>
        </Link>
        <button
          onClick={async () => {
            try {
              await logout();
              navigate('/login');
            } catch (error) {
              window.alert(error.message);
            }
          }}
          className="flex-1 py-3 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 font-semibold text-xs hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4 stroke-[2]" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
