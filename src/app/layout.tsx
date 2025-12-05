import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechHub",
  description: "국내 기술·디자인·트렌드 커뮤니티 콘텐츠 통합 큐레이션 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex flex-1 flex-col md:flex-row">
            <Sidebar />
            <div className="flex-1">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
