import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Check, Shield, User, UserPlus, KeyRound, LogOut } from 'lucide-react';

interface UserSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSwitchModal: React.FC<UserSwitchModalProps> = ({ isOpen, onClose }) => {
  const { allUsers, currentUser, switchUser, createManualAmbassador, setActiveView, logout, dispatchNotification } = useApp();

  const [activeTab, setActiveTab] = useState<'switch' | 'new-account' | 'forgot-password'>('switch');

  // New account form
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDepartment, setNewDepartment] = useState('Software Engineering (SWE)');
  const [newStudentId, setNewStudentId] = useState('');
  const [newBatch, setNewBatch] = useState('61st Batch');

  // Forgot password form
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSelectUser = (userId: string) => {
    switchUser(userId);
    setActiveView('dashboard');
    onClose();
  };

  const handleCreateNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail) return;

    createManualAmbassador({
      fullName: newFullName,
      email: newEmail,
      department: newDepartment,
      studentId: newStudentId || '221-35-999',
      batch: newBatch,
      status: 'Active',
    });

    dispatchNotification({
      title: 'Account Created',
      message: `Account created for ${newFullName}! Onboarding instructions dispatched to ${newEmail}.`,
      type: 'reminder',
    });
    setNewFullName('');
    setNewEmail('');
    setActiveTab('switch');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="font-bold text-base text-slate-900">Authentication & Role Switcher</h2>
            <p className="text-xs text-slate-500">
              Switch roles to evaluate Admin controls vs Ambassador experience
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-slate-50">
          <button
            onClick={() => setActiveTab('switch')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'switch'
                ? 'border-[#214FA2] text-[#214FA2]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Switch Active Profile
          </button>
          <button
            onClick={() => setActiveTab('new-account')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'new-account'
                ? 'border-[#214FA2] text-[#214FA2]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Ambassador
          </button>
          <button
            onClick={() => setActiveTab('forgot-password')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'forgot-password'
                ? 'border-[#214FA2] text-[#214FA2]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Password Recovery
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'switch' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600">
                Click any profile below to immediately switch session view:
              </div>

              {/* Admin profile */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Administrative Access (Role: ADMIN)
                </div>
                {allUsers
                  .filter((u) => u.role === 'ADMIN')
                  .map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user.id)}
                      className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                        currentUser.id === user.id
                          ? 'border-[#214FA2] bg-blue-50/50 ring-1 ring-[#214FA2]'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-900">{user.name}</div>
                          <div className="text-[11px] text-slate-500">{user.email} · Centre Director</div>
                        </div>
                      </div>
                      {currentUser.id === user.id && (
                        <span className="text-xs font-bold text-[#214FA2] flex items-center gap-1">
                          <Check className="w-4 h-4" /> Active
                        </span>
                      )}
                    </button>
                  ))}
              </div>

              {/* Ambassador profiles */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 mt-4">
                  Student Ambassadors (Role: AMBASSADOR)
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {allUsers
                    .filter((u) => u.role === 'AMBASSADOR')
                    .map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user.id)}
                        className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                          currentUser.id === user.id
                            ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-slate-900">{user.name}</div>
                            <div className="text-[11px] text-slate-500">
                              {user.email} {user.ambassadorId ? `· ${user.ambassadorId}` : ''}
                            </div>
                          </div>
                        </div>
                        {currentUser.id === user.id && (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <Check className="w-4 h-4" /> Active
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              </div>

              {/* Explicit Log Out Option */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between mt-3 bg-slate-50/80 -mx-6 -mb-6 p-4 rounded-b-xl">
                <div className="text-[11px] text-slate-500">
                  Signed in as: <span className="font-semibold text-slate-800">{currentUser.name}</span> ({currentUser.role})
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Log Out Session</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'new-account' && (
            <form onSubmit={handleCreateNewAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Shakib Al Hasan"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">DIU Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. student@diu.edu.bd"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-hidden"
                  >
                    <option value="Software Engineering (SWE)">Software Engineering (SWE)</option>
                    <option value="Computer Science & Engineering (CSE)">CSE</option>
                    <option value="Multimedia & Creative Technology (MCT)">MCT</option>
                    <option value="Electrical & Electronic Engineering (EEE)">EEE</option>
                    <option value="Information Technology & Management (ITM)">ITM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    placeholder="222-35-123"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register & Onboard Ambassador</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'forgot-password' && (
            <div className="space-y-4">
              {resetSent ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-xs space-y-2 border border-emerald-200">
                  <div className="font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Reset Email Dispatched!
                  </div>
                  <p>
                    A secure password reset link has been dispatched to <b>{resetEmail}</b>. Please check
                    your DIU academic inbox to proceed.
                  </p>
                  <button
                    onClick={() => {
                      setResetSent(false);
                      setActiveTab('switch');
                    }}
                    className="mt-2 text-xs font-semibold text-emerald-900 underline"
                  >
                    Back to Profile Switch
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Enter your registered university email to receive a password recovery verification token.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">University Email</label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="tanvir.ahmed@diu.edu.bd"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Send Password Reset Instructions</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
