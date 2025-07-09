import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/sonner";
import { UserProfile } from "@/components/user-profile";
import { ConvexClientProvider } from "@/lib/convex-provider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Heardly - AI-Powered Call Transcription",
  description: "Transform your voice recordings into intelligent summaries",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning={true}>
        <body className={inter.className}>
          <ConvexClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="h-screen bg-background grid grid-rows-[auto_1fr] overflow-hidden">
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h1 className="text-2xl font-bold">Heardly</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                      <ThemeToggle />
                      <UserProfile />
                    </div>
                  </div>
                </header>
                <main className="overflow-auto">{children}</main>
              </div>
              <Toaster />
            </ThemeProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
