import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/users').then(res => setUsers(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRoleChange = async (userId, role) => {
    await api.patch(`/users/${userId}/role`, { role });
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <svg className="w-5 h-5 animate-spin text-slate-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-slate-500 text-sm mt-1">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-0 border-b border-white/[0.06] px-5 py-3">
          {['Name', 'Email', 'Role', 'Joined', ''].map((h, i) => (
            <p key={i} className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</p>
          ))}
        </div>

        <div className="divide-y divide-white/[0.04]">
          {users.map(u => (
            <div key={u.id} className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-0 items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                  {u.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{u.name}</p>
                  {u.id === currentUser?.id && (
                    <p className="text-[10px] text-indigo-400">you</p>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-500 truncate pr-4">{u.email}</p>

              <span className={`text-xs px-2.5 py-1 rounded-lg font-medium mr-4 ${
                u.role === 'ADMIN'
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'bg-slate-700/60 text-slate-400'
              }`}>
                {u.role}
              </span>

              <p className="text-xs text-slate-600 mr-4 whitespace-nowrap">
                {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>

              <div>
                {u.id !== currentUser?.id && (
                  <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-300 focus:outline-none focus:border-indigo-500/60 transition-all cursor-pointer">
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
