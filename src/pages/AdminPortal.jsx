import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, LayoutGrid, Lock, Building2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ROLES } from '@/lib/permissions';

import RoleManager from '@/components/admin/RoleManager';
import AccessPrivileges from '@/components/admin/AccessPrivileges';
import UserRoleAssignment from '@/components/admin/UserRoleAssignment';
import WorkspaceManager from '@/components/admin/WorkspaceManager';

const TABS = [
  { id: 'overview',    label: 'Overview',          icon: LayoutGrid },
  { id: 'roles',       label: 'Role Management',   icon: Shield },
  { id: 'access',      label: 'Access & Privileges', icon: Lock },
  { id: 'users',       label: 'Users & Assignment', icon: Users },
  { id: 'workspaces',  label: 'Workspaces',         icon: Building2 },
];

export default function AdminPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  if (user && user.role !== 'admin') return <Navigate to="/" replace />;

  const roleCounts = Object.keys(ROLES).reduce((acc, r) => {
    acc[r] = users.filter(u => (u.role || 'user') === r).length;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Administrator Portal</h1>
          <p className="text-sm text-muted-foreground">Full lifecycle management — roles, access, users, and workspaces</p>
        </div>
        <Badge className="ml-auto bg-amber-400/20 text-amber-300 border-amber-400/30 text-xs">Admin Access</Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/40 p-1 rounded-xl overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn('flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm font-medium'
                  : 'text-muted-foreground hover:text-foreground')}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Role distribution */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Users', value: users.length, icon: Users, color: 'text-primary' },
              { label: 'Roles Defined', value: Object.keys(ROLES).length, icon: Shield, color: 'text-amber-400' },
              { label: 'Admin Users', value: roleCounts.admin || 0, icon: Lock, color: 'text-red-400' },
              { label: 'Active Roles Used', value: Object.values(roleCounts).filter(c => c > 0).length, icon: Activity, color: 'text-emerald-400' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-card rounded-xl border border-border/50 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={cn("w-4 h-4", stat.color)} />
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                  <p className="text-3xl font-bold font-display">{stat.value}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Role breakdown */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <div className="p-5 border-b border-border/50">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Users className="w-4 h-4" /> User Distribution by Role</h3>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(ROLES).map(([r, cfg], i) => (
                <motion.div key={r} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-[10px]", cfg.color)}>{cfg.label}</Badge>
                  </div>
                  <span className="text-sm font-bold">{roleCounts[r] || 0}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick nav cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'roles', title: 'Manage Roles', desc: 'Create custom roles with specific permissions', icon: Shield, color: 'bg-amber-500/10 text-amber-400' },
              { id: 'access', title: 'Set Privileges', desc: 'Configure module & domain access per role', icon: Lock, color: 'bg-blue-500/10 text-blue-400' },
              { id: 'users', title: 'Invite & Assign', desc: 'Invite users and assign roles', icon: Users, color: 'bg-emerald-500/10 text-emerald-400' },
              { id: 'workspaces', title: 'Workspaces', desc: 'Manage team workspaces and membership', icon: Building2, color: 'bg-purple-500/10 text-purple-400' },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <button key={card.id} onClick={() => setActiveTab(card.id)}
                  className="text-left p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:bg-secondary/20 transition-all group">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", card.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-medium">{card.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'roles' && <RoleManager builtinRoles={ROLES} />}
      {activeTab === 'access' && <AccessPrivileges />}
      {activeTab === 'users' && <UserRoleAssignment users={users} currentUser={user} isLoading={isLoading} />}
      {activeTab === 'workspaces' && <WorkspaceManager />}
    </div>
  );
}