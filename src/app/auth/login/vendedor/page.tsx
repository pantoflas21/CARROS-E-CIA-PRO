'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { validateEmail, sanitizeString } from '@/lib/utils';
import { checkRateLimit } from '@/lib/validation';
import { User, AlertCircle, Lock, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function VendedorLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verificar se Supabase está configurado
      if (!isSupabaseConfigured()) {
        throw new Error('Sistema não configurado. Verifique as variáveis de ambiente.');
      }

      // Validar email
      const sanitizedEmail = sanitizeString(email).toLowerCase().trim();
      if (!validateEmail(sanitizedEmail)) {
        throw new Error('Email inválido');
      }

      // Rate limiting
      if (!checkRateLimit(`vendedor-login-${sanitizedEmail}`, 5, 60000)) {
        throw new Error('Muitas tentativas. Aguarde 1 minuto antes de tentar novamente.');
      }

      // Fazer login no Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        
        // Tratamento de erros específicos
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos');
        } else if (authError.message.includes('Email not confirmed')) {
          throw new Error('Email não confirmado. Verifique sua caixa de entrada.');
        } else if (authError.message.includes('Too many requests')) {
          throw new Error('Muitas tentativas. Aguarde alguns minutos.');
        } else {
          throw new Error(authError.message || 'Erro ao fazer login. Tente novamente.');
        }
      }

      if (!authData?.user) {
        throw new Error('Falha na autenticação. Tente novamente.');
      }

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('users_profile')
        .select('role, is_active, full_name')
        .eq('auth_user_id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error('Erro ao verificar perfil do usuário. Tente novamente.');
      }

      if (!profile) {
        // Fazer logout se não tiver perfil
        await supabase.auth.signOut();
        throw new Error('Perfil não encontrado. Entre em contato com o administrador.');
      }

      if (!profile.is_active) {
        await supabase.auth.signOut();
        throw new Error('Conta desativada. Entre em contato com o administrador.');
      }

      // Verificar se é vendedor
      if (profile.role !== 'vendedor') {
        await supabase.auth.signOut();
        throw new Error('Acesso negado. Esta área é exclusiva para vendedores.');
      }

      // Redirecionar para dashboard vendedor
      const redirectPath = searchParams.get('redirect') || '/vendedor';
      router.push(redirectPath);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login. Verifique suas credenciais.';
      setError(errorMessage);
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Vendedor login error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10 border border-white/20">
        {/* Back button */}
        <Link
          href="/login"
          className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-6 hover:text-gray-900 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <Logo size="md" className="justify-center mb-2" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Login Vendedor
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Acesso exclusivo para vendedores
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-4 animate-slideIn">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="form-label flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(sanitizeString(e.target.value))}
              className="form-input"
              placeholder="vendedor@kinito.com"
              required
              autoComplete="email"
              maxLength={255}
              disabled={loading}
            />
          </div>

          <div>
            <label className="form-label flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Senha</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              minLength={8}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full text-base py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar como Vendedor'}
          </Button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <p className="text-xs font-semibold text-orange-900 dark:text-orange-300 mb-2 flex items-center">
            <User className="h-3 w-3 mr-1" />
            Credenciais de Demonstração:
          </p>
          <div className="space-y-1 text-xs text-orange-800 dark:text-orange-200">
            <p><span className="font-mono font-semibold">Email:</span> vendedor@kinito.com</p>
            <p><span className="font-mono font-semibold">Senha:</span> Vendedor@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VendedorLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-800 flex items-center justify-center">
        <Logo size="lg" />
      </div>
    }>
      <VendedorLoginForm />
    </Suspense>
  );
}

