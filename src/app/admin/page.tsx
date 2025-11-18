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
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Car, TrendingUp, DollarSign, Package, FileText, Users, AlertCircle, CheckCircle2, Building2, Shield, Wallet, FileCheck } from 'lucide-react';
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
    totalClients: 0,
    activeContracts: 0,
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

        const { data: clientsData } = await supabase
          .from('clients')
          .select('id')
          .eq('is_active', true);

        if (vehiclesData) {
          setVehicles(vehiclesData);
          const sold = vehiclesData.filter((v) => v.status === 'sold').length;
          const available = vehiclesData.filter((v) => v.status === 'available').length;
          const revenue = contractsData?.reduce((sum, c) => sum + (c.total_amount || 0), 0) || 0;
          const activeContracts = contractsData?.filter((c) => c.status === 'active').length || 0;

          setStats({
            totalVehicles: vehiclesData.length,
            soldVehicles: sold,
            availableVehicles: available,
            totalRevenue: revenue,
            totalClients: clientsData?.length || 0,
            activeContracts,
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

  const moduleCards = [
    {
      id: 'veiculos',
      title: 'Veículos',
      description: 'Gestão de inventário',
      icon: Car,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      value: `${stats.totalVehicles} veículos`,
      status: stats.availableVehicles > 0 ? 'Ativo' : 'Atenção',
      statusColor: stats.availableVehicles > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      onClick: () => setActiveTab('veiculos'),
    },
    {
      id: 'contratos',
      title: 'Contratos',
      description: 'Gestão de vendas',
      icon: FileText,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      value: `${stats.activeContracts} ativos`,
      status: 'Estável',
      statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      onClick: () => setActiveTab('contratos'),
    },
    {
      id: 'clientes',
      title: 'Clientes',
      description: 'Base de clientes',
      icon: Users,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      value: `${stats.totalClients} clientes`,
      status: 'Ativo',
      statusColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      onClick: () => setActiveTab('clientes'),
    },
    {
      id: 'financeiro',
      title: 'Financeiro',
      description: 'Receitas e vendas',
      icon: Wallet,
      iconColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      value: formatCurrency(stats.totalRevenue),
      status: 'Estável',
      statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      onClick: () => {},
    },
  ];

  return (
    <DashboardLayout 
      role="admin" 
      userName={profile?.full_name}
      userEmail={profile?.email}
      onLogout={handleLogout}
    >
      {/* Status Banner */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">• Sistema Kinito em funcionamento</span>
          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
            Online
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Painel Kinito</h1>
          <p className="text-blue-100 text-lg mb-6">Acesso rápido aos módulos do sistema</p>
          <Button
            onClick={() => {}}
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Tutorial
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Veículos</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalVehicles}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Total no inventário</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contratos</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.activeContracts}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Ativos</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Clientes</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalClients}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Cadastrados</p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Receita</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Total acumulado</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {moduleCards.map((module) => {
          const Icon = module.icon;
          return (
            <Card
              key={module.id}
              className="hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={module.onClick}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${module.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${module.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{module.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{module.description}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-3">{module.value}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${module.statusColor}`}>
                  {module.status}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
      )}

      {/* Recent Contracts */}
      {activeTab === 'dashboard' && (
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
      )}

      {/* Tabs Content */}
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
