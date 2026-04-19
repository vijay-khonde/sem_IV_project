import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, Search, Layers, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MapView = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/reports');
        setReports(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const getRiskColor = (score) => {
    if (score > 7) return '#ef4444'; // Red (High Risk)
    if (score > 4) return '#f59e0b'; // Yellow (Moderate)
    return '#10b981'; // Green (Safe)
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col h-[calc(100vh-64px)] relative">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 z-10 relative"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Activity className="w-8 h-8 mr-2 text-indigo-500" /> Live Threat Intelligence
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time visualization of geospatial anomalies and community reports.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search zones..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-shadow shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Filter className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </motion.div>

      <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-700 relative z-0">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center glass z-[1000]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        )}
        
        {/* Floating Legend */}
        <div className="absolute bottom-6 right-6 z-[400] glass glass-neon p-4 rounded-xl flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Risk Index</h4>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span><span className="text-sm dark:text-white font-medium">Critical (7-10)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_#f59e0b]"></span><span className="text-sm dark:text-white font-medium">Elevated (4-7)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span><span className="text-sm dark:text-white font-medium">Low (0-4)</span></div>
        </div>

        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
          {/* Using CartoDB dark matter for dark mode natively would be nice, but checking CSS scheme is hard in Leaflet render. Using standard OSM for now but we can tweak CSS filters on map */}
          <TileLayer
             className="map-tiles"
             attribution='&copy; <a href="https://carto.com/">Carto</a>'
             url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {reports.map((report) => {
             if(!report.location || !report.location.coordinates) return null;
             const [lng, lat] = report.location.coordinates;
             return (
              <CircleMarker 
                key={report._id} 
                center={[lat, lng]}
                radius={Math.max(report.riskScore * 1.5, 8)} 
                fillColor={getRiskColor(report.riskScore)}
                color={getRiskColor(report.riskScore)}
                fillOpacity={0.5}
                weight={2}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[200px]">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{report.title}</h3>
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1 py-0.5 rounded border border-slate-200">#{report._id.substring(18)}</span>
                    </div>
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">{report.category.replace('_', ' ')}</p>
                    {report.imageUrl && <img src={report.imageUrl} alt="Evidence" className="w-full h-32 object-cover rounded-lg mb-3 border border-gray-200" />}
                    
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100 text-xs">
                      <div className="flex flex-col">
                        <span className="text-gray-500">Status</span>
                        <span className={`font-semibold capitalize ${report.status === 'verified' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {report.status}
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-gray-500">Risk Score</span>
                        <span className="font-bold" style={{ color: getRiskColor(report.riskScore) }}>{report.riskScore.toFixed(1)} / 10</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
             )
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
