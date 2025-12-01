'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/layout/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, ShoppingCart, DollarSign, TrendingUp, Filter, Search, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import type { Sale } from '@/types';

export default function MinhasVendasPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    minhasVendas: 0,
    totalComissao: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login/vendedor');
      return;
    }

    loadSales();
  }, [user, router]);

  useEffect(() => {
    filterSales();
  }, [sales, searchTerm, statusFilter]);

  const loadSales = async () => {
    try {
      setLoading(true);

      if (!user) return;

      // Buscar apenas vendas do vendedor logado
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          client:clients(id, nome, cpf, email, telefone),
          vehicle:vehicles(id, marca, modelo, ano, placa, valor)
        `)
        .eq('vendedor_id', user.id)
        .order('created_at', { ascending: false });

      if (salesError) throw salesError;

      const salesWithRelations = (salesData || []).map(sale => ({
        ...sale,
        client: sale.client as any,
        vehicle: sale.vehicle as any,
      }));

      setSales(salesWithRelations);

      // Calcular estatísticas
      const minhasVendas = salesWithRelations.length;
      const totalComissao = salesWithRelations
        .filter(s => s.status === 'vendido')
        .reduce((sum, s) => sum + parseFloat(String(s.comissao)), 0);

      setStats({
        minhasVendas,
        totalComissao,
      });
    } catch (err) {
      console.error('Error loading sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterSales = () => {
    let filtered = [...sales];

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.status === statusFilter);
    }

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sale => {
        const clientName = sale.client?.nome?.toLowerCase() || '';
        const vehicleInfo = `${sale.vehicle?.marca} ${sale.vehicle?.modelo}`.toLowerCase();
        const cpf = sale.client?.cpf || '';
        return clientName.includes(term) || vehicleInfo.includes(term) || cpf.includes(term);
      });
    }

    setFilteredSales(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'vendido':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center space-x-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Vendido</span>
          </span>
        );
      case 'em negociacao':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Em Negociação</span>
          </span>
        );
      case 'cancelado':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center space-x-1">
            <XCircle className="h-3 w-3" />
            <span>Cancelado</span>
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Minhas Vendas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Acompanhe todas as suas vendas e comissões
            </p>
          </div>
          <Link href="/vendedor/vendas/nova">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Minhas Vendas"
            value={stats.minhasVendas}
            icon={ShoppingCart}
            iconColor="text-orange-600 dark:text-orange-400"
          />
          <StatCard
            title="Total em Comissão"
            value={formatCurrency(stats.totalComissao)}
            icon={DollarSign}
            iconColor="text-green-600 dark:text-green-400"
          />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                  placeholder="Buscar por cliente, veículo ou CPF..."
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input pl-10"
                >
                  <option value="all">Todos os Status</option>
                  <option value="em negociacao">Em Negociação</option>
                  <option value="vendido">Vendido</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Minhas Vendas ({filteredSales.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSales.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Nenhuma venda encontrada com os filtros aplicados'
                    : 'Você ainda não registrou nenhuma venda'}
                </p>
                <Link href="/vendedor/vendas/nova">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Primeira Venda
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-6 bg-gradient-to-r from-orange-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-xl border border-orange-200 dark:border-orange-900/30 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {getStatusBadge(sale.status)}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(sale.created_at)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cliente</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {sale.client?.nome || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {sale.client?.cpf || ''} | {sale.client?.email || ''}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Veículo</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {sale.vehicle?.marca} {sale.vehicle?.modelo} {sale.vehicle?.ano}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {sale.vehicle?.placa && `Placa: ${sale.vehicle.placa}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Valor da Venda</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {formatCurrency(parseFloat(String(sale.valor_venda)))}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sua Comissão</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(parseFloat(String(sale.comissao)))}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          ({sale.comissao_percentual}%)
                        </p>
                      </div>
                    </div>

                    {sale.observacoes && (
                      <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-900/30">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Observações:</span> {sale.observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

