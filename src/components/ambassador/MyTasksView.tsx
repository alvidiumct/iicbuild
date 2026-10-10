import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus, TaskCategory } from '../../types';
import {
  CheckSquare,
  Search,
  Filter,
  Play,
  Clock,
  Send,
  PlusCircle,
  ExternalLink,
  Paperclip,
  CheckCircle,
  AlertCircle,
  X,
  History,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

export const MyTasksView: React.FC = () => {
  const {
    currentAmbassador,
    tasks,
    punchIn,
    activeTimer,
    updateTaskStatus,
    submitTask,
    createCustomTask,
    selectedTaskId,
    setSelectedTaskId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modals state
  const [submissionModalTaskId, setSubmissionModalTaskId] = useState<string | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');

  const [customTaskModalOpen, setCustomTaskModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customCategory, setCustomCategory] = useState<TaskCategory>('Software Development');
  const [customHours, setCustomHours] = useState(3.0);
  const [customLink, setCustomLink] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  const ambassador = currentAmbassador;
  if (!ambassador) {
    return <div className="p-8 text-center text-slate-500">Please select an ambassador user.</div>;
  }

  // Filter tasks assigned to this ambassador
  const myTasks = tasks.filter((t) => t.assignedAmbassadorIds.includes(ambassador.id));

  const filteredTasks = myTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Pending Acceptance'
        ? task.status === 'Assigned'
        : statusFilter === 'Active'
        ? task.status === 'Accepted' || task.status === 'In Progress' || task.status === 'Revision Required'
        : statusFilter === 'Submitted'
        ? task.status === 'Submitted' || task.status === 'Under Review'
        : statusFilter === 'Completed'
        ? task.status === 'Completed'
        : true;

    const matchesCategory = categoryFilter === 'All' ? true : task.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null;

  const handleSubmitTaskForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionModalTaskId) return;

    submitTask(submissionModalTaskId, {
      notes: submissionNotes,
      deliverableLinks: submissionLink ? [submissionLink] : [],
    });

    setSubmissionModalTaskId(null);
    setSubmissionNotes('');
    setSubmissionLink('');
  };

  const handleCreateCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customDescription) return;

    createCustomTask({
      title: customTitle,
      description: customDescription,
      category: customCategory,
      estimatedHours: Number(customHours),
      deliverableLinks: customLink ? [customLink] : [],
      notes: customNotes || 'Self-initiated innovation task submitted for admin review.',
    });

    setCustomTaskModalOpen(false);
    setCustomTitle('');
    setCustomDescription('');
    setCustomLink('');
    setCustomNotes('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Core Objective</span>
            <span aria-hidden="true">·</span>
            <span>Task Distribution & Execution</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            My Assigned Tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Accept, punch in time, and submit deliverables for administrative review
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCustomTaskModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-[#214FA2] bg-white border border-[#214FA2]/30 hover:bg-[#214FA2]/5 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Custom Task</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Interactive Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {['All', 'Active', 'Pending Acceptance', 'Submitted', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="Software Development">Software Development</option>
            <option value="Hardware & Prototyping">Hardware & Prototyping</option>
            <option value="Content & Media">Content & Media</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Event & Logistics">Event & Logistics</option>
            <option value="Research & Documentation">Research & Documentation</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#214FA2]"
            />
          </div>
        </div>
      </div>

      {/* Task List / Grid */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 space-y-2">
          <CheckSquare className="w-8 h-8 mx-auto opacity-30 text-[#214FA2]" />
          <p className="text-sm font-semibold text-slate-700">No tasks found matching current filter</p>
          <p className="text-xs text-slate-500">
            Switch filter tabs or submit a self-initiated task to credit your weekly contribution.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const isTimerRunning = activeTimer?.taskId === task.id;

            return (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Unboxed Metadata & Status */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-1.5 truncate mr-2">
                      <span className="font-semibold text-slate-700">{task.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>Due: {task.deadline}</span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                        task.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : task.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700'
                          : task.status === 'Submitted'
                          ? 'bg-amber-50 text-amber-800'
                          : task.status === 'Revision Required'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedTaskId(task.id)}
                    className="font-bold text-sm text-slate-900 hover:text-[#214FA2] cursor-pointer mb-1.5 leading-snug line-clamp-2"
                  >
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {task.description}
                  </p>

                  {task.projectTitle && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-3">
                      <span>Project:</span>
                      <strong className="text-slate-800 truncate">{task.projectTitle}</strong>
                    </div>
                  )}

                  {/* Hours Metric Strip */}
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-600 py-2 border-y border-slate-100 mb-4">
                    <div>
                      Est: <strong className="text-slate-900">{task.estimatedHours}h</strong>
                    </div>
                    <div>·</div>
                    <div>
                      Logged: <strong className="text-[#214FA2]">{task.actualHours}h</strong>
                    </div>
                    <div>·</div>
                    <div>
                      Priority: <span className="font-sans font-semibold">{task.priority}</span>
                    </div>
                  </div>
                </div>

                {/* Task Action Bar */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => setSelectedTaskId(task.id)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Details & Audit ({task.auditTrail.length})
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Status Actions */}
                    {task.status === 'Assigned' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'Accepted', 'Task accepted by ambassador')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        Accept Task
                      </button>
                    )}

                    {(task.status === 'Accepted' ||
                      task.status === 'In Progress' ||
                      task.status === 'Revision Required') && (
                      <>
                        {isTimerRunning ? (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                            Timer Active
                          </span>
                        ) : (
                          <button
                            onClick={() => punchIn(task.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-2xs"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Punch In</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSubmissionModalTaskId(task.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors shadow-2xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit</span>
                        </button>
                      </>
                    )}

                    {task.status === 'Submitted' && (
                      <span className="text-xs text-amber-700 font-medium">Awaiting Admin Review</span>
                    )}

                    {task.status === 'Completed' && (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Approved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TASK DETAIL DRAWER / MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setSelectedTaskId(null)}
          />
          <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl flex flex-col border-l border-slate-200 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{selectedTask.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>Due: {selectedTask.deadline}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-bold text-slate-700">{selectedTask.priority} Priority</span>
                </div>
                <h2 className="font-bold text-base text-slate-900 leading-snug">
                  {selectedTask.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTaskId(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Instructions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Detailed Instructions & Brief
                </h4>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedTask.instructions || selectedTask.description}
                </div>
              </div>

              {/* Assignment Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[10px] uppercase">Assigned By</span>
                  <strong className="text-slate-900 font-semibold">
                    {selectedTask.assignedByAdminName}
                  </strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[10px] uppercase">Estimated Hours</span>
                  <strong className="text-slate-900 font-mono">
                    {selectedTask.estimatedHours} Hours
                  </strong>
                </div>
              </div>

              {/* Attachments / External Links */}
              {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Attached Files & References
                  </h4>
                  <div className="space-y-2">
                    {selectedTask.attachments.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-800">{file.name}</span>
                          <span className="text-slate-500 text-[10px]">({file.size})</span>
                        </div>
                        <a
                          href={file.url}
                          className="text-[#214FA2] hover:underline font-semibold text-[11px]"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submissions & Admin Feedback */}
              {selectedTask.submission && (
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-blue-900 font-bold">
                    <span>Submitted Deliverable</span>
                    <span className="font-normal text-[11px] text-slate-500">
                      {new Date(selectedTask.submission.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedTask.submission.notes}
                  </p>
                  {selectedTask.submission.deliverableLinks &&
                    selectedTask.submission.deliverableLinks.length > 0 && (
                      <div className="pt-1">
                        <a
                          href={selectedTask.submission.deliverableLinks[0]}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-[#214FA2] hover:underline flex items-center gap-1"
                        >
                          <span>Open Deliverable Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                </div>
              )}

              {selectedTask.reviewNotes && (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 space-y-1">
                  <div className="text-xs text-emerald-900 font-bold flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" /> Admin Review Remarks
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    "{selectedTask.reviewNotes}" — {selectedTask.reviewedByAdminName}
                  </p>
                </div>
              )}

              {/* Task Timeline / Audit Trail */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <History className="w-4 h-4" /> Task Timeline & Audit Trail
                </h4>
                <div className="border-l-2 border-slate-200 pl-4 space-y-3 pt-1">
                  {selectedTask.auditTrail.map((item) => (
                    <div key={item.id} className="relative text-xs">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 ring-2 ring-white" />
                      <div className="font-semibold text-slate-900">
                        {item.action}{' '}
                        <span className="font-normal text-slate-500">by {item.actorName}</span>
                      </div>
                      {item.note && <p className="text-slate-600 text-[11px] mt-0.5">{item.note}</p>}
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION MODAL */}
      {submissionModalTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base text-slate-900">Submit Task Deliverables</h3>
              <button
                onClick={() => setSubmissionModalTaskId(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTaskForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deliverable Summary & Submission Notes *
                </label>
                <textarea
                  required
                  rows={4}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Detail your work, test findings, code commits, or design iterations..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deliverable URL (GitHub / Figma / Google Drive / Live Demo)
                </label>
                <input
                  type="url"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="https://github.com/diu-iic/..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmissionModalTaskId(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit For Administrative Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM / SELF-INITIATED TASK MODAL */}
      {customTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Submit Self-Initiated Task</h3>
                <p className="text-xs text-slate-500">
                  Propose custom innovation work to credit towards your 4-hour weekly goal
                </p>
              </div>
              <button
                onClick={() => setCustomTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Developed Automated Telegram Bot for Lab Alerts"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description of Innovation / Work Done *
                </label>
                <textarea
                  required
                  rows={3}
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Explain why this was initiated, what problem it solves, and how it benefits IIC..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as TaskCategory)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                  >
                    <option value="Software Development">Software Development</option>
                    <option value="Hardware & Prototyping">Hardware & Prototyping</option>
                    <option value="Content & Media">Content & Media</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Research & Documentation">Research & Documentation</option>
                    <option value="Event & Logistics">Event & Logistics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hours Expended *
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.5"
                    max="10"
                    required
                    value={customHours}
                    onChange={(e) => setCustomHours(parseFloat(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supporting Deliverable / Repository Link
                </label>
                <input
                  type="url"
                  value={customLink}
                  onChange={(e) => setCustomLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors"
                >
                  Submit For Admin Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
