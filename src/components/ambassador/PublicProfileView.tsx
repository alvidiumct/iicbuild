import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ExternalLink,
  Award,
  CheckCircle,
  FolderGit2,
  Calendar,
  Share2,
  Copy,
  Check,
  Shield,
  Eye,
  EyeOff,
  Settings,
  Mail,
  Phone,
  Globe,
  Github,
  Linkedin,
  Edit3,
} from 'lucide-react';

export const PublicProfileView: React.FC = () => {
  const {
    currentAmbassador,
    ambassadors,
    selectedAmbassadorId,
    projects,
    tasks,
    certificates,
    events,
    getWeeklyMetrics,
    getOverallMetrics,
    updateCurrentUserProfile,
    currentUser,
    setPublicVerifyCertificateId,
    openProfileEdit,
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [privacyEditorOpen, setPrivacyEditorOpen] = useState(false);

  // Find the ambassador to show
  const targetAmbassadorId = selectedAmbassadorId || currentAmbassador?.id || ambassadors[0]?.id;
  const ambassador = ambassadors.find((a) => a.id === targetAmbassadorId) || ambassadors[0];

  const isOwner = currentAmbassador && currentAmbassador.id === ambassador.id;

  // Stats
  const ambTasks = tasks.filter((t) => t.assignedAmbassadorIds.includes(ambassador.id));
  const completedTasks = ambTasks.filter((t) => t.status === 'Completed');
  const ambProjects = projects.filter((p) => p.connectedAmbassadorIds.includes(ambassador.id));
  const ambCertificates = certificates.filter((c) => c.ambassadorId === ambassador.id);
  const ambEvents = events.filter((e) => e.assignedAmbassadorIds.includes(ambassador.id));
  const totalHours = getOverallMetrics(ambassador.id);

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}?profile=${ambassador.ambassadorId}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleTogglePrivacy = (field: keyof typeof ambassador.privacySettings) => {
    if (!isOwner) return;
    const newSettings = {
      ...ambassador.privacySettings,
      [field]: !ambassador.privacySettings[field],
    };
    updateCurrentUserProfile({ privacySettings: newSettings });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Controls / Verification Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">
            Verified University Ambassador Portfolio
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-xs font-mono font-bold text-[#214FA2]">
            {ambassador.ambassadorId}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyShareLink}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Digital CV</span>
              </>
            )}
          </button>

          {(isOwner || currentUser.role === 'ADMIN') && (
            <button
              onClick={() => openProfileEdit(ambassador.userId || ambassador.id)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          )}

          {isOwner && (
            <button
              onClick={() => setPrivacyEditorOpen(!privacyEditorOpen)}
              className="px-3 py-1.5 text-xs font-semibold text-[#214FA2] bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Privacy Controls</span>
            </button>
          )}
        </div>
      </div>

      {/* Privacy Drawer (if owner toggles it) */}
      {isOwner && privacyEditorOpen && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900">Digital CV Privacy Settings</h4>
              <p className="text-[11px] text-slate-500">
                Choose which personal information is publicly displayed on your digital CV.
              </p>
            </div>
            <button
              onClick={() => setPrivacyEditorOpen(false)}
              className="text-xs font-semibold text-slate-500 hover:underline"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border border-slate-200">
              <input
                type="checkbox"
                checked={ambassador.privacySettings.showEmail}
                onChange={() => handleTogglePrivacy('showEmail')}
                className="w-4 h-4 text-[#214FA2] rounded"
              />
              <span>Public Email</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border border-slate-200">
              <input
                type="checkbox"
                checked={ambassador.privacySettings.showSocials}
                onChange={() => handleTogglePrivacy('showSocials')}
                className="w-4 h-4 text-[#214FA2] rounded"
              />
              <span>Social & GitHub</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border border-slate-200">
              <input
                type="checkbox"
                checked={ambassador.privacySettings.showContributionStats}
                onChange={() => handleTogglePrivacy('showContributionStats')}
                className="w-4 h-4 text-[#214FA2] rounded"
              />
              <span>Contribution Hours</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border border-slate-200">
              <input
                type="checkbox"
                checked={ambassador.privacySettings.showCertificates}
                onChange={() => handleTogglePrivacy('showCertificates')}
                className="w-4 h-4 text-[#214FA2] rounded"
              />
              <span>Certificates</span>
            </label>
          </div>
        </div>
      )}

      {/* CV HERO HEADER CARD */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm shrink-0 bg-slate-100">
            <img
              src={ambassador.avatarUrl}
              alt={ambassador.fullName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{ambassador.university}</span>
              <span aria-hidden="true">·</span>
              <span>{ambassador.department}</span>
              <span aria-hidden="true">·</span>
              <span>Batch: {ambassador.batch}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {ambassador.fullName}
            </h1>

            <div className="text-xs font-semibold text-[#214FA2] flex items-center gap-2">
              <span>IIC Student Ambassador ({ambassador.group || 'Innovation Wing'})</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 font-normal">Joined {ambassador.joiningDate}</span>
            </div>

            {/* Contact & Social Links */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600">
              {ambassador.privacySettings.showEmail && (
                <a
                  href={`mailto:${ambassador.email}`}
                  className="flex items-center gap-1 hover:text-slate-900"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{ambassador.email}</span>
                </a>
              )}
              {ambassador.privacySettings.showSocials && ambassador.linkedInUrl && (
                <a
                  href={ambassador.linkedInUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-slate-900"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              )}
              {ambassador.privacySettings.showSocials && ambassador.gitHubUrl && (
                <a
                  href={ambassador.gitHubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-slate-900"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About</h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
            {ambassador.bio}
          </p>
        </div>

        {/* Contribution Scorecard Highlights */}
        {ambassador.privacySettings.showContributionStats && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Contribution</div>
              <div className="text-xl font-bold font-mono text-[#214FA2] mt-0.5">
                {totalHours} Hours
              </div>
              <span className="text-[10px] text-slate-500">Official verified effort</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-[10px] uppercase font-bold text-slate-400">Tasks Completed</div>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
                {completedTasks.length}
              </div>
              <span className="text-[10px] text-slate-500">Delivered & approved</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-[10px] uppercase font-bold text-slate-400">Connected Projects</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                {ambProjects.length}
              </div>
              <span className="text-[10px] text-slate-500">IIC innovations</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-[10px] uppercase font-bold text-slate-400">Events Supported</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                {ambEvents.length}
              </div>
              <span className="text-[10px] text-slate-500">Conferences & summits</span>
            </div>
          </div>
        )}
      </section>

      {/* SKILLS & EXPERTISE (Zero-Pill Discipline: unboxed typographic tags or clean chips) */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Core Technical & Innovation Skills
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-700">
          {ambassador.skills.map((skill, i) => (
            <React.Fragment key={skill}>
              <span className="font-semibold">{skill}</span>
              {i < ambassador.skills.length - 1 && (
                <span className="text-slate-300" aria-hidden="true">
                  /
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* CONTRIBUTED IIC PROJECTS */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              IIC Projects & Innovations
            </h3>
            <p className="text-xs text-slate-500">Verified research & development projects</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600">
            {ambProjects.length} Projects
          </span>
        </div>

        {ambProjects.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            No projects linked to this profile.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ambProjects.map((proj) => (
              <div
                key={proj.id}
                className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 flex flex-col justify-between"
              >
                <div className="h-32 w-full overflow-hidden bg-slate-200">
                  <img
                    src={proj.coverImage}
                    alt={proj.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-4 space-y-1.5 flex-1">
                  <div className="text-[10px] font-bold text-[#214FA2] uppercase">
                    {proj.category}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{proj.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>
                <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Status: <strong>{proj.status}</strong></span>
                  <span className="text-emerald-700 font-semibold">Verified Contributor</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* VERIFIED CERTIFICATES & RECOGNITION */}
      {ambassador.privacySettings.showCertificates && (
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Verified IIC Certificates
              </h3>
              <p className="text-xs text-slate-500">
                Cryptographically verifiable certificates issued by Industrial Innovation Centre
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600">
              {ambCertificates.length} Certificates
            </span>
          </div>

          {ambCertificates.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No certificates issued yet for this tenure.
            </div>
          ) : (
            <div className="space-y-3">
              {ambCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{cert.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{cert.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                        <span>ID: {cert.certificateId}</span>
                        <span>·</span>
                        <span>Issued: {cert.issueDate}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setPublicVerifyCertificateId(cert.certificateId)}
                    className="px-3.5 py-2 text-xs font-semibold text-[#214FA2] bg-white border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors shrink-0 flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>Verify Credentials</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
