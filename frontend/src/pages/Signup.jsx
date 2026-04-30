import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1a0533 100%)' }}>
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #6366f1 0%, transparent 50%), radial-gradient(circle at 70% 70%, #a855f7 0%, transparent 50%)' }} />
        <div className="relative z-10 max-w-sm">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-8"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Start shipping<br />
            <span className="gradient-text">as a team.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Create your workspace, invite your team, and start tracking tasks in minutes.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
            <p className="text-slate-400 text-sm">Get started with TaskFlow for free</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name',     label: 'Full name', type: 'text',     placeholder: 'Jane Doe' },
              { key: 'email',    label: 'Email',     type: 'email',    placeholder: 'you@example.com' },
              { key: 'password', label: 'Password',  type: 'password', placeholder: 'Min. 6 characters' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
                <input
                  type={type} required minLength={key === 'password' ? 6 : undefined}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.07] transition-all"
                  placeholder={placeholder}
                />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 mt-2"
              style={{ background: loading ? '#4338ca' : 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
