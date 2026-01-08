export enum Phase {
  ALIGNMENT = 'ALIGNMENT',
  INTERVIEW = 'INTERVIEW',
  SHORTLIST = 'SHORTLIST',
  DECISION = 'DECISION',
  REFERENCES = 'REFERENCES'
}

export interface Phase1Result {
  companyName: string; // ESTRUTURA DA EMPRESA (Derived implicitly or explicit)
  structure: string; // 1. ESTRUTURA DA EMPRESA
  sectorAndCompetitors: string; // 2. SETOR, CONCORRÊNCIA E DIFERENCIAIS COMPETITIVOS
  momentContext: string; // 3. MOMENTO / CONTEXTO DA EMPRESA
  mainChallenges: string; // 4. PRINCIPAIS DESAFIOS ATUAIS DA EMPRESA
  jobObjectives: string; // 5. PRINCIPAIS OBJETIVOS E DESAFIOS DA VAGA
  directReport: string; // 6. REPORTE DIRETO
  teamStructure: string; // 7. EQUIPE
  location: string; // 8. LOCALIDADE
  contractModel: string; // 9. MODELO DE CONTRATAÇÃO
  salaryDetails: string; // 10. SALÁRIO FIXO MENSAL
  variableBonus: string; // 11. REMUNERAÇÃO VARIÁVEL
  idealExperience: string; // 12. EXPERIÊNCIA PROFISSIONAL IDEAL DO EXECUTIVO
  academicBackground: string; // 13. HISTÓRICO ACADÊMICO IDEAL DO EXECUTIVO
  idealCoreSkills: string[]; // 14, 15, 16. CORE SKILL IDEAL 1, 2, 3
  specificRequirements: string; // 17. REQUISITOS ESPECÍFICOS PARA O EXECUTIVO
  jobDetails: string; // Kept for backward compatibility if needed, or alias to jobObjectives
}

export interface Phase2Result {
  candidateName: string;
  currentPosition: string; // Added field
  interviewerConclusion: string;
  experience: string;
  mainProjects: string;
  motivation: string;
  mobility: string;
  englishLevel: string;
  remuneration: string;
  communication: string;
  coreSkills: string;
  recommendation: string;
}

export interface Phase3Result {
  shortlistId: string; // Coluna "SHORTLIST" (ex: Candidato 1)
  candidateName: string; // Coluna "CANDIDATO"
  age: string; // Coluna "IDADE"
  currentPosition: string; // Coluna "POSIÇÃO ATUAL"
  location: string; // Coluna "LOCALIDADE"
  academicHistory: string; // Coluna "HISTÓRICO ACADÊMICO"
  professionalExperience: string; // Coluna "EXPERIÊNCIA PROFISSIONAL"
  mainProjects: string; // Coluna "PRINCIPAIS PROJETOS DA CARREIRA"
  remunerationPackage: string; // Coluna "PACOTE DE REMUNERAÇÃO ATUAL"
  coreSkills: string; // Coluna "CORE SKILLS"
  motivations: string; // Coluna "MOTIVAÇÕES"
}

export interface Phase4CandidateDecision {
  shortlistId: string; // "Candidato 1"
  candidateName: string; // "Nome"
  executiveSummary: string; // "SUMÁRIO EXECUTIVO"
  decisionScenario: string; // "O CENÁRIO DE DECISÃO"
  whyDecision: string; // "O PORQUÊ DO CENÁRIO DE DECISÃO"
  cognisessData?: CognisessData; // Dados Cognisess processados
}

export interface Phase4Result {
  introduction: string; // Coluna "INTRODUÇÃO" (Célula mesclada)
  candidates: Phase4CandidateDecision[];
}

export interface ReferenceItem {
  sourceName?: string; // e.g. "Ex-Gerente", "Cliente" (kept anonymous in output usually, but useful for tracking)
  originalText: string;
  polishedText: string;
  isPositive: boolean;
}

export interface Phase5Result {
  candidateName: string;
  references: ReferenceItem[];
}

// ============================================================================
// COGNISESS DATA TYPES
// ============================================================================

/**
 * Personalidade (Lens Mini Report) - Big Five Model
 */
export interface CognisessPersonality {
  openness: number;           // Abertura a Experiências (0-100)
  conscientiousness: number;  // Conscienciosidade (0-100)
  extraversion: number;       // Extroversão (0-100)
  agreeableness: number;      // Amabilidade (0-100)
  emotionalStability: number; // Estabilidade Emocional (0-100) - inverso de Neuroticismo
}

/**
 * Competências - Habilidades técnicas e comportamentais
 */
export interface CognisessCompetency {
  analyticalThinking: number;   // Pensamento Analítico (0-100)
  problemSolving: number;       // Resolução de Problemas (0-100)
  communication: number;        // Comunicação (0-100)
  teamwork: number;             // Trabalho em Equipe (0-100)
  adaptability: number;         // Adaptabilidade (0-100)
  innovation: number;           // Inovação (0-100)
}

/**
 * Liderança - Capacidades de gestão e liderança
 */
export interface CognisessLeadership {
  strategicVision: number;     // Visão Estratégica (0-100)
  decisionMaking: number;      // Tomada de Decisão (0-100)
  peopleManagement: number;    // Gestão de Pessoas (0-100)
  changeManagement: number;    // Gestão de Mudanças (0-100)
  resultsOrientation: number;  // Orientação a Resultados (0-100)
  influence: number;           // Influência e Persuasão (0-100)
}

/**
 * Dados consolidados Cognisess para um candidato
 */
export interface CognisessData {
  personality: CognisessPersonality;
  competency: CognisessCompetency;
  leadership: CognisessLeadership;
  overallScore?: number;       // Score geral calculado (0-100)
  rawReports?: {
    lensMini?: string;
    competency?: string;
    leadership?: string;
  };
}

/**
 * Candidato com dados Cognisess para o dashboard
 */
export interface CandidateWithCognisess {
  candidateName: string;
  shortlistId?: string;
  cognisessData: CognisessData;
}