import React, { useState, useEffect } from 'react';
import axios from 'axios';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, Clock, MapPin, Activity, ShieldCheck, Target, X, Zap, Search, Loader2 } from 'lucide-react';

const INTERVENTION_TYPES = [
  { value: 'awareness_campaign', label: 'Awareness Campaign', icon: '📢', roles: ['admin', 'ngo', 'gov'] },
  { value: 'police_patrol', label: 'Police Patrol', icon: '🚔', roles: ['admin', 'gov'] },
  { value: 'healthcare_outreach', label: 'Healthcare Outreach', icon: '🏥', roles: ['admin', 'healthcare', 'ngo'] },
  { value: 'rehabilitation_program', label: 'Rehab Program', icon: '🤝', roles: ['admin', 'healthcare'] },
];

const InterventionManager = ({ user, activeReport, setActiveReport }) => {
  const [interventions, setInterventions] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [formData, setFormData] = useState({
    title: '', type: '', longitude: 73.8567, latitude: 18.5204, radius: 2000, address: ''
  });

  useEffect(() => {
    if (activeReport) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: `Protocol: ${activeReport.title}`,
        type: '',
        longitude: activeReport.location?.coordinates[0] || 73.8567,
        latitude: activeReport.location?.coordinates[1] || 18.5204,
        radius: 2000,
        address: activeReport.address || ''
      });
      setShowCreate(true);
    }
  }, [activeReport]);

  const fetchInterventions = async () => {
    try {
      const res = await axios.get('/api/admin/interventions');
      setInterventions(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchInterventions(); }, []);

  const handleAddressSearch = async () => {
    if (!formData.address?.trim()) return;
    setGeocoding(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=1`);
      if (res.data?.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        setFormData(f => ({ ...f, latitude: parseFloat(lat), longitude: parseFloat(lon), address: display_name }));
      } else { alert('Area not identified'); }
    } catch (err) { console.error(err); } finally { setGeocoding(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.type) return alert('Select protocol');
    try {
      await axios.post('/api/admin/intervention', formData);
      setShowCreate(false);
      setActiveReport(null);
      setFormData({ title: '', type: '', longitude: 73.8567, latitude: 18.5204, radius: 2000, address: '' });
      fetchInterventions();
    } catch (_err) { alert('Deployment failed'); }
  };

  const handleEvaluate = async (id) => {
    try {
      await axios.put(`/api/admin/intervention/${id}/evaluate`);
      fetchInterventions();
    } catch (_err) { alert('Evaluation failed'); }
  };

  const allowedTypes = INTERVENTION_TYPES.filter(t => t.roles.includes(user?.role));

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent -z-10" />
      
      {/* Luxury Header */}
      <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-3xl">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-indigo-600/20 rounded-[1.5rem] shadow-xl">
            <Target className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Action Hub</h2>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Authorized Deployment</p>
          </div>
        </div>
        {!showCreate && (
          <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowCreate(true)} className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-2xl shadow-indigo-600/40 flex items-center justify-center">
            <Plus className="w-8 h-8" />
          </motion.button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-10 relative custom-scrollbar">
        <AnimatePresence mode="wait">
          {showCreate ? (
            <motion.div key="form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-indigo-500 uppercase tracking-[0.3em]">Strategy Configuration</h3>
                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-rose-500/10 rounded-2xl text-gray-400 hover:text-rose-500 transition-all"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Geographic Target</label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-5 top-5 w-5 h-5 text-rose-500" />
                        <input required type="text" placeholder="Area Name" className="w-full pl-14 pr-6 py-5 bg-white/5 dark:bg-slate-900/50 border border-white/5 rounded-3xl text-sm font-black outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all dark:text-white" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddressSearch())} />
                      </div>
                      <button type="button" onClick={handleAddressSearch} disabled={geocoding} className="px-6 bg-white/5 dark:bg-slate-900/50 border border-white/5 rounded-3xl text-gray-400 hover:text-indigo-400 transition-all">
                        {geocoding ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Operation Title</label>
                    <input required type="text" placeholder="Strategic Codename" className="w-full px-6 py-5 bg-white/5 dark:bg-slate-900/50 border border-white/5 rounded-3xl text-sm font-black outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Action Protocol</label>
                  <div className="grid grid-cols-2 gap-4">
                    {allowedTypes.map(t => (
                      <button key={t.value} type="button" onClick={() => setFormData({...formData, type: t.value})} className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${formData.type === t.value ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-600/30' : 'bg-white/5 dark:bg-slate-900/30 border-white/5 text-gray-500 hover:border-indigo-500/30'}`}>
                        <span className="text-3xl">{t.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn-neon w-full py-6 rounded-3xl font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-3">
                  <Zap className="w-5 h-5 fill-white" /> DEPLOY PROTOCOL
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-10">
              {interventions.length === 0 ? <div className="text-center py-32 opacity-20 italic font-black text-gray-500 uppercase tracking-[0.4em]">Standby Status</div> :
                interventions.map(item => (
                  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} key={item._id} className="p-8 bg-white/5 dark:bg-slate-800/60 rounded-[2.5rem] border border-white/5 shadow-xl group/item relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent -z-10" />
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-inner">{INTERVENTION_TYPES.find(t => t.value === item.type)?.icon}</div>
                        <div>
                          <h4 className="font-black text-gray-900 dark:text-white text-md tracking-tight">{item.title}</h4>
                          <p className="text-[10px] font-black text-indigo-500 uppercase mt-1 tracking-widest">{item.type.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg ${item.status === 'completed' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-indigo-500 text-white shadow-indigo-500/20'}`}>{item.status}</span>
                    </div>
                    {item.status === 'completed' ? (
                      <div className="p-4 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20 flex items-center justify-between">
                        <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em]">Success Rate</span>
                        <span className="text-2xl font-black text-emerald-500">+{item.riskReduction}%</span>
                      </div>
                    ) : (
                      <button onClick={() => handleEvaluate(item._id)} className="w-full py-4 bg-white/5 dark:bg-slate-700/50 border border-white/10 text-gray-300 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">Evaluate Impact</button>
                    )}
                  </motion.div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InterventionManager;
