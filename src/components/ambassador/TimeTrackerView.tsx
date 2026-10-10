import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Play,
  Pause,
  Square,
  AlertCircle,
  Plus,
  CheckCircle,
  Calendar,
  X,
  FileText,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const TimeTrackerView: React.FC = () => {
  const {
    currentAmbassador,
    tasks,
    timeEntries,
    manualTimeRequests,
    activeTimer,
    activeTimerElapsedSeconds,
    punchIn,
    pauseTimer,
    resumeTimer,
    punchOut,
    cancelTimer,
    requestManualTime,
    getWeeklyMetrics,
    getMonthlyMetrics,
    getOverallMetrics,
  } = useApp();

  const [selectedTaskIdForTimer, setSelectedTaskIdForTimer] = useState<string>('');
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualTaskId, setManualTaskId] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualStart, setManualStart] = useState('14:00');
  const [manualEnd, setManualEnd] = useState('16:00');
  const [manualHours, setManualHours] = useState(2.0);
  const [manualReason, setManualReason] = useState('');

  const [punchOutModalOpen, setPunchOutModalOpen] = useState(false);
  const [punchOutNotes, setPunchOutNotes] = useState('');

  const ambassador = currentAmbassador;
  if (!ambassador) {
    return <div className="p-8 text-center text-slate-500">Please select an ambassador user.</div>;
  }

  // Tasks assigned to this ambassador that can be punched into
  const myAssignableTasks = tasks.filter(
    (t) =>
      t.assignedAmbassadorIds.includes(ambassador.id) &&
      t.status !== 'Completed' &&
      t.status !== 'Cancelled'
  );

  // Time records for this ambassador
  const myTimeEntries = timeEntries.filter((e) => e.ambassadorId === ambassador.id);
  const myManualRequests = manualTimeRequests.filter((r) => r.ambassadorId === ambassador.id);

  // 4h goal metrics
  const weekly = getWeeklyMetrics(ambassador.id);
  const monthlyHours = getMonthlyMetrics(ambassador.id);
  const overallHours = getOverallMetrics(ambassador.id);

  // Timer format
  const hours = Math.floor(activeTimerElapsedSeconds / 3600);
  const minutes = Math.floor((activeTimerElapsedSeconds % 3600) / 60);
  const seconds = activeTimerElapsedSeconds % 60;
  const timerFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleStartTimer = () => {
    if (!selectedTaskIdForTimer) {
      alert('Please select a task from your assigned list to start punch-in.');
      return;
    }
    punchIn(selectedTaskIdForTimer);
  };

  const handleConfirmPunchOut = () => {
    punchOut(punchOutNotes);
    setPunchOutNotes('');
    setPunchOutModalOpen(false);
  };

  const handleManualTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTaskId || !manualReason) return;

    requestManualTime({
      taskId: manualTaskId,
      date: manualDate,
      startTime: manualStart,
      endTime: manualEnd,
      durationHours: Number(manualHours),
      reason: manualReason,
    });

    setManualModalOpen(false);
    setManualTaskId('');
    setManualReason('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Core Objective</span>
            <span aria-hidden="true">·</span>
            <span>Punch In/Out & Contribution Monitoring</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Time Tracker & Contribution Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Log active task execution hours and submit offline manual time requests
          </p>
        </div>

        <button
          onClick={() => setManualModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Request Manual Time Entry</span>
        </button>
      </div>

      {/* ACTIVE TIMER HERO CONSOLE */}
      <section className="bg-slate-900 text-white rounded-xl border border-slate-800 p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  activeTimer
                    ? activeTimer.isPaused
                      ? 'bg-amber-400'
                      : 'bg-emerald-400 animate-pulse'
                    : 'bg-slate-600'
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {activeTimer
                  ? activeTimer.isPaused
                    ? 'Session Paused'
                    : 'Working Live'
                  : 'Timer Idle'}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white">
              {activeTimer ? activeTimer.taskTitle : 'Select a Task to Begin Punch-In'}
            </h2>

            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Timers are automatically persisted across browser refreshes and tab switching. Time
              recorded directly counts toward your weekly 4-hour commitment.
            </p>
          </div>

          {/* Big Digital Tabular Clock */}
          <div className="flex flex-col items-center lg:items-end gap-3">
            <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-400 tracking-wider tabular-nums bg-slate-950/80 px-6 py-3 rounded-xl border border-slate-800 shadow-inner">
              {activeTimer ? timerFormatted : '00:00:00'}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-2">
              {!activeTimer ? (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTaskIdForTimer}
                    onChange={(e) => setSelectedTaskIdForTimer(e.target.value)}
                    className="text-xs p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden max-w-[200px] sm:max-w-xs truncate"
                  >
                    <option value="">-- Choose Assigned Task --</option>
                    {myAssignableTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleStartTimer}
                    disabled={!selectedTaskIdForTimer}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Punch In</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {activeTimer.isPaused ? (
                    <button
                      onClick={resumeTimer}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Resume Work</span>
                    </button>
                  ) : (
                    <button
                      onClick={pauseTimer}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors shadow-xs"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Pause Session</span>
                    </button>
                  )}

                  <button
                    onClick={() => setPunchOutModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-xs"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Punch Out & Save</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4-HOUR CONTRIBUTION SCORECARD SUMMARY */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-slate-900">Weekly Contribution Scorecard</h3>
          <span className="text-xs font-mono text-slate-500">Target: 4.0 Hours/Week</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Target</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">4h 00m</div>
            <span className="text-[10px] text-slate-500">Weekly minimum</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Approved Logged</span>
            <div className="text-lg font-bold font-mono text-emerald-600 mt-0.5">
              {Math.floor(weekly.completedHours)}h {Math.round((weekly.completedHours % 1) * 60)}m
            </div>
            <span className="text-[10px] text-slate-500">Completed this week</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Remaining</span>
            <div className="text-lg font-bold font-mono text-amber-600 mt-0.5">
              {weekly.remainingHours > 0
                ? `${Math.floor(weekly.remainingHours)}h ${Math.round(
                    (weekly.remainingHours % 1) * 60
                  )}m`
                : '0h 00m'}
            </div>
            <span className="text-[10px] text-slate-500">To satisfy target</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Tenure Total</span>
            <div className="text-lg font-bold font-mono text-[#214FA2] mt-0.5">
              {overallHours} Hours
            </div>
            <span className="text-[10px] text-slate-500">Total IIC contribution</span>
          </div>
        </div>
      </section>

      {/* TWO COLUMN LOGS: TIME ENTRIES & MANUAL REQUESTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approved Time Entries Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Contribution Time History</h3>
              <p className="text-xs text-slate-500">
                Official approved hours logged from live punch-in and approved manual entries
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-600 font-mono">
              Total: {myTimeEntries.length} entries
            </span>
          </div>

          {myTimeEntries.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No time entries recorded yet. Select an assigned task and Punch In to begin logging!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {myTimeEntries.map((entry) => {
                const durationHrs = Number((entry.totalActiveSeconds / 3600).toFixed(2));
                const mins = Math.round((entry.totalActiveSeconds % 3600) / 60);
                const hrs = Math.floor(entry.totalActiveSeconds / 3600);

                return (
                  <div
                    key={entry.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {entry.taskTitle}
                        </span>
                        {entry.isManual && (
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                            Manual
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>Date: {entry.date}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{entry.notes || 'Punch in/out session'}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold font-mono text-emerald-700">
                        +{hrs}h {mins}m
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({durationHrs} hrs)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Manual Time Requests Status Column (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Manual Time Requests</h3>
            <span className="text-xs text-slate-500 font-mono">{myManualRequests.length}</span>
          </div>

          {myManualRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No manual time requests submitted.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myManualRequests.map((req) => (
                <div key={req.id} className="p-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[160px]">
                      {req.taskTitle}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        req.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : req.status === 'Rejected'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    {req.date} · {req.startTime} - {req.endTime} (<strong>{req.durationHours}h</strong>)
                  </div>

                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                    "{req.reason}"
                  </p>

                  {req.adminFeedback && (
                    <div className="text-[10px] text-emerald-800 pt-0.5">
                      Admin remark: {req.adminFeedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PUNCH OUT CONFIRMATION MODAL */}
      {punchOutModalOpen && activeTimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">Confirm Session Punch Out</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add your work summary to log this contribution into your official 4-hour records.
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 text-xs space-y-1">
              <div>
                Task: <strong className="text-slate-900">{activeTimer.taskTitle}</strong>
              </div>
              <div>
                Duration:{' '}
                <strong className="text-emerald-700 font-mono">
                  {timerFormatted} (+{(activeTimerElapsedSeconds / 3600).toFixed(2)}h)
                </strong>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Session Accomplishments / Notes (Optional)
              </label>
              <textarea
                value={punchOutNotes}
                onChange={(e) => setPunchOutNotes(e.target.value)}
                placeholder="What did you work on or complete during this session?"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] resize-none h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPunchOutModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmPunchOut}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors"
              >
                Punch Out & Save Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL TIME REQUEST MODAL */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Request Manual Time Entry</h3>
                <p className="text-xs text-slate-500">
                  For valid work performed outside timer (power cut, field trial, offline code)
                </p>
              </div>
              <button
                onClick={() => setManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualTimeSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Related Task *
                </label>
                <select
                  required
                  value={manualTaskId}
                  onChange={(e) => setManualTaskId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                >
                  <option value="">-- Select Task --</option>
                  {myAssignableTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={manualStart}
                    onChange={(e) => setManualStart(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={manualEnd}
                    onChange={(e) => setManualEnd(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Duration (Hours) *
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="10"
                  required
                  value={manualHours}
                  onChange={(e) => setManualHours(parseFloat(e.target.value))}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Manual Entry *
                </label>
                <textarea
                  required
                  rows={3}
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="Explain why the live timer was not used (e.g. laboratory hardware test without mobile phone access)..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors"
                >
                  Submit For Admin Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
