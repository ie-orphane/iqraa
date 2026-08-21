import type { Metadata } from "next";
import { Amiri, Handjet, Tajawal } from "next/font/google";
import "./globals.css";

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-amiri",
  display: "swap",
});

const handjet = Handjet({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["arabic"],
  variable: "--font-handjet",
  display: "swap",
});

const tajawal = Tajawal({
  weight: ["200", "300", "400", "500", "700"],
  subsets: ["arabic"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "اقرأ",
  description:
    "مكتبتك القرائية في مكان واحد — تابع ما تقرأ وما أنهيت وما تنتظر.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${amiri.variable} ${handjet.variable} ${tajawal.variable} h-full antialiased`}
    >
      {/* Browser extensions (e.g. ColorZilla) inject attrs like cz-shortcut-listen on <body> */}
      <body
        className="flex min-h-full flex-col bg-background font-tajawal text-foreground"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
