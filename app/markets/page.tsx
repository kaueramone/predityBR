"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, TrendingUp, Clock, Users } from 'lucide-react';

// Mock Data (Consistent with Home)
const markets = [
    {
        id: '1',
        title: "Bitcoin vai subir nas próximas 6 horas?",
        category: "CRYPTO",
        pool: 12500.00,
        endsIn: "4h 23m",
        yesOdds: 1.85,
        noOdds: 2.10,
        image: "https://placehold.co/600x400/233357/white?text=BTC",
    },
    {
        id: '2',
        title: "Flamengo vence o clássico de domingo?",
        category: "ESPORTES",
        pool: 5430.50,
        endsIn: "2d 10h",
        yesOdds: 2.50,
        noOdds: 1.55,
        image: "https://placehold.co/600x400/233357/white?text=FLA",
    },
    {
        id: '3',
        title: "SpaceX lança Starship com sucesso?",
        category: "TECH",
        pool: 8900.00,
        endsIn: "12h 05m",
        yesOdds: 1.15,
        noOdds: 6.00,
        image: "https://placehold.co/600x400/233357/white?text=SpaceX",
    },
    {
        id: '4',
        title: "Ibovespa fecha em alta hoje?",
        category: "FINANÇAS",
        pool: 3200.00,
        endsIn: "2h 15m",
        yesOdds: 1.95,
        noOdds: 1.95,
        image: "https://placehold.co/600x400/233357/white?text=IBOV",
    },
    {
        id: '5',
        title: "Brasil ganha Medalha de Ouro no Vôlei?",
        category: "ESPORTES",
        pool: 15400.00,
        endsIn: "5d 00h",
        yesOdds: 3.50,
        noOdds: 1.25,
        image: "https://placehold.co/600x400/233357/white?text=VOLEI",
    },
];

const categories = ["TODOS", "CRYPTO", "ESPORTES", "TECH", "FINANÇAS", "POLÍTICA"];

export default function MarketsPage() {
    const [filter, setFilter] = useState("TODOS");
    const [search, setSearch] = useState("");

    const filteredMarkets = markets.filter(m => {
        const matchesCategory = filter === "TODOS" || m.category === filter;
        const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <TrendingUp className="text-primary" /> Mercados Abertos
                </h1>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar mercados..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-surface/50 border border-surface rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <button className="md:hidden p-2 bg-surface rounded-lg">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filter === cat
                                ? "bg-primary text-white shadow-[0_0_10px_rgba(47,124,70,0.4)]"
                                : "bg-surface hover:bg-surface/80 text-gray-400 hover:text-white"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMarkets.map((market) => (
                    <Link key={market.id} href={`/markets/${market.id}`} className="block group">
                        <div className="bg-surface/50 border border-surface group-hover:border-primary/50 rounded-xl overflow-hidden transition-all group-hover:translate-y-[-4px] group-hover:shadow-xl h-full flex flex-col">
                            <div className="relative h-48 bg-gray-800">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-mono text-xs">
                                    [IMG: {market.title}]
                                </div>
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                                    {market.category}
                                </div>
                            </div>

                            <div className="p-6 space-y-4 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                                    {market.title}
                                </h3>

                                <div className="flex items-center justify-between text-sm text-gray-400 mt-auto">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> {market.endsIn}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" /> R$ {market.pool.toLocaleString()}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    {/* Non-interactive preview buttons */}
                                    <div className="flex flex-col items-center justify-center bg-[#2F7C46]/10 border border-[#2F7C46]/30 rounded-lg p-2">
                                        <span className="text-[10px] font-bold text-[#2F7C46] uppercase">SIM</span>
                                        <span className="text-lg font-black text-white">{market.yesOdds.toFixed(2)}x</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                                        <span className="text-[10px] font-bold text-red-500 uppercase">NÃO</span>
                                        <span className="text-lg font-black text-white">{market.noOdds.toFixed(2)}x</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
                {filteredMarkets.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Nenhum mercado encontrado.
                    </div>
                )}
            </div>
        </div>
    );
}
