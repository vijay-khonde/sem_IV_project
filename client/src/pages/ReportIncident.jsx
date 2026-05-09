import React, { useState } from 'react';
import axios from 'axios';
import { Camera, MapPin, Send, AlertTriangle, CheckCircle2, UserX, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SEVERITY_TAGS = [
  { id: 'minors_involved', label: 'Minors Involved' },
  { id: 'weapons_involved', label: 'Weapons Present' },
  { id: 'group_activity', label: 'Group Activity' },
  { id: 'overdose_risk', label: 'Overdose Risk' },
];

const ReportIncident = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'suspicious_activity',
    image: null, longitude: '', latitude: '', address: '',
    isAnonymous: false, severityTags: []
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();

  const handleLocation = () => {
    setStatus({ type: 'info', msg: 'Pinging GPS...' });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
          setStatus({ type: 'success', msg: 'Location acquired via GPS.' });
        },
        () => setStatus({ type: 'error', msg: 'GPS access denied.' })
      );
    }
  };

  const handleAddressSearch = async () => {
    if (!formData.address.trim()) return;
    setStatus({ type: 'info', msg: 'Searching address...' });
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=1`);
      if (res.data?.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        setFormData(f => ({ ...f, latitude: parseFloat(lat), longitude: parseFloat(lon), address: display_name }));
        setStatus({ type: 'success', msg: 'Address verified.' });
      } else {
        setStatus({ type: 'error', msg: 'Address not found.' });
      }
    } catch { setStatus({ type: 'error', msg: 'Search failed.' }); }
  };

  // eslint-disable-next-line no-unused-vars
  const toggleTag = (tagId) => {
    setFormData(f => ({
      ...f,
      severityTags: f.severityTags.includes(tagId) ? f.severityTags.filter(t => t !== tagId) : [...f.severityTags, tagId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude) return alert('Please specify a location.');
    
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'severityTags') data.append(key, JSON.stringify(formData[key]));
      else if (key === 'image') { if (formData[key]) data.append(key, formData[key]); }
      else data.append(key, formData[key]);
    });

    try {
      await axios.post('/api/reports', data);
      setStatus({ type: 'success', msg: 'Report submitted successfully!' });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (_err) {
      alert('Failed to submit report.');
      setLoading(false);
    }
  };

  if (status.type === 'success' && status.msg.includes('successfully')) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Thank You</h2>
        <p className="text-gray-500">Your report has been submitted securely.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Report Incident</h1>
        <p className="text-gray-500 dark:text-gray-400">Provide details about substance abuse risks in your area.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Incident Title</label>
              <input 
                type="text" required placeholder="Short descriptive title"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
              <select 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="drug_abuse">Drug Abuse</option>
                <option value="alcohol_abuse">Alcohol Abuse</option>
                <option value="suspicious_activity">Suspicious Activity</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
            <textarea 
              rows={4} required placeholder="Describe what you observed..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </section>

        {/* Location & Image */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Location Details</label>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="Enter address..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                />
                <button type="button" onClick={handleAddressSearch} className="p-2.5 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </div>
              <button type="button" onClick={handleLocation} className="w-full py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <MapPin className="w-4 h-4" /> Use Current GPS
              </button>
              {status.msg && <p className={`text-[10px] font-bold uppercase text-center ${status.type === 'error' ? 'text-red-500' : 'text-indigo-600'}`}>{status.msg}</p>}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Evidence (Optional)</label>
            <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-6 text-center group cursor-pointer hover:border-indigo-500 transition-colors">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFormData({...formData, image: e.target.files[0]})} />
              <Camera className="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:text-indigo-500" />
              <p className="text-xs text-gray-500">{formData.image ? formData.image.name : 'Click to upload image'}</p>
            </div>
          </div>
        </section>

        {/* Options & Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={() => setFormData({...formData, isAnonymous: !formData.isAnonymous})}
              className={`w-12 h-6 rounded-full transition-colors relative ${formData.isAnonymous ? 'bg-indigo-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isAnonymous ? 'left-7' : 'left-1'}`} />
            </button>
            <div>
              <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Anonymous Reporting</p>
              <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400 font-bold uppercase">Identity hidden from authorities</p>
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full sm:w-auto px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Submitting...' : <><Send className="w-5 h-5" /> Submit Report</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportIncident;
