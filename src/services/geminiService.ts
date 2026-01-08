import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Phase1Result, Phase2Result, Phase3Result, Phase4Result, Phase5Result } from "../types";
import { trackTokenUsage } from "./financeService";

// Lazy initialization to prevent crash on load if API Key is missing
const getGenAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing. Check your .env file for VITE_GEMINI_API_KEY.");
    throw new Error("API Key is missing.");
  }
  return new GoogleGenerativeAI(apiKey);
};

// Helper for Robust Retry Logic (Exponential Backoff)
const generateContentWithRetry = async (
  model: any,
  prompt: string,
  schema: any,
  financeContext: { phase?: string; companyName?: string; candidateName?: string; userEmail?: string; projectId?: string } = {},
  maxRetries = 3
) => {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        }
      });

      // Track Token Usage
      if (result.response.usageMetadata) {
        // Async fire-and-forget to not block the UI
        trackTokenUsage(model.model, result.response.usageMetadata, financeContext).catch(err => console.error("Token tracking background error:", err));
      }

      return result;
    } catch (error: any) {
      if (error.message.includes("429") || error.message.includes("quota")) {
        console.warn(`[Gemini] Quota exceeded (429). Retrying in ${Math.pow(2, attempt) * 2}s... (Attempt ${attempt + 1}/${maxRetries})`);
        attempt++;
        if (attempt > maxRetries) throw error;
        // Exponential backoff: 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      } else {
        throw error;
      }
    }
  }
};

// --- Phase 1: Alignment ---
export const runPhase1Alignment = async (
  transcript: string,
  companyName: string,
  projectId?: string
): Promise<Phase1Result> => {
  // Use gemini-2.0-flash as reliable fallback (1.5 models returned 404 for this key)
  const modelId = "gemini-2.0-flash";

  console.log(`[Gemini] Starting Phase 1 Analysis for ${companyName} using ${modelId}...`);


  const systemInstruction = `
    # ROLE
    Você é um Agente Analista de Recrutamento da Evermonte, especialista na Fase 1 - Alinhamento.

    # TASK
    Analise a transcrição da reunião de alinhamento e realize 'Deep Research' para preencher EXATAMENTE os 17 campos solicitados abaixo sobre a vaga e a empresa.
    Seja detalhista, corporativo e direto.

    # CAMPOS OBRIGATÓRIOS (Refletir no JSON):

    # GUIDELINES DE PROFUNDIDADE (CRÍTICO - "GOLD STANDARD"):
    - O cliente exige nível de profundidade "NotebookLM".
    - Para os campos de texto (Itens 1-4), você DEVE escrever TEXTOS ROBUSTOS (2 a 3 parágrafos grandes cada).
    - Evite bullet points nestes campos. Use prosa executiva, analítica e sofisticada.
    - Aprofunde-se no "Porquê", "Como" e no impacto estratégico.

    # CAMPOS OBRIGATÓRIOS (Refletir no JSON):
    1. ESTRUTURA DA EMPRESA: (Escreva 2-3 parágrafos) Detalhe número de funcionários, faturamento, funding, estrutura societária (se houver) e pilares da cultura organizacional.
    2. SETOR, CONCORRÊNCIA E DIFERENCIAIS COMPETITIVOS: (Escreva 2-3 parágrafos) Análise macro do setor, posicionamento de mercado e lista detalhada de concorrentes diretos/indiretos e o "Moat" (diferencial) da empresa.
    3. MOMENTO / CONTEXTO DA EMPRESA: (Escreva 2-3 parágrafos) Expansão, turnaround, M&A, internacionalização. Explique o "Storytelling" do momento atual.
    4. PRINCIPAIS DESAFIOS ATUAIS DA EMPRESA: (Escreva 2-3 parágrafos) Dores do crescimento, gargalos técnicos, culturais ou de mercado que a vaga visa resolver.
    5. PRINCIPAIS OBJETIVOS E DESAFIOS DA VAGA: O que será cobrado deste executivo nos primeiros 12 meses.
    6. REPORTE DIRETO: Liderança imediata.
    7. EQUIPE: Composição do time (diretos e pares).
    8. LOCALIDADE: Cidade/Modelo Híbrido.
    9. MODELO DE CONTRATAÇÃO: PJ/CLT/Equity.
    10. SALÁRIO FIXO MENSAL: Budget aprovado.
    11. REMUNERAÇÃO VARIÁVEL (CRÍTICO): Escreva 2-3 parágrafos robustos detalhando bônus target, métricas, periodicidade e incentivos de longo prazo (LTI) se houver.
    12. EXPERIÊNCIA PROFISSIONAL IDEAL DO EXECUTIVO: O "Track Record" necessário.
    13. HISTÓRICO ACADÊMICO IDEAL DO EXECUTIVO: Formação basilar e complementar.
    14. CORE SKILL IDEAL 1: A competência técnica/comportamental nº 1 e porquê.
    15. CORE SKILL IDEAL 2: A competência técnica/comportamental nº 2 e porquê.
    16. CORE SKILL IDEAL 3: A competência técnica/comportamental nº 3 e porquê.
    17. REQUISITOS ESPECÍFICOS PARA O EXECUTIVO: Idiomas, viagens, certificações.

    *LISTA SUGERIDA DE SKILLS (Mas analise o contexto real):*
    Visão Estratégica, Execução Hands-on, Liderança Inspiradora, Gestão de Stakeholders, Adaptação Cultural, Resiliência, Foco em Resultados, Inovação.
  `;

  const prompt = `
    EMPRESA: ${companyName}
    CONTEXTO: ${transcript}

    Gere o JSON completo preenchendo as chaves correspondentes aos 17 itens.
  `;

  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      companyName: { type: SchemaType.STRING },
      structure: { type: SchemaType.STRING },
      sectorAndCompetitors: { type: SchemaType.STRING },
      momentContext: { type: SchemaType.STRING },
      mainChallenges: { type: SchemaType.STRING },
      jobObjectives: { type: SchemaType.STRING }, // Mapped to 'jobDetails' alias conceptually if needed, but distinct here
      jobDetails: { type: SchemaType.STRING }, // Kept for compat, fills same as jobObjectives
      directReport: { type: SchemaType.STRING },
      teamStructure: { type: SchemaType.STRING },
      location: { type: SchemaType.STRING },
      contractModel: { type: SchemaType.STRING },
      salaryDetails: { type: SchemaType.STRING },
      variableBonus: { type: SchemaType.STRING },
      idealExperience: { type: SchemaType.STRING },
      academicBackground: { type: SchemaType.STRING },
      idealCoreSkills: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING }
      },
      specificRequirements: { type: SchemaType.STRING }
    },
    required: [
      "companyName", "structure", "sectorAndCompetitors", "momentContext",
      "mainChallenges", "jobObjectives", "jobDetails", "directReport", "teamStructure",
      "location", "contractModel", "salaryDetails", "variableBonus",
      "idealExperience", "academicBackground", "idealCoreSkills", "specificRequirements"
    ]
  };

  try {
    const model = getGenAI().getGenerativeModel({
      model: modelId,
      systemInstruction: systemInstruction,
    });

    const result = await generateContentWithRetry(model, prompt, responseSchema, {
      phase: 'Phase 1 - Alignment',
      companyName,
      projectId
    });

    const response = result.response;
    const text = response.text();

    if (text) {
      return JSON.parse(text) as Phase1Result;
    } else {
      throw new Error("No response text generated");
    }

  } catch (error) {
    console.error("Phase 1 Error:", error);
    throw error;
  }
};

// --- Phase 2: Interview ---
export const runPhase2Interview = async (
  candidateName: string,
  cvText: string,
  interviewTranscript: string,
  consultantNotes: string,
  projectId?: string
): Promise<Phase2Result> => {
  const modelId = "gemini-2.0-flash";

  const systemInstruction = `
    # ROLE
    Você é um Agente Avaliador de Talentos da Evermonte, especialista na Fase 2 - Entrevista.
    
    # TASK
    Sua missão é criar um relatório avaliativo ROBUSTO, DETALHADO E EXECUTIVO, sintetizando 3 fontes:
    1. CV (Trajetória)
    2. Transcrição da Entrevista (Profundidade e "Como fez")
    3. Notas do Consultor (Soft Skills e Cultura)

    # GUIDELINES
    1. CRIE UM RELATO INTEGRADO: Não trate as fontes isoladamente. Use o CV para a espinha dorsal e a entrevista para dar "cor" e profundidade.
    2. PRINCIPAIS PROJETOS (CRÍTICO): Identifique os 3 projetos mais relevantes da carreira.
       - NÃO use bullet points simples. Escreva parágrafos detalhados (narrativa STAR).
       - Contexto, Desafio, Ação e RESULTADO QUANTITATIVO.
    3. RESUMO DA TRAJETÓRIA: Escreva uma narrativa fluida e executiva, não apenas uma lista de cargos.
    4. SOFT SKILLS & CULTURA: Use as notas do consultor para avaliar comunicação, motivação e aderência.
    5. TOM DE VOZ: Senior, Analítico, "Headhunter Profile".

    # OUTPUT MAPPING
    Preencha o JSON com riqueza de detalhes:
    - mainProjects: O texto deve ser rico, detalhado e focado em impacto de negócios.
    - experience: Narrativa executiva completa.
    - coreSkills: As 3 competências mais evidentes, justificadas com exemplos.
    - coreSkills: As 3 competências mais evidentes, justificadas com exemplos.
    - recommendation: Liste 2 tipos/perfis de companhias/projetos ideais para este profissional (sem mencionar a vaga atual). Analise perfil, cultura e skills. Ex: "1. Startups em Scale-up: ..."
  `;

  const prompt = `
    CANDIDATO: ${candidateName}
    
    CV (TEXTO):
    ${cvText}
    
    NOTAS DO CONSULTOR (Soft Skills/Impressões):
    ${consultantNotes}
    
    TRANSCRIÇÃO DA ENTREVISTA:
    ${interviewTranscript}

    Gere um JSON estrito para o relatório do candidato.
  `;

  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      candidateName: { type: SchemaType.STRING },
      currentPosition: { type: SchemaType.STRING },
      interviewerConclusion: { type: SchemaType.STRING },
      experience: { type: SchemaType.STRING },
      mainProjects: { type: SchemaType.STRING },
      motivation: { type: SchemaType.STRING },
      mobility: { type: SchemaType.STRING },
      englishLevel: { type: SchemaType.STRING },
      remuneration: { type: SchemaType.STRING },
      communication: { type: SchemaType.STRING },
      coreSkills: { type: SchemaType.STRING },
      recommendation: { type: SchemaType.STRING },
    },
    required: [
      "candidateName", "currentPosition", "interviewerConclusion", "experience", "mainProjects",
      "motivation", "mobility", "englishLevel", "remuneration",
      "communication", "coreSkills", "recommendation"
    ],
  };

  try {
    const model = getGenAI().getGenerativeModel({
      model: modelId,
      systemInstruction: systemInstruction,
    });

    const result = await generateContentWithRetry(model, prompt, responseSchema, {
      phase: 'Phase 2 - Interview',
      candidateName,
      projectId
    });

    const response = result.response;
    const text = response.text();

    if (text) {
      return JSON.parse(text) as Phase2Result;
    } else {
      throw new Error("No response text generated");
    }
  } catch (error) {
    console.error("Phase 2 Error:", error);
    throw error;
  }
};

// --- Phase 3: Shortlist ---
export const runPhase3Shortlist = async (
  candidatesData: {
    name: string;
    interviewReport: string;
    cvText: string;
    fullPhase2?: Phase2Result;
  }[],
  projectId?: string
): Promise<Phase3Result[]> => {
  const modelId = "gemini-2.0-flash";

  const systemInstruction = `
    # ROLE
    Você é um Agente Organizador de Talentos da Evermonte, especialista na Fase 3 - Shortlist.
    
    # TASK
    Consolidar as informações dos candidatos finalistas em uma tabela comparativa (JSON).
    NÃO compare candidatos entre si. Apresente os fatos de cada um de forma padronizada e individual.

    # INSTRUCTIONS
    Para cada candidato, extraia e formate os dados com profundidade executiva:
    - PROFESSIONAL EXPERIENCE: Narrativa cronológica detalhada (Empresa, Cargo, Contexto).
    - MAIN PROJECTS: Análise robusta dos 3 principais projetos. NÃO limite o texto. Detalhe o Desafio, a Ação e o Resultado (STAR).
    - CORE SKILLS: As 3 skills mais críticas para a vaga, com justificativa baseada em evidências.
    - MOTIVATIONS: Análise profunda dos motivadores de mudança.
    - REMUNERATION: Detalhamento claro do pacote atual e pretensão.

    Use 'fullPhase2' (dados da entrevista) como fonte primária para garantir consistência e profundidade.
  `;

  const prompt = `
    DADOS DOS CANDIDATOS:
    ${JSON.stringify(candidatesData)}

    Gere o JSON "shortlist" preenchendo as colunas abaixo para CADA candidato:
    1. shortlistId (Ex: "01")
    2. candidateName
    3. age (IDADE - Apenas número)
    4. location (LOCALIDADE - Cidade/UF)
    5. currentPosition (POSIÇÃO ATUAL - Cargo @ Empresa)
    6. academicHistory (HISTÓRICO ACADÊMICO - Resumo: Formação/Instituição)
    7. professionalExperience (EXPERIÊNCIA PROFISSIONAL - Resumo Cronológico)
    8. mainProjects (PRINCIPAIS PROJETOS DA CARREIRA - Resumo dos 3 destaques)
    9. remunerationPackage (PACOTE DE REMUNERAÇÃO ATUAL - Valor fixo, variável e pacote)
    10. coreSkills (CORE SKILLS - Top 3)
    11. motivations (MOTIVAÇÕES - Gatilhos)
  `;

  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      shortlist: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            shortlistId: { type: SchemaType.STRING },
            candidateName: { type: SchemaType.STRING },
            age: { type: SchemaType.STRING },
            currentPosition: { type: SchemaType.STRING },
            location: { type: SchemaType.STRING },
            academicHistory: { type: SchemaType.STRING },
            professionalExperience: { type: SchemaType.STRING },
            mainProjects: { type: SchemaType.STRING },
            remunerationPackage: { type: SchemaType.STRING },
            coreSkills: { type: SchemaType.STRING },
            motivations: { type: SchemaType.STRING }
          },
          required: [
            "shortlistId", "candidateName", "age", "currentPosition",
            "location", "academicHistory", "professionalExperience",
            "mainProjects", "remunerationPackage", "coreSkills", "motivations"
          ]
        }
      }
    },
    required: ["shortlist"]
  };

  try {
    const model = getGenAI().getGenerativeModel({
      model: modelId,
      systemInstruction: systemInstruction,
    });

    const result = await generateContentWithRetry(model, prompt, responseSchema, {
      phase: 'Phase 3 - Shortlist',
      candidateName: candidatesData.map(c => c.name).join(', '),
      projectId
    });

    const response = result.response;
    const text = response.text();

    if (text) {
      const json = JSON.parse(text);
      return json.shortlist as Phase3Result[];
    } else {
      throw new Error("No response text generated");
    }
  } catch (error) {
    console.error("Phase 3 Error:", error);
    throw error;
  }
};

// --- Phase 4: Decision ---
export const runPhase4Decision = async (
  companyData: Phase1Result | null,
  shortlistData: Phase3Result[],
  phase2Data: Phase2Result[],
  candidateDocs: Record<string, { lensMini?: string; competency?: string; leadership?: string; }>,
  projectId?: string
): Promise<Phase4Result> => {
  const modelId = "gemini-2.0-flash";

  const systemInstruction = `
    # ROLE
    Você é um Consultor Estratégico da Evermonte, especialista na Fase 4 - Cenário de Decisão.
    
    # TASK
    Transforme os dados técnicos dos finalistas em uma "Narrativa Executiva" para apoiar a decisão final.
    O objetivo NÃO é descrever o candidato (isso já foi feito), mas sim PROJETAR O IMPACTO dele na empresa ${companyData?.companyName}.

    # INSTRUCTIONS - ESTRUTURA DO RELATÓRIO:
    1. INTRODUÇÃO (INTRODUCTION):
       - Escreva 2 PARÁGRAFOS DETALHADOS e ROBUSTOS (Mínimo 100 palavras cada). NÃO ECONOMIZE TEXTO.
       - Parágrafo 1: Informe OBRIGATORIAMENTE que "Este relatório foi elaborado pela equipe de Inteligência Artificial da Evermonte, integrando avaliações de profundidade, transcrições de entrevistas e assessments cognitivos e comportamentais da Cognisess." Resuma o objetivo estratégico de apoiar a decisão final.
       - Parágrafo 2: Apresente uma síntese das informações críticas alinhadas com a empresa e o perfil buscado. Mencione os principais desafios contextuais da vaga e como a análise dos finalistas foi filtrada através desses requisitos. Seja sofisticado na análise.

    # INSTRUCTIONS - PARA CADA CANDIDATO:
    2. SUMÁRIO EXECUTIVO (Executive Summary):
       - Escreva 2 a 3 parágrafos ROBUSTOS e analíticos.
       - Synthesize a trajetória do candidato, sua senioridade e o "Fit" cultural/técnico com a empresa.
       - Não seja superficial. Venda o valor do candidato.

    3. CENÁRIO DE DECISÃO (The Scenario):
       - Dê um título a um cenário futuro (Ex: "Cenário de Expansão Acelerada", "Cenário de Estabilização de Processos").
       - Descreva: "Ao contratar este profissional, a empresa ganha X e resolve o problema Y". Foco total no impacto.

    4. O PORQUÊ (The Evidence):
       - Justifique o cenário acima. "Isso é sustentado pela experiência dele no Projeto X e pela competência Y".

    # TONE
    Executivo, Estratégico, "Direto ao Ponto".
  `;

  const prompt = `
    CONTEXTO DA EMPRESA:
    ${companyData?.companyName}
    Desafios: ${companyData?.jobDetails}

    FINALISTAS PARA ANÁLISE:
    ${shortlistData.map(c => {
    const p2 = phase2Data.find(p => p.candidateName === c.candidateName);
    return `
      ---
      CANDIDATO: ${c.candidateName}
      ID: ${c.shortlistId}
      NOME: ${c.candidateName}
      
      [CONTEXTO DE ENTREVISTA]
      Conclusão: ${p2?.interviewerConclusion || 'N/A'}
      Recomendação: ${p2?.recommendation || 'N/A'}
      
      [RESUMO TÉCNICO]
      Projetos: ${c.mainProjects}
      Skills: ${c.coreSkills}
      
      [ASSESSMENTS]
      Lens: ${candidateDocs[c.candidateName]?.lensMini || "N/A"}
      Competência: ${candidateDocs[c.candidateName]?.competency || "N/A"}
      Liderança: ${candidateDocs[c.candidateName]?.leadership || "N/A"}
      ---
    `}).join('\n')}

    Gere o JSON preenchendo para cada candidato:
    - executiveSummary (Sumário Executivo)
    - decisionScenario (Título e Descrição do Cenário)
    - whyDecision (Justificativa/Porquê)
  `;

  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      introduction: {
        type: SchemaType.STRING,
        description: "Texto da coluna INTRODUÇÃO (2 parágrafos detalhados: 1 sobre Elaboração da IA/Assessments, 1 sobre Retomada de Contexto/Desafios)"
      },
      candidates: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            shortlistId: { type: SchemaType.STRING },
            candidateName: { type: SchemaType.STRING },
            executiveSummary: { type: SchemaType.STRING, description: "SUMÁRIO EXECUTIVO (Parágrafos narrativos, integrando Entrevista + Relatórios)" },
            decisionScenario: { type: SchemaType.STRING, description: "O CENÁRIO DE DECISÃO (Título curto, ex: 'Foco em Expansão')" },
            whyDecision: { type: SchemaType.STRING, description: "O PORQUÊ DO CENÁRIO DE DECISÃO (Justificativa)" }
          },
          required: ["shortlistId", "candidateName", "executiveSummary", "decisionScenario", "whyDecision"]
        }
      }
    },
    required: ["introduction", "candidates"]
  };

  try {
    const model = getGenAI().getGenerativeModel({
      model: modelId,
      systemInstruction: systemInstruction,
    });

    const result = await generateContentWithRetry(model, prompt, responseSchema, {
      phase: 'Phase 4 - Decision',
      companyName: companyData?.companyName,
      projectId
    });

    const response = result.response;
    const text = response.text();

    if (text) {
      return JSON.parse(text) as Phase4Result;
    } else {
      throw new Error("No response text generated");
    }
  } catch (error) {
    console.error("Phase 4 Error:", error);
    throw error;
  }
};

// --- Phase 5: References ---
export const runPhase5References = async (
  candidateName: string,
  rawNotes: string,
  projectId?: string
): Promise<Phase5Result> => {
  const modelId = "gemini-2.0-flash";

  // Instruction extracted from input provided by user
  const systemInstruction = `
# Persona
Atue como um editor de referências profissionais. Seu objetivo é reformular textos de referência (sejam eles positivos ou negativos) para torná-los mais formais, em terceira pessoa, e manter o anonimato das fontes.

## Propósito e Metas:
* Receber um texto de referência (seja ele positivo ou negativo) e o nome do candidato.
* Reformular o texto de forma a profissionalizar a linguagem e adotar a terceira pessoa (ex: 'Ele demonstrou...', 'O profissional possui...').
* Eliminar quaisquer menções aos nomes das pessoas que forneceram a referência.
* Garantir que a essência e o tom da referência original (positivo ou negativo) sejam mantidos sem exageros ou invenção de novas informações.

## Comportamentos e Regras (Referência Positiva):
1)  Quando o usuário fornecer a referência positiva e o nome do candidato (NOME CANDIDATO), aplique as seguintes regras:
   a)  Reescreva a referência para que soe altamente profissional.
   b)  Descreva o candidato de forma positiva, focando em suas competências, conquistas e qualidades profissionais.
   c)  Use estritamente a terceira pessoa ('O candidato', 'O profissional', 'Ele/Ela').
   d)  Não insira adjetivos ou informações que não estejam implícitas ou explícitas no texto original.
   e)  O texto final deve ser conciso e persuasivo.

## Comportamentos e Regras (Referência Negativa):
2)  Quando o usuário fornecer a referência negativa e o nome do candidato (NOME CANDIDATO), aplique as seguintes regras:
   a)  Reescreva a referência para que mantenha um tom formal e profissional, mesmo ao abordar aspectos negativos.
   b)  Mantenha a opinião original dos entrevistados, mas evite descrições excessivamente negativas ou ataques pessoais. Use linguagem neutra para descrever deficiências ou áreas de melhoria (ex: 'Há espaço para desenvolvimento em...', 'A gestão de tempo foi uma área de desafio').
   c)  Use estritamente a terceira pessoa.
   d)  Não insira adjetivos ou informações que não estejam implícitas ou explícitas no texto original.
   e)  O objetivo é apresentar uma visão honesta e formal, minimizando a toxicidade.

## Tom Geral:
* Profissional, objetivo e direto ao ponto.
* A linguagem utilizada deve ser a mesma do texto original (Português, neste caso).
* Demonstre ser um especialista em comunicação corporativa e RH.
  `;

  const prompt = `
    CANDIDATO: ${candidateName}
    
    NOTAS BRUTAS DA REFERÊNCIA:
    ${rawNotes}
    
    Tarefa: Gere um JSON contendo a versão "polida" e anônima deste texto. Identifique automaticamente se o feedback é positivo ou construtivo/negativo com base no conteúdo.
  `;

  // Schema for structured output
  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      candidateName: { type: SchemaType.STRING },
      references: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            sourceName: { type: SchemaType.STRING, description: "A generalized source title if inferable (e.g. 'Ex-Gestor'), otherwise 'Referência'" },
            originalText: { type: SchemaType.STRING, description: "The original raw text" },
            polishedText: { type: SchemaType.STRING },
            isPositive: { type: SchemaType.BOOLEAN, description: "True if the reference is positive, false if negative or constructive." }
          },
          required: ["polishedText", "isPositive"]
        }
      }
    },
    required: ["candidateName", "references"]
  };

  try {
    const model = getGenAI().getGenerativeModel({
      model: modelId,
      systemInstruction: systemInstruction,
    });

    const result = await generateContentWithRetry(model, prompt, responseSchema, {
      phase: 'Phase 5 - References',
      candidateName,
      projectId
    });
    const response = result.response;
    const text = response.text();

    if (text) {
      return JSON.parse(text) as Phase5Result;
    } else {
      throw new Error("No response text generated");
    }
  } catch (error) {
    console.error("Phase 5 Error:", error);
    throw error;
  }
};