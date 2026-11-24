import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe2,
  Building2,
  Store,
  Users,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { adminService } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export default function PlatformAdminDashboard() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyUniversity, setBusyUniversity] = useState('');

  const loadDashboard = async () => {
    const result = await adminService.getPlatformAdminData();
    setData(result);
  };

  useEffect(() => {
    let active = true;
    adminService.getPlatformAdminData()
      .then(result => {
        if (active) setData(result);
      })
      .catch(error => {
        if (active) setLoadError(error.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateVerification = async (universityId, status) => {
    setBusyUniversity(universityId);
    setActionError('');
    try {
      await adminService.updateUniversityVerification(universityId, status);
      await loadDashboard();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyUniversity('');
    }
  };

  if (loadError) return <p className="text-sm text-rose-600">{loadError}</p>;
  if (!data) return <p className="text-sm text-brandText-secondary">Loading platform dashboard…</p>;

  const { platformStats, universityRequests, universities, systemHealth } = data;

  return (
    <div className="space-y-6">
      {actionError && <p className="text-xs text-rose-600">{actionError}</p>}
      {/* Banner */}
      <div className="bg-primary text-white p-6 sm:p-7 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sage animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-wider text-softOrange">
              Platform Master Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-cream">
            Where is my Canteen Network
          </h1>
          <p className="text-xs sm:text-sm text-cream/80 mt-1 max-w-xl">
            Centralized governance of universities, campuses, registered merchants, and payment infrastructure across India.
          </p>
        </div>

        <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-cream/10 text-xs space-y-1">
          <p className="font-semibold text-cream flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sage" />
            <span>API Gateway: {systemHealth.apiStatus}</span>
          </p>
          <p className="text-cream/70">Uptime: {systemHealth.uptime}</p>
        </div>
      </div>

      {/* 5 Big Platform KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <span className="text-xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary">Universities</span>
          <p className="text-2xl font-bold text-brandText-primary dark:text-cream mt-1">
            {platformStats.totalUniversities}
          </p>
          <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">Registered university partners</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <span className="text-xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary">Campus Units</span>
          <p className="text-2xl font-bold text-forest dark:text-sage mt-1">
            {platformStats.totalCampuses}
          </p>
          <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">Independent dining zones</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <span className="text-xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary">Canteens</span>
          <p className="text-2xl font-bold text-brandText-primary dark:text-cream mt-1">
            {platformStats.totalCanteens}
          </p>
          <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">Live registered food outlets</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle">
          <span className="text-xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary">Total Users</span>
          <p className="text-2xl font-bold text-brandText-primary dark:text-cream mt-1">
            {platformStats.totalUsers.toLocaleString()}
          </p>
          <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">Students, staff & guests</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle col-span-2 lg:col-span-1">
          <span className="text-xs font-medium text-brandText-secondary dark:text-brandText-darkSecondary">Today's Orders</span>
          <p className="text-2xl font-bold text-forest dark:text-sage mt-1">
            {platformStats.totalOrdersToday.toLocaleString()}
          </p>
          <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">{formatCurrency(platformStats.totalGmvToday)} GMV today</p>
        </div>
      </div>

      {/* Grid: Onboarding Requests & Registered Universities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Onboarding Requests (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
            <h3 className="font-bold text-sm text-brandText-primary dark:text-cream">
              Institutional Verification Requests
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-softOrange/20 text-softOrange">
              {universityRequests.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {universityRequests.map(req => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-cream-100 dark:bg-brandBorder-dark/40 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-brandText-primary dark:text-cream">{req.name}</h4>
                  <span className="text-brandText-secondary dark:text-brandText-darkSecondary">{req.state}</span>
                </div>
                <p className="text-brandText-secondary dark:text-brandText-darkSecondary text-[11px]">
                  Contact: <span className="text-brandText-primary dark:text-cream font-medium">{req.contactPerson}</span> ({req.contactEmail})
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-brandBorder-light dark:border-brandBorder-dark">
                  <span className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary">Campuses: {req.estimatedCampuses} • Canteens: {req.estimatedCanteens}</span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={busyUniversity === req.id}
                      onClick={() => updateVerification(req.id, 'REJECTED')}
                      className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-medium"
                    >
                      Reject
                    </button>
                    <button
                      disabled={busyUniversity === req.id}
                      onClick={() => updateVerification(req.id, 'APPROVED')}
                      className="px-2.5 py-1 rounded-lg bg-forest hover:bg-forest/90 text-white text-[11px] font-semibold"
                    >
                      Verify & Onboard
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Active Universities List (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brandBorder-light dark:border-brandBorder-dark">
            <h3 className="font-bold text-sm text-brandText-primary dark:text-cream">
              Active Partner Universities
            </h3>
            <span className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary">
              {universities.length} Total
            </span>
          </div>

          <div className="space-y-3">
            {universities.map(uni => (
              <div
                key={uni.id}
                className="p-3.5 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark hover:bg-cream-100/40 transition flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={uni.logo}
                    alt={uni.name}
                    className="w-10 h-10 rounded-xl object-contain bg-cream-100 p-1 border border-brandBorder-light dark:border-brandBorder-dark"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-brandText-primary dark:text-cream">{uni.shortName}</span>
                      {uni.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest dark:text-sage" />
                      )}
                    </div>
                    <p className="text-[11px] text-brandText-secondary dark:text-brandText-darkSecondary">{uni.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-forest/10 dark:bg-forest/30 text-forest dark:text-sage font-semibold text-[11px]">
                    {uni.campuses.length} Campuses
                  </span>
                  <p className="text-[10px] text-brandText-secondary dark:text-brandText-darkSecondary mt-0.5">{uni.city}, {uni.state}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
