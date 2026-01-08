import React, { useMemo } from 'react';
import { Phase1Result, Phase2Result, Phase3Result } from '../types';
import { ArrowRight, MapPin, DollarSign, Users, Globe, Briefcase, GraduationCap, Star, BarChart3, PieChart, User, CheckCircle2 } from 'lucide-react';

interface Props {
    phase1: Phase1Result | null;
    candidates: { name: string; fullPhase2: Phase2Result }[];
    shortlist: Phase3Result[];
}

// --- Helper Components for Charts ---

const DonutChart: React.FC<{ percentage: number; color: string; label: string }> = ({ percentage, color, label }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
                    <circle cx="35" cy="35" r={radius} stroke="#374151" strokeWidth="8" fill="transparent" />
                    <circle
                        cx="35"
                        cy="35"
                        r={radius}
                        stroke={color}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                    {percentage}%
                </div>
            </div>
            <span className="text-gray-400 text-xs uppercase mt-2 tracking-wider">{label}</span>
        </div>
    );
};

const BarChart: React.FC<{ label: string; value: number; total: number }> = ({ label, value, total }) => {
    const width = total > 0 ? (value / total) * 100 : 0;
    return (
        <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1 uppercase">
                <span>{label}</span>
                <span>{value}</span>
            </div>
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${width}%` }}></div>
            </div>
        </div>
    );
};

// --- Main Report Component ---

const ClientReport: React.FC<Props> = ({ phase1, candidates, shortlist }) => {
    
    // --- Calculated Metrics for Dashboard ---
    const metrics = useMemo(() => {
        const total = candidates.length;
        const shortlisted = shortlist.length;
        
        const englishLevels = candidates.reduce((acc, c) => {
            const level = c.fullPhase2.englishLevel?.toLowerCase() || 'n/a';
            if (level.includes('avançado') || level.includes('fluente')) acc.high++;
            else if (level.includes('intermediário')) acc.mid++;
            else acc.low++;
            return acc;
        }, { high: 0, mid: 0, low: 0 });

        const reasons = candidates.reduce((acc, c) => {
            const rec = c.fullPhase2.recommendation?.toLowerCase() || '';
            if (rec.includes('tech fit')) acc.tech++;
            if (rec.includes('cultural')) acc.culture++;
            if (rec.includes('inglês')) acc.english++;
            if (rec.includes('stand-by')) acc.standby++;
            return acc;
        }, { tech: 0, culture: 0, english: 0, standby: 0 });

        return {
            total,
            shortlisted,
            englishHighPct: total ? Math.round((englishLevels.high / total) * 100) : 0,
            englishMidPct: total ? Math.round((englishLevels.mid / total) * 100) : 0,
            reasons
        };
    }, [candidates, shortlist]);

    if (!phase1) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-10">
                <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                <p>Relatório indisponível. Conclua a Fase 1 primeiro.</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-slate-100 font-sans report-scroll">
            
            {/* --- PAGE 1: CAPA --- */}
            <section className="min-h-screen flex flex-col relative bg-slate-900 text-white overflow-hidden">
                {/* Background Abstract Visual */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/80"></div>
                
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-12">
                    <div className="mb-8 border-t border-white/30 w-24"></div>
                    <h1 className="text-7xl md:text-9xl font-oswald font-bold tracking-tighter uppercase mb-4 opacity-90">
                        Alinhamento
                    </h1>
                    <h2 className="text-3xl md:text-5xl font-light tracking-widest uppercase text-gray-300 mb-12">
                        {phase1.companyName}
                    </h2>
                    <div className="bg-white/10 backdrop-blur-sm px-8 py-3 rounded-full border border-white/20">
                        <span className="text-xl tracking-widest uppercase">{phase1.jobDetails.split('\n')[0] || 'Posição Executiva'}</span>
                    </div>
                </div>

                <div className="relative z-10 p-12 flex justify-between items-end border-t border-white/10 bg-black/20 backdrop-blur-md">
                    <div>
                        <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Evermonte Executive Search</p>
                        <p className="text-xs text-gray-500">Confidential Report</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-oswald tracking-wide">EVERMONTE</p>
                    </div>
                </div>
            </section>

            {/* --- PAGE 2: OVERVIEW --- */}
            <section className="min-h-screen bg-white p-8 md:p-16 flex flex-col justify-center">
                <h2 className="text-6xl font-oswald font-bold text-slate-900 uppercase mb-16 border-l-8 border-slate-900 pl-6">
                    Overview
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="bg-slate-200 w-fit px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">A Companhia</div>
                        <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                            {phase1.structure || "Informação não disponível."}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="bg-slate-200 w-fit px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">Diferenciais Competitivos</div>
                        <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                            {phase1.sectorAndCompetitors || "Informação não disponível."}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="bg-slate-200 w-fit px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">Contexto da Vaga</div>
                        <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                            {phase1.jobDetails || "Informação não disponível."}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="bg-slate-200 w-fit px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">O Desafio</div>
                        <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                            Objetivo principal é estruturar e escalar a área, garantindo alinhamento cultural e entrega de resultados de curto prazo.
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PAGE 3 & 4: PROFILE DETAILS --- */}
            <section className="min-h-screen bg-slate-50 p-8 md:p-16">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-center text-5xl md:text-7xl font-oswald font-bold text-slate-900 uppercase mb-20">
                        Sobre a Posição
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {/* Card 1 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border-t-4 border-blue-600">
                            <div className="flex items-center justify-center mb-6">
                                <div className="bg-blue-50 p-3 rounded-full">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <h3 className="text-center font-bold text-slate-800 uppercase tracking-wider mb-6">Estrutura</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500 font-medium">Reporte</span>
                                    <span className="text-gray-900 font-bold">Diretoria / CEO</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500 font-medium">Localidade</span>
                                    <span className="text-gray-900 font-bold">Híbrido / Presencial</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500 font-medium">Equipe</span>
                                    <span className="text-gray-900 font-bold">A definir</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border-t-4 border-emerald-600">
                            <div className="flex items-center justify-center mb-6">
                                <div className="bg-emerald-50 p-3 rounded-full">
                                    <DollarSign className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                            <h3 className="text-center font-bold text-slate-800 uppercase tracking-wider mb-6">Remuneração</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500 font-medium">Modelo</span>
                                    <span className="text-gray-900 font-bold">CLT / PJ</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500 font-medium">Fixo</span>
                                    <span className="text-gray-900 font-bold">Competitivo</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500 font-medium">Variável</span>
                                    <span className="text-gray-900 font-bold">Bônus Anual</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border-t-4 border-purple-600">
                            <div className="flex items-center justify-center mb-6">
                                <div className="bg-purple-50 p-3 rounded-full">
                                    <Star className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                            <h3 className="text-center font-bold text-slate-800 uppercase tracking-wider mb-6">Core Skills</h3>
                            <ul className="space-y-3 text-sm text-center">
                                {phase1.idealCoreSkills.map((skill, i) => (
                                    <li key={i} className="bg-gray-50 px-3 py-2 rounded text-gray-700 font-medium">{skill}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PAGE 6: DASHBOARD REPORT --- */}
            <section className="min-h-screen bg-slate-900 text-white p-8 md:p-12 flex flex-col">
                <div className="flex justify-between items-end mb-12 border-b border-gray-700 pb-6">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-oswald font-bold uppercase tracking-tight mb-1">Dashboard Report</h2>
                        <p className="text-gray-400 tracking-widest uppercase text-sm">Mapeamento de Mercado</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-white">{metrics.total}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Profissionais Mapeados</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
                    
                    {/* Column 1: Stats */}
                    <div className="space-y-8">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-6">Taxa de Evolução</h3>
                            <div className="flex items-end gap-4">
                                <div className="text-5xl font-bold text-white">{metrics.shortlisted}</div>
                                <div className="text-sm text-gray-400 mb-2 uppercase">Finalistas (Shortlist)</div>
                            </div>
                            <div className="w-full bg-slate-700 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full" style={{ width: `${(metrics.shortlisted / metrics.total) * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-6">Motivos de Desqualificação</h3>
                            <BarChart label="Tech Fit" value={metrics.reasons.tech} total={metrics.total} />
                            <BarChart label="Cultural Fit" value={metrics.reasons.culture} total={metrics.total} />
                            <BarChart label="Inglês" value={metrics.reasons.english} total={metrics.total} />
                            <BarChart label="Stand-by" value={metrics.reasons.standby} total={metrics.total} />
                        </div>
                    </div>

                    {/* Column 2: Main Chart (Placeholder for salary range or similar) */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col justify-between">
                        <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-4">Faixa de Remuneração (Estimada)</h3>
                        <div className="flex-1 flex items-center justify-center relative">
                            {/* Mock Bar Chart Visualization */}
                            <div className="flex items-end gap-2 h-40 w-full justify-center">
                                <div className="w-8 bg-blue-500/30 h-1/3 rounded-t"></div>
                                <div className="w-8 bg-blue-500/50 h-1/2 rounded-t"></div>
                                <div className="w-8 bg-blue-500/80 h-3/4 rounded-t"></div>
                                <div className="w-8 bg-blue-500 h-full rounded-t relative group">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs px-2 py-1 rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        Target
                                    </div>
                                </div>
                                <div className="w-8 bg-blue-500/60 h-2/3 rounded-t"></div>
                            </div>
                        </div>
                        <div className="text-center text-xs text-gray-500 mt-4">Distribuição salarial do mercado mapeado</div>
                    </div>

                    {/* Column 3: Donuts */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center justify-center">
                            <DonutChart percentage={metrics.englishHighPct} color="#10b981" label="Inglês Avançado" />
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center justify-center">
                            <DonutChart percentage={metrics.englishMidPct} color="#f59e0b" label="Inglês Interm." />
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center justify-center col-span-2">
                            <DonutChart percentage={100} color="#3b82f6" label="Modelo Híbrido" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PAGES 7+: SHORTLIST PROFILES --- */}
            {shortlist.length > 0 ? (
                <section className="bg-slate-800 py-20 px-8">
                    <div className="max-w-6xl mx-auto mb-16 text-center">
                        <span className="text-emerald-400 tracking-widest uppercase text-sm font-bold">Top Talent</span>
                        <h2 className="text-5xl md:text-6xl font-oswald font-bold text-white uppercase mt-2">Shortlist</h2>
                    </div>

                    <div className="space-y-20">
                        {shortlist.map((candidate, idx) => (
                            <div key={idx} className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col md:flex-row min-h-[600px]">
                                {/* Left Panel: Identity */}
                                <div className="w-full md:w-1/3 bg-slate-800 p-8 md:p-12 flex flex-col border-r border-slate-700">
                                    <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center text-6xl font-oswald text-slate-500 mb-8 mx-auto md:mx-0">
                                        {candidate.candidateName.charAt(0)}
                                    </div>
                                    <h3 className="text-3xl font-oswald text-white mb-2">{candidate.candidateName}</h3>
                                    <p className="text-emerald-400 text-sm uppercase tracking-wider font-bold mb-8">Finalista</p>
                                    
                                    <div className="space-y-6 text-sm text-gray-400">
                                        <div>
                                            <span className="block text-xs uppercase tracking-widest text-gray-600 mb-1">Posição Atual</span>
                                            <p className="text-gray-300 font-medium">{candidate.currentPosition}</p>
                                        </div>
                                        <div>
                                            <span className="block text-xs uppercase tracking-widest text-gray-600 mb-1">Localidade</span>
                                            <p className="text-gray-300">{candidate.location} • {candidate.age} anos</p>
                                        </div>
                                        <div>
                                            <span className="block text-xs uppercase tracking-widest text-gray-600 mb-1">Formação</span>
                                            <p className="text-gray-300 leading-relaxed">{candidate.academicHistory}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Panel: Details */}
                                <div className="w-full md:w-2/3 p-8 md:p-12 flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
                                    <div className="grid grid-cols-1 gap-8 h-full">
                                        {/* Upper Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                                                    <Star className="w-4 h-4" /> Principais Projetos
                                                </h4>
                                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {candidate.mainProjects}
                                                </p>
                                            </div>
                                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                                                    <Users className="w-4 h-4" /> Core Skills
                                                </h4>
                                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {candidate.coreSkills}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Lower Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-auto">
                                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Motivações</h4>
                                                <p className="text-gray-300 text-sm leading-relaxed">
                                                    {candidate.motivations}
                                                </p>
                                            </div>
                                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Remuneração</h4>
                                                <p className="text-gray-300 text-sm font-mono">
                                                    {candidate.remunerationPackage}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ) : (
                <section className="bg-slate-800 py-20 text-center text-gray-500">
                    <p>Shortlist ainda não definida.</p>
                </section>
            )}

            {/* --- PAGE 23: MAPPING FUNNEL --- */}
            <section className="min-h-screen bg-white p-8 md:p-16 flex items-center justify-center">
                <div className="w-full max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-6xl font-oswald font-bold text-slate-900 uppercase mb-4 leading-none">
                                Mapeamento<br/>Inicial
                            </h2>
                            <div className="w-20 h-2 bg-slate-900 mb-12"></div>
                            
                            <div className="space-y-4">
                                <div className="bg-slate-100 p-4 rounded-r-full w-full flex justify-between items-center pr-8">
                                    <span className="text-lg font-bold text-slate-700">Aplicações & Hunting</span>
                                    <span className="text-2xl font-bold text-slate-900">--</span>
                                </div>
                                <div className="bg-slate-200 p-4 rounded-r-full w-11/12 flex justify-between items-center pr-8">
                                    <span className="text-lg font-bold text-slate-700">Triagem Prévia</span>
                                    <span className="text-2xl font-bold text-slate-900">{metrics.total}</span>
                                </div>
                                <div className="bg-slate-300 p-4 rounded-r-full w-9/12 flex justify-between items-center pr-8">
                                    <span className="text-lg font-bold text-slate-700">Entrevistas</span>
                                    <span className="text-2xl font-bold text-slate-900">{metrics.total}</span>
                                </div>
                                <div className="bg-slate-900 p-4 rounded-r-full w-6/12 flex justify-between items-center pr-8 shadow-xl">
                                    <span className="text-lg font-bold text-white">Finalistas</span>
                                    <span className="text-2xl font-bold text-emerald-400">{metrics.shortlisted}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 h-full flex flex-col">
                            <h3 className="font-oswald text-2xl font-bold uppercase mb-6 text-slate-800">Primeiras Impressões</h3>
                            <p className="text-gray-600 leading-relaxed mb-8 text-justify">
                                O mercado para esta posição apresenta-se aquecido. Identificamos que os perfis mais aderentes valorizam fortemente a flexibilidade do modelo de trabalho e a clareza no pacote de remuneração variável. A maioria dos candidatos mapeados possui boa proficiência em inglês, o que facilita a expansão internacional.
                            </p>
                            
                            <div className="mt-auto">
                                <h4 className="font-oswald text-xl font-bold uppercase mb-4 text-slate-800">Perfis Mapeados</h4>
                                <div className="space-y-3">
                                    {candidates.slice(0, 3).map((c, i) => (
                                        <div key={i} className="flex items-center text-sm text-gray-600 border-b border-gray-200 pb-2">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full mr-3"></div>
                                            <span className="font-medium mr-2">{c.name}</span>
                                            <span className="text-gray-400 text-xs ml-auto">{c.fullPhase2.currentPosition}</span>
                                        </div>
                                    ))}
                                    {candidates.length > 3 && (
                                        <div className="text-center text-xs text-gray-400 pt-2">
                                            + {candidates.length - 3} outros candidatos
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default ClientReport;