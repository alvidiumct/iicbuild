import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  TrendingUp,
  CheckCircle,
  Users,
  FolderGit2,
  Clock,
} from 'lucide-react';

export const AdminReportsView: React.FC = () => {
  const { ambassadors, tasks, projects, timeEntries, getWeeklyMetrics, getOverallMetrics } =
    useApp();

  const [activeReportTab, setActiveReportTab] = useState<'ambassadors' | 'tasks' | 'hours' | 'projects'>(
    'ambassadors'
  );

  // Stats calculation
  const totalHoursLogged = timeEntries.reduce(
    (sum, e) => sum + e.totalActiveSeconds / 3600,
    0
  );
  const totalTasksCompleted = tasks.filter((t) => t.status === 'Completed').length;
  const taskCompletionRate = Math.round((totalTasksCompleted / (tasks.length || 1)) * 100);

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[] = [];

    if (activeReportTab === 'ambassadors') {
      headers = [
        'Ambassador ID',
        'Name',
        'Department',
        'Status',
        'Weekly Hours (4h target)',
        'Tenure Total Hours',
      ];
      rows = ambassadors.map((a) =>
        [
          a.ambassadorId,
          `"${a.fullName}"`,
          `"${a.department}"`,
          a.status,
          getWeeklyMetrics(a.id).completedHours.toFixed(2),
          getOverallMetrics(a.id).toFixed(2),
        ].join(',')
      );
    } else if (activeReportTab === 'tasks') {
      headers = ['Task Title', 'Category', 'Priority', 'Estimated Hours', 'Actual Hours', 'Status', 'Deadline'];
      rows = tasks.map((t) =>
        [
          `"${t.title}"`,
          `"${t.category}"`,
          t.priority,
          t.estimatedHours,
          t.actualHours,
          t.status,
          t.deadline,
        ].join(',')
      );
    } else if (activeReportTab === 'hours') {
      headers = ['Date', 'Ambassador', 'Task Title', 'Duration (Hours)', 'Type', 'Notes'];
      rows = timeEntries.map((e) =>
        [
          e.date,
          `"${e.ambassadorName}"`,
          `"${e.taskTitle}"`,
          (e.totalActiveSeconds / 3600).toFixed(2),
          e.isManual ? 'Manual' : 'Timer',
          `"${e.notes || ''}"`,
        ].join(',')
      );
    } else {
      headers = ['Project Title', 'Category', 'Status', 'Connected Ambassadors Count', 'Tags'];
      rows = projects.map((p) =>
        [
          `"${p.title}"`,
          `"${p.category}"`,
          p.status,
          p.connectedAmbassadorIds.length,
          `"${(p.tags || []).join('; ')}"`,
        ].join(',')
      );
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IIC_${activeReportTab}_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Audit & Executive Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Reports & Exports</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Reporting & Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Download comprehensive audit reports for faculty review, syndicate audits, and accreditation
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export {activeReportTab.toUpperCase()} CSV</span>
        </button>
      </div>

      {/* Top 4 KPI Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Contribution</span>
          <div className="text-2xl font-bold text-[#214FA2] font-mono mt-1">
            {totalHoursLogged.toFixed(1)}h
          </div>
          <span className="text-[11px] text-slate-500">All-time logged R&D</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Task Completion Rate</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">
            {taskCompletionRate}%
          </div>
          <span className="text-[11px] text-slate-500">{totalTasksCompleted} of {tasks.length} delivered</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Cohort</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {ambassadors.filter((a) => a.status === 'Active').length}
          </div>
          <span className="text-[11px] text-slate-500">Student ambassadors</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Innovation Projects</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {projects.length}
          </div>
          <span className="text-[11px] text-slate-500">Registered initiatives</span>
        </div>
      </div>

      {/* Report Category Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveReportTab('ambassadors')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeReportTab === 'ambassadors'
              ? 'border-[#214FA2] text-[#214FA2]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Ambassadors Quota Report
        </button>
        <button
          onClick={() => setActiveReportTab('tasks')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeReportTab === 'tasks'
              ? 'border-[#214FA2] text-[#214FA2]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Task Distribution Report
        </button>
        <button
          onClick={() => setActiveReportTab('hours')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeReportTab === 'hours'
              ? 'border-[#214FA2] text-[#214FA2]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Time Log Audit Trail
        </button>
        <button
          onClick={() => setActiveReportTab('projects')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeReportTab === 'projects'
              ? 'border-[#214FA2] text-[#214FA2]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Innovation Projects Report
        </button>
      </div>

      {/* Active Table Preview */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            Previewing top records for export
          </span>
          <span className="text-slate-500 font-mono">Format: RFC 4180 CSV Compliant</span>
        </div>

        <div className="overflow-x-auto">
          {activeReportTab === 'ambassadors' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">ID</th>
                  <th className="p-3">Ambassador</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Weekly Hours</th>
                  <th className="p-3">Tenure Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {ambassadors.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">{a.ambassadorId}</td>
                    <td className="p-3 font-sans font-bold text-slate-900">{a.fullName}</td>
                    <td className="p-3 font-sans text-slate-600">{a.department}</td>
                    <td className="p-3 font-sans">{a.status}</td>
                    <td className="p-3 font-bold text-emerald-700">
                      {getWeeklyMetrics(a.id).completedHours.toFixed(1)}h / 4h
                    </td>
                    <td className="p-3 text-slate-800">{getOverallMetrics(a.id).toFixed(1)}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReportTab === 'tasks' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Task Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Est. / Act. Hours</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{t.title}</td>
                    <td className="p-3 text-slate-600">{t.category}</td>
                    <td className="p-3 font-mono">{t.priority}</td>
                    <td className="p-3 font-mono">
                      {t.estimatedHours}h / {t.actualHours}h
                    </td>
                    <td className="p-3">{t.status}</td>
                    <td className="p-3 font-mono text-slate-500">{t.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReportTab === 'hours' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Date</th>
                  <th className="p-3">Ambassador</th>
                  <th className="p-3">Task Title</th>
                  <th className="p-3 font-mono">Duration</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {timeEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-500">{e.date}</td>
                    <td className="p-3 font-bold text-slate-900">{e.ambassadorName}</td>
                    <td className="p-3 text-slate-700">{e.taskTitle}</td>
                    <td className="p-3 font-mono text-emerald-700 font-bold">
                      {(e.totalActiveSeconds / 3600).toFixed(2)}h
                    </td>
                    <td className="p-3">{e.isManual ? 'Manual Entry' : 'Punch Timer'}</td>
                    <td className="p-3 text-slate-500 italic max-w-xs truncate">
                      {e.notes || 'Normal work session'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReportTab === 'projects' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Project Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Stage</th>
                  <th className="p-3">Contributors</th>
                  <th className="p-3">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{p.title}</td>
                    <td className="p-3 text-slate-600">{p.category}</td>
                    <td className="p-3 font-mono">{p.status}</td>
                    <td className="p-3 font-mono">{p.connectedAmbassadorIds.length} Ambassadors</td>
                    <td className="p-3 text-slate-500">{(p.tags || []).join(', ') || 'General'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
