import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Building,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';
import BrandLogo from '../../components/common/BrandLogo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brandBg-light dark:bg-brandBg-dark text-brandText-primary dark:text-brandText-darkPrimary flex flex-col transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#FFF9F1]/95 dark:bg-brandBg-dark/95 border-b border-brandBorder-light dark:border-brandBorder-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandLogo className="w-10 h-10 rounded-xl shadow-subtle" />
            <div className="font-bold text-[13px] leading-tight text-brandText-primary dark:text-cream">
              <span className="block">Where is my</span>
              <span className="block">Canteen</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-2xl text-brandText-primary dark:text-cream hover:bg-cream-200 dark:hover:bg-brandBorder-dark transition"
            >
              Sign In
            </Link>
            <Link
              to="/select-university"
              className="text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary-600 text-cream transition shadow-subtle"
            >
              Explore Campus
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-200 dark:bg-forest/50 border border-brandBorder-light dark:border-forest text-forest dark:text-sage-200 text-xs font-semibold mb-6 shadow-subtle">
            <span className="w-2 h-2 rounded-full bg-forest dark:bg-sage-300" />
            Centralized Indian Campus Pre-Ordering Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-brandText-primary dark:text-cream leading-tight mb-6">
            Find. Order. Collect.{' '}
            <span className="text-forest dark:text-sage-300">
              Enjoy.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-brandText-secondary dark:text-brandText-darkSecondary max-w-2xl mx-auto mb-8 leading-relaxed">
            The minimalist campus food companion for students, faculty, staff, and visitors.
            Browse live menus, reserve 15-minute pickup slots, and collect your meals without standing in long queues.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Link
              to="/select-university"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary-600 transition shadow-soft"
            >
              <span>Explore Your Campus</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark text-brandText-primary dark:text-cream font-bold text-xs sm:text-sm hover:bg-cream-100 transition shadow-subtle"
            >
              <span>Select Account Role</span>
            </Link>
          </div>

          {/* Quick numbers */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-14 pt-8 border-t border-brandBorder-light dark:border-brandBorder-dark text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-brandText-primary dark:text-cream">24+</p>
              <p className="text-xs text-brandText-secondary mt-0.5">Universities</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-brandText-primary dark:text-cream">300+</p>
              <p className="text-xs text-brandText-secondary mt-0.5">Campus Canteens</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-sage-300">0 Mins</p>
              <p className="text-xs text-brandText-secondary mt-0.5">Queue Waiting</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-brandCard-dark border-y border-brandBorder-light dark:border-brandBorder-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-forest dark:text-sage-300 uppercase tracking-widest mb-1.5">
              Three Simple Steps
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-brandText-primary dark:text-cream">
              How It Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-cream-50 dark:bg-brandBorder-dark/30 border border-brandBorder-light dark:border-brandBorder-dark">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white font-bold flex items-center justify-center text-sm mb-4 shadow-subtle">
                1
              </div>
              <h3 className="font-bold text-base text-brandText-primary dark:text-cream mb-2">
                Discover Canteens
              </h3>
              <p className="text-xs sm:text-sm text-brandText-secondary leading-relaxed">
                Select your university and campus to explore nearby cafeteria kiosks, mess dhaba counters, juice bars, and stationery corners.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cream-50 dark:bg-brandBorder-dark/30 border border-brandBorder-light dark:border-brandBorder-dark">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white font-bold flex items-center justify-center text-sm mb-4 shadow-subtle">
                2
              </div>
              <h3 className="font-bold text-base text-brandText-primary dark:text-cream mb-2">
                Order & Pick Your Slot
              </h3>
              <p className="text-xs sm:text-sm text-brandText-secondary leading-relaxed">
                Customize dishes with spice levels and add-ons. Select a convenient 15-minute pickup window that matches your break timings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cream-50 dark:bg-brandBorder-dark/30 border border-brandBorder-light dark:border-brandBorder-dark">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white font-bold flex items-center justify-center text-sm mb-4 shadow-subtle">
                3
              </div>
              <h3 className="font-bold text-base text-brandText-primary dark:text-cream mb-2">
                Flash Token & Enjoy
              </h3>
              <p className="text-xs sm:text-sm text-brandText-secondary leading-relaxed">
                Arrive at the counter, show your digital token number or QR code, pick up your freshly prepared meal, and head back to class!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#FFF9F1] dark:bg-brandBg-dark border-t border-brandBorder-light dark:border-brandBorder-dark py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brandText-secondary">
          <div className="flex items-center gap-2 font-bold text-brandText-primary dark:text-cream">
            <BrandLogo className="w-9 h-9 rounded-lg" />
            <span className="leading-tight">Where is my<br />Canteen</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/about" className="hover:text-forest dark:hover:text-cream">About</Link>
            <Link to="/contact" className="hover:text-forest dark:hover:text-cream">Contact</Link>
            <Link to="/help" className="hover:text-forest dark:hover:text-cream">Help & FAQs</Link>
            <Link to="/login" className="hover:text-forest dark:hover:text-cream">Portals</Link>
          </div>
          <p>© 2026 Where is my Canteen • Made for Indian Campuses</p>
        </div>
      </footer>
    </div>
  );
}
