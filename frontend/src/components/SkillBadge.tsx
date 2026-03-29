/**
 * SkillBadge component - displays a single skill as a badge.
 * Green for matched skills, red for missing skills.
 */

import React from 'react';
import type { SkillBadgeProps } from '../types';

const SkillBadge: React.FC<SkillBadgeProps> = ({ skill, type }) => {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';

  const typeClasses =
    type === 'matched'
      ? 'bg-green-100 text-green-800 border border-green-200'
      : 'bg-red-100 text-red-800 border border-red-200';

  return (
    <span className={`${baseClasses} ${typeClasses}`}>
      {type === 'matched' && (
        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {type === 'missing' && (
        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {skill}
    </span>
  );
};

export default SkillBadge;
