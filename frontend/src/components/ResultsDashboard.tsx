import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb, Calendar, FileText, Shield, Award, TrendingUp, Users, Brain } from 'lucide-react';
import ScoreChart from './ScoreChart';
import SkillBadge from './SkillBadge';
import type { ResultsDashboardProps } from '../types';

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, isAnalyzing }) => {
  if (isAnalyzing) return null;
  if (!result) return null;

  // Log result for debugging
  console.log('ResultsDashboard received:', result);

  const getScoreDescription = (score: number) => {
    if (score >= 80) return { label: 'Excellent Match', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' };
    if (score >= 60) return { label: 'Good Match', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' };
    if (score >= 40) return { label: 'Moderate Match', color: 'text-orange-400', bgColor: 'bg-orange-500/10' };
    return { label: 'Low Match', color: 'text-red-400', bgColor: 'bg-red-500/10' };
  };

  const getConfidenceInfo = (level: string) => {
    switch(level) {
      case 'high':
        return {
          label: 'High Confidence',
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          icon: Shield,
          description: 'Strong evidence from quantified achievements and multiple skill matches'
        };
      case 'medium':
        return {
          label: 'Medium Confidence',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          icon: TrendingUp,
          description: 'Some evidence of experience and skill matches'
        };
      case 'low':
        return {
          label: 'Low Confidence',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
          icon: Brain,
          description: 'Limited evidence - review carefully before making decisions'
        };
      default:
        return {
          label: 'Unknown',
          color: 'text-slate-400',
          bgColor: 'bg-slate-500/10',
          borderColor: 'border-slate-500/30',
          icon: Brain,
          description: 'Unable to determine confidence level'
        };
    }
  };

  const getDepthColor = (depth: number) => {
    if (depth >= 4) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (depth >= 3) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (depth >= 2) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  };

  const getDepthLabel = (depth: number) => {
    if (depth >= 5) return 'Expert';
    if (depth >= 4) return 'Proficient';
    if (depth >= 3) return 'Practical';
    if (depth >= 2) return 'Familiar';
    return 'Learning';
  };

  const { label, color } = getScoreDescription(result.match_score || 0);
  const confidence = getConfidenceInfo(result.confidence_level || 'low');
  const ConfidenceIcon = confidence.icon;

  // Add defensive checks for nested properties
  const experienceAnalysis = result.experience_analysis || { resume: {}, job: {}, match_score: 0 };
  const skillDepthAnalysis = result.skill_depth_analysis || {};
  const softSkills = result.soft_skills || { resume: {} };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
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

      {/* Confidence Level Banner */}
      <motion.div variants={item} className={`glass-card border ${confidence.borderColor} rounded-xl p-4 flex items-start gap-4`}>
        <div className={`p-2.5 rounded-lg ${confidence.bgColor} flex-shrink-0`}>
          <ConfidenceIcon size={20} className={confidence.color} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold ${confidence.color}`}>{confidence.label}</span>
            <span className="text-xs text-slate-500">Analysis Reliability</span>
          </div>
          <p className="text-sm text-slate-400">{confidence.description}</p>
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
                {(result.matched_skills || []).length} FOUND
              </span>
            </div>
            {(result.matched_skills || []).length > 0 ? (
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
                {(result.missing_skills || []).length} MISSING
              </span>
            </div>
            {(result.missing_skills || []).length > 0 ? (
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

      {/* Scoring Breakdown */}
      <motion.div variants={item} className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Award size={20} className="text-primary-400" />
          Score Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Technical Skills</span>
              <span className="text-xs font-semibold text-slate-500">50% weight</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, result.match_score * 1.5)}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Based on matched skills & depth analysis</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Experience Level</span>
              <span className="text-xs font-semibold text-slate-500">30% weight</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${(experienceAnalysis.match_score || 0) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-emerald-400">{Math.round((experienceAnalysis.match_score || 0) * 100)}%</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Resume: {experienceAnalysis.resume?.seniority_level || 'Unknown'}
              {' '}• Job: {experienceAnalysis.job?.seniority_level || 'Unknown'}
            </p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Soft Skills</span>
              <span className="text-xs font-semibold text-slate-500">20% weight</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: '75%' }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Leadership, communication, teamwork, initiative</p>
          </div>
        </div>
      </motion.div>

      {/* Experience & Skill Depth Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Experience Analysis */}
        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-400" />
            Experience Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg border border-white/5">
              <span className="text-sm text-slate-400">Your Level</span>
              <span className="font-semibold text-white">
                {experienceAnalysis.resume?.seniority_level || 'Unknown'}
                {experienceAnalysis.resume?.years_of_experience && ` (${experienceAnalysis.resume.years_of_experience} years)`}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg border border-white/5">
              <span className="text-sm text-slate-400">Job Requirement</span>
              <span className="font-semibold text-white">
                {experienceAnalysis.job?.seniority_level || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg border border-white/5">
              <span className="text-sm text-slate-400">Experience Match</span>
              <span className={`font-semibold ${experienceAnalysis.match_score >= 0.8 ? 'text-emerald-400' : experienceAnalysis.match_score >= 0.5 ? 'text-yellow-400' : 'text-orange-400'}`}>
                {Math.round(experienceAnalysis.match_score * 100)}%
              </span>
            </div>
            {experienceAnalysis.resume?.achievement_count > 0 && (
              <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                <p className="text-sm text-emerald-400 flex items-center gap-2">
                  <Award size={14} />
                  {experienceAnalysis.resume.achievement_count} quantified achievements detected
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Skill Depth Analysis */}
        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Brain size={20} className="text-violet-400" />
            Skill Depth Analysis
          </h3>
          <p className="text-sm text-slate-400 mb-4">Depth score (1-5): 1=Learning, 2=Familiar, 3=Practical, 4=Proficient, 5=Expert</p>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(skillDepthAnalysis).slice(0, 8).map(([skill, depth]) => (
              <div key={skill} className="flex items-center gap-3 p-2 bg-dark-800/50 rounded-lg border border-white/5">
                <span className="flex-1 text-sm text-slate-300">{skill}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${depth * 20}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded border ${getDepthColor(depth)}`}>
                    {getDepthLabel(depth)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Soft Skills Section */}
      <motion.div variants={item} className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Users size={20} className="text-blue-400" />
          Soft Skills Detected
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(softSkills.resume || {}).map(([category, skills]) => (
            <div key={category} className="p-3 bg-dark-800/50 rounded-lg border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300 capitalize">
                  {category.replace('_', ' ')}
                </span>
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                  {skills.length}
                </span>
              </div>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {skills.slice(0, 3).map((skill: string, idx: number) => (
                    <span key={idx} className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {skills.length > 3 && (
                    <span className="text-xs text-slate-500">+{skills.length - 3} more</span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Not detected</p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Suggestions Box */}
      <motion.div variants={item} className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 blur-[80px] rounded-full"></div>

        <h3 className="text-xl font-medium text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
            <Lightbulb size={20} className="text-violet-400" />
          </div>
          Actionable Suggestions
        </h3>

        {(result.suggestions || []).length > 0 ? (
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

      {/* Final Disclaimer */}
      <motion.div variants={item} className="bg-neutral-800/30 border border-neutral-700/50 rounded-xl p-4">
        <p className="text-xs text-neutral-400 leading-relaxed text-center">
          <span className="font-semibold text-neutral-300">📝 Note:</span> This analysis is based on your resume text. Actual qualifications require human review, technical interviews, and code challenges.
          A high score indicates alignment with stated requirements, but doesn't guarantee job performance. A low score suggests gaps to address, but you may still be qualified through transferable skills.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ResultsDashboard;
