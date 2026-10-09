import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
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
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Sora:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground antialiased selection:bg-brand-orange selection:text-white relative">
        {children}
      </body>
    </html>
  );
}

