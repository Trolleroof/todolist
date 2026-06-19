import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taskboard",
  description: "A Trello-style task board with tags, assignees, and deadlines.",
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
