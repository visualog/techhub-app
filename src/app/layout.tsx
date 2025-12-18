import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar"; // Import new RightSidebar
import { BookmarksProvider } from "@/context/BookmarksContext";

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
      <body className={`${inter.className} bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100`}>
        <BookmarksProvider>
          <Header />
          <div className="max-w-screen-xl mx-auto flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr_240px] gap-4">
              {/* Left Sidebar */}
              <aside className="md:col-span-1 hidden md:block">
                <Sidebar />
              </aside>

              {/* Main Content */}
              <main className="flex-1 col-span-1 md:col-span-1 lg:col-span-1">
                {children}
              </main>

              {/* Right Sidebar */}
              <aside className="lg:col-span-1 hidden lg:block">
                <RightSidebar />
              </aside>
            </div>
          </div>
        </BookmarksProvider>
      </body>
    </html>
  );
}