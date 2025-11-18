'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
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
        // Validar sessão do cliente
        const clienteId = sessionStorage.getItem('cliente_id');
        const sessionExpires = sessionStorage.getItem('cliente_session_expires');
        const sessionToken = sessionStorage.getItem('cliente_session');

        if (!clienteId || !sessionToken) {
          router.push('/login');
          return;
        }

        // Verificar expiração da sessão
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
        // Erro silencioso em produção, log apenas em desenvolvimento
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
    // Limpar todas as informações da sessão
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
    
    // Validar URL antes de abrir
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
    
    // Validar URL antes de abrir
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
          Carregando...
        </div>
      </div>
    );
  }

  const overdueParcels = installments.filter(
    (i) => i.status === 'open' && new Date(i.due_date) < new Date()
  );
  const openParcels = installments.filter((i) => i.status === 'open');
  const paidParcels = installments.filter((i) => i.status === 'paid');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <nav className="bg-white dark:bg-slate-800 shadow">
        <div className="container-app py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Seminovo</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Área do Cliente</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>
      </nav>

      <main className="container-app py-8">
        {cliente && (
          <>
            <div className="card mb-8 p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Bem-vindo, {cliente.full_name}!
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Parcelas em Aberto</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {openParcels.length}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Parcelas Pagas</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {paidParcels.length}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Parcelas Atrasadas</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {overdueParcels.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                  {['parcelas', 'historico', 'dados'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as 'parcelas' | 'historico' | 'dados')}
                      className={`px-6 py-4 font-medium transition-colors ${
                        activeTab === tab
                          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      {tab === 'parcelas' && 'Parcelas'}
                      {tab === 'historico' && 'Histórico'}
                      {tab === 'dados' && 'Dados'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'parcelas' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Parcelas em Aberto
                    </h3>
                    {openParcels.length === 0 ? (
                      <p className="text-gray-600 dark:text-gray-400">Nenhuma parcela em aberto</p>
                    ) : (
                      <div className="space-y-3">
                        {openParcels.map((installment) => (
                          <div
                            key={installment.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Parcela {installment.installment_number}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Vencimento: {formatDate(installment.due_date)}
                              </p>
                              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(installment.amount)}
                              </p>
                              {new Date(installment.due_date) < new Date() && (
                                <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                                  ⚠️ ATRASADO
                                </p>
                              )}
                            </div>
                            <Button
                              onClick={() =>
                                handleDownloadBoleto(installment.boleto_url ?? null)
                              }
                              size="sm"
                            >
                              Baixar Boleto
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'historico' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Histórico de Pagamentos
                    </h3>
                    {paidParcels.length === 0 ? (
                      <p className="text-gray-600 dark:text-gray-400">
                        Nenhum pagamento realizado
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {paidParcels.map((installment) => (
                          <div
                            key={installment.id}
                            className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700"
                          >
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Parcela {installment.installment_number}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Vencimento: {formatDate(installment.due_date)}
                              </p>
                              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                ✓ {formatCurrency(installment.amount)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'dados' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Meus Dados
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                          Nome
                        </p>
                        <p className="text-gray-900 dark:text-white">{cliente.full_name}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                          Email
                        </p>
                        <p className="text-gray-900 dark:text-white">{cliente.email}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                          Telefone
                        </p>
                        <p className="text-gray-900 dark:text-white">{cliente.phone}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                          Endereço
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {cliente.address}, {cliente.city} - {cliente.state}
                        </p>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                      Contrato(s)
                    </h4>
                    {contracts.length === 0 ? (
                      <p className="text-gray-600 dark:text-gray-400">Nenhum contrato</p>
                    ) : (
                      <div className="space-y-3">
                        {contracts.map((contract) => (
                          <div
                            key={contract.id}
                            className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {contract.vehicles?.brand} {contract.vehicles?.model} (
                                  {contract.vehicles?.year})
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
                              >
                                Download PDF
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Valor Total</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(contract.total_amount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">
                                  Parcelas: {contract.num_installments}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
