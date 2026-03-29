/**
 * Type definitions for the Smart Resume Analyzer application.
 */

/**
 * Analysis result returned from the backend API
 */
export interface AnalysisResult {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: string[];
  resume_name: string;
  timestamp: string;
}

/**
 * Analysis result stored in Supabase
 */
export interface StoredAnalysis {
  id?: string;
  resume_name: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: string[];
  created_at?: string;
}

/**
 * Props for the UploadPanel component
 */
export interface UploadPanelProps {
  onAnalyze: (file: File, jobDescription: string) => Promise<void>;
  isAnalyzing: boolean;
}

/**
 * Props for the ResultsDashboard component
 */
export interface ResultsDashboardProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
}

/**
 * Props for the SkillBadge component
 */
export interface SkillBadgeProps {
  skill: string;
  type: 'matched' | 'missing';
}

/**
 * Props for the ScoreChart component
 */
export interface ScoreChartProps {
  score: number;
}

/**
 * Props for the HistoryTable component
 */
export interface HistoryTableProps {
  analyses: StoredAnalysis[];
  onSelectAnalysis: (analysis: StoredAnalysis) => void;
  isLoading: boolean;
}

/**
 * Props for the HistoryEntry component
 */
export interface HistoryEntryProps {
  analysis: StoredAnalysis;
  onClick: () => void;
}

/**
 * API error response
 */
export interface ApiError {
  detail: string;
  status?: number;
}

/**
 * Upload file state
 */
export interface FileUploadState {
  file: File | null;
  preview?: string;
  error?: string;
}

/**
 * Analysis request payload
 */
export interface AnalysisRequest {
  resume: File;
  job_description: string;
}
