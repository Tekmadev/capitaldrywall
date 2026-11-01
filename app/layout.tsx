import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AnalyticsListeners } from "@/components/analytics/AnalyticsListeners";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { SkipLink } from "@/components/layout/SkipLink";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { site } from "@/content/site.config";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Drywall & Basement Renovations Ottawa | Capital Drywall",
    template: "%s",
  },
  description:
    "Ottawa drywall installation, repair, Level 5 finishing and full basement renovations. Dust-controlled, paint-ready results. Free quotes across Ottawa.",
  applicationName: site.name,
  // Safety net for any page that forgets pageMetadata(): pages override these.
  openGraph: { type: "website", locale: "en_CA", siteName: site.name },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#141518",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-CA" className={fontVariables}>
      <body>
        <SkipLink />
        <SmoothScroll>
          <Header />
          <main id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
        </SmoothScroll>
        <MobileActionBar />
        <ConsentBanner />
        <SiteJsonLd />
        <AnalyticsListeners />
        {/* Vercel serves these scripts only on its own platform; elsewhere they would 404. */}
        {process.env.VERCEL && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
