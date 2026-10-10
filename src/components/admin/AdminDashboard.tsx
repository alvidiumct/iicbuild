import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Clock,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Check,
  X,
  Play,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    ambassadors,
    tasks,
    timeEntries,
    manualTimeRequests,
    activeTimer,
    reviewManualTime,
    getWeeklyMetrics,
    setActiveView,
    setSelectedTaskId,
    auditLogs,
  } = useApp();

  // Metrics
  const totalAmbassadors = ambassadors.length;
  const activeAmbassadors = ambassadors.filter((a) => a.status === 'Active').length;

  // Calculate hours contributed this week across all ambassadors
  const totalHoursThisWeek = ambassadors.reduce(
    (sum, amb) => sum + getWeeklyMetrics(amb.id).completedHours,
    0
  );

  const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;
  const pendingReviewsCount = tasks.filter(
    (t) => t.status === 'Submitted' || t.status === 'Under Review'
  ).length;

  const belowTargetCount = ambassadors.filter(
    (a) => a.status === 'Active' && getWeeklyMetrics(a.id).completedHours < 4.0
  ).length;

  const pendingManualRequests = manualTimeRequests.filter((r) => r.status === 'Pending');

  // Overdue / upcoming tasks
  const nowStr = new Date().toISOString().split('T')[0];
  const upcomingOrOverdueTasks = tasks
    .filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const handleReviewSubmission = (taskId: string) => {
    setSelectedTaskId(taskId);
    setActiveView('admin-tasks');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Administrative Control Console</span>
            <span aria-hidden="true">·</span>
            <span>Industrial Innovation Centre (IIC)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Ambassador Operations Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Monitor real-time task distribution, 4-hour weekly requirements, and review submissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('admin-tasks')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Assign New Task</span>
          </button>
          <button
            onClick={() => setActiveView('admin-contribution')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <span>4h Contribution Monitor</span>
          </button>
        </div>
      </div>

      {/* 6 TOP EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Ambassadors
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {totalAmbassadors}
          </div>
          <span className="text-[10px] text-slate-500">Across DIU faculties</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Ambassadors
          </span>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">
            {activeAmbassadors}
          </div>
          <span className="text-[10px] text-slate-500">Currently enrolled</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Hours This Week
          </span>
          <div className="text-2xl font-bold text-[#214FA2] font-mono mt-1">
            {totalHoursThisWeek.toFixed(1)}h
          </div>
          <span className="text-[10px] text-slate-500">Approved logged work</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Tasks Completed
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {completedTasksCount}
          </div>
          <span className="text-[10px] text-slate-500">This semester</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            Pending Reviews
          </span>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">
            {pendingReviewsCount}
          </div>
          <span className="text-[10px] text-slate-500">Awaiting admin sign-off</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">
            Below 4h Target
          </span>
          <div className="text-2xl font-bold text-red-600 font-mono mt-1">
            {belowTargetCount}
          </div>
          <span className="text-[10px] text-slate-500">Requires follow-up</span>
        </div>
      </div>

      {/* ACTIVE TIMERS & PENDING MANUAL TIME APPROVALS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Manual Time Approvals */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Pending Manual Time Approvals ({pendingManualRequests.length})
              </h3>
              <p className="text-xs text-slate-500">
                Ambassador requests for offline or un-timed lab innovation work
              </p>
            </div>
            <button
              onClick={() => setActiveView('admin-contribution')}
              className="text-xs font-semibold text-[#214FA2] hover:underline"
            >
              View Monitor
            </button>
          </div>

          {pendingManualRequests.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              All manual time requests are cleared! No pending approvals.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingManualRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{req.ambassadorName}</span>
                      <span className="text-slate-500 ml-1.5 font-mono">
                        ({req.date} · {req.startTime}-{req.endTime})
                      </span>
                    </div>
                    <span className="font-bold font-mono text-[#214FA2] text-sm">
                      {req.durationHours} Hours
                    </span>
                  </div>

                  <div className="text-slate-700">
                    <span className="text-slate-500">Task:</span> <strong>{req.taskTitle}</strong>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 italic">
                    "{req.reason}"
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => reviewManualTime(req.id, false, 'Insufficient details provided')}
                      className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => reviewManualTime(req.id, true, 'Approved by Centre Director')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Hours</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task Submissions Pending Review */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Deliverables Awaiting Review ({pendingReviewsCount})
              </h3>
              <p className="text-xs text-slate-500">
                Tasks marked submitted by student ambassadors
              </p>
            </div>
            <button
              onClick={() => setActiveView('admin-tasks')}
              className="text-xs font-semibold text-[#214FA2] hover:underline"
            >
              Task Board
            </button>
          </div>

          {pendingReviewsCount === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No task deliverables currently in review queue.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks
                .filter((t) => t.status === 'Submitted' || t.status === 'Under Review')
                .map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{task.title}</span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                        {task.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Submitted by: <strong>{task.submission?.submittedByName}</strong></span>
                      <span>·</span>
                      <span className="font-mono">{task.actualHours}h logged</span>
                    </div>

                    {task.submission?.notes && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 bg-white p-2 rounded border border-slate-200">
                        {task.submission.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleReviewSubmission(task.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-md transition-colors"
                      >
                        Review Submission & Approve
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* AMBASSADOR STATUS HIGHLIGHTS & AUDIT LOG PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Contribution Status Watchlist (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Weekly 4-Hour Goal Progress Watchlist
              </h3>
              <p className="text-xs text-slate-500">Live ambassador contribution scorecard status</p>
            </div>
            <button
              onClick={() => setActiveView('admin-contribution')}
              className="text-xs font-semibold text-[#214FA2] hover:underline"
            >
              Full Monitor
            </button>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {ambassadors.map((amb) => {
              const metrics = getWeeklyMetrics(amb.id);
              return (
                <div
                  key={amb.id}
                  className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0">
                      <img
                        src={amb.avatarUrl}
                        alt={amb.fullName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {amb.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {amb.department} · {amb.ambassadorId}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="w-28 hidden sm:block">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                        <span>{metrics.completedHours}h</span>
                        <span>4.0h</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            metrics.completedHours >= 4.0 ? 'bg-emerald-500' : 'bg-[#214FA2]'
                          }`}
                          style={{ width: `${Math.min(100, metrics.percentage)}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          metrics.status === 'Achieved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : metrics.status === 'On Track'
                            ? 'bg-blue-50 text-blue-700'
                            : metrics.status === 'Below Target'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {metrics.status} ({metrics.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Audit Log Preview (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Recent Audit Activity</h3>
            <button
              onClick={() => setActiveView('admin-audit')}
              className="text-xs font-semibold text-[#214FA2] hover:underline"
            >
              All Logs
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs p-2">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span>{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{log.details}</p>
                <span className="text-[10px] text-slate-400 block">{log.actorName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
