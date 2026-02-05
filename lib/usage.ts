export interface UsageStats {
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
}

const STORAGE_KEY = 'hanamindcare_ai_usage';

export const getUsageStats = (): UsageStats => {
    if (typeof window === 'undefined') return { totalTokens: 0, inputTokens: 0, outputTokens: 0, estimatedCost: 0 };
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { totalTokens: 0, inputTokens: 0, outputTokens: 0, estimatedCost: 0 };
    try {
        return JSON.parse(saved);
    } catch {
        return { totalTokens: 0, inputTokens: 0, outputTokens: 0, estimatedCost: 0 };
    }
};

export const saveUsageStats = (stats: UsageStats) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

export const recordUsage = (input: number, output: number, model: 'openai' | 'gemini') => {
    const current = getUsageStats();

    // Simple cost estimation (approximate per 1M tokens)
    // GPT-4o: $5 input / $15 output
    // Gemini 1.5 Pro: $3.5 input / $10.5 output (simplified)
    const inputCostRate = model === 'openai' ? 0.000005 : 0.0000035;
    const outputCostRate = model === 'openai' ? 0.000015 : 0.0000105;

    const newCost = (input * inputCostRate) + (output * outputCostRate);

    const updated: UsageStats = {
        totalTokens: current.totalTokens + input + output,
        inputTokens: current.inputTokens + input,
        outputTokens: current.outputTokens + output,
        estimatedCost: current.estimatedCost + newCost
    };

    saveUsageStats(updated);
};

export const resetUsageStats = () => {
    const reset = { totalTokens: 0, inputTokens: 0, outputTokens: 0, estimatedCost: 0 };
    saveUsageStats(reset);
};
