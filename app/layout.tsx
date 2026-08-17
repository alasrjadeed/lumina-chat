import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { JsonLdSchema } from "@/components/json-ld-schema";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://lumina-chat.vercel.app"),

  title: {
    default:
      "Lumina Chat — AI Chatbot Platform | AL ASAR JADEED Bahrain & Saudi Arabia",
    template:
      "%s | Lumina Chat — AI Chatbot by AL ASAR JADEED Bahrain & Saudi Arabia",
  },

  description:
    "Lumina Chat is a powerful AI-powered chatbot platform developed by AL ASAR JADEED, a leading digital agency in Bahrain and Saudi Arabia. Build intelligent conversational agents, automate customer support, and deploy AI chatbots across your business — no coding required. Free tier available.",

  keywords: [
    // Primary English
    "AI chatbot",
    "AI chatbot Bahrain",
    "AI chatbot Saudi Arabia",
    "chatbot platform",
    "AI assistant Bahrain",
    "AI assistant Saudi Arabia",
    "conversational AI",
    "customer support AI",
    "business automation Bahrain",
    "business automation Saudi Arabia",
    "WhatsApp chatbot",
    "enterprise AI Bahrain",
    "enterprise AI Saudi Arabia",
    "LLM chatbot",
    "GPT chatbot Bahrain",
    "GPT chatbot Saudi Arabia",
    "Arabic AI chatbot",
    "Arabic chatbot",
    "multilingual AI",
    // Company
    "AL ASAR JADEED",
    "AL ASAR JADEED Bahrain",
    "AL ASAR JADEED Saudi Arabia",
    "AL ASAR JADEED AI",
    "AL ASAR JADEED chatbot",
    "alasarjadeed.com",
    // GCC region
    "AI solutions GCC",
    "chatbot UAE",
    "chatbot Kuwait",
    "chatbot Qatar",
    "chatbot Oman",
    "AI agency Middle East",
    "digital transformation Bahrain",
    "digital transformation Saudi Arabia",
    "Saudi Vision 2030 AI",
    // Feature keywords
    "free AI chatbot",
    "AI chatbot with tools",
    "AI document editor",
    "voice AI assistant",
    "AI web search",
    "multi-model AI",
    "OpenAI GPT-4",
    "Claude AI",
    "Gemini AI",
    "DeepSeek AI",
  ],

  authors: [{ name: "AL ASAR JADEED", url: "https://alasarjadeed.com" }],
  creator: "AL ASAR JADEED",
  publisher: "AL ASAR JADEED",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_BH",
    url: "https://lumina-chat.vercel.app",
    siteName: "Lumina Chat — AL ASAR JADEED",
    title:
      "Lumina Chat — AI Chatbot Platform | AL ASAR JADEED Bahrain & Saudi Arabia",
    description:
      "Powerful AI-powered chatbot platform by AL ASAR JADEED. Build intelligent conversational AI agents, automate customer support, and deploy chatbots across your business. Free tier available. Serving Bahrain, Saudi Arabia, and the GCC.",
    images: [
      {
        url: "/logo/lumina-logo.png",
        width: 1200,
        height: 630,
        alt: "Lumina Chat — AI Chatbot Platform by AL ASAR JADEED",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title:
      "Lumina Chat — AI Chatbot Platform | AL ASAR JADEED Bahrain & Saudi Arabia",
    description:
      "Powerful AI-powered chatbot platform by AL ASAR JADEED. Build intelligent conversational AI agents for your business. Free tier available. Bahrain, Saudi Arabia & GCC.",
    images: ["/logo/lumina-logo.png"],
    creator: "@alasarjadeed",
  },

  other: {
    "application-name": "Lumina Chat",
    "apple-mobile-web-app-title": "Lumina Chat",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#000000",
    "theme-color": "#000000",
    // Geo-targeting for GCC
    "geo.region": "BH-13",
    "geo.placename": "Manama",
    "geo.position": "26.2285;50.5860",
    ICBM: "26.2285, 50.5860",
    // Language
    "content-language": "en",
    // Company details
    "company-name": "AL ASAR JADEED",
    "company-email": "info@alasarjadeed.com",
    "company-url": "https://alasarjadeed.com",
    // Revisit
    "revisit-after": "7 days",
    rating: "general",
    // AI/LLM specific
    "ai-content-declaration": "human-authored",
    "llms-friendly": "true",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

const LIGHT_THEME_COLOR = "hsl(0 0% 100%)";
const DARK_THEME_COLOR = "hsl(240deg 10% 3.92%)";
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${geist.variable} ${geistMono.variable}`}
      dir="ltr"
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <JsonLdSchema />
        <link href="https://lumina-chat.vercel.app" rel="canonical" />
        <link
          href="https://lumina-chat.vercel.app"
          hrefLang="en"
          rel="alternate"
        />
        <link
          href="https://lumina-chat.vercel.app"
          hrefLang="ar"
          rel="alternate"
        />
        <link
          href="https://lumina-chat.vercel.app"
          hrefLang="x-default"
          rel="alternate"
        />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required"
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <SessionProvider
            basePath={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/auth`}
          >
            <TooltipProvider>{children}</TooltipProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
