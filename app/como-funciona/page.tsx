import Link from 'next/link';
import { ArrowRight, CheckCircle, Coins, Percent, TrendingUp, Users } from 'lucide-react';

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-[#0d1117] text-white">
            {/* Header / Hero */}
            <div className="bg-surface border-b border-white/5 py-12">
                <div className="container mx-auto px-4 text-center max-w-2xl">
                    <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                        Como funciona o Predity?
                    </h1>
                    <p className="text-lg text-gray-400">
                        Entenda a lógica por trás das suas apostas, odds dinâmicas e como calculamos seus ganhos.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-4xl space-y-16">

                {/* 1. O Conceito (Pool) */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <Users className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold">1. Apostas Mútuas (O Pool)</h2>
                    </div>

                    <div className="prose prose-invert max-w-none text-gray-400">
                        <p>
                            Diferente de casas de apostas tradicionais (Bet365, Betano) onde você joga contra a casa, no
                            <strong className="text-white"> Predity </strong> você joga <strong className="text-white">contra outros usuários</strong>.
                        </p>
                        <p>
                            Todo o dinheiro apostado em um evento vai para um pote comum chamado <strong className="text-white">Pool</strong>.
                            A plataforma apenas organiza o jogo e garante o pagamento.
                        </p>
                    </div>

                    {/* Visual Example */}
                    <div className="bg-[#151921] border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center mx-auto text-2xl">👷</div>
                            <div className="font-bold text-blue-400">Mario</div>
                            <div className="text-sm bg-surface px-2 py-1 rounded">Aposta R$ 100 no <br /><strong className="text-white">SIM</strong></div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Piscina (Pool)</div>
                            <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-2xl font-black text-white flex items-center gap-2">
                                <Coins className="w-6 h-6 text-yellow-500" />
                                R$ 200
                            </div>
                            <div className="h-8 w-px bg-white/10"></div>
                            <div className="text-[10px] text-gray-500">Aguardando Resultado</div>
                        </div>

                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center mx-auto text-2xl">🍄</div>
                            <div className="font-bold text-green-400">Luigi</div>
                            <div className="text-sm bg-surface px-2 py-1 rounded">Aposta R$ 100 no <br /><strong className="text-white">NÃO</strong></div>
                        </div>
                    </div>
                </section>

                {/* 2. Odds Dinâmicas */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold">2. Odds Dinâmicas</h2>
                    </div>

                    <div className="prose prose-invert max-w-none text-gray-400">
                        <p>
                            Como o prêmio depende do total arrecadado, as <strong>Odds (multiplicadores) mudam em tempo real</strong> conforme mais pessoas apostam.
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Se muita gente aposta no <strong>SIM</strong>, o prêmio para quem acerta o SIM diminui (odds menores).</li>
                            <li>Se pouca gente aposta no <strong>NÃO</strong>, o prêmio para quem acerta o NÃO aumenta (odds maiores).</li>
                        </ul>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg text-yellow-200 text-sm mt-4">
                            <strong>Nota Importante:</strong> A Odd exibida no momento da aposta é uma <em>estimativa</em>.
                            O valor final que você recebe é calculado com base nas proporções no momento que o mercado fecha.
                        </div>
                    </div>
                </section>

                {/* 3. Taxas e Ganhos */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <Percent className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold">3. Taxas e Cálculo de Ganhos</h2>
                    </div>

                    <div className="prose prose-invert max-w-none text-gray-400">
                        <p>
                            Para manter a plataforma segura, rápida e justa, cobramos uma pequena taxa administrativa sobre o <strong>lucro do Pool vencedor</strong>.
                        </p>
                    </div>

                    <div className="bg-[#151921] border border-white/10 rounded-2xl p-8 space-y-8">
                        <h3 className="text-lg font-bold text-white mb-4">Cenário: Mario Venceu (SIM)</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <span>Total no Pool</span>
                                <span className="font-mono text-white">R$ 200,00</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-4 text-red-400">
                                <span>Taxa da Plataforma (10%)</span>
                                <span className="font-mono">- R$ 20,00</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 text-green-400 font-bold text-lg">
                                <span>Prêmio Líquido para Vencedores (Mario)</span>
                                <span className="font-mono">R$ 180,00</span>
                            </div>
                        </div>

                        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl text-center">
                            <p className="text-green-400 text-sm mb-1">Resultado Final para Mario</p>
                            <div className="text-3xl font-black text-white">R$ 180,00</div>
                            <div className="text-xs text-gray-500 mt-1">Lucro de R$ 80,00 (Retorno de 1.8x)</div>
                        </div>
                    </div>
                </section>

                {/* Footer CTA */}
                <div className="pt-12 text-center">
                    <Link href="/app/markets" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-primary/20">
                        Entendi! Quero Apostar <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

            </div>
        </div>
    );
}
