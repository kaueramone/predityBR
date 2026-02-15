"use client";

import { useState, useEffect } from 'react';
import { Wallet, CreditCard, ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function WalletPage() {
    const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
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

        // Fetch Balance
        const { data: userData } = await supabase.from('users').select('balance').eq('id', session.user.id).single();
        if (userData) setBalance(userData.balance);

        // Fetch Transactions (Mocked for now as we don't have txs trigger yet, but let's try reading if exists)
        // const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
        // setTransactions(txs || []);

        setLoading(false);
    };

    const handleTransaction = async () => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return;

        setProcessing(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
            if (activeTab === 'DEPOSIT') {
                // 1. Update Balance
                const newBalance = balance + val;
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ balance: newBalance })
                    .eq('id', session.user.id);

                if (updateError) throw updateError;

                // 2. Log Transaction (Optional for now, but good practice)
                await supabase.from('transactions').insert({
                    user_id: session.user.id,
                    type: 'DEPOSIT',
                    amount: val,
                    status: 'COMPLETED',
                    provider: 'MOCK_PIX'
                });

                alert(`Depósito de R$ ${val} realizado com sucesso!`);
                setBalance(newBalance);
                setAmount('');
            } else {
                alert("Saques em manutenção."); // Placeholder
            }
        } catch (error: any) {
            alert("Erro na transação: " + error.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-12 text-center">Carregando carteira...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <Wallet className="text-primary" /> Minha Carteira
            </h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Balance Card */}
                <div className="bg-surface/50 border border-surface rounded-xl p-8 flex flex-col justify-center space-y-4">
                    <span className="text-gray-400 font-medium">Saldo Disponível</span>
                    <div className="text-5xl font-bold text-white tracking-tight">
                        R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                {/* Action Panel */}
                <div className="bg-surface border border-surface rounded-xl p-6 space-y-6">
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('DEPOSIT')}
                            className={`flex-1 pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'DEPOSIT' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                        >
                            Depositar
                        </button>
                        <button
                            onClick={() => setActiveTab('WITHDRAW')}
                            className={`flex-1 pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'WITHDRAW' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                        >
                            Sacar
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Valor (R$)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-black/40 border border-surface rounded-lg pl-12 pr-4 py-3 font-bold text-white focus:outline-none focus:border-primary transition-all"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        {activeTab === 'DEPOSIT' && (
                            <div className="grid grid-cols-3 gap-3">
                                {[50, 100, 200].map(val => (
                                    <button key={val} onClick={() => setAmount(val.toString())} className="bg-secondary hover:bg-secondary/80 py-2 rounded font-medium text-sm transition-colors">
                                        R$ {val}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleTransaction}
                            disabled={processing || !amount}
                            className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <CreditCard className="w-4 h-4" />
                            {processing ? 'Processando...' : (activeTab === 'DEPOSIT' ? 'Confirmar Depósito' : 'Solicitar Saque')}
                        </button>

                        <p className="text-xs text-center text-gray-500">
                            {activeTab === 'DEPOSIT' ? 'Processamento instantâneo via PIX' : 'Processamento em até 24 horas úteis'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Transactions Mock (can implement real list later) */}
            <div className="text-center text-gray-500 text-sm">
                Histórico de transações será exibido aqui.
            </div>
        </div>
    );
}
