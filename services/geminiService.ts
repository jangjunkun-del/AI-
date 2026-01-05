
import { GoogleGenAI } from "@google/genai";
import { DrawingData, AnalysisResult } from "../types";

export const analyzeDrawings = async (data: DrawingData): Promise<AnalysisResult> => {
  const houseBase64 = data.house?.split(',')[1];
  const treeBase64 = data.tree?.split(',')[1];
  const personBase64 = data.person?.split(',')[1];

  if (!houseBase64 || !treeBase64 || !personBase64) {
    throw new Error("모든 그림(집, 나무, 사람)을 그려주셔야 분석이 가능합니다.");
  }

  // 가이드라인: 호출 직전에 인스턴스 생성하여 process.env.API_KEY 반영
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `당신은 전문 미술 치료사입니다. 제공된 3장의 HTP(House-Tree-Person) 그림을 분석하여 심리 분석 결과를 한국어로 제공하세요.
  반드시 다음 JSON 형식을 엄격히 지켜서 응답하세요:
  {
    "summary": "전반적인 심리 상태 요약",
    "personalityTraits": [
      {"trait": "성격 특성 키워드", "score": 0-100 점수, "description": "상세 설명"}
    ],
    "emotionalState": "현재 느끼는 감정에 대한 상세 분석",
    "advice": "내담자를 위한 따뜻한 조언",
    "keyInsights": ["가장 중요한 발견점 1", "2", "3"]
  }`;

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
    if (error.message?.includes("entity was not found")) {
      // 키 선택 초기화 트리거를 위해 에러를 전파
      throw new Error("API 키가 유효하지 않거나 권한이 없습니다. 다시 선택해주세요.");
    }
    throw new Error(error.message || "심리 분석 도중 오류가 발생했습니다.");
  }
};
