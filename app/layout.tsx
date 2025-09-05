import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "JIGASHA - Test Your Knowledge",
  description: "A modern quiz app with multiple categories and difficulty levels",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-128.png", sizes: "128x128", type: "image/png" },
      { url: "/favicon-196x196.png", sizes: "196x196", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon-57x57.png", sizes: "57x57" },
      { url: "/apple-touch-icon-60x60.png", sizes: "60x60" },
      { url: "/apple-touch-icon-72x72.png", sizes: "72x72" },
      { url: "/apple-touch-icon-76x76.png", sizes: "76x76" },
      { url: "/apple-touch-icon-114x114.png", sizes: "114x114" },
      { url: "/apple-touch-icon-120x120.png", sizes: "120x120" },
      { url: "/apple-touch-icon-144x144.png", sizes: "144x144" },
      { url: "/apple-touch-icon-152x152.png", sizes: "152x152" },
    ],
    other: [
      { rel: "msapplication-TileImage", url: "/mstile-70x70.png" },
      { rel: "msapplication-TileImage", url: "/mstile-144x144.png" },
      { rel: "msapplication-TileImage", url: "/mstile-150x150.png" },
      { rel: "msapplication-TileImage", url: "/mstile-310x150.png" },
      { rel: "msapplication-TileImage", url: "/mstile-310x310.png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "JIGASHA - Test Your Knowledge",
    description: "Challenge yourself with quizzes across multiple categories and difficulty levels.",
    url: "https://jigasha.vercel.app",
    siteName: "JIGASHA",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JIGASHA - Quiz App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JIGASHA - Test Your Knowledge",
    description: "Challenge yourself with fun quizzes and earn achievements.",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body
        className={`font-sans bg-background text-foreground ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen">
              <p className="text-lg font-medium">Loading...</p>
            </div>
          }
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
