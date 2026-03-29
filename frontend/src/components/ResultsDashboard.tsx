/**
 * ResultsDashboard component - displays the analysis results including
 * match score chart, matched/missing skills, and suggestions.
 */

import React from 'react';
import ScoreChart from './ScoreChart';
import SkillBadge from './SkillBadge';
import type { ResultsDashboardProps } from '../types';

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, isAnalyzing }) => {
  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-medium text-gray-700">Analyzing your resume...</p>
          <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Moderate Match';
    return 'Low Match';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Match Score Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Match Score</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <div className="relative">
            <ScoreChart score={result.match_score} />
          </div>
          <div className="text-center sm:text-left">
            <p className={`text-2xl font-bold ${getScoreColor(result.match_score)}`}>
              {getScoreLabel(result.match_score)}
            </p>
            <p className="text-gray-600 mt-2">
              Your resume matches {result.match_score}% of the job requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Matched Skills</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {result.matched_skills.length}
            </span>
          </div>
          {result.matched_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.matched_skills.map((skill, index) => (
                <SkillBadge key={index} skill={skill} type="matched" />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No matched skills found.</p>
          )}
        </div>

        {/* Missing Skills */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Missing Skills</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {result.missing_skills.length}
            </span>
          </div>
          {result.missing_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.missing_skills.map((skill, index) => (
                <SkillBadge key={index} skill={skill} type="missing" />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Great! No missing skills detected.
            </p>
          )}
        </div>
      </div>

      {/* Suggestions Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Improvement Suggestions
        </h3>
        {result.suggestions.length > 0 ? (
          <ol className="space-y-3">
            {result.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-500">No suggestions available.</p>
        )}
      </div>

      {/* Resume Info */}
      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
          Analyzed: {result.resume_name}
        </div>
        <div className="text-sm text-gray-500">
          {new Date(result.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
