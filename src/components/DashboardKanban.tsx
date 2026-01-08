import React, { useState } from 'react';
import { Phase1Result, Phase2Result, Phase3Result, Phase4Result, Phase5Result } from '../types';
import { User, FileText, CheckCircle, Briefcase, ArrowRight, LayoutDashboard, Sparkles, TrendingUp, Lightbulb, Loader2, Presentation, AlertTriangle, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createChatSession, sendMessageToAssistant } from '../services/chatService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { cn } from '../utils/utils';
import { Input } from './ui/Input';
import { toast } from 'sonner';
import { useProjects } from '../hooks/useProjects';
import { Pencil, Save, X as CloseIcon } from 'lucide-react';

interface Props {
    candidates: { name: string; fullPhase2: Phase2Result }[];
    shortlist: Phase3Result[];
    phase4Result: Phase4Result | null;
    phase5Result?: Phase5Result | null;
    phase1Data?: Phase1Result | null;
    projectId?: string;
    funnelData?: { mapped: number; approached: number };
}

interface Insight {
    category: string;
    text: string;
    type: 'warning' | 'info' | 'success';
    icon: React.ElementType;
}

const DashboardKanban: React.FC<Props> = ({ candidates, shortlist, phase4Result, phase5Result, phase1Data, projectId, funnelData }) => {
    const isShortlisted = (name: string) => shortlist.some(s => s.candidateName === name);
    const isDecided = (name: string) => phase4Result?.candidates.some(c => c.candidateName === name);

    const decidedCandidates = phase4Result?.candidates || [];
    const shortlistedCandidates = shortlist.filter(s => !isDecided(s.candidateName));
    const interviewCandidates = candidates.filter(c => !isShortlisted(c.name));

    const totalCandidates = candidates.length;
    const conversionRate = totalCandidates > 0 ? Math.round((shortlist.length / totalCandidates) * 100) : 0;

    // Helper for multi-tenant links
    const getLink = (path: string) => projectId ? `/projects/${projectId}/${path}` : `/${path}`;

    const [insights, setInsights] = useState<Insight[]>([]);
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [insightsGenerated, setInsightsGenerated] = useState(false);
    const { updateProject } = useProjects(null);

    // Funnel editing state
    const [isEditingFunnel, setIsEditingFunnel] = useState(false);
    const [tempMapped, setTempMapped] = useState(funnelData?.mapped || 0);
    const [tempApproached, setTempApproached] = useState(funnelData?.approached || 0);

    const handleSaveFunnel = async () => {
        if (!projectId) return;
        try {
            await updateProject(projectId, {
                funnelMappedCount: Number(tempMapped),
                funnelApproachedCount: Number(tempApproached)
            });
            setIsEditingFunnel(false);
            toast.success("Funil atualizado com sucesso!");
        } catch (error) {
            toast.error("Erro ao atualizar funil.");
        }
    };

    const generateProactiveInsights = async () => {
        if (!phase1Data && candidates.length === 0) return;
        setLoadingInsights(true);

        try {
            const chat = createChatSession(phase1Data || null, candidates, shortlist, phase4Result, [], projectId);
            const promptCultural = "Com base estritamente na cultura e desafios definidos na Fase 1, identifique se algum candidato avaliado na Fase 2 apresenta risco de desalinhamento cultural (Red Flag). Se não houver, diga 'Sem riscos evidentes'. Seja direto, máx 1 frase.";
            const promptSalary = "Analise as pretensões salariais dos candidatos. Há alguém muito fora do provável budget ou senioridade da vaga? Responda em 1 frase.";
            const promptHighlight = "Qual é o maior diferencial competitivo (ponto forte) que se destaca entre os candidatos da Shortlist (ou entrevistados)? Responda em 1 frase.";

            const [resCultural, resSalary, resHighlight] = await Promise.all([
                sendMessageToAssistant(chat, promptCultural, 'Dashboard Insight: Cultural'),
                sendMessageToAssistant(chat, promptSalary, 'Dashboard Insight: Budget'),
                sendMessageToAssistant(chat, promptHighlight, 'Dashboard Insight: Highlight')
            ]);

            setInsights([
                {
                    category: 'Análise de Risco Cultural',
                    text: resCultural,
                    type: resCultural.toLowerCase().includes('sem riscos') ? 'success' : 'warning',
                    icon: resCultural.toLowerCase().includes('sem riscos') ? CheckCircle : AlertTriangle
                },
                {
                    category: 'Budget & Remuneração',
                    text: resSalary,
                    type: 'info',
                    icon: TrendingUp
                },
                {
                    category: 'Destaque do Pipeline',
                    text: resHighlight,
                    type: 'success',
                    icon: Lightbulb
                }
            ]);
            setInsightsGenerated(true);

        } catch (error) {
            console.error("Error generating insights", error);
        } finally {
            setLoadingInsights(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="h-full flex flex-col space-y-8">
            {/* Header Stats */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <Card className="md:col-span-2 bg-card border-border">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl text-foreground">Dashboard de Recrutamento</CardTitle>
                                <p className="text-muted-foreground mt-2">Visão geral do funil e inteligência de dados.</p>
                            </div>
                            <Link to={getLink('report')}>
                                <Button variant="outline" className="gap-2 border-border hover:bg-accent hover:text-accent-foreground">
                                    <Presentation className="w-4 h-4" />
                                    Ver Relatório Cliente
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-2 gap-4 relative group">
                    <Card className={cn(
                        "flex flex-col justify-center items-center p-4 transition-all duration-300",
                        isEditingFunnel ? "bg-primary/5 min-h-[120px]" : "bg-blue-500/10 border-blue-500/20"
                    )}>
                        {isEditingFunnel ? (
                            <div className="w-full space-y-1">
                                <label className="text-[10px] font-bold text-primary uppercase text-center block">Mapeados</label>
                                <Input
                                    type="number"
                                    value={tempMapped}
                                    onChange={(e) => setTempMapped(Number(e.target.value))}
                                    className="h-8 text-center bg-background"
                                />
                            </div>
                        ) : (
                            <>
                                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Mapeados</span>
                                <span className="text-3xl font-bold text-foreground mt-1">{funnelData?.mapped || 0}</span>
                            </>
                        )}
                        {!isEditingFunnel && (
                            <button
                                onClick={() => {
                                    setTempMapped(funnelData?.mapped || 0);
                                    setTempApproached(funnelData?.approached || 0);
                                    setIsEditingFunnel(true);
                                }}
                                className="absolute top-2 right-2 p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary transition-all"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </Card>
                    <Card className={cn(
                        "flex flex-col justify-center items-center p-4 transition-all duration-300",
                        isEditingFunnel ? "bg-primary/5 min-h-[120px]" : "bg-emerald-500/10 border-emerald-500/20"
                    )}>
                        {isEditingFunnel ? (
                            <div className="w-full space-y-1">
                                <label className="text-[10px] font-bold text-primary uppercase text-center block">Abordados</label>
                                <Input
                                    type="number"
                                    value={tempApproached}
                                    onChange={(e) => setTempApproached(Number(e.target.value))}
                                    className="h-8 text-center bg-background"
                                />
                            </div>
                        ) : (
                            <>
                                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Abordados</span>
                                <span className="text-3xl font-bold text-foreground mt-1">{funnelData?.approached || 0}</span>
                            </>
                        )}
                    </Card>

                    {isEditingFunnel && (
                        <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                            <button
                                onClick={handleSaveFunnel}
                                className="bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                                title="Salvar"
                            >
                                <Save className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsEditingFunnel(false)}
                                className="bg-background border border-border text-foreground p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                                title="Cancelar"
                            >
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Phase 1 Status */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="border-border bg-card">
                    <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-full", phase1Data ? 'bg-emerald-500/20 text-emerald-500' : 'bg-accent text-muted-foreground')}>
                                <LayoutDashboard className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Fase 1: Alinhamento & Cultura</h3>
                                {phase1Data ? (
                                    <div className="flex items-center mt-1">
                                        <span className="font-serif text-lg text-evermonte-gold mr-3">{phase1Data.companyName}</span>
                                        <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full font-medium flex items-center border border-emerald-500/20">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Concluído
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                        <span className="mr-2">Aguardando dados...</span>
                                        <Link to={getLink('phase1')} className="text-primary hover:underline text-xs flex items-center">
                                            Iniciar Fase 1 <ArrowRight className="w-3 h-3 ml-1" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                        {phase1Data && (
                            <div className="hidden md:block text-right">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Core Skills Mapeadas</div>
                                <div className="text-sm font-medium text-foreground max-w-[300px] truncate mt-1">
                                    {phase1Data.idealCoreSkills.join(', ')}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>

            {/* AI Insights */}
            {phase1Data && candidates.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            Insights Proativos da IA
                        </h3>
                        {!insightsGenerated && !loadingInsights && (
                            <Button
                                onClick={generateProactiveInsights}
                                variant="premium"
                                size="sm"
                                className="text-xs"
                            >
                                <Sparkles className="w-3 h-3 mr-2" />
                                Analisar Riscos & Oportunidades
                            </Button>
                        )}
                    </div>

                    {loadingInsights ? (
                        <Card className="p-8 border-dashed border-border bg-accent/50 flex flex-col items-center justify-center text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mb-3 text-purple-500" />
                            <span className="text-sm font-medium">O Agente está analisando os dados dos candidatos...</span>
                        </Card>
                    ) : insights.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {insights.map((insight, idx) => (
                                <Card
                                    key={idx}
                                    className={cn(
                                        "border-l-4 transition-all hover:translate-y-[-2px]",
                                        insight.type === 'warning' ? 'bg-amber-500/5 border-l-amber-500 border-y-amber-500/10 border-r-amber-500/10' :
                                            insight.type === 'success' ? 'bg-emerald-500/5 border-l-emerald-500 border-y-emerald-500/10 border-r-emerald-500/10' :
                                                'bg-blue-500/5 border-l-blue-500 border-y-blue-500/10 border-r-blue-500/10'
                                    )}
                                >
                                    <CardContent className="p-4 flex items-start gap-3">
                                        <div className={cn("p-2 rounded-full shrink-0",
                                            insight.type === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                                                insight.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' :
                                                    'bg-blue-500/20 text-blue-500'
                                        )}>
                                            <insight.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className={cn("text-xs font-bold uppercase tracking-wider mb-1",
                                                insight.type === 'warning' ? 'text-amber-500' :
                                                    insight.type === 'success' ? 'text-emerald-500' :
                                                        'text-blue-500'
                                            )}>
                                                {insight.category}
                                            </h4>
                                            <p className="text-sm text-foreground/80 leading-relaxed">
                                                {insight.text}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : null}
                </motion.div>
            )}

            {/* Kanban Board */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 overflow-x-auto pb-4"
            >
                <div className="flex h-full gap-6 min-w-[1000px]">

                    {/* Column 1 */}
                    <motion.div variants={itemVariants} className="flex-1 flex flex-col bg-card rounded-xl border border-border">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-accent/50 rounded-t-xl">
                            <h3 className="font-bold text-foreground flex items-center">
                                <User className="w-4 h-4 mr-2 text-muted-foreground" />
                                Entrevistados (Fase 2)
                            </h3>
                            <span className="bg-accent text-foreground text-xs px-2 py-1 rounded-full font-bold">{interviewCandidates.length}</span>
                        </div>
                        <div className="p-3 flex-1 space-y-3">
                            {interviewCandidates.length === 0 && candidates.length === 0 && (
                                <div className="text-center p-6 text-muted-foreground/50 border-2 border-dashed border-border rounded-lg">
                                    <p className="text-sm">Nenhum candidato processado.</p>
                                    <Link to={getLink('phase2')} className="text-primary hover:underline text-xs mt-2 block">Ir para Entrevistas</Link>
                                </div>
                            )}
                            {interviewCandidates.map((c, idx) => (
                                <Card key={idx} className="hover:bg-accent transition-colors border-border hover:border-primary/20">
                                    <CardContent className="p-4">
                                        <div className="font-semibold text-foreground">{c.name}</div>
                                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.fullPhase2.interviewerConclusion}</div>
                                        <div className="mt-3 flex justify-between items-center">
                                            <span className="text-[10px] px-2 py-1 bg-accent rounded text-foreground/80">Recomendação: {c.fullPhase2.recommendation}</span>
                                            <Link to={getLink('phase3')} className="text-muted-foreground hover:text-primary transition-colors">
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>

                    {/* Column 2 */}
                    <motion.div variants={itemVariants} className="flex-1 flex flex-col bg-blue-500/5 rounded-xl border border-blue-500/10">
                        <div className="p-4 border-b border-blue-500/10 flex justify-between items-center bg-blue-500/5 rounded-t-xl">
                            <h3 className="font-bold text-blue-500 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-blue-500" />
                                Shortlist (Fase 3)
                            </h3>
                            <span className="bg-blue-500/20 text-blue-600 text-xs px-2 py-1 rounded-full font-bold">{shortlistedCandidates.length}</span>
                        </div>
                        <div className="p-3 flex-1 space-y-3">
                            {shortlistedCandidates.length === 0 && shortlist.length === 0 && (
                                <div className="text-center p-6 text-blue-500/30 border-2 border-dashed border-blue-500/10 rounded-lg">
                                    <p className="text-sm">Aguardando seleção.</p>
                                </div>
                            )}
                            {shortlistedCandidates.map((s, idx) => (
                                <Card key={idx} className="bg-card border-blue-500/20 hover:border-blue-500/40 transition-all group">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="font-semibold text-foreground">{s.candidateName}</div>
                                            <span className="text-[10px] font-bold bg-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded">{s.shortlistId}</span>
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                                            <Briefcase className="w-3 h-3 mr-1" />
                                            {s.currentPosition || 'N/A'}
                                        </div>
                                        <div className="mt-3 pt-2 border-t border-border flex justify-between items-center">
                                            <div className="text-[10px] text-muted-foreground">Dados Consolidados</div>
                                            <Link to={getLink('phase4')} className="text-blue-500 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>


                    <motion.div variants={itemVariants} className="flex-1 flex flex-col bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        {/* ... existing Phase 4 content ... */}
                        <div className="p-4 border-b border-emerald-500/10 flex justify-between items-center bg-emerald-500/5 rounded-t-xl">
                            <h3 className="font-bold text-emerald-500 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                                Decisão Final (Fase 4)
                            </h3>
                            <span className="bg-emerald-500/20 text-emerald-600 text-xs px-2 py-1 rounded-full font-bold">{decidedCandidates.length}</span>
                        </div>
                        <div className="p-3 flex-1 space-y-3">
                            {decidedCandidates.length === 0 && (
                                <div className="text-center p-6 text-emerald-500/30 border-2 border-dashed border-emerald-500/10 rounded-lg">
                                    <p className="text-sm">Nenhum relatório final gerado.</p>
                                </div>
                            )}
                            {decidedCandidates.map((d, idx) => (
                                <Card key={idx} className="bg-card border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                                    <CardContent className="p-4">
                                        <div className="font-semibold text-foreground">{d.candidateName}</div>
                                        <div className="text-xs text-emerald-500 mt-1 font-medium">Relatório Executivo Pronto</div>
                                        <p className="text-[10px] text-muted-foreground mt-2 line-clamp-3 italic">
                                            "{d.whyDecision}"
                                        </p>
                                        <div className="mt-3 flex justify-end">
                                            <Link to={getLink('phase4')} className="text-xs font-medium text-emerald-500 hover:text-emerald-600 hover:underline flex items-center">
                                                Ver Relatório
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>

                    {/* Column 4 - Phase 5 */}
                    <motion.div variants={itemVariants} className="flex-1 flex flex-col bg-pink-500/5 rounded-xl border border-pink-500/10">
                        <div className="p-4 border-b border-pink-500/10 flex justify-between items-center bg-pink-500/5 rounded-t-xl">
                            <h3 className="font-bold text-pink-500 flex items-center">
                                <Quote className="w-4 h-4 mr-2 text-pink-500" />
                                Referências (Fase 5)
                            </h3>
                            <span className="bg-pink-500/20 text-pink-600 text-xs px-2 py-1 rounded-full font-bold">
                                {phase5Result ? 1 : 0}
                            </span>
                        </div>
                        <div className="p-3 flex-1 space-y-3">
                            {!phase5Result && (
                                <div className="text-center p-6 text-pink-500/30 border-2 border-dashed border-pink-500/10 rounded-lg">
                                    <p className="text-sm">Nenhuma referência.</p>
                                </div>
                            )}
                            {phase5Result && (
                                <Card className="bg-card border-pink-500/20 hover:border-pink-500/40 transition-all">
                                    <CardContent className="p-4">
                                        <div className="font-semibold text-foreground">{phase5Result.candidateName}</div>
                                        <div className="text-xs text-pink-500 mt-1 font-medium">{phase5Result.references.length} Referências</div>
                                        {phase5Result.references.length > 0 && (
                                            <p className="text-[10px] text-muted-foreground mt-2 line-clamp-3 italic">
                                                "{phase5Result.references[0].polishedText}"
                                            </p>
                                        )}
                                        <div className="mt-3 flex justify-end">
                                            <Link to={getLink('phase5')} className="text-xs font-medium text-pink-500 hover:text-pink-600 hover:underline flex items-center">
                                                Ver Detalhes
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </motion.div>

                </div>
            </motion.div>
        </div>
    );
};

export default DashboardKanban;