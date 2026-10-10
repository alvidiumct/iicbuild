import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  LayoutDashboard,
  CheckSquare,
  Clock,
  Calendar,
  UserCheck,
  FolderGit2,
  Users,
  Award,
  LogIn,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    currentUser,
    currentAmbassador,
    activeView,
    setActiveView,
    setSelectedAmbassadorId,
    isAuthenticated,
    setPublicVerifyCertificateId,
  } = useApp();

  const handleProfileClick = () => {
    if (currentUser.role === 'ADMIN') {
      setActiveView('admin-ambassadors');
    } else if (currentAmbassador) {
      setSelectedAmbassadorId(currentAmbassador.id);
      setActiveView('public-profile');
    }
  };

  if (!isAuthenticated) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden safe-area-pb">
        <div className="grid grid-cols-5 items-center h-16 px-1">
          <button
            onClick={() => setActiveView('home')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeView === 'home' || activeView === 'homepage'
                ? 'text-[#214FA2]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">Home</span>
          </button>

          <button
            onClick={() => setActiveView('projects')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeView === 'projects'
                ? 'text-[#214FA2]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FolderGit2 className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">Projects</span>
          </button>

          <button
            onClick={() => {
              setActiveView('home');
              setTimeout(() => {
                const el = document.getElementById('ambassadors-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="flex flex-col items-center justify-center h-full min-h-[44px] transition-colors text-slate-500 hover:text-slate-900"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">Ambassadors</span>
          </button>

          <button
            onClick={() => setPublicVerifyCertificateId('CERT-2026-001')}
            className="flex flex-col items-center justify-center h-full min-h-[44px] transition-colors text-slate-500 hover:text-slate-900"
          >
            <Award className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">Verify</span>
          </button>

          <button
            onClick={() => setActiveView('login')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeView === 'login'
                ? 'text-[#214FA2]'
                : 'text-[#214FA2] font-bold hover:text-blue-900'
            }`}
          >
            <LogIn className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Sign In</span>
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden safe-area-pb">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        <button
          onClick={() => setActiveView('home')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeView === 'home' || activeView === 'homepage' ? 'text-[#214FA2]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Home</span>
        </button>

        <button
          onClick={() => setActiveView(currentUser.role === 'ADMIN' ? 'admin-tasks' : 'tasks')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeView.includes('task') ? 'text-[#214FA2]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Tasks</span>
        </button>

        <button
          onClick={() =>
            setActiveView(currentUser.role === 'ADMIN' ? 'admin-contribution' : 'time-tracker')
          }
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
            activeView === 'time-tracker' || activeView === 'admin-contribution'
              ? 'text-[#214FA2]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold mt-1">
            {currentUser.role === 'ADMIN' ? 'Monitor' : 'Time'}
          </span>
        </button>

        <button
          onClick={() =>
            setActiveView(currentUser.role === 'ADMIN' ? 'admin-availability' : 'availability')
          }
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeView.includes('availability') ? 'text-[#214FA2]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Schedule</span>
        </button>

        <button
          onClick={handleProfileClick}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeView === 'public-profile' || activeView === 'admin-ambassadors'
              ? 'text-[#214FA2]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
};
