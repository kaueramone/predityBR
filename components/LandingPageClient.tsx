"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, Trophy } from 'lucide-react';
import MarketCard from '@/components/MarketCard';
import Footer from '@/components/Footer';

const TYPING_WORDS = ["Política", "Futebol", "BBB", "Economia", "Oscar"];

interface LandingPageClientProps {
    featuredMarkets: any[];
    heroCards: any[];
}

export default function LandingPageClient({ featuredMarkets, heroCards }: LandingPageClientProps) {
    const [text, setText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [wordIndex, setWordIndex] = useState(0);
    const [activeCardIndex, setActiveCardIndex] = useState(0);

    // Card Rotation Interval
    useEffect(() => {
        if (heroCards.length === 0) return;
        const interval = setInterval(() => {
            setActiveCardIndex((prev) => (prev + 1) % heroCards.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [heroCards.length]);

    // Typewriter Effect
    useEffect(() => {
        const currentWord = TYPING_WORDS[wordIndex];
        const typeSpeed = isDeleting ? 50 : 100;

        const timer = setTimeout(() => {
            if (!isDeleting && text === currentWord) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && text === "") {
                setIsDeleting(false);
                setWordIndex((prev) => (prev + 1) % TYPING_WORDS.length);
            } else {
                setText(currentWord.substring(0, text.length + (isDeleting ? -1 : 1)));
            }
        }, typeSpeed);

        return () => clearTimeout(timer);
    }, [text, isDeleting, wordIndex]);

    return (
        <div className="flex flex-col min-h-screen">

            {/* 1. Banner Slider (Top) */}
            <div className="w-full bg-[#0f1115] pt-16 md:pt-20">
                <div className="container mx-auto px-4">
                    <div className="w-full h-[350px] rounded-xl overflow-hidden shadow-2xl border border-white/5 flex items-center justify-center bg-[#0f1115]">
                        <img src="/banner-pix.png" alt="Promo Banner" className="w-full h-full object-cover object-center" />
                    </div>
                </div>
            </div>

            {/* 2. PIX Destaque */}
            <div className="bg-[#151921] border-y border-white/5 py-3 mt-8">
                <div className="container mx-auto px-4 flex items-center justify-center md:justify-start gap-3 text-sm">
                    <div className="bg-[#32BCAD]/10 p-1.5 rounded text-[#32BCAD]">
                        <Zap className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-gray-300">PIX Instantâneo — Depósito e saque 24 horas</span>
                </div>
            </div>

            {/* 3. Hero Principal */}
            <section className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8 text-left">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                        Aposte no que o Brasil está acompanhando em <span className="text-primary inline-block min-w-[2ch]">{text}<span className="animate-pulse">|</span></span>
                    </h1>

                    <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                        Participe das previsões mais comentadas do momento com odds formadas pela própria comunidade. Resultados rápidos e experiência simples.
                    </p>

                    <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(47,124,70,0.3)] hover:shadow-[0_0_40px_rgba(47,124,70,0.5)] transition-all transform hover:-translate-y-1">
                        Criar Conta Grátis
                    </Link>

                    <div className="flex items-center gap-6 text-sm text-gray-500 font-medium pt-4">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Pagamento Via PIX</span>
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Suporte BR</span>
                    </div>
                </div>

                {/* Hero Feature Visual (Stacking Cards) */}
                <div className="relative hidden md:block h-[400px] flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-30"></div>

                    {/* Cards Stack */}
                    <div className="relative w-full max-w-sm h-64">
                        {heroCards.length > 0 ? heroCards.map((card, index) => {
                            // Calculate position relative to active card
                            let offset = (index - activeCardIndex + heroCards.length) % heroCards.length;

                            // Visual States
                            const isActive = offset === 0;
                            const isNext = offset === 1;
                            const isPrev = offset === 2;

                            if (heroCards.length > 3 && !isActive && !isNext && !isPrev) return null;

                            return (
                                <div
                                    key={card.id}
                                    className={`absolute top-0 left-0 w-full bg-surface/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl transition-all duration-700 ease-in-out ${isActive
                                        ? 'z-30 opacity-100 scale-100 translate-y-0 rotate-0'
                                        : isNext
                                            ? 'z-20 opacity-60 scale-95 translate-y-4 rotate-2'
                                            : 'z-10 opacity-40 scale-90 translate-y-8 rotate-4'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.category}</span>
                                        <div className="px-2 py-1 bg-red-500/20 text-red-500 text-[10px] font-bold rounded animate-pulse uppercase">{card.expireLabel}</div>
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-4 line-clamp-2">{card.title}</h4>

                                    <div className="flex gap-2 mb-4">
                                        <div className="flex-1 bg-surface h-2 rounded-full overflow-hidden">
                                            <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${card.pct}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg text-center font-bold text-sm relative overflow-hidden group">
                                            {card.metadata?.yes_image ? (
                                                <img src={card.metadata.yes_image} className="absolute left-0 top-0 h-full w-10 object-cover opacity-20 group-hover:opacity-40 transition-opacity" />
                                            ) : (
                                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">S</div>
                                            )}
                                            <span className="relative z-10">SIM {card.yes.toFixed(2)}x</span>
                                        </div>
                                        <div className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg text-center font-bold text-sm relative overflow-hidden group">
                                            {card.metadata?.no_image ? (
                                                <img src={card.metadata.no_image} className="absolute right-0 top-0 h-full w-10 object-cover opacity-20 group-hover:opacity-40 transition-opacity" />
                                            ) : (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">N</div>
                                            )}
                                            <span className="relative z-10">NÃO {card.no.toFixed(2)}x</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="absolute top-0 left-0 w-full bg-surface/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl flex items-center justify-center">
                                <p className="text-gray-400">Carregando eventos...</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 4. Lista de Apostas (Featured) */}
            <main className="container mx-auto px-4 py-8 pb-24">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Em Alta
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredMarkets.map((market) => (
                        <MarketCard
                            key={market.id}
                            id={market.id}
                            title={market.title}
                            category={market.category}
                            imageUrl={market.image_url}
                            endDate={market.end_date}
                            pool={market.total_pool || 0}
                            yesAmount={market.total_yes_amount || 0}
                            noAmount={market.total_no_amount || 0}
                            metadata={market.metadata}
                        />
                    ))}
                    {featuredMarkets.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-surface/30 rounded-xl border border-white/5">
                            Nenhum mercado aberto no momento.
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div >
    );
}
