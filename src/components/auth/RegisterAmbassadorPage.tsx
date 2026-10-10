import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DIU_DEPARTMENTS,
  DIU_FACULTIES,
  DIU_SEMESTERS,
} from '../../data/departments';
import { IICLogo } from '../common/IICLogo';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  CheckCircle2,
  AlertCircle,
  Camera,
  User,
  GraduationCap,
  Mail,
  Lock,
  Phone,
  FileCheck,
  ShieldCheck,
  Eye,
  EyeOff,
  Home,
  Clock,
  Sparkles,
} from 'lucide-react';

export const RegisterAmbassadorPage: React.FC = () => {
  const { registerAmbassador, setActiveView } = useApp();

  // Form State
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [batch, setBatch] = useState('62');
  const [semester, setSemester] = useState(DIU_SEMESTERS[0]);
  const [department, setDepartment] = useState(DIU_DEPARTMENTS[0].name);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Photo State - No sample presets, user uploads their own image
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    studentId: string;
    department: string;
    batch: string;
    semester: string;
    avatarUrl: string;
    email: string;
    appRef: string;
  } | null>(null);

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please upload an image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image size should be less than 5 MB.');
      return;
    }

    setPhotoError(null);
    setIsUploadingPhoto(true);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        setPhotoFileName(file.name);
      }
      setIsUploadingPhoto(false);
    };
    reader.onerror = () => {
      setPhotoError('Failed to read image file. Please try another picture.');
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    setPhotoFileName('');
    setPhotoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full official name.');
      return;
    }

    if (!studentId.trim()) {
      setErrorMessage('Please enter your DIU Student ID.');
      return;
    }

    if (!batch.trim()) {
      setErrorMessage('Please enter your batch number.');
      return;
    }

    if (!department.trim()) {
      setErrorMessage('Please select your academic department.');
      return;
    }

    if (!semester.trim()) {
      setErrorMessage('Please select your current semester.');
      return;
    }

    if (!avatarUrl) {
      setErrorMessage('Please upload your official formal picture before submitting.');
      return;
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please provide a valid DIU email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsSubmitting(true);

    const formattedBatch = `Batch ${batch.trim()}`;
    const skillsArray = ['Student Ambassador', 'Industrial Innovation'];

    setTimeout(() => {
      const res = registerAmbassador({
        fullName: fullName.trim(),
        studentId: studentId.trim(),
        batch: formattedBatch,
        semester: semester.trim(),
        department: department.trim(),
        avatarUrl,
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        skills: skillsArray,
      });

      setIsSubmitting(false);

      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed. Please review your details.');
      } else {
        setSubmittedData({
          name: fullName.trim(),
          studentId: studentId.trim(),
          department: department.trim(),
          batch: formattedBatch,
          semester: semester.trim(),
          avatarUrl,
          email: email.trim().toLowerCase(),
          appRef: `IIC-APP-${Math.floor(1000 + Math.random() * 9000)}`,
        });
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0c1930] to-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-slate-100 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <IICLogo size="md" />
          <div>
            <div className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
              <span>Industrial Innovation Centre</span>
              <span className="text-[10px] font-semibold text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded-full border border-blue-700/50">
                DIU
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Daffodil International University · Student Ambassador Onboarding
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('login')}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Already have an account? Sign In</span>
          </button>
        </div>
      </div>

      {/* Main Registration Container */}
      <div className="max-w-4xl w-full mx-auto my-6">
        {submittedData ? (
          // SUCCESS / PENDING APPROVAL CONFIRMATION SCREEN
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Status: Application Under Admin Review</span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Application Submitted Successfully!
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Thank you for applying to the <span className="font-semibold text-[#214FA2]">IIC Student Ambassador Program</span>. 
                Your registration has been submitted to DIU Centre Administration for cohort review and credential verification.
              </p>
            </div>

            {/* Applicant Summary Card */}
            <div className="mt-8 bg-slate-50 rounded-xl p-5 border border-slate-200 max-w-xl mx-auto">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md bg-slate-200 shrink-0">
                  <img
                    src={submittedData.avatarUrl}
                    alt={submittedData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {submittedData.name}
                  </div>
                  <div className="text-xs text-slate-600 font-mono mt-0.5">
                    Student ID: {submittedData.studentId}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {submittedData.department}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 block">Ref Code</span>
                  <span className="text-xs font-mono font-bold text-[#214FA2]">
                    {submittedData.appRef}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block">Batch</span>
                  <span className="font-semibold text-slate-800">{submittedData.batch}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Semester</span>
                  <span className="font-semibold text-slate-800">{submittedData.semester}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[11px] text-slate-500 block">Email Address</span>
                  <span className="font-semibold text-slate-800 font-mono">{submittedData.email}</span>
                </div>
              </div>
            </div>

            {/* Next Steps Guide */}
            <div className="mt-6 max-w-xl mx-auto p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-2">
              <div className="font-bold flex items-center gap-2 text-blue-950">
                <ShieldCheck className="w-4 h-4 text-[#214FA2]" />
                <span>What Happens Next?</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1 text-[11px] leading-relaxed">
                <li>
                  <span className="font-semibold">Administrative Approval</span>: The IIC Director and Centre Admins will review your formal photo and student verification details.
                </li>
                <li>
                  <span className="font-semibold">Set Your Duty Schedule</span>: Once approved, your account will be activated immediately and you can sign in to set your weekly duty schedule and lab hours.
                </li>
                <li>
                  <span className="font-semibold">Need Urgent Activation?</span> Contact DIU IIC Innovation Complex desk at Ashulia Smart Campus.
                </li>
              </ul>
            </div>

            {/* Navigation Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setActiveView('login')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#214FA2] hover:bg-[#1a3f85] text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Portal Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Public Homepage</span>
              </button>
            </div>
          </div>
        ) : (
          // REGISTRATION FORM
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200/90 text-slate-900">
            <div className="mb-6 pb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Register as Student Ambassador
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Complete your student profile to apply for the Industrial Innovation Centre Ambassador Cohort
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#214FA2] text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Approval Required</span>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: OFFICIAL FORMAL PROFILE PICTURE (USER UPLOADS OWN IMAGE) */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#214FA2]" />
                      <span>Official Formal Picture (Profile Photo) *</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload your official formal passport-style photo. A clean background and formal/business attire are required.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Mandatory
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Photo Preview / Upload Area */}
                  <div className="md:col-span-4 flex flex-col items-center">
                    {avatarUrl ? (
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md bg-white">
                          <img
                            src={avatarUrl}
                            alt="Formal Profile Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="mt-2 text-center">
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Photo Selected
                          </span>
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[150px] mt-1">
                            {photoFileName}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#214FA2] bg-white hover:bg-blue-50/40 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors p-3 text-center"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600">
                          Click to Upload
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls & Guidelines */}
                  <div className="md:col-span-8 space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="px-4 py-2 rounded-lg bg-[#214FA2] hover:bg-[#1a3f85] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {isUploadingPhoto
                            ? 'Uploading...'
                            : avatarUrl
                            ? 'Change Uploaded Photo'
                            : 'Upload Formal Picture'}
                        </span>
                      </button>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>

                    {photoError && (
                      <p className="text-[11px] text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{photoError}</span>
                      </p>
                    )}

                    {/* Official Formal Guidelines */}
                    <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 text-[11px] text-slate-700 space-y-1">
                      <div className="font-semibold text-blue-900 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#214FA2]" />
                        <span>Official Formal Photo Guidelines:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1 leading-relaxed">
                        <li>Neutral / plain background (white, off-white, light gray or blue).</li>
                        <li>Formal attire (shirt/blazer/suit/formal university dress).</li>
                        <li>Clear forward-facing headshot (no sunglasses, caps, or group pictures).</li>
                        <li>Accepted formats: JPG, PNG, or WebP (up to 5 MB).</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: ACADEMIC DETAILS */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#214FA2]" />
                  <span>Academic & University Credentials</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Official Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Tanvir Ahmed Chowdhury"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Student ID */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      DIU Student ID *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="e.g. 221-15-12345"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {/* Batch Number Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Batch Number *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      placeholder="e.g. 62"
                      className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] transition-colors"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Enter your numeric batch (e.g. 62)
                    </span>
                  </div>

                  {/* Semester Dropdown (Clean, no parentheses) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Semester *
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] transition-colors bg-white cursor-pointer"
                    >
                      {DIU_SEMESTERS.map((sem) => (
                        <option key={sem} value={sem}>
                          {sem}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department (Full DIU List organized under Faculties) */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Academic Department *
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] transition-colors bg-white cursor-pointer"
                    >
                      {DIU_FACULTIES.map((faculty) => (
                        <optgroup key={faculty} label={faculty}>
                          {DIU_DEPARTMENTS.filter((d) => d.faculty === faculty).map((dept) => (
                            <option key={dept.name} value={dept.name}>
                              {dept.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: LOGIN & CONTACT INFORMATION */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#214FA2]" />
                  <span>Account Credentials & Contact</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      DIU Email Address (Login ID) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. tanvir.swe@diu.edu.bd"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Phone / WhatsApp Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +880 1712-345678"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Portal Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password (min 6 characters)"
                        className="w-full text-xs pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full text-xs pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Governance & Duty Schedule Notice */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#214FA2]" />
                  <span>Duty Schedules & Approval Flow:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  After submitting, your application will be verified by DIU IIC Centre Administration. Once approved, you will be able to log in, configure your weekly duty availability schedule, punch into innovation projects, and earn certified service credits.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setActiveView('login')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer order-2 sm:order-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel and return to Sign In</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#214FA2] hover:bg-[#1a3f85] text-white font-semibold text-xs shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer order-1 sm:order-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Ambassador Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-4xl w-full mx-auto text-center pt-4 border-t border-slate-800 text-[11px] text-slate-500">
        © {new Date().getFullYear()} Industrial Innovation Centre (IIC) · Daffodil International University · Smart Campus Ashulia
      </div>
    </div>
  );
};
