import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskModal from '../components/TaskModal';
import { format } from 'date-fns';

const statusConfig = {
  TODO:        { label: 'To Do',       cls: 'bg-slate-700/60 text-slate-300 border-slate-600/40' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  DONE:        { label: 'Done',        cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
};

const priorityConfig = {
  LOW:    { cls: 'text-slate-500', dot: 'bg-slate-500' },
  MEDIUM: { cls: 'text-amber-400',  dot: 'bg-amber-400' },
  HIGH:   { cls: 'text-red-400',   dot: 'bg-red-400' },
};

const filters = ['ALL', 'TODO', 'IN_PROGRESS', 'DONE'];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [memberUserId, setMemberUserId] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const load = () => {
    api.get(`/projects/${id}`).then(res => setProject(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const isProjectAdmin = project?.members?.some(m => m.userId === user?.id && m.role === 'ADMIN');
  const canManage = user?.role === 'ADMIN' || isProjectAdmin;

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    load();
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks?')) return;
    await api.delete(`/projects/${id}`);
    navigate('/projects');
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    await api.post(`/projects/${id}/members`, { userId: memberUserId });
    setShowAddMember(false);
    setMemberUserId('');
    load();
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    await api.delete(`/projects/${id}/members/${userId}`);
    load();
  };

  const openAddMember = async () => {
    const res = await api.get('/users');
    setAllUsers(res.data);
    setShowAddMember(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <svg className="w-5 h-5 animate-spin text-slate-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );
  if (!project) return <div className="p-8 text-red-400">Project not found</div>;

  const filteredTasks = statusFilter === 'ALL' ? project.tasks : project.tasks.filter(t => t.status === statusFilter);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          {project.description && <p className="text-slate-500 text-sm mt-1">{project.description}</p>}
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <button onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
            <button onClick={handleDeleteProject}
              className="px-4 py-2.5 text-sm font-medium text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-colors">
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-3">
          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 mb-5 p-1 rounded-xl glass w-fit">
            {filters.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === s
                    ? 'bg-indigo-500/20 text-indigo-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">No tasks here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map(task => (
                <div key={task.id}
                  className="group flex items-start gap-4 p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {/* Priority dot */}
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${priorityConfig[task.priority]?.dot}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-200">{task.title}</p>
                      <span className={`text-xs px-2.5 py-0.5 rounded-lg font-medium border ${statusConfig[task.status]?.cls}`}>
                        {statusConfig[task.status]?.label}
                      </span>
                    </div>
                    {task.description && <p className="text-xs text-slate-500 mt-1">{task.description}</p>}
                    <div className="flex items-center gap-4 mt-2">
                      {task.assignee && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <div className="w-4 h-4 rounded-full bg-indigo-500/30 flex items-center justify-center text-[9px] font-bold text-indigo-300">
                            {task.assignee.name[0].toUpperCase()}
                          </div>
                          {task.assignee.name}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 text-xs ${
                          new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                            ? 'text-red-400' : 'text-slate-500'
                        }`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => { setEditingTask(task); setShowTaskModal(true); }}
                        className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members sidebar */}
        <div className="glass rounded-2xl p-4 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200">Members</h3>
            {canManage && (
              <button onClick={openAddMember}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            )}
          </div>
          <div className="space-y-2">
            {project.members.map(m => (
              <div key={m.id} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                    {m.user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-300">{m.user.name}</p>
                    <p className="text-[10px] text-slate-600">{m.role}</p>
                  </div>
                </div>
                {canManage && m.userId !== user?.id && (
                  <button onClick={() => handleRemoveMember(m.userId)}
                    className="text-slate-600 hover:text-red-400 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showTaskModal && (
        <TaskModal projectId={id} members={project.members} task={editingTask}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSaved={load} />
      )}

      {showAddMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/[0.1] p-6 shadow-2xl"
            style={{ background: '#111827' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Add Member</h2>
              <button onClick={() => setShowAddMember(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-3">
              <select required value={memberUserId} onChange={e => setMemberUserId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-100 text-sm focus:outline-none focus:border-indigo-500/60 transition-all">
                <option value="">Select a user</option>
                {allUsers.filter(u => !project.members.some(m => m.userId === u.id))
                  .map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowAddMember(false)}
                  className="px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-all"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
