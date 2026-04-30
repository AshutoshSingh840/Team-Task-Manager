import { useState } from 'react';
import api from '../api/axios';

const statusOptions = ['TODO', 'IN_PROGRESS', 'DONE'];
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH'];

const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-all';
const labelCls = 'block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider';

export default function TaskModal({ projectId, members, task, onClose, onSaved }) {
  const [form, setForm] = useState({
    title:      task?.title || '',
    description:task?.description || '',
    status:     task?.status || 'TODO',
    priority:   task?.priority || 'MEDIUM',
    dueDate:    task?.dueDate ? task.dueDate.split('T')[0] : '',
    assigneeId: task?.assigneeId || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, projectId, assigneeId: form.assigneeId || null, dueDate: form.dueDate || null };
      task ? await api.put(`/tasks/${task.id}`, payload) : await api.post('/tasks', payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.1] p-6 shadow-2xl"
        style={{ background: '#111827' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Title</label>
            <input required placeholder="Task title" value={form.title} onChange={set('title')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea placeholder="Optional description" value={form.description} onChange={set('description')}
              rows={2} className={`${inputCls} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={set('status')} className={inputCls}>
                {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Priority</label>
              <select value={form.priority} onChange={set('priority')} className={inputCls}>
                {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={set('dueDate')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Assignee</label>
              <select value={form.assigneeId} onChange={set('assigneeId')} className={inputCls}>
                <option value="">Unassigned</option>
                {members?.map(m => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
              {loading ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
