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
    socialContext: z.string().optional().describe('내담자의 현재 사회적 상황 및 배경'),
    counselingGoal: z.string().optional().describe('현재 상담의 목표'),
    selectedIntervention: z.string().optional().describe('상담자가 선택한 주요 개입 전략'),
    hesitationReason: z.string().optional().describe('상담자가 개입 과정에서 느낀 망설임이나 어려움의 이유'),
    patternObservation: z.string().optional().describe('내담자에게서 관찰된 반복되는 행동/심리 패턴'),
    synthesis: z.string().optional().describe('사례에 대한 종합적 이해 및 전문가적 판단'),
    verbatim: z.string().optional().describe('전체 축어록 내용'),
    sctInterpretation: z.string().optional().describe('문장완성검사(SCT) 반응에 대한 임상적 해석'),
    mmpiAnalysis: z.string().optional().describe('MMPI-2 프로파일 점수에 기반한 심리 진단적 분석')
});

export async function POST(req: Request) {
    try {
        const { transcript, fileData, mimeType, selectedModel, apiKey: clientApiKey, reportMode, sctData, mmpiData, counselingTheory } = await req.json();

        if (!transcript && !fileData) {
            return new Response('No transcript or file provided', { status: 400 });
        }

        // Use server-side keys if available, otherwise fallback to client-provided keys
        const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || (selectedModel === 'gemini' ? clientApiKey : null);
        const openaiKey = process.env.OPENAI_API_KEY || (selectedModel !== 'gemini' ? clientApiKey : null);

        let model;

        if (selectedModel === 'gemini') {
            if (!googleKey) {
                return new Response('Google API Key not found. Please set API Key in Environment or Setup.', { status: 500 });
            }
            const google = createGoogleGenerativeAI({ apiKey: googleKey });
            model = google('models/gemini-1.5-pro-latest');
        } else {
            if (!openaiKey) {
                return new Response('OpenAI API Key not found. Please set API Key in Environment or Setup.', { status: 500 });
            }
            const openai = createOpenAI({ apiKey: openaiKey });
            model = openai('gpt-4o');
        }

        const theoryGuides: Record<string, string> = {
            'psychoanalysis': '정신분석적 모델을 기반으로 내담자의 무의식적 갈등, 초기 아동기 경험, 방어기제 및 전이를 중점적으로 분석하십시오.',
            'object-relations': '대상관계 이론을 기반으로 초기 양육자와의 관계가 형성한 내적 대상 관계와 현재의 대인관계 패턴을 연결하여 분석하십시오.',
            'cbt': '인지행동치료(CBT) 모델을 기반으로 내담자의 자동적 사고, 인지적 왜곡, 핵심 신념 및 행동 패턴을 분석하십시오.',
            'humanistic': '인간중심적 관점에서 내담자의 가치 조건화, 자아 일치성 정도, 그리고 현재 경험에 대한 수용 수준을 분석하십시오.',
            'gestalt': '게슈탈트 이론을 기반으로 내담자의 알아차림(awareness) 수준, 미해결 과제, 접촉 경계 혼란 및 "여기-지금"의 경험을 분석하십시오.',
            'none': '일반적인 상담 심리 전문가의 관점에서 사례를 다각도로 분석하십시오.'
        };

        const theoryGuide = theoryGuides[counselingTheory || 'none'] || theoryGuides['none'];

        const messages: any[] = [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `
        당신은 상담 심리 전문가이자 숙련된 수퍼바이저입니다. 
        제공된 데이터(텍스트 또는 이미지/PDF)를 분석하여 수퍼비전 보고서 작성을 위한 핵심 데이터를 추출하십시오.
        
        [보고서 유형]: ${reportMode === 'efficiency' ? '핵심형 (빠르고 간결한 요약 중심)' : '표준형 (심층 분석 및 학위/자격 심사용 상세 기술)'}
        [상담 이론]: ${counselingTheory || '일반 분석'}
        
        [분석 가이드라인]: 
        ${theoryGuide}
        
        ${transcript ? `[Text Transcript]:\n${transcript}` : ''}
        
        [Psychological Test Data]:
        - SCT: ${sctData || '제공되지 않음'}
        - MMPI-2: ${mmpiData || '제공되지 않음'}

        [수행 지침]:
        1. 이미지나 PDF가 제공된 경우, 해당 파일에서 상담 축어록 내용을 OCR하고 분석하십시오.
        2. 내담자의 인적사항(이름, 연령대, 성별, 사회적 배경)을 파악하십시오.
        3. 내담자의 주 호소 문제(Chief Complaint)를 상담 심리학적 용어를 사용하여 기술하십시오. ${reportMode === 'efficiency' ? '가장 핵심적인 한 문장으로 압축하십시오.' : '상세하고 구체적으로 기술하십시오.'}
        4. 데이터의 맥락을 통해 상담자가 이번 회기에서 가장 고민하는 '핵심 질문(Core Question)'을 추론하십시오.
        5. 상담의 궁극적인 '목표(counselingGoal)'와 이번 회기에서 사용된 또는 권장되는 '개입 전략(selectedIntervention)'을 도출하십시오.
        6. 상담자가 개입 시 느꼈을 법한 '망설임의 이유(hesitationReason)'를 역전이나 내담자 저항 관점에서 추론하십시오.
        7. 세션 전체의 흐름을 상담 역동 중심으로 요약하십시오(sessionSummary). ${reportMode === 'efficiency' ? '핵심 포인트 3-4개 위주로 간결하게 작성하십시오.' : '내담자와 상담자의 상호작용과 감정 변화를 포함하여 풍부하게 작성하십시오.'}
        8. 내담자에게서 반복되는 행동 패턴이나 방어 기제 등의 '반복 패턴(Pattern Observation)'을 추출하십시오.
        9. [핵심] 만약 심리검사 데이터(SCT, MMPI-2)가 제공되었다면, 해당 데이터를 전문적으로 해석하십시오(sctInterpretation, mmpiAnalysis).
        10. 위 모든 분석을 종합하여 사례의 핵심을 꿰뚫는 '사례 개념화(Synthesis)'를 전문적으로 작성하십시오.
        11. 제공된 파일의 내용을 'verbatim' 필드에 텍스트로 복원하여 포함하십시오.
        12. 모든 답변은 전문적인 한국어로 작성하십시오.
      `
                    }
                ]
            }
        ];

        if (fileData && mimeType && Array.isArray(messages[0].content)) {
            messages[0].content.push({
                type: 'file',
                data: fileData,
                mimeType: mimeType
            });
        }

        const result = await generateObject({
            model: model,
            schema: analysisSchema,
            messages: messages as any
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
