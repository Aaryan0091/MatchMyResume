import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import UploadPanel from '../components/UploadPanel';
import ResultsDashboard from '../components/ResultsDashboard';
import HistoryTable from '../components/HistoryTable';
import Antigravity from '../components/Antigravity';
import { analyzeResume } from '../api/analysis';
import { getAnalyses, saveAnalysis } from '../api/firebase';
import type { AnalysisResult, StoredAnalysis } from '../types';

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<StoredAnalysis[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isFirebaseBlocked, setIsFirebaseBlocked] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  // Listen for Firebase errors from ad blockers
  useEffect(() => {
    const handleFirebaseError = (event: any) => {
      if (event.message?.includes('ERR_BLOCKED_BY_CLIENT') || event.message?.includes('firestore.googleapis.com')) {
        setIsFirebaseBlocked(true);
      }
    };

    window.addEventListener('error', handleFirebaseError);
    return () => window.removeEventListener('error', handleFirebaseError);
  }, []);

  const loadHistory = async () => {
    setIsHistoryLoading(true);
    setIsFirebaseBlocked(false);
    try {
      const data = await getAnalyses();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
      setIsFirebaseBlocked(true);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleAnalyze = async (file: File, jobDescription: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeResume({ resume: file, job_description: jobDescription });
      setCurrentResult(result);

      // Save to Supabase
      await saveAnalysis({
        resume_name: result.resume_name,
        match_score: result.match_score,
        matched_skills: result.matched_skills,
        missing_skills: result.missing_skills,
        suggestions: result.suggestions,
      });

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
                  <span>AI-Powered Resume</span>
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
                    Screening Tool
                  </motion.span>
                </h2>
                <p className="text-base md:text-lg text-neutral-400 max-w-2xl mx-auto mb-6 font-light leading-relaxed">
                  Get a preliminary analysis of how your resume aligns with job requirements.
                  We analyze technical skills, experience level, skill depth, and soft skills.
                </p>

                {/* Disclaimer Banner */}
                <div className="max-w-3xl mx-auto bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 mb-6">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="font-semibold text-neutral-300">⚠️ Important:</span> This is a preliminary screening tool based on keyword matching, experience analysis, and skill depth.
                    Scores are estimates, not definitive assessments. A low score doesn't mean you're not qualified, and a high score doesn't guarantee you'll get the job.
                    Always review the full job description and trust your own judgment. Human review is required for hiring decisions.
                  </p>
                </div>
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
                        isFirebaseBlocked={isFirebaseBlocked}
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer with comprehensive disclaimer */}
      <footer className="relative z-10 border-t border-neutral-800/50 bg-[#0a0a0a]/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* What This Tool Does */}
            <div>
              <h4 className="text-white font-semibold mb-3">What This Tool Does</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span>Identifies technical skills from resume and job description</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span>Calculates match score with skill depth weighting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span>Analyzes experience level and seniority match</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span>Detects soft skills and achievements</span>
                </li>
              </ul>
            </div>

            {/* What This Tool Does NOT Do */}
            <div>
              <h4 className="text-white font-semibold mb-3">What This Tool Does NOT Do</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">✗</span>
                  <span>Verify actual proficiency or experience level</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">✗</span>
                  <span>Assess cultural fit or interview performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">✗</span>
                  <span>Guarantee you will (or won't) get the job</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">✗</span>
                  <span>Replace human judgment in hiring decisions</span>
                </li>
              </ul>
            </div>

            {/* How to Use Results */}
            <div>
              <h4 className="text-white font-semibold mb-3">How to Use Your Results</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">→</span>
                  <span><strong className="text-slate-300">High Score (80%+):</strong> Skills align well, but verify experience level matches requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">→</span>
                  <span><strong className="text-slate-300">Medium Score (50-79%):</strong> Some required skills, consider highlighting relevant experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">→</span>
                  <span><strong className="text-slate-300">Low Score (0-49%):</strong> Skills don't align, but you may have transferable skills not captured</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Important Notice */}
          <div className="border-t border-neutral-800 pt-6">
            <p className="text-center text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-400">⚠️ Important:</strong> This is a preliminary screening tool based on keyword matching, experience analysis, and skill depth.
              Scores are estimates, not definitive assessments. A low score doesn't mean you're not qualified, and a high score doesn't guarantee you'll get the job.
              Always read the full job description and company information. Use this as one data point, not the whole story.
              Trust your judgment about whether a role is right for you. This is a starting point for your job search, not a definitive assessment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
