import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import UploadPanel from '../components/UploadPanel';
import ResultsDashboard from '../components/ResultsDashboard';
import HistoryTable from '../components/HistoryTable';
import Antigravity from '../components/Antigravity';
import { analyzeResume } from '../api/analysis';
import { getAnalyses } from '../api/supabase';
import type { AnalysisResult, StoredAnalysis } from '../types';

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<StoredAnalysis[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const data = await getAnalyses();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleAnalyze = async (file: File, jobDescription: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeResume({ resume: file, job_description: jobDescription });
      setCurrentResult(result);
      if (activeTab === 'history') {
        loadHistory();
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectAnalysis = (_analysis: StoredAnalysis) => {
    // In a fully developed app, you'd fetch the detailed result.
    // For now, we clear to allow re-upload if needed.
    setCurrentResult(null);
    setActiveTab('upload');
  };

  const handleClearCurrentResult = () => {
    setCurrentResult(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-neutral-800 selection:text-white relative overflow-hidden">
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        
        {/* Antigravity Background */}
        <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center opacity-50">
          <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
            <Antigravity
              count={300}
              magnetRadius={6}
              ringRadius={7}
              waveSpeed={0.4}
              waveAmplitude={1}
              particleSize={1.5}
              lerpSpeed={0.05}
              color="#5227FF"
              autoAnimate
              particleVariance={1}
              rotationSpeed={0}
              depthFactor={1}
              pulseSpeed={3}
              particleShape="capsule"
              fieldStrength={10}
            />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {!currentResult && (
              <motion.div 
                key="hero"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-center mb-16 relative"
              >
                <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-5 leading-tight text-white flex flex-col items-center justify-center">
                  <span>Unlock your next</span>
                  <motion.span 
                    className="cursor-pointer relative inline-block mt-2 text-white/90"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.4,
                      ease: "easeOut",
                      delay: 0.1 
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      color: "#fff"
                    }}
                    whileTap={{ scale: 1.05 }}
                  >
                    Career Move
                  </motion.span>
                </h2>
                <p className="text-base md:text-lg text-neutral-400 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
                  Upload your resume and paste a job description. We calculate your match score and provide actionable feedback.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <motion.div 
            layout
            className="w-full relative z-20"
          >
            {currentResult ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                  <h3 className="text-lg font-medium text-white">Analysis Complete</h3>
                  <button 
                    onClick={handleClearCurrentResult}
                    className="px-4 py-2 bg-white text-black hover:bg-neutral-200 transition-colors rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    Analyze Another Resume <ArrowRight size={16} />
                  </button>
                </div>
                <ResultsDashboard result={currentResult} isAnalyzing={isAnalyzing} />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Tabs */}
                <div className="flex items-center justify-center gap-2 mb-8 border-b border-neutral-800 pb-px">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-6 py-3 font-medium text-sm transition-all border-b-2 relative -bottom-px ${
                      activeTab === 'upload' 
                        ? 'text-white border-white' 
                        : 'text-neutral-500 border-transparent hover:text-neutral-300'
                    }`}
                  >
                    New Analysis
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 font-medium text-sm transition-all border-b-2 relative -bottom-px ${
                      activeTab === 'history' 
                        ? 'text-white border-white' 
                        : 'text-neutral-500 border-transparent hover:text-neutral-300'
                    }`}
                  >
                    Past Results
                  </button>
                </div>

                {/* Tab Content */}
                <div className="relative">
                  {activeTab === 'upload' ? (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                      className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 rounded-2xl shadow-sm"
                    >
                      <UploadPanel onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm overflow-hidden"
                    >
                      <HistoryTable 
                        analyses={history} 
                        onSelectAnalysis={handleSelectAnalysis}
                        isLoading={isHistoryLoading}
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
