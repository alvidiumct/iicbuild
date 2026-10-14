import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EventItem } from '../../types';
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Plus,
  CheckCircle,
  ExternalLink,
  X,
  Check,
} from 'lucide-react';

export const EventsView: React.FC = () => {
  const { events, ambassadors, currentUser, currentAmbassador, volunteerForEvent, createEvent, dispatchNotification } =
    useApp();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [eventStartTime, setEventStartTime] = useState('10:00');
  const [eventEndTime, setEventEndTime] = useState('16:00');
  const [eventVenue, setEventVenue] = useState('DIU International Conference Hall');
  const [eventHours, setEventHours] = useState(6.0);
  const [eventRequiredCount, setEventRequiredCount] = useState(10);

  const handleVolunteer = (eventId: string) => {
    if (!currentAmbassador) {
      dispatchNotification({
        title: 'Ambassador Role Required',
        message: 'Only registered student ambassadors can sign up to volunteer for innovation events.',
        type: 'reminder',
      });
      return;
    }
    if (volunteerForEvent) {
      volunteerForEvent(eventId, currentAmbassador.id);
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDescription) return;

    createEvent({
      title: eventTitle,
      description: eventDescription,
      date: eventDate,
      time: `${eventStartTime} - ${eventEndTime}`,
      startTime: eventStartTime,
      endTime: eventEndTime,
      venue: eventVenue,
      creditHours: Number(eventHours),
      creditedHours: Number(eventHours),
      requiredAmbassadors: Number(eventRequiredCount),
      assignedAmbassadorIds: [],
      volunteerRoles: [
        { roleTitle: 'Registration & Hospitality' },
        { roleTitle: 'Tech Support & AV' },
        { roleTitle: 'Stage Coordination' },
      ],
    });

    setCreateModalOpen(false);
    setEventTitle('');
    setEventDescription('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Logistics & Engagement</span>
            <span aria-hidden="true">·</span>
            <span>Events & Hackathons</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Centre Events & Volunteer Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Volunteer for university summits and earn verified contribution hours toward your 4-hour commitment
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        )}
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((ev) => {
          const isSignedUp =
            currentAmbassador && ev.assignedAmbassadorIds.includes(currentAmbassador.id);
          const volunteers = ambassadors.filter((a) => ev.assignedAmbassadorIds.includes(a.id));

          return (
            <div
              key={ev.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <div className="flex items-center gap-1.5 font-semibold text-[#214FA2]">
                    <CalendarDays className="w-4 h-4" />
                    <span>{ev.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {ev.startTime} - {ev.endTime}
                    </span>
                  </div>

                  <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    +{ev.creditedHours}h Credited
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">{ev.title}</h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mt-2">
                  {ev.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{ev.venue}</span>
                </div>

                {/* Volunteer Roster Status */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Volunteers Roster:</span>
                    </span>
                    <span className="font-mono text-slate-500">
                      {ev.assignedAmbassadorIds.length} / {ev.requiredAmbassadors} Needed
                    </span>
                  </div>

                  {volunteers.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {volunteers.map((vol) => (
                        <span
                          key={vol.id}
                          className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                        >
                          {vol.fullName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              {currentUser.role === 'AMBASSADOR' && (
                <div className="pt-2">
                  {isSignedUp ? (
                    <div className="w-full py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>You are registered for this event</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleVolunteer(ev.id)}
                      className="w-full py-2 bg-[#214FA2] hover:bg-[#1a3f85] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Volunteer & Claim {ev.creditedHours} Contribution Hours</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE EVENT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Publish Centre Event</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. DIU IoT & Autonomous Robotics Expo 2026"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Event purpose, agenda, attendee profile, and logistics requirements..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start</label>
                  <input
                    type="time"
                    required
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End</label>
                  <input
                    type="time"
                    required
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Venue</label>
                  <input
                    type="text"
                    required
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    placeholder="Innovation Lab 402"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Credited Hours *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="16"
                    value={eventHours}
                    onChange={(e) => setEventHours(parseFloat(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
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
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
