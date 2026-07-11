import { Inter, Outfit } from "next/font/google";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "Blog Builder Platform",
  description: "A premium, production-ready SaaS Blog Builder platform.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/logo.png", sizes: "any", type: "image/png" },
    ],
    apple: { url: "/logo.png", sizes: "180x180", type: "image/png" },
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body
        className="min-h-full bg-background text-foreground font-sans"
        suppressHydrationWarning
      >
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
