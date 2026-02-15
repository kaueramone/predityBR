import Link from 'next/link';
import { ArrowRight, Clock, Users, TrendingUp } from 'lucide-react';

export default function Home() {
    // Mock Data
    const featuredMarkets = [
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
    ];

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-6 py-12">
                <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                    Preveja o Futuro via <span className="text-primary">Console</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Negocie resultados de eventos reais. Odds dinâmicas, cashout instantâneo e pagamentos rápidos.
                    A plataforma definitiva de Prediction Markets no Brasil.
                </p>
                <div className="flex justify-center gap-4 pt-4">
                    <Link href="/markets" className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-lg transition-all shadow-[0_0_20px_rgba(47,124,70,0.4)] hover:shadow-[0_0_30px_rgba(47,124,70,0.6)]">
                        Começar Agora
                    </Link>
                    <Link href="/how-it-works" className="px-8 py-4 bg-surface hover:bg-surface/80 text-white rounded-lg font-bold text-lg transition-all">
                        Como Funciona
                    </Link>
                </div>
            </section>

            {/* Featured Markets */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="text-primary" /> Mercados em Destaque
                    </h2>
                    <Link href="/markets" className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium">
                        Ver todos <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredMarkets.map((market) => (
                        <div key={market.id} className="group bg-surface/50 border border-surface hover:border-primary/50 rounded-xl overflow-hidden transition-all hover:translate-y-[-4px] hover:shadow-xl">
                            <div className="relative h-48 bg-gray-800">
                                {/* Image Placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-mono text-xs">
                                    [IMG: {market.title}]
                                </div>
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                                    {market.category}
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                                    {market.title}
                                </h3>

                                <div className="flex items-center justify-between text-sm text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> {market.endsIn}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" /> R$ {market.pool.toLocaleString()} Pool
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button className="flex flex-col items-center justify-center bg-[#2F7C46]/10 hover:bg-[#2F7C46]/20 border border-[#2F7C46]/30 hover:border-[#2F7C46] rounded-lg p-3 transition-all group/yes">
                                        <span className="text-xs font-bold text-[#2F7C46] uppercase mb-1">SIM</span>
                                        <span className="text-2xl font-black text-white group-hover/yes:scale-110 transition-transform">{market.yesOdds.toFixed(2)}x</span>
                                    </button>
                                    <button className="flex flex-col items-center justify-center bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 rounded-lg p-3 transition-all group/no">
                                        <span className="text-xs font-bold text-red-500 uppercase mb-1">NÃO</span>
                                        <span className="text-2xl font-black text-white group-hover/no:scale-110 transition-transform">{market.noOdds.toFixed(2)}x</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
