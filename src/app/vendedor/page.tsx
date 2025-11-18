'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/layout/AuthProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Car, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import type { Vehicle, Contract, UserProfile } from '@/types';

export default function VendedorPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    totalVendas: 0,
    vendidosEsteMes: 0,
    comissaoMes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'veiculos' | 'contratos'>('dashboard');

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('users_profile')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!profileData || (profileData.role !== 'vendedor' && profileData.role !== 'admin') || !profileData.is_active) {
        router.push('/login?error=' + encodeURIComponent('Acesso negado'));
        return;
      }

      if (profileData) {
        setProfile(profileData as UserProfile);
      }
    };

    checkAuth();
  }, [user, router]);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const { data: profileData } = await supabase
          .from('users_profile')
          .select('role')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (!profileData || (profileData.role !== 'vendedor' && profileData.role !== 'admin')) {
          return;
        }

        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });

        const { data: contractsData } = await supabase
          .from('contracts')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (vehiclesData) {
          setVehicles(vehiclesData);
        }

        if (contractsData) {
          setContracts(contractsData);
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();

          const vendidosEsteMes = contractsData.filter((c) => {
            const contractDate = new Date(c.contract_date);
            return contractDate.getMonth() === currentMonth && contractDate.getFullYear() === currentYear;
          }).length;

          const comissaoMes = contractsData
            .filter((c) => {
              const contractDate = new Date(c.contract_date);
              return contractDate.getMonth() === currentMonth && contractDate.getFullYear() === currentYear;
            })
            .reduce((sum, c) => sum + (c.total_amount * 0.05), 0);

          setStats({
            totalVendas: contractsData.length,
            vendidosEsteMes,
            comissaoMes,
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading data:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <DashboardLayout role="vendedor" onLogout={handleLogout}>
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
    <DashboardLayout 
      role="vendedor" 
      userName={profile?.full_name}
      userEmail={profile?.email}
      onLogout={handleLogout}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
              Dashboard Vendedor
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Acompanhe suas vendas e comissões
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex space-x-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'veiculos', label: '🚗 Meus Veículos' },
          { id: 'contratos', label: '📄 Meus Contratos' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total de Vendas"
              value={stats.totalVendas}
              icon={TrendingUp}
              iconColor="text-orange-600 dark:text-orange-400"
            />
            <StatCard
              title="Vendidos este Mês"
              value={stats.vendidosEsteMes}
              icon={Calendar}
              iconColor="text-green-600 dark:text-green-400"
            />
            <StatCard
              title="Comissão este Mês"
              value={formatCurrency(stats.comissaoMes)}
              icon={DollarSign}
              iconColor="text-blue-600 dark:text-blue-400"
            />
          </div>

          {/* Recent Contracts */}
          <Card>
            <CardHeader>
              <CardTitle>Últimas Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {contracts.slice(0, 10).map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-lg border border-orange-200 dark:border-orange-900/30 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Car className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {contract.contract_number}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(contract.contract_date)} - {contract.num_installments} parcelas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(contract.total_amount)}
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                        +{formatCurrency(contract.total_amount * 0.05)} comissão
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'veiculos' && (
        <Card>
          <CardHeader>
            <CardTitle>Meus Veículos</CardTitle>
          </CardHeader>
          <CardContent>
            {vehicles.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Você ainda não cadastrou veículos</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Marca/Modelo</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Ano</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Valor</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr 
                        key={vehicle.id} 
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Car className="h-5 w-5 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {vehicle.brand} {vehicle.model}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{vehicle.year}</td>
                        <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">{formatCurrency(vehicle.price)}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              vehicle.status === 'available'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
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
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'contratos' && (
        <Card>
          <CardHeader>
            <CardTitle>Meus Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            {contracts.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Você ainda não tem contratos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="p-6 bg-gradient-to-r from-orange-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-xl border border-orange-200 dark:border-orange-900/30 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {contract.contract_number}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(contract.contract_date)} - {contract.num_installments} parcelas de{' '}
                          {formatCurrency(contract.installment_value)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                          {formatCurrency(contract.total_amount)}
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-400 font-semibold">
                          Comissão: {formatCurrency(contract.total_amount * 0.05)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
