/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { TimerBar } from './components/common/TimerBar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { UserSwitchModal } from './components/auth/UserSwitchModal';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterAmbassadorPage } from './components/auth/RegisterAmbassadorPage';
import { CertificateVerificationModal } from './components/public/CertificateVerificationModal';
import { ProfileEditModal } from './components/common/ProfileEditModal';
import { Lock } from 'lucide-react';

// Ambassador Views
import { AmbassadorDashboard } from './components/ambassador/AmbassadorDashboard';
import { MyTasksView } from './components/ambassador/MyTasksView';
import { TimeTrackerView } from './components/ambassador/TimeTrackerView';
import { MyAvailabilityView } from './components/ambassador/MyAvailabilityView';
import { PublicProfileView } from './components/ambassador/PublicProfileView';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminTaskBoard } from './components/admin/AdminTaskBoard';
import { AdminUserManagement } from './components/admin/AdminUserManagement';
import { AdminContributionMonitor } from './components/admin/AdminContributionMonitor';
import { AdminAmbassadorList } from './components/admin/AdminAmbassadorList';
import { AdminAvailabilityMatrix } from './components/admin/AdminAvailabilityMatrix';
import { AdminCommunicationView } from './components/admin/AdminCommunicationView';
import { AdminCertificatesView } from './components/admin/AdminCertificatesView';
import { AdminReportsView } from './components/admin/AdminReportsView';
import { AdminAuditLogView } from './components/admin/AdminAuditLogView';
import { AdminSettingsView } from './components/admin/AdminSettingsView';

// Shared Views
import { Homepage } from './components/home/Homepage';
import { ProjectsView } from './components/projects/ProjectsView';
import { EventsView } from './components/events/EventsView';
import { CommunityView } from './components/community/CommunityView';
import { AnnouncementsView } from './components/common/AnnouncementsView';

function MainApp() {
  const {
    currentUser,
    isAuthenticated,
    activeView,
    setActiveView,
    setPublicVerifyCertificateId,
    setSelectedAmbassadorId,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userSwitchModalOpen, setUserSwitchModalOpen] = useState(false);

  // Check URL parameters on mount (e.g. ?verify=CERT-2026-001 or ?profile=IIC-AMB-2026-01)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyId = params.get('verify');
    const profileAmbId = params.get('profile');

    if (verifyId) {
      setPublicVerifyCertificateId(verifyId);
    }
    if (profileAmbId) {
      setSelectedAmbassadorId(profileAmbId);
      setActiveView('public-profile');
    }
  }, []);

  // When explicit login view is selected, render LoginPage
  if (activeView === 'login') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
        <LoginPage />
        <CertificateVerificationModal />
      </div>
    );
  }

  // When register view is selected, render RegisterAmbassadorPage
  if (activeView === 'register' || activeView === 'register-ambassador') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
        <RegisterAmbassadorPage />
        <CertificateVerificationModal />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      // Shared / General Public & Authenticated Views
      case 'home':
      case 'homepage':
        return <Homepage />;
      case 'projects':
        return <ProjectsView />;
      case 'events':
        return <EventsView />;
      case 'community':
        return <CommunityView />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'public-profile':
        return <PublicProfileView />;

      // Protected Role Views (Authenticate check)
      case 'dashboard':
        if (!isAuthenticated) return renderAuthRequired();
        return currentUser.role === 'ADMIN' ? <AdminDashboard /> : <AmbassadorDashboard />;

      // Ambassador Specific
      case 'tasks':
        if (!isAuthenticated) return renderAuthRequired();
        return <MyTasksView />;
      case 'time-tracker':
        if (!isAuthenticated) return renderAuthRequired();
        return <TimeTrackerView />;
      case 'availability':
        if (!isAuthenticated) return renderAuthRequired();
        return <MyAvailabilityView />;

      // Admin Specific
      case 'admin-tasks':
        if (!isAuthenticated) return renderAuthRequired();
        return <AdminTaskBoard />;
      case 'admin-users':
        if (!isAuthenticated) return renderAuthRequired();
        return <AdminUserManagement />;
      case 'admin-contribution':
        if (!isAuthenticated) return renderAuthRequired();
        return <AdminContributionMonitor />;
      case 'admin-ambassadors':
        if (!isAuthenticated) return renderAuthRequired();
        return <AdminAmbassadorList />;
      case 'admin-availability':
        if (!isAuthenticated) return renderAuthRequired();
        return <AdminAvailabilityMatrix />;
      case 'admin-communication':
        if (!isAuthenticated) return renderAuthRequired();
        return <AdminCommunicationView />;
      case 'admin-certificates':
        if (!isAuthenticated) return renderAuthRequired();
        return <AdminCertificatesView />;
      case 'admin-reports':
        if (!isAuthenticated) return renderAuthRequired();
        return <AdminReportsView />;
      case 'admin-audit':
        if (!isAuthenticated) return renderAuthRequired();
        return <AdminAuditLogView />;
      case 'settings':
      case 'admin-settings':
        if (!isAuthenticated) return renderAuthRequired();
        if (currentUser?.role !== 'ADMIN') return <AmbassadorDashboard />;
        return <AdminSettingsView />;

      default:
        // Default to Homepage & Showcase!
        return <Homepage />;
    }
  };

  const renderAuthRequired = () => (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-lg space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#214FA2]/10 text-[#214FA2] flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Portal Authentication Required</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          This section is restricted to certified DIU Student Ambassadors and Centre Administrators. Please sign in with your university account to access the workspace.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => setActiveView('login')}
            className="w-full py-2.5 px-4 bg-[#214FA2] hover:bg-[#1a3f82] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            Sign In with University Account
          </button>
          <button
            onClick={() => setActiveView('home')}
            className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Return to Homepage & Showcase
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans antialiased selection:bg-[#214FA2]/20 selection:text-[#214FA2]">
      {/* Active Work Session Live Timer Banner (Only when authenticated) */}
      {isAuthenticated && <TimerBar />}

      {/* Main Top Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenUserSwitch={() => setUserSwitchModalOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar (Only when authenticated for internal workspace) */}
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        {/* Primary Content Viewport */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Overlays and Interactive Modals */}
      {isAuthenticated && (
        <>
          <NotificationDrawer
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />

          <UserSwitchModal
            isOpen={userSwitchModalOpen}
            onClose={() => setUserSwitchModalOpen(false)}
          />

          <ProfileEditModal />
        </>
      )}

      {/* Public & Shared Modals */}
      <CertificateVerificationModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
