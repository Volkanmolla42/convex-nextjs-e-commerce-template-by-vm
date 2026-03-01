import type { Metadata } from "next";
import { Cormorant_Garamond, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ThemeProvider } from "next-themes";
import LayoutChrome from "@/components/LayoutChrome";
import { storeConfig } from "@/lib/store-config";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: storeConfig.seoDefaults.title,
  description: storeConfig.seoDefaults.description,
  icons: {
    icon: "/convex.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang={storeConfig.locale === "tr-TR" ? "tr" : "en"} suppressHydrationWarning>
        <body className={`${nunitoSans.variable} ${cormorant.variable} antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ConvexClientProvider>
              <LayoutChrome>{children}</LayoutChrome>
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
