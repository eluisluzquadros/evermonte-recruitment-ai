import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Phase1Result, Phase2Result, Phase3Result, Phase4Result } from '../types';

export interface Project {
  id: string;
  userId: string;
  companyName: string;
  roleName: string;
  status: 'active' | 'paused' | 'completed' | 'archived';

  // Phase data
  phase1Data: Phase1Result | null;
  phase4Result?: Phase4Result | null;
  phase5Result?: any | null; // Using any for now or Phase5Result if imported
  phase6Result?: any | null;

  // Custom Funnel Data
  funnelMappedCount?: number;
  funnelApproachedCount?: number;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Computed fields (populated from subcollections or arrays)
  candidatesCount?: number;
  shortlistCount?: number;
  candidates?: any[];
  shortlist?: any[];
}

export interface Candidate {
  id: string;
  projectId: string;
  name: string;
  phase: 'interviewed' | 'shortlist' | 'finalist' | 'rejected';

  // Phase data
  cvText?: string;
  interviewReport?: string;
  phase2Data?: Phase2Result;
  phase3Data?: Phase3Result;
  cognisessData?: any;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const useProjects = (userId: string | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useProjects: userId =', userId);

    if (!userId) {
      console.log('useProjects: No userId, clearing projects');
      setProjects([]);
      setLoading(false);
      return;
    }

    console.log('useProjects: Setting up Firestore listener for userId:', userId);

    const q = query(
      collection(db, 'projects'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('useProjects: Received snapshot with', snapshot.docs.length, 'documents');
        const projectsData = snapshot.docs.map(doc => {
          console.log('useProjects: Project doc:', doc.id, doc.data());
          return {
            id: doc.id,
            ...doc.data()
          };
        }) as Project[];

        setProjects(projectsData);
        setLoading(false);
      },
      (err) => {
        console.error('useProjects: Firestore error:', err.message);
        console.error('useProjects: Full error:', err);
        // If it's an index error, try a simpler query
        if (err.message.includes('index')) {
          console.log('useProjects: Trying simpler query without orderBy...');
          // Fallback to simpler query
          const simpleQ = query(
            collection(db, 'projects'),
            where('userId', '==', userId)
          );
          onSnapshot(simpleQ, (snapshot) => {
            const projectsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Project[];
            setProjects(projectsData);
            setLoading(false);
          });
        } else {
          setError(err.message);
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const createProject = async (data: {
    companyName: string;
    roleName: string;
    phase1Data?: Phase1Result;
    funnelMappedCount?: number;
    funnelApproachedCount?: number;
  }) => {
    if (!userId) throw new Error('User not authenticated');

    console.time('createProject');
    try {
      console.log('Creating project...', data);
      const docRef = await addDoc(collection(db, 'projects'), {
        userId,
        companyName: data.companyName,
        roleName: data.roleName,
        status: 'active',
        phase1Data: data.phase1Data || null,
        funnelMappedCount: data.funnelMappedCount || 0,
        funnelApproachedCount: data.funnelApproachedCount || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.timeEnd('createProject');
      console.log('Project created with ID:', docRef.id);
      return docRef.id;
    } catch (err: any) {
      console.timeEnd('createProject');
      console.error('Error creating project:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateProject = async (projectId: string, data: Partial<Project>) => {
    try {
      const docRef = doc(db, 'projects', projectId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const docRef = doc(db, 'projects', projectId);
      await deleteDoc(docRef);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject
  };
};

export const useCandidates = (projectId: string | null) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'candidates'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const candidatesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Candidate[];

        setCandidates(candidatesData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  const addCandidate = async (data: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!projectId) throw new Error('Project ID not provided');

    try {
      const docRef = await addDoc(collection(db, 'candidates'), {
        ...data,
        projectId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateCandidate = async (candidateId: string, data: Partial<Candidate>) => {
    try {
      const docRef = doc(db, 'candidates', candidateId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCandidate = async (candidateId: string) => {
    try {
      const docRef = doc(db, 'candidates', candidateId);
      await deleteDoc(docRef);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    candidates,
    loading,
    error,
    addCandidate,
    updateCandidate,
    deleteCandidate
  };
};
