'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { formatCPF, validateCPF, validateEmail, validateBirthDate, sanitizeString } from '@/lib/utils';
import { checkRateLimit } from '@/lib/validation';
import { Car, User, Info, ChevronRight, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginType, setLoginType] = useState<'admin-vendedor' | 'cliente' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const redirectParam = searchParams.get('redirect');
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
    
    if (redirectParam && !loginType) {
      sessionStorage.setItem('redirectAfterLogin', redirectParam);
    }
  }, [searchParams, loginType]);

  const handleAdminVendedorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const sanitizedEmail = sanitizeString(email).toLowerCase();
      const sanitizedPassword = password;

      if (!validateEmail(sanitizedEmail)) {
        throw new Error('Email inválido');
      }

      if (!checkRateLimit(`login-${sanitizedEmail}`, 5, 60000)) {
        throw new Error('Muitas tentativas. Aguarde 1 minuto antes de tentar novamente.');
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      if (signInError) {
        throw signInError;
      }

      if (!data.user) {
        throw new Error('Falha na autenticação');
      }

      const { data: profile, error: profileError } = await supabase
        .from('users_profile')
        .select('role, is_active')
        .eq('auth_user_id', data.user.id)
        .maybeSingle();

      if (profileError) {
        throw new Error('Erro ao verificar perfil do usuário');
      }

      if (!profile) {
        throw new Error('Perfil não encontrado');
      }

      if (!profile.is_active) {
        throw new Error('Conta desativada. Entre em contato com o administrador.');
      }

      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');

      if (profile.role === 'admin') {
        router.push(redirectPath || '/admin');
      } else if (profile.role === 'vendedor') {
        router.push(redirectPath || '/vendedor');
      } else {
        throw new Error('Acesso negado. Você não tem permissão para acessar esta área.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login. Verifique suas credenciais.';
      setError(errorMessage);
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClienteLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanCPF = cpf.replace(/\D/g, '');
      const sanitizedCPF = sanitizeString(cleanCPF);

      if (!validateCPF(sanitizedCPF)) {
        throw new Error('CPF inválido');
      }

      if (!validateBirthDate(birthDate)) {
        throw new Error('Data de nascimento inválida');
      }

      if (!checkRateLimit(`cliente-login-${sanitizedCPF}`, 5, 60000)) {
        throw new Error('Muitas tentativas. Aguarde 1 minuto antes de tentar novamente.');
      }

      const { data: cliente, error: clienteError } = await supabase
        .from('clients')
        .select('id, cpf, birth_date, is_active')
        .eq('cpf', sanitizedCPF)
        .maybeSingle();

      if (clienteError) {
        throw new Error('Erro ao verificar dados do cliente');
      }

      if (!cliente) {
        throw new Error('Cliente não encontrado');
      }

      if (!cliente.is_active) {
        throw new Error('Conta desativada. Entre em contato com a concessionária.');
      }

      const formattedBirthDate = birthDate.split('/').reverse().join('-');
      if (cliente.birth_date !== formattedBirthDate) {
        throw new Error('Data de nascimento incorreta');
      }

      const sessionToken = btoa(`${cliente.id}-${Date.now()}`);
      sessionStorage.setItem('cliente_session', sessionToken);
      sessionStorage.setItem('cliente_id', cliente.id);
      sessionStorage.setItem('cliente_cpf', cliente.cpf);
      sessionStorage.setItem('cliente_session_expires', String(Date.now() + 3600000));

      router.push('/cliente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login. Verifique seus dados.';
      setError(errorMessage);
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Cliente login error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!loginType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10 border border-white/20">
          <div className="text-center mb-8">
            <Logo size="lg" className="justify-center mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Sistema de Gestão de Vendas
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
              Do grego: mover, impulsionar
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setLoginType('admin-vendedor')}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center space-x-3">
                <User className="h-5 w-5" />
                <span>Administrador / Vendedor</span>
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            <button
              onClick={() => setLoginType('cliente')}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center space-x-3">
                <Car className="h-5 w-5" />
                <span>Área do Cliente</span>
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* Credenciais de Demo */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowCredentials(!showCredentials)}
              className="w-full flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4" />
                <span>Credenciais de Demonstração</span>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${showCredentials ? 'rotate-90' : ''}`} />
            </button>
            {showCredentials && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-3 text-left animate-fadeIn">
                <div>
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">Admin/Vendedor:</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">Email: <span className="font-mono font-semibold">admin@seminovo.com</span></p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">Senha: <span className="font-mono font-semibold">senha123</span></p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-green-900 dark:text-green-300 mb-1">Cliente:</p>
                  <p className="text-sm text-green-800 dark:text-green-200">CPF: <span className="font-mono font-semibold">123.456.789-00</span></p>
                  <p className="text-sm text-green-800 dark:text-green-200">Data: <span className="font-mono font-semibold">01/01/1990</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loginType === 'admin-vendedor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10 border border-white/20">
          <button
            onClick={() => setLoginType(null)}
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-6 hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-1 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </button>

          <div className="text-center mb-6">
            <Logo size="md" className="justify-center mb-2" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Login - Admin/Vendedor
            </h2>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-4 animate-slideIn">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleAdminVendedorLogin} className="space-y-5">
            <div>
              <label className="form-label flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(sanitizeString(e.target.value))}
                className="form-input"
                placeholder="admin@seminovo.com"
                required
                autoComplete="email"
                maxLength={255}
              />
            </div>

            <div>
              <label className="form-label">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full text-base py-3"
            >
              Entrar
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Credenciais de Demo:</p>
              <p className="text-xs text-blue-800 dark:text-blue-200 font-mono">Email: admin@seminovo.com</p>
              <p className="text-xs text-blue-800 dark:text-blue-200 font-mono">Senha: senha123</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Não consegue fazer login?
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-200 mb-2">
                Você precisa criar os usuários no Supabase primeiro.
              </p>
              <a
                href="/setup-usuarios"
                className="text-xs text-amber-900 dark:text-amber-300 font-semibold hover:underline inline-flex items-center"
              >
                Clique aqui para ver o guia completo →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10 border border-white/20">
        <button
          onClick={() => setLoginType(null)}
          className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-6 hover:text-gray-900 dark:hover:text-white transition-colors group"
        >
          <ChevronRight className="h-4 w-4 rotate-180 mr-1 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>

        <div className="text-center mb-6">
          <Logo size="md" className="justify-center mb-2" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Área do Cliente
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-4 animate-slideIn">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleClienteLogin} className="space-y-5">
          <div>
            <label className="form-label">CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => {
                const cleanValue = e.target.value.replace(/\D/g, '');
                if (cleanValue.length <= 11) {
                  setCpf(formatCPF(cleanValue));
                }
              }}
              className="form-input"
              placeholder="123.456.789-00"
              maxLength={14}
              required
              autoComplete="off"
            />
          </div>

          <div>
            <label className="form-label">Data de Nascimento</label>
            <input
              type="text"
              value={birthDate}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                  value = value.slice(0, 2) + '/' + value.slice(2);
                }
                if (value.length >= 5) {
                  value = value.slice(0, 5) + '/' + value.slice(5, 9);
                }
                setBirthDate(value);
              }}
              className="form-input"
              placeholder="01/01/1990"
              maxLength={10}
              required
              autoComplete="off"
            />
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full text-base py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            Entrar
          </Button>
        </form>

        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-xs font-semibold text-green-900 dark:text-green-300 mb-2">💡 Credenciais de Demo:</p>
          <p className="text-xs text-green-800 dark:text-green-200 font-mono">CPF: 123.456.789-00</p>
          <p className="text-xs text-green-800 dark:text-green-200 font-mono">Data: 01/01/1990</p>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          Acesso sem senha. Apenas CPF e data de nascimento.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <Logo size="lg" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
