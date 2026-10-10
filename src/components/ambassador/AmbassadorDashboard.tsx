import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Play,
  ArrowRight,
  Sparkles,
  FolderGit2,
  Megaphone,
  BookOpen,
  ChevronRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

export const AmbassadorDashboard: React.FC = () => {
  const {
    currentAmbassador,
    currentUser,
    tasks,
    punchIn,
    activeTimer,
    getWeeklyMetrics,
    getMonthlyMetrics,
    getOverallMetrics,
    setActiveView,
    setSelectedTaskId,
    projects,
    announcements,
    availabilityList,
  } = useApp();

  const ambassador = currentAmbassador;
  if (!ambassador) {
    return (
      <div className="p-8 text-center text-slate-500">
        Ambassador profile not found. Please switch to an Ambassador user from the top right.
      </div>
    );
  }

  // Calculate 4-hour metrics
  const weekly = getWeeklyMetrics(ambassador.id);
  const monthlyHours = getMonthlyMetrics(ambassador.id);
  const overallHours = getOverallMetrics(ambassador.id);

  // Ambassador's assigned tasks
  const myTasks = tasks.filter((t) => t.assignedAmbassadorIds.includes(ambassador.id));
  const activeWorkingTasks = myTasks.filter((t) => t.status === 'In Progress');
  const pendingTasks = myTasks.filter((t) => t.status === 'Assigned' || t.status === 'Accepted');
  const submittedTasks = myTasks.filter(
    (t) => t.status === 'Submitted' || t.status === 'Under Review'
  );
  const completedTasks = myTasks.filter((t) => t.status === 'Completed');

  // Next upcoming deadline
  const tasksWithUpcomingDeadline = [...pendingTasks, ...activeWorkingTasks].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );
  const nextDueTask = tasksWithUpcomingDeadline[0];

  // Connected projects
  const myProjects = projects.filter((p) => p.connectedAmbassadorIds.includes(ambassador.id));

  // Availability status
  const myAvailability = availabilityList.find((a) => a.ambassadorId === ambassador.id);

  const formatHoursMinutes = (decimalHours: number) => {
    const hrs = Math.floor(decimalHours);
    const mins = Math.round((decimalHours - hrs) * 60);
    return `${hrs}h ${mins > 0 ? `${mins}m` : '00m'}`;
  };

  const handleOpenTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setActiveView('tasks');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner & Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>{ambassador.university}</span>
            <span aria-hidden="true">·</span>
            <span>{ambassador.department}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{ambassador.ambassadorId}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {ambassador.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Active Student Ambassador · Industrial Innovation Centre (IIC)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('time-tracker')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Clock className="w-4 h-4" />
            <span>Open Time Tracker</span>
          </button>
          <button
            onClick={() => setActiveView('availability')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Update Availability</span>
          </button>
        </div>
      </div>

      {/* HIGHEST PRIORITY: WEEKLY 4-HOUR CONTRIBUTION SCORECARD */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 lg:max-w-md">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Weekly Contribution Requirement
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  weekly.completedHours >= 4.0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {weekly.completedHours >= 4.0 ? 'Goal Met (4+ hrs)' : 'In Progress'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
              {formatHoursMinutes(weekly.completedHours)}{' '}
              <span className="text-sm font-normal text-slate-400 font-sans">
                / {weekly.target}.0 Hours Required
              </span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every active IIC ambassador commits a minimum of 4 hours weekly to project R&D,
              mentorship, prototyping, or innovation operations.
            </p>
          </div>

          {/* Progress Indicators & Metric Pillars */}
          <div className="flex-1 max-w-xl">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Current Week Progress</span>
              <span className="font-mono text-sm text-[#214FA2]">{weekly.percentage}%</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  weekly.completedHours >= 4.0 ? 'bg-emerald-500' : 'bg-[#214FA2]'
                }`}
                style={{ width: `${Math.min(100, weekly.percentage)}%` }}
              />
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3 pt-4 text-center">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Requirement</div>
                <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">4h 00m</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Completed</div>
                <div className="text-sm font-bold text-emerald-600 font-mono mt-0.5">
                  {formatHoursMinutes(weekly.completedHours)}
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Remaining</div>
                <div className="text-sm font-bold text-amber-600 font-mono mt-0.5">
                  {weekly.remainingHours > 0 ? formatHoursMinutes(weekly.remainingHours) : '0h 00m'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Tenure Stats */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-6">
            <span>
              Monthly Total:{' '}
              <strong className="text-slate-900 font-mono">{monthlyHours} Hours</strong>
            </span>
            <span>
              Tenure Total:{' '}
              <strong className="text-slate-900 font-mono">{overallHours} Hours</strong>
            </span>
            <span>
              Tasks Finished: <strong className="text-slate-900">{completedTasks.length}</strong>
            </span>
          </div>
          <button
            onClick={() => setActiveView('time-tracker')}
            className="text-xs font-semibold text-[#214FA2] hover:underline flex items-center gap-1"
          >
            <span>View detailed contribution records</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 2-COLUMN OPERATIONAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Actionable Tasks & Next Due */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Work / Urgent Attention Card */}
          {nextDueTask && (
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs border border-slate-800">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    What To Do Next
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Deadline: <strong className="text-slate-200">{nextDueTask.deadline}</strong>
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                {nextDueTask.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                {nextDueTask.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>
                    Est: <strong className="text-white font-mono">{nextDueTask.estimatedHours}h</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Logged: <strong className="text-white font-mono">{nextDueTask.actualHours}h</strong>
                  </span>
                  <span>·</span>
                  <span className="text-emerald-400 font-semibold">{nextDueTask.status}</span>
                </div>

                <div className="flex items-center gap-2">
                  {activeTimer?.taskId === nextDueTask.id ? (
                    <button
                      onClick={() => setActiveView('time-tracker')}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                    >
                      Active In Timer
                    </button>
                  ) : (
                    <button
                      onClick={() => punchIn(nextDueTask.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Punch In Now</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenTask(nextDueTask.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                  >
                    View Instructions
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Assigned Tasks Summary Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">My Assigned Tasks</h3>
                <p className="text-xs text-slate-500">Tasks requiring execution or pending review</p>
              </div>
              <button
                onClick={() => setActiveView('tasks')}
                className="text-xs font-semibold text-[#214FA2] hover:underline flex items-center gap-1"
              >
                <span>View All ({myTasks.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {myTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-600" />
                <p className="text-xs">No active tasks assigned at this moment.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleOpenTask(task.id)}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {task.title}
                        </span>
                        {task.priority === 'Urgent' && (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                            Urgent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{task.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>Due: {task.deadline}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{task.estimatedHours}h est.</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          task.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : task.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700'
                            : task.status === 'Submitted'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {task.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connected IIC Projects */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Connected IIC Projects</h3>
                <p className="text-xs text-slate-500">Innovation initiatives you participate in</p>
              </div>
              <button
                onClick={() => setActiveView('projects')}
                className="text-xs font-semibold text-[#214FA2] hover:underline"
              >
                Browse Projects
              </button>
            </div>

            {myProjects.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
                You are not currently connected to an active project. Admins can assign you based on
                your technical skills.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => setActiveView('projects')}
                    className="group border border-slate-200 rounded-lg overflow-hidden hover:border-[#214FA2] transition-colors cursor-pointer bg-slate-50/50"
                  >
                    <div className="h-24 w-full overflow-hidden bg-slate-200 relative">
                      <img
                        src={proj.coverImage}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/90 text-slate-800">
                        {proj.status}
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-[#214FA2]">
                        {proj.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                        {proj.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Availability, Announcements & Resources */}
        <div className="space-y-6">
          {/* Availability Overview Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Weekly Availability</h3>
              <button
                onClick={() => setActiveView('availability')}
                className="text-xs font-semibold text-[#214FA2] hover:underline"
              >
                Edit
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Admin uses this schedule to coordinate task allocation and lab bench availability.
            </p>

            <div className="space-y-1.5 pt-1">
              {myAvailability?.weeklySchedule.slice(0, 5).map((sched) => (
                <div
                  key={sched.day}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50 border border-slate-100"
                >
                  <span className="font-semibold text-slate-700">{sched.day}</span>
                  {sched.isAvailable && sched.slots.length > 0 ? (
                    <span className="text-[11px] font-mono text-emerald-700">
                      {sched.slots[0].startTime} - {sched.slots[0].endTime}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Unavailable</span>
                  )}
                </div>
              ))}
            </div>

            {myAvailability?.temporaryNote && (
              <div className="text-[11px] p-2 bg-blue-50/60 rounded text-slate-700 border border-blue-100">
                <strong>Note:</strong> {myAvailability.temporaryNote}
              </div>
            )}
          </div>

          {/* Announcements Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-[#214FA2]" />
                <h3 className="font-bold text-sm text-slate-900">Centre Announcements</h3>
              </div>
              <button
                onClick={() => setActiveView('announcements')}
                className="text-xs font-semibold text-[#214FA2] hover:underline"
              >
                View
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {announcements.slice(0, 2).map((ann) => (
                <div key={ann.id} className="text-xs space-y-1 pb-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 line-clamp-1">{ann.title}</span>
                    {ann.pinned && (
                      <span className="text-[9px] uppercase font-bold text-amber-700 bg-amber-50 px-1 rounded shrink-0">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 line-clamp-2 leading-relaxed text-[11px]">
                    {ann.content}
                  </p>
                  <span className="text-[10px] text-slate-400 block">{ann.authorName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Community Guidelines & Assets */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 rounded-xl border border-blue-100 p-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <BookOpen className="w-4 h-4 text-[#214FA2]" />
              <span>Ambassador Resources</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Access the official IIC vector brand pack, operating handbook, and patent disclosure
              templates.
            </p>
            <button
              onClick={() => setActiveView('community')}
              className="w-full py-2 text-xs font-semibold text-[#214FA2] bg-white hover:bg-slate-50 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>Open Community Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
