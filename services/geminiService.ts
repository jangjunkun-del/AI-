import { GoogleGenAI, Type, Chat } from "@google/genai";
import { DrawingData, AnalysisResult } from "../types";

export const analyzeDrawings = async (data: DrawingData): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey.trim() === "" || apiKey === "undefined") {
    throw new Error("API 키가 설정되지 않았습니다. 클라우드플레어 환경 변수(API_KEY)를 확인해 주세요.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = "gemini-3-flash-preview";
  
  const houseBase64 = data.house?.split(',')[1];
  const treeBase64 = data.tree?.split(',')[1];
  const personBase64 = data.person?.split(',')[1];

  if (!houseBase64 || !treeBase64 || !personBase64) {
    throw new Error("그림 데이터가 누락되었습니다. 모든 그림을 그려주세요.");
  }

  const contents = [
    {
      role: "user",
      parts: [
        { text: "당신은 전문 미술 치료사입니다. 제공된 HTP 그림(집, 나무, 사람 순서)을 분석하여 심리 결과를 한국어로 제공하세요. 반드시 JSON 형식을 지켜주세요." },
        { inlineData: { mimeType: "image/png", data: houseBase64 } },
        { inlineData: { mimeType: "image/png", data: treeBase64 } },
        { inlineData: { mimeType: "image/png", data: personBase64 } },
      ]
    }
  ];

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents,
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
    if (!text) throw new Error("AI로부터 응답을 받지 못했습니다.");
    return JSON.parse(text.trim()) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini Error Details:", error);
    const msg = error?.message || "알 수 없는 오류";
    if (msg.includes("403") || msg.includes("API key")) {
      throw new Error("API 키 권한 오류가 발생했습니다. 키가 활성화되었는지 확인하세요.");
    }
    throw new Error(`분석 중 오류 발생: ${msg}`);
  }
};

export const createCounselorChat = (result: AnalysisResult): Chat => {
  const apiKey = process.env.API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `분석 결과(${result.summary})를 바탕으로 따뜻하게 상담해주는 상담사입니다.`,
    },
  });
};