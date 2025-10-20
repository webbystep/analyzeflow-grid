import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, ArrowLeft, UserPlus, Trash2, Mail, Shield, Copy, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WorkspaceMember {
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  created_at: string;
  profiles: {
    name: string | null;
    email: string | null;
  };
}

interface Workspace {
  id: string;
  name: string;
  owner_id: string;
}

export default function WorkspaceSettings() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [inviteType, setInviteType] = useState<'member' | 'guest'>('member');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (workspaceId && user) {
      loadWorkspace();
      loadMembers();
      loadProjects();
    }
  }, [workspaceId, user]);

  const loadWorkspace = async () => {
    if (!workspaceId) return;

    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error loading workspace',
        description: error.message,
      });
      navigate('/dashboard');
      return;
    }

    setWorkspace(data);
    setLoading(false);
  };

  const loadMembers = async () => {
    if (!workspaceId) return;

    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        user_id,
        role,
        created_at,
        profiles (
          name,
          email
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error loading members',
        description: error.message,
      });
    } else {
      setMembers(data as any || []);
    }
  };

  const loadProjects = async () => {
    if (!workspaceId) return;

    const { data, error } = await supabase
      .from('projects')
      .select('id, name')
      .eq('workspace_id', workspaceId)
      .eq('is_archived', false);

    if (!error && data) {
      setProjects(data);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !user) return;

    // Validate guest invitation requires project
    if (inviteType === 'guest' && !selectedProjectId) {
      toast({
        variant: 'destructive',
        title: 'Projekt szükséges',
        description: 'Külsős tag meghívásához válassz egy projektet!',
      });
      return;
    }

    const token = crypto.randomUUID();

    try {
      if (inviteType === 'guest') {
        // Create guest access
        const { error: guestError } = await supabase
          .from('guest_access')
          .insert({
            workspace_id: workspaceId,
            project_id: selectedProjectId,
            email: inviteEmail,
            token: token,
            created_by: user.id,
          });

        if (guestError) throw guestError;

        // Send email via edge function
        const selectedProject = projects.find(p => p.id === selectedProjectId);
        await supabase.functions.invoke('send-workspace-invitation', {
          body: {
            email: inviteEmail,
            token: token,
            invitationType: 'guest',
            workspaceName: workspace?.name,
            inviterName: user.user_metadata?.name || user.email,
            projectId: selectedProjectId,
            projectName: selectedProject?.name,
          },
        });

        toast({
          title: 'Guest meghívó elküldve!',
          description: 'A külsős tag emailben megkapja a projekt megtekintési linket.',
        });
      } else {
        // Create workspace invitation
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

        // Send email via edge function
        await supabase.functions.invoke('send-workspace-invitation', {
          body: {
            email: inviteEmail,
            token: token,
            invitationType: 'member',
            workspaceName: workspace?.name,
            inviterName: user.user_metadata?.name || user.email,
            role: inviteRole,
          },
        });

        toast({
          title: 'Meghívó elküldve!',
          description: 'Az új tag emailben megkapja a meghívót.',
        });
      }

      setInviteEmail('');
      setInviteRole('viewer');
      setInviteType('member');
      setSelectedProjectId('');
      setInviteOpen(false);
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          variant: 'destructive',
          title: 'Már létezik',
          description: 'Ez az email már hozzáférést kapott ehhez a projekthez vagy workspace-hez.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Hiba',
          description: error.message,
        });
      }
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'viewer' | 'editor' | 'admin' | 'owner') => {
    if (!workspaceId) return;

    const { error } = await supabase
      .from('workspace_members')
      .update({ role: newRole })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error updating role',
        description: error.message,
      });
    } else {
      toast({
        title: 'Role updated',
        description: 'Member role has been updated successfully.',
      });
      await loadMembers();
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!workspaceId) return;

    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error removing member',
        description: error.message,
      });
    } else {
      toast({
        title: 'Member removed',
        description: 'Member has been removed from the workspace.',
      });
      await loadMembers();
    }
  };

  const isOwner = workspace?.owner_id === user?.id;
  const userRole = members.find(m => m.user_id === user?.id)?.role;
  const canManageMembers = userRole === 'owner' || userRole === 'admin';

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-lg font-semibold">{workspace?.name} Settings</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Workspace Settings</h2>
          <p className="text-muted-foreground">Manage members and permissions for this workspace</p>
        </div>

        {!canManageMembers && (
          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You have {userRole} access. Only admins and owners can manage workspace members.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  {members.length} {members.length === 1 ? 'member' : 'members'} in this workspace
                </CardDescription>
              </div>
              {canManageMembers && (
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleInviteMember}>
                      <DialogHeader>
                        <DialogTitle>Tag meghívása</DialogTitle>
                        <DialogDescription>
                          Válaszd ki hogy belsős vagy külsős tagot szeretnél meghívni.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="inviteType">Meghívó típusa</Label>
                          <Select value={inviteType} onValueChange={(value: any) => setInviteType(value)}>
                            <SelectTrigger id="inviteType">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Belsős tag (teljes hozzáférés)</SelectItem>
                              <SelectItem value="guest">Külsős tag (csak megtekintés)</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            {inviteType === 'member' 
                              ? 'Belsős tag teljes workspace hozzáférést kap, szerkeszthet projekteket.'
                              : 'Külsős tag csak egy adott projektet tud megtekinteni, szerkeszteni nem.'}
                          </p>
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

                        {inviteType === 'member' ? (
                          <div>
                            <Label htmlFor="role">Szerepkör</Label>
                            <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                              <SelectTrigger id="role">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">Megtekintő - Projekteket láthat</SelectItem>
                                <SelectItem value="editor">Szerkesztő - Projekteket szerkeszthet</SelectItem>
                                <SelectItem value="admin">Admin - Tagokat kezelhet</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div>
                            <Label htmlFor="project">Megosztott projekt</Label>
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId} required>
                              <SelectTrigger id="project">
                                <SelectValue placeholder="Válassz projektet..." />
                              </SelectTrigger>
                              <SelectContent>
                                {projects.map((project) => (
                                  <SelectItem key={project.id} value={project.id}>
                                    {project.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              A külsős tag csak ezt a projektet fogja látni, read-only módban.
                            </p>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button type="submit">
                          <Mail className="mr-2 h-4 w-4" />
                          Meghívó küldése emailben
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.profiles?.name || member.profiles?.email || 'Unknown User'}
                        {member.user_id === user?.id && ' (You)'}
                      </p>
                      <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canManageMembers && member.role !== 'owner' ? (
                      <Select
                        value={member.role}
                        onValueChange={(value: 'viewer' | 'editor' | 'admin') => handleUpdateRole(member.user_id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="px-3 py-2 bg-muted rounded-md text-sm font-medium capitalize">
                        {member.role}
                      </div>
                    )}
                    {canManageMembers && member.role !== 'owner' && member.user_id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.user_id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Understanding workspace roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="font-medium w-20">Owner:</div>
                <div className="text-muted-foreground">Full access, can delete workspace</div>
              </div>
              <div className="flex gap-3">
                <div className="font-medium w-20">Admin:</div>
                <div className="text-muted-foreground">Can manage members and all projects</div>
              </div>
              <div className="flex gap-3">
                <div className="font-medium w-20">Editor:</div>
                <div className="text-muted-foreground">Can create and edit projects</div>
              </div>
              <div className="flex gap-3">
                <div className="font-medium w-20">Viewer:</div>
                <div className="text-muted-foreground">Can only view projects</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
