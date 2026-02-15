"use client";

import { useState } from 'react';
import { Wallet, CreditCard, ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';

export default function WalletPage() {
    const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
    const [amount, setAmount] = useState('');

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
                        R$ 1.000,00
                    </div>
                    <div className="flex gap-4 pt-4">
                        <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <ArrowDownLeft className="w-3 h-3" /> Entradas: R$ 500,00
                        </div>
                        <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> Saídas: R$ 200,00
                        </div>
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

                        <button className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            {activeTab === 'DEPOSIT' ? 'Confirmar Depósito' : 'Solicitar Saque'}
                        </button>

                        <p className="text-xs text-center text-gray-500">
                            {activeTab === 'DEPOSIT' ? 'Processamento instantâneo via PIX' : 'Processamento em até 24 horas úteis'}
                        </p>
                    </div>
                </div>
            </div>

            {/* History */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <History className="text-gray-400" /> Histórico Recente
                </h3>
                <div className="bg-surface/30 border border-surface rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface/50 text-gray-400">
                            <tr>
                                <th className="p-4">Data</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Descrição</th>
                                <th className="p-4 text-right">Valor</th>
                                <th className="p-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <HistoryRow date="15 Fev 10:41" type="DEPOSIT" desc="Depósito via PIX" value="+ R$ 200,00" status="Concluído" isPositive />
                            <HistoryRow date="14 Fev 18:20" type="BET" desc="Aposta: BTC > 100k" value="- R$ 50,00" status="Confirmado" />
                            <HistoryRow date="12 Fev 09:15" type="WITHDRAW" desc="Saque para Conta Bancária" value="- R$ 150,00" status="Processando" />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function HistoryRow({ date, type, desc, value, status, isPositive }: any) {
    return (
        <tr className="hover:bg-white/5 transition-colors">
            <td className="p-4 text-gray-400">{date}</td>
            <td className="p-4 font-bold text-xs"><span className="bg-secondary px-2 py-1 rounded">{type}</span></td>
            <td className="p-4">{desc}</td>
            <td className={`p-4 text-right font-bold ${isPositive ? 'text-green-500' : 'text-white'}`}>{value}</td>
            <td className="p-4 text-right text-gray-400">{status}</td>
        </tr>
    )
}
