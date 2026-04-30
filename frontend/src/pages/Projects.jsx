import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const projectColors = [
  'from-indigo-500/20', 'from-purple-500/20', 'from-blue-500/20',
  'from-pink-500/20', 'from-cyan-500/20', 'from-violet-500/20',
];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const load = () => {
    api.get('/projects').then(res => setProjects(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/projects', form);
      setForm({ name: '', description: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Failed');
    }
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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No projects yet</p>
          <p className="text-slate-600 text-sm mt-1">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <Link key={p.id} to={`/projects/${p.id}`}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] p-5 hover:border-white/[0.14] transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${projectColors[i % projectColors.length]} to-transparent opacity-30 pointer-events-none`} />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                    {p.name[0].toUpperCase()}
                  </div>
                  <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-100 mb-1">{p.name}</h3>
                {p.description && <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/[0.06]">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {p._count.members}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {p._count.tasks} tasks
                  </span>
                  <span className="ml-auto text-xs text-slate-600">{p.owner.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.1] p-6 shadow-2xl"
            style={{ background: '#111827' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">New Project</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mb-3 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-3">
              <input required placeholder="Project name" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
              <textarea placeholder="Description (optional)" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-all resize-none"
              />
              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-all"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
