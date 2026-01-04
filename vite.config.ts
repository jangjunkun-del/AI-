
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Cloudflare 빌드 단계에서 주입되는 API_KEY를 Vite 환경 변수로 연결합니다.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // 대용량 청크 경고를 방지하기 위해 설정
    chunkSizeWarningLimit: 1000,
  }
});
