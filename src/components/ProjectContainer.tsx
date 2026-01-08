import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './Layout';
import DashboardKanban from './DashboardKanban';
import { WorkspaceRecruitmentDashboard } from '../pages/WorkspaceRecruitmentDashboard';
import Phase1Alignment from './Phase1Alignment';
import Phase2Interview from './Phase2Interview';
import Phase3Shortlist from './Phase3Shortlist';
import Phase4Decision from './Phase4Decision';
import Phase5References from './Phase5References';
import { ClientDashboardOverview } from '../pages/ClientDashboardOverview';
import { ClientDashboardFinalists } from '../pages/ClientDashboardFinalists';
import { ClientPositionOverview } from '../pages/ClientPositionOverview';
import { ClientCandidateDetail } from '../pages/ClientCandidateDetail';
import { ClientComparativeReport } from '../pages/ClientComparativeReport';
import { ReportCover } from '../pages/ReportCover';
import { ReportBackCover } from '../pages/ReportBackCover';
import { Phase1Result, Phase2Result, Phase3Result, Phase4Result, Phase5Result } from '../types';
import { useAuth } from '../hooks/useAuth';
import { loadProjectState, saveProjectState, AppState } from '../services/persistenceService';
import { ChatMessage } from '../services/chatService';
import { useProjects } from '../hooks/useProjects';

export const ProjectContainer = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get project info from useProjects
    const { projects } = useProjects(user?.uid || null);
    const currentProject = projects.find(p => p.id === projectId);
    const projectInfo = currentProject ? {
        companyName: currentProject.companyName,
        roleName: currentProject.roleName,
        funnelMappedCount: currentProject.funnelMappedCount,
        funnelApproachedCount: currentProject.funnelApproachedCount
    } : undefined;

    // State
    const [phase1Data, setPhase1Data] = useState<Phase1Result | null>(null);
    const [candidates, setCandidates] = useState<{ name: string; cvText: string; interviewReport: string; fullPhase2: Phase2Result }[]>([]);
    const [shortlist, setShortlist] = useState<Phase3Result[]>([]);
    const [phase4Result, setPhase4Result] = useState<Phase4Result | null>(null);
    const [phase5Result, setPhase5Result] = useState<Phase5Result | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [loadingState, setLoadingState] = useState(true);

    // Load State
    useEffect(() => {
        if (user && projectId) {
            setLoadingState(true);
            loadProjectState(user.uid, projectId).then(data => {
                if (data) {
                    setPhase1Data(data.phase1Data);
                    setCandidates(data.candidates || []);
                    setShortlist(data.shortlist || []);
                    setPhase4Result(data.phase4Result);
                    setPhase5Result(data.phase5Result || null);
                    setChatHistory(data.chatHistory || []);
                } else {
                    // New project or no data found
                    setPhase1Data(null);
                    setCandidates([]);
                    setShortlist([]);
                    setPhase4Result(null);
                    setPhase5Result(null);
                    setChatHistory([]);
                }
                setLoadingState(false);
            });
        }
    }, [user, projectId]);

    // Save State
    useEffect(() => {
        if (user && projectId && !loadingState) {
            const state: Omit<AppState, 'lastUpdated'> = {
                phase1Data,
                candidates,
                shortlist,
                phase4Result,
                phase5Result,
                chatHistory
            };
            // Debounce could be good, but for now direct save
            saveProjectState(user.uid, projectId, state);
        }
    }, [user, projectId, phase1Data, candidates, shortlist, phase4Result, phase5Result, chatHistory, loadingState]);

    const handleCandidateEvaluated = (candidate: Phase2Result, cvText: string, reportText: string) => {
        setCandidates(prev => {
            const index = prev.findIndex(c => c.name === candidate.candidateName);
            if (index >= 0) {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    interviewReport: reportText,
                    fullPhase2: candidate,
                    // valid logic: update cvText if provided, else keep old
                    cvText: cvText || updated[index].cvText
                };
                return updated;
            }
            return [...prev, {
                name: candidate.candidateName,
                cvText: cvText,
                interviewReport: reportText,
                fullPhase2: candidate
            }];
        });
    };

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
        phase5Result,
        chatHistory,
        projectInfo,
        funnelData: currentProject ? {
            mapped: currentProject.funnelMappedCount || 0,
            approached: currentProject.funnelApproachedCount || 0
        } : undefined
    };

    if (loadingState) {
        return <div className="flex items-center justify-center min-h-screen">Carregando projeto...</div>;
    }

    // Helper to pass common props
    const layoutProps = {
        user: mappedUser,
        onLogin: async () => { }, // Handled at App level
        onLogout: logout,
        appState,
        chatHistory,
        onChatHistoryChange: setChatHistory,
        projectId // Pass projectId to layout for links
    };

    return (
        <Routes>
            <Route path="dashboard" element={
                <Layout {...layoutProps}>
                    <DashboardKanban
                        candidates={candidates}
                        shortlist={shortlist}
                        phase4Result={phase4Result}
                        phase5Result={phase5Result}
                        phase1Data={phase1Data}
                        projectId={projectId}
                        funnelData={appState.funnelData}
                    />
                </Layout>
            } />
            <Route path="kanban" element={
                <Layout {...layoutProps}>
                    <DashboardKanban
                        candidates={candidates}
                        shortlist={shortlist}
                        phase4Result={phase4Result}
                        phase5Result={phase5Result}
                        phase1Data={phase1Data}
                        funnelData={appState.funnelData}
                    />
                </Layout>
            } />
            <Route path="phase1" element={
                <Layout {...layoutProps}>
                    <Phase1Alignment savedData={phase1Data} onComplete={setPhase1Data} projectId={projectId} initialCompanyName={projectInfo?.companyName} />
                </Layout>
            } />
            <Route path="phase2" element={
                <Layout {...layoutProps}>
                    <Phase2Interview
                        onCandidateEvaluated={handleCandidateEvaluated}
                        candidates={candidates}
                        projectId={projectId}
                    />
                </Layout>
            } />
            <Route path="phase3" element={
                <Layout {...layoutProps}>
                    <Phase3Shortlist candidates={candidates} shortlist={shortlist} onShortlistFinalized={setShortlist} projectId={projectId} />
                </Layout>
            } />
            <Route path="phase4" element={
                <Layout {...layoutProps}>
                    <Phase4Decision
                        shortlist={shortlist}
                        phase1Data={phase1Data}
                        phase2Data={candidates.map(c => c.fullPhase2)}
                        onDecisionGenerated={setPhase4Result}
                        savedResult={phase4Result}
                        projectId={projectId}
                    />
                </Layout>
            } />
            <Route path="phase5" element={
                <Layout {...layoutProps}>
                    <Phase5References
                        candidates={candidates}
                        shortlist={shortlist}
                        savedData={phase5Result}
                        projectId={projectId}
                        onReferenceEvaluated={(result) => {
                            setPhase5Result(result);
                        }}
                    />
                </Layout>
            } />

            {/* Report Sub-routes */}
            <Route path="report/cover" element={<ReportCover appState={appState} />} />
            <Route path="report/overview" element={<ClientDashboardOverview appState={appState} />} />
            <Route path="report/position" element={<ClientPositionOverview appState={appState} />} />
            <Route path="report/finalists" element={<ClientDashboardFinalists appState={appState} />} />
            <Route path="report/candidate/:id" element={<ClientCandidateDetail appState={appState} />} />
            <Route path="report/comparative" element={<ClientComparativeReport appState={appState} />} />
            <Route path="report/backcover" element={<ReportBackCover />} />
            {/* Default /report redirects to cover page */}
            <Route path="report" element={<ReportCover appState={appState} />} />

            {/* Default redirect to Dashboard if just /projects/:id accessed */}
            <Route path="" element={
                <WorkspaceRecruitmentDashboard
                    phase1Data={phase1Data}
                    candidates={candidates}
                    shortlist={shortlist}
                    phase4Result={phase4Result}
                    phase5Result={phase5Result}
                    projectInfo={projectInfo}
                />
            } />
        </Routes>
    );
};
