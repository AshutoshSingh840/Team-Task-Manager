import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { format } from 'date-fns';

const statusConfig = {
  TODO:        { label: 'To Do',       cls: 'bg-slate-700/60 text-slate-300' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-500/15 text-blue-400' },
  DONE:        { label: 'Done',        cls: 'bg-emerald-500/15 text-emerald-400' },
};

const priorityDot = {
  LOW:    'bg-slate-500',
  MEDIUM: 'bg-amber-400',
  HIGH:   'bg-red-400',
};

const filters = ['ALL', 'TODO', 'IN_PROGRESS', 'DONE'];

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    api.get('/tasks/my').then(res => setTasks(res.data)).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <svg className="w-5 h-5 animate-spin text-slate-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );

  const filtered = statusFilter === 'ALL' ? tasks : tasks.filter(t => t.status === statusFilter);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Tasks</h1>
        <p className="text-slate-500 text-sm mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
      </div>

      <div className="flex items-center gap-1.5 mb-5 p-1 rounded-xl glass w-fit">
        {filters.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === s
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No tasks here</p>
          <p className="text-slate-600 text-sm mt-1">You're all caught up</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => (
            <div key={task.id}
              className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority]}`} />

              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-200">{task.title}</p>
                {task.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>}
                <div className="flex items-center gap-3 mt-1.5">
                  <Link to={`/projects/${task.project?.id}`}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                    </svg>
                    {task.project?.name}
                  </Link>
                  {task.dueDate && (
                    <span className={`flex items-center gap-1 text-xs ${
                      new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                        ? 'text-red-400' : 'text-slate-500'
                    }`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>

              <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/50 ${statusConfig[task.status]?.cls}`}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
