/**
 * Home page - main page component containing the upload panel, results, and history.
 */

import React, { useState, useEffect } from 'react';
import UploadPanel from '../components/UploadPanel';
import ResultsDashboard from '../components/ResultsDashboard';
import HistoryTable from '../components/HistoryTable';
import { analyzeResume } from '../api/analysis';
import { getAnalyses, saveAnalysis, type SupabaseAnalysis } from '../api/supabase';
import type { AnalysisResult, StoredAnalysis } from '../types';

const Home: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SupabaseAnalysis[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Load analysis history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const analyses = await getAnalyses();
      setHistory(analyses);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAnalyze = async (file: File, jobDescription: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeResume({
        resume: file,
        job_description: jobDescription,
      });

      setResult(analysisResult);

      // Save to Supabase
      await saveAnalysis({
        resume_name: analysisResult.resume_name,
        match_score: analysisResult.match_score,
        matched_skills: analysisResult.matched_skills,
        missing_skills: analysisResult.missing_skills,
        suggestions: analysisResult.suggestions,
      });

      // Reload history
      await loadHistory();
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectAnalysis = (analysis: StoredAnalysis) => {
    setResult({
      match_score: analysis.match_score,
      matched_skills: analysis.matched_skills,
      missing_skills: analysis.missing_skills,
      suggestions: analysis.suggestions,
      resume_name: analysis.resume_name,
      timestamp: analysis.created_at || new Date().toISOString(),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrySample = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/analyze/sample');
      if (!response.ok) {
        throw new Error('Failed to fetch sample data');
      }
      const sampleResult = await response.json();

      setResult(sampleResult);
    } catch (err: any) {
      setError('Could not load sample. Is the backend running?');
      console.error('Sample error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Smart Resume Analyzer
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                NLP-powered resume analysis and job matching
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {showHistory ? 'Hide History' : 'View History'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Panel */}
        {!result && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Analyze Your Resume
            </h2>
            <UploadPanel onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleTrySample}
                disabled={isAnalyzing}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                Try with sample data (demo)
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mb-8">
            <ResultsDashboard result={result} isAnalyzing={isAnalyzing} />
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
                disabled={isAnalyzing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Analyze Another Resume
              </button>
            </div>
          </div>
        )}

        {/* History Section */}
        {showHistory && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Analysis History
            </h2>
            <HistoryTable
              analyses={history}
              onSelectAnalysis={handleSelectAnalysis}
              isLoading={isLoadingHistory}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-gray-500 text-center">
            Built with React, TypeScript, FastAPI, and NLP
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
