import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import {
  Shield, Users, UserPlus, Mail, Crown, User,
  Loader2, CheckCircle, Activity, Lock,
  Check, Minus, Eye, Zap, ArrowRight, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ROLES, ROLE_ROUTES, ROUTE_LABELS } from '@/lib/permissions';

const ROLE_ICONS = {
  admin:    Crown,
  analyst:  Activity,
  operator: Shield,
  viewer:   Eye,
  user:     User,
};

const ALL_ROUTES = ['/', '/intelligence', '/alerts', '/recommendations', '/scenarios', '/agents', '/data-sources', '/settings', '/admin'];

export default function AdminPortal() {
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role updated');
    },
  });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setShowInvite(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err) {
      toast.error(err.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  if (user && user.role !== 'admin') return <Navigate to="/" replace />;

  const roleCounts = Object.keys(ROLES).reduce((acc, r) => {
    acc[r] = users.filter(u => (u.role || 'user') === r).length;
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight">Admin Portal</h1>
            <p className="text-sm text-muted-foreground">User management and role-based access control</p>
          </div>
        </div>

        <Dialog open={showInvite} onOpenChange={setShowInvite}>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserPlus className="w-4 h-4" /> Invite User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-xs">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" className="pl-10" type="email" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLES).map(([r, cfg]) => {
                      const Icon = ROLE_ICONS[r] || User;
                      return (
                        <SelectItem key={r} value={r}>
                          <span className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5" />
                            <span className="font-medium">{cfg.label}</span>
                            <span className="text-muted-foreground text-[11px]">— {cfg.description.split('.')[0]}</span>
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              {/* Permissions preview */}
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">Modules accessible to <span className="capitalize text-foreground">{ROLES[inviteRole]?.label}</span>:</p>
                <div className="flex flex-wrap gap-1.5">
                  {(ROLE_ROUTES[inviteRole] || []).map(path => (
                    <Badge key={path} variant="outline" className="text-[10px]">
                      <Check className="w-2.5 h-2.5 mr-1 text-emerald-400" />
                      {ROUTE_LABELS[path]}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={handleInvite} disabled={!inviteEmail || inviting} className="w-full gap-2">
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {inviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* CortexOS Product */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-0.5">Powered by</p>
            <h2 className="text-lg font-bold text-white">CortexOS — Self-Serve Builder</h2>
            <p className="text-sm text-indigo-200 mt-0.5">Let enterprise teams spin up their own AI Operating System — no code required.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/cortex">
            <Button variant="outline" className="h-8 text-xs border-white/30 text-white bg-white/10 hover:bg-white/20 gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> View Landing
            </Button>
          </Link>
          <Link to="/cortex-builder">
            <Button className="h-8 text-xs bg-white text-indigo-700 hover:bg-indigo-50 gap-1.5">
              Open Builder <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(ROLES).map(([r, cfg], i) => {
          const Icon = ROLE_ICONS[r] || User;
          return (
            <motion.div key={r} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{cfg.label}</p>
              </div>
              <p className="text-2xl font-bold font-display text-foreground">{roleCounts[r] || 0}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <h3 className="font-semibold text-sm">Role Permissions Matrix</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Which modules each role can access</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left px-5 py-3 text-muted-foreground font-medium w-44">Module</th>
                {Object.entries(ROLES).map(([r, cfg]) => (
                  <th key={r} className="px-3 py-3 text-center">
                    <Badge variant="outline" className={cn("text-[10px] whitespace-nowrap", cfg.color)}>{cfg.label}</Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_ROUTES.map((path, i) => (
                <tr key={path} className={cn("border-b border-border/20 hover:bg-secondary/10 transition-colors", i % 2 === 0 && "bg-secondary/5")}>
                  <td className="px-5 py-2.5 text-foreground font-medium">{ROUTE_LABELS[path]}</td>
                  {Object.keys(ROLES).map(r => {
                    const allowed = (ROLE_ROUTES[r] || []).includes(path);
                    return (
                      <td key={r} className="px-3 py-2.5 text-center">
                        {allowed
                          ? <Check className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
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

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <div className="p-5 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Users className="w-4 h-4" /> Team Members
          </h3>
          <Badge variant="outline" className="text-xs">{users.length} total</Badge>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading users...</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {users.map((u, i) => {
              const role = u.role || 'user';
              const cfg = ROLES[role] || ROLES.user;
              const Icon = ROLE_ICONS[role] || User;
              const isCurrentUser = u.id === user?.id;

              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 px-5 flex items-center gap-4 hover:bg-secondary/20 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-muted-foreground">
                      {(u.full_name || u.email || '?')[0].toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{u.full_name || 'No name set'}</p>
                      {isCurrentUser && <Badge variant="outline" className="text-[10px]">You</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    {u.created_date && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Joined {format(new Date(u.created_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Current role badge */}
                    <Badge variant="outline" className={cn("text-xs gap-1.5 hidden sm:flex", cfg.color)}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </Badge>

                    {/* Accessible modules count */}
                    <span className="text-[10px] text-muted-foreground hidden md:block">
                      {(ROLE_ROUTES[role] || []).length} modules
                    </span>

                    {!isCurrentUser ? (
                      <Select
                        value={role}
                        onValueChange={(newRole) => updateUserMutation.mutate({ id: u.id, data: { role: newRole } })}
                      >
                        <SelectTrigger className="h-7 text-xs w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLES).map(([r, c]) => {
                            const RI = ROLE_ICONS[r] || User;
                            return (
                              <SelectItem key={r} value={r}>
                                <span className="flex items-center gap-1.5">
                                  <RI className="w-3 h-3" /> {c.label}
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Lock className="w-3 h-3" /> Own role
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            {users.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}