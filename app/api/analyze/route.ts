import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

export const maxDuration = 60;

// Schema for the structured output we want the AI to extract
const analysisSchema = z.object({
    clientName: z.string().optional().describe('내담자의 이름'),
    clientAgeGender: z.string().optional().describe('내담자의 나이 및 성별 (예: 20대 여성)'),
    triggerEvent: z.string().optional().describe('상담을 오게 된 계기 (촉발 요인)'),
    chiefComplaint: z.string().optional().describe('내담자의 주 호소 문제 (핵심 어구)'),
    coreQuestion: z.string().optional().describe('상담자가 이번 회기에서 가장 고민하는 핵심 질문'),
    sessionSummary: z.string().optional().describe('상담 세션의 주요 내용 요약'),
    verbatim: z.string().optional().describe('전체 축어록 내용')
});

export async function POST(req: Request) {
    try {
        const { transcript, selectedModel, apiKey } = await req.json();

        if (!transcript) {
            return new Response('No transcript provided', { status: 400 });
        }

        const googleKey = apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        const openaiKey = apiKey || process.env.OPENAI_API_KEY;

        let model;

        // Check if keys are present (basic check)
        // If no keys provided anywhere, use mock
        if (!googleKey && !openaiKey && !process.env.OPENAI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            // Mock response if no keys (for testing UI without keys)
            // In production you would throw error
            console.warn("No API Keys found (Analyze). Returning mock data.");
            return Response.json({
                clientName: "신OO",
                clientAgeGender: "20대 후반 여성",
                triggerEvent: "직장에서의 대인관계 갈등",
                chiefComplaint: "사람들이 나를 무시하는 것 같아요.",
                coreQuestion: "내담자의 침묵을 어떻게 다뤄야 할까요?",
                sessionSummary: "내담자는 직장 동료와의 갈등을 이야기하던 중, 자신이 소외되고 있다는 느낌을 강하게 토로함. 상담자가 공감하려 했으나 내담자는 이를 거부하며 침묵함.",
                verbatim: transcript // Echo back
            });
        }

        if (selectedModel === 'gemini') {
            if (!googleKey) throw new Error("Google API Key missing");
            const google = createGoogleGenerativeAI({ apiKey: googleKey });
            model = google('models/gemini-1.5-pro-latest');
        } else {
            // Default to OpenAI
            if (!openaiKey) throw new Error("OpenAI API Key missing");
            const openai = createOpenAI({ apiKey: openaiKey });
            model = openai('gpt-4o');
        }

        const result = await generateObject({
            model: model,
            schema: analysisSchema,
            prompt: `
        당신은 상담 심리 전문가이자 숙련된 수퍼바이저입니다. 
        제공된 상담 축어록(Verbatim)을 분석하여 수퍼비전 보고서 작성을 위한 핵심 데이터를 추출하십시오.
        
        [Transcript]:
        ${transcript}
        
        [수행 지침]:
        1. 내담자의 인적사항(이름, 연령대, 성별)을 파악하십시오.
        2. 내담자의 주 호소 문제(Chief Complaint)를 상담 심리학적 용어를 사용하여 명확히 기술하십시오.
        3. 내담자가 상담을 받게 된 촉발 사건(Trigger Event)을 객관적으로 서술하십시오.
        4. 축어록의 맥락을 통해 상담자가 이번 회기에서 가장 고민하거나 수퍼바이저에게 묻고 싶어 하는 '핵심 질문(Core Question)'을 추론하십시오.
        5. 세션 전체의 흐름을 상담 역동 중심으로 요약하십시오.
        6. 모든 답변은 전문적인 한국어로 작성하십시오.
      `,
        });

        return Response.json({
            ...result.object,
            usage: result.usage
        });

    } catch (error) {
        console.error("Analysis Error:", error);
        return new Response(JSON.stringify({ error: 'Failed to analyze transcript' }), { status: 500 });
    }
}
