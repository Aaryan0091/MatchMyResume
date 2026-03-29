/**
 * HistoryTable component - displays past analyses in a table format.
 * Allows selecting past analyses to view their details.
 */

import React, { useState } from 'react';
import type { HistoryTableProps, StoredAnalysis } from '../types';

const HistoryTable: React.FC<HistoryTableProps> = ({
  analyses,
  onSelectAnalysis,
  isLoading,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const handleSelect = (analysis: StoredAnalysis) => {
    onSelectAnalysis(analysis);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm text-gray-500">Loading history...</p>
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-gray-500">No analysis history yet.</p>
        <p className="text-sm text-gray-400 mt-1">
          Your analyzed resumes will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Analysis History ({analyses.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resume Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Match Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {analyses.map((analysis) => (
              <React.Fragment key={analysis.id || analysis.resume_name}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="text-sm font-medium text-gray-900">
                        {analysis.resume_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(
                        analysis.match_score
                      )}`}
                    >
                      {analysis.match_score}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {analysis.created_at
                      ? new Date(analysis.created_at).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      type="button"
                      onClick={() => handleSelect(analysis)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExpand(analysis.id || analysis.resume_name)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {expandedId === (analysis.id || analysis.resume_name) ? 'Collapse' : 'Details'}
                    </button>
                  </td>
                </tr>
                {expandedId === (analysis.id || analysis.resume_name) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-4">
                        {/* Matched Skills */}
                        {analysis.matched_skills.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Matched Skills:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {analysis.matched_skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Missing Skills */}
                        {analysis.missing_skills.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Missing Skills:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {analysis.missing_skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggestions */}
                        {analysis.suggestions.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Suggestions:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                              {analysis.suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
