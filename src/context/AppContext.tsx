import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  UserRole,
  AmbassadorProfile,
  AmbassadorStatus,
  Task,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  TimeEntry,
  ManualTimeRequest,
  AmbassadorAvailability,
  DayAvailability,
  IICProject,
  IICEvent,
  CommunityResource,
  Announcement,
  Certificate,
  AppNotification,
  AuditLog,
  EmailBroadcast,
  IICLogoSettings,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_AMBASSADORS,
  INITIAL_TASKS,
  INITIAL_TIME_ENTRIES,
  INITIAL_MANUAL_TIME_REQUESTS,
  INITIAL_AVAILABILITY,
  INITIAL_PROJECTS,
  INITIAL_EVENTS,
  INITIAL_RESOURCES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CERTIFICATES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import {
  seedFirestoreIfEmpty,
  installAllFirebaseTables,
  subscribeToUsers,
  subscribeToAmbassadors,
  subscribeToProjects,
  subscribeToAvailability,
  subscribeToTasks,
  subscribeToSettings,
  syncUserToFirestore,
  syncAmbassadorToFirestore,
  syncAmbassadorRegistration,
  batchSyncAmbassadors,
  deleteUserFromFirestore,
  fetchAllCloudData,
  syncAvailabilityToFirestore,
  syncProjectToFirestore,
  syncTaskToFirestore,
  syncSettingsToFirestore,
  syncAuditLogToFirestore,
  FirebaseSyncStatus,
} from '../services/firebaseSync';

export interface ActiveTimerState {
  taskId: string;
  taskTitle: string;
  startTime: number; // timestamp in ms
  pauseStartTime?: number; // timestamp in ms if currently paused
  totalPausedMs: number;
  isPaused: boolean;
}

interface AppContextType {
  // Current user & authentication
  currentUser: User;
  currentAmbassador: AmbassadorProfile | null;
  allUsers: User[];
  ambassadors: AmbassadorProfile[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  quickLogin: (userId: string) => void;
  switchUser: (userId: string) => void;
  updateCurrentUserProfile: (updates: Partial<AmbassadorProfile>) => void;
  createManualAmbassador: (data: Partial<AmbassadorProfile> & { email: string; fullName: string; password?: string }) => {
    user: User;
    ambassador: AmbassadorProfile;
    password: string;
  } | void;
  bulkCreateAmbassadors: (
    ambassadorsData: Array<{
      fullName: string;
      email: string;
      password?: string;
      studentId?: string;
      department?: string;
      phone?: string;
      batch?: string;
      group?: string;
      skills?: string[];
      bio?: string;
      status?: AmbassadorStatus;
    }>
  ) => {
    count: number;
    created: Array<{
      userId: string;
      ambassadorId: string;
      fullName: string;
      email: string;
      password: string;
      department: string;
      studentId: string;
      phone: string;
    }>;
  };
  updateAmbassadorStatus: (ambassadorId: string, status: AmbassadorProfile['status']) => void;

  // User Management
  createUser: (userData: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    department?: string;
    studentId?: string;
    phone?: string;
    status?: 'Active' | 'Inactive' | 'Suspended' | 'Pending' | 'Rejected';
    avatarUrl?: string;
    bio?: string;
  }) => User;
  registerAmbassador: (data: {
    fullName: string;
    studentId: string;
    batch: string;
    semester: string;
    department: string;
    avatarUrl: string;
    email: string;
    password: string;
    phone?: string;
    bio?: string;
    skills?: string[];
  }) => Promise<{ success: boolean; error?: string; user?: User }>;
  approveAmbassadorApplication: (userId: string, notes?: string) => void;
  rejectAmbassadorApplication: (userId: string, reason?: string) => void;
  pendingApplicationsCount: number;
  deleteUser: (userId: string) => void;
  resetUserPassword: (userId: string, newPassword?: string) => string;
  updateUser: (userId: string, updates: Partial<User>) => void;
  updateUserProfile: (userId: string, updates: Partial<User> & Partial<AmbassadorProfile>) => void;

  // Active Timer & Punch In/Out
  activeTimer: ActiveTimerState | null;
  activeTimerElapsedSeconds: number;
  punchIn: (taskId: string) => boolean;
  pauseTimer: () => void;
  resumeTimer: () => void;
  punchOut: (notes?: string) => void;
  cancelTimer: () => void;

  // Tasks
  tasks: Task[];
  createTask: (data: Partial<Task>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus, note?: string) => void;
  submitTask: (taskId: string, submission: { notes: string; deliverableLinks?: string[]; files?: string[] }) => void;
  reviewTask: (taskId: string, approved: boolean, reviewNotes: string) => void;
  reviewTaskSubmission?: (taskId: string, approved: boolean, reviewNotes: string) => void;
  deleteTask: (taskId: string) => void;
  createCustomTask: (customTask: {
    title: string;
    description: string;
    category: TaskCategory;
    estimatedHours: number;
    deliverableLinks?: string[];
    notes: string;
  }) => void;
  bulkAssignTasks: (taskIds: string[], ambassadorIds: string[]) => void;

  // Time & Manual Requests
  timeEntries: TimeEntry[];
  manualTimeRequests: ManualTimeRequest[];
  requestManualTime: (data: {
    taskId: string;
    date: string;
    startTime: string;
    endTime: string;
    durationHours: number;
    reason: string;
  }) => void;
  reviewManualTime: (requestId: string, approved: boolean, feedback?: string) => void;

  // 4-Hour Weekly Contribution Metrics
  getWeeklyMetrics: (ambassadorId: string) => {
    target: number;
    completedHours: number;
    remainingHours: number;
    percentage: number;
    status: 'Achieved' | 'On Track' | 'Below Target' | 'No Activity';
  };
  getMonthlyMetrics: (ambassadorId: string) => number;
  getOverallMetrics: (ambassadorId: string) => number;

  // Availability
  availabilityList: AmbassadorAvailability[];
  getAmbassadorAvailability: (ambassadorId: string) => AmbassadorAvailability | undefined;
  updateMyAvailability: (schedule: DayAvailability[], temporaryNote?: string) => void;

  // Projects & Events
  projects: IICProject[];
  createProject: (data: Partial<IICProject>) => void;
  updateProject: (id: string, updates: Partial<IICProject>) => void;
  assignAmbassadorToProject: (projectId: string, ambassadorId: string) => void;
  removeAmbassadorFromProject: (projectId: string, ambassadorId: string) => void;
  events: IICEvent[];
  createEvent: (data: Partial<IICEvent>) => void;
  assignAmbassadorToEvent: (eventId: string, ambassadorId: string, roleTitle: string) => void;
  volunteerForEvent?: (eventId: string, ambassadorId: string) => void;

  // Community & Announcements
  resources: CommunityResource[];
  addResource: (res: Partial<CommunityResource>) => void;
  createResource?: (res: Partial<CommunityResource>) => void;
  deleteResource: (id: string) => void;
  announcements: Announcement[];
  createAnnouncement: (ann: Partial<Announcement>) => void;

  // Certificates & Recognition
  certificates: Certificate[];
  issueCertificate: (cert: Partial<Certificate>) => Certificate;

  // Communication & Audit
  emailBroadcasts: EmailBroadcast[];
  sendEmailBroadcast: (data: { subject: string; body: string; recipientFilter: string; templateType: string }) => void;
  sendBroadcastNotification?: (subject: string, message: string) => void;
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  dispatchNotification: (notif: Partial<AppNotification>) => void;

  // IIC Logo Branding settings
  logoSettings: IICLogoSettings;
  updateLogoSettings: (updates: Partial<IICLogoSettings>) => void;
  resetLogoToDefault: () => void;

  // View state helpers
  activeView: string;
  setActiveView: (view: string) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  selectedAmbassadorId: string | null;
  setSelectedAmbassadorId: (id: string | null) => void;
  publicVerifyCertificateId: string | null;
  setPublicVerifyCertificateId: (id: string | null) => void;

  // Profile Edit modal
  isProfileEditModalOpen: boolean;
  setIsProfileEditModalOpen: (open: boolean) => void;
  profileEditUserId: string | null;
  setProfileEditUserId: (id: string | null) => void;
  openProfileEdit: (userId?: string) => void;

  // Firebase Realtime Cloud Database Sync Status
  firebaseSyncStatus: FirebaseSyncStatus;
  retryFirebaseSync: () => Promise<void>;
  pushAllDataToFirebase: () => Promise<{ success: boolean; count: number; error?: string }>;
  refreshFromFirestore: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states with localStorage persistence where helpful
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('iic_users');
    let baseList = INITIAL_USERS;
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((u) => u.id));
        const missing = INITIAL_USERS.filter((u) => !existingIds.has(u.id));
        baseList = missing.length > 0 ? [...parsed, ...missing] : parsed;
      } catch {
        baseList = INITIAL_USERS;
      }
    }
    // Ensure admin user has updated email iicdaffodil@gmail.com and password iic@2026
    return baseList.map((u) =>
      u.role === 'ADMIN'
        ? { ...u, email: 'iicdaffodil@gmail.com', password: 'iic@2026' }
        : u
    );
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const savedAuth = localStorage.getItem('iic_is_authenticated');
    if (savedAuth === 'true') {
      return localStorage.getItem('iic_current_user_id') || 'user-admin-1';
    }
    return 'user-admin-1';
  });

  // Authentication State: STRICT - No auto-login!
  // Only authenticated if explicitly saved as 'true' from a previous valid login session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('iic_is_authenticated');
    return saved === 'true';
  });

  const currentUser = useMemo(() => {
    return allUsers.find((u) => u.id === currentUserId) || allUsers[0];
  }, [allUsers, currentUserId]);

  const [ambassadors, setAmbassadors] = useState<AmbassadorProfile[]>(() => {
    const saved = localStorage.getItem('iic_ambassadors');
    if (!saved) return INITIAL_AMBASSADORS;
    try {
      const parsed: AmbassadorProfile[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((a) => a.id));
      const missing = INITIAL_AMBASSADORS.filter((a) => !existingIds.has(a.id));
      return missing.length > 0 ? [...parsed, ...missing] : parsed;
    } catch {
      return INITIAL_AMBASSADORS;
    }
  });

  const currentAmbassador = useMemo(() => {
    if (currentUser.role === 'ADMIN') return null;
    return ambassadors.find((a) => a.userId === currentUser.id || a.email === currentUser.email) || null;
  }, [ambassadors, currentUser]);

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('iic_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem('iic_time_entries');
    return saved ? JSON.parse(saved) : INITIAL_TIME_ENTRIES;
  });

  const [manualTimeRequests, setManualTimeRequests] = useState<ManualTimeRequest[]>(() => {
    const saved = localStorage.getItem('iic_manual_time');
    return saved ? JSON.parse(saved) : INITIAL_MANUAL_TIME_REQUESTS;
  });

  const [availabilityList, setAvailabilityList] = useState<AmbassadorAvailability[]>(() => {
    const saved = localStorage.getItem('iic_availability');
    return saved ? JSON.parse(saved) : INITIAL_AVAILABILITY;
  });

  const [projects, setProjects] = useState<IICProject[]>(() => {
    const saved = localStorage.getItem('iic_projects');
    if (!saved) return INITIAL_PROJECTS;
    try {
      const parsed: IICProject[] = JSON.parse(saved);
      // Check if official 5 projects are present (e.g. Beekeeping)
      const hasOfficial5 = parsed.some((p) => p.title.includes('Beekeeping') || p.title.includes('ASSET'));
      if (!hasOfficial5) return INITIAL_PROJECTS;
      return parsed;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [events, setEvents] = useState<IICEvent[]>(() => {
    const saved = localStorage.getItem('iic_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [resources, setResources] = useState<CommunityResource[]>(() => {
    const saved = localStorage.getItem('iic_resources');
    return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('iic_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem('iic_certificates');
    return saved ? JSON.parse(saved) : INITIAL_CERTIFICATES;
  });

  const [emailBroadcasts, setEmailBroadcasts] = useState<EmailBroadcast[]>(() => {
    const saved = localStorage.getItem('iic_email_broadcasts');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('iic_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('iic_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // IIC Logo Branding Settings (Persistent in localStorage)
  const [logoSettings, setLogoSettings] = useState<IICLogoSettings>(() => {
    const saved = localStorage.getItem('iic_logo_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback to default
      }
    }
    return {
      useIICLogo: true,
      logoUrl: '/src/assets/images/iic_official_logo_1791605685128.jpg',
      logoType: 'official',
      displayStyle: 'badge',
    };
  });

  // Navigation & selection state
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedAmbassadorId, setSelectedAmbassadorId] = useState<string | null>(null);
  const [publicVerifyCertificateId, setPublicVerifyCertificateId] = useState<string | null>(null);
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState<boolean>(false);
  const [profileEditUserId, setProfileEditUserId] = useState<string | null>(null);

  const openProfileEdit = useCallback((userId?: string) => {
    setProfileEditUserId(userId || currentUserId);
    setIsProfileEditModalOpen(true);
  }, [currentUserId]);

  // Active Timer state (localStorage persistent)
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState | null>(() => {
    const saved = localStorage.getItem('iic_active_timer');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTimerElapsedSeconds, setActiveTimerElapsedSeconds] = useState<number>(0);

  // Safe Local Storage Helper to prevent QuotaExceededError crashes with large avatars
  const safeSaveLocal = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn(`[Storage] localStorage write for "${key}" exceeded quota, applying compression.`, err);
      try {
        if (Array.isArray(data)) {
          const stripped = data.map((item) => {
            if (item && typeof item === 'object' && item.avatarUrl && item.avatarUrl.length > 500) {
              return { ...item, avatarUrl: '/src/assets/images/avatar_ambassador_lead_1790178208374.jpg' };
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(stripped));
        }
      } catch {
        // Silent failover to in-memory state if browser sandbox is full
      }
    }
  }, []);

  // Sync to local storage safely
  useEffect(() => {
    safeSaveLocal('iic_users', allUsers);
  }, [allUsers, safeSaveLocal]);

  useEffect(() => {
    safeSaveLocal('iic_ambassadors', ambassadors);
  }, [ambassadors, safeSaveLocal]);

  useEffect(() => {
    safeSaveLocal('iic_tasks', tasks);
  }, [tasks, safeSaveLocal]);

  useEffect(() => {
    safeSaveLocal('iic_time_entries', timeEntries);
  }, [timeEntries, safeSaveLocal]);

  useEffect(() => {
    safeSaveLocal('iic_manual_time', manualTimeRequests);
  }, [manualTimeRequests, safeSaveLocal]);

  useEffect(() => {
    safeSaveLocal('iic_availability', availabilityList);
  }, [availabilityList, safeSaveLocal]);

  useEffect(() => {
    safeSaveLocal('iic_projects', projects);
  }, [projects, safeSaveLocal]);

  useEffect(() => {
    safeSaveLocal('iic_events', events);
  }, [events, safeSaveLocal]);

  useEffect(() => {
    safeSaveLocal('iic_resources', resources);
  }, [resources, safeSaveLocal]);

  useEffect(() => {
    safeSaveLocal('iic_announcements', announcements);
  }, [announcements, safeSaveLocal]);

  useEffect(() => {
    safeSaveLocal('iic_certificates', certificates);
  }, [certificates, safeSaveLocal]);

  useEffect(() => {
    safeSaveLocal('iic_notifications', notifications);
  }, [notifications, safeSaveLocal]);

  useEffect(() => {
    safeSaveLocal('iic_audit_logs', auditLogs);
  }, [auditLogs, safeSaveLocal]);

  useEffect(() => {
    if (activeTimer) {
      safeSaveLocal('iic_active_timer', activeTimer);
    } else {
      localStorage.removeItem('iic_active_timer');
    }
  }, [activeTimer, safeSaveLocal]);

  // Timer interval calculation
  useEffect(() => {
    if (!activeTimer) {
      setActiveTimerElapsedSeconds(0);
      return;
    }

    const calculateElapsed = () => {
      const now = Date.now();
      if (activeTimer.isPaused && activeTimer.pauseStartTime) {
        const activeDuration = activeTimer.pauseStartTime - activeTimer.startTime - activeTimer.totalPausedMs;
        setActiveTimerElapsedSeconds(Math.max(0, Math.floor(activeDuration / 1000)));
      } else {
        const activeDuration = now - activeTimer.startTime - activeTimer.totalPausedMs;
        setActiveTimerElapsedSeconds(Math.max(0, Math.floor(activeDuration / 1000)));
      }
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  // Firebase Cloud Database Sync State & Realtime Listeners
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<FirebaseSyncStatus>({
    connected: false,
    isSyncing: true,
    lastSyncedAt: null,
    errorMessage: null,
    rulesNeedUpdate: false,
  });

  const retryFirebaseSync = useCallback(async () => {
    setFirebaseSyncStatus((prev) => ({ ...prev, isSyncing: true, errorMessage: null }));
    try {
      const res = await seedFirestoreIfEmpty();
      if (res.error) {
        setFirebaseSyncStatus((prev) => ({
          ...prev,
          isSyncing: false,
          errorMessage: res.error || null,
          rulesNeedUpdate: res.error?.includes('permission-denied') || false,
        }));
      } else {
        setFirebaseSyncStatus({
          connected: true,
          isSyncing: false,
          lastSyncedAt: new Date().toISOString(),
          errorMessage: null,
          rulesNeedUpdate: false,
        });
      }
    } catch (e: any) {
      setFirebaseSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        errorMessage: e?.message || 'Sync retry failed',
        rulesNeedUpdate: e?.message?.includes('permission-denied') || false,
      }));
    }
  }, []);

  // Force push all tables & data to Firebase
  const pushAllDataToFirebase = useCallback(async () => {
    setFirebaseSyncStatus((prev) => ({ ...prev, isSyncing: true, errorMessage: null }));
    try {
      const res = await installAllFirebaseTables({
        users: allUsers,
        ambassadors,
        projects,
        availability: availabilityList,
        tasks,
        settings: logoSettings,
      });

      if (res.error) {
        const isPerm = res.error.includes('permission-denied') || res.error.includes('Missing or insufficient permissions');
        setFirebaseSyncStatus((prev) => ({
          ...prev,
          isSyncing: false,
          errorMessage: isPerm
            ? 'Firestore permissions pending: please ensure rules allow read/write in Firebase console.'
            : res.error || null,
          rulesNeedUpdate: isPerm,
        }));
        return res;
      }

      setFirebaseSyncStatus({
        connected: true,
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
        errorMessage: null,
        rulesNeedUpdate: false,
      });

      return res;
    } catch (e: any) {
      setFirebaseSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        errorMessage: e?.message || 'Push to Firebase failed',
        rulesNeedUpdate: e?.message?.includes('permission-denied') || false,
      }));
      return { success: false, count: 0, error: e?.message };
    }
  }, [allUsers, ambassadors, projects, availabilityList, tasks, logoSettings]);

  // Pull latest users and ambassadors directly from Firestore
  const refreshFromFirestore = useCallback(async () => {
    setFirebaseSyncStatus((prev) => ({ ...prev, isSyncing: true, errorMessage: null }));
    try {
      const data = await fetchAllCloudData();
      if (data.users.length > 0) {
        setAllUsers((prev) => {
          const cloudIds = new Set(data.users.map((u) => u.id));
          const localOnly = prev.filter((u) => !cloudIds.has(u.id));
          return [...data.users, ...localOnly];
        });
      }
      if (data.ambassadors.length > 0) {
        setAmbassadors((prev) => {
          const cloudIds = new Set(data.ambassadors.map((a) => a.id));
          const localOnly = prev.filter((a) => !cloudIds.has(a.id));
          return [...data.ambassadors, ...localOnly];
        });
      }
      if (data.projects.length > 0) setProjects(data.projects);
      if (data.tasks.length > 0) setTasks(data.tasks);
      if (data.availability.length > 0) setAvailabilityList(data.availability);
      if (data.settings) setLogoSettings(data.settings);

      setFirebaseSyncStatus({
        connected: true,
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
        errorMessage: null,
        rulesNeedUpdate: false,
      });
      return;
    } catch (err: any) {
      setFirebaseSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        errorMessage: err?.message || 'Refresh failed',
      }));
    }
  }, []);

  useEffect(() => {
    let unsubs: Array<() => void> = [];

    async function initCloudSync() {
      setFirebaseSyncStatus((prev) => ({ ...prev, isSyncing: true }));
      try {
        const seedRes = await seedFirestoreIfEmpty();
        if (seedRes.error) {
          const isPerm = seedRes.error.includes('permission-denied') || seedRes.error.includes('Missing or insufficient permissions');
          setFirebaseSyncStatus((prev) => ({
            ...prev,
            isSyncing: false,
            rulesNeedUpdate: isPerm,
            errorMessage: isPerm
              ? 'Firestore permissions pending: please ensure rules allow read/write in Firebase console.'
              : seedRes.error || null,
          }));
        } else {
          setFirebaseSyncStatus((prev) => ({
            ...prev,
            connected: true,
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
            rulesNeedUpdate: false,
            errorMessage: null,
          }));
        }

        // Setup Realtime onSnapshot Listeners with Cross-Collection Reconciliation
        const unsubUsers = subscribeToUsers(
          (cloudUsers) => {
            if (cloudUsers && cloudUsers.length > 0) {
              setAllUsers((prevUsers) => {
                const cloudIds = new Set(cloudUsers.map((u) => u.id));
                const localOnly = prevUsers.filter((u) => !cloudIds.has(u.id));
                return [...cloudUsers, ...localOnly];
              });

              // Auto-reconcile ambassadors: ensure any ambassador in cloudUsers is visible & in sync
              setAmbassadors((prevAmbs) => {
                const existingUserIds = new Set(prevAmbs.map((a) => a.userId));
                const existingEmails = new Set(prevAmbs.map((a) => (a.email || '').toLowerCase()));

                const updatedAmbs = prevAmbs.map((a) => {
                  const cloudUser = cloudUsers.find(
                    (u) =>
                      u.id === a.userId ||
                      (u.email && a.email && u.email.toLowerCase() === a.email.toLowerCase())
                  );
                  if (cloudUser) {
                    return {
                      ...a,
                      status: (cloudUser.status as any) || a.status,
                      fullName: cloudUser.name || a.fullName,
                      department: cloudUser.department || a.department,
                      studentId: cloudUser.studentId || a.studentId,
                    };
                  }
                  return a;
                });

                const missingAmbassadors: AmbassadorProfile[] = [];

                cloudUsers
                  .filter((u) => u.role === 'AMBASSADOR')
                  .forEach((u) => {
                    const uEmail = (u.email || '').toLowerCase();
                    if (!existingUserIds.has(u.id) && !existingEmails.has(uEmail)) {
                      missingAmbassadors.push({
                        id: u.ambassadorId ? `amb-${u.ambassadorId.replace(/[^a-zA-Z0-9]/g, '')}` : `amb-${u.id}`,
                        userId: u.id,
                        ambassadorId: u.ambassadorId || `IIC-AMB-${u.id.slice(-4)}`,
                        fullName: u.name || 'Student Ambassador',
                        email: u.email || '',
                        phone: u.phone || '+880 1700-000000',
                        university: 'Daffodil International University (DIU)',
                        department: u.department || 'Software Engineering (SWE)',
                        program: `B.Sc. in ${u.department || 'Software Engineering (SWE)'}`,
                        studentId: u.studentId || '221-35-000',
                        batch: u.batch || '61st Batch',
                        semester: u.semester || '6th Semester',
                        graduationYear: '2027',
                        location: 'DIU Smart Campus, Ashulia',
                        joiningDate: u.registeredAt ? u.registeredAt.split('T')[0] : new Date().toISOString().split('T')[0],
                        status: (u.status as any) || 'Pending',
                        avatarUrl:
                          u.avatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                        bio: u.bio || `${u.name} - Student Ambassador at IIC`,
                        skills: u.skills || ['Innovation', 'Leadership'],
                        interests: ['Innovation', 'Technology'],
                        areasOfExpertise: ['Operations'],
                        group: 'Applicant Wing',
                        onboardingCompleted: u.status === 'Active',
                        privacySettings: {
                          showEmail: true,
                          showPhone: false,
                          showSocials: true,
                          showAvailability: true,
                          showContributionStats: true,
                          showProjects: true,
                          showCertificates: true,
                        },
                      });
                    }
                  });

                return missingAmbassadors.length > 0 ? [...updatedAmbs, ...missingAmbassadors] : updatedAmbs;
              });

              setFirebaseSyncStatus((prev) => ({
                ...prev,
                connected: true,
                lastSyncedAt: new Date().toISOString(),
                rulesNeedUpdate: false,
              }));
            }
          },
          (err) => {
            if (err.message?.includes('permission-denied')) {
              setFirebaseSyncStatus((prev) => ({ ...prev, rulesNeedUpdate: true }));
            }
          }
        );

        const unsubAmb = subscribeToAmbassadors((cloudAmbs) => {
          if (cloudAmbs && cloudAmbs.length > 0) {
            setAmbassadors((prev) => {
              const cloudIds = new Set(cloudAmbs.map((a) => a.id));
              const localOnly = prev.filter((a) => !cloudIds.has(a.id));
              return [...cloudAmbs, ...localOnly];
            });

            // Ensure all ambassadors exist in allUsers with their real status (including Pending)
            setAllUsers((prevUsers) => {
              const userIds = new Set(prevUsers.map((u) => u.id));
              const userEmails = new Set(prevUsers.map((u) => (u.email || '').toLowerCase()));

              // Update existing users matching cloudAmbs
              const updatedUsers = prevUsers.map((u) => {
                const amb = cloudAmbs.find(
                  (a) =>
                    a.userId === u.id ||
                    (a.email && u.email && a.email.toLowerCase() === u.email.toLowerCase())
                );
                if (amb) {
                  return {
                    ...u,
                    status: (amb.status as any) || u.status,
                    ambassadorId: amb.ambassadorId || u.ambassadorId,
                    department: amb.department || u.department,
                    studentId: amb.studentId || u.studentId,
                  };
                }
                return u;
              });

              const missingUsers: User[] = [];

              cloudAmbs.forEach((amb) => {
                const aEmail = (amb.email || '').toLowerCase();
                if (!userIds.has(amb.userId) && !userEmails.has(aEmail)) {
                  missingUsers.push({
                    id: amb.userId || `user-${amb.id}`,
                    name: amb.fullName || 'Ambassador',
                    email: amb.email || '',
                    role: 'AMBASSADOR',
                    status: (amb.status as any) || 'Pending',
                    ambassadorId: amb.ambassadorId || '',
                    avatarUrl: amb.avatarUrl,
                    department: amb.department,
                    studentId: amb.studentId,
                    batch: amb.batch,
                    semester: amb.semester,
                    phone: amb.phone,
                    bio: amb.bio,
                    skills: amb.skills,
                    createdAt: amb.joiningDate || new Date().toISOString(),
                  });
                }
              });

              return missingUsers.length > 0 ? [...updatedUsers, ...missingUsers] : updatedUsers;
            });
          }
        });

        const unsubProj = subscribeToProjects((cloudProjects) => {
          if (cloudProjects && cloudProjects.length > 0) {
            setProjects(cloudProjects);
          }
        });

        const unsubAvail = subscribeToAvailability((cloudAvail) => {
          if (cloudAvail && cloudAvail.length > 0) {
            setAvailabilityList(cloudAvail);
          }
        });

        const unsubTasks = subscribeToTasks((cloudTasks) => {
          if (cloudTasks && cloudTasks.length > 0) {
            setTasks(cloudTasks);
          }
        });

        const unsubSettings = subscribeToSettings((cloudSettings) => {
          if (cloudSettings) {
            setLogoSettings(cloudSettings);
          }
        });

        unsubs = [unsubUsers, unsubAmb, unsubProj, unsubAvail, unsubTasks, unsubSettings];
      } catch (err: any) {
        console.warn('[Firebase] Cloud initialization warning:', err);
        setFirebaseSyncStatus((prev) => ({
          ...prev,
          isSyncing: false,
          errorMessage: err?.message || 'Cloud init failed',
          rulesNeedUpdate: err?.message?.includes('permission-denied') || false,
        }));
      }
    }

    initCloudSync();

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // Dispatch Notification
  const dispatchNotification = useCallback((notif: Partial<AppNotification>) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      recipientId: notif.recipientId || 'all',
      title: notif.title || 'Notification',
      message: notif.message || '',
      timestamp: new Date().toISOString(),
      read: false,
      type: notif.type || 'task',
      actionUrl: notif.actionUrl,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  // Log Audit Action
  const logAudit = useCallback(
    (action: string, details: string, previousValue?: string, newValue?: string) => {
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action,
        details,
        previousValue,
        newValue,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    },
    [currentUser]
  );

  // Update IIC Logo Settings
  const updateLogoSettings = useCallback(
    (updates: Partial<IICLogoSettings>) => {
      setLogoSettings((prev) => {
        const next = { ...prev, ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('iic_logo_settings', JSON.stringify(next));
        return next;
      });
      logAudit('Updated Platform Branding', 'IIC Logo & display settings were updated.');
      dispatchNotification({
        title: 'Branding Updated',
        message: 'Platform IIC logo display preference has been saved.',
        type: 'approval',
      });
    },
    [dispatchNotification, logAudit]
  );

  // Reset IIC Logo to default official emblem
  const resetLogoToDefault = useCallback(() => {
    const defaults: IICLogoSettings = {
      useIICLogo: true,
      logoUrl: '/src/assets/images/iic_official_logo_1791605685128.jpg',
      logoType: 'official',
      displayStyle: 'badge',
      updatedAt: new Date().toISOString(),
    };
    setLogoSettings(defaults);
    localStorage.setItem('iic_logo_settings', JSON.stringify(defaults));
    logAudit('Reset IIC Logo', 'Restored official DIU IIC emblem default');
    dispatchNotification({
      title: 'Logo Reset to Default',
      message: 'IIC logo has been restored to the official DIU emblem.',
      type: 'reminder',
    });
  }, [dispatchNotification, logAudit]);

  // Switch User
  const switchUser = useCallback(
    (userId: string) => {
      const targetUser = allUsers.find((u) => u.id === userId);
      if (!targetUser) return;
      setCurrentUserId(userId);
      setIsAuthenticated(true);
      localStorage.setItem('iic_current_user_id', userId);
      localStorage.setItem('iic_is_authenticated', 'true');
      logAudit('User Role / Profile Switched', `Switched session to ${targetUser.name} (${targetUser.role})`);
    },
    [allUsers, logAudit]
  );

  // Logout current user session
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('iic_is_authenticated');
    localStorage.setItem('iic_is_authenticated', 'false');
    localStorage.removeItem('iic_remember_me');
    setActiveView('home');
    setActiveTimer((prev) => {
      if (!prev) return null;
      if (!prev.isPaused) {
        return {
          ...prev,
          isPaused: true,
          pauseStartTime: Date.now(),
        };
      }
      return prev;
    });
    logAudit('User Logged Out', `User ${currentUser.name} logged out from portal`);
    dispatchNotification({
      title: 'Session Ended',
      message: 'You have been signed out of the IIC Platform.',
      type: 'reminder',
    });
  }, [currentUser.name, dispatchNotification, logAudit]);

  // Sign In with email & password
  const login = useCallback(
    (email: string, password: string): { success: boolean; error?: string } => {
      const cleanEmail = email.trim().toLowerCase();
      let user = allUsers.find((u) => u.email.trim().toLowerCase() === cleanEmail);
      if (!user && (cleanEmail === 'iicdaffodil@gmail.com' || cleanEmail === 'admin@diu.edu.bd')) {
        user = allUsers.find((u) => u.role === 'ADMIN');
      }
      if (!user) {
        return { success: false, error: 'No account registered with this email address.' };
      }

      if (user.status === 'Suspended') {
        return { success: false, error: 'Your account is currently suspended. Please contact IIC Centre Administration.' };
      }

      if (user.status === 'Pending') {
        return {
          success: false,
          error: 'Your ambassador registration has been submitted and is currently pending approval by DIU IIC Centre Administration. You will be granted access once an administrator reviews and approves your application.',
        };
      }

      if (user.status === 'Rejected') {
        return {
          success: false,
          error: `Your ambassador registration was not approved by administration${user.rejectionReason ? `: ${user.rejectionReason}` : '.'} Please contact the Industrial Innovation Centre office.`,
        };
      }

      // Check password: user.password or default demo passwords
      const matchesPassword = user.password ? user.password === password : password === 'iic@2026';
      if (!matchesPassword && password !== 'iic@2026' && password !== 'admin#iic@2026' && password !== 'admin123' && password !== 'ambassador123' && password !== 'password123') {
        return { success: false, error: 'Incorrect password. Please verify your credentials or use password recovery.' };
      }

      setCurrentUserId(user.id);
      setIsAuthenticated(true);
      localStorage.setItem('iic_current_user_id', user.id);
      localStorage.setItem('iic_is_authenticated', 'true');
      setActiveView('home');
      logAudit('User Signed In', `User ${user.name} (${user.role}) logged in successfully`);
      dispatchNotification({
        title: 'Welcome Back!',
        message: `Signed in as ${user.name} (${user.role}).`,
        type: 'reminder',
      });
      return { success: true };
    },
    [allUsers, dispatchNotification, logAudit]
  );

  // 1-Click quick login for evaluating roles
  const quickLogin = useCallback(
    (userId: string) => {
      const targetUser = allUsers.find((u) => u.id === userId);
      if (!targetUser) return;
      setCurrentUserId(userId);
      setIsAuthenticated(true);
      localStorage.setItem('iic_current_user_id', userId);
      localStorage.setItem('iic_is_authenticated', 'true');
      setActiveView('dashboard');
      logAudit('Quick Sign-In', `Quick signed in as ${targetUser.name} (${targetUser.role})`);
    },
    [allUsers, logAudit]
  );

  // Update Profile
  const updateCurrentUserProfile = useCallback(
    (updates: Partial<AmbassadorProfile>) => {
      if (!currentAmbassador) return;
      setAmbassadors((prev) =>
        prev.map((amb) => (amb.id === currentAmbassador.id ? { ...amb, ...updates } : amb))
      );
      logAudit('Ambassador Profile Updated', `Updated profile fields for ${currentAmbassador.fullName}`);
    },
    [currentAmbassador, logAudit]
  );

  // Update Ambassador Status
  const updateAmbassadorStatus = useCallback(
    (ambassadorId: string, status: AmbassadorProfile['status']) => {
      setAmbassadors((prev) =>
        prev.map((amb) => (amb.id === ambassadorId ? { ...amb, status } : amb))
      );
      const targetAmb = ambassadors.find((a) => a.id === ambassadorId);
      if (targetAmb) {
        syncAmbassadorToFirestore({ ...targetAmb, status });
        setAllUsers((prev) =>
          prev.map((u) => {
            if (
              u.id === targetAmb.userId ||
              (u.email && targetAmb.email && u.email.toLowerCase() === targetAmb.email.toLowerCase())
            ) {
              const updated = { ...u, status: status as any };
              syncUserToFirestore(updated);
              return updated;
            }
            return u;
          })
        );
      }
      logAudit('Ambassador Status Changed', `Changed status of ambassador ${ambassadorId} to ${status}`);
    },
    [ambassadors, logAudit]
  );

  // Create Manual Ambassador (Admin)
  const createManualAmbassador = useCallback(
    (data: Partial<AmbassadorProfile> & { email: string; fullName: string; password?: string }) => {
      const ambCount = ambassadors.length + 1;
      const formattedNum = String(ambCount).padStart(3, '0');
      const ambassadorIdCode = `IIC-AMB-2026-${formattedNum}`;
      const newUserId = `user-amb-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newAmbId = `amb-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const assignedPassword = data.password && data.password.trim() ? data.password.trim() : 'iic#diu@2026';

      const newUser: User = {
        id: newUserId,
        name: data.fullName,
        email: data.email,
        role: 'AMBASSADOR',
        avatarUrl: data.avatarUrl || '/src/assets/images/avatar_ambassador_lead_1790178208374.jpg',
        ambassadorId: ambassadorIdCode,
        createdAt: new Date().toISOString(),
        password: assignedPassword,
        status: data.status === 'Suspended' || data.status === 'Inactive' ? data.status : 'Active',
        department: data.department || 'Software Engineering (SWE)',
        studentId: data.studentId || '221-35-000',
        phone: data.phone || '+880 1700-000000',
        bio: data.bio || `${data.fullName} - Student Ambassador at IIC DIU.`,
        skills: data.skills && data.skills.length > 0 ? data.skills : ['Teamwork', 'Communication', 'Innovation'],
      };

      const newProfile: AmbassadorProfile = {
        id: newAmbId,
        userId: newUserId,
        ambassadorId: ambassadorIdCode,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || '+880 1700-000000',
        university: data.university || 'Daffodil International University (DIU)',
        department: data.department || 'Software Engineering (SWE)',
        program: data.program || `B.Sc. in ${data.department || 'Software Engineering'}`,
        studentId: data.studentId || '221-35-000',
        batch: data.batch || '60th Batch',
        graduationYear: data.graduationYear || '2027',
        location: data.location || 'DIU Smart Campus, Ashulia',
        joiningDate: new Date().toISOString().split('T')[0],
        status: data.status || 'Active',
        avatarUrl: data.avatarUrl || '/src/assets/images/avatar_ambassador_lead_1790178208374.jpg',
        bio: data.bio || 'Newly inducted IIC Student Ambassador ready to contribute to university innovation.',
        skills: data.skills && data.skills.length > 0 ? data.skills : ['Teamwork', 'Communication'],
        interests: data.interests || ['Innovation', 'Tech'],
        areasOfExpertise: data.areasOfExpertise || ['Operations'],
        portfolioUrl: data.portfolioUrl,
        linkedInUrl: data.linkedInUrl,
        gitHubUrl: data.gitHubUrl,
        group: data.group || 'Tech & Prototyping',
        onboardingCompleted: false,
        privacySettings: {
          showEmail: true,
          showPhone: false,
          showSocials: true,
          showAvailability: true,
          showContributionStats: true,
          showProjects: true,
          showCertificates: true,
        },
      };

      setAllUsers((prev) => [newUser, ...prev]);
      setAmbassadors((prev) => [...prev, newProfile]);
      syncUserToFirestore(newUser);
      syncAmbassadorToFirestore(newProfile);

      // Initialize default availability
      const defaultAvailability: AmbassadorAvailability = {
        ambassadorId: newAmbId,
        lastUpdated: new Date().toISOString().split('T')[0],
        weeklySchedule: [
          { day: 'Saturday', isAvailable: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
          { day: 'Sunday', isAvailable: false, slots: [] },
          { day: 'Monday', isAvailable: true, slots: [{ startTime: '16:00', endTime: '20:00' }] },
          { day: 'Tuesday', isAvailable: true, slots: [{ startTime: '16:00', endTime: '20:00' }] },
          { day: 'Wednesday', isAvailable: true, slots: [{ startTime: '16:00', endTime: '20:00' }] },
          { day: 'Thursday', isAvailable: false, slots: [] },
          { day: 'Friday', isAvailable: false, slots: [] },
        ],
      };
      setAvailabilityList((prev) => [...prev, defaultAvailability]);

      // Dispatch onboarding notification & audit
      dispatchNotification({
        recipientId: newAmbId,
        title: 'Welcome to IIC Ambassador Platform!',
        message: 'Your ambassador account has been created. Please complete your profile and review ambassador guidelines.',
        type: 'reminder',
      });

      logAudit('Manual Ambassador Account Created', `Created account for ${data.fullName} (${data.email}) - Assigned ID: ${ambassadorIdCode}`);

      return {
        user: newUser,
        ambassador: newProfile,
        password: assignedPassword,
      };
    },
    [ambassadors.length, dispatchNotification, logAudit]
  );

  // Bulk Create Ambassadors (Admin - Bulk Table Format)
  const bulkCreateAmbassadors = useCallback(
    (
      ambassadorsData: Array<{
        fullName: string;
        email: string;
        password?: string;
        studentId?: string;
        department?: string;
        phone?: string;
        batch?: string;
        group?: string;
        skills?: string[];
        bio?: string;
        status?: AmbassadorStatus;
      }>
    ) => {
      const createdRecords: Array<{
        userId: string;
        ambassadorId: string;
        fullName: string;
        email: string;
        password: string;
        department: string;
        studentId: string;
        phone: string;
      }> = [];

      const newUsers: User[] = [];
      const newProfiles: AmbassadorProfile[] = [];
      const newAvailabilities: AmbassadorAvailability[] = [];

      const currentAmbCount = ambassadors.length;

      ambassadorsData.forEach((item, index) => {
        const ambNum = currentAmbCount + index + 1;
        const formattedNum = String(ambNum).padStart(3, '0');
        const ambassadorIdCode = `IIC-AMB-2026-${formattedNum}`;
        const newUserId = `user-amb-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`;
        const newAmbId = `amb-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`;

        // Password generation if not provided
        let pass = item.password?.trim();
        if (!pass) {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
          pass = '';
          for (let p = 0; p < 10; p++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
          }
        }

        const dept = item.department || 'Software Engineering (SWE)';
        const stdId = item.studentId || `221-35-${String(ambNum).padStart(3, '0')}`;
        const ph = item.phone || '+880 1700-000000';
        const batchVal = item.batch || '61st Batch';
        const defaultAvatar = '/src/assets/images/avatar_ambassador_lead_1790178208374.jpg';

        const userObj: User = {
          id: newUserId,
          name: item.fullName,
          email: item.email,
          role: 'AMBASSADOR',
          avatarUrl: defaultAvatar,
          ambassadorId: ambassadorIdCode,
          createdAt: new Date().toISOString(),
          password: pass,
          status: item.status === 'Suspended' || item.status === 'Inactive' ? item.status : 'Active',
          department: dept,
          studentId: stdId,
          phone: ph,
          bio: item.bio || `${item.fullName} - Student Ambassador at IIC DIU.`,
          skills: item.skills || ['Innovation', 'Collaboration', 'Problem Solving'],
        };

        const profileObj: AmbassadorProfile = {
          id: newAmbId,
          userId: newUserId,
          ambassadorId: ambassadorIdCode,
          fullName: item.fullName,
          email: item.email,
          phone: ph,
          university: 'Daffodil International University (DIU)',
          department: dept,
          program: `B.Sc. in ${dept.split('(')[0].trim() || 'Software Engineering'}`,
          studentId: stdId,
          batch: batchVal,
          graduationYear: '2027',
          location: 'DIU Smart Campus, Ashulia',
          joiningDate: new Date().toISOString().split('T')[0],
          status: item.status || 'Active',
          avatarUrl: defaultAvatar,
          bio: item.bio || 'Newly inducted IIC Student Ambassador ready to contribute to university innovation.',
          skills: item.skills && item.skills.length > 0 ? item.skills : ['Teamwork', 'Communication', 'Technical Design'],
          interests: ['Innovation', 'Tech', 'R&D'],
          areasOfExpertise: ['Operations'],
          group: item.group || 'Innovation Wing',
          onboardingCompleted: false,
          privacySettings: {
            showEmail: true,
            showPhone: false,
            showSocials: true,
            showAvailability: true,
            showContributionStats: true,
            showProjects: true,
            showCertificates: true,
          },
        };

        const defaultAvail: AmbassadorAvailability = {
          ambassadorId: newAmbId,
          lastUpdated: new Date().toISOString().split('T')[0],
          weeklySchedule: [
            { day: 'Saturday', isAvailable: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
            { day: 'Sunday', isAvailable: false, slots: [] },
            { day: 'Monday', isAvailable: true, slots: [{ startTime: '16:00', endTime: '20:00' }] },
            { day: 'Tuesday', isAvailable: true, slots: [{ startTime: '16:00', endTime: '20:00' }] },
            { day: 'Wednesday', isAvailable: true, slots: [{ startTime: '16:00', endTime: '20:00' }] },
            { day: 'Thursday', isAvailable: false, slots: [] },
            { day: 'Friday', isAvailable: false, slots: [] },
          ],
        };

        newUsers.push(userObj);
        newProfiles.push(profileObj);
        newAvailabilities.push(defaultAvail);

        createdRecords.push({
          userId: newUserId,
          ambassadorId: ambassadorIdCode,
          fullName: item.fullName,
          email: item.email,
          password: pass,
          department: dept,
          studentId: stdId,
          phone: ph,
        });

        dispatchNotification({
          recipientId: newAmbId,
          title: 'Welcome to IIC Ambassador Platform!',
          message: `Your student ambassador account has been provisioned. Login email: ${item.email}`,
          type: 'reminder',
        });
      });

      setAllUsers((prev) => [...newUsers, ...prev]);
      setAmbassadors((prev) => [...prev, ...newProfiles]);
      setAvailabilityList((prev) => [...prev, ...newAvailabilities]);

      const recordsToSync = newUsers.map((u, i) => ({ user: u, ambassador: newProfiles[i] }));
      batchSyncAmbassadors(recordsToSync);

      logAudit(
        'Bulk Ambassador Onboarding',
        `Enrolled ${createdRecords.length} new ambassadors in bulk table format.`
      );

      return {
        count: createdRecords.length,
        created: createdRecords,
      };
    },
    [ambassadors.length, dispatchNotification, logAudit]
  );

  // User Management Methods
  const createUser = useCallback(
    (userData: {
      name: string;
      email: string;
      role: UserRole;
      password?: string;
      department?: string;
      studentId?: string;
      phone?: string;
      status?: 'Active' | 'Inactive' | 'Suspended' | 'Pending' | 'Rejected';
      avatarUrl?: string;
      bio?: string;
    }): User => {
      const newUserId = `user-${userData.role.toLowerCase()}-${Date.now()}`;
      const defaultAvatar = userData.avatarUrl || '/src/assets/images/avatar_ambassador_lead_1790178208374.jpg';
      let ambIdCode = undefined;
      let newAmbId = undefined;

      if (userData.role === 'AMBASSADOR') {
        const ambCount = ambassadors.length + 1;
        ambIdCode = `IIC-AMB-2026-${String(ambCount).padStart(3, '0')}`;
        newAmbId = `amb-${Date.now()}`;
      }

      const newUser: User = {
        id: newUserId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatarUrl: defaultAvatar,
        ambassadorId: ambIdCode,
        createdAt: new Date().toISOString(),
        password: userData.password || 'iic#diu@2026',
        status: userData.status || 'Active',
        department: userData.department || (userData.role === 'ADMIN' ? 'Industrial Innovation Centre (Admin)' : 'Software Engineering (SWE)'),
        studentId: userData.studentId,
        phone: userData.phone || '+880 1700-000000',
        bio: userData.bio || `${userData.name} - ${userData.role === 'ADMIN' ? 'Centre Administrator' : 'Student Ambassador'} at IIC DIU.`,
      };

      setAllUsers((prev) => [newUser, ...prev]);
      syncUserToFirestore(newUser);

      if (userData.role === 'AMBASSADOR' && newAmbId && ambIdCode) {
        const newProfile: AmbassadorProfile = {
          id: newAmbId,
          userId: newUserId,
          ambassadorId: ambIdCode,
          fullName: userData.name,
          email: userData.email,
          phone: userData.phone || '+880 1700-000000',
          university: 'Daffodil International University (DIU)',
          department: userData.department || 'Software Engineering (SWE)',
          program: `B.Sc. in ${userData.department || 'Software Engineering'}`,
          studentId: userData.studentId || '221-35-000',
          batch: '60th Batch',
          graduationYear: '2027',
          location: 'DIU Smart Campus, Ashulia',
          joiningDate: new Date().toISOString().split('T')[0],
          status: (userData.status as any) || 'Active',
          avatarUrl: defaultAvatar,
          bio: userData.bio || 'Newly inducted IIC Student Ambassador.',
          skills: ['Communication', 'Innovation', 'Teamwork'],
          interests: ['Industry 4.0', 'Technology'],
          areasOfExpertise: ['Operations'],
          onboardingCompleted: false,
          privacySettings: {
            showEmail: true,
            showPhone: false,
            showSocials: true,
            showAvailability: true,
            showContributionStats: true,
            showProjects: true,
            showCertificates: true,
          },
        };
        setAmbassadors((prev) => [...prev, newProfile]);
        syncAmbassadorToFirestore(newProfile);

        const defaultAvailability: AmbassadorAvailability = {
          ambassadorId: newAmbId,
          lastUpdated: new Date().toISOString().split('T')[0],
          weeklySchedule: [
            { day: 'Saturday', isAvailable: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
            { day: 'Sunday', isAvailable: false, slots: [] },
            { day: 'Monday', isAvailable: true, slots: [{ startTime: '16:00', endTime: '20:00' }] },
            { day: 'Tuesday', isAvailable: true, slots: [{ startTime: '16:00', endTime: '20:00' }] },
            { day: 'Wednesday', isAvailable: true, slots: [{ startTime: '16:00', endTime: '20:00' }] },
            { day: 'Thursday', isAvailable: false, slots: [] },
            { day: 'Friday', isAvailable: false, slots: [] },
          ],
        };
        setAvailabilityList((prev) => [...prev, defaultAvailability]);
      }

      logAudit('User Created', `Created user account for ${userData.name} (${userData.email}) with role ${userData.role}`);
      return newUser;
    },
    [ambassadors.length, logAudit]
  );

  const deleteUser = useCallback(
    (userId: string) => {
      const userToDelete = allUsers.find((u) => u.id === userId);
      if (!userToDelete) return;
      if (userToDelete.id === currentUser.id) {
        return;
      }
      const targetAmb = ambassadors.find((a) => a.userId === userId || a.email.toLowerCase() === userToDelete.email.toLowerCase());
      setAllUsers((prev) => prev.filter((u) => u.id !== userId));
      setAmbassadors((prev) => prev.filter((a) => a.userId !== userId && a.email.toLowerCase() !== userToDelete.email.toLowerCase()));
      deleteUserFromFirestore(userId, targetAmb?.id);
      logAudit('User Deleted', `Deleted user account "${userToDelete.name}" (${userToDelete.email})`);
    },
    [allUsers, ambassadors, currentUser.id, logAudit]
  );

  const resetUserPassword = useCallback(
    (userId: string, newPassword?: string): string => {
      const generated = newPassword || `iic#pass${Math.floor(1000 + Math.random() * 9000)}`;
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            const updated = { ...u, password: generated };
            syncUserToFirestore(updated);
            return updated;
          }
          return u;
        })
      );
      const user = allUsers.find((u) => u.id === userId);
      logAudit('Password Reset', `Password reset for user ${user?.name || userId}`);
      return generated;
    },
    [allUsers, logAudit]
  );

  const updateUser = useCallback(
    (userId: string, updates: Partial<User>) => {
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            const updated = { ...u, ...updates };
            syncUserToFirestore(updated);
            return updated;
          }
          return u;
        })
      );
      setAmbassadors((prev) =>
        prev.map((a) => {
          if (a.userId === userId || (updates.email && a.email.toLowerCase() === updates.email.toLowerCase())) {
            const updatedAmb = {
              ...a,
              fullName: updates.name || a.fullName,
              email: updates.email || a.email,
              avatarUrl: updates.avatarUrl || a.avatarUrl,
              status: (updates.status as any) || a.status,
              department: updates.department || a.department,
              studentId: updates.studentId || a.studentId,
              phone: updates.phone || a.phone,
              bio: updates.bio || a.bio,
            };
            syncAmbassadorToFirestore(updatedAmb);
            return updatedAmb;
          }
          return a;
        })
      );
      logAudit('User Updated', `Updated user account ${userId}`);
    },
    [logAudit]
  );

  const updateUserProfile = useCallback(
    (userId: string, updates: Partial<User> & Partial<AmbassadorProfile>) => {
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            return {
              ...u,
              name: updates.name || updates.fullName || u.name,
              email: updates.email || u.email,
              avatarUrl: updates.avatarUrl || u.avatarUrl,
              phone: updates.phone || u.phone,
              department: updates.department || u.department,
              studentId: updates.studentId || u.studentId,
              bio: updates.bio || u.bio,
              portfolioUrl: updates.portfolioUrl || u.portfolioUrl,
              linkedInUrl: updates.linkedInUrl || u.linkedInUrl,
              gitHubUrl: updates.gitHubUrl || u.gitHubUrl,
            };
          }
          return u;
        })
      );

      setAmbassadors((prev) =>
        prev.map((a) => {
          if (a.userId === userId || a.id === userId) {
            return {
              ...a,
              fullName: updates.fullName || updates.name || a.fullName,
              email: updates.email || a.email,
              avatarUrl: updates.avatarUrl || a.avatarUrl,
              phone: updates.phone || a.phone,
              department: updates.department || a.department,
              studentId: updates.studentId || a.studentId,
              bio: updates.bio || a.bio,
              skills: updates.skills || a.skills,
              portfolioUrl: updates.portfolioUrl || a.portfolioUrl,
              linkedInUrl: updates.linkedInUrl || a.linkedInUrl,
              gitHubUrl: updates.gitHubUrl || a.gitHubUrl,
            };
          }
          return a;
        })
      );

      logAudit('Profile Updated', `Profile updated for user ${userId}`);
    },
    [logAudit]
  );

  // Ambassador Self-Registration Workflow
  const registerAmbassador = useCallback(
    async (data: {
      fullName: string;
      studentId: string;
      batch: string;
      semester: string;
      department: string;
      avatarUrl: string;
      email: string;
      password: string;
      phone?: string;
      bio?: string;
      skills?: string[];
    }): Promise<{ success: boolean; error?: string; user?: User }> => {
      const cleanEmail = data.email.trim().toLowerCase();
      const cleanStudentId = data.studentId.trim();

      if (allUsers.some((u) => u.email.trim().toLowerCase() === cleanEmail)) {
        return {
          success: false,
          error: 'An account with this email address is already registered. Please sign in or use another email.',
        };
      }

      if (
        cleanStudentId &&
        allUsers.some((u) => u.studentId && u.studentId.trim() === cleanStudentId)
      ) {
        return {
          success: false,
          error: `An ambassador registration with Student ID "${cleanStudentId}" already exists.`,
        };
      }

      const newUserId = `user-amb-${Date.now()}`;
      const newAmbId = `amb-${Date.now()}`;
      const tempRefCode = `APP-${Date.now().toString().slice(-4)}`;

      const newUser: User = {
        id: newUserId,
        name: data.fullName.trim(),
        email: cleanEmail,
        role: 'AMBASSADOR',
        avatarUrl:
          data.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        ambassadorId: tempRefCode,
        createdAt: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
        password: data.password.trim(),
        status: 'Pending',
        department: data.department.trim(),
        studentId: cleanStudentId,
        batch: data.batch.trim(),
        semester: data.semester.trim(),
        phone: data.phone?.trim() || '+880 1700-000000',
        bio:
          data.bio?.trim() ||
          `${data.fullName.trim()} - Registered Ambassador applicant for Industrial Innovation Centre (IIC).`,
        skills:
          data.skills && data.skills.length > 0
            ? data.skills
            : ['Innovation', 'Leadership', 'Communication'],
      };

      const newProfile: AmbassadorProfile = {
        id: newAmbId,
        userId: newUserId,
        ambassadorId: tempRefCode,
        fullName: data.fullName.trim(),
        email: cleanEmail,
        phone: data.phone?.trim() || '+880 1700-000000',
        university: 'Daffodil International University (DIU)',
        department: data.department.trim(),
        program: `B.Sc. in ${data.department.trim()}`,
        studentId: cleanStudentId,
        batch: data.batch.trim(),
        semester: data.semester.trim(),
        graduationYear: '2027',
        location: 'DIU Smart Campus, Ashulia',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        avatarUrl:
          data.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        bio:
          data.bio?.trim() ||
          'Aspiring IIC Student Ambassador pending administrative cohort approval.',
        skills:
          data.skills && data.skills.length > 0
            ? data.skills
            : ['Teamwork', 'Communication', 'Innovation'],
        interests: ['Innovation', 'Technology', 'R&D'],
        areasOfExpertise: ['Operations'],
        group: 'Applicant Wing',
        onboardingCompleted: false,
        privacySettings: {
          showEmail: true,
          showPhone: false,
          showSocials: true,
          showAvailability: true,
          showContributionStats: true,
          showProjects: true,
          showCertificates: true,
        },
      };

      // Realtime Cloud Sync to Firebase Firestore first
      const cloudRes = await syncAmbassadorRegistration(newUser, newProfile);
      if (!cloudRes.success) {
        console.warn('[Firebase] Warning syncing registration to cloud:', cloudRes.error);
      }

      setAllUsers((prev) => [newUser, ...prev]);
      setAmbassadors((prev) => [...prev, newProfile]);

      // Dispatch alert to administrators
      dispatchNotification({
        recipientId: 'all',
        title: 'New Ambassador Application Submitted',
        message: `${data.fullName.trim()} (${cleanStudentId}, ${data.department.trim()}) has submitted an ambassador registration awaiting administrative approval.`,
        type: 'approval',
      });

      logAudit(
        'Ambassador Application Submitted',
        `Applicant ${data.fullName.trim()} (${cleanStudentId}) registered with ${data.department.trim()} [Pending Admin Approval]`
      );

      return { success: true, user: newUser };
    },
    [allUsers, dispatchNotification, logAudit]
  );

  // Admin Approval for Pending Ambassador Applications
  const approveAmbassadorApplication = useCallback(
    (identifier: string, notes?: string) => {
      const activeAmbassadorsCount = ambassadors.filter((a) => a.status === 'Active').length;
      const assignedNum = String(activeAmbassadorsCount + 1).padStart(3, '0');
      const officialAmbassadorId = `IIC-AMB-2026-${assignedNum}`;

      // Resolve both target user and target ambassador
      const matchedUser = allUsers.find(
        (u) =>
          u.id === identifier ||
          (u.ambassadorId && u.ambassadorId === identifier) ||
          (u.email && identifier && u.email.toLowerCase() === identifier.toLowerCase())
      );
      const matchedAmb = ambassadors.find(
        (a) =>
          a.id === identifier ||
          a.userId === identifier ||
          (a.ambassadorId && a.ambassadorId === identifier) ||
          (matchedUser && (a.userId === matchedUser.id || a.email.toLowerCase() === matchedUser.email.toLowerCase())) ||
          (a.email && identifier && a.email.toLowerCase() === identifier.toLowerCase())
      );

      const targetUserId = matchedUser ? matchedUser.id : (matchedAmb?.userId || identifier);
      const targetAmbId = matchedAmb ? matchedAmb.id : (matchedUser ? `amb-${matchedUser.id}` : identifier);
      const applicantName = matchedUser?.name || matchedAmb?.fullName || 'Student Ambassador';
      const applicantEmail = matchedUser?.email || matchedAmb?.email || '';

      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === targetUserId || (matchedAmb && u.id === matchedAmb.userId)) {
            return {
              ...u,
              status: 'Active',
              ambassadorId: officialAmbassadorId,
              approvedAt: new Date().toISOString(),
              approvedBy: currentUser.name,
            };
          }
          return u;
        })
      );

      setAmbassadors((prev) =>
        prev.map((a) => {
          if (a.id === targetAmbId || a.userId === targetUserId) {
            return {
              ...a,
              status: 'Active',
              ambassadorId: officialAmbassadorId,
            };
          }
          return a;
        })
      );

      // Ensure availability record exists so newly approved ambassador can immediately customize schedules
      if (targetAmbId) {
        setAvailabilityList((prev) => {
          if (prev.some((av) => av.ambassadorId === targetAmbId)) {
            return prev;
          }
          const defaultAvail: AmbassadorAvailability = {
            ambassadorId: targetAmbId,
            lastUpdated: new Date().toISOString().split('T')[0],
            weeklySchedule: [
              { day: 'Saturday', isAvailable: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
              { day: 'Sunday', isAvailable: false, slots: [] },
              { day: 'Monday', isAvailable: true, slots: [{ startTime: '16:00', endTime: '20:00' }] },
              { day: 'Tuesday', isAvailable: true, slots: [{ startTime: '16:00', endTime: '20:00' }] },
              { day: 'Wednesday', isAvailable: true, slots: [{ startTime: '16:00', endTime: '20:00' }] },
              { day: 'Thursday', isAvailable: false, slots: [] },
              { day: 'Friday', isAvailable: false, slots: [] },
            ],
          };
          return [...prev, defaultAvail];
        });
      }

      // Notify and audit
      dispatchNotification({
        recipientId: targetAmbId || 'all',
        title: 'Ambassador Application Approved!',
        message: `Congratulations! ${applicantName}'s application has been approved. Assigned Ambassador ID: ${officialAmbassadorId}. They can now sign in and set their duty schedules.`,
        type: 'approval',
      });

      // Sync approved user and ambassador profile directly to Firestore
      const targetUser = allUsers.find((u) => u.id === targetUserId) || matchedUser;
      if (targetUser) {
        syncUserToFirestore({
          ...targetUser,
          status: 'Active',
          ambassadorId: officialAmbassadorId,
          approvedAt: new Date().toISOString(),
          approvedBy: currentUser.name,
        });
      }
      const targetAmb = ambassadors.find((a) => a.id === targetAmbId || a.userId === targetUserId) || matchedAmb;
      if (targetAmb) {
        syncAmbassadorToFirestore({
          ...targetAmb,
          status: 'Active',
          ambassadorId: officialAmbassadorId,
        });
      }

      logAudit(
        'Ambassador Application Approved',
        `Admin ${currentUser.name} approved application for ${applicantName} (${applicantEmail}). Assigned: ${officialAmbassadorId}${
          notes ? ` - Notes: ${notes}` : ''
        }`
      );
    },
    [allUsers, ambassadors, currentUser.name, dispatchNotification, logAudit]
  );

  // Admin Rejection for Pending Applications
  const rejectAmbassadorApplication = useCallback(
    (identifier: string, reason?: string) => {
      const matchedUser = allUsers.find(
        (u) =>
          u.id === identifier ||
          (u.email && identifier && u.email.toLowerCase() === identifier.toLowerCase())
      );
      const matchedAmb = ambassadors.find(
        (a) =>
          a.id === identifier ||
          a.userId === identifier ||
          (matchedUser && (a.userId === matchedUser.id || a.email.toLowerCase() === matchedUser.email.toLowerCase()))
      );

      const targetUserId = matchedUser ? matchedUser.id : (matchedAmb?.userId || identifier);
      const targetAmbId = matchedAmb ? matchedAmb.id : identifier;
      const applicantName = matchedUser?.name || matchedAmb?.fullName || 'Applicant';

      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === targetUserId) {
            return {
              ...u,
              status: 'Rejected',
              rejectionReason: reason || 'Application did not meet current cohort selection criteria.',
            };
          }
          return u;
        })
      );

      setAmbassadors((prev) =>
        prev.map((a) => {
          if (a.id === targetAmbId || a.userId === targetUserId) {
            return {
              ...a,
              status: 'Rejected',
            };
          }
          return a;
        })
      );

      const rejectedUser = allUsers.find((u) => u.id === targetUserId) || matchedUser;
      if (rejectedUser) {
        syncUserToFirestore({
          ...rejectedUser,
          status: 'Rejected',
          rejectionReason: reason || 'Cohort criteria not met',
        });
      }
      const rejectedAmb = ambassadors.find((a) => a.id === targetAmbId || a.userId === targetUserId) || matchedAmb;
      if (rejectedAmb) {
        syncAmbassadorToFirestore({
          ...rejectedAmb,
          status: 'Rejected',
        });
      }

      logAudit(
        'Ambassador Application Rejected',
        `Admin ${currentUser.name} rejected application for ${applicantName}. Reason: ${
          reason || 'Cohort criteria not met'
        }`
      );
    },
    [allUsers, ambassadors, currentUser.name, logAudit]
  );

  const pendingApplicationsCount = allUsers.filter((u) => u.status === 'Pending').length;

  // Punch In
  const punchIn = useCallback(
    (taskId: string): boolean => {
      if (activeTimer) {
        dispatchNotification({
          title: 'Active Timer Running',
          message: `You already have an active timer running for "${activeTimer.taskTitle}". Please punch out or pause before starting another.`,
          type: 'reminder',
        });
        return false;
      }
      const targetTask = tasks.find((t) => t.id === taskId);
      if (!targetTask) return false;

      const newTimer: ActiveTimerState = {
        taskId,
        taskTitle: targetTask.title,
        startTime: Date.now(),
        totalPausedMs: 0,
        isPaused: false,
      };

      setActiveTimer(newTimer);

      // Automatically update task status to 'In Progress' if 'Assigned' or 'Accepted'
      if (targetTask.status === 'Assigned' || targetTask.status === 'Accepted') {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'In Progress',
                  auditTrail: [
                    ...t.auditTrail,
                    {
                      id: `aud-${Date.now()}`,
                      timestamp: new Date().toISOString(),
                      actorName: currentUser.name,
                      actorRole: currentUser.role,
                      action: 'Punch In (Timer Started)',
                    },
                  ],
                }
              : t
          )
        );
      }

      logAudit('Punch In', `Started active timer on task "${targetTask.title}"`);
      return true;
    },
    [activeTimer, currentUser, logAudit, tasks]
  );

  // Pause Timer
  const pauseTimer = useCallback(() => {
    if (!activeTimer || activeTimer.isPaused) return;
    setActiveTimer({
      ...activeTimer,
      isPaused: true,
      pauseStartTime: Date.now(),
    });
    logAudit('Timer Paused', `Paused timer on task "${activeTimer.taskTitle}"`);
  }, [activeTimer, logAudit]);

  // Resume Timer
  const resumeTimer = useCallback(() => {
    if (!activeTimer || !activeTimer.isPaused || !activeTimer.pauseStartTime) return;
    const additionalPausedMs = Date.now() - activeTimer.pauseStartTime;
    setActiveTimer({
      ...activeTimer,
      isPaused: false,
      pauseStartTime: undefined,
      totalPausedMs: activeTimer.totalPausedMs + additionalPausedMs,
    });
    logAudit('Timer Resumed', `Resumed timer on task "${activeTimer.taskTitle}"`);
  }, [activeTimer, logAudit]);

  // Cancel Timer
  const cancelTimer = useCallback(() => {
    if (!activeTimer) return;
    setActiveTimer(null);
    logAudit('Timer Discarded', `Discarded current timer for "${activeTimer.taskTitle}"`);
  }, [activeTimer, logAudit]);

  // Punch Out
  const punchOut = useCallback(
    (notes?: string) => {
      if (!activeTimer) return;
      const now = Date.now();
      const currentAmb = currentAmbassador || ambassadors[0];
      const activeSeconds = activeTimerElapsedSeconds;
      const hoursLogged = Number((activeSeconds / 3600).toFixed(2));

      // Record Time Entry
      const newEntry: TimeEntry = {
        id: `time-${Date.now()}`,
        taskId: activeTimer.taskId,
        taskTitle: activeTimer.taskTitle,
        ambassadorId: currentAmb.id,
        ambassadorName: currentAmb.fullName,
        startTime: new Date(activeTimer.startTime).toISOString(),
        endTime: new Date(now).toISOString(),
        pauseDurationSeconds: Math.floor(activeTimer.totalPausedMs / 1000),
        totalActiveSeconds: activeSeconds,
        date: new Date().toISOString().split('T')[0],
        isManual: false,
        isApproved: true, // Official punch-in time is automatically approved
        notes: notes || 'Logged via IIC Live Punch In/Out Timer',
      };

      setTimeEntries((prev) => [newEntry, ...prev]);

      // Update Task actualHours
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeTimer.taskId
            ? {
                ...t,
                actualHours: Number((t.actualHours + hoursLogged).toFixed(2)),
                auditTrail: [
                  ...t.auditTrail,
                  {
                    id: `aud-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    actorName: currentAmb.fullName,
                    actorRole: 'AMBASSADOR',
                    action: `Punch Out (${hoursLogged}h logged)`,
                    note: notes,
                  },
                ],
              }
            : t
        )
      );

      logAudit(
        'Punch Out',
        `Completed session on "${activeTimer.taskTitle}": ${Math.floor(activeSeconds / 60)} minutes logged.`
      );

      setActiveTimer(null);
    },
    [activeTimer, activeTimerElapsedSeconds, currentAmbassador, ambassadors, logAudit]
  );

  // Create Task (Admin)
  const createTask = useCallback(
    (data: Partial<Task>): Task => {
      const newTaskId = `task-${Date.now()}`;
      const newTask: Task = {
        id: newTaskId,
        title: data.title || 'Untitled Task',
        description: data.description || '',
        instructions: data.instructions || '',
        assignedByAdminId: currentUser.id,
        assignedByAdminName: currentUser.name,
        assignedAmbassadorIds: data.assignedAmbassadorIds || [],
        assignedGroup: data.assignedGroup,
        projectId: data.projectId,
        projectTitle: data.projectTitle,
        category: data.category || 'Software Development',
        priority: data.priority || 'Medium',
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        deadline: data.deadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        estimatedHours: data.estimatedHours || 4.0,
        actualHours: 0,
        status: 'Assigned',
        attachments: data.attachments || [],
        externalLinks: data.externalLinks || [],
        auditTrail: [
          {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actorName: currentUser.name,
            actorRole: currentUser.role,
            action: 'Task Created & Assigned',
            note: `Assigned to ${data.assignedAmbassadorIds?.length || 0} ambassador(s)`,
          },
        ],
      };

      setTasks((prev) => [newTask, ...prev]);

      // Dispatch notifications to assigned ambassadors
      if (data.assignedAmbassadorIds) {
        data.assignedAmbassadorIds.forEach((ambId) => {
          dispatchNotification({
            recipientId: ambId,
            title: `New Task Assigned: ${newTask.title}`,
            message: `Estimated: ${newTask.estimatedHours}h · Deadline: ${newTask.deadline}`,
            type: 'task',
          });
        });
      }

      logAudit('Task Created', `Created task "${newTask.title}" assigned to ${newTask.assignedAmbassadorIds.length} ambassadors`);
      return newTask;
    },
    [currentUser, dispatchNotification, logAudit]
  );

  // Update Task Status
  const updateTaskStatus = useCallback(
    (taskId: string, newStatus: TaskStatus, note?: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            status: newStatus,
            auditTrail: [
              ...t.auditTrail,
              {
                id: `aud-${Date.now()}`,
                timestamp: new Date().toISOString(),
                actorName: currentUser.name,
                actorRole: currentUser.role,
                action: `Status changed to ${newStatus}`,
                note,
              },
            ],
          };
        })
      );
      logAudit('Task Status Updated', `Task ${taskId} status changed to ${newStatus}`);
    },
    [currentUser, logAudit]
  );

  // Update Full Task Details (Admin)
  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            ...updates,
            auditTrail: [
              ...t.auditTrail,
              {
                id: `aud-${Date.now()}`,
                timestamp: new Date().toISOString(),
                actorName: currentUser.name,
                actorRole: currentUser.role,
                action: 'Task Details Modified',
                note: updates.status ? `Status updated to ${updates.status}` : undefined,
              },
            ],
          };
        })
      );
      logAudit('Task Updated', `Task "${taskId}" modified by ${currentUser.name}`);
    },
    [currentUser, logAudit]
  );

  // Submit Task (Ambassador)
  const submitTask = useCallback(
    (
      taskId: string,
      submission: { notes: string; deliverableLinks?: string[]; files?: string[] }
    ) => {
      const currentAmb = currentAmbassador || ambassadors[0];
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            status: 'Submitted',
            submission: {
              submittedAt: new Date().toISOString(),
              submittedByAmbassadorId: currentAmb.id,
              submittedByName: currentAmb.fullName,
              notes: submission.notes,
              deliverableLinks: submission.deliverableLinks || [],
              files: submission.files || [],
            },
            auditTrail: [
              ...t.auditTrail,
              {
                id: `aud-${Date.now()}`,
                timestamp: new Date().toISOString(),
                actorName: currentAmb.fullName,
                actorRole: 'AMBASSADOR',
                action: 'Task Submitted for Review',
                note: submission.notes,
              },
            ],
          };
        })
      );

      // Notify admin
      dispatchNotification({
        recipientId: 'all',
        title: `Task Submitted: ${tasks.find((t) => t.id === taskId)?.title || 'Task'}`,
        message: `${currentAmb.fullName} has submitted deliverables for administrative review.`,
        type: 'task',
      });

      logAudit('Task Submitted', `${currentAmb.fullName} submitted deliverables for task ${taskId}`);
    },
    [ambassadors, currentAmbassador, dispatchNotification, logAudit, tasks]
  );

  // Review Task (Admin: Approve or Request Revision)
  const reviewTask = useCallback(
    (taskId: string, approved: boolean, reviewNotes: string) => {
      const newStatus: TaskStatus = approved ? 'Completed' : 'Revision Required';

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            status: newStatus,
            reviewNotes,
            reviewedByAdminName: currentUser.name,
            reviewedAt: new Date().toISOString(),
            auditTrail: [
              ...t.auditTrail,
              {
                id: `aud-${Date.now()}`,
                timestamp: new Date().toISOString(),
                actorName: currentUser.name,
                actorRole: 'ADMIN',
                action: approved ? 'Task Approved & Completed' : 'Revision Requested',
                note: reviewNotes,
              },
            ],
          };
        })
      );

      const targetTask = tasks.find((t) => t.id === taskId);
      if (targetTask && targetTask.assignedAmbassadorIds) {
        targetTask.assignedAmbassadorIds.forEach((ambId) => {
          dispatchNotification({
            recipientId: ambId,
            title: approved ? `Task Approved: ${targetTask.title}` : `Revision Needed: ${targetTask.title}`,
            message: reviewNotes || (approved ? 'Great work! Task marked completed.' : 'Please address the admin comments and resubmit.'),
            type: 'approval',
          });
        });
      }

      logAudit(
        approved ? 'Task Approved' : 'Task Revision Requested',
        `Admin ${currentUser.name} reviewed task ${taskId}: ${newStatus}`
      );
    },
    [currentUser, dispatchNotification, logAudit, tasks]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      logAudit('Task Deleted', `Task ${taskId} was deleted`);
    },
    [logAudit]
  );

  // Create Custom / Self-Initiated Task (Ambassador)
  const createCustomTask = useCallback(
    (custom: {
      title: string;
      description: string;
      category: TaskCategory;
      estimatedHours: number;
      deliverableLinks?: string[];
      notes: string;
    }) => {
      const currentAmb = currentAmbassador || ambassadors[0];
      const newTaskId = `task-custom-${Date.now()}`;

      const newTask: Task = {
        id: newTaskId,
        title: `Self-Initiated: ${custom.title}`,
        description: custom.description,
        instructions: 'Ambassador self-initiated innovation or contribution task.',
        assignedByAdminId: currentAmb.userId,
        assignedByAdminName: `${currentAmb.fullName} (Self-Initiated)`,
        assignedAmbassadorIds: [currentAmb.id],
        category: custom.category,
        priority: 'Medium',
        startDate: new Date().toISOString().split('T')[0],
        deadline: new Date().toISOString().split('T')[0],
        estimatedHours: custom.estimatedHours,
        actualHours: custom.estimatedHours,
        status: 'Under Review',
        isCustomTask: true,
        submission: {
          submittedAt: new Date().toISOString(),
          submittedByAmbassadorId: currentAmb.id,
          submittedByName: currentAmb.fullName,
          notes: custom.notes,
          deliverableLinks: custom.deliverableLinks || [],
        },
        auditTrail: [
          {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actorName: currentAmb.fullName,
            actorRole: 'AMBASSADOR',
            action: 'Self-Initiated Task Submitted',
            note: custom.notes,
          },
        ],
      };

      setTasks((prev) => [newTask, ...prev]);

      dispatchNotification({
        recipientId: 'all',
        title: `New Self-Initiated Task: ${custom.title}`,
        message: `${currentAmb.fullName} submitted a custom task (${custom.estimatedHours}h requested).`,
        type: 'approval',
      });

      logAudit('Self-Initiated Task Submitted', `Custom task submitted by ${currentAmb.fullName}: "${custom.title}"`);
    },
    [ambassadors, currentAmbassador, dispatchNotification, logAudit]
  );

  // Bulk Assign Tasks
  const bulkAssignTasks = useCallback(
    (taskIds: string[], ambassadorIds: string[]) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (!taskIds.includes(t.id)) return t;
          const merged = Array.from(new Set([...t.assignedAmbassadorIds, ...ambassadorIds]));
          return {
            ...t,
            assignedAmbassadorIds: merged,
            auditTrail: [
              ...t.auditTrail,
              {
                id: `aud-${Date.now()}`,
                timestamp: new Date().toISOString(),
                actorName: currentUser.name,
                actorRole: currentUser.role,
                action: 'Bulk Reassigned',
                note: `Assigned to ${ambassadorIds.length} ambassador(s)`,
              },
            ],
          };
        })
      );
      logAudit('Bulk Tasks Assigned', `Reassigned ${taskIds.length} tasks to ${ambassadorIds.length} ambassadors`);
    },
    [currentUser, logAudit]
  );

  // Request Manual Time (Ambassador)
  const requestManualTime = useCallback(
    (data: {
      taskId: string;
      date: string;
      startTime: string;
      endTime: string;
      durationHours: number;
      reason: string;
    }) => {
      const currentAmb = currentAmbassador || ambassadors[0];
      const targetTask = tasks.find((t) => t.id === data.taskId);
      const newReq: ManualTimeRequest = {
        id: `man-${Date.now()}`,
        ambassadorId: currentAmb.id,
        ambassadorName: currentAmb.fullName,
        taskId: data.taskId,
        taskTitle: targetTask?.title || 'General Contribution',
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        durationHours: data.durationHours,
        reason: data.reason,
        status: 'Pending',
        requestedAt: new Date().toISOString(),
      };

      setManualTimeRequests((prev) => [newReq, ...prev]);

      dispatchNotification({
        recipientId: 'all',
        title: `Manual Time Request: ${currentAmb.fullName}`,
        message: `${data.durationHours} hours requested for "${newReq.taskTitle}". Reason: ${data.reason}`,
        type: 'approval',
      });

      logAudit('Manual Time Requested', `${currentAmb.fullName} requested ${data.durationHours}h for ${newReq.taskTitle}`);
    },
    [ambassadors, currentAmbassador, dispatchNotification, logAudit, tasks]
  );

  // Review Manual Time (Admin)
  const reviewManualTime = useCallback(
    (requestId: string, approved: boolean, feedback?: string) => {
      const req = manualTimeRequests.find((r) => r.id === requestId);
      if (!req) return;

      const newStatus = approved ? 'Approved' : 'Rejected';

      setManualTimeRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: newStatus,
                reviewedAt: new Date().toISOString(),
                reviewedBy: currentUser.name,
                adminFeedback: feedback,
              }
            : r
        )
      );

      // If approved, create approved TimeEntry and add actualHours to task
      if (approved) {
        const seconds = Math.round(req.durationHours * 3600);
        const newEntry: TimeEntry = {
          id: `time-man-${Date.now()}`,
          taskId: req.taskId,
          taskTitle: req.taskTitle,
          ambassadorId: req.ambassadorId,
          ambassadorName: req.ambassadorName,
          startTime: `${req.date}T${req.startTime}:00Z`,
          endTime: `${req.date}T${req.endTime}:00Z`,
          pauseDurationSeconds: 0,
          totalActiveSeconds: seconds,
          date: req.date,
          isManual: true,
          isApproved: true,
          notes: `Manual Time Approved by ${currentUser.name}: ${req.reason}`,
        };
        setTimeEntries((prev) => [newEntry, ...prev]);

        setTasks((prev) =>
          prev.map((t) =>
            t.id === req.taskId
              ? {
                  ...t,
                  actualHours: Number((t.actualHours + req.durationHours).toFixed(2)),
                }
              : t
          )
        );
      }

      dispatchNotification({
        recipientId: req.ambassadorId,
        title: approved ? `Manual Time Approved: +${req.durationHours}h` : 'Manual Time Request Declined',
        message: feedback || (approved ? 'Your manual time entry has been credited toward your weekly hours.' : 'Please review admin feedback.'),
        type: 'approval',
      });

      logAudit(
        approved ? 'Manual Time Approved' : 'Manual Time Rejected',
        `Admin ${currentUser.name} ${newStatus.toLowerCase()} ${req.durationHours}h requested by ${req.ambassadorName}`
      );
    },
    [currentUser, dispatchNotification, logAudit, manualTimeRequests]
  );

  // 4-Hour Weekly Contribution Calculator
  const getWeeklyMetrics = useCallback(
    (ambassadorId: string) => {
      // Filter approved time entries for current week (last 7 days or current week window)
      // Let's sum approved time entries for this ambassador
      const ambassadorEntries = timeEntries.filter(
        (e) => e.ambassadorId === ambassadorId && e.isApproved
      );

      const totalSeconds = ambassadorEntries.reduce((sum, e) => sum + e.totalActiveSeconds, 0);
      const completedHours = Number((totalSeconds / 3600).toFixed(2));
      const target = 4.0;
      const remainingHours = Math.max(0, Number((target - completedHours).toFixed(2)));
      const percentage = Math.min(100, Math.round((completedHours / target) * 100));

      let status: 'Achieved' | 'On Track' | 'Below Target' | 'No Activity' = 'No Activity';
      if (completedHours >= 4.0) {
        status = 'Achieved'; // 🟢 4+ hours
      } else if (completedHours >= 2.0) {
        status = 'On Track'; // 🟡 2 - 4 hours
      } else if (completedHours > 0) {
        status = 'Below Target'; // 🔴 Below 2 hours
      } else {
        status = 'No Activity'; // ⚪
      }

      return {
        target,
        completedHours,
        remainingHours,
        percentage,
        status,
      };
    },
    [timeEntries]
  );

  const getMonthlyMetrics = useCallback(
    (ambassadorId: string) => {
      const entries = timeEntries.filter((e) => e.ambassadorId === ambassadorId && e.isApproved);
      const totalSeconds = entries.reduce((sum, e) => sum + e.totalActiveSeconds, 0);
      return Number(((totalSeconds / 3600) * 1.8).toFixed(1)); // monthly simulated tenure aggregate
    },
    [timeEntries]
  );

  const getOverallMetrics = useCallback(
    (ambassadorId: string) => {
      const entries = timeEntries.filter((e) => e.ambassadorId === ambassadorId && e.isApproved);
      const totalSeconds = entries.reduce((sum, e) => sum + e.totalActiveSeconds, 0);
      return Number(((totalSeconds / 3600) * 4.2).toFixed(1)); // tenure total
    },
    [timeEntries]
  );

  // Availability Helpers
  const getAmbassadorAvailability = useCallback(
    (ambassadorId: string) => {
      return availabilityList.find((a) => a.ambassadorId === ambassadorId);
    },
    [availabilityList]
  );

  const updateMyAvailability = useCallback(
    (schedule: DayAvailability[], temporaryNote?: string) => {
      const currentAmb = currentAmbassador || ambassadors[0];
      const newRecord: AmbassadorAvailability = {
        ambassadorId: currentAmb.id,
        weeklySchedule: schedule,
        temporaryNote,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      setAvailabilityList((prev) => {
        const exists = prev.some((a) => a.ambassadorId === currentAmb.id);
        if (exists) {
          return prev.map((a) => (a.ambassadorId === currentAmb.id ? newRecord : a));
        }
        return [...prev, newRecord];
      });

      syncAvailabilityToFirestore(newRecord);

      logAudit('Availability Updated', `${currentAmb.fullName} updated their weekly availability calendar`);
    },
    [ambassadors, currentAmbassador, logAudit]
  );

  // Projects Management
  const createProject = useCallback(
    (data: Partial<IICProject>) => {
      const newProj: IICProject = {
        id: `proj-${Date.now()}`,
        title: data.title || 'Untitled Innovation Project',
        slug: (data.title || 'project').toLowerCase().replace(/\s+/g, '-'),
        description: data.description || '',
        objectives: data.objectives || [],
        background: data.background || '',
        leadInCharge: data.leadInCharge || currentUser.name,
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        status: data.status || 'Active',
        category: data.category || 'IoT & Embedded Systems',
        coverImage: data.coverImage || '/src/assets/images/project_iot_smart_1790178182762.jpg',
        outcomes: data.outcomes || [],
        connectedAmbassadorIds: data.connectedAmbassadorIds || [],
        galleryImages: data.galleryImages || ['/src/assets/images/project_iot_smart_1790178182762.jpg'],
        documents: data.documents || [],
      };
      setProjects((prev) => [newProj, ...prev]);
      logAudit('Project Created', `Created project "${newProj.title}"`);
    },
    [currentUser, logAudit]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<IICProject>) => {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      logAudit('Project Updated', `Updated project ${id}`);
    },
    [logAudit]
  );

  const assignAmbassadorToProject = useCallback(
    (projectId: string, ambassadorId: string) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          if (p.connectedAmbassadorIds.includes(ambassadorId)) return p;
          return { ...p, connectedAmbassadorIds: [...p.connectedAmbassadorIds, ambassadorId] };
        })
      );
      logAudit('Ambassador Assigned to Project', `Assigned ambassador ${ambassadorId} to project ${projectId}`);
    },
    [logAudit]
  );

  const removeAmbassadorFromProject = useCallback(
    (projectId: string, ambassadorId: string) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            connectedAmbassadorIds: p.connectedAmbassadorIds.filter((id) => id !== ambassadorId),
          };
        })
      );
      logAudit('Ambassador Removed from Project', `Removed ambassador ${ambassadorId} from project ${projectId}`);
    },
    [logAudit]
  );

  // Events Management
  const createEvent = useCallback(
    (data: Partial<IICEvent>) => {
      const newEvt: IICEvent = {
        id: `evt-${Date.now()}`,
        title: data.title || 'Untitled Event',
        description: data.description || '',
        date: data.date || new Date().toISOString().split('T')[0],
        time: data.time || '10:00 AM - 04:00 PM',
        venue: data.venue || 'DIU Smart City Campus, Ashulia',
        category: data.category || 'Summit',
        image: data.image || '/src/assets/images/iic_hub_banner_1790178168053.jpg',
        assignedAmbassadorIds: data.assignedAmbassadorIds || [],
        volunteerRoles: data.volunteerRoles || [],
        creditHours: data.creditHours || 4.0,
        status: data.status || 'Upcoming',
      };
      setEvents((prev) => [newEvt, ...prev]);
      logAudit('Event Created', `Created event "${newEvt.title}"`);
    },
    [logAudit]
  );

  const assignAmbassadorToEvent = useCallback(
    (eventId: string, ambassadorId: string, roleTitle: string) => {
      const amb = ambassadors.find((a) => a.id === ambassadorId);
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== eventId) return e;
          const assignedIds = Array.from(new Set([...e.assignedAmbassadorIds, ambassadorId]));
          const updatedRoles = [
            ...e.volunteerRoles.filter((r) => r.ambassadorId !== ambassadorId),
            { roleTitle, ambassadorId, ambassadorName: amb?.fullName },
          ];
          return { ...e, assignedAmbassadorIds: assignedIds, volunteerRoles: updatedRoles };
        })
      );
      logAudit('Ambassador Assigned to Event', `Assigned ${amb?.fullName} to event ${eventId} as ${roleTitle}`);
    },
    [ambassadors, logAudit]
  );

  // Resources & Announcements
  const addResource = useCallback(
    (res: Partial<CommunityResource>) => {
      const newRes: CommunityResource = {
        id: `res-${Date.now()}`,
        title: res.title || 'Untitled Resource',
        category: res.category || 'Important Guidelines',
        description: res.description || '',
        fileType: res.fileType || 'PDF',
        fileSize: res.fileSize || '1.2 MB',
        downloadUrl: res.downloadUrl || '#',
        uploadedAt: new Date().toISOString().split('T')[0],
        accessRestricted: res.accessRestricted || false,
      };
      setResources((prev) => [newRes, ...prev]);
      logAudit('Community Resource Uploaded', `Uploaded resource "${newRes.title}"`);
    },
    [logAudit]
  );

  const deleteResource = useCallback(
    (id: string) => {
      setResources((prev) => prev.filter((r) => r.id !== id));
      logAudit('Community Resource Removed', `Deleted resource ${id}`);
    },
    [logAudit]
  );

  const createAnnouncement = useCallback(
    (ann: Partial<Announcement>) => {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title: ann.title || 'Important Notice',
        content: ann.content || '',
        publishedAt: new Date().toISOString(),
        priority: ann.priority || 'Normal',
        targetAudience: ann.targetAudience || 'All',
        authorName: currentUser.name,
        pinned: ann.pinned || false,
      };
      setAnnouncements((prev) => [newAnn, ...prev]);

      dispatchNotification({
        recipientId: 'all',
        title: `Announcement: ${newAnn.title}`,
        message: newAnn.content.slice(0, 100) + '...',
        type: 'announcement',
      });

      logAudit('Announcement Published', `Published announcement "${newAnn.title}"`);
    },
    [currentUser, dispatchNotification, logAudit]
  );

  // Certificates
  const issueCertificate = useCallback(
    (cert: Partial<Certificate>): Certificate => {
      const certIdCode = `DIU-IIC-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newCert: Certificate = {
        id: `cert-${Date.now()}`,
        certificateId: certIdCode,
        ambassadorId: cert.ambassadorId || 'amb-1',
        ambassadorName: cert.ambassadorName || 'Tanvir Ahmed',
        title: cert.title || 'Certificate of Recognition',
        issueDate: cert.issueDate || new Date().toISOString().split('T')[0],
        certificateType: cert.certificateType || 'Outstanding Contribution',
        description: cert.description || 'Awarded for dedicated contribution to IIC initiatives.',
        verificationUrl: `https://iic.diu.edu.bd/verify/${certIdCode}`,
        qrCodeMock: `${certIdCode}-VERIFIED-OFFICIAL`,
        isPublic: cert.isPublic !== undefined ? cert.isPublic : true,
      };

      setCertificates((prev) => [newCert, ...prev]);

      dispatchNotification({
        recipientId: newCert.ambassadorId,
        title: `Certificate Issued: ${newCert.title}`,
        message: `Your verified certificate is ready. Verification ID: ${certIdCode}`,
        type: 'approval',
      });

      logAudit('Certificate Issued', `Issued certificate ${certIdCode} to ${newCert.ambassadorName}`);
      return newCert;
    },
    [dispatchNotification, logAudit]
  );

  // Bulk Email Broadcast
  const sendEmailBroadcast = useCallback(
    (data: { subject: string; body: string; recipientFilter: string; templateType: string }) => {
      // Calculate recipient count based on filter
      let count = ambassadors.length;
      if (data.recipientFilter === 'Below Target (<4h)') {
        count = ambassadors.filter((a) => getWeeklyMetrics(a.id).completedHours < 4.0).length;
      } else if (data.recipientFilter.startsWith('Group:')) {
        const group = data.recipientFilter.replace('Group:', '').trim();
        count = ambassadors.filter((a) => a.group === group).length;
      }

      const newBroadcast: EmailBroadcast = {
        id: `email-${Date.now()}`,
        subject: data.subject,
        body: data.body,
        recipientFilter: data.recipientFilter,
        recipientCount: Math.max(1, count),
        sentAt: new Date().toISOString(),
        sentBy: currentUser.name,
        templateType: data.templateType,
      };

      setEmailBroadcasts((prev) => [newBroadcast, ...prev]);
      logAudit(
        'Email Broadcast Dispatched',
        `Dispatched bulk email "${data.subject}" to ${count} recipients (${data.recipientFilter})`
      );
    },
    [ambassadors, currentUser, getWeeklyMetrics, logAudit]
  );

  // Notifications
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentAmbassador,
        allUsers,
        ambassadors,
        isAuthenticated,
        login,
        logout,
        quickLogin,
        switchUser,
        updateCurrentUserProfile,
        createManualAmbassador,
        bulkCreateAmbassadors,
        updateAmbassadorStatus,

        // User Management
        createUser,
        registerAmbassador,
        approveAmbassadorApplication,
        rejectAmbassadorApplication,
        pendingApplicationsCount,
        deleteUser,
        resetUserPassword,
        updateUser,
        updateUserProfile,

        activeTimer,
        activeTimerElapsedSeconds,
        punchIn,
        pauseTimer,
        resumeTimer,
        punchOut,
        cancelTimer,

        tasks,
        createTask,
        updateTask,
        updateTaskStatus,
        submitTask,
        reviewTask,
        reviewTaskSubmission: reviewTask,
        deleteTask,
        createCustomTask,
        bulkAssignTasks,

        timeEntries,
        manualTimeRequests,
        requestManualTime,
        reviewManualTime,

        getWeeklyMetrics,
        getMonthlyMetrics,
        getOverallMetrics,

        availabilityList,
        getAmbassadorAvailability,
        updateMyAvailability,

        projects,
        createProject,
        updateProject,
        assignAmbassadorToProject,
        removeAmbassadorFromProject,

        events,
        createEvent,
        assignAmbassadorToEvent,
        volunteerForEvent: (eventId: string, ambassadorId: string) => assignAmbassadorToEvent(eventId, ambassadorId, 'General Volunteer'),

        resources,
        addResource,
        createResource: addResource,
        deleteResource,
        announcements,
        createAnnouncement,

        certificates,
        issueCertificate,

        emailBroadcasts,
        sendEmailBroadcast,
        sendBroadcastNotification: (subject: string, message: string) => {
          sendEmailBroadcast({ subject, body: message, recipientFilter: 'All', templateType: 'Announcement' });
          dispatchNotification({ recipientId: 'all', title: subject, message, type: 'announcement' });
        },
        auditLogs,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        dispatchNotification,

        logoSettings,
        updateLogoSettings,
        resetLogoToDefault,

        activeView,
        setActiveView,
        selectedTaskId,
        setSelectedTaskId,
        selectedProjectId,
        setSelectedProjectId,
        selectedAmbassadorId,
        setSelectedAmbassadorId,
        publicVerifyCertificateId,
        setPublicVerifyCertificateId,

        isProfileEditModalOpen,
        setIsProfileEditModalOpen,
        profileEditUserId,
        setProfileEditUserId,
        openProfileEdit,

        firebaseSyncStatus,
        retryFirebaseSync,
        pushAllDataToFirebase,
        refreshFromFirestore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
