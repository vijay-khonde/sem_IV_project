import React, { useState } from 'react';
import axios from 'axios';
import { Camera, MapPin, Send, AlertTriangle, Info, CheckCircle2, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const SEVERITY_TAGS = [
  { id: 'minors_involved', label: 'Minors Involved', color: 'red' },
  { id: 'weapons_involved', label: 'Weapons Present', color: 'red' },
  { id: 'group_activity', label: 'Group Activity', color: 'orange' },
  { id: 'repeat_offense', label: 'Repeat Offense', color: 'orange' },
  { id: 'overdose_risk', label: 'Overdose Risk', color: 'yellow' },
];

const formVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
};

const ReportIncident = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'suspicious_activity',
    image: null, longitude: '', latitude: '', address: '',
    isAnonymous: false, severityTags: []
  });
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLocation = () => {
    setLocationStatus('Pinging satellites...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
          setLocationStatus('GPS coordinates acquired.');
        },
        () => setLocationStatus('GPS access denied. Please search by address below.')
      );
    } else {
      setLocationStatus('Geolocation not supported in this browser.');
    }
  };

  const handleAddressSearch = async () => {
    if (!formData.address.trim()) { setLocationStatus('Enter an address to search.'); return; }
    setLocationStatus('Geocoding address...');
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.data?.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        setFormData(f => ({ ...f, latitude: parseFloat(lat), longitude: parseFloat(lon), address: display_name }));
        setLocationStatus('Location found via address search.');
      } else {
        setLocationStatus('Address not found. Try a more specific search term.');
      }
    } catch { setLocationStatus('Geocoding failed. Please try GPS or check your connection.'); }
  };

  const toggleTag = (tagId) => {
    setFormData(f => ({
      ...f,
      severityTags: f.severityTags.includes(tagId)
        ? f.severityTags.filter(t => t !== tagId)
        : [...f.severityTags, tagId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      alert('Location data is required. Please use GPS or address search.');
      return;
    }
    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('longitude', formData.longitude);
    data.append('latitude', formData.latitude);
    data.append('address', formData.address);
    data.append('isAnonymous', formData.isAnonymous);
    data.append('severityTags', JSON.stringify(formData.severityTags));
    if (formData.image) data.append('image', formData.image);

    try {
      await axios.post('/api/reports', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStep(3);
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden relative">

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 dark:bg-slate-700">
          <motion.div className="h-full bg-gradient-to-r from-teal-500 to-indigo-500"
            initial={{ width: '0%' }}
            animate={{ width: step === 1 ? '50%' : '100%' }}
            transition={{ duration: 0.5 }} />
        </div>

        <div className="md:flex">
          {/* Sidebar */}
          <div className="md:w-1/3 bg-gray-50 dark:bg-slate-800/50 p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="text-teal-600 w-5 h-5" /> Report Incident
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
              Submit substance abuse activity securely. All reports are encrypted and verified.
            </p>

            <div className="space-y-4">
              {[{ n: 1, label: 'Incident Details' }, { n: 2, label: 'Location & Evidence' }, { n: 3, label: 'Confirmation' }].map(s => (
                <div key={s.n} className={`flex items-center gap-4 transition-opacity ${s.n === step ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${s.n === step ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30' : s.n < step ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-500'}`}>
                    {s.n < step ? '✓' : s.n}
                  </div>
                  <span className={`font-semibold text-sm ${s.n === step ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                False reports damage community trust scores. Repeated misuse may lead to suspension.
              </p>
            </div>
          </div>

          {/* Form Area */}
          <div className="md:w-2/3 p-8">
            <AnimatePresence mode="wait">

              {/* Step 1 */}
              {step === 1 && (
                <motion.div key="s1" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Incident Title <span className="text-red-500">*</span></label>
                    <input type="text" required placeholder="E.g., Repeated suspicious activity near school"
                      value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-white outline-none transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category <span className="text-red-500">*</span></label>
                    <select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-teal-500 dark:text-white outline-none">
                      <option value="drug_abuse">Drug Abuse</option>
                      <option value="alcohol_abuse">Alcohol Abuse</option>
                      <option value="suspicious_activity">Suspicious Activity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description <span className="text-red-500">*</span></label>
                    <textarea rows={4} required placeholder="Provide chronological details, descriptions of individuals, unusual patterns, times..."
                      value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-white outline-none resize-none transition-all" />
                    <p className="text-xs text-gray-400 mt-1 text-right">{formData.description.length}/2000 chars (min 20)</p>
                  </div>

                  {/* Severity Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Severity Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {SEVERITY_TAGS.map(tag => (
                        <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            formData.severityTags.includes(tag.id)
                              ? 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/40 dark:border-red-700 dark:text-red-300'
                              : 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-400'
                          }`}>
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Anonymous toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <UserX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Submit Anonymously</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Your identity will be hidden from authorities</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setFormData(f => ({ ...f, isAnonymous: !f.isAnonymous }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isAnonymous ? 'bg-teal-600' : 'bg-gray-300 dark:bg-slate-600'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isAnonymous ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="button"
                      onClick={() => { if (formData.title.length >= 5 && formData.description.length >= 20) setStep(2); else alert('Title (5+ chars) and description (20+ chars) are required.'); }}
                      className="px-8 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-lg transition-all">
                      Next Step →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <motion.form key="s2" variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Location <span className="text-red-500">*</span></label>
                      {formData.latitude && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-mono bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                          {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                        </span>
                      )}
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input type="text" placeholder="Search by address or place name..."
                          value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddressSearch())}
                          className="flex-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none dark:text-white" />
                        <button type="button" onClick={handleAddressSearch}
                          className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-sm font-semibold rounded-lg transition-colors">
                          Search
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="flex-1 h-px bg-gray-200 dark:bg-slate-600" />OR<span className="flex-1 h-px bg-gray-200 dark:bg-slate-600" />
                      </div>
                      <div className="text-center">
                        <button type="button" onClick={handleLocation}
                          className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-full text-sm font-semibold text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                          <MapPin className="w-4 h-4" />
                          {formData.latitude ? 'Re-acquire GPS' : 'Use Current GPS Location'}
                        </button>
                      </div>
                      {locationStatus && <p className="text-center text-xs text-gray-500 dark:text-gray-400">{locationStatus}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Visual Evidence (Optional)</label>
                    <div className="bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-teal-500 transition-colors relative group">
                      <input id="file-upload" type="file" accept="image/png,image/jpeg,image/jpg"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={e => setFormData(f => ({ ...f, image: e.target.files[0] }))} />
                      <Camera className="mx-auto h-10 w-10 text-gray-400 group-hover:text-teal-500 transition-colors mb-2" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Click or drag image here</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                      {formData.image && (
                        <p className="mt-3 text-sm font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 py-1.5 px-4 rounded-full inline-block">
                          {formData.image.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-slate-700">
                    <button type="button" onClick={() => setStep(1)}
                      className="px-6 py-3 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold text-sm transition-all">
                      ← Back
                    </button>
                    <button type="submit" disabled={loading || !formData.latitude}
                      className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm transition-all shadow-lg ${
                        loading || !formData.latitude
                          ? 'bg-gray-300 dark:bg-slate-700 cursor-not-allowed text-gray-500'
                          : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/30 hover:-translate-y-0.5'}`}>
                      {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Submit Report</>}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Step 3 — Success */}
              {step === 3 && (
                <motion.div key="s3" variants={formVariants} initial="hidden" animate="visible" className="text-center py-12">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_#10b981aa]">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </motion.div>
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">Report Submitted!</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                    Your report has been securely recorded. Authorities will review and verify it shortly.
                    {formData.isAnonymous && ' Your identity is protected.'}
                  </p>
                  <div className="flex flex-col gap-3 max-w-xs mx-auto">
                    <button onClick={() => navigate('/map')} className="w-full px-6 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg transition-all">
                      View on Heatmap
                    </button>
                    <button onClick={() => { setFormData({ title: '', description: '', category: 'suspicious_activity', image: null, longitude: '', latitude: '', address: '', isAnonymous: false, severityTags: [] }); setStep(1); }}
                      className="w-full px-6 py-3 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-all">
                      Submit Another
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                      Go to Dashboard →
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportIncident;
