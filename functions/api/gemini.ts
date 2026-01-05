
export const onRequestPost = async (ctx: { request: Request; env: { API_KEY: string } }) => {
  const apiKey = ctx.env.API_KEY;
  
  if (!apiKey) {
    return new Response(JSON.stringify({ 
      error: "API_KEY가 설정되지 않았습니다. Cloudflare Pages 설정에서 API_KEY 환경변수를 확인해주세요." 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await ctx.request.json();
    const { searchParams } = new URL(ctx.request.url);
    const model = searchParams.get("model") || "gemini-3-pro-preview";
    
    // Google Gemini REST API 엔드포인트
    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(googleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.text();
    return new Response(data, {
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
