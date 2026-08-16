'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Search, 
  Building2, 
  Layers, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AmcTracker() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(''); // 'expiring' or ''

  useEffect(() => {
    fetchRecords();
  }, [filter]);

  async function fetchRecords() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filter) queryParams.append('filter', filter);
      const res = await fetch(`/api/admin/crm/amc?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      toast.error('Failed to load AMC & calibration records');
    } finally {
      setLoading(false);
    }
  }

  // Helper to get days remaining to calibration
  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">AMC & Calibration Control</h1>
          <p className="text-gray-500 font-medium text-sm">Monitor industrial equipment calibration deadlines, warranty durations, and AMC contracts.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setFilter(filter === 'expiring' ? '' : 'expiring')}
            className={`text-xs font-black uppercase tracking-widest px-6 py-3 flex items-center border transition-all ${
              filter === 'expiring' 
                ? 'bg-amber-600 text-white border-amber-600 shadow-md' 
                : 'bg-white text-secondary border-gray-200 hover:border-gray-300'
            }`}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            {filter === 'expiring' ? 'Showing Calibration Expiries' : 'Show Calibration Expiries'}
          </button>
        </div>
      </div>

      {/* Equipment Table List */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
              <th className="p-4 pl-6">Machine Details</th>
              <th className="p-4">B2B Company</th>
              <th className="p-4">Warranty Expiry</th>
              <th className="p-4">Calibration Due Date</th>
              <th className="p-4 text-right pr-6">Status Indicator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(5)].map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="p-6 pl-6"><div className="h-4 w-40 bg-gray-100" /></td>
                  <td className="p-6"><div className="h-4 w-32 bg-gray-100" /></td>
                  <td className="p-6"><div className="h-4 w-28 bg-gray-100" /></td>
                  <td className="p-6"><div className="h-4 w-28 bg-gray-100" /></td>
                  <td className="p-6"><div className="h-4 w-20 bg-gray-100 ml-auto" /></td>
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                  No machinery calibration schedules found.
                </td>
              </tr>
            ) : (
              records.map((rec) => {
                const daysLeft = getDaysRemaining(rec.calibrationDueDate);
                const isOverdue = daysLeft < 0;
                const isUrgent = daysLeft >= 0 && daysLeft <= 30;

                return (
                  <tr key={rec._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div>
                        <p className="text-xs font-black text-secondary uppercase tracking-tight">{rec.productName}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">SN: {rec.machineSerialNumber}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-xs text-gray-500 font-bold">
                        <Building2 className="w-3.5 h-3.5 mr-1.5 text-gray-300" />
                        {rec.company?.name || 'Customer Account'}
                      </div>
                    </td>
                    <td className="p-4 text-xs font-bold text-gray-500">
                      {new Date(rec.warrantyExpiryDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-xs font-black text-secondary">{new Date(rec.calibrationDueDate).toLocaleDateString()}</p>
                        <p className={`text-[9px] font-bold ${
                          isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-green-600'
                        } uppercase tracking-widest mt-0.5`}>
                          {isOverdue 
                            ? `Overdue by ${Math.abs(daysLeft)} Days` 
                            : isUrgent 
                            ? `${daysLeft} Days Remaining` 
                            : `${daysLeft} Days to go`}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border ${
                        isOverdue 
                          ? 'bg-red-50 border-red-200 text-red-700' 
                          : isUrgent
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-green-50 border-green-200 text-green-700'
                      }`}>
                        {isOverdue ? 'Alarms Triggered' : isUrgent ? 'Warning Alert' : 'Compliant'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
