import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Minus, Shield, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLES, ROLE_ROUTES, ROUTE_LABELS } from '@/lib/permissions';
import { toast } from 'sonner';

const ALL_ROUTES = ['/', '/intelligence', '/alerts', '/recommendations', '/scenarios', '/agents', '/data-sources', '/settings', '/admin'];
const DOMAIN_OPTIONS = ['manufacturing', 'logistics', 'retail', 'finance', 'hr', 'operations'];

// Simulated per-role domain access (in a real system this would be persisted)
const DEFAULT_DOMAIN_ACCESS = {
  admin: ['manufacturing', 'logistics', 'retail', 'finance', 'hr', 'operations'],
  data_engineer: ['manufacturing', 'logistics', 'retail', 'finance', 'hr', 'operations'],
  ai_engineer: ['manufacturing', 'logistics', 'retail', 'finance', 'hr', 'operations'],
  analyst: ['manufacturing', 'logistics', 'retail', 'finance', 'hr', 'operations'],
  operator: ['manufacturing', 'logistics', 'operations'],
  viewer: ['manufacturing', 'logistics'],
  user: ['manufacturing', 'logistics', 'retail', 'finance', 'operations'],
};

export default function AccessPrivileges() {
  const [selectedRole, setSelectedRole] = useState('user');
  const [routeOverrides, setRouteOverrides] = useState({}); // { roleName: [routes] }
  const [domainAccess, setDomainAccess] = useState(DEFAULT_DOMAIN_ACCESS);

  const getRoutes = (role) => routeOverrides[role] || ROLE_ROUTES[role] || [];
  const getDomains = (role) => domainAccess[role] || [];

  const toggleRoute = (role, route) => {
    const current = getRoutes(role);
    const next = current.includes(route) ? current.filter(r => r !== route) : [...current, route];
    setRouteOverrides(prev => ({ ...prev, [role]: next }));
  };

  const toggleDomain = (role, domain) => {
    const current = getDomains(role);
    const next = current.includes(domain) ? current.filter(d => d !== domain) : [...current, domain];
    setDomainAccess(prev => ({ ...prev, [role]: next }));
  };

  const grantAll = (role) => {
    setRouteOverrides(prev => ({ ...prev, [role]: [...ALL_ROUTES] }));
    toast.success(`Full access granted to ${ROLES[role]?.label}`);
  };

  const revokeAll = (role) => {
    setRouteOverrides(prev => ({ ...prev, [role]: [] }));
    toast.success(`All access revoked for ${ROLES[role]?.label}`);
  };

  const saveChanges = () => {
    toast.success('Access privileges saved');
  };

  const cfg = ROLES[selectedRole];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Access & Privileges</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Configure module access and domain visibility per role</p>
        </div>
        <Button size="sm" onClick={saveChanges} className="gap-2"><Shield className="w-4 h-4" /> Save Changes</Button>
      </div>

      {/* Role selector */}
      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground">Configuring privileges for:</p>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-44 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLES).map(([r, c]) => (
              <SelectItem key={r} value={r}>
                <span className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full inline-block", c.color.split(' ')[0])} />
                  {c.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {cfg && <Badge variant="outline" className={cn("text-xs", cfg.color)}>{cfg.label}</Badge>}
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => grantAll(selectedRole)}>
            <Unlock className="w-3 h-3" /> Grant All
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive border-destructive/30" onClick={() => revokeAll(selectedRole)}>
            <Lock className="w-3 h-3" /> Revoke All
          </Button>
        </div>
      </div>

      {/* Module access grid */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/30 flex items-center justify-between">
          <p className="text-sm font-medium">Module Access</p>
          <Badge variant="outline" className="text-[10px]">
            {getRoutes(selectedRole).length} / {ALL_ROUTES.length} modules enabled
          </Badge>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
          {ALL_ROUTES.map(route => {
            const allowed = getRoutes(selectedRole).includes(route);
            return (
              <button key={route} onClick={() => toggleRoute(selectedRole, route)}
                className={cn("flex items-center gap-3 p-3 rounded-xl border text-sm transition-all",
                  allowed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-foreground'
                    : 'border-border/40 text-muted-foreground hover:border-border hover:bg-secondary/20')}>
                {allowed
                  ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  : <Minus className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />}
                <span className="text-xs">{ROUTE_LABELS[route]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Domain access */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/30 flex items-center justify-between">
          <p className="text-sm font-medium">Domain Data Access</p>
          <Badge variant="outline" className="text-[10px]">
            {getDomains(selectedRole).length} / {DOMAIN_OPTIONS.length} domains visible
          </Badge>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {DOMAIN_OPTIONS.map(domain => {
            const allowed = getDomains(selectedRole).includes(domain);
            return (
              <button key={domain} onClick={() => toggleDomain(selectedRole, domain)}
                className={cn("flex items-center gap-2 px-4 py-2 rounded-full border text-xs capitalize transition-all",
                  allowed
                    ? 'bg-primary/10 border-primary/40 text-foreground'
                    : 'border-border/40 text-muted-foreground hover:border-border')}>
                {allowed ? <Check className="w-3 h-3 text-primary" /> : <Minus className="w-3 h-3 text-muted-foreground/40" />}
                {domain}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cross-role matrix */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/30">
          <p className="text-sm font-medium">Full Permissions Matrix</p>
          <p className="text-xs text-muted-foreground mt-0.5">Overview of all role access across all modules</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left px-5 py-3 text-muted-foreground font-medium w-44">Module</th>
                {Object.entries(ROLES).map(([r, c]) => (
                  <th key={r} className="px-3 py-3 text-center">
                    <Badge variant="outline" className={cn("text-[10px] whitespace-nowrap", c.color, selectedRole === r && 'ring-1 ring-primary')}>{c.label}</Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_ROUTES.map((path, i) => (
                <tr key={path} className={cn("border-b border-border/20 hover:bg-secondary/10 transition-colors", i % 2 === 0 && "bg-secondary/5")}>
                  <td className="px-5 py-2.5 font-medium">{ROUTE_LABELS[path]}</td>
                  {Object.keys(ROLES).map(r => {
                    const allowed = getRoutes(r).includes(path);
                    return (
                      <td key={r} className="px-3 py-2.5 text-center">
                        {allowed
                          ? <Check className={cn("w-3.5 h-3.5 mx-auto", selectedRole === r ? 'text-primary' : 'text-emerald-400')} />
                          : <Minus className="w-3.5 h-3.5 text-muted-foreground/30 mx-auto" />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}