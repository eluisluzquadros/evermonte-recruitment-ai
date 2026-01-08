import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Phase1Result, Phase2Result, Phase3Result, Phase4Result, Phase5Result } from '../types';
import { ChatMessage } from './chatService';

export interface AppState {
    phase1Data: Phase1Result | null;
    candidates: { name: string; cvText: string; interviewReport: string; fullPhase2: Phase2Result }[];
    shortlist: Phase3Result[];
    phase4Result: Phase4Result | null;
    phase5Result?: Phase5Result | null;
    chatHistory?: ChatMessage[];
    projectInfo?: {
        companyName: string;
        roleName: string;
    };
    funnelData?: {
        mapped: number;
        approached: number;
    };
    lastUpdated?: number;
}

export const saveAppState = async (userId: string, state: Omit<AppState, 'lastUpdated'>) => {
    // Legacy support or single project mode
    if (!userId) return;
    try {
        const userRef = doc(db, 'users', userId);
        const dataToSave = {
            ...state,
            lastUpdated: Date.now()
        };
        await setDoc(userRef, dataToSave, { merge: true });
        console.log("App state saved to Firestore (Legacy)");
    } catch (error) {
        console.error("Error saving app state:", error);
    }
};

export const loadAppState = async (userId: string): Promise<AppState | null> => {
    if (!userId) return null;
    try {
        const userRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            return docSnap.data() as AppState;
        }
        return null;
    } catch (error) {
        console.error("Error loading app state:", error);
        return null;
    }
};

export const saveProjectState = async (userId: string, projectId: string, state: Omit<AppState, 'lastUpdated'>) => {
    // Note: userId is passed but not used for path construction in this new schema, 
    // as projects are top-level. Kept for matching signature/future validation.
    if (!projectId) return;
    try {
        const projectRef = doc(db, 'projects', projectId);

        // Clean the state to remove undefined values (Firestore doesn't support undefined)
        const cleanState = JSON.parse(JSON.stringify(state));

        const dataToSave = {
            ...cleanState,
            updatedAt: Date.now() // specific to project schema
        };
        await setDoc(projectRef, dataToSave, { merge: true });
        console.log(`Project ${projectId} saved to Firestore (root collection)`);
    } catch (error) {
        console.error("Error saving project state:", error);
    }
};

export const loadProjectState = async (userId: string, projectId: string): Promise<AppState | null> => {
    if (!projectId) return null;
    try {
        const projectRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(projectRef);
        if (docSnap.exists()) {
            return docSnap.data() as AppState;
        }
        return null;
    } catch (error) {
        console.error("Error loading project state:", error);
        return null;
    }
};
