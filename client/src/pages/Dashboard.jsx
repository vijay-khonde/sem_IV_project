import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Users, CheckCircle, Activity, BarChart2, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Real-Time Alerts: Poll every 10 seconds for new data
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;
      
      const resStats = await axios.get(`http://localhost:5000/api/admin/stats?adminId=${user.id}`);
      setStats(resStats.data);
      
      const resReports = await axios.get('http://localhost:5000/api/reports');
      setReports(resReports.data);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
       const user = JSON.parse(localStorage.getItem('user'));
       await axios.put(`http://localhost:5000/api/admin/report/${id}?adminId=${user.id}`, { status });
       fetchData(); 
    } catch(err) {
       alert('Error updating status');
    }
  };

  const chartData = [
    { name: 'Mon', reports: 4, verified: 2 },
    { name: 'Tue', reports: 7, verified: 4 },
    { name: 'Wed', reports: 3, verified: 1 },
    { name: 'Thu', reports: 5, verified: 3 },
    { name: 'Fri', reports: 8, verified: 6 },
    { name: 'Sat', reports: 12, verified: 9 },
    { name: 'Sun', reports: 6, verified: 5 },
  ];

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Command Center</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">System overview and threat intelligence matrix.</p>
        </div>
        <div className="glass px-4 py-2 rounded-full flex items-center gap-3 border border-gray-200 dark:border-slate-700 w-full md:w-auto">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: <ShieldAlert className="w-6 h-6" />, label: 'Total Reports', value: stats.totalReports || 0, color: 'blue' },
          { icon: <CheckCircle className="w-6 h-6" />, label: 'Verified Threats', value: stats.verified || 0, color: 'green' },
          { icon: <Users className="w-6 h-6" />, label: 'Total Users', value: stats.users || 0, color: 'indigo' },
          { icon: <Activity className="w-6 h-6" />, label: 'Resolved', value: stats.resolved || 0, color: 'purple' }
        ].map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass bg-white/60 dark:bg-slate-800/60 rounded-[1.5rem] p-6 flex flex-col justify-between border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${card.color}-500/10 rounded-bl-[100px] z-0`}></div>
            <div className={`p-3 rounded-2xl bg-${card.color}-100/50 dark:bg-${card.color}-900/30 text-${card.color}-600 dark:text-${card.color}-400 w-12 h-12 flex items-center justify-center mb-4 z-10`}>
              {card.icon}
            </div>
            <div className="z-10">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass bg-white/60 dark:bg-slate-800/60 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700/50 flex-[2]"
        >
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                 <BarChart2 className="w-5 h-5 text-indigo-500"/> Threat Velocity Matrix
             </h2>
             <select className="bg-transparent border border-gray-200 dark:border-slate-600 rounded-lg text-sm px-2 py-1 dark:text-gray-300">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
             </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="reports" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReports)" />
                <Area type="monotone" dataKey="verified" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVerified)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass bg-white/60 dark:bg-slate-800/60 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700/50 flex-1 flex flex-col h-[400px]"
        >
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                 <Bell className="w-5 h-5 text-indigo-500"/> Validation Queue
             </h2>
             <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{reports.filter(r=>r.status==='pending').length} Actions Req</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {reports.slice().reverse().map((r) => (
              <div key={r._id} className="p-4 glass bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{r.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${r.status==='pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400'}`}>
                    {r.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                   <p className="text-xs text-gray-500 dark:text-gray-400 font-mono tracking-tight">{new Date(r.createdAt).toLocaleDateString()}</p>
                   {r.status === 'pending' && (
                     <div className="flex gap-2">
                       <button onClick={() => handleUpdateStatus(r._id, 'verified')} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors shadow-sm">Verify</button>
                       <button onClick={() => handleUpdateStatus(r._id, 'rejected')} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors shadow-sm">Reject</button>
                     </div>
                   )}
                </div>
              </div>
            ))}
            {reports.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Action queue empty.</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
