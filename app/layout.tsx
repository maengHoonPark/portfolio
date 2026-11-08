import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { themeInitScript } from "@/components/ui/ThemeToggle";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: "박명훈 | Java 백엔드 개발자",
  description: "문제를 정의하고, 만들고, 수치로 증명하는 백엔드 개발자 박명훈의 포트폴리오",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} h-full antialiased`}
      // data-theme은 인라인 스크립트가 하이드레이션 전에 넣으므로 불일치 경고를 끈다
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
