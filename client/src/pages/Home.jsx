import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, TrendingUp, AlertTriangle, Eye, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob dark:opacity-20"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000 dark:opacity-20"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-4000 dark:opacity-20"></div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center px-4 py-2 rounded-full glass glass-neon mb-8">
            <span className="flex h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Live AI Threat Detection Active</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            <span className="block text-gray-900 dark:text-gray-100">Community Driven</span>
            <span className="block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text mt-2">
              Early Detection System
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Empowering communities to anonymously report and track local substance abuse risks. 
            Identify high-risk areas using real-time geolocation data and our advanced analytics.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/report" className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300 hover:scale-105 flex items-center justify-center">
              <AlertTriangle className="mr-2 w-5 h-5" /> Report Incident
            </Link>
            <Link to="/map" className="w-full sm:w-auto px-8 py-4 rounded-full glass text-gray-900 dark:text-gray-100 font-semibold text-lg hover:bg-white/40 dark:hover:bg-slate-800/60 transition-all duration-300 hover:scale-105 flex items-center justify-center border border-gray-200 dark:border-gray-700">
              <MapPin className="mr-2 w-5 h-5 text-indigo-500" /> View Heatmap
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <ShieldCheck className="w-8 h-8 text-green-500" />, label: 'Verified Reports', value: '1,204+' },
            { icon: <Eye className="w-8 h-8 text-blue-500" />, label: 'Active Zones Monitored', value: '45' },
            { icon: <Shield className="w-8 h-8 text-indigo-500" />, label: 'Community Members', value: '5,000+' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-2xl flex items-center gap-4 dark:bg-slate-800/50"
            >
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 shadow-inner">
                {stat.icon}
              </div>
              <div>
                <h4 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-20 bg-gray-50/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase">Advanced Architecture</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Next-Gen Threat Intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <MapPin />, title: 'Geospatial Mapping', desc: 'Pinpoint exact locations. Our ML models cluster data to output real-time high-risk demographic heatmaps.' },
              { icon: <Shield />, title: 'Reputation AI', desc: 'Dynamic trust scoring and spam-detection logic to ensure actionable, verified intelligence for law enforcement.' },
              { icon: <TrendingUp />, title: 'Predictive Analytics', desc: 'Predictive modeling and time decay algorithms analyze temporal data to forecast future hotspots.' }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-white dark:bg-slate-800 rounded-[2rem] shadow-[20px_20px_60px_#d9d9d9,-20px_-20px_60px_#ffffff] dark:shadow-[10px_10px_30px_#0f172a,-10px_-10px_30px_#1e293b] border border-gray-100 dark:border-slate-700"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feat.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
