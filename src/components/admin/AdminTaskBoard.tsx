import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskCategory, TaskStatus, AmbassadorProfile } from '../../types';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Columns,
  List,
  Calendar,
  ExternalLink,
  MessageSquare,
  Check,
  X,
  AlertCircle,
  Clock,
  Send,
  Trash2,
  Edit2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

interface AmbassadorSelectorProps {
  ambassadors: AmbassadorProfile[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

const AmbassadorSelectorList: React.FC<AmbassadorSelectorProps> = ({
  ambassadors,
  selectedIds,
  onChange,
}) => {
  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const filtered = ambassadors.filter((amb) => {
    const q = query.toLowerCase();
    const matchesSearch =
      amb.fullName.toLowerCase().includes(q) ||
      (amb.studentId && amb.studentId.toLowerCase().includes(q)) ||
      amb.department.toLowerCase().includes(q) ||
      (amb.group && amb.group.toLowerCase().includes(q));

    const matchesDept = deptFilter === 'All' ? true : amb.department.includes(deptFilter);
    return matchesSearch && matchesDept;
  });

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    const allFilteredIds = filtered.map((a) => a.id);
    const merged = Array.from(new Set([...selectedIds, ...allFilteredIds]));
    onChange(merged);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-3 space-y-2.5">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="relative w-full sm:flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ambassadors by name, ID, dept..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#214FA2]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end text-[11px]">
          <span className="font-semibold text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
            {selectedIds.length} Selected
          </span>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-[#214FA2] hover:underline font-medium px-1.5 py-0.5"
          >
            Select All
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-slate-500 hover:text-slate-700 font-medium px-1.5 py-0.5"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Scrollable Ambassador List */}
      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-xs">
            No ambassadors matching "{query}"
          </div>
        ) : (
          filtered.map((amb) => {
            const isSelected = selectedIds.includes(amb.id);
            return (
              <div
                key={amb.id}
                onClick={() => handleToggle(amb.id)}
                className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                  isSelected ? 'bg-blue-50/60' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#214FA2] border-[#214FA2] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-3" />}
                  </div>
                  <img
                    src={amb.avatarUrl}
                    alt={amb.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{amb.fullName}</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {amb.department} {amb.studentId ? `• ${amb.studentId}` : ''}
                    </p>
                  </div>
                </div>

                {amb.group && (
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded shrink-0 hidden sm:inline-block">
                    {amb.group}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const AdminTaskBoard: React.FC = () => {
  const {
    tasks,
    ambassadors,
    projects,
    createTask,
    updateTask,
    updateTaskStatus,
    reviewTask,
    deleteTask,
    selectedTaskId,
    setSelectedTaskId,
  } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Create Task Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskInstructions, setTaskInstructions] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('Software Development');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
  const [taskProjectId, setTaskProjectId] = useState('');
  const [taskDeadline, setTaskDeadline] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [selectedAmbassadorIds, setSelectedAmbassadorIds] = useState<string[]>([]);

  // Edit Task Modal state
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editCategory, setEditCategory] = useState<TaskCategory>('Software Development');
  const [editPriority, setEditPriority] = useState<TaskPriority>('Medium');
  const [editStatus, setEditStatus] = useState<TaskStatus>('Assigned');
  const [editDeadline, setEditDeadline] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editAmbassadorIds, setEditAmbassadorIds] = useState<string[]>([]);

  // Delete Task Modal (Popup) state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Review Modal state
  const [reviewModalTask, setReviewModalTask] = useState<Task | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'revision' | 'reject'>('approve');

  const getAssignedNames = (task: Task) => {
    return task.assignedAmbassadorIds
      .map((id) => ambassadors.find((a) => a.id === id)?.fullName || id)
      .join(', ');
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const assignedNames = getAssignedNames(t);
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignedNames.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'All' ? true : t.category === categoryFilter;
    const matchesPriority = priorityFilter === 'All' ? true : t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' ? true : t.status === statusFilter;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || selectedAmbassadorIds.length === 0) {
      return;
    }

    createTask({
      title: taskTitle,
      description: taskDescription,
      instructions: taskInstructions || taskDescription,
      category: taskCategory,
      priority: taskPriority,
      deadline: taskDeadline,
      estimatedHours: 4.0, // Default allocation without requiring manual input
      projectId: taskProjectId || undefined,
      assignedAmbassadorIds: selectedAmbassadorIds,
    });

    setCreateModalOpen(false);
    setTaskTitle('');
    setTaskDescription('');
    setTaskInstructions('');
    setSelectedAmbassadorIds([]);
  };

  const handleOpenEditTask = (task: Task) => {
    setTaskToEdit(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditInstructions(task.instructions || task.description);
    setEditCategory(task.category);
    setEditPriority(task.priority);
    setEditStatus(task.status);
    setEditDeadline(task.deadline);
    setEditProjectId(task.projectId || '');
    setEditAmbassadorIds([...task.assignedAmbassadorIds]);
  };

  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToEdit || !editTitle || editAmbassadorIds.length === 0) return;

    updateTask(taskToEdit.id, {
      title: editTitle,
      description: editDescription,
      instructions: editInstructions,
      category: editCategory,
      priority: editPriority,
      status: editStatus,
      deadline: editDeadline,
      projectId: editProjectId || undefined,
      assignedAmbassadorIds: editAmbassadorIds,
    });

    setTaskToEdit(null);
  };

  const handleConfirmDeleteTask = () => {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    setTaskToDelete(null);
  };

  const handleOpenReview = (task: Task) => {
    setReviewModalTask(task);
    setReviewNotes('');
    setReviewDecision('approve');
  };

  const handleConfirmReview = () => {
    if (!reviewModalTask) return;

    if (reviewDecision === 'approve') {
      reviewTask(reviewModalTask.id, true, reviewNotes || 'Deliverables verified and accepted.');
    } else if (reviewDecision === 'revision') {
      reviewTask(reviewModalTask.id, false, reviewNotes || 'Revision required before approval.');
    } else {
      updateTaskStatus(reviewModalTask.id, 'Rejected', reviewNotes || 'Task submission rejected.');
    }

    setReviewModalTask(null);
  };

  // Kanban columns definition
  const KANBAN_COLS: { title: string; statuses: TaskStatus[]; color: string }[] = [
    { title: 'Assigned', statuses: ['Assigned'], color: 'border-slate-300' },
    {
      title: 'In Progress / Accepted',
      statuses: ['Accepted', 'In Progress', 'Revision Required'],
      color: 'border-blue-400',
    },
    {
      title: 'Under Review',
      statuses: ['Submitted', 'Under Review'],
      color: 'border-amber-400',
    },
    {
      title: 'Completed',
      statuses: ['Completed'],
      color: 'border-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#214FA2] tracking-wider uppercase">
            <CheckSquare className="w-4 h-4" />
            <span>Task Distribution & Review Board</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            IIC Ambassador Task Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch deliverables to ambassadors, inspect submissions, and credit verified hours to student scorecards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Kanban view"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table view"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, desc, or ambassador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-[#214FA2]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="All">All Categories</option>
              <option value="Software Development">Software Development</option>
              <option value="Hardware & Prototyping">Hardware & Prototyping</option>
              <option value="Content & Media">Content & Media</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Research & Documentation">Research & Documentation</option>
              <option value="Event & Logistics">Event & Logistics</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Assigned">Assigned</option>
              <option value="Accepted">Accepted</option>
              <option value="In Progress">In Progress</option>
              <option value="Submitted">Submitted (Review Needed)</option>
              <option value="Completed">Completed</option>
              <option value="Revision Required">Revision Required</option>
            </select>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {KANBAN_COLS.map((col) => {
            const colTasks = filteredTasks.filter((t) => col.statuses.includes(t.status));

            return (
              <div
                key={col.title}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div
                  className={`flex items-center justify-between pb-3 mb-3 border-b-2 ${col.color}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      {col.title}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.2 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks List in Column */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                      No tasks in this stage
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow space-y-2.5 relative group"
                      >
                        {/* Task Priority & Category */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                              task.priority === 'Urgent'
                                ? 'bg-red-100 text-red-700'
                                : task.priority === 'High'
                                ? 'bg-orange-100 text-orange-700'
                                : task.priority === 'Medium'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                          <span className="text-slate-600 text-[10px] truncate max-w-[120px] font-medium">
                            {task.category}
                          </span>
                        </div>

                        {/* Task Title */}
                        <h4 className="font-bold text-slate-900 text-xs leading-snug">
                          {task.title}
                        </h4>

                        {/* Task Description preview */}
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>

                        {/* Assignees & Deadline */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <div className="flex items-center gap-1 truncate max-w-[140px]" title={getAssignedNames(task)}>
                            <span className="font-medium text-slate-700 truncate">
                              {getAssignedNames(task)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 font-mono text-[10px] shrink-0">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{task.deadline}</span>
                          </div>
                        </div>

                        {/* Admin Action Triggers */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          {(task.status === 'Submitted' || task.status === 'Under Review') && (
                            <button
                              onClick={() => handleOpenReview(task)}
                              className="py-1 px-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded transition-colors text-center shadow-2xs"
                            >
                              Review Deliverable
                            </button>
                          )}

                          {task.status === 'Completed' && (
                            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Approved
                            </div>
                          )}

                          <div className="flex items-center gap-1 ml-auto">
                            <button
                              onClick={() => handleOpenEditTask(task)}
                              className="p-1 text-slate-400 hover:text-[#214FA2] hover:bg-slate-100 rounded transition-colors"
                              title="Edit task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setTaskToDelete(task)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="p-3.5 pl-5">Task Details</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Assigned To</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="font-bold text-slate-900">{task.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {task.description}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-700 font-medium">{task.category}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-800 font-medium">{getAssignedNames(task)}</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                          task.priority === 'Urgent'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'High'
                            ? 'bg-orange-100 text-orange-700'
                            : task.priority === 'Medium'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 text-[11px]">{task.deadline}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          task.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : task.status === 'Submitted'
                            ? 'bg-amber-100 text-amber-800'
                            : task.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right space-x-1.5">
                      {(task.status === 'Submitted' || task.status === 'Under Review') && (
                        <button
                          onClick={() => handleOpenReview(task)}
                          className="px-2 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded transition-colors"
                        >
                          Review
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEditTask(task)}
                        className="p-1.5 text-slate-500 hover:text-[#214FA2] hover:bg-slate-100 rounded transition-colors"
                        title="Edit task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTaskToDelete(task)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-6 border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#214FA2]" />
                <h3 className="font-bold text-base text-slate-900">Assign New Task to Ambassador(s)</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Build Firmware Drivers for Smart Water Sensor Hub"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Context *
                </label>
                <textarea
                  rows={2}
                  required
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Outline the core objective and what research or implementation is needed..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Step-by-Step Instructions & Deliverables
                </label>
                <textarea
                  rows={3}
                  value={taskInstructions}
                  onChange={(e) => setTaskInstructions(e.target.value)}
                  placeholder="1. Review sensor specs&#10;2. Create wireframes&#10;3. Export prototype repository..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline *</label>
                  <input
                    type="date"
                    required
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Connect with IIC Project (Optional)
                </label>
                <select
                  value={taskProjectId}
                  onChange={(e) => setTaskProjectId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                >
                  <option value="">-- No Project (General Centre Task) --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee Selection with Scalable Searchable List */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign to Ambassador(s) *
                </label>
                <AmbassadorSelectorList
                  ambassadors={ambassadors}
                  selectedIds={selectedAmbassadorIds}
                  onChange={setSelectedAmbassadorIds}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedAmbassadorIds.length === 0}
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors ${
                    selectedAmbassadorIds.length === 0
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-[#214FA2] hover:bg-[#1a3f85]'
                  }`}
                >
                  Create & Dispatch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {taskToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-6 border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#214FA2]" />
                <h3 className="font-bold text-base text-slate-900">Edit Task Details</h3>
              </div>
              <button
                onClick={() => setTaskToEdit(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} className="overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Context *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Step-by-Step Instructions
                </label>
                <textarea
                  rows={3}
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as TaskCategory)}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                  >
                    <option value="Assigned">Assigned</option>
                    <option value="Accepted">Accepted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Revision Required">Revision Required</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    required
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Connected Project
                </label>
                <select
                  value={editProjectId}
                  onChange={(e) => setEditProjectId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                >
                  <option value="">-- No Project (General Task) --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Ambassadors *
                </label>
                <AmbassadorSelectorList
                  ambassadors={ambassadors}
                  selectedIds={editAmbassadorIds}
                  onChange={setEditAmbassadorIds}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setTaskToEdit(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editAmbassadorIds.length === 0}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg shadow-xs"
                >
                  Save Task Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TASK CONFIRMATION POPUP MODAL */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Delete Task Confirmation
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to permanently delete task <strong className="text-slate-900 font-semibold">"{taskToDelete.title}"</strong>?
            </p>

            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-600">
              <div>Category: <span className="font-semibold text-slate-800">{taskToDelete.category}</span></div>
              <div>Assigned to: <span className="font-semibold text-slate-800">{getAssignedNames(taskToDelete)}</span></div>
              <div>Status: <span className="font-semibold text-slate-800">{taskToDelete.status}</span></div>
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              This will remove the task and any submissions from ambassadors. This action cannot be reversed.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTask}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm & Delete Task</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW SUBMISSION MODAL */}
      {reviewModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900">Review Task Deliverable</h3>
                <p className="text-xs text-slate-500">
                  Verify output quality and credit hours to the ambassador scorecard
                </p>
              </div>
              <button
                onClick={() => setReviewModalTask(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div>
                Task: <strong className="text-slate-900">{reviewModalTask.title}</strong>
              </div>
              <div>
                Submitted By:{' '}
                <strong className="text-slate-900">
                  {reviewModalTask.submission?.submittedByName || getAssignedNames(reviewModalTask)}
                </strong>
              </div>
              <div>
                Logged Time: <strong className="font-mono text-[#214FA2]">{reviewModalTask.actualHours} Hours</strong>
              </div>

              {reviewModalTask.submission?.notes && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Ambassador Submission Notes:
                  </span>
                  <p className="text-slate-800 whitespace-pre-line mt-0.5">
                    {reviewModalTask.submission.notes}
                  </p>
                </div>
              )}

              {reviewModalTask.submission?.deliverableLinks &&
                reviewModalTask.submission.deliverableLinks.length > 0 && (
                  <div className="pt-1">
                    <a
                      href={reviewModalTask.submission.deliverableLinks[0]}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-[#214FA2] hover:underline flex items-center gap-1"
                    >
                      <span>Open Submitted Artifact</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Review Decision *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReviewDecision('approve')}
                  className={`p-2 rounded-lg text-xs font-semibold border transition-colors ${
                    reviewDecision === 'approve'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  ✓ Approve Deliverable
                </button>
                <button
                  type="button"
                  onClick={() => setReviewDecision('revision')}
                  className={`p-2 rounded-lg text-xs font-semibold border transition-colors ${
                    reviewDecision === 'revision'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 ring-1 ring-amber-500'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  ↺ Request Revision
                </button>
                <button
                  type="button"
                  onClick={() => setReviewDecision('reject')}
                  className={`p-2 rounded-lg text-xs font-semibold border transition-colors ${
                    reviewDecision === 'reject'
                      ? 'bg-red-50 border-red-500 text-red-800 ring-1 ring-red-500'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  ✗ Reject
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Feedback / Review Comments
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add constructive guidance or praise for the student ambassador..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewModalTask(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReview}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors"
              >
                Save Review & Notify Ambassador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
