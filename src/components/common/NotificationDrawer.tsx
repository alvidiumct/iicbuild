import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Check, Bell, Clock, AlertCircle, FileText, Megaphone } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    currentUser,
    currentAmbassador,
    setActiveView,
    setSelectedTaskId,
  } = useApp();

  if (!isOpen) return null;

  // Filter notifications relevant to this user
  const userNotifications = notifications.filter(
    (n) =>
      n.recipientId === 'all' ||
      (currentAmbassador && n.recipientId === currentAmbassador.id) ||
      (currentUser.role === 'ADMIN' && n.recipientId === 'admin')
  );

  const handleNotificationClick = (id: string, actionUrl?: string) => {
    markNotificationAsRead(id);
    if (actionUrl) {
      if (actionUrl.startsWith('task:')) {
        const taskId = actionUrl.replace('task:', '');
        setSelectedTaskId(taskId);
        setActiveView(currentUser.role === 'ADMIN' ? 'admin-tasks' : 'tasks');
      } else if (actionUrl === 'announcements') {
        setActiveView('announcements');
      }
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'approval':
        return <Check className="w-4 h-4 text-emerald-600" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-[#214FA2]" />;
      default:
        return <FileText className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-700" />
            <h2 className="font-bold text-sm text-slate-900">Notifications</h2>
            <span className="text-[11px] font-semibold text-slate-500">
              ({userNotifications.filter((n) => !n.read).length} unread)
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs text-[#214FA2] hover:text-[#1a3f85] font-semibold px-2 py-1 rounded hover:bg-slate-100"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {userNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No notifications right now.</p>
            </div>
          ) : (
            userNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif.id, notif.actionUrl)}
                className={`p-4 transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-3 ${
                  !notif.read ? 'bg-blue-50/40' : ''
                }`}
              >
                <div className="mt-0.5 shrink-0 p-1.5 rounded-md bg-slate-100 border border-slate-200">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#214FA2] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(notif.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
