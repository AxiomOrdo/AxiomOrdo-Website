import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.axiomordo.com"),
  title: "PFAS Compliance Review | AxiomOrdo",
  description:
    "Deterministic, evidence-linked PFAS review for organisations that need a defensible position before customer, regulatory, or internal challenge.",
  openGraph: {
    title: "PFAS Compliance Review | AxiomOrdo",
    description:
      "Know where you stand on PFAS before you are asked. Deterministic, evidence-linked review for exposed portfolios and challenged decisions.",
    url: "https://www.axiomordo.com/pfas",
    siteName: "AxiomOrdo",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "PFAS Compliance Review | AxiomOrdo",
    description:
      "Deterministic PFAS review for organisations that need a defensible position under scrutiny."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
