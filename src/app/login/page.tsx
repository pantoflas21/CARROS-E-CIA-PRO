'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { formatCPF, validateCPF, validateEmail, validateBirthDate, sanitizeString } from '@/lib/utils';
import { checkRateLimit } from '@/lib/validation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginType, setLoginType] = useState<'admin-vendedor' | 'cliente' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verificar mensagens de erro da URL
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const redirectParam = searchParams.get('redirect');
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
    
    // Se houver redirect, tentar redirecionar após login
    if (redirectParam && !loginType) {
      // Salvar redirect para usar após login bem-sucedido
      sessionStorage.setItem('redirectAfterLogin', redirectParam);
    }
  }, [searchParams, loginType]);

  const handleAdminVendedorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sanitização de inputs
      const sanitizedEmail = sanitizeString(email).toLowerCase();
      const sanitizedPassword = password;

      // Validação de email
      if (!validateEmail(sanitizedEmail)) {
        throw new Error('Email inválido');
      }

      // Rate limiting
      if (!checkRateLimit(`login-${sanitizedEmail}`, 5, 60000)) {
        throw new Error('Muitas tentativas. Aguarde 1 minuto antes de tentar novamente.');
      }

      // Tentativa de login
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

      // Verificar perfil do usuário
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

      // Redirecionar baseado no role
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
      
      // Log de erro (sem informações sensíveis)
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
      // Sanitização
      const cleanCPF = cpf.replace(/\D/g, '');
      const sanitizedCPF = sanitizeString(cleanCPF);

      // Validações
      if (!validateCPF(sanitizedCPF)) {
        throw new Error('CPF inválido');
      }

      if (!validateBirthDate(birthDate)) {
        throw new Error('Data de nascimento inválida');
      }

      // Rate limiting
      if (!checkRateLimit(`cliente-login-${sanitizedCPF}`, 5, 60000)) {
        throw new Error('Muitas tentativas. Aguarde 1 minuto antes de tentar novamente.');
      }

      // Buscar cliente
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

      // Validar data de nascimento
      const formattedBirthDate = birthDate.split('/').reverse().join('-');
      if (cliente.birth_date !== formattedBirthDate) {
        throw new Error('Data de nascimento incorreta');
      }

      // Criar sessão temporária segura usando sessionStorage
      // Usar um token simples baseado em timestamp para validação
      const sessionToken = btoa(`${cliente.id}-${Date.now()}`);
      sessionStorage.setItem('cliente_session', sessionToken);
      sessionStorage.setItem('cliente_id', cliente.id);
      sessionStorage.setItem('cliente_cpf', cliente.cpf);
      
      // Definir expiração (1 hora)
      sessionStorage.setItem('cliente_session_expires', String(Date.now() + 3600000));

      router.push('/cliente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login. Verifique seus dados.';
      setError(errorMessage);
      
      // Log de erro (sem informações sensíveis)
      if (process.env.NODE_ENV === 'development') {
        console.error('Cliente login error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!loginType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            Seminovo
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Sistema de Gestão de Vendas
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setLoginType('admin-vendedor')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Administrador / Vendedor
            </button>
            <button
              onClick={() => setLoginType('cliente')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Área do Cliente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loginType === 'admin-vendedor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 max-w-md w-full">
          <button
            onClick={() => setLoginType(null)}
            className="text-sm text-gray-600 dark:text-gray-400 mb-4 hover:underline"
          >
            ← Voltar
          </button>

          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Login - Admin/Vendedor
          </h2>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminVendedorLogin} className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(sanitizeString(e.target.value))}
                className="form-input"
                placeholder="seu@email.com"
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
              className="w-full"
            >
              Entrar
            </Button>
          </form>

          {process.env.NODE_ENV === 'development' && (
            <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-4">
              Modo desenvolvimento ativo
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 max-w-md w-full">
        <button
          onClick={() => setLoginType(null)}
          className="text-sm text-gray-600 dark:text-gray-400 mb-4 hover:underline"
        >
          ← Voltar
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Área do Cliente
        </h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleClienteLogin} className="space-y-4">
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
              placeholder="000.000.000-00"
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
              placeholder="DD/MM/AAAA"
              maxLength={10}
              required
              autoComplete="off"
            />
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full"
          >
            Entrar
          </Button>
        </form>

        <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-4">
          Acesso sem senha. Apenas CPF e data de nascimento.
        </p>
      </div>
    </div>
  );
}
