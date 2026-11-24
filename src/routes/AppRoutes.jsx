import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import AuthPage from '../pages/public/AuthPage';
import UniversitySelectPage from '../pages/public/UniversitySelectPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import HelpPage from '../pages/public/HelpPage';
import KioskPage from '../pages/kiosk/KioskPage';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import ExploreCanteensPage from '../pages/student/ExploreCanteensPage';
import CanteenDetailsPage from '../pages/student/CanteenDetailsPage';
import CartPage from '../pages/student/CartPage';
import CheckoutPage from '../pages/student/CheckoutPage';
import OrderConfirmationPage from '../pages/student/OrderConfirmationPage';
import MyOrdersPage from '../pages/student/MyOrdersPage';
import ReviewsPage from '../pages/student/ReviewsPage';
import ProfilePage from '../pages/student/ProfilePage';
import SettingsPage from '../pages/student/SettingsPage';
import FavouritesPage from '../pages/student/FavouritesPage';
import QueueStatusPage from '../pages/student/QueueStatusPage';
import PickupStatusPage from '../pages/student/PickupStatusPage';
import ExpressOrderPage from '../pages/student/ExpressOrderPage';
import ComboMealsPage from '../pages/student/ComboMealsPage';

// Canteen Owner Pages
import OwnerDashboard from '../pages/owner/OwnerDashboard';
import OwnerOrdersPage from '../pages/owner/OwnerOrdersPage';
import OwnerMenuPage from '../pages/owner/OwnerMenuPage';
import OwnerCategoriesPage from '../pages/owner/OwnerCategoriesPage';
import OwnerSlotsPage from '../pages/owner/OwnerSlotsPage';
import OwnerShelvesPage from '../pages/owner/OwnerShelvesPage';
import OwnerLiveQueuePage from '../pages/owner/OwnerLiveQueuePage';
import OwnerExpressPage from '../pages/owner/OwnerExpressPage';
import OwnerCombosPage from '../pages/owner/OwnerCombosPage';
import OwnerPaymentsPage from '../pages/owner/OwnerPaymentsPage';
import OwnerAnalyticsPage from '../pages/owner/OwnerAnalyticsPage';
import OwnerReviewsPage from '../pages/owner/OwnerReviewsPage';
import OwnerSettingsPage from '../pages/owner/OwnerSettingsPage';

// University Admin Pages
import UniversityAdminDashboard from '../pages/admin/UniversityAdminDashboard';
import UniversityCampusesPage from '../pages/admin/UniversityCampusesPage';
import UniversityCanteensPage from '../pages/admin/UniversityCanteensPage';

// Platform Admin Pages
import PlatformAdminDashboard from '../pages/admin/PlatformAdminDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Standalone Landing & Auth Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/select-university" element={<UniversitySelectPage />} />
      <Route path="/select-campus" element={<UniversitySelectPage />} />

      {/* Standalone full-screen Kiosk (public, guest-capable) */}
      <Route path="/kiosk" element={<KioskPage />} />

      {/* Main Authenticated Layout Routes */}
      <Route element={<AppLayout />}>
        {/* Student & Visitor Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student', 'staff', 'guest']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/canteens" element={<ExploreCanteensPage />} />
          <Route path="/student/canteen/:id" element={<CanteenDetailsPage />} />
          <Route path="/student/cart" element={<CartPage />} />
          <Route path="/student/checkout" element={<CheckoutPage />} />
          <Route path="/student/orders" element={<MyOrdersPage />} />
          <Route path="/student/orders/:id" element={<OrderConfirmationPage />} />
          <Route path="/student/queue" element={<QueueStatusPage />} />
          <Route path="/student/pickup" element={<PickupStatusPage />} />
          <Route path="/student/express" element={<ExpressOrderPage />} />
          <Route path="/student/combos" element={<ComboMealsPage />} />
          <Route path="/student/favourites" element={<FavouritesPage />} />
          <Route path="/student/reviews" element={<ReviewsPage />} />
          <Route path="/student/profile" element={<ProfilePage />} />
          <Route path="/student/settings" element={<SettingsPage />} />
        </Route>

        {/* Canteen Owner Portal Routes */}
        <Route element={<ProtectedRoute allowedRoles={['canteen_owner']} />}>
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/orders" element={<OwnerOrdersPage />} />
          <Route path="/owner/menu" element={<OwnerMenuPage />} />
          <Route path="/owner/categories" element={<OwnerCategoriesPage />} />
          <Route path="/owner/slots" element={<OwnerSlotsPage />} />
          <Route path="/owner/shelves" element={<OwnerShelvesPage />} />
          <Route path="/owner/queue" element={<OwnerLiveQueuePage />} />
          <Route path="/owner/express" element={<OwnerExpressPage />} />
          <Route path="/owner/combos" element={<OwnerCombosPage />} />
          <Route path="/owner/payments" element={<OwnerPaymentsPage />} />
          <Route path="/owner/analytics" element={<OwnerAnalyticsPage />} />
          <Route path="/owner/reviews" element={<OwnerReviewsPage />} />
          <Route path="/owner/settings" element={<OwnerSettingsPage />} />
        </Route>

        {/* University Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['university_admin']} />}>
          <Route path="/university-admin/dashboard" element={<UniversityAdminDashboard />} />
          <Route path="/university-admin/campuses" element={<UniversityCampusesPage />} />
          <Route path="/university-admin/canteens" element={<UniversityCanteensPage />} />
          <Route path="/university-admin/reports" element={<UniversityAdminDashboard />} />
          <Route path="/university-admin/settings" element={<UniversityAdminDashboard />} />
        </Route>

        {/* Platform Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['platform_admin']} />}>
          <Route path="/platform-admin/dashboard" element={<PlatformAdminDashboard />} />
          <Route path="/platform-admin/universities" element={<PlatformAdminDashboard />} />
          <Route path="/platform-admin/requests" element={<PlatformAdminDashboard />} />
          <Route path="/platform-admin/settings" element={<PlatformAdminDashboard />} />
        </Route>

        {/* Public Informational Subpages inside Layout */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
