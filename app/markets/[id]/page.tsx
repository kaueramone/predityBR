"use client";

import { useState } from 'react';
import { ArrowLeft, Clock, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function MarketDetailPage() {
    const params = useParams();
    const [selectedSide, setSelectedSide] = useState<'YES' | 'NO'>('YES');
    const [amount, setAmount] = useState<string>('');

    // Mock Market Data (Ideally fetched by ID)
    const market = {
        id: params.id as string,
        title: "Bitcoin vai subir nas próximas 6 horas?",
        description: "Este mercado será resolvido como SIM se o preço do Bitcoin (BTC/USD) estiver acima de $100,000.00 às 18:00 UTC de hoje, conforme dados da Binance.",
        category: "CRYPTO",
        pool: 12500.00,
        endsIn: "4h 23m",
        yesOdds: 1.85,
        noOdds: 2.10,
        image: "https://placehold.co/600x400/233357/white?text=BTC",
        volume24h: 3400.00,
    };

    const parsedAmount = parseFloat(amount) || 0;
    const currentOdds = selectedSide === 'YES' ? market.yesOdds : market.noOdds;
    const potentialReturn = parsedAmount * currentOdds;
    const potentialProfit = potentialReturn - parsedAmount;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Link href="/markets" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold">
                <ArrowLeft className="w-4 h-4" /> Voltar para Mercados
            </Link>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-surface/50 border border-surface rounded-xl overflow-hidden p-6 space-y-6">
                        <div className="flex gap-4">
                            <img src={market.image} alt={market.title} className="w-24 h-24 object-cover rounded-lg bg-gray-800" />
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-primary border border-primary/30 px-2 py-1 rounded bg-primary/10">{market.category}</span>
                                <h1 className="text-2xl md:text-3xl font-bold leading-tight">{market.title}</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-400 border-t border-surface pt-4">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Encerra em <span className="text-white font-bold">{market.endsIn}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" /> Pool: <span className="text-white font-bold">R$ {market.pool.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Vol 24h: <span className="text-white font-bold">R$ {market.volume24h.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="prose prose-invert prose-sm text-gray-300">
                            <h3 className="text-white font-bold">Regras do Mercado</h3>
                            <p>{market.description}</p>
                        </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div className="bg-surface/50 border border-surface rounded-xl p-6 h-64 flex flex-col items-center justify-center text-gray-500 space-y-2">
                        <ActivityIcon className="w-12 h-12 opacity-50" />
                        <span>[Gráfico de Histórico de Odds]</span>
                        <span className="text-xs">Visualização simulada</span>
                    </div>
                </div>

                {/* Betting Panel */}
                <div className="space-y-6">
                    <div className="bg-surface border border-surface rounded-xl p-6 space-y-6 sticky top-24">
                        <div className="flex rounded-lg overflow-hidden border border-surface">
                            <button
                                onClick={() => setSelectedSide('YES')}
                                className={`flex-1 py-3 font-bold transition-colors ${selectedSide === 'YES' ? 'bg-[#2F7C46] text-white' : 'bg-secondary hover:bg-secondary/80 text-gray-400'}`}
                            >
                                SIM <span className="text-xs block opacity-80">{market.yesOdds.toFixed(2)}x</span>
                            </button>
                            <button
                                onClick={() => setSelectedSide('NO')}
                                className={`flex-1 py-3 font-bold transition-colors ${selectedSide === 'NO' ? 'bg-red-500 text-white' : 'bg-secondary hover:bg-secondary/80 text-gray-400'}`}
                            >
                                NÃO <span className="text-xs block opacity-80">{market.noOdds.toFixed(2)}x</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Seu Saldo</span>
                                <span className="font-bold text-white">R$ 1.000,00</span>
                            </div>

                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="number"
                                    placeholder="Valor da aposta"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-black/40 border border-surface rounded-lg pl-10 pr-4 py-3 font-bold text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                            </div>

                            <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Odds Totais</span>
                                    <span className="font-bold">{currentOdds.toFixed(2)}x</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Retorno Potencial</span>
                                    <span className="font-bold text-green-400">R$ {potentialReturn.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t border-white/10 pt-2">
                                    <span className="text-gray-400">Lucro Estimado</span>
                                    <span className="font-bold text-green-400">+ R$ {potentialProfit.toFixed(2)}</span>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                Confirmar Aposta
                            </button>
                            <p className="text-xs text-center text-gray-500">
                                Ao apostar, você concorda com nossos termos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActivityIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
