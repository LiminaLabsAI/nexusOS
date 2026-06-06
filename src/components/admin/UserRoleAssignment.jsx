import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Mail, Lock, Users, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ROLES, ROLE_ROUTES, ROUTE_LABELS } from '@/lib/permissions';
import { Loader2 } from 'lucide-react';

const ROLE_ICONS_MAP = { admin: '👑', data_engineer: '🗄️', ai_engineer: '🤖', analyst: '📊', operator: '⚙️', viewer: '👁️', user: '👤' };

export default function UserRoleAssignment({ users, currentUser, isLoading }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('Role updated'); },
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

  const filtered = users.filter(u => {
    const matchSearch = !search || (u.full_name || u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || (u.role || 'user') === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">User & Role Assignment</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Invite users, assign roles and manage team access</p>
        </div>
        <Dialog open={showInvite} onOpenChange={setShowInvite}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><UserPlus className="w-4 h-4" /> Invite User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-xs">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com" className="pl-10" type="email" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Assign Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLES).map(([r, cfg]) => (
                      <SelectItem key={r} value={r}>
                        <span className="flex items-center gap-2">
                          <span>{ROLE_ICONS_MAP[r] || '👤'}</span>
                          <span className="font-medium">{cfg.label}</span>
                          <span className="text-muted-foreground text-[11px]">— {cfg.description.split('.')[0]}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Permissions preview */}
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Modules accessible to <span className="text-foreground">{ROLES[inviteRole]?.label}</span>:
                </p>
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

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..." className="pl-10 h-9 text-sm" />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="All roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.entries(ROLES).map(([r, cfg]) => <SelectItem key={r} value={r}>{cfg.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Users list */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading users...</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filtered.map((u, i) => {
              const role = u.role || 'user';
              const cfg = ROLES[role] || ROLES.user;
              const isCurrentUser = u.id === currentUser?.id;
              return (
                <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="p-4 px-5 flex items-center gap-4 hover:bg-secondary/10 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-sm font-semibold text-muted-foreground">
                    {(u.full_name || u.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{u.full_name || 'No name set'}</p>
                      {isCurrentUser && <Badge variant="outline" className="text-[10px]">You</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    {u.created_date && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">Joined {format(new Date(u.created_date), 'MMM d, yyyy')}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="outline" className={cn("text-xs hidden sm:flex", cfg.color)}>{cfg.label}</Badge>
                    <span className="text-[10px] text-muted-foreground hidden md:block">{(ROLE_ROUTES[role] || []).length} modules</span>
                    {!isCurrentUser ? (
                      <Select value={role} onValueChange={newRole => updateMutation.mutate({ id: u.id, data: { role: newRole } })}>
                        <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLES).map(([r, c]) => (
                            <SelectItem key={r} value={r}>
                              <span className="flex items-center gap-1.5">{ROLE_ICONS_MAP[r]} {c.label}</span>
                            </SelectItem>
                          ))}
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
            {filtered.length === 0 && (
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