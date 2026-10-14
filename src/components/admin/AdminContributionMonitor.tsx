import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Download,
  Filter,
  Search,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  X,
  ChevronRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

export const AdminContributionMonitor: React.FC = () => {
  const {
    ambassadors,
    tasks,
    timeEntries,
    manualTimeRequests,
    reviewManualTime,
    getWeeklyMetrics,
    getMonthlyMetrics,
    getOverallMetrics,
    setSelectedAmbassadorId,
    setActiveView,
    refreshFromFirestore,
  } = useApp();

  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'hours' | 'tasks' | 'name'>('hours');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshFromFirestore();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Pending manual time requests
  const pendingRequests = manualTimeRequests.filter((r) => r.status === 'Pending');

  // Filter ambassadors
  const filteredAmbassadors = ambassadors.filter((amb) => {
    const matchesDept = selectedDept === 'All' ? true : amb.department.includes(selectedDept);
    const metrics = getWeeklyMetrics(amb.id);

    const matchesStatus =
      selectedStatusFilter === 'All'
        ? true
        : selectedStatusFilter === 'Achieved'
        ? metrics.completedHours >= 4.0
        : selectedStatusFilter === 'In Progress'
        ? metrics.completedHours >= 2.0 && metrics.completedHours < 4.0
        : selectedStatusFilter === 'Below Target'
        ? metrics.completedHours < 2.0 && metrics.completedHours > 0
        : selectedStatusFilter === 'No Activity'
        ? metrics.completedHours === 0
        : true;

    const matchesSearch =
      amb.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      amb.ambassadorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      amb.department.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesStatus && matchesSearch;
  });

  // Sort ambassadors
  filteredAmbassadors.sort((a, b) => {
    if (sortField === 'hours') {
      return getWeeklyMetrics(b.id).completedHours - getWeeklyMetrics(a.id).completedHours;
    } else if (sortField === 'tasks') {
      const aTasks = tasks.filter(
        (t) => t.assignedAmbassadorIds.includes(a.id) && t.status === 'Completed'
      ).length;
      const bTasks = tasks.filter(
        (t) => t.assignedAmbassadorIds.includes(b.id) && t.status === 'Completed'
      ).length;
      return bTasks - aTasks;
    } else {
      return a.fullName.localeCompare(b.fullName);
    }
  });

  // Aggregated Stats
  const totalHoursThisWeek = ambassadors.reduce(
    (sum, a) => sum + getWeeklyMetrics(a.id).completedHours,
    0
  );
  const targetMetCount = ambassadors.filter(
    (a) => a.status === 'Active' && getWeeklyMetrics(a.id).completedHours >= 4.0
  ).length;
  const inProgressCount = ambassadors.filter((a) => {
    const h = getWeeklyMetrics(a.id).completedHours;
    return a.status === 'Active' && h >= 2.0 && h < 4.0;
  }).length;
  const criticalCount = ambassadors.filter((a) => {
    const h = getWeeklyMetrics(a.id).completedHours;
    return a.status === 'Active' && h < 2.0;
  }).length;

  const handleExportCSV = () => {
    const headers = [
      'Ambassador ID',
      'Full Name',
      'Department',
      'Weekly Requirement',
      'Hours Completed This Week',
      'Remaining Hours',
      'Weekly Status',
      'Tenure Total Hours',
    ];

    const rows = ambassadors.map((amb) => {
      const w = getWeeklyMetrics(amb.id);
      const tenure = getOverallMetrics(amb.id);
      return [
        amb.ambassadorId,
        `"${amb.fullName}"`,
        `"${amb.department}"`,
        '4.0',
        w.completedHours.toFixed(2),
        w.remainingHours.toFixed(2),
        w.status,
        tenure.toFixed(2),
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `IIC_Ambassador_Weekly_Contribution_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewProfile = (ambId: string) => {
    setSelectedAmbassadorId(ambId);
    setActiveView('public-profile');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Quota Compliance & Analytics</span>
            <span aria-hidden="true">·</span>
            <span>Weekly 4-Hour Goal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Ambassador 4-Hour Contribution Monitor
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Audit weekly commitment thresholds, review offline time requests, and export records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-60"
            title="Sync latest records from cloud database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin text-[#214FA2]' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Scorecard CSV</span>
          </button>
        </div>
      </div>

      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Hours Logged</span>
          <div className="text-2xl font-bold text-[#214FA2] font-mono mt-1">
            {totalHoursThisWeek.toFixed(1)} Hours
          </div>
          <span className="text-[11px] text-slate-500">Across entire cohort this week</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Target Achieved (4+ hrs)</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">
            {targetMetCount} Ambassadors
          </div>
          <span className="text-[11px] text-slate-500">100%+ Quota satisfied</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>In Progress (2–4 hrs)</span>
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">
            {inProgressCount} Ambassadors
          </div>
          <span className="text-[11px] text-slate-500">On pace to complete</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-700">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Below 2 hrs / Warning</span>
          </div>
          <div className="text-2xl font-bold text-red-600 font-mono mt-1">
            {criticalCount} Ambassadors
          </div>
          <span className="text-[11px] text-slate-500">Dispatched weekly reminders</span>
        </div>
      </div>

      {/* PENDING MANUAL TIME APPROVAL QUEUE (IF ANY) */}
      {pendingRequests.length > 0 && (
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-700" />
              <h3 className="font-bold text-xs text-indigo-950 uppercase tracking-wider">
                Action Required: Pending Manual Time Requests ({pendingRequests.length})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-3.5 rounded-lg border border-indigo-100 text-xs space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{req.ambassadorName}</span>
                  <span className="font-bold font-mono text-emerald-700 text-sm">
                    +{req.durationHours} Hours
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {req.date} · Task: <strong>{req.taskTitle}</strong>
                </div>
                <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded">
                  "{req.reason}"
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => reviewManualTime(req.id, false, 'Rejected')}
                    className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => reviewManualTime(req.id, true, 'Approved')}
                    className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded flex items-center gap-1 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Credit Quota</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTER & SEARCH STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search ambassador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Departments</option>
            <option value="SWE">SWE</option>
            <option value="CSE">CSE</option>
            <option value="MCT">MCT</option>
            <option value="EEE">EEE</option>
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Achieved">🟢 4+ Hours (Achieved)</option>
            <option value="In Progress">🟡 2–4 Hours (In Progress)</option>
            <option value="Below Target">🔴 Below 2 Hours (Warning)</option>
            <option value="No Activity">⚪ No Activity</option>
          </select>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden font-semibold"
          >
            <option value="hours">Sort: Hours This Week</option>
            <option value="tasks">Sort: Tasks Completed</option>
            <option value="name">Sort: Ambassador Name</option>
          </select>
        </div>

        <span className="font-mono text-slate-500">
          Showing {filteredAmbassadors.length} ambassadors
        </span>
      </div>

      {/* AMBASSADOR SCORECARD TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Ambassador</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Weekly Requirement</th>
                <th className="p-3.5">Hours Completed</th>
                <th className="p-3.5 w-44">4h Target Progress</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Tenure Total</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAmbassadors.map((amb) => {
                const metrics = getWeeklyMetrics(amb.id);
                const tenure = getOverallMetrics(amb.id);
                const hrs = Math.floor(metrics.completedHours);
                const mins = Math.round((metrics.completedHours % 1) * 60);

                return (
                  <tr key={amb.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0">
                          <img
                            src={amb.avatarUrl}
                            alt={amb.fullName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{amb.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {amb.ambassadorId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600">{amb.department}</td>

                    <td className="p-3.5 font-mono text-slate-700">4.0 Hours</td>

                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {hrs}h {mins}m
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              metrics.completedHours >= 4.0
                                ? 'bg-emerald-500'
                                : metrics.completedHours >= 2.0
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, metrics.percentage)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>{metrics.percentage}%</span>
                          <span>
                            {metrics.remainingHours > 0
                              ? `${metrics.remainingHours}h remaining`
                              : 'Requirement met'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          metrics.completedHours >= 4.0
                            ? 'bg-emerald-50 text-emerald-800'
                            : metrics.completedHours >= 2.0
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-red-50 text-red-800'
                        }`}
                      >
                        {metrics.completedHours >= 4.0
                          ? '🟢 Achieved'
                          : metrics.completedHours >= 2.0
                          ? '🟡 In Progress'
                          : '🔴 Below Target'}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-slate-700">{tenure.toFixed(1)}h</td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleViewProfile(amb.id)}
                        className="text-xs font-semibold text-[#214FA2] hover:underline"
                      >
                        View CV
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
