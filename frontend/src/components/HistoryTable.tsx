import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, FileText, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import type { HistoryTableProps } from '../types';

const HistoryTable: React.FC<HistoryTableProps> = ({ analyses, onSelectAnalysis, isLoading, isFirebaseBlocked }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    if (score >= 40) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  if (isLoading) {
    return (
      <div className="glass-card flex items-center justify-center py-20 rounded-2xl">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin mb-4"></div>
          <p className="text-sm font-medium text-slate-400">Loading history records...</p>
        </div>
      </div>
    );
  }

  if (isFirebaseBlocked) {
    return (
      <div className="glass-card flex flex-col items-center justify-center relative overflow-hidden text-center py-24 rounded-2xl">
        <AlertCircle size={48} className="text-orange-400 mb-6" />
        <p className="text-xl font-medium text-slate-300">History Feature Blocked</p>
        <p className="text-slate-500 mt-2 max-w-md mx-auto px-4">
          Your ad blocker is blocking Firebase. Please disable it for this site or allow <code className="bg-dark-800 px-2 py-1 rounded text-orange-400">firestore.googleapis.com</code>
        </p>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center relative overflow-hidden text-center py-24 rounded-2xl">
        <Activity size={48} className="text-slate-700 mb-6" />
        <p className="text-xl font-medium text-slate-300">No analysis history yet</p>
        <p className="text-slate-500 mt-2">Your past resume analyses will appear here securely.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
      <div className="px-6 py-5 border-b border-white/5 bg-dark-900/50 flex items-center gap-3">
        <Clock className="text-primary-400" size={20} />
        <h3 className="text-lg font-semibold text-white">Recent Analyses</h3>
        <div className="ml-auto bg-dark-800 rounded-full px-3 py-1 text-xs font-bold text-slate-400 border border-white/5">
          {analyses.length} RECORDS
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-900/30 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-medium">Resume File</th>
              <th className="px-6 py-4 font-medium">Match Score</th>
              <th className="px-6 py-4 font-medium">Date Analyzed</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {analyses.map((analysis) => {
              const uId = analysis.id || analysis.resume_name + analysis.created_at;
              const isExpanded = expandedId === uId;
              
              return (
                <React.Fragment key={uId}>
                  <tr className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-dark-800 flex items-center justify-center border border-white/5 group-hover:border-primary-500/30 transition-colors">
                          <FileText size={14} className="text-slate-400 group-hover:text-primary-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-200">{analysis.resume_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreColor(analysis.match_score)}`}>
                        {analysis.match_score}% MATCH
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {analysis.created_at ? new Date(analysis.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex flex-row justify-end items-center gap-3">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : uId)}
                          className="text-slate-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-dark-800"
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        <button
                          onClick={() => onSelectAnalysis(analysis)}
                          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg shadow-primary-500/20"
                        >
                          View Results <ArrowRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-dark-900/30">
                      <td colSpan={4} className="px-6 py-6 border-t border-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Highlights</h4>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-slate-400 mb-2">Top Found Skills:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {analysis.matched_skills.slice(0, 5).map((skill, i) => (
                                    <span key={i} className="px-2 py-1 bg-dark-800 border border-white/5 text-slate-300 text-xs rounded-md">{skill}</span>
                                  ))}
                                  {analysis.matched_skills.length > 5 && (
                                    <span className="px-2 py-1 bg-dark-800 text-slate-500 text-xs rounded-md">+{analysis.matched_skills.length - 5} more</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-slate-400 mb-2">Key Missing Skills:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {analysis.missing_skills.slice(0, 5).map((skill, i) => (
                                    <span key={i} className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-md">{skill}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Key Suggestion</h4>
                             <div className="bg-dark-800 p-4 rounded-xl border border-white/5">
                               <p className="text-sm text-slate-300 italic">
                                 "{analysis.suggestions[0] || 'No suggestions available.'}"
                               </p>
                             </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
