import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { IICLogo } from '../common/IICLogo';
import {
  Settings,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  Award,
  Lock,
  Layers,
  Sliders,
  Bell,
  Globe,
  Database,
  Cloud,
  AlertTriangle,
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const {
    logoSettings,
    updateLogoSettings,
    resetLogoToDefault,
    currentUser,
    firebaseSyncStatus,
    retryFirebaseSync,
    pushAllDataToFirebase,
  } = useApp();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPushingTables, setIsPushingTables] = useState<boolean>(false);
  const [pushFeedback, setPushFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePushAllTables = async () => {
    setIsPushingTables(true);
    setPushFeedback(null);
    const res = await pushAllDataToFirebase();
    setIsPushingTables(false);
    if (res.success) {
      setPushFeedback({
        success: true,
        message: `Successfully installed and synced ${res.count} documents to Firebase iicambasa Firestore! All tables (users, ambassadors, projects, availability, tasks, announcements, branding) are now active in the cloud.`,
      });
    } else {
      setPushFeedback({
        success: false,
        message: res.error || 'Failed to sync tables. Check Firestore Rules in Firebase console.',
      });
    }
  };

  const adminCredentials = {
    email: 'iicdaffodil@gmail.com',
    password: 'iic@2026',
    altPassword: 'admin#iic@2026',
    role: 'ADMIN',
    name: 'Dr. Mahfuzur Rahman',
    designation: 'Director, Industrial Innovation Centre (DIU)',
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be under 5 MB.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateLogoSettings({
          useIICLogo: true,
          logoUrl: result,
          logoType: 'custom',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    updateLogoSettings({
      useIICLogo: true,
      logoUrl: customUrlInput.trim(),
      logoType: 'custom',
    });
    setCustomUrlInput('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-[#214FA2]">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Platform & System Settings
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure DIU IIC brand identity, logo display preferences, and view administrative access credentials
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetLogoToDefault}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Restore official DIU IIC emblem"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Restore Default Emblem</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: ADMIN CREDENTIALS CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0d1e3d] to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <KeyRound className="w-48 h-48" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Official Centre Administrator Credentials
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Full System Access
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Use these credentials to sign into the IIC Platform with full governance authority
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Active Administrator: <span className="text-white font-semibold">{adminCredentials.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            {/* Admin Email Box */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Admin Login ID (Email)
                </div>
                <div className="text-sm font-mono font-bold text-white select-all">
                  {adminCredentials.email}
                </div>
                <div className="text-[10px] text-blue-300">
                  Daffodil International University Official
                </div>
              </div>

              <button
                onClick={() => handleCopy(adminCredentials.email, 'email')}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Copy Email"
              >
                {copiedField === 'email' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Admin Password Box */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Admin Password
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-mono font-bold text-white select-all">
                    {showPassword ? adminCredentials.password : '•••••••••••••'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-[10px] text-emerald-300">
                  Also accepts quick alias: <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">{adminCredentials.altPassword}</code>
                </div>
              </div>

              <button
                onClick={() => handleCopy(adminCredentials.password, 'password')}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Copy Password"
              >
                {copiedField === 'password' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Admin Capabilities: Application Approvals · Weekly Availability Governance · Certificate Issuance · Audit Trail</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Role: <span className="text-white font-semibold">ADMIN</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: FIREBASE CLOUD DATABASE (iicambasa) & REALTIME SYNC */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Firebase Cloud Firestore Database
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#214FA2] border border-blue-200 text-[10px] font-mono font-bold">
                  iicambasa
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized cloud database syncing all ambassador signups, applications, duty matrices, and project records in real time
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePushAllTables}
              disabled={isPushingTables}
              className="px-3.5 py-1.5 rounded-lg bg-[#214FA2] hover:bg-[#1a3f85] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
            >
              <Database className={`w-3.5 h-3.5 ${isPushingTables ? 'animate-spin' : ''}`} />
              <span>{isPushingTables ? 'Pushing All Tables...' : 'Push All Data to Firebase'}</span>
            </button>

            <button
              onClick={() => retryFirebaseSync()}
              disabled={firebaseSyncStatus.isSyncing}
              className="px-3.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${firebaseSyncStatus.isSyncing ? 'animate-spin' : ''}`} />
              <span>{firebaseSyncStatus.isSyncing ? 'Syncing...' : 'Resync Cloud Database'}</span>
            </button>
          </div>
        </div>

        {/* Push Feedback Banner */}
        {pushFeedback && (
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in ${
              pushFeedback.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {pushFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium">{pushFeedback.message}</div>
          </div>
        )}

        {/* Sync Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Connection Status
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  firebaseSyncStatus.connected
                    ? 'bg-emerald-500'
                    : firebaseSyncStatus.rulesNeedUpdate
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-blue-500'
                }`}
              />
              <span className="text-sm font-bold text-slate-900">
                {firebaseSyncStatus.connected
                  ? 'Realtime Cloud Sync Active'
                  : firebaseSyncStatus.rulesNeedUpdate
                  ? 'Firestore Rules Pending'
                  : 'Connected to iicambasa'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Host: <code className="font-mono text-slate-700">iicambasa.firebaseapp.com</code>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active Tables / Collections
            </div>
            <div className="text-sm font-bold text-slate-900">
              6 Collections Auto-Synced
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              users · ambassadors · projects · availability · tasks · settings
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Multi-Device Live Sync
            </div>
            <div className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cross-Device Instant Updates</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Signups from any student device stream directly into your admin review queue.
            </p>
          </div>
        </div>

        {/* What Else Do I Have to Do Guide */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-[#214FA2]" />
              <h3 className="text-xs font-bold text-slate-900">
                What Else You Need to Do in Firebase Console (1-Minute Quick Setup)
              </h3>
            </div>
            <a
              href="https://console.firebase.google.com/project/iicambasa/firestore"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-[#214FA2] hover:underline flex items-center gap-1"
            >
              <span>Open Firebase Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            The app code is <strong>100% connected</strong> to your Firebase project <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-900 font-bold">iicambasa</code>. To ensure any device can register without permission blocks, verify these 2 steps in your console:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-2xs space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#214FA2] text-white flex items-center justify-center text-[10px]">1</span>
                <span>Ensure Cloud Firestore Database is Created</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                In Firebase Console, go to <strong>Build &gt; Firestore Database</strong>. If you haven't clicked "Create Database" yet, click it and choose standard settings.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-2xs space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#214FA2] text-white flex items-center justify-center text-[10px]">2</span>
                <span>Allow Read &amp; Write in Firestore Rules</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Go to the <strong>Rules</strong> tab and set the rules to allow read &amp; write (see code snippet below), then click <strong>Publish</strong>.
              </p>
            </div>
          </div>

          {/* Copyable Rules Snippet */}
          <div className="mt-2 p-3 bg-slate-900 rounded-lg text-slate-100 text-xs font-mono relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span>firestore.rules</span>
              <button
                onClick={() =>
                  handleCopy(
                    `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`,
                    'rules'
                  )
                }
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1 cursor-pointer transition-colors text-[10px]"
              >
                {copiedField === 'rules' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Rules</span>
                  </>
                )}
              </button>
            </div>
            <pre className="pt-2 text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* SECTION 3: IIC LOGO CONFIGURATION & DISPLAY CONTROL */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-[#214FA2]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                IIC Logo & Brand Identity Settings
              </h2>
              <p className="text-xs text-slate-500">
                Choose to display the official Industrial Innovation Centre logo everywhere across the application
              </p>
            </div>
          </div>

          {/* Master Toggle */}
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-700">
              Display IIC Logo Everywhere:
            </span>
            <button
              onClick={() => updateLogoSettings({ useIICLogo: !logoSettings.useIICLogo })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                logoSettings.useIICLogo ? 'bg-[#214FA2]' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={logoSettings.useIICLogo}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  logoSettings.useIICLogo ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-xs font-bold ${
                logoSettings.useIICLogo ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              {logoSettings.useIICLogo ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
        </div>

        {/* Current Active Logo Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Active Emblem Card */}
          <div className="lg:col-span-5 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span>Current Active Logo</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#214FA2] text-[10px] font-semibold">
                {logoSettings.logoType === 'official' ? 'Official DIU IIC Emblem' : 'Custom Upload'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-slate-200 shadow-inner min-h-[180px]">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white shadow-md border-2 border-slate-100 p-1 flex items-center justify-center">
                <img
                  src={logoSettings.logoUrl}
                  alt="Active IIC Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mt-3 text-center">
                <div className="text-xs font-bold text-slate-800">
                  Industrial Innovation Centre (IIC)
                </div>
                <div className="text-[11px] text-slate-500">
                  Daffodil International University · Smart Campus
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={resetLogoToDefault}
                className="w-full py-2 px-3 rounded-lg border border-slate-300 hover:bg-white text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset to Official Emblem</span>
              </button>
            </div>
          </div>

          {/* Change or Upload Logo Controls */}
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Customize Logo Source
            </div>

            {/* Option 1: File Upload */}
            <div className="p-4 rounded-xl border border-slate-200 hover:border-[#214FA2] transition-colors bg-white">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#214FA2]" />
                    <span>Upload Custom IIC Logo</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Upload your institution's transparent PNG, SVG, or high-resolution emblem
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#214FA2] hover:bg-[#1a3f85] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose File</span>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleCustomFileUpload}
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
              />

              {uploadError && (
                <div className="mt-2 text-[11px] text-red-600 font-medium">
                  {uploadError}
                </div>
              )}
            </div>

            {/* Option 2: Image URL input */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <form onSubmit={handleApplyCustomUrl} className="space-y-2">
                <label className="block text-xs font-bold text-slate-900">
                  Or Provide Custom Logo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://example.diu.edu.bd/assets/iic-logo.png"
                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </form>
            </div>

            {/* Option 3: Presets */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
              <div className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#214FA2]" />
                <span>Included Official Assets</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetLogoToDefault}
                  className="p-2 rounded-lg bg-white border border-blue-200 hover:border-blue-400 flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-white p-0.5">
                    <img
                      src="/src/assets/images/iic_official_logo_1791605685128.jpg"
                      alt="Official Emblem"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-800">DIU IIC Official Emblem</div>
                    <div className="text-[10px] text-slate-500">Default circular university crest</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview: How it appears everywhere in the app */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#214FA2]" />
            <span>Live Demonstration: How the Logo Displays Everywhere</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Header Preview */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-[11px] font-bold text-slate-600 uppercase">
                1. Main Top Navigation Bar
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-xs flex items-center justify-between">
                <IICLogo size="sm" showText={true} />
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                  Preview
                </span>
              </div>
            </div>

            {/* Sidebar Preview */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-[11px] font-bold text-slate-600 uppercase">
                2. Ambassador Portal Sidebar
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-xs flex items-center gap-2">
                <IICLogo size="md" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">Industrial Innovation Centre</div>
                  <div className="text-[10px] text-slate-500">Student Ambassador Portal</div>
                </div>
              </div>
            </div>

            {/* Certificate Preview */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-[11px] font-bold text-slate-600 uppercase">
                3. Issued Certificates & Verification
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-xs flex items-center gap-3">
                <IICLogo size="lg" />
                <div>
                  <div className="text-[11px] font-mono text-blue-800 font-bold">CERT-2026-VERIFIED</div>
                  <div className="text-[10px] text-slate-600">Industrial Innovation Centre · DIU</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: SYSTEM NOTIFICATIONS & SCHEDULING GOVERNANCE */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Ambassador Program Operations & Schedules
            </h2>
            <p className="text-xs text-slate-500">
              Rules governing student applications, availability schedule submission, and service hour validation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin Application Review</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Every new ambassador signup is set to <span className="font-semibold text-amber-700">Pending</span> until reviewed and approved by an administrator in the User Management tab.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#214FA2]" />
              <span>Weekly Availability Duty Matrix</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Approved ambassadors can customize their hourly availability slots across all 7 days with custom recurring shifts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Certified Service Credits</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Approved hours punch directly into DIU verified service certificates with unique QR and alphanumeric lookup codes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
