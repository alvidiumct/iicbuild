import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectStage } from '../../types';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  Users,
  CheckSquare,
  ExternalLink,
  Sparkles,
  X,
  Check,
  Tag,
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    ambassadors,
    tasks,
    currentUser,
    currentAmbassador,
    createProject,
    setActiveView,
    setSelectedTaskId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Admin New Project modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('IoT & Embedded Systems');
  const [stage, setStage] = useState<ProjectStage>('Prototyping');
  const [tagsStr, setTagsStr] = useState('ESP32, MQTT, Sensors');
  const [selectedAmbassadors, setSelectedAmbassadors] = useState<string[]>([]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStage = stageFilter === 'All' ? true : p.status === stageFilter;

    return matchesSearch && matchesStage;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    createProject({
      title,
      description,
      category,
      status: stage,
      tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
      connectedAmbassadorIds: selectedAmbassadors,
      coverImage:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    });

    setCreateModalOpen(false);
    setTitle('');
    setDescription('');
    setSelectedAmbassadors([]);
  };

  const toggleAmbassador = (id: string) => {
    setSelectedAmbassadors((prev) =>
      prev.includes(id) ? prev.filter((aId) => aId !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>R&D & Intellectual Property</span>
            <span aria-hidden="true">·</span>
            <span>Innovation Showcase</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            IIC Projects & Innovations
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Applied research projects engineered by Daffodil International University ambassadors
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search projects by keyword, tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Stages</option>
            <option value="Ideation">Ideation</option>
            <option value="Prototyping">Prototyping</option>
            <option value="Testing">Testing</option>
            <option value="Deployed">Deployed</option>
            <option value="Published">Published</option>
          </select>
        </div>

        <span className="font-mono text-slate-500">
          Showing {filteredProjects.length} innovation projects
        </span>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((proj) => {
          const connectedAmbassadorsList = ambassadors.filter((a) =>
            proj.connectedAmbassadorIds.includes(a.id)
          );
          const projectTasks = tasks.filter((t) => t.projectId === proj.id);

          return (
            <div
              key={proj.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                  <img
                    src={proj.coverImage}
                    alt={proj.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/95 text-slate-800 shadow-xs">
                    {proj.status}
                  </div>
                  <div className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/80 text-white backdrop-blur-xs">
                    {proj.category}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-base text-slate-900 leading-snug">{proj.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(proj.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 space-y-3">
                {/* Connected ambassadors */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{connectedAmbassadorsList.length} Ambassadors</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>{projectTasks.length} Associated Tasks</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProject(proj)}
                  className="w-full py-2 text-xs font-semibold text-[#214FA2] bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <span>View Project Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PROJECT DETAILS MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#214FA2]">
                  {selectedProject.category} · Stage: {selectedProject.status}
                </span>
                <h3 className="font-bold text-lg text-slate-900 mt-0.5">{selectedProject.title}</h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-48 w-full rounded-lg overflow-hidden bg-slate-100">
              <img
                src={selectedProject.coverImage}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Project Overview
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedProject.description}
              </p>
            </div>

            {/* Contributing Ambassadors */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Contributing Ambassadors
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ambassadors
                  .filter((a) => selectedProject.connectedAmbassadorIds.includes(a.id))
                  .map((amb) => (
                    <div
                      key={amb.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2.5 text-xs"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 shrink-0">
                        <img
                          src={amb.avatarUrl}
                          alt={amb.fullName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{amb.fullName}</div>
                        <div className="text-[10px] text-slate-500 truncate">{amb.department}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base text-slate-900">Initiate New IIC Project</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI-Driven Agricultural Yield Estimator"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Problem statement, solution methodology, and expected commercial or academic output..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                  >
                    <option value="IoT & Embedded Systems">IoT & Embedded Systems</option>
                    <option value="Renewable Energy">Renewable Energy</option>
                    <option value="AI & Robotics">AI & Robotics</option>
                    <option value="Healthcare Tech">Healthcare Tech</option>
                    <option value="Fintech & Web3">Fintech & Web3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Development Stage
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as ProjectStage)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                  >
                    <option value="Ideation">Ideation</option>
                    <option value="Prototyping">Prototyping</option>
                    <option value="Testing">Testing</option>
                    <option value="Deployed">Deployed</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="Computer Vision, Drone, Edge AI"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign Lead Ambassadors
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                  {ambassadors.map((amb) => {
                    const isSelected = selectedAmbassadors.includes(amb.id);
                    return (
                      <div
                        key={amb.id}
                        onClick={() => toggleAmbassador(amb.id)}
                        className={`p-2 rounded border text-xs cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 border-[#214FA2] text-[#214FA2] font-semibold'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <span className="truncate">{amb.fullName}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors"
                >
                  Create & Publish Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
