'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/layout/AuthProvider';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { Vehicle, Contract } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    soldVehicles: 0,
    availableVehicles: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'veiculos' | 'contratos' | 'clientes'>('dashboard');

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      // Verificar role do usuário
      const { data: profile } = await supabase
        .from('users_profile')
        .select('role, is_active')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!profile || profile.role !== 'admin' || !profile.is_active) {
        router.push('/login?error=' + encodeURIComponent('Acesso negado'));
        return;
      }
    };

    checkAuth();
  }, [user, router]);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Verificar role novamente antes de carregar dados
        const { data: profile } = await supabase
          .from('users_profile')
          .select('role')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (!profile || profile.role !== 'admin') {
          return;
        }

        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('*');

        const { data: contractsData } = await supabase
          .from('contracts')
          .select('*');

        if (vehiclesData) {
          setVehicles(vehiclesData);
          const sold = vehiclesData.filter((v) => v.status === 'sold').length;
          const available = vehiclesData.filter((v) => v.status === 'available').length;
          const revenue = contractsData?.reduce((sum, c) => sum + (c.total_amount || 0), 0) || 0;

          setStats({
            totalVehicles: vehiclesData.length,
            soldVehicles: sold,
            availableVehicles: available,
            totalRevenue: revenue,
          });
        }

        if (contractsData) {
          setContracts(contractsData);
        }
      } catch (error) {
        // Erro silencioso em produção, log apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading data:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
          Carregando...
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Disponíveis', value: stats.availableVehicles },
    { name: 'Vendidos', value: stats.soldVehicles },
  ];

  const COLORS = ['#3b82f6', '#10b981'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
      <nav className="bg-white dark:bg-slate-800 shadow">
        <div className="container-app py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Seminovo</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Painel Administrativo</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>
      </nav>

      <div className="container-app py-8">
        <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
          {['dashboard', 'veiculos', 'contratos', 'clientes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'dashboard' | 'veiculos' | 'contratos' | 'clientes')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'dashboard' && 'Dashboard'}
              {tab === 'veiculos' && 'Veículos'}
              {tab === 'contratos' && 'Contratos'}
              {tab === 'clientes' && 'Clientes'}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total de Veículos</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalVehicles}
                </p>
              </div>
              <div className="card p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Disponíveis</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.availableVehicles}
                </p>
              </div>
              <div className="card p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Vendidos</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.soldVehicles}
                </p>
              </div>
              <div className="card p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Distribuição de Veículos
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Últimos Contratos
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {contracts.slice(0, 5).map((contract) => (
                    <div
                      key={contract.id}
                      className="p-3 bg-gray-50 dark:bg-slate-700 rounded border border-gray-200 dark:border-gray-600"
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {contract.contract_number}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(contract.created_at)} - {formatCurrency(contract.total_amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'veiculos' && (
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Inventário de Veículos
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-2">Marca/Modelo</th>
                      <th className="text-left py-2 px-2">Ano</th>
                      <th className="text-left py-2 px-2">KM</th>
                      <th className="text-left py-2 px-2">Valor</th>
                      <th className="text-left py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="table-row">
                        <td className="py-3 px-2">
                          {vehicle.brand} {vehicle.model}
                        </td>
                        <td className="py-3 px-2">{vehicle.year}</td>
                        <td className="py-3 px-2">{vehicle.mileage.toLocaleString()}</td>
                        <td className="py-3 px-2">{formatCurrency(vehicle.price)}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              vehicle.status === 'available'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {vehicle.status === 'available' ? 'Disponível' : 'Vendido'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contratos' && (
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Contratos
              </h3>
              <div className="space-y-3">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="p-4 bg-gray-50 dark:bg-slate-700 rounded border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {contract.contract_number}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {contract.num_installments} parcelas de{' '}
                          {formatCurrency(contract.installment_value)}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(contract.total_amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clientes' && (
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Gestão de Clientes
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Área de gestão de clientes. Funcionalidade completa em desenvolvimento.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
