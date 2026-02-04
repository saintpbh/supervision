import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const maxDuration = 60;

// Schema for the structured output we want the AI to extract
const analysisSchema = z.object({
    coreQuestion: z.string().describe("The central psychological difficulty or hesitation of the counselor."),
    clientName: z.string().describe("Client's name or initial."),
    clientAgeGender: z.string().describe("Client's age and gender (e.g. '25 / Female')."),
    counselingCount: z.string().describe("Session number and date."),
    triggerEvent: z.string().describe("The event that triggered the counseling request."),
    chiefComplaint: z.string().describe("The main complaint in the client's own words."),
    familyRelations: z.string().describe("Brief summary of family dynamics."),
    socialContext: z.string().describe("Client's current job or school status."),
    patternObservation: z.string().describe("Repeated maladaptive patterns observed."),
    synthesis: z.string().describe("Psychological synthesis or case conceptualization."),
    sessionSummary: z.string().describe("A brief summary of what happened in this session."),
    verbatim: z.string().describe("3-4 lines of key dialogue exchanges."),
});

export async function POST(req: Request) {
    try {
        const { transcript, selectedModel } = await req.json();

        if (!transcript) {
            return new Response('No transcript provided', { status: 400 });
        }

        const model = selectedModel === 'gemini'
            ? google('models/gemini-1.5-pro-latest')
            : openai('gpt-4o');

        // Check if keys are present (basic check)
        if (!process.env.OPENAI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            // Mock response if no keys (for testing UI without keys)
            // In production you would throw error
            console.warn("No API Keys found (Analyze). Returning mock data.");
            return Response.json({
                coreQuestion: "[Mock] 내담자의 침묵에 대해 내가 너무 불안해하고 있음.",
                clientName: "김철수",
                clientAgeGender: "20대 / 남",
                counselingCount: "#1",
                triggerEvent: "대학 입학 실패",
                chiefComplaint: "아무것도 하고 싶지 않아요.",
                familyRelations: "부모님과의 갈등 심화.",
                socialContext: "재수생",
                patternObservation: "회피적인 태도",
                synthesis: "실패 경험으로 인한 무기력감",
                sessionSummary: "초반 20분간 침묵이 이어짐.",
                verbatim: "(상) ... \n(내) ..."
            });
        }

        const result = await generateObject({
            model: model,
            schema: analysisSchema,
            prompt: `
        Analyze the following counseling session transcript (Verbatim).
        Extract the key information to fill a Supervision Report.
        
        [Transcript]:
        ${transcript}
        
        [Instructions]:
        1. Extract factual data (Age, Name, Trigger, etc.).
        2. Infer the counselor's "Core Question" or hesitation if mentioned (or imply it from the context).
        3. Summarize the session and select key dialogue.
        4. Translate everything into Korean.
      `,
        });

        return Response.json(result.object);

    } catch (error) {
        console.error("Analysis Error:", error);
        return new Response(JSON.stringify({ error: 'Failed to analyze transcript' }), { status: 500 });
    }
}
