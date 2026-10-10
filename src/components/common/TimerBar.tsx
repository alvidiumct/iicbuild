import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Pause, Square, AlertCircle, Clock } from 'lucide-react';

export const TimerBar: React.FC = () => {
  const {
    activeTimer,
    activeTimerElapsedSeconds,
    pauseTimer,
    resumeTimer,
    punchOut,
    cancelTimer,
  } = useApp();

  const [punchOutModalOpen, setPunchOutModalOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  if (!activeTimer) return null;

  const hours = Math.floor(activeTimerElapsedSeconds / 3600);
  const minutes = Math.floor((activeTimerElapsedSeconds % 3600) / 60);
  const seconds = activeTimerElapsedSeconds % 60;
  const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleConfirmPunchOut = () => {
    punchOut(sessionNotes);
    setSessionNotes('');
    setPunchOutModalOpen(false);
  };

  return (
    <>
      <div className="bg-slate-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between border-b border-slate-800 transition-all z-30 sticky top-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                activeTimer.isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
              {activeTimer.isPaused ? 'Paused' : 'Active Timer'}
            </span>
          </div>

          <div className="hidden sm:block text-slate-500">|</div>

          <div className="min-w-0 truncate">
            <span className="text-xs text-slate-400 mr-1.5 hidden md:inline">Task:</span>
            <span className="text-sm font-medium text-slate-100 truncate">{activeTimer.taskTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="font-mono text-base font-semibold tracking-wider tabular-nums px-2.5 py-1 bg-slate-800/90 rounded border border-slate-700 text-emerald-400">
            {timeFormatted}
          </div>

          <div className="flex items-center gap-1.5">
            {activeTimer.isPaused ? (
              <button
                onClick={resumeTimer}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                title="Resume timer"
              >
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Resume</span>
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                title="Pause timer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pause</span>
              </button>
            )}

            <button
              onClick={() => setPunchOutModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-red-600 hover:bg-red-500 text-white transition-colors"
              title="Punch Out and log completed contribution time"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Punch Out</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Discard this timer without logging hours?')) {
                  cancelTimer();
                }
              }}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded transition-colors hidden lg:inline"
              title="Discard timer"
            >
              Discard
            </button>
          </div>
        </div>
      </div>

      {/* Punch Out Confirmation Modal */}
      {punchOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4 text-slate-900">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Complete Work Session</h3>
                <p className="text-xs text-slate-500">Record time to your weekly contribution scorecard</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 space-y-1.5">
              <div className="text-xs text-slate-500">Task Title</div>
              <div className="text-sm font-semibold text-slate-800">{activeTimer.taskTitle}</div>
              <div className="pt-2 flex justify-between items-center text-xs text-slate-600">
                <span>Active Duration:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{timeFormatted}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Credited to Weekly 4h Goal:</span>
                <span className="font-mono font-bold text-emerald-600">
                  +{(activeTimerElapsedSeconds / 3600).toFixed(2)} Hours
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Session Work Notes (Optional)
              </label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="What progress or deliverable did you work on during this session?"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] resize-none h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPunchOutModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Continue Working
              </button>
              <button
                type="button"
                onClick={handleConfirmPunchOut}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors shadow-xs"
              >
                Log Time & Punch Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
