
import { GoogleGenAI } from "@google/genai";
import { DrawingData, AnalysisResult } from "../types";

export const analyzeDrawings = async (data: DrawingData): Promise<AnalysisResult> => {
  const houseBase64 = data.house?.split(',')[1];
  const treeBase64 = data.tree?.split(',')[1];
  const personBase64 = data.person?.split(',')[1];

  if (!houseBase64 || !treeBase64 || !personBase64) {
    throw new Error("모든 그림(집, 나무, 사람)을 그려주셔야 분석이 가능합니다.");
  }

  // 가이드라인에 따른 SDK 초기화
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = "당신은 전문 미술 치료사입니다. 제공된 HTP 그림(집, 나무, 사람 순서)을 분석하여 심리 분석 결과를 한국어로 제공하세요. 반드시 JSON 형식을 엄격히 지켜주세요. summary, personalityTraits (trait, score, description 포함), emotionalState, advice, keyInsights 필드를 포함해야 합니다.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/png", data: houseBase64 } },
            { inlineData: { mimeType: "image/png", data: treeBase64 } },
            { inlineData: { mimeType: "image/png", data: personBase64 } },
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI로부터 분석 결과를 받지 못했습니다.");
    
    return JSON.parse(text.trim()) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(error.message || "심리 분석 도중 오류가 발생했습니다.");
  }
};
