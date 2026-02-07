import type { Metadata } from "next";
import "./globals.css";

import ReminderDaemon from "./reminder-daemon";
import SyncDaemon from "./app/sync-daemon";

export const metadata: Metadata = {
  title: "Project Next Step",
  description: "Stop distractions. Do one next step.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {/* Reserve space so the fixed Coach banner doesn't cover buttons */}
        <div className="min-h-screen pb-[260px]">{children}</div>

        {/* Fixed overlays */}
        <SyncDaemon />
        <ReminderDaemon />
      </body>
    </html>
  );
}
