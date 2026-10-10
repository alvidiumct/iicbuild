import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Search, Filter, ShieldCheck } from 'lucide-react';

export const AdminAuditLogView: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [actorFilter, setActorFilter] = useState('All');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesActor =
      actorFilter === 'All'
        ? true
        : actorFilter === 'Admin'
        ? log.actorRole === 'ADMIN'
        : log.actorRole === 'AMBASSADOR';

    return matchesSearch && matchesActor;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Governance & Compliance</span>
            <span aria-hidden="true">·</span>
            <span>Immutable System Ledger</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            System Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Read-only chronological audit log of all administrative actions, submissions, and time approvals
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Ledger Integrity Intact</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search actions, details, actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>

          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Administrator Actions Only</option>
            <option value="Ambassador">Ambassador Actions Only</option>
          </select>
        </div>

        <span className="font-mono text-slate-500">
          {filteredLogs.length} Logged Transactions
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="font-bold text-slate-900">{log.actorName}</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-[#214FA2] whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="p-3.5 text-slate-700 leading-relaxed">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
