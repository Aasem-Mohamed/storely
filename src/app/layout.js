import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata = {
  title: "Storely — Honest Objects",
  description: "Considered, durable goods for everyday life.",
};

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-base-100 text-base-content">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            {/* Footer */}
            <footer className="footer footer-center bg-base-200 text-base-content p-8 mt-auto border-t border-base-300">
              <aside>
                <p className="text-sm text-base-content/60">
                  © {new Date().getFullYear()} Storely — Considered goods for everyday life.
                </p>
              </aside>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
