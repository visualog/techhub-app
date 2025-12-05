/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wp.toss.tech',
      },
      {
        protocol: 'https',
        hostname: 'tech.kakao.com',
      },
      {
        protocol: 'https',
        hostname: 'images.openai.com',
      },
      {
        protocol: 'https',
        hostname: 'd2.naver.com',
      },
      {
        protocol: 'https',
        hostname: 't1.kakaocdn.net',
      },
      // Add other image hosts as needed
    ],
  },
};

module.exports = nextConfig;
