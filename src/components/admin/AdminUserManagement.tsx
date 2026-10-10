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
} from 'lucide-react';
import { BulkAmbassadorModal } from './BulkAmbassadorModal';

export const AdminUserManagement: React.FC = () => {
  const {
    allUsers,
    createUser,
    deleteUser,
    resetUserPassword,
    updateUser,
    currentUser,
    openProfileEdit,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modals state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Create User Form State
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createRole, setCreateRole] = useState<UserRole>('AMBASSADOR');
  const [createPassword, setCreatePassword] = useState('iic#diu@2026');
  const [createDepartment, setCreateDepartment] = useState('Software Engineering (SWE)');
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
    setCreateDepartment('Software Engineering (SWE)');
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

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

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
              <option value="Inactive">Inactive</option>
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

                      {/* Status Toggle */}
                      <td className="p-3.5">
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
                  <option value="Software Engineering (SWE)">Software Engineering (SWE)</option>
                  <option value="Multimedia & Creative Technology (MCT)">Multimedia & Creative Technology (MCT)</option>
                  <option value="Computer Science & Engineering (CSE)">Computer Science & Engineering (CSE)</option>
                  <option value="Electrical & Electronic Engineering (EEE)">Electrical & Electronic Engineering (EEE)</option>
                  <option value="Industrial Innovation Centre (Admin)">Industrial Innovation Centre (Admin)</option>
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
