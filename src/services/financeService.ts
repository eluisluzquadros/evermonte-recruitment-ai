
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface TokenUsageContext {
    phase?: string;
    projectId?: string;      // Workspace/Project ID
    projectName?: string;    // Human-readable project name
    companyName?: string;
    candidateName?: string;
    userEmail?: string;
    userId?: string;
}

export interface TokenUsageRecord {
    timestamp: any;
    modelId: string;
    type: 'input' | 'output';
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
    context: TokenUsageContext;
    estimatedCostUSD: number;
}

// Pricing (approximate for Gemini - per 1M tokens)
// Gemini 2.0 Flash is currently free but we track for future billing
const PRICING: Record<string, { input: number; output: number }> = {
    'gemini-2.0-flash': { input: 0.10, output: 0.40 }, // Future pricing estimate
    'gemini-1.5-flash': { input: 0.075, output: 0.30 },
    'gemini-1.5-pro': { input: 1.25, output: 5.00 },
};

export const trackTokenUsage = async (
    modelId: string,
    usageMetadata: { promptTokenCount: number; candidatesTokenCount: number; totalTokenCount: number },
    context: TokenUsageContext
) => {
    try {
        // Normalize model name (Gemini returns full model path)
        const normalizedModel = modelId.includes('gemini-2.0-flash') ? 'gemini-2.0-flash' :
            modelId.includes('gemini-1.5-flash') ? 'gemini-1.5-flash' :
                modelId.includes('gemini-1.5-pro') ? 'gemini-1.5-pro' : modelId;

        const inputPrice = PRICING[normalizedModel]?.input || 0;
        const outputPrice = PRICING[normalizedModel]?.output || 0;

        const inputCost = (usageMetadata.promptTokenCount / 1_000_000) * inputPrice;
        const outputCost = (usageMetadata.candidatesTokenCount / 1_000_000) * outputPrice;
        const totalCost = inputCost + outputCost;

        const record: TokenUsageRecord = {
            timestamp: serverTimestamp(),
            modelId: normalizedModel,
            type: 'output',
            promptTokenCount: usageMetadata.promptTokenCount,
            candidatesTokenCount: usageMetadata.candidatesTokenCount,
            totalTokenCount: usageMetadata.totalTokenCount,
            context: {
                ...context,
                // Ensure projectId is never undefined for indexing
                projectId: context.projectId || 'global',
            },
            estimatedCostUSD: totalCost,
        };

        await addDoc(collection(db, 'token_usage'), record);
        console.log(`[Finance] Tracked ${usageMetadata.totalTokenCount} tokens ($${totalCost.toFixed(6)}) for ${normalizedModel} in project ${context.projectId || 'global'}`);
    } catch (error) {
        console.error("[Finance] Failed to log token usage:", error);
        // Don't crash the app if logging fails
    }
};

// Helper to calculate costs for display
export const calculateCost = (
    modelId: string,
    promptTokens: number,
    outputTokens: number
): number => {
    const normalizedModel = modelId.includes('gemini-2.0-flash') ? 'gemini-2.0-flash' :
        modelId.includes('gemini-1.5-flash') ? 'gemini-1.5-flash' :
            modelId.includes('gemini-1.5-pro') ? 'gemini-1.5-pro' : modelId;

    const pricing = PRICING[normalizedModel] || { input: 0, output: 0 };
    return ((promptTokens / 1_000_000) * pricing.input) + ((outputTokens / 1_000_000) * pricing.output);
};
