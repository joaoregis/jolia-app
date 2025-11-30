// src/screens/LoginScreen.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    signInWithEmailAndPassword,
    AuthError
} from 'firebase/auth';
import { auth } from '../lib/firebase.ts';
import { Briefcase } from 'lucide-react';

export const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (e) {
            const authError = e as AuthError;
            if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
                setError('Email ou senha incorretos.');
            } else if (authError.code === 'auth/invalid-email') {
                setError('O formato do email é inválido.');
            }
            else {
                setError('Ocorreu um erro ao tentar entrar. Verifique a sua ligação.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Briefcase className="mx-auto h-12 w-auto text-[var(--accent)]" />
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                        Aceda à sua conta
                    </h2>
                </div>

                <div className="rounded-xl bg-[var(--card)] p-8 shadow-lg border border-[var(--border)]">
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)]">
                                Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full appearance-none rounded-md border border-[var(--border)] px-3 py-2 placeholder-[var(--text-secondary)] shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-[var(--accent)] bg-[var(--background)] text-[var(--text-primary)]"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)]">
                                Senha
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full appearance-none rounded-md border border-[var(--border)] px-3 py-2 placeholder-[var(--text-secondary)] shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-[var(--accent)] bg-[var(--background)] text-[var(--text-primary)]"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-md border border-transparent bg-[var(--accent)] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'A entrar...' : 'Entrar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
