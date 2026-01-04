
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { DrawingData, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeDrawings = async (data: DrawingData): Promise<AnalysisResult> => {
  const model = "gemini-3-flash-preview";
  
  const houseBase64 = data.house?.split(',')[1];
  const treeBase64 = data.tree?.split(',')[1];
  const personBase64 = data.person?.split(',')[1];

  const contents = {
    parts: [
      { text: "제공된 HTP(House-Tree-Person) 그림들을 심리학적으로 분석해주세요. 첫 번째는 집(자아/가족), 두 번째는 나무(무의식적 자아), 세 번째는 사람(사회적 자아)입니다. 선의 굵기, 크기, 위치, 창문이나 뿌리, 팔다리 같은 세부 요소를 분석하여 심층적인 심리 분석 결과를 한국어로 제공하세요. 반드시 JSON 형식으로 응답해야 합니다." },
      { inlineData: { mimeType: "image/png", data: houseBase64 || "" } },
      { inlineData: { mimeType: "image/png", data: treeBase64 || "" } },
      { inlineData: { mimeType: "image/png", data: personBase64 || "" } },
    ]
  };

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "전체적인 분석 요약 (한 문장)" },
          personalityTraits: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                trait: { type: Type.STRING, description: "성격 특성 키워드 (예: 외향성, 신중함)" },
                score: { type: Type.NUMBER, description: "점수 (0-100)" },
                description: { type: Type.STRING, description: "특성에 대한 상세 설명" }
              }
            }
          },
          emotionalState: { type: Type.STRING, description: "현재의 감정 상태 분석" },
          advice: { type: Type.STRING, description: "심리학적 조언 및 제언" },
          keyInsights: {
            type: Type.ARRAY,
            items: { type: Type.STRING, description: "주요 통찰 포인트" }
          }
        },
        required: ["summary", "personalityTraits", "emotionalState", "advice", "keyInsights"]
      }
    }
  });

  try {
    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr) as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse analysis result:", error);
    throw new Error("분석에 실패했습니다. 다시 시도해주세요.");
  }
};

/**
 * AI 심리 상담사 채팅 세션을 초기화합니다.
 */
export const createCounselorChat = (result: AnalysisResult): Chat => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `당신은 따뜻하고 공감 능력이 뛰어난 전문 AI 심리 상담사 '마인드 가이드'입니다. 
  방금 사용자의 HTP(House-Tree-Person) 그림 분석을 마쳤습니다. 
  사용자의 분석 결과는 다음과 같습니다:
  - 요약: ${result.summary}
  - 감정 상태: ${result.emotionalState}
  - 성격 특성: ${result.personalityTraits.map(t => `${t.trait}(${t.score}점)`).join(', ')}
  - 조언: ${result.advice}
  
  당신의 역할은 사용자가 이 결과에 대해 묻는 질문에 답변하고, 정서적 지지를 제공하며, 미술 치료 이론에 기반한 통찰을 나누는 것입니다. 
  답변은 항상 한국어로 친절하고 부드럽게(해요체) 하세요. 
  사용자가 결과에 대해 구체적으로 물으면 분석 데이터를 바탕으로 상세히 설명해 주세요.`;

  return ai.chats.create({
    model,
    config: {
      systemInstruction,
    },
  });
};
