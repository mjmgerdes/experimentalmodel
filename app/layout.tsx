import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Word → Object | Canine semantic understanding",
  description:
    "An interactive scientific reconstruction of Boros et al. (2024): explore the canine EEG setup and the match–mismatch trial.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
