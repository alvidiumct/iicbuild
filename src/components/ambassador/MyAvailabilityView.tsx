import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DayAvailability } from '../../types';
import { Calendar, Plus, Trash2, Clock, Check, AlertCircle, Save } from 'lucide-react';

const DAYS: DayAvailability['day'][] = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export const MyAvailabilityView: React.FC = () => {
  const { currentAmbassador, getAmbassadorAvailability, updateMyAvailability } = useApp();

  const ambassador = currentAmbassador;
  if (!ambassador) {
    return <div className="p-8 text-center text-slate-500">Please select an ambassador user.</div>;
  }

  const existing = getAmbassadorAvailability(ambassador.id);

  const [schedule, setSchedule] = useState<DayAvailability[]>(() => {
    if (existing?.weeklySchedule && existing.weeklySchedule.length > 0) {
      return existing.weeklySchedule;
    }
    return DAYS.map((d) => ({
      day: d,
      isAvailable: d !== 'Sunday' && d !== 'Friday',
      slots: d !== 'Sunday' && d !== 'Friday' ? [{ startTime: '16:00', endTime: '20:00' }] : [],
    }));
  });

  const [temporaryNote, setTemporaryNote] = useState(existing?.temporaryNote || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleDayAvailable = (dayName: DayAvailability['day']) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day !== dayName) return d;
        const newAvailable = !d.isAvailable;
        return {
          ...d,
          isAvailable: newAvailable,
          slots: newAvailable && d.slots.length === 0 ? [{ startTime: '16:00', endTime: '20:00' }] : d.slots,
        };
      })
    );
  };

  const addSlot = (dayName: DayAvailability['day']) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day !== dayName) return d;
        return {
          ...d,
          isAvailable: true,
          slots: [...d.slots, { startTime: '18:00', endTime: '21:00' }],
        };
      })
    );
  };

  const removeSlot = (dayName: DayAvailability['day'], index: number) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day !== dayName) return d;
        const nextSlots = d.slots.filter((_, i) => i !== index);
        return {
          ...d,
          slots: nextSlots,
          isAvailable: nextSlots.length > 0,
        };
      })
    );
  };

  const updateSlotTime = (
    dayName: DayAvailability['day'],
    index: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day !== dayName) return d;
        const nextSlots = d.slots.map((s, i) => (i === index ? { ...s, [field]: value } : s));
        return { ...d, slots: nextSlots };
      })
    );
  };

  const handleSave = () => {
    updateMyAvailability(schedule, temporaryNote);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Quick Preset Helper
  const applyPreset = (preset: 'evenings' | 'weekends' | 'open') => {
    if (preset === 'evenings') {
      setSchedule(
        DAYS.map((d) => ({
          day: d,
          isAvailable: d !== 'Friday',
          slots: d !== 'Friday' ? [{ startTime: '16:00', endTime: '20:00' }] : [],
        }))
      );
    } else if (preset === 'weekends') {
      setSchedule(
        DAYS.map((d) => ({
          day: d,
          isAvailable: d === 'Saturday' || d === 'Sunday',
          slots:
            d === 'Saturday' || d === 'Sunday'
              ? [{ startTime: '10:00', endTime: '18:00' }]
              : [],
        }))
      );
    } else if (preset === 'open') {
      setSchedule(
        DAYS.map((d) => ({
          day: d,
          isAvailable: true,
          slots: [{ startTime: '14:00', endTime: '20:00' }],
        }))
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Availability Management</span>
            <span aria-hidden="true">·</span>
            <span>Weekly Roster Coordination</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            My Weekly Availability
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Set your recurring available hours for task assignment, lab shifts, and team meetings
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Availability</span>
          </button>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-700">Quick Availability Presets:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => applyPreset('evenings')}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-700 hover:bg-slate-100"
          >
            Weekdays Evening (4 PM - 8 PM)
          </button>
          <button
            onClick={() => applyPreset('weekends')}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-700 hover:bg-slate-100"
          >
            Weekends (10 AM - 6 PM)
          </button>
          <button
            onClick={() => applyPreset('open')}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-700 hover:bg-slate-100"
          >
            All Days Open
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
        {DAYS.map((dayName) => {
          const dayData = schedule.find((d) => d.day === dayName) || {
            day: dayName,
            isAvailable: false,
            slots: [],
          };

          return (
            <div
              key={dayName}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
                dayData.isAvailable ? 'bg-white' : 'bg-slate-50/50'
              }`}
            >
              {/* Day title & toggle */}
              <div className="w-44 shrink-0">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id={`toggle-${dayName}`}
                    checked={dayData.isAvailable}
                    onChange={() => toggleDayAvailable(dayName)}
                    className="w-4 h-4 rounded text-[#214FA2] focus:ring-[#214FA2] border-slate-300 cursor-pointer"
                  />
                  <label
                    htmlFor={`toggle-${dayName}`}
                    className={`font-bold text-sm cursor-pointer ${
                      dayData.isAvailable ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {dayName}
                  </label>
                </div>
                <span className="text-[11px] text-slate-400 block ml-6.5 mt-0.5">
                  {dayData.isAvailable ? `${dayData.slots.length} time slot(s)` : 'Marked unavailable'}
                </span>
              </div>

              {/* Time Slots */}
              <div className="flex-1 space-y-2">
                {dayData.isAvailable ? (
                  <>
                    {dayData.slots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 ml-1" />
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              updateSlotTime(dayName, index, 'startTime', e.target.value)
                            }
                            className="bg-transparent text-xs font-mono font-semibold text-slate-800 focus:outline-hidden"
                          />
                          <span className="text-slate-400">to</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) =>
                              updateSlotTime(dayName, index, 'endTime', e.target.value)
                            }
                            className="bg-transparent text-xs font-mono font-semibold text-slate-800 focus:outline-hidden"
                          />
                        </div>

                        <button
                          onClick={() => removeSlot(dayName, index)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100"
                          title="Remove time slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => addSlot(dayName)}
                      className="text-xs font-semibold text-[#214FA2] hover:underline flex items-center gap-1 mt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add another time slot for {dayName}</span>
                    </button>
                  </>
                ) : (
                  <div className="text-xs text-slate-400 py-1">
                    No availability set. Check box on the left to activate hours for this day.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Temporary Note */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Temporary Notes / Examination Schedule Notice
        </label>
        <textarea
          rows={3}
          value={temporaryNote}
          onChange={(e) => setTemporaryNote(e.target.value)}
          placeholder="e.g. Midterm exams from Oct 12 - Oct 18, will be available only after 7:00 PM."
          className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2]"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>This note will be visible in the Admin Availability Matrix.</span>
          <button
            onClick={handleSave}
            className="font-semibold text-[#214FA2] hover:underline"
          >
            Update note
          </button>
        </div>
      </div>
    </div>
  );
};
