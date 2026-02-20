"use client";

import { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Share2, ChevronDown, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { format, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface MarketDetailClientProps {
    initialMarket: any;
    currentUser: any;
}

const COLORS = ['#EF4444', '#14B8A6', '#EC4899', '#6366F1', '#F59E0B', '#8B5CF6'];

export default function MarketDetailClient({ initialMarket, currentUser }: MarketDetailClientProps) {
    const router = useRouter();

    const [market, setMarket] = useState<any>(initialMarket);
    const [user, setUser] = useState<any>(currentUser);

    const [selectedOutcome, setSelectedOutcome] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [placingBet, setPlacingBet] = useState(false);
    const [timeFilter, setTimeFilter] = useState('Tudo');

    useEffect(() => {
        if (market?.outcomes?.length > 0 && !selectedOutcome) {
            setSelectedOutcome(market.outcomes[0]);
        }
    }, [market, selectedOutcome]);

    useEffect(() => {
        const channel = supabase
            .channel(`market_${market.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'markets',
                    filter: `id=eq.${market.id}`
                },
                (payload) => {
                    setMarket(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [market.id]);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) setUser(session.user);
        };
        checkSession();
    }, []);

    const outcomeStats = useMemo(() => {
        if (!market || !market.outcomes) return [];
        const totalPool = market.total_pool || 0;
        return market.outcomes.map((outcome: string, index: number) => {
            const outcomePool = market.outcome_pools?.[outcome] || 0;
            let prob = totalPool === 0 ? (100 / market.outcomes.length) : ((outcomePool / totalPool) * 100);
            let odds = (totalPool === 0 || outcomePool === 0) ? (market.outcomes.length * 0.82) : ((totalPool * 0.82) / outcomePool);
            if (odds < 1.01) odds = 1.01;
            return {
                name: outcome,
                prob: prob.toFixed(1),
                odds: odds.toFixed(2),
                color: COLORS[index % COLORS.length]
            };
        }).sort((a: any, b: any) => parseFloat(b.prob) - parseFloat(a.prob));
    }, [market]);

    const chartData = useMemo(() => {
        if (outcomeStats.length === 0) return [];
        const data = [];
        const now = new Date();
        const dataPoints = 20;
        const walks: Record<string, number[]> = {};
        outcomeStats.forEach((stat: any) => {
            const targetProb = parseFloat(stat.prob);
            const walk = [targetProb];
            let currentVal = targetProb;
            for (let i = 1; i < dataPoints; i++) {
                const drift = (Math.random() * 8) - 4;
                currentVal = Math.max(1, Math.min(99, currentVal + drift));
                walk.unshift(currentVal);
            }
            walks[stat.name] = walk;
        });

        for (let i = 0; i < dataPoints; i++) {
            const pointTime = subHours(now, dataPoints - i);
            const dataPoint: any = {
                timeLabel: format(pointTime, i === 0 || i === Math.floor(dataPoints / 2) ? 'dd MMM.' : 'HH:mm', { locale: ptBR }),
            };
            outcomeStats.forEach((stat: any) => {
                dataPoint[stat.name] = walks[stat.name][i];
            });
            data.push(dataPoint);
        }
        return data;
    }, [outcomeStats]);

    const selectedStat = outcomeStats.find((s: any) => s.name === selectedOutcome);
    const parsedAmount = parseFloat(amount) || 0;
    const potentialReturn = selectedStat ? parsedAmount * parseFloat(selectedStat.odds) : 0;

    const handleBet = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (!selectedOutcome) {
            alert("Selecione uma opção para apostar.");
            return;
        }
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return;

        setPlacingBet(true);
        try {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('balance')
                .eq('id', user.id)
                .single();
            if (userError || !userData) throw userError || new Error("User data not found");

            if ((userData.balance || 0) < val) {
                alert("Saldo insuficiente! Faça um depósito na carteira.");
                setPlacingBet(false);
                return;
            }

            const currentOdds = parseFloat(selectedStat!.odds);
            const expectedReturn = val * currentOdds;

            const { error: betError } = await supabase.from('bets').insert({
                user_id: user.id,
                market_id: market.id,
                side: selectedOutcome,
                amount: val,
                odds_at_entry: currentOdds,
                potential_payout: expectedReturn,
                status: 'ACTIVE'
            });

            if (betError) throw betError;

            const { error: balanceError } = await supabase.rpc('decrement_balance', {
                userid: user.id,
                amount: val
            });

            if (balanceError) {
                await supabase.from('users').update({ balance: userData.balance - val }).eq('id', user.id);
            }

            const newTotalPool = (market.total_pool || 0) + val;
            const newOutcomePool = (market.outcome_pools?.[selectedOutcome] || 0) + val;

            await supabase.from('markets').update({
                total_pool: newTotalPool,
                outcome_pools: {
                    ...market.outcome_pools,
                    [selectedOutcome]: newOutcomePool
                }
            }).eq('id', market.id);

            alert(`Aposta confirmada!`);
            setAmount('');
        } catch (err: any) {
            console.error(err);
            alert("Erro ao realizar aposta: " + err.message);
        } finally {
            setPlacingBet(false);
        }
    }

    if (!market) return <div className="min-h-screen pt-20 text-center text-gray-400">Mercado não encontrado.</div>;

    return (
        <div className="min-h-screen bg-[#0A0C10] text-white">
            <div className="max-w-[1200px] mx-auto p-4 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

                    {/* LEFT COLUMN: Chart & Options */}
                    <div className="space-y-6">

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Link href="/app/markets" className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <img src={market.image_url || "https://placehold.co/100"} alt={market.title} className="w-10 h-10 rounded-full object-cover border border-white/10 flex-shrink-0" />
                                <h1 className="text-xl font-bold leading-tight line-clamp-2 pr-4">{market.title}</h1>
                            </div>
                            <button className="p-2 bg-surface border border-white/5 rounded-lg text-green-500 hover:bg-white/5 transition-colors flex-shrink-0">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* CHART SECTION */}
                        <div className="bg-[#12141A] rounded-xl border border-white/5 p-4 md:p-6 space-y-6 shadow-lg shadow-black/50">

                            {/* Chart Legend */}
                            <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-300">
                                {outcomeStats.map((stat: any) => (
                                    <div key={stat.name} className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                                        <span>{stat.name}: {stat.prob}%</span>
                                    </div>
                                ))}
                            </div>

                            {/* Line Chart */}
                            <div className="h-[280px] w-full -ml-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis
                                            dataKey="timeLabel"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6B7280', fontSize: 10 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6B7280', fontSize: 10 }}
                                            tickFormatter={(val) => `${Math.round(val)}%`}
                                            domain={[0, 100]}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                                        />
                                        {outcomeStats.map((stat: any) => (
                                            <Line
                                                key={stat.name}
                                                type="monotone"
                                                dataKey={stat.name}
                                                stroke={stat.color}
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={{ r: 4, strokeWidth: 0, fill: stat.color }}
                                                isAnimationActive={false}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Time Filters */}
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {['Ao Vivo', '1H', '6H', '1D', '1S', '1M', 'Tudo'].map(tf => (
                                    <button
                                        key={tf}
                                        onClick={() => setTimeFilter(tf)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${timeFilter === tf ? 'bg-green-500/10 text-green-500' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* OUTCOMES LIST (Below chart) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
                            {outcomeStats.map((stat: any) => {
                                const isSelected = selectedOutcome === stat.name;
                                return (
                                    <button
                                        key={stat.name}
                                        onClick={() => setSelectedOutcome(stat.name)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${isSelected ? 'bg-[#1A1F2A] border-green-500/50 ring-1 ring-green-500/50' : 'bg-[#12141A] border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center overflow-hidden border border-white/5 relative flex-shrink-0">
                                                {stat.name === 'SIM' && market.metadata?.yes_image ? (
                                                    <img src={market.metadata.yes_image} className="w-full h-full object-cover" alt="Sim" />
                                                ) : stat.name === 'NÃO' && market.metadata?.no_image ? (
                                                    <img src={market.metadata.no_image} className="w-full h-full object-cover" alt="Não" />
                                                ) : (
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }}></div>
                                                )}
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                                                        <Check className="w-6 h-6 text-green-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-lg leading-tight line-clamp-1">{stat.name}</div>
                                                <div className="text-sm text-gray-400 mt-0.5">Retorno esperado: <span className="text-green-400 font-bold">{stat.odds}x</span></div>
                                            </div>
                                        </div>

                                        {/* Circular Gauge approximation */}
                                        <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0 ml-4">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
                                                <circle cx="24" cy="24" r="20" stroke={stat.color} strokeWidth="4" fill="none" strokeDasharray={`${parseFloat(stat.prob) * 1.25} 125`} />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-[10px] font-bold text-white leading-none">{Math.round(parseFloat(stat.prob))}%</span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Bet Slip */}
                    <div className="relative w-full pb-24 lg:pb-0">
                        <div className="fixed bottom-0 left-0 right-0 z-50 lg:sticky lg:top-24 bg-[#12141A] lg:rounded-xl border-t lg:border border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] lg:shadow-2xl">

                            {/* Accordion Top (Desktop only) */}
                            <div className="hidden lg:flex p-4 border-b border-white/5 items-center justify-between text-sm text-gray-400 hover:text-white cursor-pointer transition-colors bg-white/[0.02]">
                                <span>Sobre os saldos e posições</span>
                                <ChevronDown className="w-4 h-4" />
                            </div>

                            {/* Slip Content */}
                            <div className="p-4 md:p-6 space-y-4 md:space-y-6">

                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-400">Sua previsão</div>
                                        <div className="font-bold text-base md:text-lg text-white">
                                            {selectedStat ? (
                                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                                                    <span className="hidden md:inline text-gray-400 font-normal">{market.title.length > 20 ? market.title.substring(0, 15) + '...' : market.title}</span>
                                                    <span className="text-green-500 line-clamp-1">{selectedStat.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600">Selecione uma opção</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <div className="text-xs text-gray-400">Retorno estimado</div>
                                        <div className="font-bold text-white text-sm">
                                            {selectedStat ? `${selectedStat.odds}x - ${selectedStat.prob}% chance` : '-'}
                                        </div>
                                    </div>
                                </div>

                                {/* Amount Input exactly like print */}
                                <div className="space-y-3">
                                    <div className="hidden md:block text-center text-gray-400 text-sm">Quantia</div>
                                    <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl p-2 gap-2 md:gap-4">
                                        <button
                                            onClick={() => setAmount(Math.max(0, (parseFloat(amount) || 0) - 10).toString())}
                                            className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            -
                                        </button>

                                        <div className="flex-1 flex items-center justify-center gap-1">
                                            <span className="text-xl md:text-2xl font-bold text-white">R$</span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-20 md:w-24 bg-transparent text-2xl md:text-3xl font-bold text-white focus:outline-none text-center p-0"
                                                placeholder="0"
                                            />
                                        </div>

                                        <button
                                            onClick={() => setAmount(((parseFloat(amount) || 0) + 10).toString())}
                                            className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Chips */}
                                    <div className="flex gap-2">
                                        {[10, 20, 50, 100].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setAmount(val.toString())}
                                                className="flex-1 py-1.5 md:py-2 rounded-lg bg-white/5 border border-white/5 text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                            >
                                                +R$ {val}
                                            </button>
                                        ))}
                                        <button className="flex-1 py-1.5 md:py-2 rounded-lg bg-white/5 border border-white/5 text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                                            MAX
                                        </button>
                                    </div>
                                </div>

                                {/* Reward Preview */}
                                <div className="flex items-center justify-between text-sm pt-2 md:pt-4 border-t-0 md:border-t border-white/5">
                                    <span className="text-gray-400">Ao acertar</span>
                                    <span className="font-bold text-green-500 text-base">
                                        R$ {potentialReturn.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={handleBet}
                                    disabled={placingBet || !amount || parseFloat(amount) <= 0 || !selectedOutcome}
                                    className="w-full py-3.5 md:py-4 rounded-xl font-bold text-base md:text-lg text-black bg-[#4ADE80] hover:bg-[#34D399] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.3)] shadow-green-500/20"
                                >
                                    {placingBet ? 'Processando...' : 'Fazer Previsão'}
                                </button>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
