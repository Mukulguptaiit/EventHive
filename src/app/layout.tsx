import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "../styles/globals.css";

export const metadata: Metadata = {
  // Ensure absolute URLs for OpenGraph/Twitter images
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000"),
  title: "EventHive - Where Events Come Alive",
  description: "A comprehensive event management platform where organizers can easily create, publish, and manage events with flexible ticketing and promotions, while attendees can seamlessly discover, register, pay, and receive tickets via Email/WhatsApp along with timely reminders and smooth check-in experiences.",
  keywords: ["events", "event management", "ticketing", "event discovery", "event booking", "event platform", "India"],
  authors: [{ name: "EventHive Team" }],
  openGraph: {
    title: "EventHive - Where Events Come Alive",
    description: "Discover, book, and manage amazing events across India",
    url: "https://eventhive.com",
    siteName: "EventHive",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EventHive - Event Management Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventHive - Where Events Come Alive",
    description: "Discover, book, and manage amazing events across India",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
