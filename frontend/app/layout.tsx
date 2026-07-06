import type { Metadata } from "next";
import { Anton, Figtree } from "next/font/google";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
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
      <body className="flex min-h-full flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
