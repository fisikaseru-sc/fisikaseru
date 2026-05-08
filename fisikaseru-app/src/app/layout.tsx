import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FisikaSeru 3.0 — Platform Eksperimen Fisika Mendalam",
  description:
    "Platform pembelajaran fisika berbasis eksperimen sains mendalam. Rekonstruksi pemahaman konsep melalui simulasi interaktif, refleksi terbimbing, dan AI Tutor Sokratis.",
  keywords: [
    "fisika",
    "eksperimen",
    "simulasi",
    "pembelajaran",
    "sains",
    "pendidikan",
    "AI tutor",
  ],
  authors: [{ name: "FisikaSeru Team" }],
  openGraph: {
    title: "FisikaSeru 3.0 — Deep Understanding Physics Platform",
    description:
      "Rekonstruksi pemahaman fisika melalui eksperimen, refleksi, dan reasoning sains terbimbing.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-bg-primary text-text-primary">
        {children}
      </body>
    </html>
  );
}
