import type { Metadata } from "next";
import "./globals.css";
import ReminderDaemon from "./reminder-daemon";

export const metadata: Metadata = {
  title: "Project Next Step",
  description: "Stop distractions. Do one next step.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {/* 
          IMPORTANT:
          The Coach banner is position:fixed, so it can overlap page content.
          This padding reserves space so content/buttons aren't hidden behind it.
        */}
        <div className="min-h-screen pb-[260px]">{children}</div>

        {/* Fixed coach banner */}
        <ReminderDaemon />
      </body>
    </html>
  );
}
