import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import AccessibilityPanel from "./components/AccessibilityPanel";
import ColorBlindnessPanel from "./components/ColorBlindnessPanel";
import Announcer from "./components/Announcer";
import ClientComponents from "./components/ClientComponents";
import { lexendDeca } from "./utils/fonts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SciVerse - Interactive Science Learning",
  description: "An accessible platform for interactive science learning",
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({ children }) {  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${lexendDeca.variable}`}>
      <body className="min-h-screen bg-background text-foreground flex flex-col">
        <ThemeProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-primary text-white p-3 m-3 z-50">
            Skip to content
          </a>
          <Navigation />
          <main id="main-content" className="flex-grow">
            {children}
          </main>          <Footer />
          <AccessibilityPanel />
          <ColorBlindnessPanel />
          <Announcer />
          <ClientComponents />
        </ThemeProvider>
      </body>
    </html>
  );
}
