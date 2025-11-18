'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import {
  LayoutDashboard,
  Car,
  FileText,
  Users,
  CreditCard,
  Package
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'vendedor' | 'cliente';
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

export function DashboardLayout({ children, role, userName, userEmail, onLogout }: DashboardLayoutProps) {
  const getMenuItems = () => {
    switch (role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
          { id: 'vehicles', label: 'Veículos', icon: Car, href: '/admin#veiculos' },
          { id: 'contracts', label: 'Contratos', icon: FileText, href: '/admin#contratos' },
          { id: 'clients', label: 'Clientes', icon: Users, href: '/admin#clientes' },
        ];
      case 'vendedor':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/vendedor' },
          { id: 'vehicles', label: 'Meus Veículos', icon: Car, href: '/vendedor#veiculos' },
          { id: 'contracts', label: 'Meus Contratos', icon: FileText, href: '/vendedor#contratos' },
        ];
      case 'cliente':
        return [
          { id: 'installments', label: 'Parcelas', icon: CreditCard, href: '/cliente#parcelas' },
          { id: 'history', label: 'Histórico', icon: Package, href: '/cliente#historico' },
          { id: 'data', label: 'Meus Dados', icon: Users, href: '/cliente#dados' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Sidebar
        items={getMenuItems()}
        onLogout={onLogout}
        userRole={role}
        userName={userName}
        userEmail={userEmail}
      />
      <main className="lg:ml-64 min-h-screen p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

