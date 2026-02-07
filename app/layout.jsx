import "./globals.css";
import { Inter } from "next/font/google";
import { LanguageProvider } from "../components/LanguageProvider";
import AutoTranslate from "../components/AutoTranslate";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata = {
  title: "Adaptive City - Action Intelligence",
  description: "City Action Intelligence System demo.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <LanguageProvider>
          <AutoTranslate>{children}</AutoTranslate>
        </LanguageProvider>
      </body>
    </html>
  );
}
