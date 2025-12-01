'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { validateCPF, validateEmail, sanitizeString, formatCPF, formatPhone } from '@/lib/utils';
import { ArrowLeft, Save, User, Mail, Phone, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function NovoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
  });

  const handleChange = (field: string, value: string) => {
    if (field === 'cpf') {
      const cleanValue = value.replace(/\D/g, '');
      if (cleanValue.length <= 11) {
        setFormData(prev => ({ ...prev, cpf: formatCPF(cleanValue) }));
      }
    } else if (field === 'telefone') {
      const cleanValue = value.replace(/\D/g, '');
      if (cleanValue.length <= 11) {
        setFormData(prev => ({ ...prev, telefone: formatPhone(cleanValue) }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: sanitizeString(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validações
      if (!formData.nome.trim()) {
        throw new Error('Nome é obrigatório');
      }

      const cleanCPF = formData.cpf.replace(/\D/g, '');
      if (!validateCPF(cleanCPF)) {
        throw new Error('CPF inválido');
      }

      if (!validateEmail(formData.email)) {
        throw new Error('Email inválido');
      }

      if (!formData.telefone.replace(/\D/g, '')) {
        throw new Error('Telefone é obrigatório');
      }

      // Verificar se CPF já existe
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('cpf', cleanCPF)
        .maybeSingle();

      if (existingClient) {
        throw new Error('CPF já cadastrado');
      }

      // Verificar se email já existe
      const { data: existingEmail } = await supabase
        .from('clients')
        .select('id')
        .eq('email', formData.email.toLowerCase().trim())
        .maybeSingle();

      if (existingEmail) {
        throw new Error('Email já cadastrado');
      }

      // Inserir cliente
      const { data, error: insertError } = await supabase
        .from('clients')
        .insert({
          nome: formData.nome.trim(),
          cpf: cleanCPF,
          telefone: formData.telefone.replace(/\D/g, ''),
          email: formData.email.toLowerCase().trim(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error('Erro ao cadastrar cliente. Tente novamente.');
      }

      // Sucesso - redirecionar
      router.push('/admin/clientes?success=Cliente cadastrado com sucesso');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cadastrar cliente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/clientes">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Novo Cliente
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Cadastre um novo cliente no sistema
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div>
                  <label className="form-label flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Nome Completo *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    className="form-input"
                    placeholder="João Silva"
                    required
                    maxLength={255}
                    disabled={loading}
                  />
                </div>

                {/* CPF */}
                <div>
                  <label className="form-label flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>CPF *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleChange('cpf', e.target.value)}
                    className="form-input"
                    placeholder="123.456.789-00"
                    required
                    maxLength={14}
                    disabled={loading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="form-label flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email *</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="form-input"
                    placeholder="joao@email.com"
                    required
                    maxLength={255}
                    disabled={loading}
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className="form-label flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Telefone *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => handleChange('telefone', e.target.value)}
                    className="form-input"
                    placeholder="(11) 99999-9999"
                    required
                    maxLength={15}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link href="/admin/clientes">
                  <Button type="button" variant="outline" disabled={loading}>
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" isLoading={loading} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Cliente
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

