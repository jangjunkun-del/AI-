
import { DrawingData, AnalysisResult } from "../types";

export const analyzeDrawings = async (data: DrawingData): Promise<AnalysisResult> => {
  const houseBase64 = data.house?.split(',')[1];
  const treeBase64 = data.tree?.split(',')[1];
  const personBase64 = data.person?.split(',')[1];

  if (!houseBase64 || !treeBase64 || !personBase64) {
    throw new Error("모든 그림(집, 나무, 사람)을 그려주셔야 분석이 가능합니다.");
  }

  // 브라우저에서 직접 호출하지 않고, 우리가 만든 Cloudflare Function으로 요청을 보냅니다.
  // 이 방식은 API 키를 브라우저에 노출하지 않아 매우 안전합니다.
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        house: houseBase64,
        tree: treeBase64,
        person: personBase64
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "서버 분석 도중 오류가 발생했습니다.");
    }

    const result = await response.json();
    return result as AnalysisResult;
  } catch (error: any) {
    console.error("Analysis Error:", error);
    throw new Error(error.message || "심리 분석 서비스와 연결할 수 없습니다.");
  }
};
