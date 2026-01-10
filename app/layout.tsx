import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/components/providers/cart-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "Promociones del mes",
    description: "Catálogo de promociones del mes",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
                <CartProvider>
                    {children}
                </CartProvider>
            </body>
        </html>
    );
}
