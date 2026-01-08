import { GoogleGenerativeAI, ChatSession, Content } from "@google/generative-ai";
import { Phase1Result, Phase2Result, Phase3Result, Phase4Result } from "../types";
import { Project } from "../hooks/useProjects";
import { trackTokenUsage } from "./financeService";

// Lazy initialization
const getGenAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key is missing in chatService.");
    throw new Error("API Key is missing.");
  }
  return new GoogleGenerativeAI(apiKey);
};

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Store model ID for tracking purposes
const CHAT_MODEL_ID = "gemini-2.0-flash";

export const createChatSession = (
  phase1: Phase1Result | null,
  phase2: { name: string; fullPhase2: Phase2Result }[],
  phase3: Phase3Result[],
  phase4: Phase4Result | null,
  history: Content[] = [],
  projectId?: string,
  allProjects?: Project[]
): ChatSession & { _projectId?: string; _companyName?: string } => {
  const modelId = CHAT_MODEL_ID;

  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    console.error("API_KEY is missing in chatService!");
  }

  // Serialize the current state of the application into a readable context context
  let contextData = "";

  if (projectId && (phase1 || phase2.length > 0)) {
    contextData = `
      === DADOS DO PROJETO SELECIONADO (ID: ${projectId}) ===
      
      [FASE 1 - ALINHAMENTO E EMPRESA]
      ${phase1 ? JSON.stringify(phase1, null, 2) : "Ainda não preenchido."}

      [FASE 2 - ENTREVISTAS REALIZADAS]
      ${phase2.length > 0 ? phase2.map(c => `Nome: ${c.name}\nDados: ${JSON.stringify(c.fullPhase2)}`).join('\n---\n') : "Nenhuma entrevista processada ainda."}

      [FASE 3 - SHORTLIST (TABELA COMPARATIVA)]
      ${phase3.length > 0 ? JSON.stringify(phase3, null, 2) : "Shortlist ainda não gerada."}

      [FASE 4 - DECISÃO FINAL]
      ${phase4 ? JSON.stringify(phase4, null, 2) : "Relatório de decisão ainda não gerado."}
    `;
  } else if (allProjects && allProjects.length > 0) {
    contextData = `
      === VISÃO GLOBAL DE TODOS OS PROJETOS DO RECRUTADOR ===
      Você tem acesso a ${allProjects.length} workspaces ativos.
      
      ${allProjects.map(p => `
        PROJETO: ${p.companyName} (${p.roleName})
        ID: ${p.id}
        Status: ${p.status}
        Mapeados: ${p.funnelMappedCount || 0}
        Abordados: ${p.funnelApproachedCount || 0}
        Candidatos no Pipeline: ${p.candidatesCount || 0}
        Shortlist: ${p.shortlistCount || 0}
        ---
      `).join('\n')}
      
      O usuário pode perguntar sobre qualquer um desses projetos ou pedir uma comparação geral. 
      Se ele perguntar sobre um projeto específico, use o ID ou nome para identificar.
    `;
  }

  const systemInstruction = `
    # ROLE
    Você é o Assistente Virtual Inteligente da Evermonte.
    Seu objetivo é ajudar Headhunters e Gestores (RH/Clientes) a navegar pelos dados dos processos seletivos.
    Você é capaz de falar sobre um projeto específico (em foco) ou sobre todos os projetos gerenciados pelo usuário.

    # CONTEXT
    Você tem acesso aos dados dos processos de recrutamento (Alinhamento, Entrevistas, Shortlist, Decisão).
    Esses dados foram injetados no seu contexto e são atualizados conforme o usuário usa a plataforma.

    # BEHAVIOR
    1. Responda dúvidas específicas sobre candidatos (ex: "Quem tem melhor inglês?").
    2. Faça comparações cruzando dados (ex: "O Candidato X se encaixa na cultura descrita na Fase 1?").
    3. Seja consultivo. Se identificar um risco nos dados, aponte-o.
    4. Seja conciso e direto. Use formatação Markdown (negrito, listas) para facilitar a leitura.
    5. Se o usuário perguntar algo que não está nos dados, diga que não tem essa informação no processo atual.

    # TONE
    Profissional, objetivo e prestativo.
  `;

  const model = getGenAI().getGenerativeModel({
    model: modelId,
    systemInstruction: `${systemInstruction}\n\n${contextData}`
  });

  const chat = model.startChat({
    history: history
  }) as ChatSession & { _projectId?: string; _companyName?: string };

  // Attach metadata for tracking
  chat._projectId = projectId;
  chat._companyName = phase1?.companyName;

  return chat;
};

export const sendMessageToAssistant = async (
  chat: ChatSession & { _projectId?: string; _companyName?: string },
  message: string,
  contextLabel?: string
): Promise<string> => {
  try {
    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    // Track token usage for finance dashboard
    const usageMetadata = result.response.usageMetadata;
    if (usageMetadata) {
      trackTokenUsage(
        CHAT_MODEL_ID,
        {
          promptTokenCount: usageMetadata.promptTokenCount || 0,
          candidatesTokenCount: usageMetadata.candidatesTokenCount || 0,
          totalTokenCount: usageMetadata.totalTokenCount || 0
        },
        {
          phase: contextLabel || 'Chat Assistant',
          companyName: chat._companyName,
          projectId: chat._projectId
        }
      ).catch(err => console.error("Token tracking error (chat):", err));
    }

    return responseText;
  } catch (error) {
    console.error("Chat Error Details:", error);
    return "Desculpe, ocorreu um erro ao consultar a IA. Tente novamente.";
  }
};