import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, Search, Filter, Check, UserCheck, AlertCircle } from 'lucide-react';
import { DayAvailability } from '../../types';

const DAYS: DayAvailability['day'][] = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export const AdminAvailabilityMatrix: React.FC = () => {
  const { ambassadors, availabilityList, setSelectedTaskId, setActiveView } = useApp();

  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Current day of week for "Available Today" spotlight
  const dayNames: DayAvailability['day'][] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const todayDayName = dayNames[new Date().getDay()];

  const filteredAmbassadors = ambassadors.filter((amb) => {
    const matchesSearch =
      amb.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      amb.ambassadorId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' ? true : amb.department.includes(departmentFilter);
    return matchesSearch && matchesDept;
  });

  // Calculate available today
  const availableTodayCount = ambassadors.filter((amb) => {
    const ambAvail = availabilityList.find((a) => a.ambassadorId === amb.id);
    const todaySched = ambAvail?.weeklySchedule.find((s) => s.day === todayDayName);
    return todaySched && todaySched.isAvailable && todaySched.slots.length > 0;
  }).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Resource Allocation & Scheduling</span>
            <span aria-hidden="true">·</span>
            <span>Roster Matrix</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Ambassador Availability Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Identify available ambassadors by day and time slot for immediate task dispatch and lab shifts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>
              Available Today ({todayDayName}): <strong>{availableTodayCount} Ambassadors</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search ambassador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Departments</option>
            <option value="SWE">SWE</option>
            <option value="CSE">CSE</option>
            <option value="MCT">MCT</option>
            <option value="EEE">EEE</option>
          </select>

          <select
            value={selectedDayFilter}
            onChange={(e) => setSelectedDayFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
          >
            <option value="All">Show All 7 Days</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                Only {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-400" />
            <span>Available Slot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200" />
            <span>Unavailable</span>
          </div>
        </div>
      </div>

      {/* MATRIX TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 min-w-[200px]">Ambassador</th>
                {DAYS.filter((d) => selectedDayFilter === 'All' || selectedDayFilter === d).map(
                  (day) => (
                    <th
                      key={day}
                      className={`p-3.5 text-center min-w-[120px] ${
                        day === todayDayName ? 'bg-blue-50/80 text-[#214FA2] font-bold' : ''
                      }`}
                    >
                      {day}
                      {day === todayDayName && (
                        <span className="block text-[9px] uppercase tracking-normal">Today</span>
                      )}
                    </th>
                  )
                )}
                <th className="p-3.5 min-w-[220px]">Active Exam / Temporary Notice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAmbassadors.map((amb) => {
                const ambAvail = availabilityList.find((a) => a.ambassadorId === amb.id);

                return (
                  <tr key={amb.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 shrink-0">
                          <img
                            src={amb.avatarUrl}
                            alt={amb.fullName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{amb.fullName}</div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {amb.department}
                          </div>
                        </div>
                      </div>
                    </td>

                    {DAYS.filter((d) => selectedDayFilter === 'All' || selectedDayFilter === d).map(
                      (day) => {
                        const dayData = ambAvail?.weeklySchedule.find((s) => s.day === day);
                        const isAvailable =
                          dayData && dayData.isAvailable && dayData.slots.length > 0;

                        return (
                          <td
                            key={day}
                            className={`p-2.5 text-center align-middle ${
                              day === todayDayName ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            {isAvailable ? (
                              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-1.5 rounded-lg">
                                <div className="font-bold font-mono text-[10px]">
                                  {dayData.slots[0].startTime} - {dayData.slots[0].endTime}
                                </div>
                                {dayData.slots.length > 1 && (
                                  <span className="text-[9px] text-emerald-600 block">
                                    +{dayData.slots.length - 1} slot
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="text-slate-300 font-mono text-center">—</div>
                            )}
                          </td>
                        );
                      }
                    )}

                    <td className="p-3.5">
                      {ambAvail?.temporaryNote ? (
                        <div className="text-[11px] text-slate-700 bg-amber-50/60 p-2 rounded border border-amber-200 leading-snug">
                          {ambAvail.temporaryNote}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No notice</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
