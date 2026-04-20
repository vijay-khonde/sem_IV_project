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
      {/* Soft Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-30 animate-blob dark:bg-blue-900 dark:opacity-20 dark:mix-blend-screen"></div>
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-teal-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-30 animate-blob animation-delay-2000 dark:bg-teal-900 dark:opacity-20 dark:mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-30 animate-blob animation-delay-4000 dark:bg-purple-900 dark:opacity-20 dark:mix-blend-screen"></div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center px-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-teal-500 mr-2 animate-pulse"></span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Live AI Threat Detection Active</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            <span className="block text-gray-900 dark:text-gray-100 mb-2">CareNet</span>
            <span className="block text-3xl md:text-4xl font-medium bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 text-transparent bg-clip-text mt-2">
              Smart Community Monitoring for Early Risk Detection and Prevention
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto font-light">
            Empowering communities to anonymously report and track local substance abuse risks. 
            Detect issues early, view insights, and connect with help resources to keep our neighborhoods safe.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/report" className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-lg shadow-md transition-all duration-300 hover:scale-105 flex items-center justify-center">
              <AlertTriangle className="mr-2 w-5 h-5" /> Report Incident
            </Link>
            <Link to="/map" className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 font-semibold text-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm">
              <MapPin className="mr-2 w-5 h-5 text-blue-500" /> View Heatmap
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-semibold text-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-300 hover:scale-105 flex items-center justify-center shadow-sm">
              Get Help
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
              className="bg-white/80 dark:bg-slate-800/80 p-6 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-slate-700 shadow-sm"
            >
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50">
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
      <div className="relative z-10 py-20 bg-gray-50/50 dark:bg-slate-900/50 border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-teal-600 dark:text-teal-400 font-semibold tracking-wide uppercase">Core System Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Ethical, Secure, & Actionable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <MapPin />, title: 'Risk Heatmaps', desc: 'Pinpoint and visualize exact locations of substance abuse risks to help authorities deploy early interventions.' },
              { icon: <Shield />, title: 'Privacy First', desc: 'Secure, anonymous reporting combined with data anonymization techniques to protect community members.' },
              { icon: <TrendingUp />, title: 'Proactive Action', desc: 'Connects data trends directly to actionable interventions and rehabilitation resources to prevent escalation.' }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-slate-700"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-6">
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
