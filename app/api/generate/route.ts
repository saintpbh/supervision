import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { data, selectedModel } = await req.json();

    // Choose the model provider based on user selection
    // Default to OpenAI if not specified or "openai"
    // Note: This requires environment variables OPENAI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY
    const model = selectedModel === 'gemini'
        ? google('models/gemini-1.5-flash')
        : openai('gpt-4o');

    const systemPrompt = `
    당신은 20년 경력의 베테랑 수퍼바이저이자 상담 심리 전문가입니다.
    사용자(상담 초심자)가 입력한 짧은 단서들을 바탕으로, "전문적이고 학술적인 수퍼비전 보고서" 문장을 생성해야 합니다.
    
    [작성 원칙]
    1. 문체: 학술적이고 건조하며 객관적인 어조를 유지하십시오. (~함, ~으로 사료됨, ~을 관찰함)
    2. 내용: 입력된 내용만 부풀리지 말고, 전문 용어를 적절히 섞어 문장을 다듬으십시오.
    3. 구조:
       - A. 내담자 개요: 사실 관계를 명확히 기술.
       - B. 사례 개념화: 내담자의 심리 내적 역동과 상담자의 역전이를 연결하여 해석.
       - C. 상담 과정: 대화 내용을 요약.
    
    입력된 데이터:
    ${JSON.stringify(data, null, 2)}
  `;

    if (!process.env.OPENAI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return new Response('API Keys not found. Please set OPENAI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in .env.local', { status: 500 });
    }

    // streamText is synchronous in newer AI SDK versions
    const result = streamText({
        model: model,
        prompt: `위 데이터를 바탕으로 다음 HTML 구조에 맞는 내용을 생성해줘. 전체 HTML을 줄 필요는 없고, 각 섹션에 들어갈 "문장"만 다듬어서 줄 것. 
    하지만 지금은 단순함을 위해, 입력된 데이터를 바탕으로 "B. 사례 개념화 및 상담자 판단" 섹션에 들어갈 3-4문장의 전문적인 분석을 작성해줘.
    
    형식:
    "본 사례는 [내담자 특성]과 [환경적 요인]의 상호작용으로 이해됩니다. 상담자는 [선택한 개입]을 수행하는 과정에서 [망설임 이유]를 경험하였으며, 이는 [역동적 해석]으로 이해됩니다..."`,
        system: systemPrompt,
    });

    return result.toTextStreamResponse();
}
