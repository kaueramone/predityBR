"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import Link from 'next/link';

export default function NewBetPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'POLÍTICA',
        end_date: '',
        image_url: '',
        yes_image_url: '',
        no_image_url: '',
        initial_pool: 0
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: any, field: string) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${new Date().getTime()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage (Bucket: 'images')
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) {
                console.error("Upload error details:", uploadError);
                throw new Error("Falha ao fazer upload. Verifique se o bucket 'images' existe e é público.");
            }

            const { data } = supabase.storage.from('images').getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, [field]: data.publicUrl }));

        } catch (error: any) {
            console.error(error);
            alert("Erro no upload: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.title || !formData.end_date) {
                alert("Preencha os campos obrigatórios.");
                setLoading(false);
                return;
            }

            const { error } = await supabase.from('markets').insert({
                title: formData.title,
                description: formData.description,
                category: formData.category,
                end_date: new Date(formData.end_date).toISOString(),
                image_url: formData.image_url,
                metadata: {
                    yes_image: formData.yes_image_url,
                    no_image: formData.no_image_url
                },
                status: 'OPEN',
                total_pool: 0,
                total_yes_amount: 0,
                total_no_amount: 0,
                created_by: 'ADMIN'
            });

            if (error) throw error;

            alert("Aposta criada com sucesso!");
            router.push('/admin/bets');

        } catch (error: any) {
            console.error("Error creating bet:", error);
            alert("Erro ao criar aposta: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/bets" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </Link>
                <h1 className="text-2xl font-bold text-white">Nova Aposta</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-surface/30 border border-white/5 rounded-xl p-8 space-y-8">

                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Informações Básicas</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400">Pergunta (Título)</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                type="text"
                                placeholder="Ex: O dólar vai cair amanhã?"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400">Categoria</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary appearance-none"
                            >
                                <option value="POLÍTICA">Política</option>
                                <option value="ESPORTE">Esporte</option>
                                <option value="ECONOMIA">Economia</option>
                                <option value="CRIPTO">Cripto</option>
                                <option value="REALITY">Reality Show</option>
                                <option value="CLIMA">Clima</option>
                                <option value="ENTRETENIMENTO">Entretenimento</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400">Descrição (Detalhes)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Regras específicas para resolução..."
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400">Data de Encerramento (Fim das Apostas)</label>
                            <input
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleChange}
                                type="datetime-local"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary [color-scheme:dark]"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Imagens</h3>

                    {/* Cover Image */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                            Imagem de Capa <span className="text-xs font-normal text-gray-600">(Upload ou URL)</span>
                        </label>
                        <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                                <input
                                    type="file"
                                    onChange={(e) => handleImageUpload(e, 'image_url')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                />
                                <div className="bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-gray-400 flex justify-center items-center gap-2 hover:bg-white/5 transition-colors">
                                    <Upload className="w-5 h-5" />
                                    <span>{uploading ? 'Enviando...' : 'Clique para enviar imagem'}</span>
                                </div>
                            </div>
                            <input
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                type="url"
                                placeholder="Ou cole a URL..."
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                            />
                        </div>
                        {formData.image_url && (
                            <div className="mt-2 w-full h-40 rounded md:w-64 overflow-hidden border border-white/20 bg-black">
                                <img src={formData.image_url} className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Yes Image */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                                Avatar "SIM"
                            </label>
                            <div className="flex flex-col gap-2">
                                <div className="relative">
                                    <input
                                        type="file"
                                        onChange={(e) => handleImageUpload(e, 'yes_image_url')}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept="image/*"
                                    />
                                    <div className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-400 flex justify-center items-center gap-2 hover:bg-white/5 transition-colors">
                                        <Upload className="w-4 h-4" /> Importar
                                    </div>
                                </div>
                                <input
                                    name="yes_image_url"
                                    value={formData.yes_image_url}
                                    onChange={handleChange}
                                    type="url"
                                    placeholder="URL..."
                                    className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                />
                                {formData.yes_image_url && (
                                    <img src={formData.yes_image_url} className="w-10 h-10 rounded-full object-cover border border-white/20 bg-black" />
                                )}
                            </div>
                        </div>

                        {/* No Image */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                                Avatar "NÃO"
                            </label>
                            <div className="flex flex-col gap-2">
                                <div className="relative">
                                    <input
                                        type="file"
                                        onChange={(e) => handleImageUpload(e, 'no_image_url')}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept="image/*"
                                    />
                                    <div className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-400 flex justify-center items-center gap-2 hover:bg-white/5 transition-colors">
                                        <Upload className="w-4 h-4" /> Importar
                                    </div>
                                </div>
                                <input
                                    name="no_image_url"
                                    value={formData.no_image_url}
                                    onChange={handleChange}
                                    type="url"
                                    placeholder="URL..."
                                    className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                />
                                {formData.no_image_url && (
                                    <img src={formData.no_image_url} className="w-10 h-10 rounded-full object-cover border border-white/20 bg-black" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-4">
                    <Link href="/admin/bets" className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-colors">
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : <><Save className="w-5 h-5" /> Criar Aposta</>}
                    </button>
                </div>

            </form>
        </div>
    );
}
