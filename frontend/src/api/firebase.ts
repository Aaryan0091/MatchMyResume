/**
 * Firebase configuration for storing and retrieving analysis history.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, Timestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Validate Firebase configuration
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

if (!isFirebaseConfigured) {
  console.log(
    'Firebase credentials not found in environment variables. ' +
    'History feature will be disabled. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID.'
  );
}

// Initialize Firebase
const app = isFirebaseConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

const db = app ? getFirestore(app) : null;

/**
 * Collection name for storing analyses
 */
const ANALYSES_COLLECTION = 'analyses';

/**
 * Analysis result as stored in Firebase
 */
export interface FirebaseAnalysis {
  id?: string;
  resume_name: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: string[];
  created_at?: string;
}

/**
 * Convert Firebase document to Analysis format
 */
function docToAnalysis(doc: any): FirebaseAnalysis {
  const data = doc.data();
  return {
    id: doc.id,
    resume_name: data.resume_name,
    match_score: data.match_score,
    matched_skills: data.matched_skills,
    missing_skills: data.missing_skills,
    suggestions: data.suggestions,
    created_at: data.created_at?.toDate()?.toISOString() || new Date().toISOString()
  };
}

/**
 * Save a new analysis to Firebase.
 *
 * @param analysis - The analysis result to save
 * @returns Promise with the saved record or null if Firebase is not configured
 */
export async function saveAnalysis(
  analysis: Omit<FirebaseAnalysis, 'id' | 'created_at'>
): Promise<FirebaseAnalysis | null> {
  if (!db) {
    console.warn('Firebase not configured - history feature disabled');
    return null;
  }

  try {
    const docRef = await addDoc(collection(db, ANALYSES_COLLECTION), {
      ...analysis,
      created_at: Timestamp.now()
    });

    // Fetch the saved document to get the ID
    const savedDoc = await getDocs(collection(db, ANALYSES_COLLECTION));
    const saved = savedDoc.docs.find(d => d.id === docRef.id);

    if (saved) {
      return docToAnalysis(saved);
    }

    return null;
  } catch (err: any) {
    console.error('Error saving analysis:', err);
    if (err.code === 'permission-denied' || err.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
      console.warn('⚠️ If you cannot save history, your ad blocker might be blocking Firebase. Please disable it for this site or allow firestore.googleapis.com');
    }
    return null;
  }
}

/**
 * Get all analyses from Firebase, ordered by creation date (newest first).
 *
 * @returns Promise with array of analyses or empty array if Firebase is not configured
 */
export async function getAnalyses(): Promise<FirebaseAnalysis[]> {
  if (!db) {
    console.warn('Firebase not configured - history feature disabled');
    return [];
  }

  try {
    const q = query(collection(db, ANALYSES_COLLECTION), orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docToAnalysis);
  } catch (err: any) {
    console.error('Error fetching analyses:', err);
    if (err.code === 'permission-denied' || err.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
      console.warn('⚠️ If you cannot see history, your ad blocker might be blocking Firebase. Please disable it for this site or allow firestore.googleapis.com');
    }
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
  if (!db) {
    return false;
  }

  try {
    await deleteDoc(doc(db, ANALYSES_COLLECTION, id));
    return true;
  } catch (err: any) {
    console.error('Error deleting analysis:', err);
    if (err.code === 'permission-denied' || err.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
      console.warn('⚠️ If you cannot delete history, your ad blocker might be blocking Firebase. Please disable it for this site or allow firestore.googleapis.com');
    }
    return false;
  }
}

/**
 * Delete all analyses from Firebase.
 *
 * @returns Promise with success status
 */
export async function clearHistory(): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    const querySnapshot = await getDocs(collection(db, ANALYSES_COLLECTION));

    await Promise.all(
      querySnapshot.docs.map(doc => deleteDoc(doc.ref))
    );

    return true;
  } catch (err: any) {
    console.error('Error clearing history:', err);
    if (err.code === 'permission-denied' || err.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
      console.warn('⚠️ If you cannot clear history, your ad blocker might be blocking Firebase. Please disable it for this site or allow firestore.googleapis.com');
    }
    return false;
  }
}
