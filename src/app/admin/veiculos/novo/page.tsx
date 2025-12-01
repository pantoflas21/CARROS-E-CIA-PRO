'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/layout/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { sanitizeString, formatCurrency } from '@/lib/utils';
import { ArrowLeft, Save, Car, Calendar, DollarSign, Hash } from 'lucide-react';
import Link from 'next/link';

export default function NovoVeiculoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: new Date().getFullYear().toString(),
    placa: '',
    valor: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login/admin');
    }
  }, [user, router]);

  const handleChange = (field: string, value: string) => {
    if (field === 'ano') {
      const numValue = value.replace(/\D/g, '');
      if (numValue.length <= 4) {
        setFormData(prev => ({ ...prev, ano: numValue }));
      }
    } else if (field === 'valor') {
      const numValue = value.replace(/[^\d,]/g, '').replace(',', '.');
      setFormData(prev => ({ ...prev, valor: numValue }));
    } else if (field === 'placa') {
      const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
      setFormData(prev => ({ ...prev, placa: upperValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: sanitizeString(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Validações
      if (!formData.marca.trim()) {
        throw new Error('Marca é obrigatória');
      }

      if (!formData.modelo.trim()) {
        throw new Error('Modelo é obrigatório');
      }

      const ano = parseInt(formData.ano);
      if (!ano || ano < 1900 || ano > new Date().getFullYear() + 1) {
        throw new Error('Ano inválido');
      }

      const valor = parseFloat(formData.valor.replace(',', '.'));
      if (!valor || valor <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }

      // Verificar se placa já existe (se informada)
      if (formData.placa) {
        const { data: existingVehicle } = await supabase
          .from('vehicles')
          .select('id')
          .eq('placa', formData.placa.toUpperCase())
          .maybeSingle();

        if (existingVehicle) {
          throw new Error('Placa já cadastrada');
        }
      }

      // Inserir veículo
      const { data, error: insertError } = await supabase
        .from('vehicles')
        .insert({
          marca: formData.marca.trim(),
          modelo: formData.modelo.trim(),
          ano: ano,
          placa: formData.placa ? formData.placa.toUpperCase() : null,
          valor: valor,
          status: 'disponivel',
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error('Erro ao cadastrar veículo. Tente novamente.');
      }

      // Sucesso - redirecionar
      router.push('/admin/veiculos?success=Veículo cadastrado com sucesso');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cadastrar veículo.';
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
            <Link href="/admin/veiculos">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Novo Veículo
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Cadastre um novo veículo no inventário
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
            <CardTitle>Dados do Veículo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Marca */}
                <div>
                  <label className="form-label flex items-center space-x-2">
                    <Car className="h-4 w-4" />
                    <span>Marca *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => handleChange('marca', e.target.value)}
                    className="form-input"
                    placeholder="Toyota"
                    required
                    maxLength={100}
                    disabled={loading}
                  />
                </div>

                {/* Modelo */}
                <div>
                  <label className="form-label flex items-center space-x-2">
                    <Car className="h-4 w-4" />
                    <span>Modelo *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => handleChange('modelo', e.target.value)}
                    className="form-input"
                    placeholder="Corolla"
                    required
                    maxLength={100}
                    disabled={loading}
                  />
                </div>

                {/* Ano */}
                <div>
                  <label className="form-label flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Ano *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ano}
                    onChange={(e) => handleChange('ano', e.target.value)}
                    className="form-input"
                    placeholder="2024"
                    required
                    maxLength={4}
                    disabled={loading}
                  />
                </div>

                {/* Placa */}
                <div>
                  <label className="form-label flex items-center space-x-2">
                    <Hash className="h-4 w-4" />
                    <span>Placa (Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.placa}
                    onChange={(e) => handleChange('placa', e.target.value)}
                    className="form-input"
                    placeholder="ABC1234"
                    maxLength={7}
                    disabled={loading}
                  />
                </div>

                {/* Valor */}
                <div className="md:col-span-2">
                  <label className="form-label flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Valor *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.valor}
                    onChange={(e) => handleChange('valor', e.target.value)}
                    className="form-input"
                    placeholder="50000.00"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Exemplo: 50000.00 ou 50000,00
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link href="/admin/veiculos">
                  <Button type="button" variant="outline" disabled={loading}>
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" isLoading={loading} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Veículo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

