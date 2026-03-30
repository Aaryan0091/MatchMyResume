import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb, Calendar, FileText } from 'lucide-react';
import ScoreChart from './ScoreChart';
import SkillBadge from './SkillBadge';
import type { ResultsDashboardProps } from '../types';

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, isAnalyzing }) => {
  if (isAnalyzing) return null; // Parent handles loading state
  if (!result) return null;

  const getScoreDescription = (score: number) => {
    if (score >= 80) return { label: 'Excellent Match', color: 'text-emerald-400' };
    if (score >= 60) return { label: 'Good Match', color: 'text-yellow-400' };
    if (score >= 40) return { label: 'Moderate Match', color: 'text-orange-400' };
    return { label: 'Low Match', color: 'text-red-400' };
  };

  const { label, color } = getScoreDescription(result.match_score);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Top Banner - Resume Info */}
      <motion.div variants={item} className="glass-card flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-dark-800/50 flex items-center justify-center border border-white/5">
            <FileText size={20} className="text-primary-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">Analyzed Resume</p>
            <p className="font-semibold text-white">{result.resume_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400 bg-dark-800/50 px-3 py-1.5 rounded-lg border border-white/5">
          <Calendar size={14} />
          {new Date(result.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </motion.div>

      {/* Main Stats Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <motion.div variants={item} className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
          <h2 className="text-lg font-medium text-slate-300 mb-6 w-full text-center">Match Score</h2>
          <div className="relative mb-4 group-hover:scale-105 transition-transform duration-500">
            <ScoreChart score={result.match_score} />
          </div>
          <p className={`text-2xl font-bold font-display ${color} tracking-wide mt-2`}>
            {label}
          </p>
          <p className="text-center text-slate-400 mt-2 max-w-[200px] text-sm leading-relaxed">
            Your resume matches <span className="text-slate-200 font-semibold">{result.match_score}%</span> of the target job requirements.
          </p>
        </motion.div>

        {/* Skills Breakdown */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Matched Skills */}
          <motion.div variants={item} className="glass-card flex-1 rounded-2xl p-6 border-l-2 border-l-emerald-500/50">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-400" />
                Matched Skills
              </h3>
              <span className="flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">
                {result.matched_skills.length} FOUND
              </span>
            </div>
            {result.matched_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {result.matched_skills.map((skill, index) => (
                  <SkillBadge key={index} skill={skill} type="matched" />
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-4">
                <p className="text-slate-500 text-sm text-center">No matched skills found. Review the job description and adjust your resume terminology.</p>
              </div>
            )}
          </motion.div>

          {/* Missing Skills */}
          <motion.div variants={item} className="glass-card flex-1 rounded-2xl p-6 border-l-2 border-l-red-500/50">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <XCircle size={20} className="text-red-400" />
                Missing Skills
              </h3>
              <span className="flex items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold">
                {result.missing_skills.length} MISSING
              </span>
            </div>
            {result.missing_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {result.missing_skills.map((skill, index) => (
                  <SkillBadge key={index} skill={skill} type="missing" />
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <p className="text-emerald-400 text-sm text-center flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  Excellent! No critical missing skills detected.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Suggestions Box */}
      <motion.div variants={item} className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 blur-[80px] rounded-full"></div>
        
        <h3 className="text-xl font-medium text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
            <Lightbulb size={20} className="text-violet-400" />
          </div>
          Actionable Suggestions
        </h3>
        
        {result.suggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {result.suggestions.map((suggestion, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
                className="flex items-start gap-4 p-4 rounded-xl bg-dark-800/40 border border-white/5 hover:border-white/10 hover:bg-dark-800/60 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-bold font-display mt-0.5">
                  {index + 1}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{suggestion}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">No specific suggestions at this time.</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ResultsDashboard;
