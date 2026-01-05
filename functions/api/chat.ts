
import { GoogleGenAI } from "@google/genai";

export const onRequestPost = async (context: any) => {
  try {
    const { message, history, contextResult } = await context.request.json();
    const apiKey = context.env.API_KEY || process.env.API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API 키 설정 필요" }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `당신은 내담자의 HTP 분석 결과(요약: ${contextResult.summary}, 조언: ${contextResult.advice})를 알고 있는 전문 심리상담사입니다. 따뜻하고 공감적인 미술 치료 전문가로서 대화하세요.`,
      }
    });

    const response = await chat.sendMessage({ message });
    return new Response(JSON.stringify({ text: response.text }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
