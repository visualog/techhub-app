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
      {
        protocol: 'https',
        hostname: 'static.toss.im',
      },
      {
        protocol: 'https',
        hostname: 'img1.kakaocdn.net',
      },
      {
        protocol: 'https',
        hostname: 'phinf.pstatic.net',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'static.cdnlogo.com',
      },
      // Add other image hosts as needed
    ],
  },
};

module.exports = nextConfig;
