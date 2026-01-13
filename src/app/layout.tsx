import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BookmarksProvider } from "@/context/BookmarksContext";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";

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
    <html lang="ko" suppressHydrationWarning>
      <body className={`bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100`} style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <UIProvider>
              <BookmarksProvider>
                <Header />
                <div className="max-w-screen-xl mx-auto flex flex-col">
                  <div className="flex flex-1 flex-col md:flex-row">
                    <Sidebar />
                    <main className="flex-1 min-w-0">
                      {children}
                    </main>
                  </div>
                </div>
              </BookmarksProvider>
            </UIProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}