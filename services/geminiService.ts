import { GoogleGenAI, Type } from "@google/genai";
import { DrawingData, AnalysisResult } from "../types";

export const analyzeDrawings = async (data: DrawingData): Promise<AnalysisResult> => {
  const houseBase64 = data.house?.split(',')[1];
  const treeBase64 = data.tree?.split(',')[1];
  const personBase64 = data.person?.split(',')[1];

  if (!houseBase64 || !treeBase64 || !personBase64) {
    throw new Error("모든 그림(집, 나무, 사람)을 그려주셔야 분석이 가능합니다.");
  }

  // Use the pre-configured API key from environment variables.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API 키가 설정되지 않았습니다. 환경 변수 설정을 확인해 주세요.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `당신은 전문 미술 치료사입니다. 제공된 3장의 HTP(House-Tree-Person) 그림을 분석하여 심리 분석 결과를 한국어로 제공하세요.
  내담자의 그림에서 나타나는 특징적인 요소(선의 세기, 위치, 문이나 창문의 유무, 나무의 모양 등)를 포착하여 무의식적인 심리 상태를 심층적으로 분석해 주세요. 
  따뜻하고 공감적인 말투를 사용하되, 전문적인 통찰력을 잃지 마세요.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "전반적인 심리 상태에 대한 한 줄 요약",
            },
            personalityTraits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  trait: { type: Type.STRING, description: "성격 특성 키워드 (예: 사회성, 안정성, 자아 존중감 등)" },
                  score: { type: Type.NUMBER, description: "1부터 100 사이의 점수" },
                  description: { type: Type.STRING, description: "해당 특성에 대한 구체적인 분석" },
                },
                required: ["trait", "score", "description"],
              },
            },
            emotionalState: {
              type: Type.STRING,
              description: "내담자의 현재 정서적 배경과 심리적 역동에 대한 상세 설명",
            },
            advice: {
              type: Type.STRING,
              description: "내담자에게 전하는 따뜻한 격려와 일상에서 실천 가능한 심리적 조언",
            },
            keyInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "분석을 통해 발견된 3가지 주요 심리적 통찰 (강점 또는 보완점)",
            },
          },
          required: ["summary", "personalityTraits", "emotionalState", "advice", "keyInsights"],
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("분석 결과를 생성하지 못했습니다.");
    
    return JSON.parse(text.trim()) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(error.message || "심리 분석 도중 기술적인 오류가 발생했습니다.");
  }
};