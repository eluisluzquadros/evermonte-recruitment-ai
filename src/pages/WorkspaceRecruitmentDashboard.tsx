import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    FileText,
    Target,
    Presentation,
    ArrowRight,
    CheckCircle,
    Clock,
    Play,
    Building2,
    Briefcase,
    ChevronLeft,
    Pencil,
    Save,
    X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useProjects } from '../hooks/useProjects';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface WorkspaceRecruitmentDashboardProps {
    phase1Data: any;
    candidates: any[];
    shortlist: any[];
    phase4Result: any;
    phase5Result: any; // Make it standard
    projectInfo?: {
        companyName: string;
        roleName: string;
        funnelMappedCount?: number;
        funnelApproachedCount?: number;
    };
}

const phases = [
    {
        id: 'phase1',
        name: 'Alinhamento',
        description: 'Definição de perfil e requisitos da vaga',
        icon: LayoutDashboard,
        path: 'phase1',
        color: 'from-blue-500 to-blue-600'
    },
    {
        id: 'phase2',
        name: 'Entrevistas',
        description: 'Avaliação técnica e comportamental',
        icon: Users,
        path: 'phase2',
        color: 'from-purple-500 to-purple-600'
    },
    {
        id: 'phase3',
        name: 'Shortlist',
        description: 'Seleção dos candidatos finalistas',
        icon: FileText,
        path: 'phase3',
        color: 'from-amber-500 to-amber-600'
    },
    {
        id: 'phase4',
        name: 'Decisão',
        description: 'Análise final e recomendação',
        icon: Target,
        path: 'phase4',
        color: 'from-emerald-500 to-emerald-600'
    },
    {
        id: 'phase5',
        name: 'Referências',
        description: 'Análise e formalização de referências',
        icon: FileText, // Reusing icon or importing a new one like Quote if available, sticking to existing imports for safety (FileText is generic enough or maybe we import Quote if not used)
        path: 'phase5',
        color: 'from-pink-500 to-pink-600'
    },
    {
        id: 'report',
        name: 'Relatório',
        description: 'Relatório e apresentação',
        icon: Presentation,
        path: 'report/cover',
        color: 'from-rose-500 to-rose-600'
    }
];

export const WorkspaceRecruitmentDashboard: React.FC<WorkspaceRecruitmentDashboardProps> = ({
    phase1Data,
    candidates,
    shortlist,
    phase4Result,
    phase5Result,
    projectInfo
}) => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const { updateProject } = useProjects(null); // Assuming default or creating new hook instance logic if context based is fine
    // Note: useProjects requires a userId if we want to fetch list, but updateProject just needs projectId.
    // Ideally we should pass updateProjects from parent or context, but hook works if auth is global.
    // useProjects needs a userId argument in its definition. Let's see if we can use it without one strictly for update,
    // or we might need to rely on the fact that ProjectContainer calls it.
    // Actually, updateProject in useProjects does not depend on the `uid` passed to the hook for the write operation.

    // Local state for funnel editing
    const [isEditingFunnel, setIsEditingFunnel] = useState(false);
    const [mappedCount, setMappedCount] = useState(projectInfo?.funnelMappedCount || 0);
    const [approachedCount, setApproachedCount] = useState(projectInfo?.funnelApproachedCount || 0);

    useEffect(() => {
        if (projectInfo) {
            setMappedCount(projectInfo.funnelMappedCount || 0);
            setApproachedCount(projectInfo.funnelApproachedCount || 0);
        }
    }, [projectInfo]);

    const handleSaveFunnel = async () => {
        if (!projectId) return;
        try {
            await updateProject(projectId, {
                funnelMappedCount: Number(mappedCount),
                funnelApproachedCount: Number(approachedCount)
            });
            setIsEditingFunnel(false);
            toast.success("Dados do funil atualizados!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar dados.");
        }
    };

    // Calculate phase statuses
    const getPhaseStatus = (phaseId: string) => {
        switch (phaseId) {
            case 'phase1':
                return phase1Data ? 'completed' : 'pending';
            case 'phase2':
                return candidates.length > 0 ? 'completed' : phase1Data ? 'current' : 'pending';
            case 'phase3':
                return shortlist.length > 0 ? 'completed' : candidates.length > 0 ? 'current' : 'pending';
            case 'phase4':
                return phase4Result ? 'completed' : shortlist.length > 0 ? 'current' : 'pending';
            case 'phase5':
                // Depends on phase5Result existence.
                // Assuming phase5Result is passed in props? It is NOT yet in the interface props!
                // I need to update the interface first.
                // For now, let's assume it will be passed.
                return phase5Result ? 'completed' : phase4Result ? 'current' : 'pending';
            case 'report':
                return phase4Result ? 'current' : 'pending';
            default:
                return 'pending';
        }
    };

    const getPhaseMetric = (phaseId: string) => {
        switch (phaseId) {
            case 'phase1':
                return phase1Data ? 'Configurado' : 'Pendente';
            case 'phase2':
                return `${candidates.length} candidato${candidates.length !== 1 ? 's' : ''}`;
            case 'phase3':
                return `${shortlist.length} finalista${shortlist.length !== 1 ? 's' : ''}`;
            case 'phase4':
                return phase4Result ? 'Gerado' : 'Pendente';
            case 'phase5':
                return phase5Result ? 'Processado' : 'Pendente';
            case 'report':
                return phase4Result ? 'Disponível' : 'Pendente';
            default:
                return '';
        }
    };

    const statusConfig = {
        completed: {
            badge: 'Concluído',
            badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            icon: CheckCircle
        },
        current: {
            badge: 'Em Progresso',
            badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            icon: Play
        },
        pending: {
            badge: 'Pendente',
            badgeClass: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
            icon: Clock
        }
    };

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/projects')}
                        className="mb-4 text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Voltar aos Projetos
                    </Button>

                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
                                    {projectInfo?.companyName || 'Projeto'}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-sm font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    <Briefcase className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                    {projectInfo?.roleName || 'Posição não definida'}
                                </Badge>
                            </div>
                        </div>

                        <Badge variant="outline" className="text-sm">
                            ID: {projectId?.slice(0, 8)}...
                        </Badge>
                    </div>
                </div>

                {/* Pipeline Progress Overview */}
                <Card className="mb-8 border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
                    <CardContent className="p-6">
                        <h2 className="text-lg font-medium mb-4 text-slate-200">Pipeline de Recrutamento</h2>
                        <div className="flex items-center gap-2">
                            {phases.map((phase, index) => {
                                const status = getPhaseStatus(phase.id);
                                const isCompleted = status === 'completed';
                                const isCurrent = status === 'current';

                                return (
                                    <React.Fragment key={phase.id}>
                                        <div
                                            className={`flex-1 h-2 rounded-full transition-all ${isCompleted
                                                ? 'bg-emerald-500'
                                                : isCurrent
                                                    ? 'bg-emerald-500/50 animate-pulse'
                                                    : 'bg-slate-700'
                                                }`}
                                        />
                                        {index < phases.length - 1 && (
                                            <ArrowRight className={`w-4 h-4 flex-shrink-0 ${isCompleted ? 'text-emerald-500' : 'text-slate-600'
                                                }`} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-400">
                            <span>Alinhamento</span>
                            <span>Relatório</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Phase Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {phases.map((phase, index) => {
                        const status = getPhaseStatus(phase.id);
                        const StatusIcon = statusConfig[status].icon;
                        const PhaseIcon = phase.icon;
                        const metric = getPhaseMetric(phase.id);

                        return (
                            <motion.div
                                key={phase.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${status === 'current'
                                        ? 'border-emerald-500/50 shadow-emerald-500/10'
                                        : status === 'completed'
                                            ? 'border-emerald-500/20'
                                            : 'border-transparent'
                                        }`}
                                    onClick={() => navigate(`/projects/${projectId}/${phase.path}`)}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className={`p-3 rounded-xl bg-gradient-to-br ${phase.color} shadow-lg`}>
                                                <PhaseIcon className="w-6 h-6 text-white" />
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`${statusConfig[status].badgeClass} text-xs`}
                                            >
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {statusConfig[status].badge}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg font-serif">{phase.name}</CardTitle>
                                        <CardDescription className="text-sm">
                                            {phase.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {metric}
                                            </span>
                                            <Button size="sm" variant="ghost" className="text-emerald-600 hover:text-emerald-700">
                                                Acessar
                                                <ArrowRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Quick Stats */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {candidates.length}
                            </div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                Candidatos Avaliados
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mapeados (Editable) */}
                    <Card className={`shadow-sm transition-all ${isEditingFunnel ? 'ring-2 ring-indigo-500 border-transparent' : 'border-none'}`}>
                        <CardContent className="p-4 text-center relative group h-full flex flex-col justify-center">
                            {!isEditingFunnel && (
                                <button
                                    onClick={() => setIsEditingFunnel(true)}
                                    className="absolute top-2 right-2 p-1 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-all"
                                >
                                    <Pencil className="w-3 h-3" />
                                </button>
                            )}

                            {isEditingFunnel ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Mapeados</label>
                                    <Input
                                        type="number"
                                        value={mappedCount}
                                        onChange={(e) => setMappedCount(Number(e.target.value))}
                                        className="h-8 text-center"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {projectInfo?.funnelMappedCount || 0}
                                    </div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                        Mapeados
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Abordados (Editable) */}
                    <Card className={`shadow-sm transition-all ${isEditingFunnel ? 'ring-2 ring-indigo-500 border-transparent bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-none'}`}>
                        <CardContent className="p-4 text-center relative group h-full flex flex-col justify-center">
                            {isEditingFunnel ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Abordados</label>
                                    <Input
                                        type="number"
                                        value={approachedCount}
                                        onChange={(e) => setApproachedCount(Number(e.target.value))}
                                        className="h-8 text-center"
                                        autoFocus={false}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {projectInfo?.funnelApproachedCount || 0}
                                    </div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                        Abordados
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Finalists Count */}
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {shortlist.length}
                            </div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                Finalistas
                            </div>
                        </CardContent>
                    </Card>

                    {/* Control Buttons for Edit Mode */}
                    {isEditingFunnel && (
                        <div className="col-span-2 md:col-span-4 flex justify-center gap-3 py-4 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 mt-2">
                            <Button
                                size="sm"
                                onClick={handleSaveFunnel}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg px-6"
                            >
                                <Save className="w-4 h-4 mr-2" /> Salvar Alterações
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setMappedCount(projectInfo?.funnelMappedCount || 0);
                                    setApproachedCount(projectInfo?.funnelApproachedCount || 0);
                                    setIsEditingFunnel(false);
                                }}
                                className="bg-white dark:bg-slate-800 shadow-md px-6 hover:bg-slate-50"
                            >
                                <X className="w-4 h-4 mr-2" /> Cancelar
                            </Button>
                        </div>
                    )}

                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {phases.filter(p => getPhaseStatus(p.id) === 'completed').length}
                            </div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                Fases Concluídas
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-emerald-600">
                                {Math.round((phases.filter(p => getPhaseStatus(p.id) === 'completed').length / phases.length) * 100)}%
                            </div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                Progresso
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceRecruitmentDashboard;
