import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lesson Studio Lab",
  description: "Internal: cost ledger, evals and model bakeoff.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f4f5f7", color: "#1b1f27", fontFamily: "system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
