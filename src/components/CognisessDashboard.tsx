/**
 * Cognisess Dashboard Component
 * 
 * Visual dashboard showing personality, competency, and leadership indicators
 * from Cognisess assessments with radar charts and comparison tables.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Cell
} from 'recharts';
import { Brain, Target, Users, Trophy, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import {
    CognisessData,
    CandidateWithCognisess,
    CognisessPersonality,
    CognisessCompetency,
    CognisessLeadership
} from '../types';
import { calculateCategoryAverage, getScoreLevel } from '../services/cognisessParser';

interface CognisessDashboardProps {
    candidates: CandidateWithCognisess[];
    selectedCandidateIndex?: number;
    onSelectCandidate?: (index: number) => void;
}

// Color palette for candidates
const CANDIDATE_COLORS = [
    '#10B981', // emerald-500
    '#3B82F6', // blue-500
    '#8B5CF6', // violet-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#EC4899', // pink-500
];

const SCORE_COLORS = {
    excellent: '#10B981',
    high: '#3B82F6',
    medium: '#F59E0B',
    low: '#F97316',
    critical: '#EF4444'
};

function getScoreColor(score: number): string {
    if (score >= 85) return SCORE_COLORS.excellent;
    if (score >= 70) return SCORE_COLORS.high;
    if (score >= 55) return SCORE_COLORS.medium;
    if (score >= 40) return SCORE_COLORS.low;
    return SCORE_COLORS.critical;
}

/**
 * Score Bar Component
 */
const ScoreBar: React.FC<{ label: string; score: number; maxScore?: number }> = ({
    label,
    score,
    maxScore = 100
}) => {
    const percentage = (score / maxScore) * 100;
    const color = getScoreColor(score);

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium" style={{ color }}>{score}</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                />
            </div>
        </div>
    );
};

/**
 * Category Card Component
 */
const CategoryCard: React.FC<{
    title: string;
    icon: React.ElementType;
    scores: Record<string, number>;
    color: string;
    labels: Record<string, string>;
}> = ({ title, icon: Icon, scores, color, labels }) => {
    const average = calculateCategoryAverage(scores);
    const level = getScoreLevel(average);

    return (
        <Card className="border-none shadow-lg">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
                            <Icon className={`w-5 h-5 text-${color}-500`} style={{ color }} />
                        </div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                    </div>
                    <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                            borderColor: getScoreColor(average),
                            color: getScoreColor(average)
                        }}
                    >
                        {average} - {level.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {Object.entries(scores).map(([key, value]) => (
                    <ScoreBar
                        key={key}
                        label={labels[key] || key}
                        score={value}
                    />
                ))}
            </CardContent>
        </Card>
    );
};

/**
 * Radar Chart for comparing candidates across dimensions
 */
const ComparisonRadar: React.FC<{
    candidates: CandidateWithCognisess[];
    category: 'personality' | 'competency' | 'leadership';
    labels: Record<string, string>;
}> = ({ candidates, category, labels }) => {
    const data = useMemo(() => {
        const keys = Object.keys(labels);
        return keys.map(key => {
            const point: Record<string, any> = { subject: labels[key] };
            candidates.forEach((candidate, idx) => {
                const categoryData = candidate.cognisessData[category] as unknown as Record<string, number>;
                point[candidate.candidateName] = categoryData[key] || 0;
            });
            return point;
        });
    }, [candidates, category, labels]);

    if (candidates.length === 0) return null;

    return (
        <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                />
                <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: '#6B7280', fontSize: 10 }}
                />
                {candidates.map((candidate, idx) => (
                    <Radar
                        key={candidate.candidateName}
                        name={candidate.candidateName}
                        dataKey={candidate.candidateName}
                        stroke={CANDIDATE_COLORS[idx % CANDIDATE_COLORS.length]}
                        fill={CANDIDATE_COLORS[idx % CANDIDATE_COLORS.length]}
                        fillOpacity={0.2}
                        strokeWidth={2}
                    />
                ))}
                <Legend />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1F2937',
                        border: 'none',
                        borderRadius: '8px'
                    }}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
};

/**
 * Overall Score Comparison Bar Chart
 */
const OverallComparison: React.FC<{ candidates: CandidateWithCognisess[] }> = ({ candidates }) => {
    const data = candidates.map((c, idx) => ({
        name: c.candidateName.split(' ')[0], // First name only
        score: c.cognisessData.overallScore || 0,
        color: CANDIDATE_COLORS[idx % CANDIDATE_COLORS.length]
    }));

    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9CA3AF' }} width={80} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1F2937',
                        border: 'none',
                        borderRadius: '8px'
                    }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

/**
 * Labels for each category
 */
const PERSONALITY_LABELS: Record<string, string> = {
    openness: 'Abertura',
    conscientiousness: 'Conscienciosidade',
    extraversion: 'Extroversão',
    agreeableness: 'Amabilidade',
    emotionalStability: 'Estabilidade Emocional'
};

const COMPETENCY_LABELS: Record<string, string> = {
    analyticalThinking: 'Pensamento Analítico',
    problemSolving: 'Resolução de Problemas',
    communication: 'Comunicação',
    teamwork: 'Trabalho em Equipe',
    adaptability: 'Adaptabilidade',
    innovation: 'Inovação'
};

const LEADERSHIP_LABELS: Record<string, string> = {
    strategicVision: 'Visão Estratégica',
    decisionMaking: 'Tomada de Decisão',
    peopleManagement: 'Gestão de Pessoas',
    changeManagement: 'Gestão de Mudanças',
    resultsOrientation: 'Orientação a Resultados',
    influence: 'Influência'
};

/**
 * Main Dashboard Component
 */
export const CognisessDashboard: React.FC<CognisessDashboardProps> = ({
    candidates,
    selectedCandidateIndex = 0,
    onSelectCandidate
}) => {
    const selectedCandidate = candidates[selectedCandidateIndex];

    if (candidates.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center p-12 border-dashed">
                <Brain className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhum Dado Cognisess Disponível
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                    Faça upload dos relatórios Cognisess (Lens Mini, Competência, Liderança)
                    na Fase 4 para visualizar os indicadores.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Overall Scores */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <CardTitle className="text-xl">Dashboard Cognisess</CardTitle>
                    </div>
                    <CardDescription className="text-slate-300">
                        Visão consolidada dos indicadores de personalidade, competência e liderança
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {candidates.map((candidate, idx) => {
                            const score = candidate.cognisessData.overallScore || 0;
                            const level = getScoreLevel(score);

                            return (
                                <motion.div
                                    key={candidate.candidateName}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`p-4 rounded-xl cursor-pointer transition-all ${idx === selectedCandidateIndex
                                        ? 'bg-white/10 ring-2 ring-emerald-500'
                                        : 'bg-white/5 hover:bg-white/10'
                                        }`}
                                    onClick={() => onSelectCandidate?.(idx)}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: CANDIDATE_COLORS[idx % CANDIDATE_COLORS.length] }}
                                        />
                                        <span className="text-sm font-medium truncate">
                                            {candidate.candidateName.split(' ')[0]}
                                        </span>
                                    </div>
                                    <div className="text-3xl font-bold" style={{ color: getScoreColor(score) }}>
                                        {score}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">{level.label}</div>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Candidate Selector Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {candidates.map((candidate, idx) => (
                    <button
                        key={candidate.candidateName}
                        onClick={() => onSelectCandidate?.(idx)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${idx === selectedCandidateIndex
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                            }`}
                    >
                        {candidate.candidateName}
                    </button>
                ))}
            </div>

            {/* Category Cards for Selected Candidate */}
            {selectedCandidate && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CategoryCard
                        title="Personalidade"
                        icon={Brain}
                        scores={selectedCandidate.cognisessData.personality as unknown as Record<string, number>}
                        color="#8B5CF6"
                        labels={PERSONALITY_LABELS}
                    />
                    <CategoryCard
                        title="Competências"
                        icon={Target}
                        scores={selectedCandidate.cognisessData.competency as unknown as Record<string, number>}
                        color="#3B82F6"
                        labels={COMPETENCY_LABELS}
                    />
                    <CategoryCard
                        title="Liderança"
                        icon={Trophy}
                        scores={selectedCandidate.cognisessData.leadership as unknown as Record<string, number>}
                        color="#10B981"
                        labels={LEADERSHIP_LABELS}
                    />
                </div>
            )}

            {/* Comparison Charts */}
            {candidates.length > 1 && (
                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Comparativo entre Candidatos
                        </CardTitle>
                        <CardDescription>
                            Visualização comparativa dos indicadores entre todos os finalistas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-4 text-center">
                                    Personalidade
                                </h4>
                                <ComparisonRadar
                                    candidates={candidates}
                                    category="personality"
                                    labels={PERSONALITY_LABELS}
                                />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-4 text-center">
                                    Competências
                                </h4>
                                <ComparisonRadar
                                    candidates={candidates}
                                    category="competency"
                                    labels={COMPETENCY_LABELS}
                                />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-4 text-center">
                                    Liderança
                                </h4>
                                <ComparisonRadar
                                    candidates={candidates}
                                    category="leadership"
                                    labels={LEADERSHIP_LABELS}
                                />
                            </div>
                        </div>

                        {/* Overall Score Comparison */}
                        <div className="mt-8">
                            <h4 className="text-sm font-medium text-muted-foreground mb-4">
                                Score Geral
                            </h4>
                            <OverallComparison candidates={candidates} />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CognisessDashboard;
