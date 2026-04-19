'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  ShieldCheck, 
  User as UserIcon, 
  Mail, 
  UserCheck, 
  Loader2,
  Lock,
  X,
  UserPlus,
  Eye,
  Edit3,
  Trash2,
  Search,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: 'admin' | 'seo' | 'marketing';
  permissions: string[];
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [search, setSearch] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'marketing' as const,
    permissions: [] as string[]
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      toast.error('Failed to fetch personnel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreate = () => {
    setEditUser(null);
    setViewOnly(false);
    setForm({
      name: '',
      email: '',
      username: '',
      password: '',
      role: 'marketing',
      permissions: ['blogs']
    });
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setViewOnly(false);
    setForm({
      name: user.name,
      email: user.email,
      username: user.username,
      password: '',
      role: user.role,
      permissions: user.permissions || []
    });
    setShowModal(true);
  };

  const openView = (user: User) => {
    setEditUser(user);
    setViewOnly(true);
    setForm({
      name: user.name,
      email: user.email,
      username: user.username,
      password: '●●●●●●●●',
      role: user.role,
      permissions: user.permissions || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this user? This action is permanent.')) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Access revoked');
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Revocation failed');
      }
    } catch (err) {
      toast.error('Network error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (viewOnly) return;
    
    setFormLoading(true);
    try {
      const url = editUser ? `/api/admin/users/${editUser._id}` : '/api/admin/users';
      const method = editUser ? 'PATCH' : 'POST';
      
      const payload = { ...form };
      if (editUser && !payload.password) delete (payload as any).password;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(editUser ? 'Identity updated' : 'Personnel authenticated');
        setShowModal(false);
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Operation failed');
      }
    } catch (err) {
      toast.error('Network error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const common = "px-3 py-1 text-[10px] font-black uppercase tracking-widest border";
    switch (role) {
      case 'admin':
        return <span className={`${common} bg-yellow-50 text-yellow-700 border-yellow-200`}>System Admin</span>;
      case 'seo':
        return <span className={`${common} bg-blue-50 text-blue-700 border-blue-200`}>SEO Strategist</span>;
      default:
        return <span className={`${common} bg-purple-50 text-purple-700 border-purple-200`}>Asset Marketing</span>;
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-secondary tracking-tighter uppercase mb-2">
            Identity Console
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
            Manage administrative personnel and access vectors
          </p>
        </div>

        <button 
          onClick={openCreate}
          className="flex items-center space-x-3 px-10 py-5 bg-secondary text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all shadow-2xl shadow-secondary/20 group"
        >
          <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Grant Access</span>
        </button>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3 bg-white border border-gray-100 p-4 flex items-center px-6">
          <Search className="w-4 h-4 text-gray-300 mr-4" />
          <input 
            type="text" 
            placeholder="Search identity index..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-bold text-secondary uppercase tracking-widest placeholder:text-gray-200"
          />
        </div>
        <div className="bg-primary p-4 px-8 flex items-center justify-between">
          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Active Units</span>
          <span className="text-2xl font-black text-white">{filteredUsers.length}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-gray-300">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Hydrating Personnel Index...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Identity</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Username</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Role Attribution</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Authorized Since</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Operations</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-secondary text-white flex items-center justify-center font-black text-sm group-hover:bg-primary transition-colors">
                          {user.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-secondary uppercase tracking-tight">{user.name}</p>
                          <div className="flex items-center text-[10px] text-gray-400 font-bold group-hover:text-primary transition-colors">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      @{user.username}
                    </td>
                    <td className="px-8 py-6">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-8 py-6 text-xs font-medium text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end space-x-3">
                        <button 
                          onClick={() => openView(user)}
                          className="p-2 text-gray-300 hover:text-secondary hover:bg-gray-100 transition-all rounded-none"
                          title="View Identity"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEdit(user)}
                          className="p-2 text-gray-300 hover:text-primary hover:bg-primary/5 transition-all rounded-none"
                          title="Modify Access"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)}
                          className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all rounded-none"
                          title="Terminate Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-secondary/90 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="relative w-full max-w-xl bg-white shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="bg-secondary p-8 flex items-center justify-between border-b border-white/10">
              <div>
                <div className="flex items-center space-x-2 text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-1">
                  <span>Console</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Personnel Authorization</span>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                  {viewOnly ? 'Identity Verification' : editUser ? 'Modify Access Vector' : 'Personnel Onboarding'}
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Legal Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      type="text"
                      disabled={viewOnly}
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 outline-none text-xs font-bold text-secondary focus:border-primary transition-all disabled:opacity-50"
                      placeholder="e.g. Anand Maurya"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      type="email"
                      disabled={viewOnly}
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 outline-none text-xs font-bold text-secondary focus:border-primary transition-all disabled:opacity-50"
                      placeholder="name@labzenix.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Console Username</label>
                  <div className="relative">
                    <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      type="text"
                      disabled={viewOnly}
                      value={form.username}
                      onChange={e => setForm({...form, username: e.target.value})}
                      className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 outline-none text-xs font-bold text-secondary focus:border-primary transition-all disabled:opacity-50"
                      placeholder="lab_admin"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">System Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      type={viewOnly ? 'text' : 'password'}
                      disabled={viewOnly}
                      value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 outline-none text-xs font-bold text-secondary focus:border-primary transition-all disabled:opacity-50"
                      placeholder={editUser ? 'Leave blank to keep current' : '••••••••'}
                      required={!editUser}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pb-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Access Vector Authorization</label>
                  <div className="flex space-x-2">
                    <button 
                      type="button" 
                      onClick={() => setForm({ ...form, permissions: ['seo', 'blogs'] })}
                      className="text-[8px] font-black uppercase border border-blue-200 bg-blue-50 px-2 py-1 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      SEO Strategist Template
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setForm({ ...form, permissions: ['blogs', 'products', 'categories', 'inquiries'] })}
                      className="text-[8px] font-black uppercase border border-purple-200 bg-purple-50 px-2 py-1 text-purple-600 hover:bg-purple-100 transition-colors"
                    >
                      Marketing Preset
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: 'blogs', label: 'Blogs' },
                    { id: 'products', label: 'Products' },
                    { id: 'categories', label: 'Categories' },
                    { id: 'seo', label: 'SEO' },
                    { id: 'inquiries', label: 'Inquiries' },
                    { id: 'users', label: 'Identity' },
                    { id: 'settings', label: 'Settings' }
                  ].map(perm => (
                    <button
                      key={perm.id}
                      type="button"
                      disabled={viewOnly || form.role === 'admin'}
                      onClick={() => {
                        const newPerms = form.permissions.includes(perm.id)
                          ? form.permissions.filter(p => p !== perm.id)
                          : [...form.permissions, perm.id];
                        setForm({ ...form, permissions: newPerms });
                      }}
                      className={`p-3 border text-[9px] font-black uppercase tracking-widest transition-all ${
                        form.role === 'admin' || form.permissions.includes(perm.id)
                          ? 'bg-primary border-primary text-white' 
                          : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                      } disabled:opacity-50`}
                    >
                      {perm.label}
                    </button>
                  ))}
                </div>
                {form.role === 'admin' && (
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Admins have universal access vectors enabled by default.</p>
                )}
              </div>

              {!viewOnly && (
                <button 
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-5 bg-primary text-white text-xs font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  {formLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {editUser ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      <span>{editUser ? 'Update Credentials' : 'Authorize Personnel'}</span>
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
