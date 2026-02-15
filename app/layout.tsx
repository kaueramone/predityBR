import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Fallback
import "./globals.css";
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "PredityBR - Realtime Prediction Markets",
    description: "Apostas binárias em tempo real.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
                {/* Header/Navbar placeholder */}
                <header className="border-b border-surface bg-secondary/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="PredityBR Logo" className="w-8 h-8 rounded-full" />
                            <span className="font-bold text-xl tracking-wider">PREDITY<span className="text-primary">BR</span></span>
                        </div>
                        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
                            <Link href="/" className="hover:text-white transition-colors">Mercados</Link>
                            <Link href="/wallet" className="hover:text-white transition-colors">Carteira</Link>
                            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
                        </nav>
                        <div className="flex items-center gap-4">
                            <button className="px-4 py-2 bg-surface hover:bg-surface/80 rounded text-sm font-medium transition-colors">Login</button>
                            <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded text-sm font-bold transition-colors shadow-[0_0_15px_rgba(47,124,70,0.5)]">Criar Conta</button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 container mx-auto px-4 py-8">
                    {children}
                </main>

                <footer className="border-t border-surface py-8 mt-12 bg-secondary/30">
                    <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                        &copy; 2026 PredityBR. Todos os direitos reservados.
                    </div>
                </footer>
            </body>
        </html>
    );
}
