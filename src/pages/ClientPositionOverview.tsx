import React from 'react';
import { ReportLayout } from '../components/ReportLayout';
import { Building2, DollarSign, MapPin, Users, Target } from 'lucide-react';
import { AppState } from '../services/persistenceService';

interface Props {
    appState?: AppState;
}

export const ClientPositionOverview: React.FC<Props> = ({ appState }) => {
    const phase1 = appState?.phase1Data;

    // Helper to handle missing data gracefully
    const getText = (text?: string) => text || "Informação não disponível nesta etapa.";

    return (
        <ReportLayout>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                {/* Header */}
                <div className="px-8 md:px-12 py-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                        Sobre a Posição
                    </h1>
                    <p className="text-slate-500 text-sm uppercase tracking-widest">
                        Detalhes Estruturais e Remuneração
                    </p>
                </div>

                {/* Main Content */}
                <div className="px-8 md:px-12 py-12 max-w-7xl mx-auto space-y-8">

                    {/* Section 1: Structure (Reporte, Equipe, Localidade, Objetivos) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Reporte Direto */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="font-bold text-lg">Reporte Direto</h3>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                {getText(phase1?.directReport)}
                            </p>
                        </div>

                        {/* Equipe */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="font-bold text-lg">Equipe</h3>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                {getText(phase1?.teamStructure)}
                            </p>
                        </div>

                        {/* Localidade */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="font-bold text-lg">Localidade</h3>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                {getText(phase1?.location)}
                            </p>
                        </div>

                        {/* Objetivos */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="font-bold text-lg">Objetivos da Posição</h3>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                {getText(phase1?.jobObjectives)}
                            </p>
                        </div>
                    </div>

                    {/* Section 2: Remuneration */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-700 pb-4">
                            <h2 className="text-2xl font-bold">Remuneração e Benefícios</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Modelo de Contratação</p>
                                <p className="text-lg font-medium text-slate-800 dark:text-white">
                                    {getText(phase1?.contractModel)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Salário Fixo Mensal</p>
                                <p className="text-lg font-medium text-slate-800 dark:text-white">
                                    {getText(phase1?.salaryDetails)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Remuneração Variável</p>
                                <p className="text-lg font-medium text-slate-800 dark:text-white">
                                    {getText(phase1?.variableBonus)}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </ReportLayout>
    );
};
