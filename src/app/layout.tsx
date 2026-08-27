import type { Metadata, Viewport } from "next";
import { Playfair_Display, Cormorant_Garamond, Be_Vietnam_Pro, Great_Vibes } from "next/font/google";
import { SmoothScrollProvider } from "@/lib/smooth-scroll";
import "./globals.css";

const heading = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  display: "swap",
});

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Site-wide fallback — /wedding/[slug] overrides this per-couple via its
// own generateMetadata(), and "/" (the marketing homepage) sets its own
// richer metadata in page.tsx. This is what's left for anything else
// (admin, 404s, etc.) and the base every other page's OG/Twitter tags
// inherit from unless they override.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://motdoi.click";
const SITE_NAME = "Wedding Studio";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Thiệp cưới online",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Tạo thiệp cưới online, website cưới đẹp như phim chỉ trong vài phút — không cần biết code. Thiệp mời cưới điện tử, RSVP, sổ lưu bút, mừng cưới online.",
  keywords: [
    "thiệp cưới online",
    "thiệp mời cưới online",
    "thiệp cưới điện tử",
    "thiệp mời đám cưới online",
    "tạo thiệp cưới online miễn phí",
    "thiệp cưới miễn phí",
    "website cưới",
    "web cưới online",
    "mẫu thiệp cưới đẹp",
    "thiệp cưới 3D",
    "phim cưới",
    "save the date online",
    "rsvp online",
    "thiệp cưới cá nhân hoá",
  ],
  applicationName: SITE_NAME,
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    siteName: SITE_NAME,
    locale: "vi_VN",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f6f1ea",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${heading.variable} ${serif.variable} ${body.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ivory text-ink font-body">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
