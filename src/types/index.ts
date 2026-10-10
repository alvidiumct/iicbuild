export type UserRole = 'ADMIN' | 'AMBASSADOR';

export type AmbassadorStatus = 'Active' | 'Pending' | 'Inactive' | 'Suspended' | 'Completed';

export type TaskStatus =
  | 'Assigned'
  | 'Accepted'
  | 'In Progress'
  | 'Submitted'
  | 'Under Review'
  | 'Completed'
  | 'Revision Required'
  | 'Rejected'
  | 'Cancelled'
  | 'Overdue';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TaskCategory =
  | 'Hardware & Prototyping'
  | 'Software Development'
  | 'Content & Media'
  | 'UI/UX Design'
  | 'Event & Logistics'
  | 'Research & Documentation'
  | 'Industry Relations'
  | 'Community Outreach';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  ambassadorId?: string;
  createdAt: string;
  password?: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
  department?: string;
  studentId?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  portfolioUrl?: string;
  linkedInUrl?: string;
  gitHubUrl?: string;
}

export interface AmbassadorProfile {
  id: string;
  userId: string;
  ambassadorId: string; // e.g. IIC-AMB-2026-001
  fullName: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  program: string;
  studentId: string;
  batch: string;
  graduationYear: string;
  location: string;
  joiningDate: string;
  status: AmbassadorStatus;
  avatarUrl: string;
  bio: string;
  skills: string[];
  interests: string[];
  areasOfExpertise: string[];
  portfolioUrl?: string;
  linkedInUrl?: string;
  gitHubUrl?: string;
  websiteUrl?: string;
  group?: string; // e.g. "Tech & Prototyping", "Design & Media", "Event Operations"
  onboardingCompleted: boolean;
  privacySettings: {
    showEmail: boolean;
    showPhone: boolean;
    showSocials: boolean;
    showAvailability: boolean;
    showContributionStats: boolean;
    showProjects: boolean;
    showCertificates: boolean;
  };
}

export interface TaskAuditEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  note?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  instructions: string;
  assignedByAdminId: string;
  assignedByAdminName: string;
  assignedAmbassadorIds: string[];
  assignedGroup?: string;
  projectId?: string;
  projectTitle?: string;
  category: TaskCategory;
  priority: TaskPriority;
  startDate: string;
  deadline: string;
  estimatedHours: number;
  actualHours: number;
  status: TaskStatus;
  attachments?: { name: string; url: string; size: string }[];
  externalLinks?: { label: string; url: string }[];
  submission?: {
    submittedAt: string;
    submittedByAmbassadorId: string;
    submittedByName: string;
    notes: string;
    deliverableLinks?: string[];
    files?: string[];
  };
  reviewNotes?: string;
  reviewedByAdminName?: string;
  reviewedAt?: string;
  auditTrail: TaskAuditEntry[];
  isCustomTask?: boolean;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  ambassadorId: string;
  ambassadorName: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  pauseDurationSeconds: number;
  totalActiveSeconds: number;
  date: string; // YYYY-MM-DD
  isManual: boolean;
  isApproved: boolean;
  notes?: string;
}

export interface ManualTimeRequest {
  id: string;
  ambassadorId: string;
  ambassadorName: string;
  taskId: string;
  taskTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminFeedback?: string;
}

export interface DayAvailability {
  day: 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  isAvailable: boolean;
  slots: { startTime: string; endTime: string }[];
  notes?: string;
}

export interface AmbassadorAvailability {
  ambassadorId: string;
  weeklySchedule: DayAvailability[];
  temporaryNote?: string;
  lastUpdated: string;
}

export interface IICProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  objectives: string[];
  background: string;
  leadInCharge: string;
  startDate: string;
  status: 'Active' | 'Under R&D' | 'Testing' | 'Completed' | 'Ideation' | 'Prototyping' | 'Deployed' | 'Published';
  category: string;
  coverImage: string;
  outcomes: string[];
  connectedAmbassadorIds: string[];
  galleryImages: string[];
  documents: { title: string; type: string; url: string }[];
  tags?: string[];
}

export type Project = IICProject;
export type ProjectStage = 'Active' | 'Under R&D' | 'Testing' | 'Completed' | 'Ideation' | 'Prototyping' | 'Deployed' | 'Published';

export interface IICEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  startTime?: string;
  endTime?: string;
  venue: string;
  category: string;
  image?: string;
  assignedAmbassadorIds: string[];
  volunteerRoles: { roleTitle: string; ambassadorId?: string; ambassadorName?: string }[];
  creditHours: number;
  creditedHours?: number;
  requiredAmbassadors?: number;
  status: 'Upcoming' | 'In Progress' | 'Completed';
}

export type EventItem = IICEvent;

export interface CommunityResource {
  id: string;
  title: string;
  category:
    | 'Learning Resources'
    | 'IIC Documents'
    | 'Brand Assets'
    | 'Design Resources'
    | 'Media Kit'
    | 'Training Materials'
    | 'Important Guidelines'
    | 'Branding & Identity'
    | 'Project Documentation'
    | 'Code of Conduct'
    | 'Patenting & IPR'
    | 'Academic Publications';
  description: string;
  fileType: 'PDF' | 'DOCX' | 'PPTX' | 'ZIP' | 'IMAGE' | 'LINK' | string;
  fileSize: string;
  downloadUrl: string;
  uploadedAt: string;
  accessRestricted: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  targetAudience: 'All' | 'Tech Team' | 'Design Team' | 'Event Team' | 'All Ambassadors';
  authorName: string;
  pinned: boolean;
}

export interface Certificate {
  id: string;
  certificateId: string; // e.g. DIU-IIC-CERT-2026-0812
  ambassadorId: string;
  ambassadorName: string;
  title: string;
  issueDate: string;
  certificateType: 'Outstanding Contribution' | 'Project Excellence' | 'Tenure Completion' | 'Event Honor' | string;
  description: string;
  verificationUrl: string;
  qrCodeMock: string;
  isPublic: boolean;
  contributionHours?: number;
  signatoryName?: string;
  signatoryTitle?: string;
}

export type Ambassador = AmbassadorProfile;

export interface Achievement {
  id: string;
  title: string;
  badgeName: string;
  description: string;
  earnedDate: string;
  iconName: string;
}

export interface AppNotification {
  id: string;
  recipientId: string; // 'all' or specific ambassador id
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'task' | 'reminder' | 'approval' | 'announcement' | 'event';
  actionUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface EmailBroadcast {
  id: string;
  subject: string;
  body: string;
  recipientFilter: string;
  recipientCount: number;
  sentAt: string;
  sentBy: string;
  templateType: string;
}
