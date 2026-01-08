import React from 'react';
import { ReportLayout } from '../components/ReportLayout';
import { FileText, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { AppState } from '../services/persistenceService';

interface Props {
    appState?: AppState;
}

export const ClientComparativeReport: React.FC<Props> = ({ appState }) => {
    // Get Phase 4 Data
    const phase4 = appState?.phase4Result;
    const candidates = phase4?.candidates || [];

    if (!phase4 || candidates.length === 0) {
        return (
            <ReportLayout>
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Simulação de Cenários não disponível</h2>
                        <p className="text-slate-600">
                            A análise de decisão (Phase 4) ainda não foi concluída para este projeto.
                            Por favor, conclua o processo de avaliação para visualizar os cenários.
                        </p>
                    </div>
                </div>
            </ReportLayout>
        );
    }

    return (
        <ReportLayout>
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white px-8 md:px-12 py-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-4 mb-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                                    Simulação de Cenários
                                </h1>
                                <p className="text-teal-100 text-lg">
                                    Análise preditiva para tomada de decisão estratégica.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-screen-2xl mx-auto px-8 md:px-12 py-12">

                    {/* Intro Section from Phase 4 */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-12">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Introdução Comparativa</h3>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {phase4.introduction || "Introdução não disponível."}
                        </p>
                    </div>

                    {/* Comparison Table */}
                    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden mb-12">
                        <div className="bg-slate-800 px-8 py-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                Comparativo de Tomada de Decisão
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="border-b-2 border-slate-200 bg-slate-50">
                                        <th className="text-left py-6 px-6 text-sm font-bold text-slate-600 uppercase tracking-wider w-1/4">
                                            Dimensão
                                        </th>
                                        {candidates.map((candidate, idx) => (
                                            <th key={idx} className={`text-left py-6 px-6 text-lg font-bold ${idx === 0 ? 'text-amber-700' : 'text-blue-700'} w-1/3`}>
                                                {candidate.candidateName}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Row 1: Sumário Executivo */}
                                    <tr className="border-b border-slate-100">
                                        <td className="py-8 px-6 align-top">
                                            <div>
                                                <p className="font-bold text-slate-900 mb-1 text-lg">SUMÁRIO EXECUTIVO</p>
                                                <p className="text-sm text-slate-500">
                                                    Sintese do perfil e potencial
                                                </p>
                                            </div>
                                        </td>
                                        {candidates.map((candidate, idx) => (
                                            <td key={idx} className="py-8 px-6 align-top">
                                                <div className={`rounded-xl p-5 text-sm text-slate-700 leading-relaxed ${idx === 0 ? 'bg-amber-50' : 'bg-blue-50'}`}>
                                                    {candidate.executiveSummary}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Row 2: O Cenário de Decisão */}
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <td className="py-8 px-6 align-top">
                                            <div>
                                                <p className="font-bold text-slate-900 mb-1 text-lg">CENÁRIO DE DECISÃO</p>
                                                <p className="text-sm text-slate-500">
                                                    Em qual contexto este perfil brilha
                                                </p>
                                            </div>
                                        </td>
                                        {candidates.map((candidate, idx) => (
                                            <td key={idx} className="py-8 px-6 align-top">
                                                <div className={`rounded-xl p-5 border-l-4 shadow-sm ${idx === 0 ? 'bg-white border-amber-400' : 'bg-white border-blue-400'}`}>
                                                    <p className="font-bold mb-2 text-slate-800">Cenário Ideal:</p>
                                                    <p className="text-sm text-slate-700 italic">
                                                        "{candidate.decisionScenario}"
                                                    </p>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Row 3: O Porquê do Cenário */}
                                    <tr className="border-b border-slate-100">
                                        <td className="py-8 px-6 align-top">
                                            <div>
                                                <p className="font-bold text-slate-900 mb-1 text-lg">JUSTIFICATIVA</p>
                                                <p className="text-sm text-slate-500">
                                                    Por que este cenário se aplica
                                                </p>
                                            </div>
                                        </td>
                                        {candidates.map((candidate, idx) => (
                                            <td key={idx} className="py-8 px-6 align-top">
                                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                    {candidate.whyDecision}
                                                </p>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </ReportLayout>
    );
};
