export const onRequestGet = async () => {
  const robots = `User-agent: *
Allow: /

Sitemap: https://ai.codingfun.kr/sitemap.xml`;

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};