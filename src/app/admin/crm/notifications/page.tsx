'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, CheckSquare, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CRMNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/crm/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      const res = await fetch('/api/admin/crm/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      toast.error('Request failed');
    }
  }

  async function markAllAsRead() {
    try {
      const res = await fetch('/api/admin/crm/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readAll: true })
      });
      if (res.ok) {
        toast.success('All notifications marked as read');
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      toast.error('Request failed');
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2 flex items-center">
            <Bell className="w-8 h-8 mr-3 text-primary" />
            Notifications
          </h1>
          <p className="text-gray-500 font-medium text-sm">Stay updated on deal closures, high-priority tasks, and incoming leads.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-white border border-gray-200 text-secondary hover:bg-gray-50 text-xs font-black uppercase tracking-widest px-6 py-3 flex items-center"
          >
            <CheckSquare className="w-4 h-4 mr-2 text-primary" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-gray-200 p-6 animate-pulse flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 w-2/3" />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-gray-200 p-16 text-center flex flex-col items-center">
            <Bell className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              You're all caught up! No notifications.
            </p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification._id} 
              className={`border p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors ${
                !notification.read ? 'bg-primary/5 border-primary/20' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-10 h-10 rounded-none flex items-center justify-center flex-shrink-0 ${
                  !notification.read ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                
                <div className="flex-1 space-y-1 mt-1">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-sm font-black uppercase tracking-wider ${!notification.read ? 'text-secondary' : 'text-gray-500'}`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  
                  <p className={`text-xs font-medium leading-relaxed max-w-4xl ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                    {notification.message}
                  </p>

                  <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-3 pt-3 border-t border-gray-100/50">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {new Date(notification.createdAt).toLocaleString(undefined, {
                      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                    
                    <span className="ml-4 flex items-center before:content-['•'] before:mr-4 before:text-gray-300">
                      Type: {notification.type}
                    </span>
                  </div>
                </div>
              </div>
              
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  className="p-2 text-primary hover:bg-primary/10 border border-transparent transition-colors flex-shrink-0 self-start"
                  title="Mark as Read"
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
