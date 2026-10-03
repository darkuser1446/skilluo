import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Skill Up 2026 | An Initiative of Super 60",
  description:
    "A premier yearly hands-on C++ workshop by Super 60. Master systems programming, ship real assignments, climb assessments, and learn from top mentors.",
  keywords: [
    "Skill Up",
    "Super 60",
    "C++ Workshop",
    "Systems Programming",
    "Aditya S",
    "Computer Science",
    "Mentorship",
  ],
  openGraph: {
    title: "Skill Up 2026 | An Initiative of Super 60",
    description:
      "A premier yearly hands-on C++ workshop by Super 60. Master systems programming, ship real assignments, and learn from top mentors.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} dark scroll-smooth`}>
      <body className="bg-background text-foreground antialiased selection:bg-brand-orange selection:text-white relative">
        {children}
      </body>
    </html>
  );
}
