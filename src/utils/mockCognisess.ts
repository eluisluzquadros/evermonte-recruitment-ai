export interface CognisessData {
    lensMini: {
        label: string;
        score: number; // 1-10
        color: string;
    }[];
    competencies: {
        label: string;
        score: number; // 1-10
    }[];
    leadership: {
        label: string;
        score: number; // 1-10
    }[];
    marketMapping: {
        stage: string;
        count: number;
        percentage: number;
    }[];
}

export const generateMockCognisess = (candidateId: string): CognisessData => {
    // Use candidateId to seed randomness if we wanted deterministic results, 
    // but for now simple random is enough for visual dev.

    return {
        lensMini: [
            { label: "Abertura", score: 7.5 + Math.random() * 2, color: "#10B981" }, // Emerald
            { label: "Conscienciosidade", score: 6.5 + Math.random() * 3, color: "#3B82F6" }, // Blue
            { label: "Extroversão", score: 5.0 + Math.random() * 4, color: "#F59E0B" }, // Amber
            { label: "Amabilidade", score: 6.0 + Math.random() * 3, color: "#EC4899" }, // Pink
            { label: "Neuroticismo", score: 2.0 + Math.random() * 3, color: "#6366F1" }, // Indigo
        ],
        competencies: [
            { label: "Resolução de Problemas", score: 7 + Math.random() * 2.5 },
            { label: "Comunicação", score: 6 + Math.random() * 3 },
            { label: "Trabalho em Equipe", score: 8 + Math.random() * 1.5 },
            { label: "Inovação", score: 5 + Math.random() * 4 },
            { label: "Orientação p/ Resultados", score: 7.5 + Math.random() * 2 },
            { label: "Adaptabilidade", score: 6.5 + Math.random() * 3 },
        ],
        leadership: [
            { label: "Visão Estratégica", score: 6 + Math.random() * 3 },
            { label: "Gestão de Pessoas", score: 7 + Math.random() * 2.5 },
            { label: "Influência", score: 6.5 + Math.random() * 3 },
            { label: "Tomada de Decisão", score: 7.5 + Math.random() * 2 },
            { label: "Execução", score: 8 + Math.random() * 1.5 },
        ],
        marketMapping: [
            { stage: "Mapeados", count: 124, percentage: 100 },
            { stage: "Abordados", count: 86, percentage: 69 },
            { stage: "Entrevistados", count: 28, percentage: 22 },
            { stage: "Qualificados", count: 12, percentage: 9 },
            { stage: "Finalistas", count: 4, percentage: 3 },
        ]
    };
};
