/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // prompts/ 디렉터리를 서버리스 함수 번들에 포함 (Vercel 배포 시 txt 파일 접근용)
    outputFileTracingIncludes: {
      "/api/translate": ["./prompts/**"],
      "/api/settings": ["./prompts/**"],
    },
  },
};

export default nextConfig;
