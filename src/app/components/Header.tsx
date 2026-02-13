import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { motion } from 'motion/react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-white/80">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-96 max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients, reports, scans..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
        </div>
        
        {/* Heartbeat Animation */}
        <div className="hidden md:flex items-center gap-3 bg-blue-50/50 px-4 py-2 rounded-full border border-blue-100">
          <div className="w-24 h-6 relative overflow-hidden">
            <motion.svg
              viewBox="0 0 100 24"
              className="absolute inset-0 w-full h-full text-blue-500"
              initial={{ x: -100 }}
              animate={{ x: 100 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <path
                d="M0 12h20l5-8 5 16 5-8h20l5-8 5 16 5-8h10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
            <motion.svg
              viewBox="0 0 100 24"
              className="absolute inset-0 w-full h-full text-blue-500/30"
              initial={{ x: 0 }}
              animate={{ x: 200 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <path
                d="M0 12h20l5-8 5 16 5-8h20l5-8 5 16 5-8h10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">AI Live Engine</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900 leading-none">Dr. Sarah Chen</p>
            <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-tight">Radiologist</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
             <User className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
    </header>
  );
};
