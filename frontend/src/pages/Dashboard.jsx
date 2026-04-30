import { useEffect, useState } from 'react';
import api from '../api/axios';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  TODO:        { label: 'To Do',       cls: 'bg-slate-700/60 text-slate-300' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-500/15 text-blue-400' },
  DONE:        { label: 'Done',        cls: 'bg-emerald-500/15 text-emerald-400' },
};

const statCards = (s) => [
  { label: 'Total Tasks',  value: s.total,      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'from-indigo-500/20 to-indigo-600/5', iconColor: 'text-indigo-400', border: 'border-indigo-500/20' },
  { label: 'To Do',        value: s.todo,       icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',                                                                                          color: 'from-slate-500/20 to-slate-600/5',  iconColor: 'text-slate-400',  border: 'border-slate-500/20' },
  { label: 'In Progress',  value: s.inProgress, icon: 'M13 10V3L4 14h7v7l9-11h-7z',                                                                                                           color: 'from-blue-500/20 to-blue-600/5',    iconColor: 'text-blue-400',   border: 'border-blue-500/20' },
  { label: 'Overdue',      value: s.overdue,    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'from-red-500/20 to-red-600/5',      iconColor: 'text-red-400',    border: 'border-red-500/20' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-3 text-slate-500">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Loading...
      </div>
    </div>
  );

  const { stats, recentTasks, overdueTasks } = data;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here's what's happening with your tasks today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards(stats).map(card => (
          <div key={card.label}
            className={`relative overflow-hidden rounded-2xl border ${card.border} bg-gradient-to-br ${card.color} p-5`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
              </div>
              <div className={`p-2 rounded-xl bg-white/5 ${card.iconColor}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-300">Overall Progress</p>
            <p className="text-sm font-semibold text-white">{Math.round((stats.done / stats.total) * 100)}%</p>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(stats.done / stats.total) * 100}%`,
                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
              }} />
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span>{stats.done} completed</span>
            <span>{stats.total - stats.done} remaining</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Tasks */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Recent Tasks</h2>
            <span className="text-xs text-slate-600">{recentTasks.length} tasks</span>
          </div>
          {recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 text-sm">No tasks yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{task.project?.name}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-medium shrink-0 ${statusConfig[task.status]?.cls}`}>
                    {statusConfig[task.status]?.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Overdue</h2>
            {overdueTasks.length > 0
              ? <span className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-lg font-medium">{overdueTasks.length} overdue</span>
              : <span className="text-xs text-slate-600">All clear</span>
            }
          </div>
          {overdueTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">No overdue tasks</p>
            </div>
          ) : (
            <div className="space-y-2">
              {overdueTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{task.project?.name}</p>
                  </div>
                  <span className="text-xs text-red-400 font-medium shrink-0">
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
