'use client';

import React, { useState } from 'react';
import { Check, Copy, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';

const SQL_SCRIPT = `-- ============================================
-- SCRIPT SQL PARA CRIAR USUÁRIOS NO SUPABASE
-- Copie este script e cole no SQL Editor do Supabase
-- ============================================

-- Habilitar extensão pgcrypto (se necessário)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criar usuário Admin (apenas se não existir)
DO $$
DECLARE
  admin_user_id uuid;
  admin_exists boolean;
BEGIN
  -- Verificar se o usuário admin já existe
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@seminovo.com') INTO admin_exists;
  
  IF NOT admin_exists THEN
    INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@seminovo.com',
    crypt('senha123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  )
  RETURNING id INTO admin_user_id;

  INSERT INTO public.users_profile (
    auth_user_id,
    role,
    full_name,
    email,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    admin_user_id,
    'admin',
    'Administrador Kinito',
    'admin@seminovo.com',
    true,
    now(),
    now()
  );
    RAISE NOTICE 'Usuário admin criado com ID: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Usuário admin já existe, pulando criação.';
  END IF;
END $$;

-- Criar usuário Vendedor (apenas se não existir)
DO $$
DECLARE
  vendedor_user_id uuid;
  vendedor_exists boolean;
BEGIN
  -- Verificar se o usuário vendedor já existe
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'vendedor@seminovo.com') INTO vendedor_exists;
  
  IF NOT vendedor_exists THEN
    INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'vendedor@seminovo.com',
    crypt('senha123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  )
  RETURNING id INTO vendedor_user_id;

  INSERT INTO public.users_profile (
    auth_user_id,
    role,
    full_name,
    email,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    vendedor_user_id,
    'vendedor',
    'Vendedor Kinito',
    'vendedor@seminovo.com',
    true,
    now(),
    now()
  );
    RAISE NOTICE 'Usuário vendedor criado com ID: %', vendedor_user_id;
  ELSE
    RAISE NOTICE 'Usuário vendedor já existe, pulando criação.';
  END IF;
END $$;

-- Criar Clientes de Demonstração
INSERT INTO public.clients (
  cpf,
  full_name,
  email,
  phone,
  birth_date,
  address,
  city,
  state,
  zip_code,
  nationality,
  profession,
  marital_status,
  is_active
)
VALUES
  (
    '12345678900',
    'João Silva',
    'joao@email.com',
    '(11) 99999-0001',
    '1990-01-01',
    'Rua A, 123',
    'São Paulo',
    'SP',
    '01234-567',
    'Brasileiro',
    'Engenheiro',
    'Casado',
    true
  ),
  (
    '98765432100',
    'Maria Santos',
    'maria@email.com',
    '(11) 99999-0002',
    '1985-05-15',
    'Avenida B, 456',
    'Rio de Janeiro',
    'RJ',
    '20000-000',
    'Brasileira',
    'Médica',
    'Solteira',
    true
  )
ON CONFLICT (cpf) DO NOTHING;

-- Verificar usuários criados
SELECT 
  u.email,
  up.role,
  up.full_name,
  up.is_active
FROM auth.users u
JOIN public.users_profile up ON u.id = up.auth_user_id
WHERE u.email IN ('admin@seminovo.com', 'vendedor@seminovo.com');

-- Verificar clientes criados
SELECT 
  cpf,
  full_name,
  email,
  birth_date,
  is_active
FROM public.clients
WHERE cpf IN ('12345678900', '98765432100');`;

export default function SetupUsuariosPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SCRIPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
      // Fallback para navegadores antigos
      const textArea = document.createElement('textarea');
      textArea.value = SQL_SCRIPT;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Configuração de Usuários
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Siga os passos abaixo para criar os usuários no Supabase
          </p>
        </div>

        {/* Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-blue-600" />
                <span>Passo 1: Acesse o Supabase</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>Acesse <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a></li>
                <li>Entre no seu projeto</li>
                <li>Clique em <strong>SQL Editor</strong> no menu lateral</li>
                <li>Clique em <strong>New query</strong></li>
              </ol>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Abrir Supabase <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Copy className="h-5 w-5 text-green-600" />
                <span>Passo 2: Copie o Script</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Clique no botão abaixo para copiar o script SQL automaticamente.
              </p>
              <Button
                onClick={handleCopy}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Script SQL
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* SQL Script Box */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Script SQL Completo</CardTitle>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="outline"
                className="flex items-center space-x-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copiar Tudo</span>
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-gray-900 dark:bg-slate-950 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed">
                <code>{SQL_SCRIPT}</code>
              </pre>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Dica: Você pode selecionar todo o texto acima e copiar manualmente (Ctrl+A, Ctrl+C)
            </p>
          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-purple-600" />
              <span>Passo 3: Cole e Execute</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>Cole o script copiado no campo de query do SQL Editor</li>
              <li>Clique em <strong>Run</strong> (ou pressione <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">F5</kbd>)</li>
              <li>Aguarde a execução completar</li>
              <li>Verifique se apareceu a mensagem de sucesso</li>
            </ol>
          </CardContent>
        </Card>

        {/* Credentials */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>Credenciais de Login</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Admin</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <code className="block mt-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-gray-900 dark:text-gray-100">
                      admin@seminovo.com
                    </code>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Senha:</span>
                    <code className="block mt-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-gray-900 dark:text-gray-100">
                      senha123
                    </code>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-orange-800">
                <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-3">Vendedor</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <code className="block mt-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-gray-900 dark:text-gray-100">
                      vendedor@seminovo.com
                    </code>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Senha:</span>
                    <code className="block mt-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-gray-900 dark:text-gray-100">
                      senha123
                    </code>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-300 mb-3">Cliente</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">CPF:</span>
                    <code className="block mt-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-gray-900 dark:text-gray-100">
                      123.456.789-00
                    </code>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Data Nasc.:</span>
                    <code className="block mt-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-gray-900 dark:text-gray-100">
                      01/01/1990
                    </code>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Ou:</span>
                    <code className="block mt-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs text-gray-900 dark:text-gray-100">
                      CPF: 987.654.321-00<br />
                      Data: 15/05/1985
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Query */}
        <Card>
          <CardHeader>
            <CardTitle>Verificar Usuários Criados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Após executar o script, execute estas queries para verificar se tudo foi criado:
            </p>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Verificar Usuários (Admin/Vendedor):</p>
                <div className="relative">
                  <pre className="bg-gray-900 dark:bg-slate-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    <code>{`SELECT 
  u.email,
  up.role,
  up.full_name,
  up.is_active
FROM auth.users u
JOIN public.users_profile up ON u.id = up.auth_user_id
WHERE u.email IN ('admin@seminovo.com', 'vendedor@seminovo.com');`}</code>
                  </pre>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Deve retornar 2 linhas (Admin e Vendedor).
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Verificar Clientes:</p>
                <div className="relative">
                  <pre className="bg-gray-900 dark:bg-slate-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    <code>{`SELECT 
  cpf,
  full_name,
  email,
  birth_date,
  is_active
FROM public.clients
WHERE cpf IN ('12345678900', '98765432100');`}</code>
                  </pre>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Deve retornar 2 linhas (João Silva e Maria Santos).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center mt-8">
          <a
            href="/login"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Voltar para o Login
          </a>
        </div>
      </div>
    </div>
  );
}

