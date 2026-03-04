'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string) => Promise<void>;
}

export function CategoryModal({ isOpen, onClose, onConfirm }: CategoryModalProps) {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onConfirm(name.trim());
            setName('');
            onClose();
        } catch (error) {
            console.error('Failed to create category:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md p-6 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-[#e6edf3]">Nova Categoria</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="category-name" className="block text-sm font-medium text-[#8b949e] mb-2">
                            Nome da Categoria
                        </label>
                        <input
                            id="category-name"
                            type="text"
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Alimentação, Lazer..."
                            className="w-full bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#58a6ff] transition-colors"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-[#c9d1d9] hover:bg-[#30363d] rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors min-w-[100px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                'Confirmar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
