import React, { useEffect, useState } from 'react';
import { MessageSquareWarning, CheckCircle2, Clock, Filter, Search } from 'lucide-react';
import { adminService } from '../../services/api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export default function UniversityReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [resolvedIds, setResolvedIds] = useState([]);

  useEffect(() => {
    let active = true;
    adminService
      .getUniversityAdminData()
      .then(result => {
        if (active) setData(result);
      })
      .catch(err => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingSkeleton count={4} />;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  const feedback = (data?.recentFeedback || []).map(item =>
    resolvedIds.includes(item.id) ? { ...item, status: 'Resolved' } : item
  );

  const filtered = feedback.filter(item => {
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.canteen.toLowerCase().includes(q) ||
        item.student.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brandText-primary dark:text-cream">
            Student Complaints &amp; Reports
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
            Review hygiene, pickup delay, and service reports submitted for {data?.university}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-cream-100 dark:bg-brandBorder-dark text-xs font-semibold text-brandText-secondary">
          {filtered.length} {filtered.length === 1 ? 'report' : 'reports'}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brandText-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by canteen, student, or issue type..."
            className="field pl-10 text-xs sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brandText-secondary" />
          {['All', 'In Review', 'Resolved'].map(status => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-white shadow-subtle'
                  : 'bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark text-brandText-secondary'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="No matching complaints"
          description="All student complaints matching your filter have been addressed."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const isResolved = item.status === 'Resolved';
            return (
              <div
                key={item.id}
                className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-brandText-primary dark:text-cream">
                      {item.type}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isResolved
                          ? 'bg-sage-100 text-forest dark:bg-forest/50 dark:text-sage-200'
                          : 'bg-softOrange-100 text-softOrange-700 dark:bg-softOrange-950/60 dark:text-softOrange-300'
                      }`}
                    >
                      {isResolved ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary">
                    Canteen: <strong className="text-brandText-primary dark:text-cream">{item.canteen}</strong> · Reported by {item.student}
                  </p>
                </div>

                {!isResolved && (
                  <button
                    type="button"
                    onClick={() => setResolvedIds(prev => [...prev, item.id])}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-semibold transition-colors self-start sm:self-auto"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
