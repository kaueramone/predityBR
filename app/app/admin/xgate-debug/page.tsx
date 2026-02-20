"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';

// ── helpers ───────────────────────────────────────────────────────────────────
function StatusBadge({ ok }: { ok: boolean | undefined }) {
    if (ok === undefined) return <span className="text-gray-400 text-xs">—</span>;
    return ok
        ? <span className="text-xs font-bold text-primary">✅ OK</span>
        : <span className="text-xs font-bold text-red-400">❌ FAIL</span>;
}

function JsonBlock({ data }: { data: any }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="mt-1">
            <button onClick={() => setOpen(o => !o)} className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300">
                {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Ver JSON completo
            </button>
            {open && (
                <pre className="mt-2 bg-black/60 border border-white/5 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto max-h-80 leading-relaxed">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function XGateDebugPage() {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [txs, setTxs] = useState<any[]>([]);
    const [txLoading, setTxLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userDetail, setUserDetail] = useState<any>(null);
    const [userDetailLoading, setUserDetailLoading] = useState(false);
    const [userSearch, setUserSearch] = useState('');

    const runDiagnostic = async () => {
        setLoading(true);
        setReport(null);
        try {
            const res = await fetch('/api/xgate-debug');
            const data = await res.json();
            setReport(data);
        } catch (e: any) {
            setReport({ fatal: e.message });
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        setTxLoading(true);
        const { data } = await supabase
            .from('transactions')
            .select('*')
            .eq('type', 'DEPOSIT')
            .order('created_at', { ascending: false })
            .limit(30);
        setTxs(data || []);
        setTxLoading(false);
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await fetch('/api/deposit-debug');
            const data = await res.json();
            setUsers(data.users || []);
        } catch { }
        setUsersLoading(false);
    };

    const inspectUser = async (userId: string) => {
        setUserDetailLoading(true);
        setUserDetail(null);
        try {
            const res = await fetch(`/api/deposit-debug?userId=${userId}`);
            setUserDetail(await res.json());
        } catch { }
        setUserDetailLoading(false);
    };

    useEffect(() => {
        fetchTransactions();
        runDiagnostic();
        fetchUsers();
    }, []);

    const s = report?.steps || {};
    const filteredUsers = users.filter(u =>
        !userSearch ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4 pt-8 pb-32">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white">🔍 PIX Debug — XGate</h1>
                    <p className="text-xs text-gray-500 mt-1">Página oculta de diagnóstico — não indexada</p>
                </div>
                <button
                    onClick={() => { runDiagnostic(); fetchTransactions(); }}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/85 text-white text-sm font-bold rounded-lg disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Re-rodar Diagnóstico
                </button>
            </div>

            {/* ENV Check */}
            {report?.env && (
                <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-3">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Variáveis de Ambiente</h2>
                    {Object.entries(report.env).map(([k, v]: any) => (
                        <div key={k} className="flex items-center justify-between text-sm">
                            <span className="font-mono text-gray-400">{k}</span>
                            <span className={v.startsWith('✅') ? 'text-primary text-xs font-bold' : 'text-red-400 text-xs font-bold'}>{v}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Step-by-step diagnostic */}
            {loading && (
                <div className="text-center py-12 text-gray-500 text-sm">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3" />
                    Rodando diagnóstico completo... (pode levar ~10s)
                </div>
            )}

            {report && !loading && (
                <div className="space-y-4">

                    {/* Fatal */}
                    {report.fatal && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 font-bold text-sm flex items-center gap-2">
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                            {report.fatal}
                        </div>
                    )}

                    {/* Step 1: Auth */}
                    <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-2">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-white">1. Autenticação XGate</h2>
                            <StatusBadge ok={s.auth?.ok} />
                        </div>
                        {s.auth && (
                            <>
                                <div className="grid grid-cols-3 gap-3 text-xs text-gray-400">
                                    <span>Status HTTP: <strong className="text-white">{s.auth.status}</strong></span>
                                    <span>Tempo: <strong className="text-white">{s.auth.duration_ms}ms</strong></span>
                                    <span>Token: <strong className={s.auth.token_received ? 'text-primary' : 'text-red-400'}>{s.auth.token_received ? 'Recebido ✅' : 'NÃO recebido ❌'}</strong></span>
                                </div>
                                <JsonBlock data={s.auth.response} />
                            </>
                        )}
                    </div>

                    {/* Step 2: Currencies */}
                    <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-2">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-white">2. Busca de Moedas (BRL)</h2>
                            <StatusBadge ok={s.currencies?.ok} />
                        </div>
                        {s.currencies && (
                            <>
                                <div className="grid grid-cols-3 gap-3 text-xs text-gray-400">
                                    <span>Status HTTP: <strong className="text-white">{s.currencies.status}</strong></span>
                                    <span>Tempo: <strong className="text-white">{s.currencies.duration_ms}ms</strong></span>
                                    <span>BRL encontrado: <strong className={s.currencies.brl_found ? 'text-primary' : 'text-red-400'}>{s.currencies.brl_found ? 'Sim ✅' : 'Não ❌'}</strong></span>
                                </div>
                                {s.currencies.brl_object && (
                                    <div className="text-xs bg-black/40 rounded-lg p-2 text-gray-300 font-mono">
                                        {JSON.stringify(s.currencies.brl_object)}
                                    </div>
                                )}
                                <JsonBlock data={s.currencies.all_currencies} />
                            </>
                        )}
                    </div>

                    {/* Step 3: Deposit attempt */}
                    <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-white">3. Tentativa de Cobrança PIX</h2>
                            <StatusBadge ok={s.deposit_attempt?.ok} />
                        </div>

                        {s.dry_run_payload && (
                            <div className="text-xs space-y-1">
                                <p className="text-gray-500 font-bold uppercase">Payload enviado:</p>
                                <pre className="bg-black/40 border border-white/5 rounded-lg p-3 text-gray-300 overflow-x-auto">
                                    {JSON.stringify(s.dry_run_payload, null, 2)}
                                </pre>
                            </div>
                        )}

                        {s.deposit_attempt && (
                            <>
                                <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                                    <span>Status HTTP: <strong className="text-white">{s.deposit_attempt.status}</strong></span>
                                    <span>Tempo: <strong className="text-white">{s.deposit_attempt.duration_ms}ms</strong></span>
                                </div>

                                {/* QR field detection */}
                                <div className={`rounded-lg p-3 text-xs font-bold border ${s.deposit_attempt.qr_field_found?.startsWith('❌') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                                    Campo QR encontrado: {s.deposit_attempt.qr_field_found}
                                    {s.deposit_attempt.qr_value_preview && (
                                        <div className="font-mono font-normal text-gray-400 mt-1">{s.deposit_attempt.qr_value_preview}</div>
                                    )}
                                </div>

                                {/* Top-level keys */}
                                <div className="text-xs text-gray-500">
                                    <strong className="text-gray-400">Chaves top-level da resposta:</strong>{' '}
                                    <code className="text-yellow-400">{s.deposit_attempt.top_level_keys?.join(', ') || '(nenhuma)'}</code>
                                </div>
                                {s.deposit_attempt.data_keys?.length > 0 && (
                                    <div className="text-xs text-gray-500">
                                        <strong className="text-gray-400">Chaves dentro de .data:</strong>{' '}
                                        <code className="text-yellow-400">{s.deposit_attempt.data_keys.join(', ')}</code>
                                    </div>
                                )}

                                <JsonBlock data={s.deposit_attempt.full_response} />
                            </>
                        )}
                    </div>

                    {/* Webhook note */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-200 space-y-2">
                        <p className="font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-400" /> ⚠️ Ação necessária: Atualizar Webhook no XGate</p>
                        <p className="text-xs text-red-300/80">
                            A URL de webhook atual (<code className="bg-black/40 px-1 rounded">/api/xgate-debug</code>) só faz eco.
                            <strong className="text-white"> Vá ao painel XGate e troque a URL do Webhook para:</strong>
                        </p>
                        <code className="block bg-black/60 border border-red-500/20 px-3 py-2 rounded-lg text-primary font-mono text-xs break-all select-all">
                            https://app.preditybr.com/api/xgate-webhook
                        </code>
                        <p className="text-xs text-red-300/60">
                            Essa nova URL processa o pagamento: encontra a transação PENDING por xgate_id e credita o saldo do usuário automaticamente.
                        </p>
                    </div>
                </div>
            )}

            {/* ── USERS CPF PANEL ── */}
            <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-white">👤 Usuários — CPF & Status PIX</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Mostra exatamente o que seria enviado à XGate para cada usuário</p>
                    </div>
                    <button onClick={fetchUsers} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Atualizar
                    </button>
                </div>

                {/* search */}
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        placeholder="Buscar por e-mail ou nome..."
                        className="w-full bg-black/40 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-primary/40"
                    />
                </div>

                {usersLoading ? (
                    <div className="text-center py-6 text-gray-500 text-sm">Carregando usuários...</div>
                ) : (
                    <div className="space-y-2">
                        {filteredUsers.map(u => (
                            <div key={u.id}
                                className={`rounded-lg border p-3 text-xs cursor-pointer transition-all ${u.is_test_cpf ? 'bg-red-500/10 border-red-500/30' : u.ready_to_deposit ? 'bg-black/30 border-white/5 hover:border-primary/30' : 'bg-yellow-500/5 border-yellow-500/20'}`}
                                onClick={() => { setSelectedUser(u); inspectUser(u.id); }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-bold text-white">{u.full_name || '(sem nome)'}</span>
                                        <span className="text-gray-500 ml-2">{u.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {u.is_test_cpf && <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold">🚨 CPF TESTE</span>}
                                        {!u.is_test_cpf && !u.cpf_valid && u.cpf_raw_length > 0 && <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold">CPF INVÁLIDO</span>}
                                        {u.ready_to_deposit && <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold">✅ PRONTO</span>}
                                        {!u.ready_to_deposit && !u.is_test_cpf && <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-[10px] font-bold">⚠️ BLOQUEADO</span>}
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-1.5 text-gray-500">
                                    <span>CPF: <code className="text-gray-300">{u.cpf_masked}</code></span>
                                    <span>Saldo: <code className="text-gray-300">R$ {Number(u.balance || 0).toFixed(2)}</code></span>
                                    {u.cpf_error && <span className="text-red-400">{u.cpf_error}</span>}
                                    {u.name_error && <span className="text-yellow-400">{u.name_error}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* User detail drill-down */}
                {selectedUser && (
                    <div className="mt-4 bg-black/40 border border-primary/20 rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white text-sm">Detalhes: {selectedUser.email}</h3>
                            <button onClick={() => { setSelectedUser(null); setUserDetail(null); }} className="text-gray-500 hover:text-white text-xs">✕ Fechar</button>
                        </div>

                        {userDetailLoading && <div className="text-gray-500 text-xs text-center py-4">Carregando...</div>}

                        {userDetail && !userDetailLoading && (
                            <div className="space-y-3">
                                {/* CPF Analysis */}
                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Análise CPF</p>
                                    {userDetail.cpf_analysis?.is_test_cpf && (
                                        <div className="bg-red-500/15 border border-red-500/30 rounded-lg p-3 text-red-300 text-xs font-bold">
                                            🚨 CPF DE TESTE DETECTADO — XGate irá rejeitar toda tentativa de cobrança com este CPF.
                                            O usuário precisa atualizar o CPF no Perfil.
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-black/30 rounded-lg p-2">
                                            <span className="text-gray-500">CPF armazenado:</span>
                                            <code className="block text-white mt-0.5">{userDetail.cpf_analysis?.masked}</code>
                                        </div>
                                        <div className="bg-black/30 rounded-lg p-2">
                                            <span className="text-gray-500">Checksum válido:</span>
                                            <span className={`block font-bold mt-0.5 ${userDetail.cpf_analysis?.checksum_valid ? 'text-primary' : 'text-red-400'}`}>
                                                {userDetail.cpf_analysis?.checksum_valid ? '✅ Sim' : `❌ Não — ${userDetail.cpf_analysis?.checksum_error}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* XGate payload preview */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Payload exato que seria enviado à XGate</p>
                                    <pre className="bg-black/60 border border-white/5 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
                                        {JSON.stringify(userDetail.xgate_payload_preview, null, 2)}
                                    </pre>
                                </div>

                                {/* Recent deposits for this user */}
                                {userDetail.recent_deposits?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Últimos depósitos deste usuário</p>
                                        <div className="space-y-1.5">
                                            {userDetail.recent_deposits.map((tx: any) => (
                                                <div key={tx.id} className="flex items-center justify-between bg-black/30 rounded-lg p-2 text-xs">
                                                    <span className="text-gray-400">{new Date(tx.created_at).toLocaleString('pt-BR')}</span>
                                                    <span className="text-white font-bold">R$ {Number(tx.amount).toFixed(2)}</span>
                                                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${tx.status === 'COMPLETED' ? 'bg-primary/20 text-primary' : tx.status === 'FAILED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{tx.status}</span>
                                                    {tx.metadata?.xgate_id && <code className="text-gray-600">{tx.metadata.xgate_id.slice(0, 12)}...</code>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Recent Deposit Transactions */}
            <div className="bg-surface border border-white/5 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-white">Últimos Depósitos no Banco</h2>
                    <button onClick={fetchTransactions} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Atualizar
                    </button>
                </div>

                {txLoading ? (
                    <div className="text-center py-6 text-gray-500 text-sm">Carregando...</div>
                ) : txs.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">Nenhum depósito registrado ainda.</div>
                ) : (
                    <div className="space-y-2">
                        {txs.map(tx => (
                            <div key={tx.id} className="bg-black/30 rounded-lg p-3 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-gray-500">{tx.id?.slice(0, 12)}...</span>
                                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${tx.status === 'COMPLETED' ? 'bg-primary/20 text-primary' :
                                        tx.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>{tx.status}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>R$ {Number(tx.amount).toFixed(2)}</span>
                                    <span>{new Date(tx.created_at).toLocaleString('pt-BR')}</span>
                                </div>
                                {tx.metadata?.xgate_id && (
                                    <div className="text-gray-600">XGate ID: <code className="text-gray-400">{tx.metadata.xgate_id}</code></div>
                                )}
                                {tx.metadata?.error && (
                                    <div className="text-red-400">Erro: {tx.metadata.error}</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
