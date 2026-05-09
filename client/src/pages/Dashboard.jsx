import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ShieldAlert, Activity, Building, HeartPulse, HeartHandshake, TrendingUp, MapPin, Zap, Search, Loader2, Target, Plus, X, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { useAuth } from '../context/AuthContext';
import InterventionManager from '../components/InterventionManager';

// Helper function for color mapping
const getColorClasses = (color) => {
  const colorMap = {
    blue: { gradient: 'from-blue-500/10 to-transparent', bg: 'bg-blue-500/20', text: 'text-blue-500' },
    rose: { gradient: 'from-rose-500/10 to-transparent', bg: 'bg-rose-500/20', text: 'text-rose-500' },
    emerald: { gradient: 'from-emerald-500/10 to-transparent', bg: 'bg-emerald-500/20', text: 'text-emerald-500' }
  };
  return colorMap[color] || colorMap.blue;
};

// FeedCard component defined outside
const FeedCard = ({ title, icon, items, color, onVerify, onAction }) => {
  const colors = getColorClasses(color);
  return (
  <div className="glass-card flex flex-col h-[750px] overflow-hidden group">
    <div className={`p-8 border-b border-white/5 bg-linear-to-br ${colors.gradient} flex justify-between items-center`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${colors.bg} ${colors.text} shadow-xl`}>{icon}</div>
        <div>
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-900 dark:text-white">{title}</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Operational Unit</p>
        </div>
      </div>
      <span className="text-[10px] font-black px-3 py-1 bg-white/5 rounded-full border border-white/5">{items.length} Reports</span>
    </div>
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
      {items.length === 0 ? <p className="p-20 text-center text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] opacity-30 italic">Standby Mode</p> :
        items.map(r => (
          <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} key={r._id} className="p-6 bg-white/5 dark:bg-slate-800/40 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all group/item">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 group-hover/item:text-indigo-400 transition-colors tracking-tight">{r.title}</h4>
              <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter ${r.status === 'verified' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{r.status}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed text-justify line-clamp-3 px-1">{r.description}</p>
            <div className="flex items-center justify-between mb-5">
              <div className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-rose-500"/> {r.address?.split(',')[0] || 'Unmapped'}</div>
              <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${r.riskScore > 7 ? 'bg-rose-500/20 text-rose-500' : 'bg-indigo-500/20 text-indigo-500'}`}>RISK {r.riskScore?.toFixed(1)}</div>
            </div>
            <div className="flex gap-2">
              {r.status !== 'verified' && (
                <button onClick={() => onVerify(r._id, 'verified')} className="flex-1 py-3 text-[10px] font-black uppercase bg-white/5 text-emerald-500 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-white transition-all">Verify</button>
              )}
              <button onClick={() => onAction(r)} className="flex-1 py-3 text-[10px] font-black uppercase bg-indigo-600 text-white rounded-xl shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">Action</button>
            </div>
          </motion.div>
        ))}
    </div>
  </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [reports, setReports] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState(null);

  const isAuthority = user && ['admin', 'gov', 'ngo', 'healthcare'].includes(user.role?.toLowerCase());
  const isCitizen = user && ['user', 'citizen'].includes(user.role?.toLowerCase());

  const fetchData = useCallback(async () => {
    try {
      const promises = [axios.get('/api/reports?limit=50')];
      if (isAuthority) {
        promises.push(axios.get('/api/admin/stats'), axios.get('/api/analytics/overview'));
      }
      if (user) promises.push(axios.get('/api/reports/my'));
      
      const results = await Promise.allSettled(promises);
      if (results[0].status === 'fulfilled') setReports(Array.isArray(results[0].value.data) ? results[0].value.data : []);
      if (isAuthority) {
        if (results[1]?.status === 'fulfilled') setStats(results[1].value.data || {});
        if (results[2]?.status === 'fulfilled') setAnalytics(results[2].value.data || null);
        if (results[3]?.status === 'fulfilled') setMyReports(Array.isArray(results[3].value.data) ? results[3].value.data : []);
      } else {
        if (results[1]?.status === 'fulfilled') setMyReports(Array.isArray(results[1].value.data) ? results[1].value.data : []);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [isAuthority, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/admin/report/${id}`, { status });
      fetchData();
    } catch { alert('Update failed'); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-950">
      <div className="relative">
        <div className="w-20 h-20 border-2 border-indigo-500/20 rounded-full" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 w-20 h-20 border-2 border-indigo-500 border-t-transparent rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-indigo-500 uppercase tracking-tighter">Secure</div>
      </div>
    </div>
  );

  // ── CITIZEN/USER VIEW ──────────────────────────────────────────────────
  if (isCitizen) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 relative">
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full blur-[180px] animate-blob" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[180px] animate-blob animation-delay-2000" />
        </div>

        <header className="mb-12">
          <h1 className="text-6xl font-black text-gradient tracking-tighter mb-4">My Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs ml-1">Substance Abuse Monitoring & Community Impact</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 glass-card !justify-start p-10 border border-white/10 shadow-2xl backdrop-blur-2xl">
            <h2 className="text-3xl font-black mb-10 flex items-center gap-4 text-gray-900 dark:text-white tracking-tighter">
              <Activity className="text-indigo-600 w-8 h-8" /> Intelligence Archived
            </h2>
            <div className="space-y-6">
              {myReports.length === 0 ? (
                <div className="text-center py-24 opacity-30 italic font-black text-gray-500 uppercase tracking-[0.4em]">Awaiting Intel</div>
              ) : (
                myReports.map(r => (
                  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} key={r._id} className="p-8 bg-white/5 dark:bg-slate-800/40 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/30 transition-all group shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-black text-xl text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors tracking-tight">{r.title}</h3>
                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl ${r.status === 'verified' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'}`}>{r.status}</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 leading-relaxed line-clamp-2">{r.description}</p>
                    <div className="flex gap-8 pt-6 border-t border-white/5 text-[11px] font-black uppercase tracking-widest text-indigo-500">
                      <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(r.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Risk Factor: {r.riskScore?.toFixed(1)}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
          
          <div className="space-y-10">
            <div className="glass-card bg-gradient-to-br from-indigo-600 to-blue-700 p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <HeartPulse className="w-16 h-16 mb-8 text-white/90 group-hover:scale-110 transition-transform" />
              <h2 className="text-4xl font-black mb-4 tracking-tighter leading-tight">Elite Support Network</h2>
              <p className="opacity-80 mb-10 text-sm leading-relaxed font-bold">Confidential 24/7 recovery and counseling services specialized in substance abuse intervention and community safety.</p>
              <button className="w-full py-5 bg-white text-indigo-700 font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-gray-100 transition-all active:scale-95 shadow-2xl">Connect Now</button>
            </div>

            <div className="glass-card p-10 border border-white/10 shadow-2xl">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Personal Impact</h3>
              <div className="space-y-8">
                {[
                  { label: 'Reports Filed', val: myReports.length, color: 'indigo', bgClass: 'bg-indigo-500/10', textClass: 'text-indigo-500' },
                  { label: 'Verified Intel', val: myReports.filter(r => r.status === 'verified').length, color: 'emerald', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-500' },
                  { label: 'Community Contribution', val: (myReports.length * 15) + ' pts', color: 'blue', bgClass: 'bg-blue-500/10', textClass: 'text-blue-500' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center group/stat">
                    <div>
                      <p className="text-[11px] font-black text-gray-400 uppercase mb-2 tracking-widest">{item.label}</p>
                      <p className={`text-3xl font-black text-gray-900 dark:text-white tracking-tighter transition-colors`}>{item.val}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl ${item.bgClass} flex items-center justify-center ${item.textClass}`}><Activity className="w-6 h-6" /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── AUTHORITY VIEW ──────────────────────────────────────────────────────

  return (
    <div className="max-w-[1600px] w-[96%] mx-auto px-4 py-12 relative">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[150px] animate-blob" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] animate-blob animation-delay-2000" />
      </div>

      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 mb-16 px-4">
        <div>
          <h1 className="text-7xl font-black tracking-tighter mb-4 text-gradient">Command Center</h1>
          <div className="flex items-center gap-5">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/40 animate-pulse" /> Strategic Intelligence Access
            </span>
            <span className="text-gray-300 dark:text-gray-800">|</span>
            <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{user?.role} Unit Portal</span>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="glass-card px-10 py-6 text-center min-w-[200px]">
            <div className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{stats.totalReports || reports.length}</div>
            <div className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 opacity-70">Intelligence</div>
          </div>
          <div className="glass-card px-10 py-6 text-center min-w-[200px] border-indigo-500/30">
            <div className="text-4xl font-black text-indigo-500 tracking-tighter">{stats.verified || 0}</div>
            <div className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 opacity-70">Verified</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 space-y-12">
          <section className={`grid grid-cols-1 ${user?.role?.toLowerCase() === 'admin' ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
            {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'gov') && <FeedCard title="Law Enforcement" icon={<Building className="w-5 h-5" />} items={reports.filter(r => ['suspicious_activity'].includes(r.category))} color="blue" onVerify={handleUpdateStatus} onAction={(r) => { setActiveReport(r); document.getElementById('command-panel')?.scrollIntoView({ behavior: 'smooth' }); }} />}
            {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'healthcare') && <FeedCard title="Medical Support" icon={<HeartPulse className="w-5 h-5" />} items={reports.filter(r => ['drug_abuse', 'alcohol_abuse'].includes(r.category))} color="rose" onVerify={handleUpdateStatus} onAction={(r) => { setActiveReport(r); document.getElementById('command-panel')?.scrollIntoView({ behavior: 'smooth' }); }} />}
            {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'ngo') && <FeedCard title="NGO Outreach" icon={<HeartHandshake className="w-5 h-5" />} items={reports} color="emerald" onVerify={handleUpdateStatus} onAction={(r) => { setActiveReport(r); document.getElementById('command-panel')?.scrollIntoView({ behavior: 'smooth' }); }} />}
          </section>

          {analytics && (
            <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="glass-card p-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full -z-10" />
              <div className="flex justify-between items-center mb-16">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-5">
                  <TrendingUp className="text-indigo-500 w-10 h-10" /> Operational Trends
                </h2>
                <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-full border border-white/5">
                  <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-xl shadow-indigo-500/50" />
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Real-time Intelligence</span>
                </div>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.dailyReports || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 900 }} tickFormatter={v => v?.slice(5) || ''} stroke="#94a3b8" axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 900 }} stroke="#94a3b8" axisLine={false} />
                    <Tooltip cursor={{ fill: '#ffffff03' }} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.4)', padding: '20px' }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[15, 15, 0, 0]} barSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.section>
          )}
        </div>

        <div id="command-panel" className="xl:col-span-4 h-[750px]">
          <InterventionManager user={user} activeReport={activeReport} setActiveReport={setActiveReport} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
