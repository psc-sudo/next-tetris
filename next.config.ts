import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 빌드 시 타입 에러가 있으면 배포를 막아서 사전에 문제를 잡아냄
  // (지침의 "빌드 테스트 고려" 원칙 반영)
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
};

export default nextConfig;