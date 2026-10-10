import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Ambassador, AmbassadorStatus } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ExternalLink,
  Mail,
  CheckCircle,
  MoreVertical,
  X,
  Check,
  Edit2,
  Key,
  FileSpreadsheet,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { BulkAmbassadorModal } from './BulkAmbassadorModal';
import { DIU_DEPARTMENTS } from '../../data/departments';

export const AdminAmbassadorList: React.FC = () => {
  const {
    ambassadors,
    tasks,
    projects,
    getWeeklyMetrics,
    getOverallMetrics,
    updateAmbassadorStatus,
    createManualAmbassador,
    setSelectedAmbassadorId,
    setActiveView,
    openProfileEdit,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Bulk Ambassador Modal State
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  // Add Ambassador Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('iic#diu@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Software Engineering (SWE)');
  const [studentId, setStudentId] = useState('');
  const [batch, setBatch] = useState('61st Batch');
  const [group, setGroup] = useState('Innovation Wing');
  const [skillsStr, setSkillsStr] = useState('Python, IoT, System Architecture');
  const [bio, setBio] = useState('');

  // Credential Receipt Modal State (for single onboarding)
  const [createdReceipt, setCreatedReceipt] = useState<{
    name: string;
    email: string;
    password: string;
    ambassadorId: string;
  } | null>(null);
  const [copiedReceiptPassword, setCopiedReceiptPassword] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  const filteredAmbassadors = ambassadors.filter((amb) => {
    const matchesSearch =
      amb.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      amb.ambassadorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      amb.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = departmentFilter === 'All' ? true : amb.department.includes(departmentFilter);
    const matchesStatus = statusFilter === 'All' ? true : amb.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleAddAmbassador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    const assignedPassword = password.trim() || 'iic#diu@2026';

    const result = createManualAmbassador({
      fullName,
      email,
      phone,
      department,
      studentId: studentId || '221-35-000',
      batch,
      group,
      skills: skillsStr.split(',').map((s) => s.trim()).filter(Boolean),
      bio: bio || 'Student Ambassador at Industrial Innovation Centre (IIC).',
      status: 'Active',
      password: assignedPassword,
    });

    setAddModalOpen(false);

    if (result && result.ambassador) {
      setCreatedReceipt({
        name: result.ambassador.fullName,
        email: result.ambassador.email,
        password: result.password,
        ambassadorId: result.ambassador.ambassadorId,
      });
    }

    setFullName('');
    setEmail('');
    setPhone('');
    setBio('');
    setPassword('iic#diu@2026');
  };

  const handleOpenCV = (ambId: string) => {
    setSelectedAmbassadorId(ambId);
    setActiveView('public-profile');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Personnel & Governance</span>
            <span aria-hidden="true">·</span>
            <span>Ambassador Roster</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Ambassador Cohort Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Manage ambassador enrolments, active statuses, digital profiles, and onboarding
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-[#214FA2] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#214FA2]" />
            <span>Bulk Onboard (Table)</span>
          </button>

          <button
            onClick={() => {
              generateRandomPassword();
              setAddModalOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard Ambassador</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search name, ID, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden max-w-[200px] truncate"
          >
            <option value="All">All Departments</option>
            {DIU_DEPARTMENTS.map((dept) => (
              <option key={dept.name} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending Approval</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
            <option value="Completed Tenure">Completed Tenure</option>
          </select>
        </div>

        <span className="font-mono text-slate-500">
          Total: {filteredAmbassadors.length} Ambassadors
        </span>
      </div>

      {/* AMBASSADORS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Ambassador</th>
                <th className="p-3.5">Student ID & Batch</th>
                <th className="p-3.5">Wing / Group</th>
                <th className="p-3.5 font-mono">This Week</th>
                <th className="p-3.5 font-mono">Total Hours</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAmbassadors.map((amb) => {
                const weekly = getWeeklyMetrics(amb.id);
                const overall = getOverallMetrics(amb.id);
                const ambProjects = projects.filter((p) => p.connectedAmbassadorIds.includes(amb.id));

                return (
                  <tr key={amb.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 shrink-0">
                          <img
                            src={amb.avatarUrl}
                            alt={amb.fullName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{amb.fullName}</div>
                          <div className="text-[11px] text-slate-500">
                            {amb.department} · <span className="font-mono">{amb.ambassadorId}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-mono text-slate-800">{amb.studentId}</div>
                      <div className="text-[10px] text-slate-500">{amb.batch}</div>
                    </td>

                    <td className="p-3.5 text-slate-700">
                      <div>{amb.group || 'Innovation Wing'}</div>
                      <div className="text-[10px] text-slate-400">
                        {ambProjects.length} Projects Connected
                      </div>
                    </td>

                    <td className="p-3.5 font-mono font-bold">
                      <span
                        className={
                          weekly.completedHours >= 4.0 ? 'text-emerald-700' : 'text-amber-700'
                        }
                      >
                        {weekly.completedHours.toFixed(1)}h / 4h
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-slate-700">{overall.toFixed(1)} Hours</td>

                    <td className="p-3.5">
                      <select
                        value={amb.status}
                        onChange={(e) =>
                          updateAmbassadorStatus(amb.id, e.target.value as AmbassadorStatus)
                        }
                        className={`text-[11px] font-bold p-1 rounded border focus:outline-hidden ${
                          amb.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : amb.status === 'Suspended'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Completed Tenure">Completed Tenure</option>
                      </select>
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => openProfileEdit(amb.userId || amb.id)}
                        className="text-xs font-semibold text-slate-600 hover:text-[#214FA2] inline-flex items-center gap-1 p-1 hover:bg-slate-100 rounded transition-colors"
                        title="Edit Ambassador Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleOpenCV(amb.id)}
                        className="text-xs font-semibold text-[#214FA2] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Digital CV</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ONBOARD AMBASSADOR MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Onboard Student Ambassador</h3>
                <p className="text-xs text-slate-500">
                  Creates official ambassador credentials and dispatches onboarding welcome kit
                </p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAmbassador} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Nusrat Jahan"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    University Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nusrat.swe@diu.edu.bd"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1711 000000"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Account Password */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#214FA2]" />
                    <span>Account Password *</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] font-semibold text-[#214FA2] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate Strong</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full text-xs p-2.5 pr-10 font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Assigned login password for this ambassador. You can reset or update it at any time in User Management.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                  >
                    <option value="Software Engineering (SWE)">Software Engineering (SWE)</option>
                    <option value="Computer Science & Engineering (CSE)">CSE</option>
                    <option value="Multimedia & Creative Technology (MCT)">MCT</option>
                    <option value="Electrical & Electronic Engineering (EEE)">EEE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="221-35-900"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batch</label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="61st Batch"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skills & Technical Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="Embedded C, Python, React, Circuit Design"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Bio & Research Interest
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Specializes in smart campus IoT systems and renewable automation..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setBulkModalOpen(true);
                  }}
                  className="text-xs font-semibold text-[#214FA2] hover:underline flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Switch to Bulk Table Mode</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register Ambassador</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIAL RECEIPT POPUP (POST SINGLE CREATION) */}
      {createdReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Ambassador Account Created!</h3>
              <p className="text-xs text-slate-500 mt-1">
                <strong>{createdReceipt.name}</strong> has been enrolled and credentials are active.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Ambassador ID:</span>
                <span className="font-mono font-bold text-[#214FA2]">{createdReceipt.ambassadorId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-800">{createdReceipt.email}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Password:</span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-900">
                  {createdReceipt.password}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const text = `IIC Ambassador Credentials\nName: ${createdReceipt.name}\nAmbassador ID: ${createdReceipt.ambassadorId}\nEmail: ${createdReceipt.email}\nPassword: ${createdReceipt.password}`;
                  navigator.clipboard.writeText(text);
                  setCopiedReceiptPassword(true);
                  setTimeout(() => setCopiedReceiptPassword(false), 2000);
                }}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedReceiptPassword ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReceiptPassword ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatedReceipt(null)}
                className="flex-1 py-2 text-xs font-semibold bg-[#214FA2] hover:bg-[#1a3f85] text-white rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK AMBASSADOR TABLE MODAL */}
      <BulkAmbassadorModal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} />
    </div>
  );
};
