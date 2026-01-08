import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReportLayout } from '../components/ReportLayout';
import { MapPin, Clock, Globe, Download, Calendar, CheckCircle, ExternalLink, Heart, DollarSign, School, Briefcase, Rocket, Brain, AlertCircle, Quote, Users } from 'lucide-react';

interface Project {
    title: string;
    tags: string[];
    tagColor: string;
    description: string;
    achievements: string[];
}

interface CandidateDeepData {
    id: number;
    name: string;
    position: string;
    badges: { label: string; color: string }[];
    location: string;
    experience: string;
    languages: string;
    education: {
        degree: string;
        institution: string;
        period: string;
        highlighted?: boolean;
    }[];
    professionalExperience: {
        title: string;
        company: string;
        period: string;
        duration: string;
        description: string;
        highlighted?: boolean;
    }[];
    projects: Project[];
    coreSkills: {
        name: string;
        level: string;
        value: number;
    }[];
    softSkills: string[];
    motivations: {
        quote: string;
        items: string[];
    };
    compensation: {
        monthlySalary: string;
        annualBonus: string;
        equity: string;
        vestingProgress: number;
        note: string;
    };
    references?: {
        sourceName: string;
        polishedText: string;
        isPositive: boolean;
    }[];
    cvText?: string;

}

import { Phase1Result, Phase2Result, Phase3Result, Phase4Result, Phase5Result } from '../types';

interface AppState {
    phase1Data: Phase1Result | null;
    candidates: { name: string; cvText: string; fullPhase2: Phase2Result }[];
    shortlist: Phase3Result[];
    phase4Result: Phase4Result | null;
    phase5Result: Phase5Result | null;
}

interface Props {
    appState?: AppState;
}

export const ClientCandidateDetail: React.FC<Props> = ({ appState }) => {
    const { id, projectId } = useParams<{ id: string, projectId: string }>();
    const navigate = useNavigate();

    // Helper to find shortlist data
    const getShortlistData = (name: string) => appState?.shortlist.find(s => s.candidateName === name);

    const candidates: CandidateDeepData[] = appState?.candidates.map((c, index) => {
        const shortlistData = getShortlistData(c.name);
        const projects = c.fullPhase2.mainProjects
            ? c.fullPhase2.mainProjects.split('\n').filter(p => p.trim().length > 0).map((p, i) => ({
                title: `Projeto ${i + 1}`,
                tags: ["PROJETO"],
                tagColor: "blue",
                description: p,
                achievements: []
            }))
            : [];

        const education = shortlistData?.academicHistory
            ? shortlistData.academicHistory.split('\n').map(e => ({
                degree: e,
                institution: "Instituição não informada",
                period: "Periodo não informado"
            }))
            : [{ degree: "Formação não detalhada", institution: "-", period: "-" }];

        const experience = shortlistData?.professionalExperience
            ? shortlistData.professionalExperience.split('\n').map((e, i) => ({
                title: `Experiência ${i + 1}`,
                company: e,
                period: "Periodo não informado",
                duration: "",
                description: c.fullPhase2.experience || "Sem detalhes adicionais."
            }))
            : [{ title: "Experiência Geral", company: c.fullPhase2.experience || "Não informado", period: "-", duration: "-", description: "" }];

        return {
            id: index,
            name: c.name,
            position: c.fullPhase2.currentPosition || "Posição não informada",
            badges: c.fullPhase2.recommendation === "Aprovado" ? [{ label: "FINALISTA", color: "green" }] : [{ label: "AVALIADO", color: "gray" }],
            location: shortlistData?.location || "Localização não informada",
            experience: "Experiência Sênior", // Placeholder
            languages: c.fullPhase2.englishLevel || "Português",
            education: education,
            professionalExperience: experience,
            projects: projects.length > 0 ? projects : [{ title: "Sem projetos detalhados", tags: [], tagColor: "gray", description: c.fullPhase2.mainProjects || "Nenhum projeto listado.", achievements: [] }],
            coreSkills: c.fullPhase2.coreSkills ? c.fullPhase2.coreSkills.split(',').map(s => ({ name: s.trim(), level: "N/A", value: 80 })) : [],
            softSkills: c.fullPhase2.communication ? ["Comunicação: " + c.fullPhase2.communication] : [],
            motivations: {
                quote: c.fullPhase2.motivation || "Motivação não registrada.",
                items: []
            },
            compensation: {
                monthlySalary: c.fullPhase2.remuneration || "A combinar",
                annualBonus: "-",
                equity: "-",
                vestingProgress: 0,
                note: shortlistData?.remunerationPackage || ""
            },
            references: appState?.phase5Result?.candidateName === c.name
                ? appState.phase5Result.references.map(r => ({
                    sourceName: r.sourceName,
                    polishedText: r.polishedText,
                    isPositive: r.isPositive
                }))
                : [],
            cvText: c.cvText
        };
    }) || [];

    // Mock candidate for demo when no data available
    const mockCandidate: CandidateDeepData = {
        id: 0,
        name: 'Saul Souza',
        position: 'Diretor de Operações',
        badges: [{ label: 'FINALISTA', color: 'green' }],
        location: 'São Paulo, SP',
        experience: '15+ anos de experiência',
        languages: 'Português, Inglês (Fluente)',
        education: [
            { degree: 'MBA em Gestão Empresarial', institution: 'FGV', period: '2015-2017', highlighted: true },
            { degree: 'Engenharia de Produção', institution: 'USP', period: '2005-2009' }
        ],
        professionalExperience: [
            { title: 'Diretor de Operações', company: 'TechCorp Solutions', period: '2020-Presente', duration: '4 anos', description: 'Liderança de equipes multidisciplinares com foco em otimização de processos.', highlighted: true },
            { title: 'Gerente Sênior', company: 'FinMinds Inc.', period: '2015-2020', duration: '5 anos', description: 'Gestão de projetos estratégicos e expansão de mercado.' }
        ],
        projects: [
            { title: 'Transformação Digital', tags: ['ESTRATÉGIA', 'TECH'], tagColor: 'blue', description: 'Liderou iniciativa de transformação digital resultando em 40% de aumento em eficiência.', achievements: ['Redução de custos operacionais em 25%', 'Implementação de CRM integrado'] }
        ],
        coreSkills: [
            { name: 'Liderança Estratégica', level: 'Expert', value: 95 },
            { name: 'Gestão de Projetos', level: 'Avançado', value: 90 },
            { name: 'Análise de Dados', level: 'Avançado', value: 85 }
        ],
        softSkills: ['Comunicação', 'Negociação', 'Resolução de Conflitos', 'Visão Sistêmica'],
        motivations: {
            quote: 'Busco desafios que me permitam criar impacto real e desenvolver equipes de alta performance.',
            items: ['Crescimento profissional', 'Inovação', 'Liderança transformacional']
        },
        compensation: {
            monthlySalary: 'R$ 35.000',
            annualBonus: '4-6 salários',
            equity: '0.5% em vesting',
            vestingProgress: 50,
            note: 'Aberto a negociação baseada no pacote total'
        }
    };

    const candidateId = parseInt(id || "0");
    const candidate = candidates.length > 0
        ? (candidates.find(c => c.id === candidateId) || candidates[0])
        : mockCandidate;

    return (
        <ReportLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header with Breadcrumb */}
                <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
                    <nav className="flex items-center text-sm text-gray-500">
                        <button onClick={() => navigate(`/projects/${projectId}/report/finalists`)} className="hover:text-blue-600 transition-colors">
                            Dashboard
                        </button>
                        <span className="mx-2">›</span>
                        <span className="hover:text-blue-600 transition-colors cursor-pointer">Processo: Head of Technology</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-900 font-medium">{candidate.name.split(' ')[0]} {candidate.name.split(' ')[candidate.name.split(' ').length - 1]}.</span>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
                    {/* Profile Header Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-gray-800 flex items-center justify-center relative overflow-hidden group border border-gray-300">
                                    <span className="text-5xl md:text-6xl font-thin text-gray-400 group-hover:scale-110 transition-transform duration-500">
                                        {candidate.name.charAt(0)}
                                    </span>
                                    <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white"></div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-grow flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                                        <div>
                                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-1">
                                                {candidate.name}
                                            </h2>
                                            <p className="text-lg text-gray-500 font-medium">{candidate.position}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {candidate.badges.map((badge, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`px-3 py-1 rounded-full text-sm font-semibold border ${badge.color === 'green'
                                                        ? 'bg-green-100 text-green-700 border-green-200'
                                                        : 'bg-blue-100 text-blue-700 border-blue-200'
                                                        }`}
                                                >
                                                    {badge.label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-4">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            {candidate.location}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {candidate.experience}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Globe className="w-4 h-4" />
                                            {candidate.languages}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            const content = candidate.cvText || (candidate as any).fullPhase2?.experience || "Informações de currículo não disponíveis.";
                                            const element = document.createElement("a");
                                            const file = new Blob([content], { type: 'text/plain' });
                                            const url = URL.createObjectURL(file);
                                            element.href = url;
                                            element.download = `Evermonte-CV-${candidate.name.replace(/\s+/g, '_')}.txt`;
                                            document.body.appendChild(element);
                                            element.click();
                                            setTimeout(() => {
                                                document.body.removeChild(element);
                                                URL.revokeObjectURL(url);
                                            }, 100);
                                        }}
                                        className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2.5 px-4 rounded-lg font-medium transition-all text-sm border border-gray-200">
                                        <Download className="w-4 h-4" />
                                        Baixar Currículo Completo
                                    </button>
                                    <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all text-sm shadow-lg shadow-blue-500/20">
                                        <Calendar className="w-4 h-4" />
                                        Agendar Entrevista Final
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Three Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column: Education + Experience */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {/* Education */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 h-fit">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                    <School className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold text-gray-900">Formação Acadêmica</h3>
                                </div>

                                <div className="space-y-4">
                                    {candidate.education.map((edu, idx) => (
                                        <div key={idx} className={`relative pl-4 border-l-2 ${edu.highlighted ? 'border-blue-500' : 'border-gray-200'}`}>
                                            <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${edu.highlighted ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                                            <h4 className="text-sm font-bold text-gray-800">{edu.degree}</h4>
                                            <p className="text-xs text-gray-500">{edu.institution}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{edu.period}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Professional Experience */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex-grow">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold text-gray-900">Experiência Profissional</h3>
                                </div>

                                <div className="space-y-6">
                                    {candidate.professionalExperience.map((exp, idx) => (
                                        <div key={idx} className="group">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-gray-800">{exp.title}</h4>
                                                {exp.highlighted && (
                                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 border border-gray-200">
                                                        {exp.duration}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-blue-600 font-medium mb-1">{exp.company}</p>
                                            <p className="text-xs text-gray-500 mb-2">{exp.period} • {exp.duration}</p>
                                            <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
                                            {idx < candidate.professionalExperience.length - 1 && (
                                                <div className="mt-4 border-t border-dashed border-gray-200"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Center Column: Projects */}
                        <div className="lg:col-span-4 flex flex-col">
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 h-full">
                                <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                                    <Rocket className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold text-gray-900">Principais Projetos</h3>
                                </div>

                                <div className="space-y-8">
                                    {candidate.projects.map((project, idx) => (
                                        <article key={idx}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-lg text-gray-800">{project.title}</h4>
                                                <ExternalLink className="w-4 h-4 text-gray-400" />
                                            </div>

                                            <div className="mb-3 flex flex-wrap gap-2">
                                                {project.tags.map((tag, tagIdx) => (
                                                    <span
                                                        key={tagIdx}
                                                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${project.tagColor === 'orange'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : project.tagColor === 'purple'
                                                                ? 'bg-purple-100 text-purple-700'
                                                                : 'bg-indigo-100 text-indigo-700'
                                                            }`}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <p className="text-sm text-gray-600 leading-relaxed mb-3">{project.description}</p>

                                            <ul className="space-y-1 text-sm text-gray-500">
                                                {project.achievements.map((achievement, achIdx) => (
                                                    <li key={achIdx} className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                        <span>{achievement}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {idx < candidate.projects.length - 1 && (
                                                <div className="mt-6 border-t border-gray-200"></div>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Skills + Motivations + Compensation */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {/* Core Skills */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
                                    <Brain className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold text-gray-900">Core Skills</h3>
                                </div>

                                <div className="space-y-4">
                                    {candidate.coreSkills.map((skill, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                                                <span className="text-xs font-bold text-blue-600">{skill.level}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${skill.value}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 mt-2 flex flex-wrap gap-2">
                                    {candidate.softSkills.map((skill, idx) => (
                                        <span key={idx} className="px-3 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600 border border-gray-200">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Motivations */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                    <Heart className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold text-gray-900">Motivações</h3>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <p className="text-sm italic text-gray-700 leading-relaxed mb-3">
                                        "{candidate.motivations.quote}"
                                    </p>
                                    <div className="flex flex-col gap-2 mt-2">
                                        {candidate.motivations.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* References - Display if available */}
                            {candidate.references && candidate.references.length > 0 && (
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <h3 className="font-bold text-gray-900">Referências</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {candidate.references.map((ref, idx) => (
                                            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${ref.isPositive
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-rose-100 text-rose-700'
                                                        }`}>
                                                        {ref.sourceName || "Referência"}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Quote className="w-4 h-4 text-slate-300 flex-shrink-0" />
                                                    <p className="text-sm italic text-gray-600 dark:text-gray-300">
                                                        {ref.polishedText}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Compensation */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex-grow">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold text-gray-900">Pacote Atual</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Salário Mensal</p>
                                        <p className="text-lg font-bold text-gray-900 mt-1">{candidate.compensation.monthlySalary}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Bônus Anual</p>
                                        <p className="text-lg font-bold text-gray-900 mt-1">{candidate.compensation.annualBonus}</p>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Equity / Stock Options</p>
                                    <p className="text-base font-medium text-gray-800 mt-1">{candidate.compensation.equity}</p>
                                    {candidate.compensation.vestingProgress > 0 && (
                                        <>
                                            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                                                <div className="bg-green-500 h-1 rounded-full" style={{ width: `${candidate.compensation.vestingProgress}%` }}></div>
                                            </div>
                                            <p className="text-[10px] text-right text-gray-400 mt-1">{candidate.compensation.vestingProgress}% Vested</p>
                                        </>
                                    )}
                                </div>

                                <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-100">
                                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <span>{candidate.compensation.note}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ReportLayout>
    );
};
