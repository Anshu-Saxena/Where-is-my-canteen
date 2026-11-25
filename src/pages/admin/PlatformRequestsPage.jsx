import React, { useEffect, useState } from 'react';
import { FileCheck2, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import { adminService } from '../../services/api';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

export default function PlatformRequestsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [handledIds, setHandledIds] = useState({});

  useEffect(() => {
    let active = true;
    adminService
      .getPlatformAdminData()
      .then(res => {
        if (active) setData(res);
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

  const handleAction = async (id, status) => {
    setBusyId(id);
    setError('');
    try {
      await adminService.updateUniversityVerification(id, status).catch(() => null);
      setHandledIds(prev => ({ ...prev, [id]: status }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  if (loading) return <LoadingSkeleton count={3} />;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  const requests = (data?.universityRequests || []).filter(r => !handledIds[r.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-brandText-primary dark:text-cream">
          University Verification Requests
        </h1>
        <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
          Approve or reject institutional onboarding requests from new universities
        </p>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="All verification requests processed"
          description="There are no pending university onboarding requests right now."
        />
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm text-brandText-primary dark:text-cream">{req.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-softOrange-100 text-softOrange-700 text-[10px] font-bold">
                    {req.status}
                  </span>
                </div>
                <p className="text-xs text-brandText-secondary">
                  {req.state} · {req.campuses} campuses · Contact: {req.contactPerson} · Submitted {req.date}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={busyId === req.id}
                  onClick={() => handleAction(req.id, 'Verified')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-semibold transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
                <button
                  type="button"
                  disabled={busyId === req.id}
                  onClick={() => handleAction(req.id, 'Rejected')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
