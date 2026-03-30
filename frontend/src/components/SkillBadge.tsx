import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { SkillBadgeProps } from '../types';

const SkillBadge: React.FC<SkillBadgeProps> = ({ skill, type }) => {
  const baseClasses = 'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300';

  const typeClasses =
    type === 'matched'
      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40'
      : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 opacity-80';

  return (
    <span className={`${baseClasses} ${typeClasses}`}>
      {type === 'matched' ? (
        <CheckCircle2 size={14} className="mr-1.5 flex-shrink-0" />
      ) : (
        <XCircle size={14} className="mr-1.5 flex-shrink-0" />
      )}
      <span className="tracking-wide">{skill}</span>
    </span>
  );
};

export default SkillBadge;
