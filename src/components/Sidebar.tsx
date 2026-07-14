'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  MapPin,
  CloudSun,
  ShieldAlert,
  Bot,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'stadium', label: 'Stadium Map', icon: MapPin },
  { id: 'climate', label: 'Climate', icon: CloudSun },
  { id: 'risk', label: 'Risk Panel', icon: ShieldAlert },
  { id: 'copilot', label: 'AI Copilot', icon: Bot },
];

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`sidebar-desktop flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[68px]' : 'w-[220px]'
      }`}
      style={{ height: '100vh', position: 'sticky', top: 0 }}
    >
      {/* Logo Area */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-gray-100">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 flex-shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-[15px] font-bold text-gray-900 tracking-tight leading-tight">
              EventOS X
            </h1>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              Command Center
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2.5 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium
                transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-[18px] h-[18px] flex-shrink-0 ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-2.5 pb-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors text-xs cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
