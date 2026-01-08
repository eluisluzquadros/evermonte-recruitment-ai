import React from 'react';
import { ReportLayout } from '../components/ReportLayout';
import { AppState } from '../services/persistenceService';

interface ClientDashboardOverviewProps {
    appState?: AppState;
}

export const ClientDashboardOverview: React.FC<ClientDashboardOverviewProps> = ({ appState }) => {
    // Get real data from appState (Phase 1)
    const phase1 = appState?.phase1Data;

    // Helper to generic text if missing
    const getRobustText = (text?: string, fallbackConfig?: string) => {
        if (text && text.length > 50) return text; // Use text if substantial
        return fallbackConfig || "Análise em andamento. Aguardando processamento da IA...";
    };

    const companyData = {
        companyName: phase1?.companyName || "Empresa Avaliada",
        companyDescription: getRobustText(phase1?.structure, "Análise detalhada da estrutura organizacional não disponível."),
        differentials: getRobustText(phase1?.sectorAndCompetitors, "Análise de setor e concorrência não disponível."),
        jobContext: getRobustText(phase1?.momentContext, "Contexto estratégico da posição não disponível."),
        challenge: getRobustText(phase1?.mainChallenges, "Definição dos desafios estratégicos não disponível.")
    };

    return (
        <ReportLayout>
            <div className="p-8 md:p-12">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 tracking-tight">
                        OVERVIEW
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/40 rounded-full" />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card 1: A Companhia */}
                    <div className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow group">
                        <div className="inline-block bg-muted px-4 py-1.5 rounded-full mb-6">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                                A Companhia
                            </span>
                        </div>
                        <p className="text-foreground leading-relaxed text-sm whitespace-pre-line">
                            {companyData.companyDescription}
                        </p>
                    </div>

                    {/* Card 2: Diferenciais Competitivos */}
                    <div className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow group">
                        <div className="inline-block bg-muted px-4 py-1.5 rounded-full mb-6">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                                Diferenciais Competitivos
                            </span>
                        </div>
                        <p className="text-foreground leading-relaxed text-sm whitespace-pre-line">
                            {companyData.differentials}
                        </p>
                    </div>

                    {/* Card 3: Contexto da Vaga */}
                    <div className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow group">
                        <div className="inline-block bg-muted px-4 py-1.5 rounded-full mb-6">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                                Contexto da Vaga
                            </span>
                        </div>
                        <p className="text-foreground leading-relaxed text-sm whitespace-pre-line">
                            {companyData.jobContext}
                        </p>
                    </div>

                    {/* Card 4: O Desafio */}
                    <div className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow group">
                        <div className="inline-block bg-muted px-4 py-1.5 rounded-full mb-6">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                                O Desafio
                            </span>
                        </div>
                        <p className="text-foreground leading-relaxed text-sm whitespace-pre-line">
                            {companyData.challenge}
                        </p>
                    </div>
                </div>
            </div>
        </ReportLayout>
    );
};
