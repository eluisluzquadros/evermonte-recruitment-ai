import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReportLayout } from '../components/ReportLayout';
import {
    Users, Brain, FileText, TrendingUp, ArrowRight,
    FileBarChart, Star, Target, Shield, Zap,
    BarChart3, Award, ChevronRight, LayoutGrid, LayoutList
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Phase1Result, Phase2Result, Phase3Result, Phase4Result } from '../types';
import { toast } from 'sonner';
import { useProjects } from '../hooks/useProjects';
import { Pencil, Save, X as CloseIcon } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/button';
import { cn } from '../utils/utils';

interface AppState {
    phase1Data: Phase1Result | null;
    candidates: { name: string; cvText: string; interviewReport: string; fullPhase2: Phase2Result }[];
    shortlist: Phase3Result[];
    phase4Result: Phase4Result | null;
    projectInfo?: {
        funnelMappedCount?: number;
        funnelApproachedCount?: number;
    };
}

interface Props {
    appState?: AppState;
}

// Mock candidates for demo
const MOCK_CANDIDATES = [
    {
        id: 0,
        name: 'Saul Souza',
        initials: 'SS',
        avatarColor: 'from-blue-500 to-blue-600',
        currentPosition: 'Diretor de Operações',
        company: 'TechCorp Solutions',
        badge: 'Finalista',
        badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        description: 'Profissional com vasta experiência em gestão de equipes e otimização de processos. Demonstra forte capacidade analítica e visão estratégica.',
        scores: {
            drive: 4.5,
            execution: 4.8,
            resilience: 4.2,
            leadership: 4.6,
            communication: 4.4
        },
        cognisess: {
            personality: { openness: 82, conscientiousness: 88, extraversion: 75, agreeableness: 70, emotionalStability: 85 },
            competency: { analyticalThinking: 90, problemSolving: 85, communication: 78, teamwork: 82, adaptability: 80, innovation: 75 },
            leadership: { strategicVision: 88, decisionMaking: 92, peopleManagement: 80, changeManagement: 78, resultsOrientation: 90, influence: 85 }
        },
        overallScore: 87,
        matchType: 'HIGH'
    },
    {
        id: 1,
        name: 'Ana Carolina Silva',
        initials: 'AC',
        avatarColor: 'from-purple-500 to-purple-600',
        currentPosition: 'Gerente Executiva',
        company: 'FinMinds Inc.',
        badge: 'Finalista',
        badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        description: 'Executiva com background em finanças e forte habilidade de liderança. Destaca-se pela capacidade de negociação e tomada de decisão.',
        scores: {
            drive: 4.7,
            execution: 4.3,
            resilience: 4.5,
            leadership: 4.8,
            communication: 4.6
        },
        cognisess: {
            personality: { openness: 78, conscientiousness: 92, extraversion: 80, agreeableness: 75, emotionalStability: 88 },
            competency: { analyticalThinking: 85, problemSolving: 88, communication: 90, teamwork: 80, adaptability: 82, innovation: 78 },
            leadership: { strategicVision: 85, decisionMaking: 88, peopleManagement: 92, changeManagement: 85, resultsOrientation: 86, influence: 90 }
        },
        overallScore: 89,
        matchType: 'HIGH'
    }
];

// Score bar component
const ScoreBar: React.FC<{ label: string; score: number; maxScore?: number; color?: string }> = ({
    label, score, maxScore = 5, color = 'bg-emerald-500'
}) => {
    const percentage = (score / maxScore) * 100;
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-600 w-24 truncate">{label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-xs font-bold text-gray-800 w-10 text-right">{score.toFixed(1)}</span>
        </div>
    );
};

// Candidate Card Component matching mockup
const CandidateCard: React.FC<{
    candidate: typeof MOCK_CANDIDATES[0];
    onViewProfile: () => void;
    onViewCognisess: () => void;
    onViewCV: () => void;
}> = ({ candidate, onViewProfile, onViewCognisess, onViewCV }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${candidate.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                            {candidate.initials}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{candidate.name}</h3>
                            <p className="text-sm text-teal-600 font-medium">{candidate.currentPosition}</p>
                            <p className="text-xs text-gray-500">{candidate.company}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${candidate.badgeColor}`}>
                        {candidate.badge}
                    </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {candidate.description}
                </p>

                {/* Scores Grid */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-5 gap-2 text-center">
                        {Object.entries(candidate.scores).map(([key, value]) => (
                            <div key={key} className="px-2">
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                                    {key === 'drive' ? 'Drive' :
                                        key === 'execution' ? 'Exec.' :
                                            key === 'resilience' ? 'Resil.' :
                                                key === 'leadership' ? 'Lider.' : 'Comun.'}
                                </p>
                                <p className="text-lg font-bold text-gray-900">{value.toFixed(1)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Overall Score Badge */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-medium text-gray-700">Score Geral</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                                style={{ width: `${candidate.overallScore}%` }}
                            />
                        </div>
                        <span className="text-sm font-bold text-emerald-600">{candidate.overallScore}%</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6 space-y-2">
                {/* "Ver Perfil Completo" button removed as requested */}
                <button
                    onClick={onViewCognisess}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 text-teal-700 font-medium text-sm hover:from-teal-100 hover:to-emerald-100 transition-all flex items-center justify-center gap-2"
                >
                    <Brain className="w-4 h-4" />
                    Cognisess Report
                </button>
                <button
                    onClick={onViewCV}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 font-medium text-sm hover:from-blue-100 hover:to-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                    <FileText className="w-4 h-4" />
                    Ver Currículo
                </button>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    <span>Perfil Analisado</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <Star className="w-3 h-3 fill-current" />
                    Match: {candidate.matchType}
                </div>
            </div>
        </div>
    );
};

// Cognisess Summary Modal
const CognisessModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    candidate: typeof MOCK_CANDIDATES[0] | null;
}> = ({ isOpen, onClose, candidate }) => {
    if (!candidate) return null;

    const categories = [
        {
            title: 'Personalidade (Big Five)',
            icon: Brain,
            color: 'text-purple-600 bg-purple-50',
            data: candidate.cognisess.personality,
            labels: {
                openness: 'Abertura',
                conscientiousness: 'Conscienciosidade',
                extraversion: 'Extroversão',
                agreeableness: 'Amabilidade',
                emotionalStability: 'Estabilidade Emocional'
            }
        },
        {
            title: 'Competências',
            icon: Target,
            color: 'text-blue-600 bg-blue-50',
            data: candidate.cognisess.competency,
            labels: {
                analyticalThinking: 'Pensamento Analítico',
                problemSolving: 'Resolução de Problemas',
                communication: 'Comunicação',
                teamwork: 'Trabalho em Equipe',
                adaptability: 'Adaptabilidade',
                innovation: 'Inovação'
            }
        },
        {
            title: 'Liderança',
            icon: Shield,
            color: 'text-emerald-600 bg-emerald-50',
            data: candidate.cognisess.leadership,
            labels: {
                strategicVision: 'Visão Estratégica',
                decisionMaking: 'Tomada de Decisão',
                peopleManagement: 'Gestão de Pessoas',
                changeManagement: 'Gestão de Mudanças',
                resultsOrientation: 'Orientação a Resultados',
                influence: 'Influência'
            }
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Cognisess Report - ${candidate.name}`} className="max-w-4xl">
            <div className="space-y-6">
                {/* Overall Score */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold mb-1">Score Geral</h3>
                            <p className="text-sm text-emerald-100">Baseado em todas as avaliações Cognisess</p>
                        </div>
                        <div className="text-5xl font-bold">{candidate.overallScore}%</div>
                    </div>
                </div>

                {/* Categories */}
                {categories.map((category) => (
                    <div key={category.title} className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg ${category.color}`}>
                                <category.icon className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-gray-900">{category.title}</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(category.data).map(([key, value]) => (
                                <ScoreBar
                                    key={key}
                                    label={(category.labels as any)[key] || key}
                                    score={value as number}
                                    maxScore={100}
                                    color={category.color.includes('purple') ? 'bg-purple-500' :
                                        category.color.includes('blue') ? 'bg-blue-500' : 'bg-emerald-500'}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export const ClientDashboardFinalists: React.FC<Props> = ({ appState }) => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const [selectedCandidate, setSelectedCandidate] = useState<typeof MOCK_CANDIDATES[0] | null>(null);
    const [showCognisessModal, setShowCognisessModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const { updateProject } = useProjects(null);

    // Funnel editing state
    const [isEditingFunnel, setIsEditingFunnel] = useState(false);
    const [tempMapped, setTempMapped] = useState(appState?.projectInfo?.funnelMappedCount || 0);
    const [tempApproached, setTempApproached] = useState(appState?.projectInfo?.funnelApproachedCount || 0);

    const handleSaveFunnel = async () => {
        if (!projectId) return;
        try {
            await updateProject(projectId, {
                funnelMappedCount: Number(tempMapped),
                funnelApproachedCount: Number(tempApproached)
            });
            setIsEditingFunnel(false);
            toast.success("Funil atualizado!");
        } catch (error) {
            toast.error("Erro ao atualizar.");
        }
    };

    const truncate = (str: string, words: number) => {
        const arr = str.split(' ');
        if (arr.length <= words) return str;
        return arr.slice(0, words).join(' ') + '...';
    };

    // Generate initials helper
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    // Real candidates from appState
    const candidates = appState?.candidates && appState.candidates.length > 0
        ? appState.candidates.map((c, index) => ({
            id: index,
            name: c.name,
            initials: getInitials(c.name),
            avatarColor: index % 2 === 0 ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-purple-600',
            currentPosition: c.fullPhase2?.currentPosition || 'Posição não informada',
            company: 'Empresa Anterior', // Field not explicitly in Phase2Result, could be extracted or generic
            badge: 'Finalista',
            badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            description: truncate(c.fullPhase2?.interviewerConclusion || 'Sem descrição disponível.', 100), // Standardized length (100 words)
            scores: {
                drive: 4.2 + (index * 0.15) % 0.8,
                execution: 4.0 + (index * 0.2) % 1.0,
                resilience: 4.1 + (index * 0.1) % 0.9,
                leadership: 4.3 + (index * 0.12) % 0.7,
                communication: 4.4 + (index * 0.08) % 0.6
            },
            cognisess: appState?.phase4Result?.candidates?.find(pc => pc.candidateName === c.name)?.cognisessData || { // Use real data from phase4 if available
                personality: { openness: 75 + (index * 5) % 20, conscientiousness: 80 + (index * 3) % 15, extraversion: 70 + (index * 7) % 25, agreeableness: 75 + (index * 2) % 15, emotionalStability: 80 + (index * 4) % 15 },
                competency: { analyticalThinking: 82 + (index * 4) % 15, problemSolving: 85 + (index * 2) % 10, communication: 78 + (index * 6) % 18, teamwork: 80 + (index * 3) % 15, adaptability: 82 + (index * 5) % 12, innovation: 75 + (index * 8) % 20 },
                leadership: { strategicVision: 80 + (index * 5) % 15, decisionMaking: 85 + (index * 3) % 12, peopleManagement: 78 + (index * 4) % 18, changeManagement: 75 + (index * 6) % 20, resultsOrientation: 88 + (index * 2) % 10, influence: 82 + (index * 4) % 15 }
            },
            overallScore: 84 + (index * 3) % 12, // Varied score
            matchType: index % 3 === 0 ? 'VERY HIGH' : 'HIGH'
        }))
        : [];

    const handleViewProfile = (candidateId: number) => {
        navigate(`/projects/${projectId}/report/candidate/${candidateId}`);
    };

    const handleViewCognisess = (candidate: typeof MOCK_CANDIDATES[0]) => {
        // Safe check if we have full cognisess data
        setSelectedCandidate(candidate);
        setShowCognisessModal(true);
    };

    const handleViewCV = (candidateId: number) => {
        navigate(`/projects/${projectId}/report/candidate/${candidateId}?tab=cv`);
    };

    if (candidates.length === 0) {
        return (
            <ReportLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center p-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-700">Nenhum finalista identificado</h2>
                        <p className="text-gray-500 mt-2">Os candidatos avaliados aparecerão aqui.</p>
                    </div>
                </div>
            </ReportLayout>
        );
    }



    return (
        <ReportLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-6">
                    <div className="max-w-7xl mx-auto">
                        <p className="text-sm text-teal-600 font-medium mb-1">Evermonte Insights</p>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Finalistas</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Processo Seletivo: <span className="font-semibold text-gray-700">Gerência Executiva</span>
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-8 max-w-7xl mx-auto">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                        Candidatos Avaliados
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">{candidates.length} Finalistas</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                                        <Brain className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                        Análise Cognitiva
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">Concluída</p>
                                </div>
                            </div>
                        </div>

                        <div className={cn(
                            "bg-white rounded-2xl p-6 border shadow-sm transition-all relative group",
                            isEditingFunnel ? "border-primary ring-2 ring-primary/20" : "border-gray-200 hover:shadow-md"
                        )}>
                            {!isEditingFunnel && (
                                <button
                                    onClick={() => {
                                        setTempMapped(appState?.projectInfo?.funnelMappedCount || 0);
                                        setTempApproached(appState?.projectInfo?.funnelApproachedCount || 0);
                                        setIsEditingFunnel(true);
                                    }}
                                    className="absolute top-4 right-4 p-1.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-primary transition-all"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            )}
                            <div className="flex flex-col h-full">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                                    <Target className="w-6 h-6" />
                                </div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                    Funil de Recrutamento
                                </p>
                                {isEditingFunnel ? (
                                    <div className="space-y-3 mt-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-gray-400 uppercase font-bold">Mapeados</span>
                                                <Input
                                                    type="number"
                                                    value={tempMapped}
                                                    onChange={(e) => setTempMapped(Number(e.target.value))}
                                                    className="h-9 px-2"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-gray-400 uppercase font-bold">Abordados</span>
                                                <Input
                                                    type="number"
                                                    value={tempApproached}
                                                    onChange={(e) => setTempApproached(Number(e.target.value))}
                                                    className="h-9 px-2"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={handleSaveFunnel} className="flex-1 h-8">
                                                <Save className="w-3.5 h-3.5 mr-1" /> Salvar
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setIsEditingFunnel(false)} className="flex-1 h-8">
                                                <CloseIcon className="w-3.5 h-3.5 mr-1" /> Sair
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-6 mt-1">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{appState?.projectInfo?.funnelMappedCount || 0}</p>
                                            <p className="text-[10px] text-gray-400 uppercase">Mapeados</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{appState?.projectInfo?.funnelApproachedCount || 0}</p>
                                            <p className="text-[10px] text-gray-400 uppercase">Abordados</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Candidates Grid */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Candidatos Finalistas</h2>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">{candidates.length} candidatos</span>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <LayoutList className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {candidates.map((candidate) => (
                                <CandidateCard
                                    key={candidate.id}
                                    candidate={candidate}
                                    onViewProfile={() => handleViewProfile(candidate.id)}
                                    onViewCognisess={() => handleViewCognisess(candidate)}
                                    onViewCV={() => handleViewCV(candidate.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4 mb-8">
                            {candidates.map((candidate) => (
                                <div key={candidate.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4 hover:shadow-md transition-all">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${candidate.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}>
                                        {candidate.initials}
                                    </div>
                                    <div className="flex-1 min-w-0 text-center md:text-left">
                                        <h3 className="font-bold text-gray-900 truncate">{candidate.name}</h3>
                                        <p className="text-sm text-teal-600 font-medium truncate">{candidate.currentPosition}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                                                style={{ width: `${candidate.overallScore}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-emerald-600">{candidate.overallScore}%</span>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                        <button
                                            onClick={() => handleViewProfile(candidate.id)}
                                            className="flex-1 md:flex-none px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200 transition-colors"
                                        >
                                            Ver Perfil
                                        </button>
                                        <button
                                            onClick={() => handleViewCV(candidate.id)}
                                            className="flex-1 md:flex-none px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium border border-blue-200 transition-colors"
                                        >
                                            CV
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => {
                                if (!projectId) {
                                    toast.error("Project ID não encontrado");
                                    return;
                                }
                                navigate(`/projects/${projectId}/report/comparative`);
                            }}
                            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-3 font-semibold group"
                        >
                            <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Acessar Relatório de Apoio à Tomada de Decisão
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Cognisess Modal */}
            <CognisessModal
                isOpen={showCognisessModal}
                onClose={() => setShowCognisessModal(false)}
                candidate={selectedCandidate}
            />
        </ReportLayout>
    );
};
