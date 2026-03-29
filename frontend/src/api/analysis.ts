/**
 * API functions for resume analysis.
 */

import { api } from './axios';
import type { AnalysisResult, AnalysisRequest } from '../types';

/**
 * Analyze a resume against a job description.
 *
 * @param request - Object containing the resume file and job description
 * @returns Promise with the analysis result
 */
export async function analyzeResume(
  request: AnalysisRequest
): Promise<AnalysisResult> {
  // Create FormData for multipart/form-data upload
  const formData = new FormData();
  formData.append('resume', request.resume);
  formData.append('job_description', request.job_description);

  const response = await api.post<AnalysisResult>('/api/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Get a sample analysis for testing purposes.
 *
 * @returns Promise with sample analysis result
 */
export async function getSampleAnalysis(): Promise<AnalysisResult> {
  const response = await api.get<AnalysisResult>('/api/analyze/sample');
  return response.data;
}

/**
 * Check API health status.
 *
 * @returns Promise with health status
 */
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const response = await api.get('/health');
  return response.data;
}
