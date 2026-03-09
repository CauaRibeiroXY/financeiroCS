'use client';

import { useState } from 'react';
import { Tags, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useCategories } from '@/app/hooks/useCategories';

export default function CategoriesPage() {
    const { categories, isLoading, isError, addCategory, deleteCategory } = useCategories();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await addCategory(newCategoryName.trim());
            setNewCategoryName('');
        } catch (err: any) {
            setError(err.message || 'Erro ao adicionar categoria');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (!window.confirm(`Tem certeza que deseja remover a categoria "${name}"?`)) return;

        try {
            await deleteCategory(id);
        } catch (err: any) {
            setError(err.message || 'Erro ao deletar categoria');
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0d1117] text-[#e6edf3]">
            {/* Top bar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]">
                <div className="flex items-center gap-3">
                    <Tags size={18} className="text-[#8b949e]" />
                    <h1 className="text-[#e6edf3] font-semibold text-base">Categorias Customizadas</h1>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* Add Category Form */}
                    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                        <h2 className="text-sm font-medium text-[#e6edf3] mb-4">Adicionar Nova Categoria</h2>

                        <form onSubmit={handleAddCategory} className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Ex: Restaurantes, Saúde, Lazer..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                disabled={isSubmitting}
                                className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-sm text-[#e6edf3] placeholder:text-[#8b949e] focus:outline-none focus:border-[#58a6ff] transition-colors disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!newCategoryName.trim() || isSubmitting}
                                className="flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                Adicionar
                            </button>
                        </form>

                        {error && (
                            <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Categories List */}
                    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#30363d]">
                            <h2 className="text-sm font-medium text-[#e6edf3]">Suas Categorias</h2>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center p-8">
                                <Loader2 size={24} className="animate-spin text-[#8b949e]" />
                            </div>
                        ) : isError ? (
                            <div className="p-8 text-center text-red-400 text-sm">
                                Erro ao carregar categorias.
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="p-8 text-center text-[#8b949e] text-sm">
                                Nenhuma categoria customizada encontrada.
                            </div>
                        ) : (
                            <div className="divide-y divide-[#30363d]">
                                {categories.map((category) => (
                                    <div key={category.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#21262d] transition-colors">
                                        <span className="text-sm text-[#e6edf3] font-medium">{category.name}</span>
                                        <button
                                            onClick={() => handleDeleteCategory(category.id, category.name)}
                                            className="p-2 text-[#8b949e] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            title="Excluir categoria"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
