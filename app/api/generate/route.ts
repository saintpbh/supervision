import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { data, selectedModel, apiKey } = await req.json();

    // Prefer client-provided key, fallback to env var
    const googleKey = apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const openaiKey = apiKey || process.env.OPENAI_API_KEY;

    let model;

    if (selectedModel === 'gemini') {
        if (!googleKey) {
            return new Response('Google API Key not found. Please set API Key in Setup.', { status: 500 });
        }
        const google = createGoogleGenerativeAI({ apiKey: googleKey });
        model = google('models/gemini-1.5-pro-latest');
    } else {
        // Default to OpenAI
        if (!openaiKey) {
            return new Response('OpenAI API Key not found. Please set API Key in Setup.', { status: 500 });
        }
        const openai = createOpenAI({ apiKey: openaiKey });
        model = openai('gpt-4o');
    }

    const systemPrompt = `
    당신은 한국상담심리학회 및 한국상담학회 1급 자격을 보유한 20년 경력의 베테랑 수퍼바이저입니다.
    상담 수련생이 입력한 단서들을 바탕으로, 심리학적 통찰이 담긴 "전문적이고 학술적인 수퍼비전 보고서" 문장을 생성해야 합니다.
    
    [작성 원칙]
    1. 문체: 학술적이고 건조하며 객관적인 어조를 유지하십시오. (~함, ~으로 사료됨, ~을 관찰함, ~로 보여짐)
    2. 전문성: 정신역동, 대상관계, 인지행동 등 주요 상담 이론적 개념을 적절히 활용하여 현상을 개념화하십시오.
    3. 객관성: 상담자의 주관적 판단보다는 내담자의 구체적인 행동과 발화에 근거한 해석을 제공하십시오.
    4. 구조:
       - 내담자 이해: 내담자의 심리 내적 역동 및 대인관계 패턴 기술.
       - 사례 개념화: 내담자의 증상과 기저의 역동을 연결하여 전문적으로 기술.
       - 상담자 판단: 상담자의 역전이 혹은 개입의 적절성을 비판적으로 분석.
    
    입력된 데이터:
    ${JSON.stringify(data, null, 2)}
  `;

    // streamText is synchronous in newer AI SDK versions
    const result = streamText({
        model: model,
        prompt: `위 데이터를 바탕으로 "사례 개념화 및 상담자 판단" 섹션에 들어갈 전문적인 문장을 4-5문장 내외로 작성해줘. 
    
    [포함 내용]
    - 내담자의 호소 문제 이면에 숨겨진 심리적 역동.
    - 상담자가 개입 과정에서 느꼈을 어려움이나 역전이적 요소.
    - 향후 상담 방향에 대한 제언.
    
    [예시 문구 추천]
    "내담자가 보이는 과도한 순응은 초기 대상관계에서의 거절 경험에 대한 방어 기제로 사료됨. 상담자는 내담자의 침묵에 대해 조급함을 느꼈으며, 이는 보살펴야 한다는 과도한 책임감에서 기인한 역전이일 가능성이 있음. 차회기에는 내담자의 전개되는 감정을 명료화하는 작업이 병행되어야 할 것으로 보임."`,
        system: systemPrompt,
    });

    return result.toTextStreamResponse();
}
