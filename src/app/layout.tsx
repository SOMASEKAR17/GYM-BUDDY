import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import BackgroundBeams from "@/components/BackgroundBeams";
import NotificationHandler from "@/components/NotificationHandler";

export const metadata: Metadata = {
  title: "GymBuddy | VIT Gym Partner Matching",
  description:
    "Find your perfect gym partner at VIT. Match with students who share your workout schedule, goals, and training style.",
  keywords: "VIT gym partner, gym buddy, fitness matching, VIT students workout",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {/* Fixed 3-D beam background — sits at z-0, behind everything */}
        <BackgroundBeams />
        <NotificationHandler />

        {/* Noise texture overlay — z-999, above everything */}
        <div className="noise-overlay" />

        {/* All page content — z-1, above the canvas */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#161616",
              color: "#fff",
              border: "1px solid rgba(230, 57, 70, 0.3)",
              borderRadius: "8px",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "#E63946",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
