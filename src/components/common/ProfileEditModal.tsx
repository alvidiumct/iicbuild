import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Camera, Check, Upload, Link as LinkIcon, User, Sparkles } from 'lucide-react';

const PRESET_AVATARS = [
  '/src/assets/images/avatar_ambassador_lead_1790178208374.jpg',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
];

export const ProfileEditModal: React.FC = () => {
  const {
    isProfileEditModalOpen,
    setIsProfileEditModalOpen,
    profileEditUserId,
    allUsers,
    ambassadors,
    updateUserProfile,
    currentUser,
  } = useApp();

  // Find target user and linked ambassador profile
  const targetUser = allUsers.find((u) => u.id === (profileEditUserId || currentUser.id)) || currentUser;
  const targetAmbassador = ambassadors.find(
    (a) => a.userId === targetUser.id || a.email === targetUser.email || a.id === targetUser.id
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [gitHubUrl, setGitHubUrl] = useState('');
  const [avatarTab, setAvatarTab] = useState<'presets' | 'url' | 'upload'>('presets');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Populate form on open
  useEffect(() => {
    if (isProfileEditModalOpen && targetUser) {
      setName(targetUser.name || '');
      setEmail(targetUser.email || '');
      setPhone(targetUser.phone || targetAmbassador?.phone || '');
      setDepartment(targetUser.department || targetAmbassador?.department || '');
      setStudentId(targetUser.studentId || targetAmbassador?.studentId || '');
      setBio(targetUser.bio || targetAmbassador?.bio || '');
      setAvatarUrl(targetUser.avatarUrl || targetAmbassador?.avatarUrl || PRESET_AVATARS[0]);
      
      const currentSkills = targetAmbassador?.skills || targetUser.skills || ['Innovation', 'Leadership'];
      setSkillsList(currentSkills);
      setPortfolioUrl(targetAmbassador?.portfolioUrl || targetUser.portfolioUrl || '');
      setLinkedInUrl(targetAmbassador?.linkedInUrl || targetUser.linkedInUrl || '');
      setGitHubUrl(targetAmbassador?.gitHubUrl || targetUser.gitHubUrl || '');
      setSaveSuccess(false);
    }
  }, [isProfileEditModalOpen, targetUser, targetAmbassador]);

  if (!isProfileEditModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use FileReader for instant client-side preview
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = skillsInput.trim();
      if (trimmed && !skillsList.includes(trimmed)) {
        setSkillsList([...skillsList, trimmed]);
        setSkillsInput('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    updateUserProfile(targetUser.id, {
      name,
      fullName: name,
      email,
      phone,
      department,
      studentId: targetUser.role === 'AMBASSADOR' ? studentId : undefined,
      bio,
      avatarUrl,
      skills: skillsList,
      portfolioUrl: portfolioUrl || undefined,
      linkedInUrl: linkedInUrl || undefined,
      gitHubUrl: gitHubUrl || undefined,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setIsProfileEditModalOpen(false);
      setSaveSuccess(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#214FA2]">
              <User className="w-3.5 h-3.5" />
              <span>{targetUser.role === 'ADMIN' ? 'Centre Administrator Profile' : 'Ambassador Digital Profile'}</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900">
              Edit Profile & Credentials
            </h3>
          </div>
          <button
            onClick={() => setIsProfileEditModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {/* Avatar Section */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Profile Photo & Avatar
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Current Preview */}
              <div className="relative group shrink-0">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#214FA2] shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PRESET_AVATARS[0];
                  }}
                />
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-[#214FA2] text-white rounded-full shadow-md">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Avatar Options Selector */}
              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setAvatarTab('presets')}
                    className={`pb-1 transition-colors ${
                      avatarTab === 'presets'
                        ? 'text-[#214FA2] border-b-2 border-[#214FA2] font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Preset Avatars
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarTab('upload')}
                    className={`pb-1 transition-colors ${
                      avatarTab === 'upload'
                        ? 'text-[#214FA2] border-b-2 border-[#214FA2] font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Upload Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarTab('url')}
                    className={`pb-1 transition-colors ${
                      avatarTab === 'url'
                        ? 'text-[#214FA2] border-b-2 border-[#214FA2] font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Image URL
                  </button>
                </div>

                {avatarTab === 'presets' && (
                  <div className="flex flex-wrap gap-2.5">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(preset)}
                        className={`relative rounded-full p-0.5 transition-all ${
                          avatarUrl === preset ? 'ring-2 ring-[#214FA2] scale-105' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={preset}
                          alt="Preset"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {avatarTab === 'upload' && (
                  <div>
                    <label className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors w-fit">
                      <Upload className="w-4 h-4 text-[#214FA2]" />
                      <span>Choose Image from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, or WebP up to 5MB.</p>
                  </div>
                )}

                {avatarTab === 'url' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Basic Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1712-345678"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Program
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Software Engineering (SWE)"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
              />
            </div>

            {targetUser.role === 'AMBASSADOR' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="221-35-891"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden font-mono"
                />
              </div>
            )}
          </div>

          {/* Bio / Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bio & Background
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the centre about your research interests, technical specialization, and goals..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Skills Tag Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Skills & Technical Specialties (Press Enter or comma to add)
            </label>
            <div className="p-2 border border-slate-300 rounded-lg space-y-2 bg-white">
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-[#214FA2] border border-blue-200 px-2 py-0.5 rounded"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-red-600 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="e.g. IoT Architecture, Figma, React, PCB Design..."
                className="w-full text-xs p-1 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Portfolios & Profiles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  value={gitHubUrl}
                  onChange={(e) => setGitHubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Portfolio / Website
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://portfolio.me"
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsProfileEditModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-all flex items-center gap-1.5 shadow-sm ${
                saveSuccess ? 'bg-emerald-600' : 'bg-[#214FA2] hover:bg-[#1a3f85]'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
