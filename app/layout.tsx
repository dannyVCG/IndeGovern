import "./globals.css";

export const metadata = {
  title: "Governance Tower",
  description: "Portfolio visibility and governance control",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}