import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Medical Cross Watermark Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 transform -rotate-12">
          <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </div>
        <div className="absolute bottom-40 right-10 transform rotate-12">
          <svg width="600" height="600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </div>
      </div>

      {/* Abstract Background Patterns */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-teal-100/30 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-5xl w-full bg-white rounded-[24px] shadow-2xl shadow-blue-900/5 border border-white flex flex-col md:flex-row overflow-hidden relative z-10">
        
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-14">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">AI Pneumonia Detector</h2>
              <p className="text-sm text-slate-500 font-medium">Smart Medical Classification</p>
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Log in to access clinical diagnostic tools and manage patient records.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${rememberMe ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}>
                    {rememberMe && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
            >
              Sign In to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Don't have an account? <button className="text-blue-600 font-bold hover:underline">Contact Administrator</button>
          </p>
        </div>

        {/* Right Side: Illustration & Info */}
        <div className="hidden md:block w-1/2 bg-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 mix-blend-overlay">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1581595219618-375a1a48d324?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZG9jdG9yJTIwcmV2aWV3aW5nJTIwY2hlc3QlMjB4LXJheSUyMHNjYW4lMjBkaWdpdGFsJTIwZGlzcGxheXxlbnwxfHx8fDE3NzA5MDM1MDd8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Medical Professional"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-800/20 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-white/20">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                Next-Gen Medical AI
              </div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">Advanced Diagnostics at your fingertips.</h2>
              <p className="text-blue-100 text-lg font-medium opacity-90 leading-relaxed mb-8">
                Our neural networks are trained on millions of clinical images to provide high-accuracy preliminary detection for pneumonia and other respiratory conditions.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div>
                  <p className="text-3xl font-bold">99.4%</p>
                  <p className="text-sm text-blue-200 font-medium uppercase tracking-wide mt-1">AI Accuracy</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">2.4s</p>
                  <p className="text-sm text-blue-200 font-medium uppercase tracking-wide mt-1">Avg Analysis Time</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="absolute bottom-6 text-center text-slate-400 text-[11px] font-semibold uppercase tracking-widest pointer-events-none">
        Secure Clinical Access • HIPAA Compliant • Powered by BioMed AI
      </div>
    </div>
  );
};
