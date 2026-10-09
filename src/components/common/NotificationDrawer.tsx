import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCheck, Trash2, X, Package, Shield, Bike, Info } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, clearNotifications, role } = useApp();

  if (!isOpen) return null;

  // Filter notifications relevant to current role or all
  const filteredNotifications = notifications.filter(
    (n) => n.targetRole === 'all' || n.targetRole === role
  );

  const unreadCount = filteredNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Drawer content */}
      <div className="relative z-10 w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Notifications</h2>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {filteredNotifications.length > 0 && (
              <button
                onClick={clearNotifications}
                title="Clear all"
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-700">No notifications yet</h3>
              <p className="mt-1 text-xs text-slate-500">Updates about orders and recipes will show up here.</p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              let icon = <Info className="h-4 w-4 text-blue-500" />;
              if (n.type === 'order') icon = <Package className="h-4 w-4 text-emerald-600" />;
              if (n.type === 'rider') icon = <Bike className="h-4 w-4 text-amber-500" />;
              if (n.type === 'inventory') icon = <Shield className="h-4 w-4 text-rose-500" />;

              return (
                <div
                  key={n.id}
                  onClick={() => markNotificationAsRead(n.id)}
                  className={`group relative rounded-xl border p-3.5 transition cursor-pointer ${
                    n.isRead
                      ? 'border-slate-100 bg-white hover:bg-slate-50/70'
                      : 'border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs border border-slate-100">
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{n.title}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                  {!n.isRead && (
                    <div className="absolute top-3.5 right-3 h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && unreadCount > 0 && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={() => filteredNotifications.forEach((n) => markNotificationAsRead(n.id))}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
