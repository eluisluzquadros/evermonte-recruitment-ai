import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Download, Share2, Printer, ChevronLeft,
    Target, Award, TrendingUp, Users, CheckCircle2,
    Building2, MapPin, Briefcase, Mail, Phone, Calendar
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Phase1Result, Phase2Result, Phase3Result as Phase3Data } from '../types';
import { InteractiveRadarChart } from './charts/InteractiveRadarChart';
import { EnhancedFunnelChart } from './charts/EnhancedFunnelChart';
import { KPICard } from './charts/KPICard';
import { ComparisonChart } from './charts/ComparisonChart';
import { generateMockCognisess, CognisessData } from '../utils/mockCognisess';
import { exportProjectToExcel, ExportProject } from '../utils/excelExporter';

interface ClientReportProps {
    phase1: Phase1Result | null;
    phase2Data: Phase2Result[];
    shortlist: Phase3Data[];
    candidates: any[]; // Phase2Result + extra data
}

export default function ClientReport({ phase1, phase2Data, shortlist, candidates }: ClientReportProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
    const [cognisessData, setCognisessData] = useState<Record<string, CognisessData>>({});

    // Initialize data
    useEffect(() => {
        if (shortlist.length > 0) {
            const mockData: Record<string, CognisessData> = {};
            shortlist.forEach(c => {
                mockData[c.shortlistId] = generateMockCognisess(c.shortlistId);
            });
            setCognisessData(mockData);
            if (!selectedCandidateId) setSelectedCandidateId(shortlist[0].shortlistId);
        }
    }, [shortlist]);

    const selectedCandidate = shortlist.find(c => c.shortlistId === selectedCandidateId);
    const candidateMetrics = selectedCandidateId ? cognisessData[selectedCandidateId] : null;

    // Mock score for now since it's not in Phase3Data
    const getMatchScore = (id: string) => {
        // Deterministic mock based on ID char code? or just random stored?
        // For visual consistency let's just say 90-98
        return 90 + (id.charCodeAt(0) % 9);
    };

    const handleExportExcel = () => {
        if (!phase1 || shortlist.length === 0) return;

        const exportData: ExportProject = {
            companyName: phase1.companyName,
            roleName: phase1.jobDetails ? phase1.jobDetails.split('\n')[0] : "Posição Executiva",
            createdAt: new Date(),
            phase1Data: phase1,
            candidates: candidates,
            shortlist: shortlist,
            phase4Result: null
        };

        exportProjectToExcel(exportData);
    };

    if (!phase1 || shortlist.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                    <TrendingUp className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-serif font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Relatório em Aguardo
                </h3>
                <p className="text-muted-foreground max-w-md">
                    Conclua o processo de Shortlist para gerar o relatório executivo do cliente.
                </p>
            </div>
        );
    }

    const roleName = phase1.jobDetails ? phase1.jobDetails.split('\n')[0] : "Posição Executiva";

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-black/20 pb-20">
            {/* Header Premium */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-black/40 backdrop-blur-md border-b border-slate-200 dark:border-white/10 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-8 bg-emerald-900 dark:bg-emerald-500 rounded-sm flex items-center justify-center">
                                <span className="text-emerald-50 dark:text-emerald-950 font-serif font-bold text-xl">E</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-serif font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                                    Executive Search Report
                                </h1>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                                    {roleName} • {phase1.companyName}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="hidden sm:flex border-slate-200 dark:border-white/10">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                            <Button
                                size="sm"
                                className="bg-emerald-900 hover:bg-emerald-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                onClick={handleExportExcel}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Exportar Excel
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Executive Summary Cards */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        icon={<Users className="w-6 h-6" />}
                        label="Candidatos Finalistas"
                        value={shortlist.length}
                        subtitle={`de ${candidateMetrics?.marketMapping[0]?.count || 124} mapeados`}
                        trend="+12%"
                        trendPositive={true}
                        color="emerald"
                    />

                    <KPICard
                        icon={<TrendingUp className="w-6 h-6" />}
                        label="Taxa de Conversão"
                        value={candidateMetrics ? `${candidateMetrics.marketMapping[candidateMetrics.marketMapping.length - 1].percentage}%` : '3%'}
                        subtitle="Funil completo"
                        description="Mapeados → Finalistas"
                        color="blue"
                    />

                    <KPICard
                        icon={<Calendar className="w-6 h-6" />}
                        label="Prazo Estimado"
                        value="15 dias"
                        target="Meta: 20 dias"
                        trend="+5 dias"
                        trendPositive={true}
                        color="purple"
                    />

                    <KPICard
                        icon={<Target className="w-6 h-6" />}
                        label="Match Médio"
                        value={`${Math.round(shortlist.reduce((acc, c) => acc + getMatchScore(c.shortlistId), 0) / shortlist.length)}%`}
                        subtitle="Alinhamento geral"
                        color="amber"
                    />
                </section>

                {/* Market Mapping Funnel - Full Width */}
                <section>
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50 ring-1 ring-slate-200 dark:ring-white/10">
                        <CardHeader>
                            <CardTitle className="font-serif text-xl">Funil de Mapeamento de Mercado</CardTitle>
                            <CardDescription>Visão completa do processo de seleção</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {candidateMetrics && <EnhancedFunnelChart data={candidateMetrics.marketMapping} showConversionRate={true} />}
                        </CardContent>
                    </Card>
                </section>

                {/* Detailed Analysis Tabs */}
                <Tabs defaultValue="candidates" className="space-y-6">
                    <TabsList className="bg-transparent border-b border-slate-200 dark:border-white/10 w-full justify-start h-auto p-0 rounded-none space-x-8">
                        <TabsTrigger
                            value="candidates"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-none px-0 py-4 font-serif text-lg text-muted-foreground data-[state=active]:text-slate-900 dark:data-[state=active]:text-emerald-400 hover:text-slate-700 transition-colors"
                        >
                            Análise de Candidatos
                        </TabsTrigger>
                        <TabsTrigger
                            value="market"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-none px-0 py-4 font-serif text-lg text-muted-foreground data-[state=active]:text-slate-900 dark:data-[state=active]:text-emerald-400 hover:text-slate-700 transition-colors"
                        >
                            Dados de Mercado
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="candidates" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Sidebar Candidate List */}
                            <div className="lg:col-span-3 space-y-4">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Shortlist ({shortlist.length})</h3>
                                <div className="space-y-2">
                                    {shortlist.map(c => (
                                        <button
                                            key={c.shortlistId}
                                            onClick={() => setSelectedCandidateId(c.shortlistId)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center justify-between group ${selectedCandidateId === c.shortlistId
                                                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-500/30 shadow-sm'
                                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 hover:border-emerald-200 dark:hover:border-emerald-500/20'
                                                }`}
                                        >
                                            <div>
                                                <div className={`font-medium ${selectedCandidateId === c.shortlistId ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {c.candidateName}
                                                </div>
                                                {/* Use currentPosition if available in types, else 'Candidato' */}
                                                <div className="text-xs text-muted-foreground mt-0.5">{c.currentPosition || 'Candidato'}</div>
                                            </div>
                                            {selectedCandidateId === c.shortlistId && (
                                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="lg:col-span-9 space-y-8">
                                {selectedCandidate && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={selectedCandidate.shortlistId}
                                        className="space-y-8"
                                    >
                                        {/* Candidate Header */}
                                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row justify-between md:items-start gap-4">
                                            <div className="flex gap-4">
                                                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-serif text-slate-400">
                                                    {selectedCandidate.candidateName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
                                                        {selectedCandidate.candidateName}
                                                    </h2>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <Briefcase className="w-4 h-4" />
                                                            {selectedCandidate.currentPosition}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="w-4 h-4" />
                                                            {selectedCandidate.location}
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {candidateMetrics && candidateMetrics.lensMini.slice(0, 3).map((tag, i) => (
                                                            <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                                {tag.label}: {tag.score.toFixed(1)}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="text-center">
                                                    <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Match</div>
                                                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                                        {getMatchScore(selectedCandidate.shortlistId)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Deep Analysis Charts */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Competencies Radar */}
                                            <Card className="border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
                                                <CardHeader>
                                                    <CardTitle className="font-serif text-lg">Competências Core</CardTitle>
                                                    <CardDescription>Avaliação baseada no framework Evermonte</CardDescription>
                                                </CardHeader>
                                                <CardContent className="p-6">
                                                    {candidateMetrics && (
                                                        <InteractiveRadarChart
                                                            data={candidateMetrics.competencies}
                                                            height={300}
                                                            color="#10B981" // Emerald
                                                        />
                                                    )}
                                                </CardContent>
                                            </Card>

                                            {/* Leadership Radar */}
                                            <Card className="border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
                                                <CardHeader>
                                                    <CardTitle className="font-serif text-lg">Liderança & Potencial</CardTitle>
                                                    <CardDescription>Análise de prontidão para desafios estratégicos</CardDescription>
                                                </CardHeader>
                                                <CardContent className="p-6">
                                                    {candidateMetrics && (
                                                        <InteractiveRadarChart
                                                            data={candidateMetrics.leadership}
                                                            height={300}
                                                            color="#F59E0B" // Amber/Gold
                                                        />
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* AI Insight Box */}
                                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-6 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800 dark:to-teal-800 rounded-full blur-2xl opacity-50" />

                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                                                        <Award className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                                                    </div>
                                                    <h3 className="font-serif font-bold text-emerald-900 dark:text-emerald-100">
                                                        Destaque do Consultor
                                                    </h3>
                                                </div>
                                                <p className="text-emerald-800 dark:text-emerald-200 leading-relaxed">
                                                    {/* Note: Phase3Data doesn't have justification, using generic or maybe checking extensions */}
                                                    {"Candidato apresenta forte alinhamento com a cultura de inovação da empresa. Seus pontos fortes em Liderança sugerem rápida adaptação ao cargo de gestão."}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="market" className="space-y-6">
                        <Card className="border border-slate-200 dark:border-white/10 shadow-sm">
                            <CardHeader>
                                <CardTitle className="font-serif">Visão Geral do Mercado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center text-muted-foreground p-12">
                                    Funcionalidade de Dados de Mercado Detalhada em Desenvolvimento
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}