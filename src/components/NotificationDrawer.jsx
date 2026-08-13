import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCheck, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const { setUnreadNotifications } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadNotifications(res.unreadCount || 0);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n))
      );
      const unread = notifications.filter((n) => !n.isRead && n._id !== id && n.id !== id).length;
      setUnreadNotifications(unread);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifications(0);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-100">Notifications</h3>
          </div>
          <div className="flex items-center space-x-2">
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium px-2 py-1 bg-cyan-950/50 border border-cyan-800/40 rounded-lg cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id || item.id}
                className={`p-3.5 rounded-xl border transition-all text-sm ${
                  item.isRead
                    ? 'bg-slate-900/60 border-slate-800/60 text-slate-400'
                    : 'bg-slate-800/80 border-cyan-500/30 text-slate-100 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.type === 'NEW_REPORT' && <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    {item.type === 'VERIFICATION' && <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    {item.type === 'STATUS_CHANGE' && <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                    <h4 className="font-semibold text-slate-200 text-xs">{item.title}</h4>
                  </div>
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkRead(item._id || item.id)}
                      className="text-[10px] text-cyan-400 hover:underline flex-shrink-0 cursor-pointer"
                    >
                      Mark Read
                    </button>
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-300 leading-relaxed">{item.message}</p>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  {item.incidentId && (
                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/incidents/${item.incidentId}`);
                      }}
                      className="text-cyan-400 hover:underline font-medium cursor-pointer"
                    >
                      View Report →
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;
