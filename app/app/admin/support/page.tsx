"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, MessageCircle, MoreVertical, Search, User } from 'lucide-react';

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*, users(full_name)')
            .order('created_at', { ascending: false });

        if (data) {
            setTickets(data);
            if (data.length > 0) setSelectedTicket(data[0]);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Suporte ao Cliente</h1>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Inbox List */}
                <div className="md:col-span-1 bg-surface/30 border border-white/5 rounded-xl overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar tickets..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {tickets.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">Nenhum ticket aberto.</div>
                        ) : (
                            tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-white text-sm truncate pr-2">{ticket.subject}</h4>
                                        <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                            {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-2">{ticket.description || 'Sem descrição.'}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-surface border border-white/10 flex items-center justify-center text-[8px] text-gray-400">
                                            <User className="w-3 h-3" />
                                        </div>
                                        <span className="text-xs text-gray-500 truncate max-w-[150px]">{ticket.users?.full_name || 'Usuário'}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="md:col-span-2 bg-surface/30 border border-white/5 rounded-xl flex flex-col h-[600px]">
                    {selectedTicket ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        #{selectedTicket.id.substring(0, 3)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{selectedTicket.subject}</h3>
                                        <p className="text-xs text-gray-400">
                                            Ticket #{selectedTicket.id.substring(0, 8)} • {selectedTicket.status}
                                        </p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-white">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex-shrink-0"></div>
                                    <div className="bg-surface border border-white/10 p-3 rounded-r-xl rounded-bl-xl max-w-[80%]">
                                        <p className="text-sm text-gray-300">{selectedTicket.description || '...'}</p>
                                        <span className="text-[10px] text-gray-500 block mt-1">
                                            {new Date(selectedTicket.created_at).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                                {/* System response placeholder */}
                                <div className="flex gap-3 justify-end">
                                    <div className="bg-white/5 p-3 rounded-lg max-w-[80%] text-center">
                                        <p className="text-xs text-gray-500">Histórico de mensagens não implementado no MVP.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-white/5">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Digite sua resposta..."
                                        disabled
                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary opacity-50 cursor-not-allowed"
                                    />
                                    <button disabled className="bg-primary hover:bg-primary/90 text-white p-3 rounded-lg transition-colors opacity-50 cursor-not-allowed">
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <Mail className="w-12 h-12 mb-4 opacity-20" />
                            <p>Selecione um ticket para ver os detalhes</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
