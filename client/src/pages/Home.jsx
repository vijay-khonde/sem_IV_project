import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, TrendingUp, AlertTriangle, Eye, ShieldCheck, HeartPulse, Search } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const Home = () => {
  return (
    <div className="bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-32 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-8"
            >
              <Shield className="w-3 h-3" /> Community Safety Platform
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-6"
            >
              Building Safer Neighborhoods <br /> 
              <span className="text-indigo-600">Through Awareness.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto"
            >
              CareNet is a community-driven platform for detecting and preventing substance abuse risks. 
              Report anonymously, track local trends, and coordinate interventions to keep our community healthy.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link to="/report" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Report Incident
              </Link>
              <Link to="/map" className="px-8 py-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" /> Live Risk Map
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 dark:bg-slate-800/50 py-16 border-y border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Verified Reports', value: '1,200+' },
              { label: 'Interventions', value: '85' },
              { label: 'Communities', value: '450+' },
              { label: 'Success Rate', value: '92%' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-indigo-600 mb-1">{stat.value}</div>
                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">A systematic approach to community monitoring and risk reduction.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Search className="w-6 h-6" />}
              title="Identify Risks"
              desc="Community members submit anonymous reports of suspicious activity or substance abuse areas."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="Analyze Trends"
              desc="Our system analyzes reports to identify high-risk hotspots and calculate risk scores in real-time."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Take Action"
              desc="Authorities deploy targeted interventions like patrols or medical outreach based on data."
            />
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-24 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <HeartPulse className="w-16 h-16 mx-auto mb-8 opacity-80" />
          <h2 className="text-4xl font-black mb-6 tracking-tight">Help is Always Available.</h2>
          <p className="text-indigo-100 mb-12 max-w-2xl mx-auto">If you or someone you know is struggling with substance abuse, please reach out to our network of support providers.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl text-left w-full md:w-auto min-w-[300px]">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">National Helpline</p>
              <p className="text-2xl font-black">1800-11-0031</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl text-left w-full md:w-auto min-w-[300px]">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Support Email</p>
              <p className="text-2xl font-black">help@carenet.local</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500 font-medium">© 2024 CareNet Platform. Secure & Confidential Community Monitoring.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
