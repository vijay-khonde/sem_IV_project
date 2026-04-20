import React, { useState } from 'react';
import axios from 'axios';
import { Camera, MapPin, Send, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ReportIncident = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'suspicious_activity',
    image: null,
    longitude: '',
    latitude: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleLocation = () => {
    setLocationStatus('Pinging satellites...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationStatus('Coordinates locked.');
        },
        (error) => {
          setLocationStatus('Signal lost. Please manually allow GPS access.');
        }
      );
    } else {
      setLocationStatus('Sensor unsupported.');
    }
  };

  const handleAddressSearch = async () => {
    if (!formData.address) {
      setLocationStatus('Please enter an address or place name to search.');
      return;
    }
    setLocationStatus('Searching location...');
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=1`);
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setFormData({
          ...formData,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        });
        setLocationStatus('Coordinates found from address.');
      } else {
        setLocationStatus('Location not found. Try a different search term.');
      }
    } catch (err) {
      setLocationStatus('Search failed. Try again or use GPS.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      alert("Location data is mandatory for threat analysis mapping.");
      return;
    }
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
       alert("Authorization required. Please log in.");
       navigate('/login');
       return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('userId', user.id);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('longitude', formData.longitude);
    data.append('latitude', formData.latitude);
    data.append('address', formData.address);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      await axios.post('http://localhost:5000/api/reports', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      setStep(3); // Success step
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Transmission failed. Ensure you are connected to the network.';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass dark:bg-slate-800/80 rounded-[2rem] shadow-[20px_20px_60px_#d9d9d9,-20px_-20px_60px_#ffffff] dark:shadow-[10px_10px_30px_#0f172a,-10px_-10px_30px_#1e293b] border border-gray-100 dark:border-slate-700 overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-100 dark:bg-slate-700">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
            initial={{ width: '0%' }}
            animate={{ width: step === 1 ? '50%' : step === 2 ? '100%' : '100%' }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="md:flex">
          {/* Sidebar */}
          <div className="md:w-1/3 bg-gray-50/50 dark:bg-slate-900/50 p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700">
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="text-teal-600" /> Dispatch Protocol
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
              Submit critical intelligence to the localized risk analysis grid. All submissions are processed securely and encrypted.
            </p>

            <div className="space-y-6">
              {[
                { number: 1, label: 'Incident Details', active: step === 1 },
                { number: 2, label: 'Evidence & Location', active: step === 2 },
                { number: 3, label: 'Confirmation', active: step === 3 }
              ].map((s) => (
                <div key={s.number} className={`flex items-center gap-4 transition-opacity duration-300 ${s.active ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${s.active ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30' : 'glass text-gray-600 dark:text-gray-300'}`}>
                    {s.number}
                  </div>
                  <span className={`font-semibold ${s.active ? 'text-teal-600 dark:text-teal-400 text-lg' : 'text-gray-500 dark:text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-12 glass glass-neon p-4 rounded-xl flex items-start gap-3">
               <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
               <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                 Misuse of the system impacts community trust scores. Submitting false data may lead to automatic suspension.
               </p>
            </div>
          </div>

          /* Main Form Area */
          <div className="md:w-2/3 p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject Header</label>
                    <input
                      type="text"
                      className="w-full glass bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-600 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all shadow-inner"
                      placeholder="E.g., Repeated suspicious activity in alley"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Threat Classification</label>
                    <div className="relative">
                      <select
                        className="w-full glass bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-600 rounded-xl p-4 appearance-none focus:ring-2 focus:ring-indigo-500 dark:text-white shadow-inner"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="suspicious_activity">Suspected Distribution</option>
                        <option value="substance_use">Active Substance Use</option>
                        <option value="drug_paraphernalia">Paraphernalia Discovery</option>
                        <option value="loitering">Organized Loitering</option>
                        <option value="other">Anomalous Event</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                         <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Narrative Report</label>
                    <textarea
                      rows={5}
                      className="w-full glass bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-600 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all shadow-inner resize-none"
                      placeholder="Chronological details, descriptions of individuals, unusual patterns..."
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if(formData.title && formData.description) setStep(2);
                        else alert('Please fill in required fields.');
                      }}
                      className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg hover:shadow-indigo-500/30 transition-all"
                    >
                      Next Step →
                    </button>
                  </div>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                     <div className="flex justify-between items-end mb-2">
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Geospatial Tagging</label>
                       <span className="text-xs text-teal-600 font-mono bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded">Required</span>
                     </div>
                     <div className="glass bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-600 rounded-xl p-6 text-center space-y-4">
                        <MapPin className={`mx-auto h-10 w-10 ${formData.latitude ? 'text-green-500' : 'text-gray-400'}`} />
                        
                        <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto">
                          <input 
                            type="text" 
                            placeholder="Enter place name or address..."
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="flex-1 glass bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAddressSearch}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-sm font-medium rounded-lg transition-colors border border-gray-200 dark:border-slate-600"
                          >
                            Search
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                          <span className="h-[1px] w-8 bg-gray-300 dark:bg-slate-600"></span>
                          <span>OR</span>
                          <span className="h-[1px] w-8 bg-gray-300 dark:bg-slate-600"></span>
                        </div>

                        <button
                          type="button"
                          onClick={handleLocation}
                          className="inline-flex items-center px-6 py-2 border border-gray-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-full text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          {formData.latitude ? 'Re-acquire Coordinates' : 'Acquire Current GPS Location'}
                        </button>

                        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 font-mono tracking-tight">{locationStatus || 'Awaiting location input...'}</p>
                        {formData.latitude && (
                          <div className="mt-2 text-xs font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 inline-block px-3 py-1 rounded-full">
                            LAT: {formData.latitude.toFixed(6)} | LNG: {formData.longitude.toFixed(6)}
                          </div>
                        )}
                     </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visual Evidence (Optional)</label>
                    <div className="glass bg-white/50 dark:bg-slate-800/50 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors relative group">
                      <input id="file-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} />
                      <Camera className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Click or drag a file to this area to upload</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, JPEG up to 10MB</p>
                      {formData.image && <p className="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 py-2 px-4 rounded-full inline-block">{formData.image.name}</p>}
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all font-medium"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !formData.latitude}
                      className={`inline-flex items-center justify-center px-8 py-3 rounded-full font-medium transition-all shadow-lg ${
                        loading || !formData.latitude 
                          ? 'bg-gray-400 cursor-not-allowed text-white shadow-none' 
                          : 'bg-teal-600 hover:bg-teal-700 text-white hover:shadow-teal-500/30'
                      }`}
                    >
                      {loading ? 'Transmitting...' : (
                        <>Transmit Report <Send className="ml-2 w-4 h-4"/></>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}

              {step === 3 && (
                <motion.div key="step3" variants={formVariants} initial="hidden" animate="visible" className="text-center py-12">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-24 h-24 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[#10b981_0px_0px_20px]"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                  </motion.div>
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Transmission Successful</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-sm mx-auto leading-relaxed">
                    Intelligence has been securely recorded to the geospatial grid. The verification team will analyze this node shortly.
                  </p>
                  <div className="flex flex-col gap-4 max-w-xs mx-auto">
                    <button onClick={() => navigate('/map')} className="w-full px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg hover:shadow-indigo-500/30 transition-all">
                      Monitor Heatmap
                    </button>
                    <button onClick={() => {setFormData({...formData, title: '', description: '', image: null}); setStep(1);}} className="w-full px-6 py-3 rounded-full glass font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                      Submit Additional Data
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
