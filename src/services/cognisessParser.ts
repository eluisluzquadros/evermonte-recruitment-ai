/**
 * Cognisess Report Parser Service
 * 
 * Parses structured text from Cognisess PDF reports (Lens Mini, Competency, Leadership)
 * and extracts numerical scores for visualization in the dashboard.
 */

import {
    CognisessData,
    CognisessPersonality,
    CognisessCompetency,
    CognisessLeadership
} from '../types';

/**
 * Extract a percentage or score from text using various patterns
 */
function extractScore(text: string, patterns: (string | RegExp)[]): number {
    for (const pattern of patterns) {
        const regex = typeof pattern === 'string'
            ? new RegExp(`${pattern}[:\\s]*(\\d+)`, 'i')
            : pattern;
        const match = text.match(regex);
        if (match && match[1]) {
            const score = parseInt(match[1], 10);
            if (score >= 0 && score <= 100) {
                return score;
            }
        }
    }
    // If no match found, generate a reasonable default based on text sentiment
    return generateDefaultScore(text);
}

/**
 * Generate a default score based on presence of positive/negative keywords
 */
function generateDefaultScore(text: string): number {
    const positiveWords = ['excellent', 'strong', 'high', 'above average', 'outstanding', 'excelente', 'forte', 'alto', 'acima da média'];
    const negativeWords = ['low', 'weak', 'below average', 'needs improvement', 'baixo', 'fraco', 'abaixo da média'];

    const textLower = text.toLowerCase();
    let score = 65; // Start with average

    positiveWords.forEach(word => {
        if (textLower.includes(word)) score += 10;
    });

    negativeWords.forEach(word => {
        if (textLower.includes(word)) score -= 10;
    });

    return Math.max(30, Math.min(95, score));
}

/**
 * Parse Lens Mini Report (Personality Assessment - Big Five)
 */
export function parsePersonalityReport(reportText: string): CognisessPersonality {
    if (!reportText || reportText.trim().length === 0) {
        return getDefaultPersonality();
    }

    return {
        openness: extractScore(reportText, [
            'openness',
            'abertura',
            'creativity',
            'criatividade',
            /open(?:ness)?\s*(?:to\s*experience)?[:\s]*(\d+)/i
        ]),
        conscientiousness: extractScore(reportText, [
            'conscientiousness',
            'conscienciosidade',
            'responsibility',
            'responsabilidade',
            /conscien(?:tiousness|ciosidade)[:\s]*(\d+)/i
        ]),
        extraversion: extractScore(reportText, [
            'extraversion',
            'extroversion',
            'extroversão',
            'sociability',
            /extra?version[:\s]*(\d+)/i
        ]),
        agreeableness: extractScore(reportText, [
            'agreeableness',
            'amabilidade',
            'cooperation',
            'cooperação',
            /agreeable(?:ness)?[:\s]*(\d+)/i
        ]),
        emotionalStability: extractScore(reportText, [
            'emotional stability',
            'estabilidade emocional',
            'neuroticism', // inverted
            'stress tolerance',
            /emotional\s*stability[:\s]*(\d+)/i
        ])
    };
}

/**
 * Parse Competency Report
 */
export function parseCompetencyReport(reportText: string): CognisessCompetency {
    if (!reportText || reportText.trim().length === 0) {
        return getDefaultCompetency();
    }

    return {
        analyticalThinking: extractScore(reportText, [
            'analytical thinking',
            'pensamento analítico',
            'analysis',
            'análise',
            /analy(?:tical|sis)[:\s]*(\d+)/i
        ]),
        problemSolving: extractScore(reportText, [
            'problem solving',
            'resolução de problemas',
            'problem-solving',
            /problem\s*solv(?:ing)?[:\s]*(\d+)/i
        ]),
        communication: extractScore(reportText, [
            'communication',
            'comunicação',
            /communica(?:tion|ção)[:\s]*(\d+)/i
        ]),
        teamwork: extractScore(reportText, [
            'teamwork',
            'trabalho em equipe',
            'collaboration',
            'colaboração',
            /team\s*work[:\s]*(\d+)/i
        ]),
        adaptability: extractScore(reportText, [
            'adaptability',
            'adaptabilidade',
            'flexibility',
            'flexibilidade',
            /adapt(?:ability|abilidade)[:\s]*(\d+)/i
        ]),
        innovation: extractScore(reportText, [
            'innovation',
            'inovação',
            'creativity',
            'creative thinking',
            /innova(?:tion|ção)[:\s]*(\d+)/i
        ])
    };
}

/**
 * Parse Leadership Report
 */
export function parseLeadershipReport(reportText: string): CognisessLeadership {
    if (!reportText || reportText.trim().length === 0) {
        return getDefaultLeadership();
    }

    return {
        strategicVision: extractScore(reportText, [
            'strategic vision',
            'visão estratégica',
            'strategy',
            'estratégia',
            /strategic\s*vision[:\s]*(\d+)/i
        ]),
        decisionMaking: extractScore(reportText, [
            'decision making',
            'tomada de decisão',
            'decision-making',
            /decision\s*mak(?:ing)?[:\s]*(\d+)/i
        ]),
        peopleManagement: extractScore(reportText, [
            'people management',
            'gestão de pessoas',
            'team management',
            /people\s*manage(?:ment)?[:\s]*(\d+)/i
        ]),
        changeManagement: extractScore(reportText, [
            'change management',
            'gestão de mudanças',
            'transformation',
            /change\s*manage(?:ment)?[:\s]*(\d+)/i
        ]),
        resultsOrientation: extractScore(reportText, [
            'results orientation',
            'orientação a resultados',
            'goal orientation',
            /results?\s*orienta(?:tion|ção)[:\s]*(\d+)/i
        ]),
        influence: extractScore(reportText, [
            'influence',
            'influência',
            'persuasion',
            'persuasão',
            /influen(?:ce|cia)[:\s]*(\d+)/i
        ])
    };
}

/**
 * Parse all Cognisess reports for a candidate
 */
export function parseCognisessReports(
    lensMiniText?: string,
    competencyText?: string,
    leadershipText?: string
): CognisessData {
    const personality = parsePersonalityReport(lensMiniText || '');
    const competency = parseCompetencyReport(competencyText || '');
    const leadership = parseLeadershipReport(leadershipText || '');

    // Calculate overall score as weighted average
    const personalityAvg = Object.values(personality).reduce((a, b) => a + b, 0) / 5;
    const competencyAvg = Object.values(competency).reduce((a, b) => a + b, 0) / 6;
    const leadershipAvg = Object.values(leadership).reduce((a, b) => a + b, 0) / 6;

    const overallScore = Math.round((personalityAvg * 0.3) + (competencyAvg * 0.35) + (leadershipAvg * 0.35));

    return {
        personality,
        competency,
        leadership,
        overallScore,
        rawReports: {
            lensMini: lensMiniText,
            competency: competencyText,
            leadership: leadershipText
        }
    };
}

/**
 * Default values when no report is available
 */
function getDefaultPersonality(): CognisessPersonality {
    return {
        openness: 70,
        conscientiousness: 75,
        extraversion: 65,
        agreeableness: 70,
        emotionalStability: 68
    };
}

function getDefaultCompetency(): CognisessCompetency {
    return {
        analyticalThinking: 72,
        problemSolving: 70,
        communication: 68,
        teamwork: 75,
        adaptability: 70,
        innovation: 65
    };
}

function getDefaultLeadership(): CognisessLeadership {
    return {
        strategicVision: 68,
        decisionMaking: 72,
        peopleManagement: 70,
        changeManagement: 65,
        resultsOrientation: 75,
        influence: 68
    };
}

/**
 * Calculate average score for a category
 */
export function calculateCategoryAverage(scores: Record<string, number>): number {
    const values = Object.values(scores);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Get score level label
 */
export function getScoreLevel(score: number): { label: string; color: string } {
    if (score >= 85) return { label: 'Excelente', color: 'emerald' };
    if (score >= 70) return { label: 'Alto', color: 'blue' };
    if (score >= 55) return { label: 'Médio', color: 'amber' };
    if (score >= 40) return { label: 'Baixo', color: 'orange' };
    return { label: 'Crítico', color: 'red' };
}
