import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, Activity, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'drug_abuse', label: 'Drug Abuse' },
  { value: 'alcohol_abuse', label: 'Alcohol Abuse' },
  { value: 'suspicious_activity', label: 'Suspicious Activity' },
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'resolved', label: 'Resolved' },
];

const getRiskColor = (score) => {
  if (score > 7) return '#ef4444';
  if (score > 4) return '#f59e0b';
  return '#10b981';
};

const MapView = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ category: '', status: '' });
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('/api/analytics/heatmap');
        setReports(res.data);
        setFiltered(res.data);
      } catch {
        try {
          const res = await axios.get('/api/reports?limit=500');
          const shaped = res.data
            .filter(r => r.location?.coordinates)
            .map(r => ({
              lat: r.location.coordinates[1],
              lng: r.location.coordinates[0],
              riskScore: r.riskScore,
              category: r.category,
              status: r.status,
              title: r.title,
              address: r.address,
            }));
          setReports(shaped);
          setFiltered(shaped);
        } catch { /* ignore */ }
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    let out = reports;
    if (filters.category) out = out.filter(r => r.category === filters.category);
    if (filters.status) out = out.filter(r => r.status === filters.status);
    setFiltered(out);
  }, [filters, reports]);

  const counts = {
    critical: filtered.filter(r => r.riskScore > 7).length,
    elevated: filtered.filter(r => r.riskScore > 4 && r.riskScore <= 7).length,
    low: filtered.filter(r => r.riskScore <= 4).length,
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" /> Live Threat Intelligence
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {filtered.length} incident{filtered.length !== 1 ? 's' : ''} plotted
          </p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          <Filter className="w-4 h-4" /> Filters
          {(filters.category || filters.status) && (
            <span className="w-2 h-2 rounded-full bg-teal-500 ml-1" />
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </motion.div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 mb-4 flex-shrink-0 overflow-hidden">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Category</label>
                <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                  className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm dark:text-white focus:ring-2 focus:ring-teal-500 outline-none">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Status</label>
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                  className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm dark:text-white focus:ring-2 focus:ring-teal-500 outline-none">
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              {(filters.category || filters.status) && (
                <button onClick={() => setFilters({ category: '', status: '' })}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-semibold">
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-700 relative min-h-0">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 z-[1000]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500" />
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-5 right-5 z-[400] bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg">
          <p className="text-[10px] font-bold uppercase text-gray-400 mb-2 tracking-wider">Risk Index</p>
          {[
            { color: '#ef4444', label: `Critical (>7)`, count: counts.critical },
            { color: '#f59e0b', label: `Elevated (4-7)`, count: counts.elevated },
            { color: '#10b981', label: `Low (<4)`, count: counts.low },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }} />
              <span className="text-xs text-gray-700 dark:text-gray-200 font-medium">{item.label}</span>
              <span className="ml-auto text-xs font-bold text-gray-500 dark:text-gray-400">{item.count}</span>
            </div>
          ))}
        </div>

        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">Carto</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {filtered.map((pt, i) => (
            <CircleMarker
              key={i}
              center={[pt.lat, pt.lng]}
              radius={Math.max((pt.riskScore || 3) * 1.8, 6)}
              fillColor={getRiskColor(pt.riskScore || 0)}
              color={getRiskColor(pt.riskScore || 0)}
              fillOpacity={0.55}
              weight={2}
            >
              <Popup>
                <div className="min-w-[180px] text-sm">
                  <h3 className="font-bold text-gray-900 mb-1 leading-tight">{pt.title}</h3>
                  <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-2">{(pt.category || '').replace(/_/g, ' ')}</p>
                  {pt.address && <p className="text-xs text-gray-500 mb-2">📍 {pt.address}</p>}
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <div>
                      <p className="text-[10px] text-gray-400">Status</p>
                      <p className={`text-xs font-bold capitalize ${pt.status === 'verified' ? 'text-green-600' : pt.status === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>{pt.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400">Risk Score</p>
                      <p className="text-xs font-bold" style={{ color: getRiskColor(pt.riskScore || 0) }}>{(pt.riskScore || 0).toFixed(1)} / 10</p>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
