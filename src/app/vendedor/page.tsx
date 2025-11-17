'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/layout/AuthProvider';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Vehicle, Contract } from '@/types';

export default function VendedorPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
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

      // Verificar role do usuário
      const { data: profile } = await supabase
        .from('users_profile')
        .select('role, is_active')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!profile || (profile.role !== 'vendedor' && profile.role !== 'admin') || !profile.is_active) {
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

        if (!profile || (profile.role !== 'vendedor' && profile.role !== 'admin')) {
          return;
        }

        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('*')
          .eq('created_by', user.id);

        const { data: contractsData } = await supabase
          .from('contracts')
          .select('*')
          .eq('seller_id', user.id);

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
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
      <nav className="bg-white dark:bg-slate-800 shadow">
        <div className="container-app py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Seminovo</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Área do Vendedor</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>
      </nav>

      <div className="container-app py-8">
        <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
          {['dashboard', 'veiculos', 'contratos'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'dashboard' | 'veiculos' | 'contratos')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'dashboard' && 'Dashboard'}
              {tab === 'veiculos' && 'Meus Veículos'}
              {tab === 'contratos' && 'Meus Contratos'}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total de Vendas</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.totalVendas}
              </p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Vendidos este Mês</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.vendidosEsteMes}
              </p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Comissão este Mês</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.comissaoMes)}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'veiculos' && (
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Meus Veículos
              </h3>
              {vehicles.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">Você ainda não cadastrou veículos</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-2">Marca/Modelo</th>
                        <th className="text-left py-2 px-2">Ano</th>
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
                          <td className="py-3 px-2">{formatCurrency(vehicle.price)}</td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
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
            </div>
          </div>
        )}

        {activeTab === 'contratos' && (
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Meus Contratos
              </h3>
              {contracts.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">Você ainda não tem contratos</p>
              ) : (
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
                            {formatDate(contract.contract_date)} -{' '}
                            {contract.num_installments} parcelas
                          </p>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(contract.total_amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
