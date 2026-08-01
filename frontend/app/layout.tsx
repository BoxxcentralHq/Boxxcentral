import type { Metadata } from "next";
import { Anton, Figtree } from "next/font/google";
import { Toaster } from "sonner";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";
import QueryProvider from "@/components/providers/QueryProvider";
import SiteChrome from "@/components/SiteChrome";
import { site } from "@/lib/site";
import "./globals.css";
import { cn } from "@/lib/utils";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const figtree = Figtree({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
  },
  // Google Search Console: once verified, add
  // verification: { google: "<code from search.google.com/search-console>" }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased font-sans",
        anton.variable,
        figtree.variable,
      )}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <LocalBusinessJsonLd />
        <QueryProvider>
          <SiteChrome>{children}</SiteChrome>
        </QueryProvider>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "!bg-boxx-coal !border-boxx-line !text-boxx-white",
              description: "!text-boxx-mist",
            },
          }}
        />
      </body>
    </html>
  );
}
