'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/layout/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Save, ShoppingCart, User, Car, DollarSign, Percent } from 'lucide-react';
import Link from 'next/link';
import type { SaleClient, SaleVehicle } from '@/types';

export default function NovaVendaVendedorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<SaleClient[]>([]);
  const [vehicles, setVehicles] = useState<SaleVehicle[]>([]);
  const [commissionPercent, setCommissionPercent] = useState(5.00);
  const [formData, setFormData] = useState({
    client_id: '',
    vehicle_id: '',
    valor_venda: '',
    observacoes: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login/vendedor');
      return;
    }

    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      setLoadingData(true);

      // Carregar clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('nome', { ascending: true });

      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Carregar veículos disponíveis
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'disponivel')
        .order('marca', { ascending: true });

      if (vehiclesError) throw vehiclesError;
      setVehicles(vehiclesData || []);

      // Carregar percentual de comissão do usuário
      if (user) {
        const { data: profile } = await supabase
          .from('users_profile')
          .select('commission_percentage')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (profile?.commission_percentage) {
          setCommissionPercent(profile.commission_percentage);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'valor_venda') {
      const numValue = value.replace(/[^\d,]/g, '').replace(',', '.');
      setFormData(prev => ({ ...prev, valor_venda: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const calculateCommission = (): number => {
    const valor = parseFloat(formData.valor_venda.replace(',', '.')) || 0;
    return (valor * commissionPercent) / 100;
  };

  const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id);
  const selectedClient = clients.find(c => c.id === formData.client_id);
  const commission = calculateCommission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Validações
      if (!formData.client_id) {
        throw new Error('Selecione um cliente');
      }

      if (!formData.vehicle_id) {
        throw new Error('Selecione um veículo');
      }

      const valorVenda = parseFloat(formData.valor_venda.replace(',', '.'));
      if (!valorVenda || valorVenda <= 0) {
        throw new Error('Valor da venda deve ser maior que zero');
      }

      // Verificar se veículo ainda está disponível
      const { data: vehicleCheck } = await supabase
        .from('vehicles')
        .select('status')
        .eq('id', formData.vehicle_id)
        .single();

      if (!vehicleCheck || vehicleCheck.status !== 'disponivel') {
        throw new Error('Veículo não está mais disponível');
      }

      // Inserir venda (vendedor_id será automaticamente o usuário logado)
      const { data, error: insertError } = await supabase
        .from('sales')
        .insert({
          client_id: formData.client_id,
          vehicle_id: formData.vehicle_id,
          vendedor_id: user.id, // Sempre o vendedor logado
          valor_venda: valorVenda,
          comissao_percentual: commissionPercent,
          observacoes: formData.observacoes.trim() || null,
          status: 'em negociacao',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error('Erro ao registrar venda. Tente novamente.');
      }

      // Sucesso - redirecionar
      router.push('/vendedor/vendas?success=Venda registrada com sucesso');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao registrar venda.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout role="vendedor">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="vendedor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/vendedor/vendas">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Nova Venda
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Registre uma nova venda
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Seleção de Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Cliente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="form-label">Selecione o Cliente *</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => handleChange('client_id', e.target.value)}
                    className="form-input"
                    required
                    disabled={loading}
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.nome} - {client.cpf}
                      </option>
                    ))}
                  </select>
                  {selectedClient && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                        {selectedClient.nome}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-400">
                        {selectedClient.email} | {selectedClient.telefone}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Seleção de Veículo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="h-5 w-5" />
                  <span>Veículo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="form-label">Selecione o Veículo *</label>
                  <select
                    value={formData.vehicle_id}
                    onChange={(e) => handleChange('vehicle_id', e.target.value)}
                    className="form-input"
                    required
                    disabled={loading}
                  >
                    <option value="">Selecione um veículo</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.marca} {vehicle.modelo} {vehicle.ano} - {formatCurrency(vehicle.valor)}
                      </option>
                    ))}
                  </select>
                  {selectedVehicle && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-300">
                        {selectedVehicle.marca} {selectedVehicle.modelo} {selectedVehicle.ano}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        Valor: {formatCurrency(selectedVehicle.valor)}
                        {selectedVehicle.placa && ` | Placa: ${selectedVehicle.placa}`}
                      </p>
                    </div>
                  )}
                  {vehicles.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Nenhum veículo disponível. Entre em contato com o administrador.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dados da Venda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Dados da Venda</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Valor da Venda */}
                <div>
                  <label className="form-label flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Valor da Venda *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.valor_venda}
                    onChange={(e) => handleChange('valor_venda', e.target.value)}
                    className="form-input"
                    placeholder="50000.00"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Comissão (calculada automaticamente) */}
                <div>
                  <label className="form-label flex items-center space-x-2">
                    <Percent className="h-4 w-4" />
                    <span>Sua Comissão ({commissionPercent}%)</span>
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(commission)}
                    className="form-input bg-gray-50 dark:bg-gray-800"
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Calculada automaticamente
                  </p>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="form-label">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => handleChange('observacoes', e.target.value)}
                  className="form-input"
                  rows={4}
                  placeholder="Observações sobre a venda..."
                  maxLength={1000}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumo */}
          {formData.client_id && formData.vehicle_id && formData.valor_venda && (
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
              <CardHeader>
                <CardTitle>Resumo da Venda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Valor da Venda</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(parseFloat(formData.valor_venda.replace(',', '.')) || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sua Comissão</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(commission)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      Em Negociação
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Link href="/vendedor/vendas">
              <Button type="button" variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" isLoading={loading} disabled={loading || !formData.client_id || !formData.vehicle_id || !formData.valor_venda}>
              <Save className="h-4 w-4 mr-2" />
              Registrar Venda
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

