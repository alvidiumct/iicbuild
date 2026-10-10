import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mail,
  Send,
  Users,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
  AlertCircle,
  History,
} from 'lucide-react';

interface BroadcastRecord {
  id: string;
  subject: string;
  targetAudience: string;
  recipientCount: number;
  sentAt: string;
  senderName: string;
}

export const AdminCommunicationView: React.FC = () => {
  const { ambassadors, getWeeklyMetrics, sendBroadcastNotification } = useApp();

  const [audienceFilter, setAudienceFilter] = useState<string>('below-4h');
  const [subject, setSubject] = useState('Urgent: Complete your 4-Hour Weekly IIC Contribution');
  const [body, setBody] = useState(
    'Dear {{ambassador_name}},\n\nOur records indicate you have completed {{hours_completed}} out of your mandatory 4.0 hours for this week ({{hours_remaining}} remaining). Please punch into your assigned tasks before the Friday cutoff.\n\nIndustrial Innovation Centre (IIC) Directorate'
  );

  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastRecord[]>([
    {
      id: 'b-1',
      subject: 'Welcome to IIC Student Ambassador Program Batch 61',
      targetAudience: 'All Ambassadors',
      recipientCount: 126,
      sentAt: '2026-09-01 10:30 AM',
      senderName: 'Dr. Mahfuzur Rahman',
    },
    {
      id: 'b-2',
      subject: 'Urgent: Midterm Week Availability Notice',
      targetAudience: 'Software Engineering (SWE)',
      recipientCount: 42,
      sentAt: '2026-09-15 04:15 PM',
      senderName: 'Dr. Mahfuzur Rahman',
    },
  ]);

  const [sentSuccess, setSentSuccess] = useState(false);

  // Calculate target recipients count
  const targetAmbassadors = ambassadors.filter((amb) => {
    if (audienceFilter === 'all') return true;
    if (audienceFilter === 'below-4h') {
      return getWeeklyMetrics(amb.id).completedHours < 4.0;
    }
    if (audienceFilter === 'swe') return amb.department.includes('SWE');
    if (audienceFilter === 'cse') return amb.department.includes('CSE');
    return true;
  });

  const applyTemplate = (templateType: 'below-4h' | 'welcome' | 'event' | 'certificate') => {
    if (templateType === 'below-4h') {
      setAudienceFilter('below-4h');
      setSubject('Urgent: Complete your 4-Hour Weekly IIC Contribution');
      setBody(
        'Dear {{ambassador_name}},\n\nOur records indicate you have logged {{hours_completed}} out of your mandatory 4.0 hours for this week ({{hours_remaining}} remaining). Please punch in to your assigned tasks before the Friday cutoff.\n\nIndustrial Innovation Centre (IIC) Directorate'
      );
    } else if (templateType === 'welcome') {
      setAudienceFilter('all');
      setSubject('Welcome to Industrial Innovation Centre (IIC) Ambassador Cohort');
      setBody(
        'Dear {{ambassador_name}},\n\nCongratulations on your appointment as an IIC Student Ambassador. Your digital CV profile has been initialized at IIC Ambassador Platform.\n\nPlease log in, set your weekly availability schedule, and accept your initial project deliverables.\n\nDr. Mahfuzur Rahman, Centre Director'
      );
    } else if (templateType === 'event') {
      setAudienceFilter('all');
      setSubject('Call for Volunteers: Upcoming DIU Innovation Summit');
      setBody(
        'Dear {{ambassador_name}},\n\nWe require student ambassador volunteers for stage coordination, tech demo booths, and guest hospitality at our upcoming Summit.\n\nParticipation credits 6.0 verified hours towards your weekly contribution quota. Please register on your Events tab.\n\nIIC Operations Team'
      );
    } else if (templateType === 'certificate') {
      setAudienceFilter('all');
      setSubject('Official IIC Certificate of Excellence Issued');
      setBody(
        'Dear {{ambassador_name}},\n\nIn recognition of outstanding technical contributions, the Industrial Innovation Centre has issued your verified digital Certificate. You can view, verify, and attach it to your LinkedIn profile directly from your Digital CV.\n\nHeartiest congratulations!\nDr. Mahfuzur Rahman'
      );
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) return;

    // Send notifications to target recipients
    if (sendBroadcastNotification) {
      sendBroadcastNotification(
        subject,
        body.replace(/\{\{ambassador_name\}\}/g, 'Ambassador').slice(0, 150) + '...'
      );
    }

    const newRecord: BroadcastRecord = {
      id: `b-${Date.now()}`,
      subject,
      targetAudience:
        audienceFilter === 'below-4h'
          ? 'Ambassadors Below 4h Target'
          : audienceFilter === 'all'
          ? 'All Ambassadors'
          : audienceFilter.toUpperCase(),
      recipientCount: targetAmbassadors.length,
      sentAt: new Date().toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      senderName: 'Dr. Mahfuzur Rahman',
    };

    setBroadcastHistory([newRecord, ...broadcastHistory]);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 4000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Communication & Outreach</span>
            <span aria-hidden="true">·</span>
            <span>Broadcast Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Bulk Email & Broadcast Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Dispatch announcements, weekly 4-hour quota reminders, and call-for-volunteers
          </p>
        </div>

        {sentSuccess && (
          <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Broadcast dispatched to {targetAmbassadors.length} recipients!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Compose Form & Templates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Templates Bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Load Official Email Templates:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyTemplate('below-4h')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#214FA2] rounded-lg text-xs font-medium text-slate-800 transition-colors"
              >
                4-Hour Weekly Quota Reminder
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('welcome')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#214FA2] rounded-lg text-xs font-medium text-slate-800 transition-colors"
              >
                Onboarding & Welcome
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('event')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#214FA2] rounded-lg text-xs font-medium text-slate-800 transition-colors"
              >
                Event Volunteer Call
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('certificate')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#214FA2] rounded-lg text-xs font-medium text-slate-800 transition-colors"
              >
                Certificate Award
              </button>
            </div>
          </div>

          {/* Broadcast Form */}
          <form
            onSubmit={handleSendBroadcast}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4"
          >
            {/* Target Audience */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Target Audience Cohort *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setAudienceFilter('below-4h')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                    audienceFilter === 'below-4h'
                      ? 'border-[#214FA2] bg-blue-50/70 text-[#214FA2] font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>Below 4h Target</div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    {ambassadors.filter((a) => getWeeklyMetrics(a.id).completedHours < 4.0).length}{' '}
                    ambassadors
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAudienceFilter('all')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                    audienceFilter === 'all'
                      ? 'border-[#214FA2] bg-blue-50/70 text-[#214FA2] font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>All Cohort</div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    {ambassadors.length} ambassadors
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAudienceFilter('swe')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                    audienceFilter === 'swe'
                      ? 'border-[#214FA2] bg-blue-50/70 text-[#214FA2] font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>SWE Department</div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    {ambassadors.filter((a) => a.department.includes('SWE')).length} ambassadors
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAudienceFilter('cse')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                    audienceFilter === 'cse'
                      ? 'border-[#214FA2] bg-blue-50/70 text-[#214FA2] font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>CSE Department</div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    {ambassadors.filter((a) => a.department.includes('CSE')).length} ambassadors
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject Line *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Email Message Body *</label>
                <span className="text-[11px] text-slate-400">
                  Merge tags: <code>{'{{ambassador_name}}'}</code>, <code>{'{{hours_completed}}'}</code>
                </span>
              </div>
              <textarea
                required
                rows={7}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] font-sans leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Dispatches email to <strong>{targetAmbassadors.length} ambassadors</strong> and sends
                in-app notifications.
              </span>

              <button
                type="submit"
                className="px-4 py-2.5 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Bulk Broadcast</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Broadcast History */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-sm text-slate-900">Broadcast Dispatch Log</h3>
          </div>

          <div className="space-y-3">
            {broadcastHistory.map((rec) => (
              <div
                key={rec.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 line-clamp-1">{rec.subject}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Target: {rec.targetAudience}</span>
                  <span className="font-mono font-bold text-slate-800">
                    {rec.recipientCount} sent
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100">
                  {rec.sentAt} · Dispatched by {rec.senderName}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
