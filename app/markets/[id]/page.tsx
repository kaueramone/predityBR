"use client";

import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MarketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [market, setMarket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSide, setSelectedSide] = useState<'YES' | 'NO'>('YES');
    const [amount, setAmount] = useState<string>('');
    const [placingBet, setPlacingBet] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchMarket();
        checkUser();
    }, [id]);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    }

    const fetchMarket = async () => {
        const { data, error } = await supabase
            .from('markets')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Error fetching market", error);
            // Handle 404
        } else {
            setMarket(data);
        }
        setLoading(false);
    };

    const calculateOdds = () => {
        if (!market) return { yes: 1, no: 1 };

        const pool = market.total_pool > 0 ? market.total_pool : 1;
        const yes = market.total_yes_amount > 0 ? market.total_yes_amount : 1;
        const no = market.total_no_amount > 0 ? market.total_no_amount : 1;

        // Simple dynamic odds logic (Inverse probability * House Edge)
        // House keep 18% -> payout 82%
        const houseEdgeInv = 0.82;

        const probYes = yes / pool;
        const probNo = no / pool;

        return {
            yes: (1 / probYes) * houseEdgeInv,
            no: (1 / probNo) * houseEdgeInv
        };
    }

    const handleBet = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return;

        setPlacingBet(true);

        try {
            // 1. Check Balance
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('balance')
                .eq('id', user.id)
                .single();

            if (userError) throw userError;
            if ((userData?.balance || 0) < val) {
                alert("Saldo insuficiente! Faça um depósito na carteira.");
                setPlacingBet(false);
                return;
            }

            // 2. Insert Bet
            const { error: betError } = await supabase.from('bets').insert({
                user_id: user.id,
                market_id: market.id,
                side: selectedSide,
                amount: val,
                odds_at_entry: currentOdds,
                potential_payout: potentialReturn,
                status: 'ACTIVE'
            });

            if (betError) throw betError;

            // 3. Update User Balance (Debit)
            const { error: balanceError } = await supabase.rpc('decrement_balance', {
                userid: user.id,
                amount: val
            });

            if (balanceError) {
                console.warn("RPC failed, trying manual update", balanceError);
                await supabase.from('users').update({ balance: userData.balance - val }).eq('id', user.id);
            }

            alert(`Aposta de R$ ${amount} confirmada!`);
            setAmount('');
            fetchMarket(); // Refresh UI

        } catch (err: any) {
            console.error(err);
            alert("Erro ao realizar aposta: " + err.message);
        } finally {
            setPlacingBet(false);
        }
    }

    if (loading) return <div className="p-12 text-center">Carregando mercado...</div>;
    if (!market) return <div className="p-12 text-center">Mercado não encontrado.</div>;

    const odds = calculateOdds();
    const currentOdds = selectedSide === 'YES' ? odds.yes : odds.no;
    const parsedAmount = parseFloat(amount) || 0;
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
                            <img src={market.image_url || "https://placehold.co/100x100?text=IMG"} alt={market.title} className="w-24 h-24 object-cover rounded-lg bg-gray-800" />
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-primary border border-primary/30 px-2 py-1 rounded bg-primary/10">{market.category}</span>
                                <h1 className="text-2xl md:text-3xl font-bold leading-tight">{market.title}</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-400 border-t border-surface pt-4">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Encerra <span className="text-white font-bold">{formatDistanceToNow(new Date(market.end_date), { addSuffix: true, locale: ptBR })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" /> Pool: <span className="text-white font-bold">R$ {market.total_pool?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="prose prose-invert prose-sm text-gray-300">
                            <h3 className="text-white font-bold">Descrição</h3>
                            <p>{market.description}</p>
                        </div>
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
                                SIM <span className="text-xs block opacity-80">{odds.yes.toFixed(2)}x</span>
                            </button>
                            <button
                                onClick={() => setSelectedSide('NO')}
                                className={`flex-1 py-3 font-bold transition-colors ${selectedSide === 'NO' ? 'bg-red-500 text-white' : 'bg-secondary hover:bg-secondary/80 text-gray-400'}`}
                            >
                                NÃO <span className="text-xs block opacity-80">{odds.no.toFixed(2)}x</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Seu Saldo</span>
                                <span className="font-bold text-white">R$ 0,00</span> {/* TODO: Fetch Balance */}
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

                            <button
                                onClick={handleBet}
                                disabled={placingBet || !amount || parseFloat(amount) <= 0}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {user ? (placingBet ? 'Processando...' : 'Confirmar Aposta') : 'Faça Login para Apostar'}
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
