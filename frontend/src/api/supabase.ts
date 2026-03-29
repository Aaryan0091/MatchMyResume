/**
 * Supabase client configuration for storing and retrieving analysis history.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate Supabase configuration
const isSupabaseConfigured = SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';

if (!isSupabaseConfigured) {
  console.log(
    'Supabase credentials not found in environment variables. ' +
    'History feature will be disabled. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Create Supabase client only if credentials are configured
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Table name for storing analyses
 */
export const ANALYSES_TABLE = 'analyses';

/**
 * Analysis result as stored in Supabase
 */
export interface SupabaseAnalysis {
  id?: string;
  resume_name: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: string[];
  created_at?: string;
}

/**
 * Save a new analysis to Supabase.
 *
 * @param analysis - The analysis result to save
 * @returns Promise with the saved record or null if Supabase is not configured
 */
export async function saveAnalysis(
  analysis: Omit<SupabaseAnalysis, 'id' | 'created_at'>
): Promise<SupabaseAnalysis | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from(ANALYSES_TABLE)
      .insert([analysis])
      .select()
      .single();

    if (error) {
      console.error('Error saving analysis:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error saving analysis:', err);
    return null;
  }
}

/**
 * Get all analyses from Supabase, ordered by creation date (newest first).
 *
 * @returns Promise with array of analyses or empty array if Supabase is not configured
 */
export async function getAnalyses(): Promise<SupabaseAnalysis[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from(ANALYSES_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching analyses:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching analyses:', err);
    return [];
  }
}

/**
 * Delete a single analysis by ID.
 *
 * @param id - The ID of the analysis to delete
 * @returns Promise with success status
 */
export async function deleteAnalysis(id: string): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from(ANALYSES_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting analysis:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error deleting analysis:', err);
    return false;
  }
}

/**
 * Delete all analyses from Supabase.
 *
 * @returns Promise with success status
 */
export async function clearHistory(): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from(ANALYSES_TABLE)
      .delete()
      .neq('id', 'never-matching-id'); // Delete all records

    if (error) {
      console.error('Error clearing history:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error clearing history:', err);
    return false;
  }
}
