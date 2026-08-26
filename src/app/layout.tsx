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

// Generic fallback only — the real wedding page ("/") overrides this with
// the couple's actual name/date/photo via generateMetadata() in page.tsx.
// Keeping a couple-specific title here would go stale the moment an admin
// renamed their project, since a root layout's metadata is static.
export const metadata: Metadata = {
  title: "Thiệp cưới online",
  description: "Website cưới cá nhân hoá, tạo trong vài phút.",
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
