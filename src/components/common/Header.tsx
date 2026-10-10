import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Users,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  UserCog,
  LogOut,
  Shield,
  User,
  Sparkles,
  LogIn,
  Award,
  UserPlus,
  Settings,
} from 'lucide-react';
import { IICLogo } from './IICLogo';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenNotifications: () => void;
  onOpenUserSwitch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenNotifications,
  onOpenUserSwitch,
}) => {
  const {
    currentUser,
    currentAmbassador,
    notifications,
    setActiveView,
    activeView,
    setSelectedAmbassadorId,
    openProfileEdit,
    logout,
    isAuthenticated,
    setPublicVerifyCertificateId,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenMyProfile = () => {
    if (currentAmbassador) {
      setSelectedAmbassadorId(currentAmbassador.id);
      setActiveView('public-profile');
    }
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        {/* Zone 1: Brand title, one line */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden cursor-pointer"
            title="Go to Homepage"
          >
            <IICLogo size="sm" />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900 leading-none">
                IIC Ambassador Platform
              </span>
              <span className="text-[10px] text-slate-500 font-medium leading-tight">
                Daffodil International University
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Contextual Navigation Links */}
        {isAuthenticated ? (
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveView('home')}
              className={`transition-colors hover:text-slate-900 ${
                activeView === 'home' || activeView === 'homepage' ? 'text-[#214FA2] font-bold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveView('dashboard')}
              className={`transition-colors hover:text-slate-900 ${
                activeView === 'dashboard' ? 'text-[#214FA2] font-bold' : ''
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => setActiveView(currentUser.role === 'ADMIN' ? 'admin-tasks' : 'tasks')}
              className={`transition-colors hover:text-slate-900 ${
                activeView.includes('task') ? 'text-[#214FA2] font-bold' : ''
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() =>
                setActiveView(currentUser.role === 'ADMIN' ? 'admin-contribution' : 'time-tracker')
              }
              className={`transition-colors hover:text-slate-900 ${
                activeView.includes('time') || activeView.includes('contribution')
                  ? 'text-[#214FA2] font-bold'
                  : ''
              }`}
            >
              Contributions
            </button>
            <button
              onClick={() => setActiveView('projects')}
              className={`transition-colors hover:text-slate-900 ${
                activeView === 'projects' ? 'text-[#214FA2] font-bold' : ''
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveView('community')}
              className={`transition-colors hover:text-slate-900 ${
                activeView === 'community' ? 'text-[#214FA2] font-bold' : ''
              }`}
            >
              Community
            </button>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveView('home')}
              className={`transition-colors hover:text-slate-900 ${
                activeView === 'home' || activeView === 'homepage' ? 'text-[#214FA2] font-bold' : ''
              }`}
            >
              Home & Showcase
            </button>
            <button
              onClick={() => setActiveView('projects')}
              className={`transition-colors hover:text-slate-900 ${
                activeView === 'projects' ? 'text-[#214FA2] font-bold' : ''
              }`}
            >
              R&D Projects
            </button>
            <button
              onClick={() => {
                setActiveView('home');
                setTimeout(() => {
                  const el = document.getElementById('ambassadors-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="transition-colors hover:text-slate-900"
            >
              Ambassadors
            </button>
            <button
              onClick={() => setPublicVerifyCertificateId('CERT-2026-001')}
              className="transition-colors hover:text-slate-900"
            >
              Verify Certificate
            </button>
          </nav>
        )}

        {/* Zone 3: Primary Actions & User Role Switcher */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Notifications */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
              )}
            </button>

            {/* Interactive User Menu Popover */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-slate-800 transition-colors focus:outline-hidden"
                title="Account Menu & Profile Actions"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentUser.role === 'ADMIN' ? 'bg-indigo-600' : 'bg-emerald-600'
                    }`}
                  />
                  <span className="font-semibold text-slate-900 truncate max-w-[100px] sm:max-w-[130px]">
                    {currentUser.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                  {currentUser.role}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  {/* User Identity info */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          currentUser.role === 'ADMIN' ? 'bg-indigo-600' : 'bg-emerald-600'
                        }`}
                      />
                      <span>{currentUser.role === 'ADMIN' ? 'Centre Administrator' : 'Student Ambassador'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openProfileEdit(currentUser.id);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <UserCog className="w-4 h-4 text-[#214FA2]" />
                      <span>Edit Profile & Details</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenUserSwitch();
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Users className="w-4 h-4 text-slate-500" />
                      <span>Switch Role / Profile</span>
                    </button>

                    {currentAmbassador && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleOpenMyProfile();
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#214FA2] hover:bg-blue-50/60 flex items-center gap-2.5"
                      >
                        <ExternalLink className="w-4 h-4 text-[#214FA2]" />
                        <span>View Public Verified CV</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setActiveView('settings');
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Settings & IIC Logo</span>
                    </button>
                  </div>

                  {/* Logout option in dropdown */}
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Platform Settings shortcut */}
            <button
              onClick={() => setActiveView('settings')}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Platform & IIC Logo Settings"
            >
              <Settings className="w-4 h-4 text-slate-600" />
            </button>

            {/* Edit Profile Quick Shortcut */}
            <button
              onClick={() => openProfileEdit(currentUser.id)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors"
              title="Edit your photo, name, and details"
            >
              <UserCog className="w-3.5 h-3.5 text-[#214FA2]" />
              <span>Edit Profile</span>
            </button>

            {/* Digital CV shortcut for ambassador */}
            {currentAmbassador && (
              <button
                onClick={handleOpenMyProfile}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#214FA2] bg-[#214FA2]/10 hover:bg-[#214FA2]/15 rounded-lg transition-colors"
                title="View your public verified digital CV"
              >
                <span>Digital CV</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}

            {/* Explicit Top-Bar Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50/80 hover:bg-red-100/90 border border-red-200/80 rounded-lg transition-colors shadow-2xs"
              title="Sign out of current account"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Register as Ambassador shortcut */}
            <button
              onClick={() => setActiveView('register-ambassador')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#214FA2]/30 bg-blue-50/70 hover:bg-blue-100/70 text-[#214FA2] text-xs font-semibold transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Register as Ambassador</span>
              <span className="sm:hidden">Register</span>
            </button>

            {/* Certificate verification shortcut */}
            <button
              onClick={() => setPublicVerifyCertificateId('CERT-2026-001')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Verify Certificate</span>
            </button>

            {/* Sign In button */}
            <button
              onClick={() => setActiveView('login')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#214FA2] hover:bg-[#1b4186] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Portal Sign In</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
