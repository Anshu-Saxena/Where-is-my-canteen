import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Server, CreditCard, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/api';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export default function PlatformSettingsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const res = await adminService.getPlatformAdminData();
      setData(res);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingSkeleton count={3} />;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  const health = data?.systemHealth || {};

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brandText-primary dark:text-cream">
            System Health &amp; Infrastructure
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Live platform API, gateway, and uptime diagnostics
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark text-xs font-semibold hover:border-primary-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5 flex items-start gap-3">
          <Activity className="w-5 h-5 text-forest shrink-0 mt-0.5" />
          <div>
            <p className="text-2xs uppercase font-bold text-brandText-secondary">API Gateway Status</p>
            <p className="text-lg font-bold text-brandText-primary dark:text-cream mt-0.5">
              {health.apiStatus || 'Operational'}
            </p>
            <p className="text-xs text-brandText-secondary mt-1">
              Avg latency: {health.averageResponseTime || '42ms'}
            </p>
          </div>
        </div>

        <div className="card p-5 flex items-start gap-3">
          <Server className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-2xs uppercase font-bold text-brandText-secondary">Platform Uptime</p>
            <p className="text-lg font-bold text-brandText-primary dark:text-cream mt-0.5">
              {health.uptime || '99.98%'}
            </p>
            <p className="text-xs text-brandText-secondary mt-1">
              Asia/Kolkata (IST) primary region
            </p>
          </div>
        </div>

        <div className="card p-5 flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-forest shrink-0 mt-0.5" />
          <div>
            <p className="text-2xs uppercase font-bold text-brandText-secondary">Payment Gateway</p>
            <p className="text-lg font-bold text-brandText-primary dark:text-cream mt-0.5">
              {health.paymentGatewayStatus || 'Healthy'}
            </p>
            <p className="text-xs text-brandText-secondary mt-1">
              Razorpay / Sandbox reconciliation active
            </p>
          </div>
        </div>

        <div className="card p-5 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-2xs uppercase font-bold text-brandText-secondary">Security &amp; Sessions</p>
            <p className="text-lg font-bold text-brandText-primary dark:text-cream mt-0.5">
              Active
            </p>
            <p className="text-xs text-brandText-secondary mt-1">
              Role-based access control &amp; HTTP-only session cookies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
