import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportLayout } from '../components/ReportLayout';
import { AppState } from '../services/persistenceService';
import { Users, Target, ClipboardList } from 'lucide-react';

interface Props {
    appState?: AppState;
}

export const ReportCover: React.FC<Props> = ({ appState }) => {
    const navigate = useNavigate();
    const phase1 = appState?.phase1Data;
    const candidates = appState?.candidates || [];
    const shortlist = appState?.shortlist || [];
    const funnelData = appState?.funnelData;

    // Report Data
    const reportData = {
        subtitle: "RELATÓRIO EXECUTIVO",
        companyName: appState?.projectInfo?.companyName || phase1?.companyName || "Empresa Avaliada",
        position: appState?.projectInfo?.roleName || phase1?.jobObjectives?.split('.')[0] || "Posição em Aberto",
        reportDate: new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }),
        jobObjectives: phase1?.jobObjectives || "Objetivos não definidos.",

        // Funnel Stats
        funnelStats: {
            mapped: funnelData?.mapped || 52,
            approached: funnelData?.approached || 2,
            interviews: candidates.length || 2,
            finalists: shortlist.length || candidates.length || 2
        }
    };

    const calculatePercentage = (value: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    const calculateConversion = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return Math.round((current / previous) * 100);
    };

    const mappedPct = 100;
    const approachedPct = calculatePercentage(reportData.funnelStats.approached, reportData.funnelStats.mapped);
    const interviewsPct = calculatePercentage(reportData.funnelStats.interviews, reportData.funnelStats.mapped);
    const finalistsPct = calculatePercentage(reportData.funnelStats.finalists, reportData.funnelStats.mapped);

    const conv1 = calculateConversion(reportData.funnelStats.approached, reportData.funnelStats.mapped);
    const conv2 = calculateConversion(reportData.funnelStats.interviews, reportData.funnelStats.approached);
    const conv3 = calculateConversion(reportData.funnelStats.finalists, reportData.funnelStats.interviews);

    return (
        <ReportLayout>
            <div className="min-h-screen bg-background text-foreground flex flex-col justify-between transition-colors duration-300">

                {/* Header */}
                <div className="px-12 py-12 border-b border-border flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <span className="text-slate-900 font-bold text-lg">E</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-xl tracking-tight">Evermonte</h1>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">AI-Headhunter</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="px-12 py-12 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full">
                    {/* Title Block */}
                    <div className="mb-16">
                        <p className="text-amber-500 uppercase tracking-[0.3em] text-sm font-bold mb-6">
                            {reportData.subtitle}
                        </p>
                        <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight tracking-tight text-foreground">
                            {reportData.companyName}
                        </h1>
                        <p className="text-3xl text-muted-foreground font-light">
                            Processo Seletivo: <span className="text-foreground font-semibold">{reportData.position}</span>
                        </p>
                        <p className="text-muted-foreground mt-4 text-lg">
                            {reportData.reportDate}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                        {/* Column 1: Executive Summary */}
                        <div className="space-y-8">
                            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm h-full">
                                <h2 className="text-2xl font-bold border-l-4 border-amber-500 pl-4 mb-6 text-foreground">
                                    Principais Resultados
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-lg">
                                    {reportData.jobObjectives}
                                </p>
                            </div>
                        </div>

                        {/* Column 2: Funnel */}
                        <div className="rounded-3xl p-8 bg-card border border-border shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-teal-500" />
                                </div>
                                <h2 className="text-2xl font-bold uppercase text-foreground">Funil de Conversão</h2>
                            </div>

                            <div className="relative mb-12">
                                {/* Stage 1: Mapeados */}
                                <div className="mb-6">
                                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-6 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent" />
                                        <div className="relative flex items-center justify-between text-white">
                                            <div>
                                                <p className="text-emerald-100 text-sm mb-1">Mapeados</p>
                                                <p className="text-4xl font-bold">{reportData.funnelStats.mapped}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold">{mappedPct}%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span className="text-emerald-500">↓</span>
                                            <span>{conv1}% conversão</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stage 2: Abordados */}
                                <div className="mb-6 ml-8">
                                    <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-6 relative overflow-hidden" style={{ width: '90%' }}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-transparent" />
                                        <div className="relative flex items-center justify-between text-white">
                                            <div>
                                                <p className="text-teal-100 text-sm mb-1">Abordados</p>
                                                <p className="text-3xl font-bold">{reportData.funnelStats.approached}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold">{approachedPct}%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span className="text-teal-500">↓</span>
                                            <span>{conv2}% conversão</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stage 3: Entrevistados */}
                                <div className="mb-6 ml-16">
                                    <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-2xl p-6 relative overflow-hidden" style={{ width: '80%' }}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent" />
                                        <div className="relative flex items-center justify-between text-white">
                                            <div>
                                                <p className="text-cyan-100 text-sm mb-1">Entrevistados</p>
                                                <p className="text-3xl font-bold">{reportData.funnelStats.interviews}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold">{interviewsPct}%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span className="text-cyan-500">↓</span>
                                            <span>{conv3}% conversão</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stage 4: Finalistas */}
                                <div className="ml-24">
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 relative overflow-hidden" style={{ width: '70%' }}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent" />
                                        <div className="relative flex items-center justify-between text-white">
                                            <div>
                                                <p className="text-blue-100 text-sm mb-1">Finalistas</p>
                                                <p className="text-3xl font-bold">{reportData.funnelStats.finalists}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold">{finalistsPct}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Full-Width: Top Perfil Analisados */}
                <div className="px-12 py-8">
                    <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <ClipboardList className="w-6 h-6 text-blue-500" />
                            <h2 className="text-xl font-bold text-foreground">Top Perfil Analisados</h2>
                        </div>
                        {candidates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {candidates.slice(0, 3).map((candidate, idx) => (
                                    <div key={idx} className="bg-accent/50 rounded-2xl p-6 border border-border hover:border-primary/20 transition-all">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-lg font-bold text-blue-500">
                                                {idx + 1}
                                            </div>
                                            <p className="font-semibold text-foreground">{candidate.name}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{candidate.interviewReport?.substring(0, 100)}...</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">Nenhum candidato finalista adicionado ainda.</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-12 py-8 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                    <p>© 2024 Evermonte AI-Headhunter</p>
                    <p className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Confidential Report
                    </p>
                </div>
            </div>
        </ReportLayout>
    );
};
