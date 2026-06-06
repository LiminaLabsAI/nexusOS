import React, { useState } from 'react';
import { Bell, Search, User, LogOut, ChevronDown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';

const PERSONAS = [
  { value: 'ceo', label: 'CEO', color: 'bg-chart-1' },
  { value: 'coo', label: 'COO', color: 'bg-chart-2' },
  { value: 'cfo', label: 'CFO', color: 'bg-chart-3' },
  { value: 'plant_manager', label: 'Plant Manager', color: 'bg-chart-4' },
  { value: 'supply_chain', label: 'Supply Chain', color: 'bg-chart-5' },
  { value: 'operations', label: 'Operations Mgr', color: 'bg-primary' },
  { value: 'data_engineer', label: 'Data Engineer', color: 'bg-cyan-500' },
  { value: 'ai_engineer', label: 'AI Engineer', color: 'bg-purple-500' },
];

export default function TopBar({ persona, onPersonaChange, alertCount = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const isAdminPersona = persona === 'administrator';

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Ask Nexus anything..."
            className="pl-10 bg-secondary/50 border-border/50 text-sm h-9"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Persona Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className={`gap-2 h-9 text-xs border-border/50 ${isAdminPersona ? 'border-amber-400/40 text-amber-300' : ''}`}>
              {isAdminPersona
                ? <Shield className="w-3.5 h-3.5 text-amber-400" />
                : <div className={`w-2 h-2 rounded-full ${PERSONAS.find(p => p.value === persona)?.color || 'bg-primary'}`} />
              }
              {isAdminPersona ? 'Administrator' : (PERSONAS.find(p => p.value === persona)?.label || 'Select Persona')}
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {PERSONAS.map((p) => (
              <DropdownMenuItem key={p.value} onClick={() => { onPersonaChange(p.value); navigate('/'); }}>
                <div className={`w-2 h-2 rounded-full ${p.color} mr-2`} />
                {p.label}
              </DropdownMenuItem>
            ))}
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => { onPersonaChange('administrator'); navigate('/admin'); }}
                  className="text-amber-400 font-medium"
                >
                  <Shield className="w-3.5 h-3.5 mr-2 text-amber-400" />
                  Administrator
                  <Badge className="ml-auto text-[9px] bg-amber-400/20 text-amber-300 border-amber-400/30">Admin</Badge>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </Button>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{user?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => base44.auth.logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}