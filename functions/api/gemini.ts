
export const onRequestPost = async (ctx: { request: Request; env: { API_KEY: string } }) => {
  const apiKey = ctx.env.API_KEY;
  
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Cloudflare 환경변수 API_KEY가 설정되지 않았습니다." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await ctx.request.json();
    const { searchParams } = new URL(ctx.request.url);
    const model = searchParams.get("model") || "gemini-3-pro-preview";
    
    // Google Gemini API REST 엔드포인트 호출
    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(googleApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.text();
    return new Response(result, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: `Proxy Error: ${error.message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
