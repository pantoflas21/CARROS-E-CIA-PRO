'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, CheckCircle2, AlertCircle, Download, FileText } from 'lucide-react';
import type { Client, Contract, Installment, Vehicle } from '@/types';

interface ContractWithVehicle extends Contract {
  vehicles?: Vehicle | null;
}

export default function ClientePage() {
  const router = useRouter();
  const [cliente, setCliente] = useState<Client | null>(null);
  const [contracts, setContracts] = useState<ContractWithVehicle[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'parcelas' | 'historico' | 'dados'>('parcelas');

  useEffect(() => {
    const loadClientData = async () => {
      try {
        const clienteId = sessionStorage.getItem('cliente_id');
        const sessionExpires = sessionStorage.getItem('cliente_session_expires');
        const sessionToken = sessionStorage.getItem('cliente_session');

        if (!clienteId || !sessionToken) {
          router.push('/login');
          return;
        }

        if (sessionExpires && Date.now() > parseInt(sessionExpires)) {
          sessionStorage.clear();
          router.push('/login?error=' + encodeURIComponent('Sessão expirada. Faça login novamente.'));
          return;
        }

        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clienteId)
          .maybeSingle();

        if (clientData) {
          setCliente(clientData);
        }

        const { data: contractsData } = await supabase
          .from('contracts')
          .select(`
            *,
            vehicles (
              id,
              brand,
              model,
              year,
              license_plate,
              color,
              price
            )
          `)
          .eq('client_id', clienteId);

        if (contractsData) {
          setContracts(contractsData);

          const { data: installmentsData } = await supabase
            .from('installments')
            .select('*')
            .in('contract_id', contractsData.map((c) => c.id));

          if (installmentsData) {
            setInstallments(installmentsData);
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading client data:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('cliente_id');
    sessionStorage.removeItem('cliente_cpf');
    sessionStorage.removeItem('cliente_session');
    sessionStorage.removeItem('cliente_session_expires');
    router.push('/login');
  };

  const handleDownloadBoleto = (boleto_url: string | null) => {
    if (!boleto_url) {
      alert('Boleto não disponível para download');
      return;
    }
    
    try {
      const url = new URL(boleto_url);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('URL inválida');
      }
      window.open(boleto_url, '_blank', 'noopener,noreferrer');
    } catch {
      alert('Erro ao abrir boleto. URL inválida.');
    }
  };

  const handleDownloadContract = (contract_pdf_url: string | null) => {
    if (!contract_pdf_url) {
      alert('Contrato não disponível para download');
      return;
    }
    
    try {
      const url = new URL(contract_pdf_url);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('URL inválida');
      }
      window.open(contract_pdf_url, '_blank', 'noopener,noreferrer');
    } catch {
      alert('Erro ao abrir contrato. URL inválida.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="cliente" onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const overdueParcels = installments.filter(
    (i) => i.status === 'open' && new Date(i.due_date) < new Date()
  );
  const openParcels = installments.filter((i) => i.status === 'open');
  const paidParcels = installments.filter((i) => i.status === 'paid');

  return (
    <DashboardLayout 
      role="cliente" 
      userName={cliente?.full_name}
      userEmail={cliente?.email}
      onLogout={handleLogout}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
              Bem-vindo, {cliente?.full_name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Acompanhe suas parcelas e contratos
            </p>
          </div>
        </div>
      </div>

      {cliente && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fadeIn">
            <StatCard
              title="Parcelas em Aberto"
              value={openParcels.length}
              icon={CreditCard}
              iconColor="text-blue-600 dark:text-blue-400"
            />
            <StatCard
              title="Parcelas Pagas"
              value={paidParcels.length}
              icon={CheckCircle2}
              iconColor="text-green-600 dark:text-green-400"
            />
            <StatCard
              title="Parcelas Atrasadas"
              value={overdueParcels.length}
              icon={AlertCircle}
              iconColor="text-red-600 dark:text-red-400"
            />
          </div>

          {/* Tabs */}
          <div className="mb-8 flex space-x-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
            {[
              { id: 'parcelas', label: '💳 Parcelas' },
              { id: 'historico', label: '📊 Histórico' },
              { id: 'dados', label: '👤 Dados' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="animate-fadeIn">
            {activeTab === 'parcelas' && (
              <Card>
                <CardHeader>
                  <CardTitle>Parcelas em Aberto</CardTitle>
                </CardHeader>
                <CardContent>
                  {openParcels.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Nenhuma parcela em aberto</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {openParcels.map((installment) => {
                        const isOverdue = new Date(installment.due_date) < new Date();
                        return (
                          <div
                            key={installment.id}
                            className={`flex items-center justify-between p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                              isOverdue
                                ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-900/30'
                                : 'bg-gradient-to-r from-blue-50 to-white dark:from-slate-800 dark:to-slate-700 border-blue-200 dark:border-blue-900/30'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-lg ${
                                isOverdue
                                  ? 'bg-red-100 dark:bg-red-900/30'
                                  : 'bg-blue-100 dark:bg-blue-900/30'
                              }`}>
                                <CreditCard className={`h-6 w-6 ${
                                  isOverdue
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-blue-600 dark:text-blue-400'
                                }`} />
                              </div>
                              <div>
                                <p className="font-bold text-lg text-gray-900 dark:text-white">
                                  Parcela {installment.installment_number}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Vencimento: {formatDate(installment.due_date)}
                                </p>
                                <p className={`text-xl font-bold mt-1 ${
                                  isOverdue
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-blue-600 dark:text-blue-400'
                                }`}>
                                  {formatCurrency(installment.amount)}
                                </p>
                                {isOverdue && (
                                  <p className="text-sm text-red-600 dark:text-red-400 font-semibold mt-1 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    ATRASADO
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => handleDownloadBoleto(installment.boleto_url ?? null)}
                              size="lg"
                              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Baixar Boleto
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'historico' && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Pagamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  {paidParcels.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Nenhum pagamento realizado</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paidParcels.map((installment) => (
                        <div
                          key={installment.id}
                          className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-white dark:from-green-900/20 dark:to-slate-800 rounded-xl border border-green-200 dark:border-green-900/30 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-bold text-lg text-gray-900 dark:text-white">
                                Parcela {installment.installment_number}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Vencimento: {formatDate(installment.due_date)}
                              </p>
                              <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                                ✓ {formatCurrency(installment.amount)}
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

            {activeTab === 'dados' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Meus Dados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: 'Nome', value: cliente.full_name },
                        { label: 'Email', value: cliente.email },
                        { label: 'Telefone', value: cliente.phone },
                        { label: 'Endereço', value: `${cliente.address}, ${cliente.city} - ${cliente.state}` },
                      ].map((field, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                            {field.label}
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">{field.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contrato(s)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {contracts.length === 0 ? (
                      <p className="text-gray-600 dark:text-gray-400">Nenhum contrato</p>
                    ) : (
                      <div className="space-y-4">
                        {contracts.map((contract) => (
                          <div
                            key={contract.id}
                            className="p-6 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                  {contract.vehicles?.brand} {contract.vehicles?.model} ({contract.vehicles?.year})
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Placa: {contract.vehicles?.license_plate}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Contrato: {contract.contract_number}
                                </p>
                              </div>
                              <Button
                                onClick={() => handleDownloadContract(contract.contract_pdf_url ?? null)}
                                size="sm"
                                className="bg-gradient-to-r from-blue-600 to-blue-700"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Download PDF
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                              <div>
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                                  Valor Total
                                </p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  {formatCurrency(contract.total_amount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                                  Parcelas
                                </p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  {contract.num_installments}x
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
