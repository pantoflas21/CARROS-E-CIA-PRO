'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/layout/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { formatCurrency } from '@/lib/utils';
import { Plus, Car, Search, Hash, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import type { SaleVehicle } from '@/types';

function VeiculosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<SaleVehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<SaleVehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login/admin');
      return;
    }

    loadVehicles();
    
    // Verificar mensagem de sucesso
    const success = searchParams.get('success');
    if (success) {
      setTimeout(() => {
        router.replace('/admin/veiculos');
      }, 3000);
    }
  }, [user, router, searchParams]);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, searchTerm, statusFilter]);

  const loadVehicles = async () => {
    try {
      setLoading(true);

      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (vehiclesError) throw vehiclesError;
      setVehicles(vehiclesData || []);
    } catch (err) {
      console.error('Error loading vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = [...vehicles];

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(vehicle => {
        const marca = vehicle.marca?.toLowerCase() || '';
        const modelo = vehicle.modelo?.toLowerCase() || '';
        const placa = vehicle.placa?.toLowerCase() || '';
        return marca.includes(term) || modelo.includes(term) || placa.includes(term);
      });
    }

    setFilteredVehicles(filtered);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'vendido' || status === 'sold') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Vendido
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Disponível
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Veículos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestão de inventário de veículos
            </p>
          </div>
          <Link href="/admin/veiculos/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Veículo
            </Button>
          </Link>
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
                  placeholder="Buscar por marca, modelo ou placa..."
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="all">Todos os Status</option>
                  <option value="disponivel">Disponível</option>
                  <option value="vendido">Vendido</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Veículos Cadastrados ({filteredVehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Nenhum veículo encontrado com os filtros aplicados'
                    : 'Nenhum veículo cadastrado ainda'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Link href="/admin/veiculos/novo">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Primeiro Veículo
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="p-6 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      {getStatusBadge(vehicle.status)}
                    </div>
                    
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      {vehicle.marca} {vehicle.modelo}
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Ano: {vehicle.ano}</span>
                      </div>
                      {vehicle.placa && (
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Hash className="h-4 w-4" />
                          <span>Placa: {vehicle.placa}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(vehicle.valor)}
                        </span>
                      </div>
                    </div>
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

export default function VeiculosAdminPage() {
  return (
    <Suspense fallback={
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <VeiculosContent />
    </Suspense>
  );
}

