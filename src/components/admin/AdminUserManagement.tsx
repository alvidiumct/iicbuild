import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Trash2,
  Edit2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Lock,
  FileSpreadsheet,
  Clock,
  GraduationCap,
  Camera,
} from 'lucide-react';
import { BulkAmbassadorModal } from './BulkAmbassadorModal';
import { DIU_DEPARTMENTS, DIU_FACULTIES } from '../../data/departments';

export const AdminUserManagement: React.FC = () => {
  const {
    allUsers,
    createUser,
    deleteUser,
    resetUserPassword,
    updateUser,
    currentUser,
    openProfileEdit,
    approveAmbassadorApplication,
    rejectAmbassadorApplication,
    pendingApplicationsCount,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Pending' | 'Rejected'>('All');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Modals state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Rejection modal
  const [rejectingUser, setRejectingUser] = useState<User | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Create User Form State
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createRole, setCreateRole] = useState<UserRole>('AMBASSADOR');
  const [createPassword, setCreatePassword] = useState('iic#diu@2026');
  const [createDepartment, setCreateDepartment] = useState(DIU_DEPARTMENTS[0].name);
  const [createStudentId, setCreateStudentId] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createStatus, setCreateStatus] = useState<'Active' | 'Inactive'>('Active');
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Reset Password State
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  // Filtered Users
  const filteredUsers = allUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.studentId && u.studentId.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'All' ? true : u.role === roleFilter;
    const matchesStatus = statusFilter === 'All' ? true : (u.status || 'Active') === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats calculation
  const totalUsers = allUsers.length;
  const adminCount = allUsers.filter((u) => u.role === 'ADMIN').length;
  const ambassadorCount = allUsers.filter((u) => u.role === 'AMBASSADOR').length;
  const activeCount = allUsers.filter((u) => (u.status || 'Active') === 'Active').length;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleOpenCreateModal = () => {
    setCreateName('');
    setCreateEmail('');
    setCreateRole('AMBASSADOR');
    setCreatePassword(generateRandomPassword());
    setCreateDepartment(DIU_DEPARTMENTS[0].name);
    setCreateStudentId('');
    setCreatePhone('');
    setCreateStatus('Active');
    setIsCreateModalOpen(true);
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName || !createEmail) return;

    createUser({
      name: createName,
      email: createEmail,
      role: createRole,
      password: createPassword,
      department: createDepartment,
      studentId: createRole === 'AMBASSADOR' ? createStudentId : undefined,
      phone: createPhone,
      status: createStatus,
    });

    setIsCreateModalOpen(false);
  };

  const handleOpenResetPassword = (user: User) => {
    setUserToResetPassword(user);
    setNewPasswordVal(generateRandomPassword());
    setCopiedPassword(false);
    setResetSuccessMessage('');
  };

  const handleConfirmResetPassword = () => {
    if (!userToResetPassword) return;
    resetUserPassword(userToResetPassword.id, newPasswordVal);
    setResetSuccessMessage(`Password updated for ${userToResetPassword.name}`);
    setTimeout(() => {
      setUserToResetPassword(null);
      setResetSuccessMessage('');
    }, 1200);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(newPasswordVal);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    deleteUser(userToDelete.id);
    setUserToDelete(null);
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = (user.status || 'Active') === 'Active' ? 'Inactive' : 'Active';
    updateUser(user.id, { status: newStatus });
  };

  const handleApprove = (userId: string) => {
    approveAmbassadorApplication(userId);
    setActionFeedback('Ambassador application approved successfully! ID assigned and account activated.');
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleOpenReject = (user: User) => {
    setRejectingUser(user);
    setRejectReason('Does not meet current cohort academic/credit criteria.');
  };

  const handleConfirmReject = () => {
    if (!rejectingUser) return;
    rejectAmbassadorApplication(rejectingUser.id, rejectReason);
    setActionFeedback(`Application for ${rejectingUser.name} has been rejected.`);
    setRejectingUser(null);
    setRejectReason('');
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const pendingUsers = allUsers.filter((u) => u.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#214FA2] tracking-wider uppercase">
            <Shield className="w-4 h-4" />
            <span>Identity & Access Control</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            User & Role Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provision user accounts with initial passwords, reset credentials, configure roles, and audit account access.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#214FA2] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl shadow-2xs transition-colors shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#214FA2]" />
            <span>Bulk Table Onboard</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-xl shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{totalUsers}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Platform registered accounts</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Administrators</p>
          <p className="text-2xl font-bold text-[#214FA2] mt-1 font-mono">{adminCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Centre governance & directors</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Ambassadors</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{ambassadorCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Undergrad students across depts</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Active Accounts</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {activeCount} <span className="text-xs font-normal text-slate-400">/ {totalUsers}</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Authorized for system log-in</p>
        </div>

        <div
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-xl border shadow-xs cursor-pointer transition-all ${
            pendingApplicationsCount > 0
              ? 'bg-amber-50/80 border-amber-300 hover:bg-amber-100/80'
              : 'bg-white border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-900">Pending Review</p>
            {pendingApplicationsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-1 font-mono">
            {pendingApplicationsCount}
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">
            {pendingApplicationsCount > 0 ? 'Click to review & approve' : 'No signups awaiting review'}
          </p>
        </div>
      </div>

      {/* Primary Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-[#214FA2] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({allUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Ambassador Applications</span>
          {pendingApplicationsCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'pending'
                  ? 'bg-amber-800 text-white'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {pendingApplicationsCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'pending' ? (
        // PENDING AMBASSADOR APPLICATIONS REVIEW SECTION
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <span className="font-bold">Ambassador Approval Workflow:</span> Students who register on the public portal must be approved by Centre Administration before they can log in. Upon approval, they receive an official IIC Ambassador ID, their account is activated, and they can immediately set their weekly duty availability schedule.
            </div>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                All Ambassador Applications are Reviewed
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                There are currently no new student ambassador registrations awaiting administrative approval. New applications will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingUsers.map((applicant) => (
                <div
                  key={applicant.id}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 space-y-4 hover:border-slate-300 transition-colors"
                >
                  {/* Card Top: Photo & Basic Details */}
                  <div className="flex items-start gap-4 pb-3 border-b border-slate-100">
                    <div className="relative group shrink-0">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-xs">
                        <img
                          src={applicant.avatarUrl}
                          alt={applicant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute -bottom-1.5 -right-1.5 bg-amber-500 text-white p-1 rounded-full text-[9px] shadow-xs" title="Formal portrait submitted">
                        <Camera className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {applicant.name}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold shrink-0">
                          Pending
                        </span>
                      </div>

                      <div className="text-xs font-mono font-semibold text-[#214FA2] mt-0.5">
                        ID: {applicant.studentId || 'N/A'}
                      </div>

                      <div className="text-xs text-slate-700 font-medium truncate mt-0.5">
                        {applicant.department}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>{applicant.batch || 'Batch N/A'}</span>
                        <span>•</span>
                        <span>{applicant.semester || 'Semester N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Middle: Contact & Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">DIU Email</span>
                      <span className="font-mono text-slate-800 truncate block">
                        {applicant.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Contact Phone</span>
                      <span className="font-mono text-slate-800 truncate block">
                        {applicant.phone || 'Not provided'}
                      </span>
                    </div>
                    {applicant.registeredAt && (
                      <div className="col-span-2 pt-1 text-[11px] text-slate-500">
                        Submitted: {new Date(applicant.registeredAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {applicant.bio && (
                    <div className="text-xs text-slate-600 bg-blue-50/40 p-2.5 rounded-lg border border-blue-100/60">
                      <span className="font-semibold text-slate-700">Statement: </span>
                      {applicant.bio}
                    </div>
                  )}

                  {applicant.skills && applicant.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {applicant.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenReject(applicant)}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer"
                    >
                      Reject Application
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(applicant.id)}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Grant Access</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // USER DIRECTORY TABLE VIEW
        <>
          {/* Filter and Search Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-[#214FA2]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="All">All Roles</option>
                  <option value="ADMIN">Admin Only</option>
                  <option value="AMBASSADOR">Ambassador Only</option>
                </select>
              </div>

              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending Approval</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="p-3.5 pl-5">User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Department / ID</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Credentials</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    No users matching the filters found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isActive = (user.status || 'Active') === 'Active';
                  const isCurrent = user.id === currentUser.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* User Info */}
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatarUrl || '/src/assets/images/avatar_ambassador_lead_1790178208374.jpg'}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-semibold bg-blue-100 text-[#214FA2] px-1.5 py-0.2 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 font-mono text-[11px]">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-blue-100 text-[#214FA2] border border-blue-200'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          <span>{user.role}</span>
                        </span>
                      </td>

                      {/* Department / ID */}
                      <td className="p-3.5">
                        <div className="text-slate-800 font-medium">
                          {user.department || (user.role === 'ADMIN' ? 'Centre Administration' : 'Software Engineering')}
                        </div>
                        {user.studentId && (
                          <div className="text-slate-500 font-mono text-[11px]">ID: {user.studentId}</div>
                        )}
                      </td>

                      {/* Status Toggle / Actions */}
                      <td className="p-3.5">
                        {user.status === 'Pending' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleApprove(user.id)}
                              className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] shadow-2xs transition-colors cursor-pointer"
                              title="Approve immediately"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenReject(user)}
                              className="px-1.5 py-0.5 rounded border border-red-300 hover:bg-red-50 text-red-600 font-semibold text-[10px] transition-colors cursor-pointer"
                              title="Reject application"
                            >
                              Reject
                            </button>
                          </div>
                        ) : user.status === 'Rejected' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Rejected</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                            }`}
                            title="Click to toggle status"
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-slate-500" />
                                <span>Inactive</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      {/* Credentials */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400 text-xs tracking-wider">
                            ••••••••
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenResetPassword(user)}
                            className="text-[#214FA2] hover:text-[#1a3f85] font-semibold text-[11px] inline-flex items-center gap-1 p-1 hover:bg-blue-50 rounded"
                            title="Reset password"
                          >
                            <Key className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openProfileEdit(user.id)}
                            className="p-1.5 text-slate-600 hover:text-[#214FA2] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit profile & details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={isCurrent}
                            onClick={() => setUserToDelete(user)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrent
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title={isCurrent ? 'Cannot delete logged in user' : 'Delete user account'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* REJECT APPLICATION CONFIRMATION MODAL */}
      {rejectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Reject Ambassador Application?
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to reject the application submitted by{' '}
              <strong className="text-slate-900">{rejectingUser.name}</strong> (Student ID:{' '}
              {rejectingUser.studentId || 'N/A'})?
            </p>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Rejection
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain reason for rejection..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setRejectingUser(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#214FA2]">
                <UserPlus className="w-4 h-4" />
                <span>Account Provisioning</span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="mt-4 space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Create New User Account</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Mahir Faysal"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="name@diu.edu.bd"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    System Role *
                  </label>
                  <select
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value as UserRole)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                  >
                    <option value="AMBASSADOR">Ambassador</option>
                    <option value="ADMIN">Centre Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={createStatus}
                    onChange={(e) => setCreateStatus(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {createRole === 'AMBASSADOR' && (
                <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg text-xs text-[#214FA2] flex items-center justify-between">
                  <span>Need to add multiple ambassadors?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setIsBulkModalOpen(true);
                    }}
                    className="font-semibold underline hover:text-[#1a3f85] flex items-center gap-1"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Open Bulk Table Format</span>
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Unit *
                </label>
                <select
                  value={createDepartment}
                  onChange={(e) => setCreateDepartment(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                >
                  <option value="Industrial Innovation Centre (Admin)">Industrial Innovation Centre (Admin)</option>
                  {DIU_FACULTIES.map((faculty) => (
                    <optgroup key={faculty} label={faculty}>
                      {DIU_DEPARTMENTS.filter((d) => d.faculty === faculty).map((dept) => (
                        <option key={dept.name} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {createRole === 'AMBASSADOR' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={createStudentId}
                    onChange={(e) => setCreateStudentId(e.target.value)}
                    placeholder="e.g. 223-35-999"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden font-mono"
                  />
                </div>
              )}

              {/* Initial Password Section */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Initial Password *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCreatePassword(generateRandomPassword())}
                    className="text-[11px] text-[#214FA2] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate Random</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showCreatePassword ? 'text' : 'password'}
                    required
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full text-xs p-2.5 pr-9 rounded-lg border border-slate-300 focus:outline-hidden font-mono bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  User can sign in with this password and change it subsequently.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg shadow-xs"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD POPUP MODAL */}
      {userToResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#214FA2]">
                <Key className="w-4 h-4" />
                <span>Password Reset</span>
              </div>
              <button
                onClick={() => setUserToResetPassword(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Reset Password for {userToResetPassword.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {userToResetPassword.email}
                </p>
              </div>

              {resetSuccessMessage ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resetSuccessMessage}</span>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        New Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewPasswordVal(generateRandomPassword())}
                        className="text-[11px] text-[#214FA2] hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Generate Random</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newPasswordVal}
                        onChange={(e) => setNewPasswordVal(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono font-semibold text-slate-900 bg-slate-50"
                      />
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="px-3 py-2.5 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1 shrink-0"
                        title="Copy password"
                      >
                        {copiedPassword ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-600" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Make sure to securely share this new credential with {userToResetPassword.name}.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setUserToResetPassword(null)}
                      className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmResetPassword}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg shadow-xs flex items-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Save New Password</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION POPUP MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Delete User Account?
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-slate-900">{userToDelete.name}</strong> ({userToDelete.email}) from the platform?
            </p>
            <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              This will revoke their login access, remove active task assignments, and archive their digital profile. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm & Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Ambassador Modal */}
      <BulkAmbassadorModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} />
    </div>
  );
};
