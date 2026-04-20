import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Users, CheckCircle, Activity, BarChart2, Bell, Building, HeartPulse, HeartHandshake } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [reports, setReports] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('admin');

  useEffect(() => {
    fetchData();
    // Real-Time Alerts: Poll every 10 seconds for new data
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        setUserRole(user.role || 'admin');
      }
      
      const resStats = await axios.get(`http://localhost:5000/api/admin/stats?adminId=${user?.id || ''}`);
      setStats(resStats.data);
      
      const resReports = await axios.get('http://localhost:5000/api/reports');
      setReports(resReports.data);

      const resInterventions = await axios.get(`http://localhost:5000/api/admin/interventions?adminId=${user?.id || ''}`);
      setInterventions(resInterventions.data);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
       const user = JSON.parse(localStorage.getItem('user'));
       await axios.put(`http://localhost:5000/api/admin/report/${id}?adminId=${user?.id || ''}`, { status });
       fetchData(); 
    } catch(err) {
       alert('Error updating status');
    }
  };

  const handleDeleteReport = async (id) => {
    if(!window.confirm('Are you sure you want to delete this report?')) return;
    try {
       const user = JSON.parse(localStorage.getItem('user'));
       await axios.delete(`http://localhost:5000/api/admin/report/${id}?adminId=${user?.id || ''}`);
       fetchData(); 
    } catch(err) {
       alert('Error deleting report');
    }
  };

  const handleEvaluateIntervention = async (id) => {
    try {
       const user = JSON.parse(localStorage.getItem('user'));
       await axios.put(`http://localhost:5000/api/admin/intervention/${id}/evaluate?adminId=${user?.id || ''}`);
       fetchData();
    } catch(err) {
       alert('Error evaluating intervention');
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
    </div>
  );

  // Categorize reports for the three panels
  const govReports = reports.filter(r => ['suspicious_activity', 'loitering'].includes(r.category));
  const healthReports = reports.filter(r => ['substance_use', 'drug_paraphernalia'].includes(r.category));
  const ngoReports = reports.filter(r => ['other', 'substance_use'].includes(r.category));
  
  const user = JSON.parse(localStorage.getItem('user'));
  const myReports = reports.filter(r => r.userId && r.userId._id === user?.id);

  if (userRole === 'user') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">My Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your contributions and access community resources.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* User Stats & Reports */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass bg-white/60 dark:bg-slate-800/60 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700/50 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">My Submitted Reports</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {myReports.length === 0 ? (
                <p className="text-gray-500 text-sm">You haven't submitted any reports yet.</p>
              ) : (
                myReports.map(r => (
                  <div key={r._id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-sm">{r.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${r.status==='verified' ? 'bg-green-100 text-green-800' : r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Resources */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass bg-indigo-50/50 dark:bg-indigo-900/20 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
             <h2 className="text-xl font-bold mb-4 text-indigo-900 dark:text-indigo-100 flex items-center gap-2"><HeartHandshake className="w-5 h-5"/> Community Help & Resources</h2>
             <div className="space-y-4">
               <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                 <h3 className="font-bold text-gray-800 dark:text-white text-sm">National Helpline for Substance Abuse</h3>
                 <p className="text-xl font-black text-indigo-600 mt-1">1800-11-0031</p>
                 <p className="text-xs text-gray-500 mt-1">Available 24/7. Toll-free and confidential.</p>
               </div>
               <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                 <h3 className="font-bold text-gray-800 dark:text-white text-sm">Local Rehabilitation Center</h3>
                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Contact your nearest NGO or hospital for free counseling and rehabilitation programs. Recovery is possible.</p>
               </div>
             </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Command Center</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Multi-Authority Intelligence & Action Matrix</p>
        </div>
        <div className="glass px-4 py-2 rounded-full flex items-center gap-3 border border-gray-200 dark:border-slate-700 w-full md:w-auto">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">System Online ({userRole.toUpperCase()})</span>
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

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authority Panels</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Targeted data streams for Government, Healthcare, and NGO intervention based on community reports.</p>
      </div>

      <div className={`grid grid-cols-1 ${userRole === 'admin' ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6 mb-8`}>
        {/* Panel 1: Government */}
        {(userRole === 'admin' || userRole === 'gov') && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass bg-slate-50/80 dark:bg-slate-800/80 p-5 rounded-[2rem] border border-blue-200 dark:border-blue-900/50 flex flex-col h-[400px] shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full z-0"></div>
            <div className="flex justify-between items-center mb-4 z-10">
              <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600 dark:text-blue-400"/> Gov / Law Enforcement
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full dark:bg-blue-900/50 dark:text-blue-300">
                {govReports.length} Alerts
              </span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar z-10">
              {govReports.map(r => (
                <div key={r._id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{r.title}</h3>
                    <span className="text-[10px] text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{r.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                     <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded dark:bg-blue-900/30 dark:text-blue-400">
                       {r.category.replace('_', ' ')}
                     </span>
                  </div>
                  {/* Action Buttons */}
                  <div className="mt-3 flex gap-2 border-t border-gray-100 dark:border-slate-700 pt-2">
                    <button onClick={() => handleUpdateStatus(r._id, 'verified')} className="text-[10px] flex-1 bg-green-500 hover:bg-green-600 text-white py-1 rounded transition-colors">Verify</button>
                    <button onClick={() => handleUpdateStatus(r._id, 'rejected')} className="text-[10px] flex-1 bg-red-500 hover:bg-red-600 text-white py-1 rounded transition-colors">Reject</button>
                    <button onClick={() => handleDeleteReport(r._id)} className="text-[10px] flex-1 bg-gray-500 hover:bg-gray-600 text-white py-1 rounded transition-colors">Delete</button>
                  </div>
                </div>
              ))}
              {govReports.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No active government alerts.</p>}
            </div>
          </motion.div>
        )}

        {/* Panel 2: Healthcare */}
        {(userRole === 'admin' || userRole === 'healthcare') && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass bg-slate-50/80 dark:bg-slate-800/80 p-5 rounded-[2rem] border border-red-200 dark:border-red-900/50 flex flex-col h-[400px] shadow-sm relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full z-0"></div>
            <div className="flex justify-between items-center mb-4 z-10">
              <h2 className="text-lg font-bold text-red-900 dark:text-red-100 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-red-600 dark:text-red-400"/> Healthcare Centers
              </h2>
              <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full dark:bg-red-900/50 dark:text-red-300">
                {healthReports.length} Alerts
              </span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar z-10">
              {healthReports.map(r => (
                <div key={r._id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{r.title}</h3>
                    <span className="text-[10px] text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{r.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                     <span className="text-[10px] uppercase tracking-wider font-bold text-red-600 bg-red-50 px-2 py-1 rounded dark:bg-red-900/30 dark:text-red-400">
                       {r.category.replace('_', ' ')}
                     </span>
                  </div>
                  {/* Action Buttons */}
                  <div className="mt-3 flex gap-2 border-t border-gray-100 dark:border-slate-700 pt-2">
                    <button onClick={() => handleUpdateStatus(r._id, 'verified')} className="text-[10px] flex-1 bg-green-500 hover:bg-green-600 text-white py-1 rounded transition-colors">Verify</button>
                    <button onClick={() => handleUpdateStatus(r._id, 'rejected')} className="text-[10px] flex-1 bg-red-500 hover:bg-red-600 text-white py-1 rounded transition-colors">Reject</button>
                    <button onClick={() => handleDeleteReport(r._id)} className="text-[10px] flex-1 bg-gray-500 hover:bg-gray-600 text-white py-1 rounded transition-colors">Delete</button>
                  </div>
                </div>
              ))}
              {healthReports.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No active healthcare alerts.</p>}
            </div>
          </motion.div>
        )}

        {/* Panel 3: NGO */}
        {(userRole === 'admin' || userRole === 'ngo') && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass bg-slate-50/80 dark:bg-slate-800/80 p-5 rounded-[2rem] border border-emerald-200 dark:border-emerald-900/50 flex flex-col h-[400px] shadow-sm relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full z-0"></div>
            <div className="flex justify-between items-center mb-4 z-10">
              <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400"/> NGO & Community
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full dark:bg-emerald-900/50 dark:text-emerald-300">
                {ngoReports.length} Alerts
              </span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar z-10">
              {ngoReports.map(r => (
                <div key={r._id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{r.title}</h3>
                    <span className="text-[10px] text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{r.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                     <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded dark:bg-emerald-900/30 dark:text-emerald-400">
                       {r.category.replace('_', ' ')}
                     </span>
                  </div>
                  {/* Action Buttons */}
                  <div className="mt-3 flex gap-2 border-t border-gray-100 dark:border-slate-700 pt-2">
                    <button onClick={() => handleUpdateStatus(r._id, 'verified')} className="text-[10px] flex-1 bg-green-500 hover:bg-green-600 text-white py-1 rounded transition-colors">Verify</button>
                    <button onClick={() => handleUpdateStatus(r._id, 'rejected')} className="text-[10px] flex-1 bg-red-500 hover:bg-red-600 text-white py-1 rounded transition-colors">Reject</button>
                    <button onClick={() => handleDeleteReport(r._id)} className="text-[10px] flex-1 bg-gray-500 hover:bg-gray-600 text-white py-1 rounded transition-colors">Delete</button>
                  </div>
                </div>
              ))}
              {ngoReports.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No active NGO alerts.</p>}
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Global Validation Queue for Admin */}
      {userRole === 'admin' && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass bg-white/60 dark:bg-slate-800/60 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700/50 flex flex-col h-[400px]"
          >
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                   <Bell className="w-5 h-5 text-indigo-500"/> Global Validation Queue
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
                         <button onClick={() => handleDeleteReport(r._id)} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors shadow-sm">Delete</button>
                       </div>
                     )}
                  </div>
                </div>
              ))}
              {reports.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Action queue empty.</p>}
            </div>
          </motion.div>
      )}

      {/* Intervention Effectiveness Tracker */}
      <div className="mt-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Intervention Effectiveness Tracker</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Measure risk reduction after targeted actions and awareness campaigns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
         {interventions.map((intv) => (
           <motion.div 
             key={intv._id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="glass bg-white/80 dark:bg-slate-800/80 p-5 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col justify-between"
           >
             <div>
               <div className="flex justify-between items-start mb-2">
                 <h3 className="font-bold text-gray-900 dark:text-white text-lg">{intv.title}</h3>
                 <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${intv.status === 'completed' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'}`}>
                   {intv.status}
                 </span>
               </div>
               <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-4">{intv.type.replace('_', ' ')} • Radius: {intv.radius}m</p>
               
               {intv.status === 'completed' ? (
                 <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-700 text-center">
                   <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-semibold">Measured Risk Reduction</p>
                   <p className={`text-3xl font-black ${intv.riskReduction > 0 ? 'text-emerald-500' : intv.riskReduction < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                     {intv.riskReduction > 0 ? '↓ ' : intv.riskReduction < 0 ? '↑ ' : ''}{Math.abs(intv.riskReduction)}%
                   </p>
                 </div>
               ) : (
                 <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex items-center justify-center h-24">
                   <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Collecting data...<br/><span className="text-xs">Evaluate to see risk reduction.</span></p>
                 </div>
               )}
             </div>

             <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
               <span className="text-[10px] text-gray-400 dark:text-gray-500">Started: {new Date(intv.startDate).toLocaleDateString()}</span>
               {intv.status !== 'completed' && userRole !== 'user' && (
                 <button 
                   onClick={() => handleEvaluateIntervention(intv._id)}
                   className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded transition-colors shadow-sm"
                 >
                   Mark Work Done & Evaluate
                 </button>
               )}
             </div>
           </motion.div>
         ))}
         {interventions.length === 0 && (
            <div className="col-span-full p-8 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl flex items-center justify-center">
               <p className="text-gray-500 dark:text-gray-400 text-center">No active interventions being tracked.</p>
            </div>
         )}
      </div>
      

    </div>
  );
};

export default Dashboard;
