import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Users, CheckCircle, Activity, Bell, Building, HeartPulse, HeartHandshake, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const PIE_COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({ icon, label, value, color, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden`}>
    <div className={`absolute top-0 right-0 w-20 h-20 bg-${color}-500/10 rounded-bl-full`} />
    <div className={`w-10 h-10 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [reports, setReports] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthority = user && ['admin', 'gov', 'ngo', 'healthcare'].includes(user.role);

  const fetchData = async () => {
    try {
      const promises = [axios.get('/api/reports?limit=100')];
      if (isAuthority) {
        promises.push(
          axios.get('/api/admin/stats'),
          axios.get('/api/analytics/overview')
        );
      }
      if (user) {
        promises.push(axios.get('/api/reports/my'));
      }
      const results = await Promise.allSettled(promises);
      if (results[0].status === 'fulfilled') setReports(results[0].value.data);
      if (isAuthority) {
        if (results[1]?.status === 'fulfilled') setStats(results[1].value.data);
        if (results[2]?.status === 'fulfilled') setAnalytics(results[2].value.data);
        const myIdx = 3;
        if (results[myIdx]?.status === 'fulfilled') setMyReports(results[myIdx].value.data);
      } else {
        const myIdx = 1;
        if (results[myIdx]?.status === 'fulfilled') setMyReports(results[myIdx].value.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/admin/report/${id}`, { status });
      fetchData();
    } catch { alert('Error updating status'); }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await axios.delete(`/api/admin/report/${id}`);
      fetchData();
    } catch { alert('Error deleting report'); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-teal-500" />
    </div>
  );

  // ── CITIZEN VIEW ──────────────────────────────────────────────────────────
  if (user?.role === 'user') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">My Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your reports and access help resources.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-teal-500" /> My Submitted Reports
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {myReports.length === 0
                ? <p className="text-sm text-gray-400 text-center py-8">No reports submitted yet.</p>
                : myReports.map(r => (
                  <div key={r._id} className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100 line-clamp-1">{r.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status === 'verified' ? 'bg-green-100 text-green-700' : r.status === 'rejected' ? 'bg-red-100 text-red-700' : r.status === 'resolved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()} • Risk: {r.riskScore?.toFixed(1)}/10</p>
                    {r.isAnonymous && <span className="text-[10px] text-purple-500 font-semibold">🔒 Anonymous</span>}
                  </div>
                ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm">
            <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5" /> Help &amp; Resources
            </h2>
            <div className="space-y-3">
              {[
                { title: 'National Substance Abuse Helpline', detail: '1800-11-0031', sub: 'Free 24/7 | Confidential' },
                { title: 'iCall Psychological Support', detail: '9152987821', sub: 'Mon–Sat 8am–10pm' },
                { title: 'Vandrevala Foundation', detail: '1860-2662-345', sub: '24x7 mental health helpline' },
              ].map(r => (
                <div key={r.title} className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{r.title}</p>
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{r.detail}</p>
                  <p className="text-xs text-gray-400">{r.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── AUTHORITY VIEW ─────────────────────────────────────────────────────────
  const pending = reports.filter(r => r.status === 'pending');
  const govReports = reports.filter(r => ['suspicious_activity'].includes(r.category));
  const healthReports = reports.filter(r => ['drug_abuse', 'alcohol_abuse'].includes(r.category));
  const ngoReports = reports.filter(r => ['drug_abuse', 'alcohol_abuse', 'suspicious_activity'].includes(r.category));

  const ActionButtons = ({ id, status }) => (
    <div className="flex gap-1.5 mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
      {status !== 'verified' && <button onClick={() => handleUpdateStatus(id, 'verified')} className="flex-1 text-[10px] font-bold py-1 rounded bg-green-500 hover:bg-green-600 text-white transition-colors">Verify</button>}
      {status !== 'rejected' && <button onClick={() => handleUpdateStatus(id, 'rejected')} className="flex-1 text-[10px] font-bold py-1 rounded bg-red-500 hover:bg-red-600 text-white transition-colors">Reject</button>}
      {status !== 'resolved' && <button onClick={() => handleUpdateStatus(id, 'resolved')} className="flex-1 text-[10px] font-bold py-1 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors">Resolve</button>}
      <button onClick={() => handleDeleteReport(id)} className="flex-1 text-[10px] font-bold py-1 rounded bg-gray-400 hover:bg-gray-500 text-white transition-colors">Delete</button>
    </div>
  );

  const ReportList = ({ items, emptyMsg }) => (
    <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
      {items.length === 0
        ? <p className="text-sm text-gray-400 text-center py-6">{emptyMsg}</p>
        : items.map(r => (
          <div key={r._id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-xs text-gray-800 dark:text-gray-200 line-clamp-1 flex-1">{r.title}</h3>
              <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${r.status === 'verified' ? 'bg-green-100 text-green-700' : r.status === 'rejected' ? 'bg-red-100 text-red-700' : r.status === 'resolved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">{new Date(r.createdAt).toLocaleDateString()} · Risk: {r.riskScore?.toFixed(1)}</p>
            <ActionButtons id={r._id} status={r.status} />
          </div>
        ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Command Center</h1>
          <p className="text-gray-400 text-sm mt-1">Logged in as <span className="font-semibold text-teal-600 dark:text-teal-400 uppercase">{user?.role}</span> — {user?.name}</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live — Auto-refresh 30s</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<ShieldAlert className="w-5 h-5"/>} label="Total Reports" value={stats.totalReports ?? reports.length} color="blue" delay={0} />
        <StatCard icon={<CheckCircle className="w-5 h-5"/>} label="Verified" value={stats.verified ?? 0} color="green" delay={0.05} />
        <StatCard icon={<Bell className="w-5 h-5"/>} label="Pending Review" value={stats.pending ?? pending.length} color="amber" delay={0.1} />
        <StatCard icon={<Users className="w-5 h-5"/>} label="Total Users" value={stats.users ?? '—'} color="indigo" delay={0.15} />
      </div>

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Area chart — daily trend */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-500" /> Reports — Last 30 Days
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics.dailyReports} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2} fill="url(#cGrad)" name="Reports" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie — by category */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">By Category</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={analytics.byCategory} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {analytics.byCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} formatter={(v, n) => [v, n.replace(/_/g, ' ')]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} formatter={v => v.replace(/_/g, ' ')} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar — by status */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">Reports by Status</h2>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={analytics.byStatus} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {analytics.byStatus.map((entry, i) => {
                    const colors = { pending: '#f59e0b', verified: '#10b981', rejected: '#ef4444', resolved: '#3b82f6' };
                    return <Cell key={i} fill={colors[entry.name] || '#8b5cf6'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Authority Panels */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Authority Panels</h2>
      <div className={`grid grid-cols-1 ${user?.role === 'admin' ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6 mb-8`}>
        {(user?.role === 'admin' || user?.role === 'gov') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/50 flex flex-col h-96 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2 text-sm"><Building className="w-4 h-4"/>Gov / Law Enforcement</h3>
              <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{govReports.length}</span>
            </div>
            <ReportList items={govReports} emptyMsg="No government alerts." />
          </motion.div>
        )}
        {(user?.role === 'admin' || user?.role === 'healthcare') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-red-200 dark:border-red-900/50 flex flex-col h-96 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-red-800 dark:text-red-200 flex items-center gap-2 text-sm"><HeartPulse className="w-4 h-4"/>Healthcare</h3>
              <span className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{healthReports.length}</span>
            </div>
            <ReportList items={healthReports} emptyMsg="No healthcare alerts." />
          </motion.div>
        )}
        {(user?.role === 'admin' || user?.role === 'ngo') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 flex flex-col h-96 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 text-sm"><HeartHandshake className="w-4 h-4"/>NGO &amp; Community</h3>
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{ngoReports.length}</span>
            </div>
            <ReportList items={ngoReports} emptyMsg="No NGO alerts." />
          </motion.div>
        )}
      </div>

      {/* High-risk hotspots */}
      {analytics?.highRiskHotspots?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" /> High-Risk Hotspots
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.highRiskHotspots.map(r => (
              <div key={r._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-red-100 dark:border-red-900/40 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-1 flex-1">{r.title}</h3>
                  <span className="ml-2 text-sm font-black text-red-600 dark:text-red-400">{r.riskScore.toFixed(1)}</span>
                </div>
                <p className="text-xs text-gray-400 capitalize">{r.category.replace(/_/g, ' ')} · {r.status}</p>
                {r.address && <p className="text-xs text-gray-400 mt-1 line-clamp-1">📍 {r.address}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
