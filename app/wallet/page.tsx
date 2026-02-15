"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ChevronDown, ArrowRight, FileText, Wallet } from 'lucide-react';
import { format } from 'date-fns';

export default function WalletPage() {
    const [balance, setBalance] = useState(0);
    const [bets, setBets] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'OPEN' | 'CLOSED'>('OPEN');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login');
            return;
        }
        setUser(session.user);

        // Fetch Balance
        const { data: userData } = await supabase.from('users').select('balance').eq('id', session.user.id).single();
        if (userData) setBalance(userData.balance);

        // Fetch Bets (Predictions)
        const { data: userBets } = await supabase
            .from('bets')
            .select('*, markets(title)')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (userBets) setBets(userBets);

        // Fetch Transactions (Mocked for now if table doesn't exist, or try select)
        const { data: txs } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (txs) setTransactions(txs);

        setLoading(false);
    };

    const handleDeposit = async () => {
        const amount = prompt("Valor para depósito (Simulação PIX):", "100");
        if (!amount) return;
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return;

        // Mock deposit
        const newBalance = balance + val;
        await supabase.from('users').update({ balance: newBalance }).eq('id', user.id);

        // Log tx
        await supabase.from('transactions').insert({
            user_id: user.id,
            type: 'DEPOSIT',
            amount: val,
            status: 'COMPLETED',
            provider: 'MOCK_PIX'
        });

        fetchWalletData();
        alert("Depósito realizado!");
    };

    const handleWithdraw = () => {
        alert("Saques em manutenção.");
    };

    const filteredBets = bets.filter(bet => {
        // Mock logic for status, assume all are OPEN unless marked otherwise
        const isClosed = bet.status === 'RESOLVED' || bet.status === 'CLOSED';
        return activeTab === 'CLOSED' ? isClosed : !isClosed;
    });

    if (loading) return <div className="min-h-screen pt-20 flex justify-center text-primary">Carregando...</div>;

    return (
        <div className="max-w-md mx-auto pb-40 space-y-6">

            {/* Accordion / Info Header */}
            <div className="bg-surface rounded-lg p-4 flex items-center justify-between cursor-pointer border border-white/5">
                <span className="font-medium text-gray-300">Sobre os saldos e posições</span>
                <ChevronDown className="text-gray-500 w-5 h-5" />
            </div>

            {/* My Predictions Header */}
            <div className="bg-[#151921] rounded-xl p-6 border border-white/5 space-y-6">
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-gray-200">Minhas previsões</h2>
                    <div className="flex items-center gap-2 text-sm text-green-500 font-mono">
                        <span>R$ 0,00</span>
                        <ArrowRight className="w-3 h-3" />
                        <span>R$ 0,00</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-black/30 p-1 rounded-lg flex">
                    <button
                        onClick={() => setActiveTab('OPEN')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'OPEN' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        Em aberto
                    </button>
                    <button
                        onClick={() => setActiveTab('CLOSED')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'CLOSED' ? 'bg-surface text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        Encerrados
                    </button>
                </div>

                {/* Content List */}
                <div className="min-h-[150px] bg-black/20 rounded-lg flex items-center justify-center border border-white/5">
                    {filteredBets.length > 0 ? (
                        <div className="w-full">
                            {filteredBets.map(bet => (
                                <div key={bet.id} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5 w-full flex justify-between items-center bg-black">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-sm font-bold truncate text-white block">{bet.markets?.title || 'Mercado'}</p>
                                        <p className="text-xs text-gray-500">{bet.outcome === 'YES' ? 'SIM' : 'NÃO'} • {format(new Date(bet.created_at), 'dd/MM HH:mm')}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-sm font-bold text-gray-300">R$ {bet.amount}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Nenhum ativo encontrado.</p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                        onClick={handleDeposit}
                        className="py-3 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white font-bold text-sm transition-all uppercase tracking-wide"
                    >
                        Depositar
                    </button>
                    <button
                        onClick={handleWithdraw}
                        className="py-3 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 font-bold text-sm transition-all uppercase tracking-wide"
                    >
                        Sacar
                    </button>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-[#151921] rounded-xl p-6 border border-white/5 min-h-[200px] flex flex-col">
                <h3 className="text-sm font-bold text-gray-400 mb-6 sticky top-0">Histórico de Transações</h3>

                {transactions.length > 0 ? (
                    <div className="space-y-4">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${tx.type === 'DEPOSIT' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                        <Wallet className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{tx.type === 'DEPOSIT' ? 'Depósito' : 'Saque'}</p>
                                        <p className="text-xs text-gray-500">{format(new Date(tx.created_at), 'dd/MM/yyyy')}</p>
                                    </div>
                                </div>
                                <span className={`font-bold ${tx.type === 'DEPOSIT' ? 'text-green-500' : 'text-red-500'}`}>
                                    {tx.type === 'DEPOSIT' ? '+' : '-'} R$ {tx.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-2 opacity-50">
                        <FileText className="w-10 h-10 mb-2" />
                        <span className="font-bold">Nenhum registro encontrado</span>
                        <span className="text-xs text-center max-w-[200px]">Você ainda não possui transações registradas em seu extrato.</span>
                    </div>
                )}
            </div>

            {/* WhatsApp Floating Button (Print 2 also shows it) */}
            <div className="fixed bottom-24 right-4 z-40 md:hidden">
                {/* Reusing the one from profile or just repeating it? Global layout? Layout might be best place but putting here for now. */}
            </div>
        </div>
    );
}
