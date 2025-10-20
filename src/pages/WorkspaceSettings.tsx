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
import { Loader2, ArrowLeft, UserPlus, Trash2, Mail, Shield } from 'lucide-react';
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
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (workspaceId && user) {
      loadWorkspace();
      loadMembers();
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

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;

    // Find user by email
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', inviteEmail)
      .single();

    if (profileError || !profileData) {
      toast({
        variant: 'destructive',
        title: 'User not found',
        description: 'No user with this email address exists. They need to sign up first.',
      });
      return;
    }

    // Check if already a member
    const existingMember = members.find(m => m.user_id === profileData.id);
    if (existingMember) {
      toast({
        variant: 'destructive',
        title: 'Already a member',
        description: 'This user is already a member of this workspace.',
      });
      return;
    }

    // Add member
    const { error } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspaceId,
        user_id: profileData.id,
        role: inviteRole,
      });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error adding member',
        description: error.message,
      });
    } else {
      toast({
        title: 'Member added',
        description: `${inviteEmail} has been added to the workspace.`,
      });
      await loadMembers();
      setInviteEmail('');
      setInviteRole('viewer');
      setInviteOpen(false);
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
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                          Add a new member to this workspace. They must have an existing account.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="user@example.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                            <SelectTrigger id="role">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer - Can view projects</SelectItem>
                              <SelectItem value="editor">Editor - Can edit projects</SelectItem>
                              <SelectItem value="admin">Admin - Can manage members</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Send Invitation</Button>
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
