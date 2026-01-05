
import { GoogleGenAI, Type } from "@google/genai";

export const onRequestPost = async (context: any) => {
  try {
    const { house, tree, person } = await context.request.json();
    
    // Cloudflare Secret에서 API 키를 가져옵니다. 
    // 환경에 따라 env.API_KEY 또는 process.env.API_KEY를 참조합니다.
    const apiKey = context.env.API_KEY || process.env.API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "서버에 API 키가 설정되지 않았습니다." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `당신은 전문 미술 치료사입니다. 제공된 3장의 HTP(House-Tree-Person) 그림을 분석하여 심리 분석 결과를 한국어로 제공하세요.
    내담자의 그림에서 나타나는 특징적인 요소(선의 세기, 위치, 문이나 창문의 유무, 나무의 모양 등)를 포착하여 무의식적인 심리 상태를 심층적으로 분석해 주세요. 
    따뜻하고 공감적인 말투를 사용하되, 전문적인 통찰력을 잃지 마세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/png", data: house } },
            { inlineData: { mimeType: "image/png", data: tree } },
            { inlineData: { mimeType: "image/png", data: person } },
          ]
        }
      ],
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
                  description: { type: Type.STRING },
                },
                required: ["trait", "score", "description"],
              },
            },
            emotionalState: { type: Type.STRING },
            advice: { type: Type.STRING },
            keyInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["summary", "personalityTraits", "emotionalState", "advice", "keyInsights"],
        }
      }
    });

    return new Response(response.text, {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
