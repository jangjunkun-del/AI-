
// 이 플랫폼 환경에서는 보안 가이드라인에 따라 프론트엔드 SDK 직접 사용이 권장됩니다.
// API 키는 window.aistudio.openSelectKey()를 통해 안전하게 주입됩니다.
export const onRequestPost = async () => {
  return new Response(JSON.stringify({ 
    error: "프론트엔드 SDK를 사용하여 직접 통신해 주세요. (services/geminiService.ts 참고)" 
  }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
};
