import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  FileCheck,
  Printer,
  X,
  Share2,
} from 'lucide-react';

export const AdminCertificatesView: React.FC = () => {
  const {
    certificates,
    ambassadors,
    issueCertificate,
    getOverallMetrics,
    setPublicVerifyCertificateId,
  } = useApp();

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedAmbassadorId, setSelectedAmbassadorId] = useState('');
  const [certTitle, setCertTitle] = useState('Certificate of Outstanding Innovation Contribution');
  const [certDescription, setCertDescription] = useState(
    'Awarded for exceeding weekly 4-hour technical contribution standards and engineering innovation deliverables.'
  );
  const [certType, setCertType] = useState('Excellence');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCerts = certificates.filter((c) => {
    return (
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ambassadorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.certificateId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleIssueCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmbassadorId || !certTitle) return;

    issueCertificate({
      ambassadorId: selectedAmbassadorId,
      title: certTitle,
      description: certDescription,
    });

    setIssueModalOpen(false);
    setSelectedAmbassadorId('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Credentials & Authentication</span>
            <span aria-hidden="true">·</span>
            <span>Digital Certification Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Ambassador Certificates & Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Issue cryptographically verifiable certificates with public verification identifiers
          </p>
        </div>

        <button
          onClick={() => setIssueModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Certificate</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search certificate ID, ambassador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
          />
        </div>

        <span className="font-mono text-slate-500">
          Total Issued: {certificates.length} Certificates
        </span>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCerts.map((cert) => (
          <div
            key={cert.id}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {cert.certificateId}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 leading-snug">{cert.title}</h3>
                <p className="text-xs font-semibold text-[#214FA2] mt-0.5">
                  Conferred to {cert.ambassadorName}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                  {cert.description}
                </p>
              </div>

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>Issued: {cert.issueDate}</span>
                <span className="font-mono text-emerald-700 font-bold">
                  {cert.contributionHours} Hours Verified
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setPublicVerifyCertificateId(cert.certificateId)}
                className="w-full py-2 text-xs font-semibold text-[#214FA2] bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Credential</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ISSUE CERTIFICATE MODAL */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Issue Verified Certificate</h3>
              <button
                onClick={() => setIssueModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueCertificate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Ambassador *
                </label>
                <select
                  required
                  value={selectedAmbassadorId}
                  onChange={(e) => setSelectedAmbassadorId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                >
                  <option value="">-- Select Recipient --</option>
                  {ambassadors.map((amb) => (
                    <option key={amb.id} value={amb.id}>
                      {amb.fullName} ({amb.department} · {getOverallMetrics(amb.id).toFixed(1)}h
                      logged)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Certificate Title *
                </label>
                <input
                  type="text"
                  required
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Citation / Description
                </label>
                <textarea
                  rows={3}
                  value={certDescription}
                  onChange={(e) => setCertDescription(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors"
                >
                  Generate & Concur Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
