import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Megaphone, Plus, Pin, Calendar, Users, X } from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const { announcements, currentUser, createAnnouncement } = useApp();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    createAnnouncement({
      title,
      content,
      pinned,
      targetAudience: 'All Ambassadors',
    });

    setCreateModalOpen(false);
    setTitle('');
    setContent('');
    setPinned(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Official Centre Communications</span>
            <span aria-hidden="true">·</span>
            <span>Broadcast Noticeboard</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Centre Announcements & Notices
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Key operational announcements, schedules, and policy updates from IIC Leadership
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`p-6 rounded-xl border transition-colors shadow-xs ${
              ann.pinned
                ? 'bg-amber-50/40 border-amber-200'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs">
                {ann.pinned && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
                <span className="text-slate-500">Audience: {ann.targetAudience}</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono text-slate-400">
                  {new Date(ann.publishedAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <span className="text-xs font-semibold text-slate-700">{ann.authorName}</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 leading-snug">
              {ann.title}
            </h3>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {ann.content}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ANNOUNCEMENT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Publish Announcement</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mandatory Lab Safety & Access Pass Verification"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Announcement Body *
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detail the instructions or policy update for all student ambassadors..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin-announcement"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="w-4 h-4 text-[#214FA2] rounded"
                />
                <label
                  htmlFor="pin-announcement"
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Pin this announcement to top of dashboard
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
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
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
