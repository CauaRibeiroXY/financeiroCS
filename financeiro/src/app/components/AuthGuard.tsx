'use client';

import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react'; // Supondo lucide-react baseado no package.json

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const savedPassword = localStorage.getItem('app_password');
        if (savedPassword) {
            setupFetchInterceptor(savedPassword);
            // Faremos uma verificação silenciosa na inicialização
            verifyTokenSilent(savedPassword);
        } else {
            setIsLoading(false);
        }
    }, []);

    const setupFetchInterceptor = (pass: string) => {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            let [resource, config] = args;
            config = config || {};

            // Criando Headers adequadamente
            const headers = new Headers(config.headers || {});
            headers.set('Authorization', `Bearer ${pass}`);
            config.headers = Object.fromEntries(headers.entries());

            return originalFetch(resource, config);
        };
    };

    const verifyTokenSilent = async (pass: string) => {
        try {
            const res = await fetch('/api/auth/verify', {
                headers: { Authorization: `Bearer ${pass}` },
            });
            if (res.ok) {
                setIsAuthenticated(true);
            } else {
                localStorage.removeItem('app_password'); // Limpa senha inválida
                // Reseta o fetch para o original? Em uma aplicação simples, apenas atualiza estado.
            }
        } catch {
            // Falha na rede pode ser silenciada ou recarregar
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setError('');
        setIsLoading(true);
        try {
            // Requerimento: chamada de teste à API para validar
            const res = await fetch('/api/auth/verify', {
                headers: { Authorization: `Bearer ${password}` },
            });

            if (res.ok) {
                localStorage.setItem('app_password', password);
                setupFetchInterceptor(password);
                setIsAuthenticated(true);
            } else {
                setError('Senha de acesso incorreta.');
            }
        } catch (err) {
            setError('Erro ao se comunicar com o servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 z-50">
                <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl ring-1 ring-gray-900/5 dark:ring-white/10">
                    <div className="mb-8 flex flex-col items-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Acesso Restrito</h1>
                        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                            Por favor, insira a senha do aplicativo para acessar o painel de controle.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div>
                            <input
                                type="password"
                                placeholder="Senha de acesso"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-lg border-0 bg-gray-50 dark:bg-gray-800 p-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
                                <p className="text-center text-sm text-red-600 dark:text-red-400 line-clamp-2">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !password}
                            className="mt-2 w-full rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Entrar
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
