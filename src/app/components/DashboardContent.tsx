import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileUp, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Zap,
  TrendingUp,
  Stethoscope,
  XCircle,
  Download,
  Share2,
  ClipboardList
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface DiagnosisResult {
  status: 'Normal' | 'Diseased';
  diseaseName?: string;
  confidence: number;
  causes?: string[];
  symptoms?: string[];
  recommendations?: string[];
}

export const DashboardContent: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = [
    { label: 'Total Scans', value: '1,284', change: '+12%', icon: FileUp, color: 'blue' },
    { label: 'Pneumonia Detected', value: '412', change: '-3%', icon: AlertCircle, color: 'amber' },
    { label: 'Normal Findings', value: '872', change: '+8%', icon: CheckCircle, color: 'teal' },
    { label: 'Pending Review', value: '18', change: '', icon: Activity, color: 'slate' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = (file: File) => {
    setIsUploading(true);
    setResult(null);
    
    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Mock AI Processing delay
    setTimeout(() => {
      setIsUploading(false);
      
      const isHealthy = Math.random() > 0.4;
      
      if (isHealthy) {
        setResult({
          status: 'Normal',
          confidence: 98.4,
        });
      } else {
        setResult({
          status: 'Diseased',
          diseaseName: 'Bacterial Pneumonia',
          confidence: 92.8,
          causes: [
            'Streptococcus pneumoniae infection',
            'Aspiration of oral secretions',
            'Secondary infection following viral respiratory illness'
          ],
          symptoms: [
            'High fever and chills',
            'Productive cough with yellow/green sputum',
            'Sharp chest pain during deep breathing'
          ],
          recommendations: [
            'Immediate consultation with a Pulmonologist',
            'Sputum culture and blood tests required for confirmation',
            'Start broad-spectrum antibiotics as per clinical guidelines',
            'Monitor oxygen saturation levels'
          ]
        });
      }
    }, 2500);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Radiology Workspace</h1>
          <p className="text-slate-500 font-medium">Review AI-assisted chest X-ray classifications</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">System Online</span>
          </div>
          <p className="text-sm font-medium text-slate-400">Last update: 2 mins ago</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                stat.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                stat.color === 'teal' ? 'bg-teal-50 text-teal-600' :
                'bg-slate-50 text-slate-600'
              }`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.change && (
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.change.startsWith('+') ? 'text-teal-600' : 'text-rose-600'}`}>
                  <TrendingUp className={`w-3 h-3 ${stat.change.startsWith('+') ? '' : 'rotate-180'}`} />
                  {stat.change}
                </div>
              )}
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileUp className="w-5 h-5 text-blue-600" />
                Upload New Scan
              </h2>
              <button 
                onClick={() => {
                  setPreviewUrl(null);
                  setResult(null);
                }}
                className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Clear
              </button>
            </div>

            {!previewUrl ? (
              <div
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group min-h-[400px]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*"
                />
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileUp className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Drop Chest X-ray here</h3>
                <p className="text-slate-500 font-medium text-center max-w-xs">
                  Support formats: JPG, PNG. High resolution scans recommended for accurate AI analysis.
                </p>
                <div className="mt-8 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200">
                  Select File
                </div>
              </div>
            ) : (
              <div className="flex-1 relative rounded-2xl overflow-hidden bg-slate-100 group min-h-[400px]">
                <ImageWithFallback
                  src={previewUrl}
                  alt="X-ray Scan Preview"
                  className="w-full h-full object-contain max-h-[500px]"
                />
                
                {isUploading && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <div className="relative w-24 h-24 mb-6">
                      <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Zap className="w-8 h-8 text-blue-400 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-xl font-bold mb-1">AI Engine Analysis</p>
                    <p className="text-slate-300 font-medium animate-pulse">Scanning clinical markers...</p>
                  </div>
                )}

                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                   <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                   Live Preview
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Prediction Results */}
        <div className="lg:col-span-5 flex flex-col">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-10 rounded-[24px] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[400px]"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Activity className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Results Yet</h3>
                <p className="text-slate-500 font-medium">
                  Upload a chest X-ray image on the left to start the AI-based diagnostic process.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-6"
              >
                {/* Result Card */}
                <div className={`p-8 rounded-[24px] border-l-[12px] shadow-sm relative overflow-hidden ${
                  result.status === 'Normal' 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
                    : 'bg-rose-50 border-rose-500 text-rose-900'
                }`}>
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 ${
                        result.status === 'Normal' ? 'bg-emerald-200/50 text-emerald-700' : 'bg-rose-200/50 text-rose-700'
                      }`}>
                        {result.status === 'Normal' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        Classification Result
                      </div>
                      <h2 className="text-3xl font-black tracking-tight uppercase">
                        {result.status === 'Normal' ? 'No Disease Detected' : 'Disease Detected'}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">Confidence</p>
                      <p className="text-4xl font-black">{result.confidence}%</p>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="relative h-2.5 bg-white/40 rounded-full overflow-hidden mb-6">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${result.status === 'Normal' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    />
                  </div>

                  {result.diseaseName && (
                    <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-white/40 backdrop-blur-sm relative z-10">
                      <Stethoscope className="w-6 h-6 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Primary Condition</p>
                        <p className="font-bold text-lg">{result.diseaseName}</p>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] opacity-10 pointer-events-none text-current">
                     {result.status === 'Normal' ? <CheckCircle className="w-full h-full" /> : <XCircle className="w-full h-full" />}
                  </div>
                </div>

                {result.status === 'Diseased' ? (
                  <div className="space-y-4">
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-600" />
                        Clinical Findings
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Likely Causes</p>
                          <ul className="space-y-2">
                            {result.causes?.map((cause, i) => (
                              <li key={i} className="text-sm font-medium text-slate-600 flex gap-2">
                                <span className="text-blue-500 font-black">•</span>
                                {cause}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Common Symptoms</p>
                          <div className="flex flex-wrap gap-2">
                            {result.symptoms?.map((symptom, i) => (
                              <span key={i} className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-600 p-6 rounded-[24px] text-white shadow-lg shadow-blue-100">
                      <h4 className="font-bold mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Recommendations
                      </h4>
                      <ul className="space-y-3">
                        {result.recommendations?.map((rec, i) => (
                          <li key={i} className="text-sm font-medium flex gap-3 opacity-90">
                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black">
                              {i + 1}
                            </div>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Health Report</h4>
                    <p className="text-slate-500 font-medium mb-6">
                      The AI analysis shows no significant pathological markers for pneumonia in this chest X-ray.
                    </p>
                    <div className="flex items-center gap-3">
                      <button className="flex-1 bg-slate-50 border border-slate-200 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-sm">
                        <Download className="w-4 h-4" /> Export Report
                      </button>
                      <button className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            Recent Diagnostic Reports
          </h2>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">View All Archive</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classification</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date / Time</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Physician</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { id: 'PX-9421', type: 'Normal', conf: '99.2%', date: 'Oct 24, 2023 • 14:20', dr: 'Dr. Sarah Chen' },
                { id: 'PX-9418', type: 'Pneumonia', conf: '94.5%', date: 'Oct 24, 2023 • 11:45', dr: 'Dr. Michael Wu' },
                { id: 'PX-9399', type: 'Normal', conf: '98.8%', date: 'Oct 23, 2023 • 16:10', dr: 'Dr. Sarah Chen' },
                { id: 'PX-9382', type: 'Normal', conf: '97.4%', date: 'Oct 23, 2023 • 09:30', dr: 'Dr. Sarah Chen' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{row.id}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      row.type === 'Normal' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-600">{row.conf}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{row.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase">
                        {row.dr.split(' ').pop()?.[0]}
                      </div>
                      <span className="text-sm font-semibold text-slate-600">{row.dr}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
