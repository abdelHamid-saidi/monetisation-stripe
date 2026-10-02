import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import Header from "@/components/Header";
import Providers from "./providers";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Paiement Stripe",
  description: "Paiement unique : produits et accès premium",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${display.variable} ${sans.variable} font-sans antialiased`}>
        <Providers>
          <div className="mx-auto min-h-screen max-w-5xl px-4 pb-16">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
