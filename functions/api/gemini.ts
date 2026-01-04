
// Handle the POST request for the Gemini API proxy with fixed context typing
export const onRequestPost = async (ctx: { request: Request; env: { API_KEY: string } }) => {
  const apiKey = ctx.env.API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API_KEY가 Cloudflare 설정에 없습니다. Pages 대시보드의 'Settings > Environment variables'에서 API_KEY(빌드 및 런타임 모두)를 확인해주세요." }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const body = await ctx.request.json();
    const urlObj = new URL(ctx.request.url);
    const model = urlObj.searchParams.get("model") || "gemini-3-pro-preview";
    
    // Google Gemini API REST 엔드포인트
    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(googleUrl, {
      method: "POST",
      headers: { 
        "content-type": "application/json"
      },
      body: JSON.stringify(body),
    });

    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: { "content-type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: `Proxy Error: ${error.message}` }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
