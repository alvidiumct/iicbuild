import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { IICProject, AmbassadorProfile, ProjectStage } from '../../types';
import {
  FolderGit2,
  Users,
  Search,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Award,
  CheckCircle2,
  Filter,
  BookOpen,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Github,
  Linkedin,
  ShieldCheck,
  Download,
  X,
  Layers,
  Lightbulb,
  Share2,
  Check,
  ChevronRight,
  TrendingUp,
  FileText,
  User,
  GraduationCap,
  Server,
} from 'lucide-react';

export const Homepage: React.FC = () => {
  const {
    projects,
    ambassadors,
    currentUser,
    setActiveView,
    setSelectedAmbassadorId,
    setSelectedProjectId,
    setPublicVerifyCertificateId,
    tasks,
    certificates,
    events,
    isAuthenticated,
    setIsVpsModalOpen,
  } = useApp();

  // Project Filtering & Search
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedProjectModal, setSelectedProjectModal] = useState<IICProject | null>(null);

  // Ambassador Filtering & Search
  const [ambassadorSearch, setAmbassadorSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [ambassadorSort, setAmbassadorSort] = useState<'name' | 'department' | 'batch'>('name');
  const [previewAmbassador, setPreviewAmbassador] = useState<AmbassadorProfile | null>(null);
  const [copiedLinkAmbId, setCopiedLinkAmbId] = useState<string | null>(null);

  // Compute overall stats
  const totalProjectsCount = projects.length;
  const activeProjectsCount = projects.filter((p) => p.status === 'Active' || p.status === 'Testing' || p.status === 'Prototyping').length;
  const totalAmbassadorsCount = ambassadors.length;
  const activeAmbassadorsCount = ambassadors.filter((a) => a.status === 'Active').length;

  // Filter Categories list
  const projectCategories = useMemo(() => {
    const cats = Array.from(new Set(projects.map((p) => p.category)));
    return ['All', ...cats];
  }, [projects]);

  const projectStages: Array<string> = ['All', 'Active', 'Under R&D', 'Testing', 'Prototyping', 'Completed'];

  // Departments list
  const departments = useMemo(() => {
    const depts = Array.from(new Set(ambassadors.map((a) => a.department)));
    return ['All', ...depts];
  }, [ambassadors]);

  const groups = ['All', 'Tech & Prototyping', 'Design & Media', 'CleanTech Grid', 'Event Operations'];

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = projectSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.leadInCharge.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)));

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesStage = selectedStage === 'All' || p.status === selectedStage;

      return matchesSearch && matchesCat && matchesStage;
    });
  }, [projects, projectSearch, selectedCategory, selectedStage]);

  // Filtered Ambassadors
  const filteredAmbassadors = useMemo(() => {
    const result = ambassadors.filter((a) => {
      const q = ambassadorSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.fullName.toLowerCase().includes(q) ||
        a.ambassadorId.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q) ||
        a.studentId.toLowerCase().includes(q) ||
        a.skills.some((s) => s.toLowerCase().includes(q)) ||
        (a.bio && a.bio.toLowerCase().includes(q));

      const matchesDept = selectedDepartment === 'All' || a.department === selectedDepartment;
      const matchesGroup = selectedGroup === 'All' || a.group === selectedGroup;

      return matchesSearch && matchesDept && matchesGroup;
    });

    return result.sort((a, b) => {
      if (ambassadorSort === 'name') {
        return a.fullName.localeCompare(b.fullName);
      }
      if (ambassadorSort === 'department') {
        return a.department.localeCompare(b.department);
      }
      if (ambassadorSort === 'batch') {
        return a.batch.localeCompare(b.batch);
      }
      return 0;
    });
  }, [ambassadors, ambassadorSearch, selectedDepartment, selectedGroup, ambassadorSort]);

  // Ambassador Card Actions
  const handleOpenAmbassadorProfile = (ambassadorId: string) => {
    setSelectedAmbassadorId(ambassadorId);
    setActiveView('public-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyProfileLink = (amb: AmbassadorProfile) => {
    navigator.clipboard.writeText(`${window.location.origin}?profile=${amb.ambassadorId}`);
    setCopiedLinkAmbId(amb.id);
    setTimeout(() => setCopiedLinkAmbId(null), 2000);
  };

  // Helper for Project stage color
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Under R&D':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Testing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Prototyping':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Completed':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 selection:bg-[#214FA2]/20 selection:text-[#214FA2]">
      {/* =========================================================================
          HERO SECTION: Institutional Gateway & Innovation Anchor
         ========================================================================= */}
      <section className="relative bg-linear-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#214FA2] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Industrial Innovation Centre · Daffodil International University</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Pioneering Applied Research & Next-Gen Student Innovators
                </h1>
                <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  The centralized gateway to DIU IIC’s technological breakthroughs, multidisciplinary incubation labs, and certified cohort of student ambassadors driving verifiable engineering impact.
                </p>
              </div>

              {/* Quick Jump & CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#projects-section"
                  className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#214FA2] text-white hover:bg-[#1a3f82] transition-colors shadow-xs flex items-center gap-2"
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span>Explore Projects ({totalProjectsCount})</span>
                </a>

                <a
                  href="#ambassadors-section"
                  className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Meet Ambassadors ({totalAmbassadorsCount})</span>
                </a>

                <button
                  onClick={() => setPublicVerifyCertificateId('CERT-2026-001')}
                  className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Verify Certificate</span>
                </button>
              </div>

              {/* Unboxed Key Metrics Banner with Tabular Numerals */}
              <div className="pt-4 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-800">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#214FA2] font-mono tabular-nums">
                    {totalProjectsCount}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    R&D Innovations
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                    {totalAmbassadorsCount}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    Certified Ambassadors
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
                    100%
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    Verified Cohort
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-mono tabular-nums">
                    {departments.length - 1}+
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    Academic Faculties
                  </div>
                </div>
              </div>
            </div>

            {/* Right Showcase Card Anchor */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-900 aspect-16/10 sm:aspect-16/10 group">
                <img
                  src="/src/assets/images/hero_innovation_hub_1790403214279.jpg"
                  alt="Daffodil International University Innovation and Incubation Centre"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to secondary asset if not found
                    (e.target as HTMLImageElement).src = '/src/assets/images/iic_hub_banner_1790178168053.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-900/30 to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider mb-1">
                    Ashulia Permanent Smart Campus
                  </div>
                  <div className="text-base font-bold text-white leading-tight">
                    Industrial Innovation Centre (IIC) MakerLabs
                  </div>
                  <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                    <span>Incubating IoT, CleanTech & AI</span>
                    <span aria-hidden="true">·</span>
                    <span>100% Student-Driven</span>
                  </div>
                </div>
              </div>

              {/* Decorative Trust Badge */}
              <div className="hidden sm:flex absolute -bottom-3 -left-3 bg-white p-3 rounded-xl border border-slate-200 shadow-md items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900">DIU Verified Cohort</div>
                  <div className="text-[11px] text-slate-500 font-mono">IIC-COHORT-2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: ALL PROJECTS SHOWCASE
         ========================================================================= */}
      <section id="projects-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#214FA2] mb-1">
              <span>01. Applied Research & Incubation</span>
              <span aria-hidden="true">·</span>
              <span>All Projects</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Innovative Research & Technology Projects
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
              Engineered by Daffodil International University student ambassadors under faculty mentorship. Browse technical blueprints, active stages, and connected ambassadors.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500 font-mono">
            Showing {filteredProjects.length} of {totalProjectsCount} Projects
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="Search projects by keyword, tech stack, mentor lead..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] transition-colors"
              />
              {projectSearch && (
                <button
                  onClick={() => setProjectSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Stage Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap mr-1">
                Stage:
              </span>
              {projectStages.map((stage) => (
                <button
                  key={stage}
                  onClick={() => setSelectedStage(stage)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    selectedStage === stage
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap mr-1">
              Category:
            </span>
            {projectCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#214FA2] text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="mt-8 p-12 bg-white rounded-xl border border-dashed border-slate-300 text-center">
            <FolderGit2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <div className="text-sm font-bold text-slate-800">No matching projects found</div>
            <div className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or resetting category/stage filters.
            </div>
            <button
              onClick={() => {
                setProjectSearch('');
                setSelectedCategory('All');
                setSelectedStage('All');
              }}
              className="mt-4 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              // Find connected ambassadors
              const teamAmbassadors = ambassadors.filter((a) =>
                project.connectedAmbassadorIds.includes(a.id)
              );

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Project Cover Image */}
                    <div className="relative aspect-16/9 bg-slate-100 overflow-hidden border-b border-slate-100">
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/src/assets/images/project_iot_smart_1790178182762.jpg';
                        }}
                      />
                      {/* Stage Tag */}
                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-xs ${getStageColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                      </div>

                      {/* Category Kicker */}
                      <div className="absolute bottom-2 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded">
                        {project.category}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5">
                      <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 hover:text-[#214FA2] transition-colors">
                        {project.title}
                      </h3>

                      <div className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-slate-700">Lead Mentor:</span>
                        <span>{project.leadInCharge}</span>
                      </div>

                      <p className="mt-2.5 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Objectives snippet */}
                      {project.objectives && project.objectives.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                          <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1 mb-1.5">
                            <Lightbulb className="w-3 h-3 text-amber-500" />
                            <span>Core Objective</span>
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {project.objectives[0]}
                          </div>
                        </div>
                      )}

                      {/* Connected Ambassador Avatars */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Team:
                          </span>
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {teamAmbassadors.map((amb) => (
                              <button
                                key={amb.id}
                                onClick={() => handleOpenAmbassadorProfile(amb.id)}
                                title={`${amb.fullName} (${amb.department}) - Click to view profile`}
                                className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-slate-200 hover:scale-115 hover:z-10 transition-transform"
                              >
                                <img
                                  src={amb.avatarUrl}
                                  alt={amb.fullName}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono">
                          {project.startDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 sm:p-5 pt-0">
                    <button
                      onClick={() => setSelectedProjectModal(project)}
                      className="w-full py-2 px-3 bg-slate-50 hover:bg-[#214FA2] text-slate-700 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 hover:border-[#214FA2] transition-colors"
                    >
                      <span>View Project Blueprint</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 2: CERTIFIED AMBASSADORS (GRID CARD TYPE LIST)
         ========================================================================= */}
      <section id="ambassadors-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
              <span>02. Certified Cohort</span>
              <span aria-hidden="true">·</span>
              <span>Student Ambassadors</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Student Ambassadors Directory
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
              Multidisciplinary undergraduate innovators leading hands-on university R&D, prototype engineering, and technology initiatives across DIU.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 font-mono">
              Showing {filteredAmbassadors.length} of {totalAmbassadorsCount} Ambassadors
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ambassadorSearch}
                onChange={(e) => setAmbassadorSearch(e.target.value)}
                placeholder="Search ambassador by name, student ID, department, or skill..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] transition-colors"
              />
              {ambassadorSearch && (
                <button
                  onClick={() => setAmbassadorSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                Sort by:
              </span>
              <select
                value={ambassadorSort}
                onChange={(e) => setAmbassadorSort(e.target.value as any)}
                className="py-1.5 px-2.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-[#214FA2]"
              >
                <option value="name">Name (A-Z)</option>
                <option value="department">Department</option>
                <option value="batch">Batch / Cohort</option>
              </select>
            </div>
          </div>

          {/* Department Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap mr-1">
              Faculty:
            </span>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedDepartment === dept
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Specialization Group Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap mr-1">
              Group:
            </span>
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedGroup === grp
                    ? 'bg-[#214FA2] text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>

        {/* AMBASSADOR GRID CARDS ("grid card type list of ambassadors") */}
        {filteredAmbassadors.length === 0 ? (
          <div className="mt-8 p-12 bg-white rounded-xl border border-dashed border-slate-300 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <div className="text-sm font-bold text-slate-800">No matching ambassadors found</div>
            <div className="text-xs text-slate-500 mt-1">
              Try adjusting your search criteria or resetting the faculty filters.
            </div>
            <button
              onClick={() => {
                setAmbassadorSearch('');
                setSelectedDepartment('All');
                setSelectedGroup('All');
              }}
              className="mt-4 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAmbassadors.map((ambassador) => {
              // Find connected projects
              const ambProjects = projects.filter((p) =>
                p.connectedAmbassadorIds.includes(ambassador.id)
              );

              return (
                <div
                  key={ambassador.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  {/* Card Content */}
                  <div>
                    {/* Top Identity Header */}
                    <div className="p-5 pb-3">
                      <div className="flex items-start gap-3.5">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-xs">
                            <img
                              src={ambassador.avatarUrl}
                              alt={ambassador.fullName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          {/* Active Presence Dot */}
                          <span
                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                              ambassador.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                            title={`Status: ${ambassador.status}`}
                          />
                        </div>

                        {/* Name & Academic ID */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3
                              onClick={() => handleOpenAmbassadorProfile(ambassador.id)}
                              className="text-base font-bold text-slate-900 truncate hover:text-[#214FA2] transition-colors cursor-pointer"
                            >
                              {ambassador.fullName}
                            </h3>
                            <CheckCircle2 className="w-4 h-4 text-[#214FA2] shrink-0" />
                          </div>

                          <div className="text-[11px] font-mono font-medium text-slate-500 mt-0.5">
                            {ambassador.ambassadorId}
                          </div>

                          <div className="text-xs text-slate-600 font-medium truncate mt-0.5">
                            {ambassador.department}
                          </div>
                        </div>
                      </div>

                      {/* Unboxed Metadata Line with Typographic Separator */}
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <span>{ambassador.batch}</span>
                        <span aria-hidden="true">·</span>
                        <span>ID: {ambassador.studentId}</span>
                        <span aria-hidden="true">·</span>
                        <span>Ashulia Campus</span>
                      </div>

                      {/* Bio Statement */}
                      <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {ambassador.bio || 'Active multidisciplinary researcher at Industrial Innovation Centre.'}
                      </p>

                      {/* Academic Program & Specialization Group */}
                      <div className="mt-3.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
                          <GraduationCap className="w-3.5 h-3.5 text-[#214FA2] shrink-0" />
                          <span className="font-semibold truncate">{ambassador.program || ambassador.department}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#214FA2] border border-blue-200/60 shrink-0">
                          {ambassador.group}
                        </span>
                      </div>

                      {/* Skills & Expertise */}
                      {ambassador.skills && ambassador.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {ambassador.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60"
                            >
                              {skill}
                            </span>
                          ))}
                          {ambassador.skills.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                              +{ambassador.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Connected Projects */}
                      {ambProjects.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                          <span className="text-[11px] text-slate-500">Active Project:</span>
                          <span className="text-[11px] font-medium text-slate-800 truncate max-w-[180px]">
                            {ambProjects[0].title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Row */}
                  <div className="p-4 sm:p-5 pt-0">
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenAmbassadorProfile(ambassador.id)}
                        className="flex-1 py-2 px-3 bg-[#214FA2] hover:bg-[#1a3f82] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>View Digital CV</span>
                      </button>

                      <button
                        onClick={() => setPreviewAmbassador(ambassador)}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                        title="Quick View"
                      >
                        Preview
                      </button>

                      <button
                        onClick={() => handleCopyProfileLink(ambassador)}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                        title="Copy profile link"
                      >
                        {copiedLinkAmbId === ambassador.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 3: IIC ECOSYSTEM & PILLARS
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-10 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DIU Innovation Framework</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Bridging Academic Rigor with Real-World Industrial Impact
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Every student ambassador at the Industrial Innovation Centre is held to an industrial contribution benchmark. The portal enforces real-time engineering tracking, intellectual property archiving, and verifiable credentials recognized worldwide.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-slate-200 border-t border-slate-800 pt-6">
              <div>
                <div className="text-base font-bold text-white mb-1">
                  01. Applied R&D Projects
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  Direct hands-on engineering across robotics, clean energy, biomedical devices, and intelligent IoT.
                </div>
              </div>

              <div>
                <div className="text-base font-bold text-white mb-1">
                  02. Interdisciplinary Labs
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  Engineers, designers, and multimedia creators collaborate across faculties to build complete prototypes.
                </div>
              </div>

              <div>
                <div className="text-base font-bold text-white mb-1">
                  03. Verifiable CV & QR
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  Tamper-proof digital portfolios validated by Daffodil International University leadership.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: INSTITUTIONAL FOOTER
         ========================================================================= */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 text-xs text-slate-500">
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#214FA2] text-white flex items-center justify-center font-bold text-xs">
              IIC
            </div>
            <span className="font-semibold text-slate-800">
              Industrial Innovation Centre (IIC) · Daffodil International University
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <a href="#projects-section" className="hover:text-slate-900 transition-colors">
              Projects
            </a>
            <a href="#ambassadors-section" className="hover:text-slate-900 transition-colors">
              Ambassadors
            </a>
            <button
              onClick={() => setPublicVerifyCertificateId('CERT-2026-001')}
              className="hover:text-[#214FA2] transition-colors"
            >
              Verify Certificate
            </button>
            <button
              onClick={() => setIsVpsModalOpen(true)}
              className="hover:text-[#214FA2] transition-colors flex items-center gap-1 font-medium text-indigo-700"
            >
              <Server className="w-3.5 h-3.5 text-indigo-600" />
              <span>VPS Deployment Guide</span>
            </button>
            <button
              onClick={() => setActiveView(isAuthenticated ? 'dashboard' : 'login')}
              className="hover:text-[#214FA2] font-semibold transition-colors"
            >
              {isAuthenticated ? 'Portal Workspace' : 'Portal Sign In'}
            </button>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODAL: PROJECT DETAILS BLUEPRINT
         ========================================================================= */}
      {selectedProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="relative aspect-16/8 bg-slate-100 overflow-hidden">
              <img
                src={selectedProjectModal.coverImage}
                alt={selectedProjectModal.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-900/30 to-transparent flex flex-col justify-end p-6 text-white">
                <span
                  className={`inline-block self-start text-[10px] font-bold px-2 py-0.5 rounded-md mb-1.5 ${getStageColor(
                    selectedProjectModal.status
                  )}`}
                >
                  {selectedProjectModal.status}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {selectedProjectModal.title}
                </h2>
                <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                  <span>{selectedProjectModal.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>Lead: {selectedProjectModal.leadInCharge}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedProjectModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Overview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Project Overview & Problem Statement
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedProjectModal.description}
                </p>
                {selectedProjectModal.background && (
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    {selectedProjectModal.background}
                  </p>
                )}
              </div>

              {/* Objectives */}
              {selectedProjectModal.objectives && selectedProjectModal.objectives.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Key Engineering Objectives
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedProjectModal.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Outcomes & Milestones */}
              {selectedProjectModal.outcomes && selectedProjectModal.outcomes.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Verified Milestones & Research Outcomes
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedProjectModal.outcomes.map((out, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-[#214FA2] mt-0.5 shrink-0" />
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Connected Student Ambassadors */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Assigned Student Ambassadors
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ambassadors
                    .filter((a) => selectedProjectModal.connectedAmbassadorIds.includes(a.id))
                    .map((amb) => (
                      <div
                        key={amb.id}
                        onClick={() => {
                          setSelectedProjectModal(null);
                          handleOpenAmbassadorProfile(amb.id);
                        }}
                        className="p-2.5 rounded-lg border border-slate-200 hover:border-[#214FA2] bg-slate-50 hover:bg-slate-100 flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-white border border-slate-200 shrink-0">
                          <img
                            src={amb.avatarUrl}
                            alt={amb.fullName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {amb.fullName}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {amb.department}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Technical Documents */}
              {selectedProjectModal.documents && selectedProjectModal.documents.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Technical Specifications & Blueprints
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProjectModal.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-700"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#214FA2]" />
                        <span className="font-medium">{doc.title}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          [{doc.type}]
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 rounded-b-2xl">
              <button
                onClick={() => setSelectedProjectModal(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: AMBASSADOR QUICK PREVIEW
         ========================================================================= */}
      {previewAmbassador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 relative">
              <button
                onClick={() => setPreviewAmbassador(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-white shadow-sm shrink-0">
                  <img
                    src={previewAmbassador.avatarUrl}
                    alt={previewAmbassador.fullName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {previewAmbassador.fullName}
                  </h3>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">
                    {previewAmbassador.ambassadorId}
                  </div>
                  <div className="text-xs text-[#214FA2] font-semibold mt-0.5">
                    {previewAmbassador.department}
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  About Ambassador
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {previewAmbassador.bio}
                </p>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Academic Details
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <div>
                    <span className="font-semibold">Student ID:</span> {previewAmbassador.studentId}
                  </div>
                  <div>
                    <span className="font-semibold">Batch:</span> {previewAmbassador.batch}
                  </div>
                  <div>
                    <span className="font-semibold">Location:</span> {previewAmbassador.location}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Skills & Expertise
                </div>
                <div className="flex flex-wrap gap-1">
                  {previewAmbassador.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                onClick={() => setPreviewAmbassador(null)}
                className="px-3.5 py-1.5 bg-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const ambId = previewAmbassador.id;
                  setPreviewAmbassador(null);
                  handleOpenAmbassadorProfile(ambId);
                }}
                className="px-4 py-1.5 bg-[#214FA2] hover:bg-[#1a3f82] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Open Full Digital CV</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
