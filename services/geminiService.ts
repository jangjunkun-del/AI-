import { GoogleGenAI, Type, Chat } from "@google/genai";
import { DrawingData, AnalysisResult } from "../types";

// API 키는 환경 변수 process.env.API_KEY에서 직접 가져옵니다.
// 가이드라인에 따라 반드시 객체 형태로 전달하며, fallback은 사용하지 않습니다.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeDrawings = async (data: DrawingData): Promise<AnalysisResult> => {
  // 복잡한 심리 추론을 위해 고성능 모델인 gemini-3-pro-preview를 사용합니다.
  const modelName = "gemini-3-pro-preview";
  
  const houseBase64 = data.house?.split(',')[1];
  const treeBase64 = data.tree?.split(',')[1];
  const personBase64 = data.person?.split(',')[1];

  const contents = {
    parts: [
      { text: "당신은 전문 미술 치료사이자 심리학자입니다. 제공된 HTP(House-Tree-Person) 그림들을 심리학적으로 분석해주세요. 첫 번째는 집, 두 번째는 나무, 세 번째는 사람입니다. 선의 특징, 크기, 위치, 세부 요소를 분석하여 심층적인 심리 분석 결과를 한국어로 제공하세요. 반드시 제공된 JSON 스키마 형식에 맞춰 응답해야 합니다." },
      { inlineData: { mimeType: "image/png", data: houseBase64 || "" } },
      { inlineData: { mimeType: "image/png", data: treeBase64 || "" } },
      { inlineData: { mimeType: "image/png", data: personBase64 || "" } },
    ]
  };

  const response = await ai.models.generateContent({
    model: modelName,
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
                trait: { type: Type.STRING, description: "성격 특성 키워드" },
                score: { type: Type.NUMBER, description: "점수 (0-100)" },
                description: { type: Type.STRING, description: "상세 설명" }
              }
            }
          },
          emotionalState: { type: Type.STRING, description: "현재의 감정 상태" },
          advice: { type: Type.STRING, description: "심리학적 조언" },
          keyInsights: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["summary", "personalityTraits", "emotionalState", "advice", "keyInsights"]
      }
    }
  });

  // response.text는 메서드가 아니라 getter 속성입니다.
  const text = response.text;
  if (!text) throw new Error("분석 데이터를 받지 못했습니다.");

  try {
    return JSON.parse(text.trim()) as AnalysisResult;
  } catch (error) {
    console.error("JSON Parsing error:", error);
    throw new Error("분석 결과 해석 중 오류가 발생했습니다.");
  }
};

export const createCounselorChat = (result: AnalysisResult): Chat => {
  const model = 'gemini-3-pro-preview';
  
  const systemInstruction = `당신은 따뜻하고 공감 능력이 뛰어난 전문 AI 심리 상담사 '마인드 가이드'입니다. 
  사용자의 HTP 분석 결과(${result.summary})를 바탕으로 대화하세요. 
  친절한 해요체를 사용하고, 미술 치료 이론에 기반해 사용자의 마음을 어루만져 주세요.`;

  return ai.chats.create({
    model,
    config: {
      systemInstruction,
    },
  });
};