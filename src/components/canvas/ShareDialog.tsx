import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mail, Link2, Copy, Trash2, Users, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectId: string;
  projectName: string;
}

interface Collaborator {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  role: 'owner' | 'admin' | 'editor' | 'viewer' | 'guest';
  type: 'member' | 'guest';
}

const getAvatarColor = (email: string) => {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
  const hash = email.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string | null, email: string) => {
  if (name && name.trim()) {
    return name.split(' ').map((word) => word[0]).join('').toUpperCase().slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
};

export const ShareDialog = ({ open, onOpenChange, workspaceId, projectId, projectName }: ShareDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [inviteType, setInviteType] = useState<'member' | 'guest'>('guest');
  const [guestLink, setGuestLink] = useState<string>('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadCollaborators();
      generateGuestLink();
    }
  }, [open, workspaceId, projectId]);

  const loadCollaborators = async () => {
    const { data: members } = await supabase
      .from('workspace_members')
      .select('user_id, role, profiles(id, name, email, avatar_url)')
      .eq('workspace_id', workspaceId);

    const { data: guests } = await supabase
      .from('guest_access')
      .select('id, email, created_at')
      .eq('project_id', projectId);

    const allCollaborators: Collaborator[] = [];

    if (members) {
      members.forEach((member: any) => {
        if (member.profiles) {
          allCollaborators.push({
            id: member.profiles.id,
            name: member.profiles.name,
            email: member.profiles.email,
            avatar_url: member.profiles.avatar_url,
            role: member.role,
            type: 'member',
          });
        }
      });
    }

    if (guests) {
      guests.forEach((guest: any) => {
        allCollaborators.push({
          id: guest.id,
          name: null,
          email: guest.email,
          avatar_url: null,
          role: 'guest',
          type: 'guest',
        });
      });
    }

    setCollaborators(allCollaborators);
  };

  const generateGuestLink = async () => {
    const { data } = await supabase
      .from('guest_access')
      .select('token')
      .eq('project_id', projectId)
      .limit(1)
      .maybeSingle();

    let token = data?.token;
    if (!token) {
      token = crypto.randomUUID();
    }

    const link = `${window.location.origin}/canvas/${projectId}/guest?token=${token}`;
    setGuestLink(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(guestLink);
    toast({
      title: 'Link másolva!',
      description: 'A megosztási link a vágólapra került.',
    });
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const token = crypto.randomUUID();

      if (inviteType === 'guest') {
        const { error: guestError } = await supabase
          .from('guest_access')
          .insert({
            workspace_id: workspaceId,
            project_id: projectId,
            email: inviteEmail,
            token: token,
            created_by: user.id,
          });

        if (guestError) throw guestError;

        await supabase.functions.invoke('send-workspace-invitation', {
          body: {
            email: inviteEmail,
            token: token,
            invitationType: 'guest',
            workspaceName: '',
            inviterName: user.user_metadata?.name || user.email,
            projectId: projectId,
            projectName: projectName,
          },
        });

        toast({
          title: 'Külsős meghívva!',
          description: 'A külsős tag emailben megkapja a megtekintési linket.',
        });
      } else {
        const { error: inviteError } = await supabase
          .from('workspace_invitations')
          .insert({
            workspace_id: workspaceId,
            email: inviteEmail,
            role: inviteRole,
            token: token,
            invited_by: user.id,
            invitation_type: 'member',
          });

        if (inviteError) throw inviteError;

        await supabase.functions.invoke('send-workspace-invitation', {
          body: {
            email: inviteEmail,
            token: token,
            invitationType: 'member',
            workspaceName: '',
            inviterName: user.user_metadata?.name || user.email,
            role: inviteRole,
          },
        });

        toast({
          title: 'Tag meghívva!',
          description: 'Az új tag emailben megkapja a meghívót.',
        });
      }

      setInviteEmail('');
      setInviteRole('viewer');
      await loadCollaborators();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Hiba',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (collaboratorId: string, type: 'member' | 'guest') => {
    try {
      if (type === 'guest') {
        await supabase.from('guest_access').delete().eq('id', collaboratorId);
      } else {
        await supabase.from('workspace_members').delete().eq('user_id', collaboratorId).eq('workspace_id', workspaceId);
      }

      toast({
        title: 'Hozzáférés visszavonva',
        description: 'A tag már nem fér hozzá ehhez a projekthez.',
      });

      await loadCollaborators();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Hiba',
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Projekt megosztása</DialogTitle>
          <DialogDescription>
            Oszd meg ezt a projektet tagokkal vagy generálj megosztási linket.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">
              <Link2 className="h-4 w-4 mr-2" />
              Link megosztás
            </TabsTrigger>
            <TabsTrigger value="invite">
              <Mail className="h-4 w-4 mr-2" />
              Email meghívó
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label>Megosztási link (csak megtekintés)</Label>
              <div className="flex gap-2">
                <Input value={guestLink} readOnly className="font-mono text-sm" />
                <Button onClick={handleCopyLink} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Bárki aki megkapja ezt a linket, megtekintheti a projektet (szerkesztés nélkül).
              </p>
            </div>
          </TabsContent>

          <TabsContent value="invite" className="space-y-4">
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <Label htmlFor="inviteType">Meghívó típusa</Label>
                <Select value={inviteType} onValueChange={(value: any) => setInviteType(value)}>
                  <SelectTrigger id="inviteType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest">Külsős (csak megtekintés)</SelectItem>
                    <SelectItem value="member">Belsős tag (workspace hozzáférés)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="email">Email cím</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="pelda@email.com"
                  required
                />
              </div>

              {inviteType === 'member' && (
                <div>
                  <Label htmlFor="role">Szerepkör</Label>
                  <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Megtekintő</SelectItem>
                      <SelectItem value="editor">Szerkesztő</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                <Mail className="h-4 w-4 mr-2" />
                Meghívó küldése
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <h4 className="font-semibold">Hozzáféréssel rendelkezők ({collaborators.length})</h4>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={collaborator.avatar_url || undefined} />
                    <AvatarFallback className={getAvatarColor(collaborator.email)}>
                      <span className="text-xs font-semibold text-white">
                        {getInitials(collaborator.name, collaborator.email)}
                      </span>
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{collaborator.name || collaborator.email}</p>
                    <p className="text-xs text-muted-foreground">{collaborator.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={collaborator.type === 'guest' ? 'secondary' : 'default'}>
                    {collaborator.type === 'guest' ? 'Külsős' : collaborator.role}
                  </Badge>
                  {collaborator.type === 'guest' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRevokeAccess(collaborator.id, collaborator.type)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
