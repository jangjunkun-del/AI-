import { GoogleGenAI, Type, Chat } from "@google/genai";
import { DrawingData, AnalysisResult } from "../types";

export const analyzeDrawings = async (data: DrawingData): Promise<AnalysisResult> => {
  // process.env.API_KEY는 Vite 빌드 시 실제 값으로 치환됩니다.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey.length < 10) {
    throw new Error("API 키를 찾을 수 없습니다. 환경 변수 설정에 API_KEY가 등록되어 있는지, 그리고 index.html에 importmap이 제거되었는지 확인해주세요.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = "gemini-3-pro-preview";
  
  const houseBase64 = data.house?.split(',')[1];
  const treeBase64 = data.tree?.split(',')[1];
  const personBase64 = data.person?.split(',')[1];

  if (!houseBase64 || !treeBase64 || !personBase64) {
    throw new Error("모든 그림(집, 나무, 사람)을 그려주셔야 분석이 가능합니다.");
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
    if (!text) throw new Error("AI 응답 데이터가 없습니다.");
    return JSON.parse(text.trim()) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(`심리 분석 도중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
  }
};

export const createCounselorChat = (result: AnalysisResult): Chat => {
  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `당신은 분석 결과(${result.summary})를 바탕으로 내담자의 마음을 따뜻하게 공감해주고 위로해주는 미술 치료 상담사입니다. 답변은 한국어로 친절하게 작성하세요.`,
    },
  });
};