'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/layout/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { formatCPF, formatPhone } from '@/lib/utils';
import { Plus, Users, Search, Mail, Phone, CreditCard } from 'lucide-react';
import Link from 'next/link';
import type { SaleClient } from '@/types';

function ClientesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<SaleClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<SaleClient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login/admin');
      return;
    }

    loadClients();
    
    // Verificar mensagem de sucesso
    const success = searchParams.get('success');
    if (success) {
      setTimeout(() => {
        router.replace('/admin/clientes');
      }, 3000);
    }
  }, [user, router, searchParams]);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm]);

  const loadClients = async () => {
    try {
      setLoading(true);

      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('nome', { ascending: true });

      if (clientsError) throw clientsError;
      setClients(clientsData || []);
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = [...clients];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(client => {
        const nome = client.nome?.toLowerCase() || '';
        const cpf = client.cpf || '';
        const email = client.email?.toLowerCase() || '';
        return nome.includes(term) || cpf.includes(term) || email.includes(term);
      });
    }

    setFilteredClients(filtered);
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
              Clientes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestão de clientes do sistema
            </p>
          </div>
          <Link href="/admin/clientes/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
                placeholder="Buscar por nome, CPF ou email..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Clientes Cadastrados ({filteredClients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm 
                    ? 'Nenhum cliente encontrado'
                    : 'Nenhum cliente cadastrado ainda'}
                </p>
                {!searchTerm && (
                  <Link href="/admin/clientes/novo">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Primeiro Cliente
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="p-6 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 truncate">
                          {client.nome}
                        </h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <CreditCard className="h-4 w-4" />
                            <span>{formatCPF(client.cpf)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{client.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <Phone className="h-4 w-4" />
                            <span>{formatPhone(client.telefone)}</span>
                          </div>
                        </div>
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

export default function ClientesAdminPage() {
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
      <ClientesContent />
    </Suspense>
  );
}

