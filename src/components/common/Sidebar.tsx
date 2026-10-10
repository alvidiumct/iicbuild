import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  LayoutDashboard,
  CheckSquare,
  Clock,
  Users,
  Calendar,
  FolderGit2,
  CalendarDays,
  BookOpen,
  Mail,
  Award,
  BarChart3,
  History,
  UserCheck,
  Megaphone,
  X,
  Sparkles,
  Shield,
  Edit3,
  LogOut,
  Settings,
} from 'lucide-react';
import { IICLogo } from './IICLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    currentAmbassador,
    activeView,
    setActiveView,
    getWeeklyMetrics,
    tasks,
    manualTimeRequests,
    setSelectedAmbassadorId,
    openProfileEdit,
    logout,
    pendingApplicationsCount,
  } = useApp();

  const handleNavClick = (viewKey: string) => {
    if (viewKey === 'public-profile' && currentAmbassador) {
      setSelectedAmbassadorId(currentAmbassador.id);
    }
    setActiveView(viewKey);
    onClose();
  };

  // Pending counts for badges
  const pendingReviewsCount = tasks.filter(
    (t) => t.status === 'Submitted' || t.status === 'Under Review'
  ).length;
  const pendingManualTimeCount = manualTimeRequests.filter((r) => r.status === 'Pending').length;

  // Ambassador weekly metrics if ambassador
  const ambWeekly = currentAmbassador ? getWeeklyMetrics(currentAmbassador.id) : null;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:z-10`}
      >
        {/* Mobile Header in Drawer */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200 md:hidden">
          <div className="flex items-center gap-2">
            <IICLogo size="xs" />
            <span className="font-bold text-sm text-slate-900">Navigation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card in Sidebar */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
              <div className="text-[11px] text-slate-500 truncate">
                {currentUser.role === 'ADMIN' ? 'Centre Administrator' : currentAmbassador?.department || 'Student Ambassador'}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    currentUser.role === 'ADMIN' ? 'bg-indigo-600' : 'bg-emerald-600'
                  }`}
                />
                <span className="text-[10px] font-semibold text-slate-600">
                  {currentUser.role === 'ADMIN' ? 'Admin Access' : currentAmbassador?.ambassadorId || 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Edit Profile Action */}
          <button
            onClick={() => {
              openProfileEdit(currentUser.id);
              onClose();
            }}
            className="w-full mt-2.5 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
          >
            <Edit3 className="w-3 h-3 text-[#214FA2]" />
            <span>Edit Profile & Details</span>
          </button>

          {/* Quick Weekly Target Widget for Ambassador */}
          {currentAmbassador && ambWeekly && (
            <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                <span>Weekly Target</span>
                <span className="font-mono text-slate-900 font-bold">{ambWeekly.completedHours} / 4.0h</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    ambWeekly.completedHours >= 4.0 ? 'bg-emerald-600' : 'bg-[#214FA2]'
                  }`}
                  style={{ width: `${Math.min(100, ambWeekly.percentage)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                <span>{ambWeekly.percentage}% Completed</span>
                <span>{ambWeekly.remainingHours > 0 ? `${ambWeekly.remainingHours}h remaining` : 'Target met!'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {currentUser.role === 'ADMIN' ? (
            // ADMIN MENU
            <>
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Core Operations
              </div>

              <SidebarLink
                icon={<Home className="w-4 h-4" />}
                label="Homepage & Showcase"
                active={activeView === 'home' || activeView === 'homepage'}
                onClick={() => handleNavClick('home')}
              />

              <SidebarLink
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Admin Overview"
                active={activeView === 'dashboard'}
                onClick={() => handleNavClick('dashboard')}
              />

              <SidebarLink
                icon={<CheckSquare className="w-4 h-4" />}
                label="Task Management"
                active={activeView === 'admin-tasks'}
                badge={pendingReviewsCount > 0 ? `${pendingReviewsCount} review` : undefined}
                badgeColor="bg-amber-100 text-amber-800"
                onClick={() => handleNavClick('admin-tasks')}
              />

              <SidebarLink
                icon={<Shield className="w-4 h-4" />}
                label="User & Access Management"
                active={activeView === 'admin-users'}
                badge={pendingApplicationsCount > 0 ? `${pendingApplicationsCount} pending` : undefined}
                badgeColor="bg-amber-100 text-amber-800"
                onClick={() => handleNavClick('admin-users')}
              />

              <SidebarLink
                icon={<Clock className="w-4 h-4" />}
                label="Contribution Monitor"
                active={activeView === 'admin-contribution'}
                badge={pendingManualTimeCount > 0 ? `${pendingManualTimeCount} req` : undefined}
                badgeColor="bg-indigo-100 text-indigo-800"
                onClick={() => handleNavClick('admin-contribution')}
              />

              <SidebarLink
                icon={<Users className="w-4 h-4" />}
                label="Ambassador Directory"
                active={activeView === 'admin-ambassadors'}
                onClick={() => handleNavClick('admin-ambassadors')}
              />

              <SidebarLink
                icon={<Calendar className="w-4 h-4" />}
                label="Availability Matrix"
                active={activeView === 'admin-availability'}
                onClick={() => handleNavClick('admin-availability')}
              />

              <div className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Network & Resources
              </div>

              <SidebarLink
                icon={<FolderGit2 className="w-4 h-4" />}
                label="Projects & Innovations"
                active={activeView === 'projects'}
                onClick={() => handleNavClick('projects')}
              />

              <SidebarLink
                icon={<CalendarDays className="w-4 h-4" />}
                label="Events & Logistics"
                active={activeView === 'events'}
                onClick={() => handleNavClick('events')}
              />

              <SidebarLink
                icon={<BookOpen className="w-4 h-4" />}
                label="Community & Resources"
                active={activeView === 'community'}
                onClick={() => handleNavClick('community')}
              />

              <SidebarLink
                icon={<Mail className="w-4 h-4" />}
                label="Bulk Communications"
                active={activeView === 'admin-communication'}
                onClick={() => handleNavClick('admin-communication')}
              />

              <SidebarLink
                icon={<Award className="w-4 h-4" />}
                label="Certificates & Verification"
                active={activeView === 'admin-certificates'}
                onClick={() => handleNavClick('admin-certificates')}
              />

              <div className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Governance & Audits
              </div>

              <SidebarLink
                icon={<BarChart3 className="w-4 h-4" />}
                label="Reports & Exports"
                active={activeView === 'admin-reports'}
                onClick={() => handleNavClick('admin-reports')}
              />

              <SidebarLink
                icon={<History className="w-4 h-4" />}
                label="System Audit Trail"
                active={activeView === 'admin-audit'}
                onClick={() => handleNavClick('admin-audit')}
              />

              <SidebarLink
                icon={<Settings className="w-4 h-4" />}
                label="Settings & IIC Logo"
                active={activeView === 'settings' || activeView === 'admin-settings'}
                onClick={() => handleNavClick('admin-settings')}
              />
            </>
          ) : (
            // AMBASSADOR MENU
            <>
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Ambassador Portal
              </div>

              <SidebarLink
                icon={<Home className="w-4 h-4" />}
                label="Homepage & Showcase"
                active={activeView === 'home' || activeView === 'homepage'}
                onClick={() => handleNavClick('home')}
              />

              <SidebarLink
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="My Dashboard"
                active={activeView === 'dashboard'}
                onClick={() => handleNavClick('dashboard')}
              />

              <SidebarLink
                icon={<CheckSquare className="w-4 h-4" />}
                label="My Tasks"
                active={activeView === 'tasks'}
                onClick={() => handleNavClick('tasks')}
              />

              <SidebarLink
                icon={<Clock className="w-4 h-4" />}
                label="Punch In & Time Tracker"
                active={activeView === 'time-tracker'}
                onClick={() => handleNavClick('time-tracker')}
              />

              <SidebarLink
                icon={<Calendar className="w-4 h-4" />}
                label="Weekly Availability"
                active={activeView === 'availability'}
                onClick={() => handleNavClick('availability')}
              />

              <SidebarLink
                icon={<UserCheck className="w-4 h-4" />}
                label="Digital CV / Profile"
                active={activeView === 'public-profile'}
                onClick={() => handleNavClick('public-profile')}
              />

              <div className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                IIC Ecosystem
              </div>

              <SidebarLink
                icon={<FolderGit2 className="w-4 h-4" />}
                label="Projects & Innovations"
                active={activeView === 'projects'}
                onClick={() => handleNavClick('projects')}
              />

              <SidebarLink
                icon={<CalendarDays className="w-4 h-4" />}
                label="Events & Hackathons"
                active={activeView === 'events'}
                onClick={() => handleNavClick('events')}
              />

              <SidebarLink
                icon={<BookOpen className="w-4 h-4" />}
                label="Community & Guidelines"
                active={activeView === 'community'}
                onClick={() => handleNavClick('community')}
              />

              <SidebarLink
                icon={<Megaphone className="w-4 h-4" />}
                label="Announcements"
                active={activeView === 'announcements'}
                onClick={() => handleNavClick('announcements')}
              />

              
            </>
          )}
        </div>

        {/* Sign Out / Log Out Button in Sidebar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all shadow-2xs group"
            title="Log out from current session"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-red-500 group-hover:scale-105 transition-transform" />
              <span>Log Out</span>
            </div>
            <span className="text-[10px] text-slate-400 group-hover:text-red-500 transition-colors">Sign Out</span>
          </button>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
          <span>IIC Portal v2.4</span>
          <span>DIU Academic</span>
        </div>
      </aside>
    </>
  );
};

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: string;
  badgeColor?: string;
  onClick: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  icon,
  label,
  active,
  badge,
  badgeColor = 'bg-slate-100 text-slate-700',
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
        active
          ? 'bg-[#214FA2] text-white shadow-xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={active ? 'text-white' : 'text-slate-400'}>{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      {badge && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
            active ? 'bg-white/20 text-white' : badgeColor
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
};
