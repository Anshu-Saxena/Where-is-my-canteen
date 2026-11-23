import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Utensils,
  Users,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import { UNIVERSITY_ADMIN_DATA } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatters';

export default function UniversityAdminDashboard() {
  const { university, stats, canteensList, pendingApprovals, recentFeedback } = UNIVERSITY_ADMIN_DATA;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-brandCard-dark p-6 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🏛️</span>
            <h1 className="text-xl sm:text-2xl font-bold text-brandText-primary dark:text-cream">
              {university} Administration
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary">
            Campus Dining Governance, Compliance & Vendor Onboarding
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage/20 text-forest dark:text-sage border border-sage/40 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Institutional Authority Verified</span>
        </div>
      </div>

      {/* University Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <span className="text-xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary">Active Campuses</span>
          <p className="text-2xl font-bold text-brandText-primary dark:text-cream mt-1">
            {stats.totalCampuses}
          </p>
          <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary mt-1">Main & East Delhi</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <span className="text-xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary">Licensed Canteens</span>
          <p className="text-2xl font-bold text-forest dark:text-sage mt-1">
            {stats.activeCanteens}
          </p>
          <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary mt-1">100% hygiene inspected</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <span className="text-xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary">Student & Staff Users</span>
          <p className="text-2xl font-bold text-brandText-primary dark:text-cream mt-1">
            {stats.registeredStudents.toLocaleString()}
          </p>
          <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary mt-1">Daily active food orders</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <span className="text-xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary">Daily Campus Orders</span>
          <p className="text-2xl font-bold text-forest dark:text-sage mt-1">
            {stats.dailyOrders}
          </p>
          <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary mt-1">~{formatCurrency(stats.totalMonthlyGMV)} monthly GMV</p>
        </div>
      </div>

      {/* Grid: Canteen Performance Table & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Canteen List (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
            <div>
              <h3 className="font-bold text-sm text-brandText-primary dark:text-cream">
                University Canteens Directory
              </h3>
              <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary">
                Compliance score, star ratings, and manager contacts
              </p>
            </div>
            <Link
              to="/university-admin/canteens"
              className="text-xs font-semibold text-forest dark:text-sage hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brandText-primary dark:text-cream">
              <thead className="bg-cream-100 dark:bg-brandBorder-dark/40 text-brandText-secondary dark:text-brandText-darkSecondary font-semibold border-b border-brandBorder-light dark:border-brandBorder-dark">
                <tr>
                  <th className="p-3">Canteen</th>
                  <th className="p-3">Manager</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Compliance</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brandBorder-light dark:divide-brandBorder-dark">
                {canteensList.map(c => (
                  <tr key={c.id}>
                    <td className="p-3 font-semibold text-brandText-primary dark:text-cream">
                      {c.name}
                    </td>
                    <td className="p-3 text-brandText-secondary dark:text-brandText-darkSecondary">{c.manager}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 font-bold text-softOrange">
                        <Star className="w-3 h-3 fill-current" />
                        {c.rating}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-forest dark:text-sage">{c.complianceScore}</td>
                    <td className="p-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Active'
                            ? 'bg-sage/20 text-forest dark:text-sage'
                            : 'bg-softOrange/20 text-softOrange'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Approvals & Complaints (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Approvals */}
          <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-5 shadow-subtle space-y-3">
            <h3 className="font-bold text-sm text-brandText-primary dark:text-cream pb-2 border-b border-brandBorder-light dark:border-brandBorder-dark">
              Pending Canteen Approvals
            </h3>

            <div className="space-y-2.5">
              {pendingApprovals.map(app => (
                <div key={app.id} className="p-3 rounded-xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brandText-primary dark:text-cream">{app.name}</span>
                    <span className="text-[10px] bg-softOrange/20 text-softOrange px-2 py-0.5 rounded-full font-semibold">
                      {app.type}
                    </span>
                  </div>
                  <p className="text-brandText-secondary dark:text-brandText-darkSecondary text-[11px]">Campus: {app.campus} • Operator: {app.operator}</p>
                  <div className="flex justify-end gap-2 pt-1">
                    <button className="px-2 py-1 rounded-lg border border-brandBorder-light dark:border-brandBorder-dark text-brandText-secondary dark:text-brandText-darkSecondary text-[11px]">Reject</button>
                    <button className="px-2 py-1 rounded-lg bg-primary text-white font-semibold text-[11px]">Approve</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback snippet */}
          <div className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-5 shadow-subtle space-y-3">
            <h3 className="font-bold text-sm text-brandText-primary dark:text-cream pb-2 border-b border-brandBorder-light dark:border-brandBorder-dark">
              Recent Campus Feedback
            </h3>
            <div className="space-y-2">
              {recentFeedback.map(fb => (
                <div key={fb.id} className="text-xs p-2.5 rounded-xl bg-cream-100 dark:bg-brandBorder-dark/40 border border-brandBorder-light dark:border-brandBorder-dark">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-brandText-primary dark:text-cream">{fb.canteen}</span>
                    <span className="text-softOrange font-bold">★ {fb.rating}</span>
                  </div>
                  <p className="text-brandText-secondary dark:text-brandText-darkSecondary text-[11px]">"{fb.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
