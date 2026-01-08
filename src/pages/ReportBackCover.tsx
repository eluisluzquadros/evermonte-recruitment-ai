import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportLayout } from '../components/ReportLayout';
import { TrendingUp, Users, Target, Globe, ChevronLeft } from 'lucide-react';

export const ReportBackCover: React.FC = () => {
    const navigate = useNavigate();

    // Mock data
    const mappingData = {
        title: "MAPEAMENTO INICIAL",
        funnel: {
            mapped: { value: 52, percentage: 100, label: "Mapeados" },
            approached: { value: 2, percentage: 4, label: "Abordados" },
            interviewed: { value: 2, percentage: 4, label: "Entrevistados" },
            finalists: { value: 2, percentage: 4, label: "Finalistas" }
        },
        totalSuccess: "3.8%",
        funnelRange: "52 → 2",
        firstImpressions: {
            title: "PRIMEIRAS IMPRESSÕES",
            description: "O mercado apresenta-se aquecido, com foco em flexibilidade e remuneração variável. A proficiência em inglês é alta, facilitando a expansão internacional.",
            metrics: [
                { icon: TrendingUp, label: "CONVERSÃO", value: "100%" },
                { icon: Globe, label: "INGLÊS", value: "0%" },
                { icon: Users, label: "HÍBRIDO", value: "100%" }
            ]
        },
        topProfiles: [
            {
                name: "Paulo Daunheimer",
                position: "Gerente de Operações na Meta",
                avatar: "PD"
            },
            {
                name: "Saul Souza",
                position: "Gerente de Tecnologia e Desenvolvimento | Gerente de Suporte Técnico",
                avatar: "SS"
            }
        ]
    };

    return (
        <ReportLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
                {/* Header */}
                <div className="border-b border-white/10 bg-slate-950/80 backdrop-blur-lg px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400 mb-1">Relatório</p>
                            <h1 className="text-3xl font-bold">{mappingData.title}</h1>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Voltar ao Dashboard
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="px-8 md:px-12 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left: Funnel */}
                        <div className="bg-slate-800/40 backdrop-blur-sm rounded-3xl p-10 border border-slate-700/50">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-teal-400" />
                                </div>
                                <h2 className="text-2xl font-bold uppercase">Funil de Conversão</h2>
                            </div>

                            {/* Funnel Visualization */}
                            <div className="relative mb-12">
                                {/* Stage 1: Mapeados */}
                                <div className="mb-6">
                                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-6 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent" />
                                        <div className="relative flex items-center justify-between">
                                            <div>
                                                <p className="text-emerald-100 text-sm mb-1">{mappingData.funnel.mapped.label}</p>
                                                <p className="text-4xl font-bold">{mappingData.funnel.mapped.value}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold">{mappingData.funnel.mapped.percentage}%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <div className="text-sm text-slate-400 flex items-center gap-2">
                                            <span className="text-emerald-400">↓</span>
                                            <span>4% conversão</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stage 2: Abordados */}
                                <div className="mb-6 ml-8">
                                    <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-6 relative overflow-hidden" style={{ width: '90%' }}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-transparent" />
                                        <div className="relative flex items-center justify-between">
                                            <div>
                                                <p className="text-teal-100 text-sm mb-1">{mappingData.funnel.approached.label}</p>
                                                <p className="text-3xl font-bold">{mappingData.funnel.approached.value}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold">{mappingData.funnel.approached.percentage}%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <div className="text-sm text-slate-400 flex items-center gap-2">
                                            <span className="text-teal-400">↓</span>
                                            <span>100% conversão</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stage 3: Entrevistados */}
                                <div className="mb-6 ml-16">
                                    <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-2xl p-6 relative overflow-hidden" style={{ width: '80%' }}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent" />
                                        <div className="relative flex items-center justify-between">
                                            <div>
                                                <p className="text-cyan-100 text-sm mb-1">{mappingData.funnel.interviewed.label}</p>
                                                <p className="text-3xl font-bold">{mappingData.funnel.interviewed.value}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold">{mappingData.funnel.interviewed.percentage}%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <div className="text-sm text-slate-400 flex items-center gap-2">
                                            <span className="text-cyan-400">↓</span>
                                            <span>100% conversão</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stage 4: Finalistas */}
                                <div className="ml-24">
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 relative overflow-hidden" style={{ width: '70%' }}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent" />
                                        <div className="relative flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-100 text-sm mb-1">{mappingData.funnel.finalists.label}</p>
                                                <p className="text-3xl font-bold">{mappingData.funnel.finalists.value}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold">{mappingData.funnel.finalists.percentage}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Footer */}
                            <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/30">
                                <div className="grid grid-cols-2 gap-6 text-center">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                                            Taxa de Sucesso Total
                                        </p>
                                        <p className="text-4xl font-bold text-emerald-400">
                                            {mappingData.totalSuccess}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                                            Funil
                                        </p>
                                        <p className="text-2xl font-bold text-blue-400">
                                            {mappingData.funnelRange}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: First Impressions & Top Profiles */}
                        <div className="space-y-8">
                            {/* First Impressions */}
                            <div className="bg-slate-800/40 backdrop-blur-sm rounded-3xl p-10 border border-slate-700/50">
                                <h2 className="text-2xl font-bold uppercase mb-6">
                                    {mappingData.firstImpressions.title}
                                </h2>
                                <p className="text-slate-300 leading-relaxed mb-8">
                                    {mappingData.firstImpressions.description}
                                </p>

                                {/* Metrics */}
                                <div className="grid grid-cols-3 gap-4">
                                    {mappingData.firstImpressions.metrics.map((metric, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/30 text-center"
                                        >
                                            <div className="flex justify-center mb-3">
                                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                                    <metric.icon className="w-6 h-6 text-blue-400" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                                                {metric.label}
                                            </p>
                                            <p className="text-3xl font-bold">
                                                {metric.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Profiles */}
                            <div className="bg-slate-800/40 backdrop-blur-sm rounded-3xl p-10 border border-slate-700/50">
                                <h2 className="text-2xl font-bold uppercase mb-6">
                                    Top Perfis Mapeados
                                </h2>

                                <div className="space-y-4">
                                    {mappingData.topProfiles.map((profile, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-4 p-5 bg-slate-900/60 rounded-2xl border border-slate-700/30 hover:bg-slate-900/80 transition-all cursor-pointer group"
                                            onClick={() => navigate(`/report/candidate/${idx + 1}`)}
                                        >
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                {profile.avatar}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                                                    {profile.name}
                                                </h3>
                                                <p className="text-sm text-slate-400">
                                                    {profile.position}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="mt-12 bg-gradient-to-r from-teal-700 to-emerald-700 rounded-3xl p-12 text-center">
                        <h2 className="text-4xl font-bold mb-4">Próximos Passos</h2>
                        <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
                            Revisão completa dos finalistas e preparação para decisão estratégica final.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/report/finalists')}
                                className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                            >
                                Ver Finalistas
                            </button>
                            <button
                                onClick={() => navigate('/report/comparative')}
                                className="bg-slate-800 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-700 transition-colors border border-white/20"
                            >
                                Relatório Comparativo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 bg-slate-950/80 backdrop-blur-lg px-12 py-8 mt-12">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                        <div>
                            <p className="font-semibold text-white mb-1">Evermonte AI-Headhunter</p>
                            <p className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                Powered by Gemini 3.0 Pro
                            </p>
                        </div>
                        <p>© 2024 Evermonte. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </ReportLayout>
    );
};
