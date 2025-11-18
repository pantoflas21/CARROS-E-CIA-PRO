'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/layout/AuthProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Car, TrendingUp, DollarSign, Package, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import type { Vehicle, Contract, UserProfile } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    soldVehicles: 0,
    availableVehicles: 0,
    totalRevenue: 0,
    monthlyGrowth: 12.5,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'veiculos' | 'contratos' | 'clientes'>('dashboard');

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

      if (!profileData || profileData.role !== 'admin' || !profileData.is_active) {
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

        if (!profileData || profileData.role !== 'admin') {
          return;
        }

        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: contractsData } = await supabase
          .from('contracts')
          .select('*')
          .order('created_at', { ascending: false });

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
            monthlyGrowth: 12.5,
          });
        }

        if (contractsData) {
          setContracts(contractsData);
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
      <DashboardLayout role="admin" onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const chartData = [
    { name: 'Disponíveis', value: stats.availableVehicles, color: '#10b981' },
    { name: 'Vendidos', value: stats.soldVehicles, color: '#3b82f6' },
  ];

  const monthlyData = contracts.slice(0, 6).reverse().map((contract) => ({
    month: new Date(contract.contract_date).toLocaleDateString('pt-BR', { month: 'short' }),
    valor: contract.total_amount,
  }));

  const COLORS = ['#3b82f6', '#10b981'];

  return (
    <DashboardLayout 
      role="admin" 
      userName={profile?.full_name}
      userEmail={profile?.email}
      onLogout={handleLogout}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard Administrativo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Visão geral completa do seu negócio
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex space-x-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'veiculos', label: '🚗 Veículos' },
          { id: 'contratos', label: '📄 Contratos' },
          { id: 'clientes', label: '👥 Clientes' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total de Veículos"
              value={stats.totalVehicles}
              icon={Car}
              iconColor="text-blue-600 dark:text-blue-400"
              trend={{ value: stats.monthlyGrowth, isPositive: true }}
            />
            <StatCard
              title="Disponíveis"
              value={stats.availableVehicles}
              icon={Package}
              iconColor="text-green-600 dark:text-green-400"
            />
            <StatCard
              title="Vendidos"
              value={stats.soldVehicles}
              icon={TrendingUp}
              iconColor="text-purple-600 dark:text-purple-400"
            />
            <StatCard
              title="Receita Total"
              value={formatCurrency(stats.totalRevenue)}
              icon={DollarSign}
              iconColor="text-orange-600 dark:text-orange-400"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Veículos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
                    <YAxis className="text-gray-600 dark:text-gray-400" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="valor" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Contracts */}
          <Card>
            <CardHeader>
              <CardTitle>Últimos Contratos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {contracts.slice(0, 10).map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {contract.contract_number}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(contract.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(contract.total_amount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {contract.num_installments} parcelas
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
            <CardTitle>Inventário de Veículos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Marca/Modelo</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Ano</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">KM</th>
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
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{vehicle.mileage.toLocaleString('pt-BR')} km</td>
                      <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">{formatCurrency(vehicle.price)}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
          </CardContent>
        </Card>
      )}

      {activeTab === 'contratos' && (
        <Card>
          <CardHeader>
            <CardTitle>Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="p-6 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {contract.contract_number}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {contract.num_installments} parcelas de {formatCurrency(contract.installment_value)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDate(contract.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {formatCurrency(contract.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'clientes' && (
        <Card>
          <CardHeader>
            <CardTitle>Gestão de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Área de gestão de clientes. Funcionalidade completa em desenvolvimento.
            </p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
