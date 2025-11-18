'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Car,
  FileText,
  Users,
  TrendingUp,
  DollarSign,
  LogOut,
  Menu,
  X,
  User,
  Package,
  CreditCard
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: number;
}

interface SidebarProps {
  items: SidebarItem[];
  onItemClick?: (item: SidebarItem) => void;
  onLogout?: () => void;
  userRole?: 'admin' | 'vendedor' | 'cliente';
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ items, onItemClick, onLogout, userRole, userName, userEmail }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleItemClick = (item: SidebarItem) => {
    if (item.href) {
      router.push(item.href);
    }
    if (onItemClick) {
      onItemClick(item);
    }
    setIsOpen(false);
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'admin':
        return 'from-blue-600 to-blue-800';
      case 'vendedor':
        return 'from-orange-500 to-orange-700';
      case 'cliente':
        return 'from-green-500 to-green-700';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin':
        return 'Administrador';
      case 'vendedor':
        return 'Vendedor';
      case 'cliente':
        return 'Cliente';
      default:
        return 'Usuário';
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-900 dark:text-white" />
        ) : (
          <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className={`p-6 bg-gradient-to-r ${getRoleColor()}`}>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Seminovo</h2>
              <p className="text-xs text-white/80">{getRoleLabel()}</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {(userName || userEmail) && (
          <div className="p-4 border-b border-gray-700 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{userName || 'Usuário'}</p>
                {userEmail && (
                  <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href || '');
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5 transition-transform group-hover:scale-110',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                )} />
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        {onLogout && (
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        )}
      </aside>

      {/* Spacer for desktop */}
      <div className="hidden lg:block w-64" />
    </>
  );
}

