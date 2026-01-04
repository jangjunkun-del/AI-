import { GoogleGenAI, Type, Chat } from "@google/genai";
import { DrawingData, AnalysisResult } from "../types";

export const analyzeDrawings = async (data: DrawingData): Promise<AnalysisResult> => {
  // Vite의 define을 통해 주입된 환경변수를 사용합니다.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === '') {
    throw new Error("API 키가 설정되지 않았습니다. 프로젝트 설정에서 API_KEY 환경 변수를 확인해주세요.");
  }

  // 매 요청마다 새로운 인스턴스를 생성하여 최신 키를 반영하도록 합니다.
  const ai = new GoogleGenAI({ apiKey });
  const modelName = "gemini-3-pro-preview";
  
  const houseBase64 = data.house?.split(',')[1];
  const treeBase64 = data.tree?.split(',')[1];
  const personBase64 = data.person?.split(',')[1];

  if (!houseBase64 || !treeBase64 || !personBase64) {
    throw new Error("그림 데이터가 누락되었습니다. 모든 그림을 완료해주세요.");
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { text: "당신은 전문 미술 치료사입니다. 제공된 HTP 그림(집, 나무, 사람 순서)을 분석하여 심리 분석 결과를 한국어로 제공하세요. 반드시 JSON 형식을 엄격히 지켜주세요." },
          { inlineData: { mimeType: "image/png", data: houseBase64 } },
          { inlineData: { mimeType: "image/png", data: treeBase64 } },
          { inlineData: { mimeType: "image/png", data: personBase64 } },
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            personalityTraits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  trait: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  description: { type: Type.STRING }
                }
              }
            },
            emotionalState: { type: Type.STRING },
            advice: { type: Type.STRING },
            keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "personalityTraits", "emotionalState", "advice", "keyInsights"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI 응답이 비어있습니다.");
    return JSON.parse(text.trim()) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(`심리 분석 실패: ${error.message || '네트워크 오류가 발생했습니다.'}`);
  }
};

export const createCounselorChat = (result: AnalysisResult): Chat => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API 키를 찾을 수 없습니다.");
  
  const ai = new GoogleGenAI({ apiKey });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `당신은 분석 결과(${result.summary})를 바탕으로 내담자의 마음을 공감하고 위로하며, 전문적인 조언을 건네는 따뜻한 미술 치료 상담사입니다. 답변은 친절하고 정중한 한국어로 작성하세요.`,
    },
  });
};