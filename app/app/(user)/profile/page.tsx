"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, Phone, Mail, Lock, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { User } from '@supabase/supabase-js';

// Interface for public user profile
interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    document?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit states
    const [editingDocument, setEditingDocument] = useState(false);
    const [editingPhone, setEditingPhone] = useState(false);
    const [editingName, setEditingName] = useState(false); // New Name Edit

    const [documentValue, setDocumentValue] = useState("");
    const [phoneValue, setPhoneValue] = useState("");
    const [nameValue, setNameValue] = useState(""); // Name value

    const router = useRouter();

    // CPF auto-mask helper
    const formatCpf = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
        if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUser(session.user);

            // Fetch public profile
            const { data: profileData, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
                setDocumentValue(profileData.document || "");
                setPhoneValue(profileData.phone || "");
                setNameValue(profileData.full_name || session.user.user_metadata?.full_name || "");
            } else {
                console.log("Profile not found in public.users, using session defaults.");
                // Use session defaults
                setNameValue(session.user.user_metadata?.full_name || "");
                // Trigger auto-creation attempts or alert user to sync
            }

            setLoading(false);
        };
        getUser();
    }, [router]);

    const handleUpdateProfile = async (field?: 'document' | 'phone' | 'full_name', value?: string) => {
        if (!user) return;
        setSaving(true);

        // Prepare data for upsert
        const updates: any = {
            id: user.id,
            email: user.email,
            // updated_at: new Date().toISOString(), // Column likely missing, removing to fix error
        };

        // If specific field update, update that state and payload

        if (field === 'full_name') updates.full_name = value;
        else updates.full_name = nameValue || profile?.full_name || user.user_metadata?.full_name || "Usuario";

        if (field === 'document') updates.document = value ? value.replace(/\D/g, '') : undefined;
        else updates.document = documentValue ? documentValue.replace(/\D/g, '') : profile?.document;

        if (field === 'phone') updates.phone = value;
        else updates.phone = phoneValue || profile?.phone;

        try {
            // UPSERT to ensure creation if missing
            const { error } = await supabase
                .from('users')
                .upsert(updates)
                .select()
                .single();

            if (error) throw error;

            // Update local state
            if (field === 'full_name' && value) {
                setProfile(prev => prev ? { ...prev, full_name: value } : null);
                setEditingName(false);
            }
            if (field === 'document' && value) {
                setProfile(prev => prev ? { ...prev, document: value } : null);
                setEditingDocument(false);
            }
            if (field === 'phone' && value) {
                setProfile(prev => prev ? { ...prev, phone: value } : null);
                setEditingPhone(false);
            }

            // If saving generic (e.g. "Force Sync")
            if (!field) {
                alert("Perfil sincronizado com sucesso!");
                router.refresh();
                // Reload profile data
                const { data: newProfile } = await supabase.from('users').select('*').eq('id', user.id).single();
                if (newProfile) setProfile(newProfile);
            }

        } catch (error: any) {
            console.error("Error updating profile:", error);
            alert(`Erro ao atualizar perfil: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary">Carregando...</div>;

    return (
        <div className="max-w-md mx-auto space-y-8 pb-20">
            <h1 className="text-xl font-bold mb-6">Dados Pessoais</h1>

            {/* Nome */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Nome</label>
                <div className={`bg-surface rounded-lg p-4 text-white font-medium border border-white/5 flex items-center justify-between ${editingName ? 'ring-1 ring-primary' : ''}`}>
                    {editingName ? (
                        <div className="flex w-full gap-2">
                            <input
                                type="text"
                                value={nameValue}
                                onChange={(e) => setNameValue(e.target.value)}
                                className="bg-transparent w-full outline-none text-white"
                            />
                            <button
                                onClick={() => handleUpdateProfile('full_name', nameValue)}
                                disabled={saving}
                                className="text-xs font-bold text-green-400 uppercase disabled:opacity-50"
                            >
                                Salvar
                            </button>
                            <button
                                onClick={() => setEditingName(false)}
                                className="text-xs font-bold text-red-400 uppercase"
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <>
                            <span>{profile?.full_name || nameValue || 'Não informado'}</span>
                            <button
                                onClick={() => setEditingName(true)}
                                className="text-xs font-bold text-primary hover:text-green-400 transition-colors uppercase"
                            >
                                Alterar
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* CPF/CNPJ */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">CPF/CNPJ</label>
                <div className={`bg-surface rounded-lg p-4 text-white font-medium border border-white/5 flex items-center justify-between ${editingDocument ? 'ring-1 ring-primary' : ''}`}>
                    {editingDocument ? (
                        <div className="flex w-full gap-2">
                            <input
                                type="text"
                                value={documentValue}
                                onChange={(e) => setDocumentValue(formatCpf(e.target.value))}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                className="bg-transparent w-full outline-none text-white"
                            />
                            <button
                                onClick={() => handleUpdateProfile('document', documentValue)}
                                disabled={saving}
                                className="text-xs font-bold text-green-400 uppercase disabled:opacity-50"
                            >
                                Salvar
                            </button>
                            <button
                                onClick={() => setEditingDocument(false)}
                                className="text-xs font-bold text-red-400 uppercase"
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <>
                            <span>{profile?.document || "Não informado"}</span>
                            <button
                                onClick={() => setEditingDocument(true)}
                                className="text-xs font-bold text-primary hover:text-green-400 transition-colors uppercase"
                            >
                                Alterar
                            </button>
                        </>
                    )}
                </div>
            </div>

            <h2 className="text-sm font-bold text-gray-400 uppercase pt-4">Segurança</h2>

            {/* Status Verificação */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Status verificação</label>
                <div className="bg-surface rounded-lg p-3 flex items-center justify-between border border-white/5">
                    <span className="font-bold text-white flex items-center gap-2">
                        {profile?.document ? (
                            <><CheckCircle className="w-4 h-4 text-green-500" /> Verificado (Básico)</>
                        ) : (
                            <><AlertCircle className="w-4 h-4 text-yellow-500" /> Não Verificado</>
                        )}
                    </span>
                    {!profile?.document && (
                        <button
                            onClick={() => setEditingDocument(true)}
                            className="text-xs font-bold text-primary hover:text-green-400 transition-colors uppercase"
                        >
                            Verificar
                        </button>
                    )}
                </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                <div className="bg-surface rounded-lg p-3 flex items-center justify-between border border-white/5">
                    <span className="text-white truncate max-w-[200px]">{user?.email}</span>
                    <span className="text-xs text-gray-500 uppercase">Protegido</span>
                </div>
            </div>

            {/* Telefone */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Telefone</label>
                <div className={`bg-surface rounded-lg p-3 flex items-center justify-between border border-white/5 ${editingPhone ? 'ring-1 ring-primary' : ''}`}>
                    {editingPhone ? (
                        <div className="flex w-full gap-2">
                            <input
                                type="text"
                                value={phoneValue}
                                onChange={(e) => setPhoneValue(e.target.value)}
                                placeholder="+55 11 99999-9999"
                                className="bg-transparent w-full outline-none text-white"
                            />
                            <button
                                onClick={() => handleUpdateProfile('phone', phoneValue)}
                                disabled={saving}
                                className="text-xs font-bold text-green-400 uppercase disabled:opacity-50"
                            >
                                Salvar
                            </button>
                            <button
                                onClick={() => setEditingPhone(false)}
                                className="text-xs font-bold text-red-400 uppercase"
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <>
                            <span className={profile?.phone ? "text-white" : "text-gray-400"}>
                                {profile?.phone || "Sem telefone"}
                            </span>
                            <button
                                onClick={() => setEditingPhone(true)}
                                className="text-xs font-bold text-primary hover:text-green-400 transition-colors uppercase"
                            >
                                Alterar
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Senha</label>
                <div className="bg-surface rounded-lg p-3 flex items-center justify-between border border-white/5">
                    <span className="text-gray-400">••••••••</span>
                    <button className="text-xs font-bold text-primary hover:text-green-400 transition-colors uppercase">
                        Alterar
                    </button>
                </div>
            </div>


            <h2 className="text-sm font-bold text-gray-400 uppercase pt-4">Configurações</h2>

            {/* Force Sync Link/Button */}
            <div className="pt-2 text-center">
                <button
                    onClick={() => handleUpdateProfile()}
                    className="text-xs text-gray-500 hover:text-white underline"
                >
                    Sincronizar meu Perfil
                </button>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-500 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all mt-4"
            >
                <LogOut className="w-4 h-4" />
                Sair da conta
            </button>


        </div>
    );
}
