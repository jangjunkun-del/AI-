
import { DrawingData, AnalysisResult } from "../types";

export const analyzeDrawings = async (data: DrawingData): Promise<AnalysisResult> => {
  const houseBase64 = data.house?.split(',')[1];
  const treeBase64 = data.tree?.split(',')[1];
  const personBase64 = data.person?.split(',')[1];

  if (!houseBase64 || !treeBase64 || !personBase64) {
    throw new Error("모든 그림(집, 나무, 사람)을 그려주셔야 분석이 가능합니다.");
  }

  const prompt = "당신은 전문 미술 치료사입니다. 제공된 HTP 그림(집, 나무, 사람 순서)을 분석하여 심리 분석 결과를 한국어로 제공하세요. 반드시 JSON 형식을 엄격히 지켜주세요. summary, personalityTraits (trait, score, description 포함), emotionalState, advice, keyInsights 필드를 포함해야 합니다.";

  // Gemini REST API 규격에 맞춘 요청 바디
  const requestBody = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: "image/png", data: houseBase64 } },
        { inline_data: { mime_type: "image/png", data: treeBase64 } },
        { inline_data: { mime_type: "image/png", data: personBase64 } },
      ]
    }],
    generationConfig: {
      response_mime_type: "application/json"
    }
  };

  try {
    // 우리가 만든 Cloudflare Function 프록시 호출
    const response = await fetch("/api/gemini?model=gemini-3-pro-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`분석 요청 실패: ${errorText}`);
    }

    const resultData = await response.json();
    const text = resultData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) throw new Error("AI로부터 유효한 응답을 받지 못했습니다.");
    
    return JSON.parse(text.trim()) as AnalysisResult;
  } catch (error: any) {
    console.error("Analysis Error:", error);
    throw new Error(error.message || "심리 분석 도중 오류가 발생했습니다.");
  }
};
