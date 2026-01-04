
import { GoogleGenAI, Type } from "@google/genai";
import { DrawingData, AnalysisResult } from "../types";

// HTP (House-Tree-Person) Drawing analysis using Gemini 3 Pro
export const analyzeDrawings = async (data: DrawingData): Promise<AnalysisResult> => {
  const houseBase64 = data.house?.split(',')[1];
  const treeBase64 = data.tree?.split(',')[1];
  const personBase64 = data.person?.split(',')[1];

  if (!houseBase64 || !treeBase64 || !personBase64) {
    throw new Error("모든 그림(집, 나무, 사람)을 그려주셔야 분석이 가능합니다.");
  }

  const prompt = "당신은 전문 미술 치료사입니다. 제공된 HTP 그림(집, 나무, 사람 순서)을 분석하여 심리 분석 결과를 한국어로 제공하세요. 반드시 JSON 형식을 엄격히 지켜주세요. summary, personalityTraits (trait, score, description 포함), emotionalState, advice, keyInsights 필드를 포함해야 합니다.";

  try {
    // Initialize GoogleGenAI with the API key from environment variables
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Call generateContent with multimodal parts (text prompt and 3 drawings)
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { text: prompt },
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
            summary: {
              type: Type.STRING,
              description: "전체적인 심리 분석 요약"
            },
            personalityTraits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  trait: { type: Type.STRING, description: "성격 특성 키워드" },
                  score: { type: Type.NUMBER, description: "0-100 사이의 점수" },
                  description: { type: Type.STRING, description: "해당 특성에 대한 상세 설명" }
                },
                required: ["trait", "score", "description"]
              },
              description: "성격 지형도를 위한 주요 심리 기제 분석"
            },
            emotionalState: {
              type: Type.STRING,
              description: "현재의 정서적 상태 분석 보고"
            },
            advice: {
              type: Type.STRING,
              description: "심리적 조언 및 가이드라인"
            },
            keyInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "분석에서 도출된 핵심 인사이트 목록"
            }
          },
          required: ["summary", "personalityTraits", "emotionalState", "advice", "keyInsights"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI 응답 데이터가 없습니다.");
    
    // Parse the JSON string directly from the response text
    return JSON.parse(text.trim()) as AnalysisResult;
  } catch (error: any) {
    console.error("Analysis Error:", error);
    throw new Error(`심리 분석 도중 오류가 발생했습니다: ${error.message}`);
  }
};
