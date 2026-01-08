import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import DashboardKanban from './components/DashboardKanban';
import Phase1Alignment from './components/Phase1Alignment';
import Phase2Interview from './components/Phase2Interview';
import Phase3Shortlist from './components/Phase3Shortlist';
import Phase4Decision from './components/Phase4Decision';
import ClientReport from './components/ClientReport';
import { SignInPage } from './components/ui/SignInPage';
import { LandingPage } from './pages/LandingPage';
import { SignUpPage } from './pages/SignUpPage';
import { AgentFinance } from './pages/AgentFinance';
import { ClientDashboardOverview } from './pages/ClientDashboardOverview';
import { ClientDashboardFinalists } from './pages/ClientDashboardFinalists';
import { ClientPositionOverview } from './pages/ClientPositionOverview';
import { ClientCandidateDetail } from './pages/ClientCandidateDetail';
import { ClientComparativeReport } from './pages/ClientComparativeReport';
import { ReportCover } from './pages/ReportCover';
import { ReportBackCover } from './pages/ReportBackCover';
import { ProjectsDashboard } from './pages/ProjectsDashboard';
import { ProjectContainer } from './components/ProjectContainer';
import { Phase1Result, Phase2Result, Phase3Result, Phase4Result } from './types';
import { useAuth } from './hooks/useAuth';
import { loadAppState, saveAppState, AppState } from './services/persistenceService';
import { ChatMessage } from './services/chatService';
import { useProjects } from './hooks/useProjects';
import GlobalChatAssistant from './components/GlobalChatAssistant';

function App() {
  const { user, loading, logout, signInWithGoogle } = useAuth();
  const { projects: allProjects } = useProjects(user?.uid || null);
  const location = useLocation();

  // State - Initialized empty, populated by loadAppState
  const [phase1Data, setPhase1Data] = useState<Phase1Result | null>(null);
  const [candidates, setCandidates] = useState<{ name: string; cvText: string; interviewReport: string; fullPhase2: Phase2Result }[]>([]);
  const [shortlist, setShortlist] = useState<Phase3Result[]>([]);
  const [phase4Result, setPhase4Result] = useState<Phase4Result | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Persistence: Load on Login
  useEffect(() => {
    if (user) {
      loadAppState(user.uid).then(data => {
        if (data) {
          setPhase1Data(data.phase1Data);
          setCandidates(data.candidates);
          setShortlist(data.shortlist);
          setPhase4Result(data.phase4Result);
          if (data.chatHistory) setChatHistory(data.chatHistory);
          console.log("State loaded from Firebase");
        }
      });
    } else {
      // Reset state on logout
      setPhase1Data(null);
      setCandidates([]);
      setShortlist([]);
      setPhase4Result(null);
      setChatHistory([]);
    }
  }, [user]);

  // Persistence: Auto-Save on Change
  useEffect(() => {
    if (user) {
      const state: Omit<AppState, 'lastUpdated'> = {
        phase1Data,
        candidates,
        shortlist,
        phase4Result,
        chatHistory
      };
      saveAppState(user.uid, state);
    }
  }, [user, phase1Data, candidates, shortlist, phase4Result, chatHistory]);

  const mappedUser = user ? {
    name: user.displayName || "User",
    email: user.email || "",
    picture: user.photoURL || "https://github.com/shadcn.png"
  } : null;

  const appState = {
    phase1Data,
    candidates,
    shortlist,
    phase4Result,
    chatHistory
  };

  const handleCandidateEvaluated = (candidate: Phase2Result, cvText: string, reportText: string) => {
    setCandidates(prev => [...prev, {
      name: candidate.candidateName,
      cvText: cvText,
      interviewReport: reportText,
      fullPhase2: candidate
    }]);
  };

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  // Show loading while Firebase initializes auth state
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Redirect logged-in users to workspaces dashboard */}
        <Route path="/signin" element={
          user ? <Navigate to="/projects" replace /> : (
            <SignInPage
              onSignIn={(e) => { e.preventDefault(); handleLogin(); }}
              onGoogleSignIn={handleLogin}
              onCreateAccount={() => { }}
              onResetPassword={() => { }}
            />
          )
        } />
        <Route path="/signup" element={user ? <Navigate to="/projects" replace /> : <SignUpPage />} />

        {/* Multi-Project Routes */}
        <Route path="/projects" element={user ? <ProjectsDashboard /> : <Navigate to="/signin" replace />} />
        <Route path="/projects/:projectId/*" element={user ? <ProjectContainer /> : <Navigate to="/signin" replace />} />

        {/* Admin / Finance Route */}
        <Route path="/finance" element={user ? <AgentFinance /> : <Navigate to="/signin" replace />} />

        {/* Redirect unknown routes to Landing or Projects */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && location.pathname !== '/' && (
        <GlobalChatAssistant
          appState={appState}
          chatHistory={chatHistory}
          onHistoryChange={setChatHistory}
          allProjects={allProjects}
        />
      )}
    </>
  );
}

export default App;