'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                const from = searchParams.get('from') || '/';
                router.replace(from);
            } else {
                const data = await res.json();
                setError(data.error || 'Senha incorreta.');
            }
        } catch {
            setError('Erro de conexão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-wrapper">
            <form onSubmit={handleSubmit} className="login-card">
                <h1>Acesso restrito</h1>
                <p className="login-subtitle">Digite a senha para continuar</p>

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    required
                    autoFocus
                    className="login-input"
                />

                {error && <p className="login-error">{error}</p>}

                <button type="submit" disabled={loading} className="login-btn">
                    {loading ? 'Verificando...' : 'Entrar'}
                </button>
            </form>

            <style>{`
                .login-wrapper {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #0f172a;
                    font-family: 'Inter', system-ui, sans-serif;
                }
                .login-card {
                    background: #1e293b;
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 2.5rem 2rem;
                    width: 100%;
                    max-width: 360px;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                }
                .login-card h1 {
                    margin: 0;
                    font-size: 1.4rem;
                    color: #f1f5f9;
                    font-weight: 700;
                    text-align: center;
                }
                .login-subtitle {
                    margin: 0;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 0.9rem;
                }
                .login-input {
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    border: 1px solid #475569;
                    background: #0f172a;
                    color: #f1f5f9;
                    font-size: 1rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .login-input:focus {
                    border-color: #6366f1;
                }
                .login-error {
                    margin: 0;
                    color: #f87171;
                    font-size: 0.875rem;
                    text-align: center;
                }
                .login-btn {
                    padding: 0.75rem;
                    border-radius: 8px;
                    border: none;
                    background: #6366f1;
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s, opacity 0.2s;
                }
                .login-btn:hover:not(:disabled) {
                    background: #4f46e5;
                }
                .login-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
