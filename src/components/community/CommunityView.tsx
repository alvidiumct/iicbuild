import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Download,
  Plus,
  Search,
  Filter,
  FileText,
  ExternalLink,
  Tag,
  Shield,
  X,
} from 'lucide-react';

export const CommunityView: React.FC = () => {
  const { resources, currentUser, addResource } = useApp();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // New resource form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Branding & Identity');
  const [fileType, setFileType] = useState('PDF');
  const [downloadUrl, setDownloadUrl] = useState('');

  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' ? true : res.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addResource({
      title,
      description,
      category: category as any,
      fileType,
      fileSize: '1.8 MB',
      downloadUrl: downloadUrl || 'https://diu.edu.bd/iic/resources/download',
    });

    setUploadModalOpen(false);
    setTitle('');
    setDescription('');
    setDownloadUrl('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Knowledge Base & Brand Assets</span>
            <span aria-hidden="true">·</span>
            <span>Document Repository</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Community & Resource Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Official operating guidelines, vector brand assets, project templates, and patent guides
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Resource</span>
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
              placeholder="Search documents and guidelines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="Branding & Identity">Branding & Identity</option>
            <option value="Project Documentation">Project Documentation</option>
            <option value="Code of Conduct">Code of Conduct</option>
            <option value="Patenting & IPR">Patenting & IPR</option>
            <option value="Academic Publications">Academic Publications</option>
          </select>
        </div>

        <span className="font-mono text-slate-500">
          Showing {filteredResources.length} repository documents
        </span>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-bold text-[#214FA2] uppercase">{res.category}</span>
                <span className="font-mono font-semibold uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                  {res.fileType}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 leading-snug">{res.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {res.description}
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">{res.fileSize}</span>

              <a
                href={res.downloadUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-xs font-semibold text-[#214FA2] bg-blue-50/80 hover:bg-blue-100/80 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Asset</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* UPLOAD RESOURCE MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Upload Centre Resource</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. IIC Patent Invention Disclosure Form 2026"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of document contents and intended audience..."
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
                    <option value="Branding & Identity">Branding & Identity</option>
                    <option value="Project Documentation">Project Documentation</option>
                    <option value="Code of Conduct">Code of Conduct</option>
                    <option value="Patenting & IPR">Patenting & IPR</option>
                    <option value="Academic Publications">Academic Publications</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Format</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="DOCX">DOCX Template</option>
                    <option value="ZIP">ZIP Package</option>
                    <option value="FIGMA">Figma Link</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  External File / Storage URL
                </label>
                <input
                  type="url"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors"
                >
                  Publish To Repository
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
