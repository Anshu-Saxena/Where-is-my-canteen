import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ShieldCheck, Heart, Users, Building, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-brandText-secondary dark:text-brandText-darkSecondary hover:text-forest dark:hover:text-sage transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-6 sm:p-8 shadow-subtle space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest dark:text-sage">Our Mission</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-brandText-primary dark:text-cream mt-1">
            Revolutionizing Indian Campus Dining
          </h1>
        </div>

        <p className="text-sm text-brandText-primary/80 dark:text-cream/80 leading-relaxed">
          <strong>Where is my Canteen</strong> was born out of a real problem faced by millions of university students across India every day: between 12:45 PM and 1:30 PM, hundreds of hungry students rush to canteen counters at the exact same moment. Long queues eat into break times, paper token slips get misplaced, and kitchen staff get overwhelmed.
        </p>

        <p className="text-sm text-brandText-primary/80 dark:text-cream/80 leading-relaxed">
          Our decentralized multi-university platform provides 15-minute pickup slot pacing, digital QR and token verification, and unified campus discovery — making campus life effortless, modern, and delightful.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-brandBorder-light dark:border-brandBorder-dark">
          <div className="p-4 rounded-xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark">
            <h4 className="font-semibold text-sm text-brandText-primary dark:text-cream mb-1">Zero Lines</h4>
            <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary">Pick up meals hot & ready within your designated 15-min slot.</p>
          </div>
          <div className="p-4 rounded-xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark">
            <h4 className="font-semibold text-sm text-brandText-primary dark:text-cream mb-1">Centralized Tech</h4>
            <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary">Multi-campus support across institutions in India.</p>
          </div>
          <div className="p-4 rounded-xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark">
            <h4 className="font-semibold text-sm text-brandText-primary dark:text-cream mb-1">Fair & Verified</h4>
            <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary">Regulated menu prices & authentic student reviews.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
