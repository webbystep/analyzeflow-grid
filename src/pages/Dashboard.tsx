import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Workflow, LogOut, FolderKanban, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Workspace {
  id: string;
  name: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadWorkspaces();
    }
  }, [user]);

  useEffect(() => {
    if (selectedWorkspace) {
      loadProjects();
    }
  }, [selectedWorkspace]);

  const loadWorkspaces = async () => {
    // First, ensure user profile exists
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.log('Profile not found, creating...');
        // Profile might not exist yet, wait a moment and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error loading workspaces',
        description: error.message,
      });
    } else {
      setWorkspaces(data || []);
      if (data && data.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(data[0].id);
      }
    }
    setLoading(false);
  };

  const loadProjects = async () => {
    if (!selectedWorkspace) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', selectedWorkspace)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error loading projects',
        description: error.message,
      });
    } else {
      setProjects(data || []);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Get current session to ensure auth.uid() is available
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'Please sign in again to create a workspace.',
      });
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('workspaces')
      .insert({ name: workspaceName, owner_id: session.user.id })
      .select()
      .single();

    if (error) {
      console.error('Workspace creation error:', error);
      toast({
        variant: 'destructive',
        title: 'Error creating workspace',
        description: error.message,
      });
    } else {
      toast({
        title: 'Workspace created',
        description: `${workspaceName} has been created successfully.`,
      });
      setWorkspaces([data, ...workspaces]);
      setSelectedWorkspace(data.id);
      setWorkspaceName('');
      setCreateWorkspaceOpen(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspace) return;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        workspace_id: selectedWorkspace,
        name: projectName,
        description: projectDescription || null,
      })
      .select()
      .single();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error creating project',
        description: error.message,
      });
    } else {
      toast({
        title: 'Project created',
        description: `${projectName} has been created successfully.`,
      });
      setProjects([data, ...projects]);
      setProjectName('');
      setProjectDescription('');
      setCreateProjectOpen(false);
      navigate(`/canvas/${data.id}`);
    }
  };

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
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Workflow className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">FlowVision Pro</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Projects</h2>
            <p className="text-muted-foreground">Create and manage your funnel projects</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={createWorkspaceOpen} onOpenChange={setCreateWorkspaceOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  New Workspace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateWorkspace}>
                  <DialogHeader>
                    <DialogTitle>Create Workspace</DialogTitle>
                    <DialogDescription>
                      Workspaces help you organize projects by team or client.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                      id="workspace-name"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="My Team"
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Workspace</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
              <DialogTrigger asChild>
                <Button disabled={!selectedWorkspace}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateProject}>
                  <DialogHeader>
                    <DialogTitle>Create Project</DialogTitle>
                    <DialogDescription>
                      Start building your funnel visualization and analytics.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input
                        id="project-name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="My Funnel"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="project-description">Description (optional)</Label>
                      <Input
                        id="project-description"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        placeholder="Brief description of this project"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Project</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {workspaces.length > 0 && (
          <div className="mb-6">
            <Label className="mb-2 block">Workspace</Label>
            <div className="flex gap-2 flex-wrap">
              {workspaces.map((workspace) => (
                <Button
                  key={workspace.id}
                  variant={selectedWorkspace === workspace.id ? 'default' : 'outline'}
                  onClick={() => setSelectedWorkspace(workspace.id)}
                >
                  <FolderKanban className="mr-2 h-4 w-4" />
                  {workspace.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <Card className="p-12 text-center">
            <CardHeader>
              <CardTitle>No projects yet</CardTitle>
              <CardDescription>
                Create your first project to start building funnels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setCreateProjectOpen(true)} disabled={!selectedWorkspace}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/canvas/${project.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{project.name}</span>
                    <Workflow className="h-5 w-5 text-primary flex-shrink-0" />
                  </CardTitle>
                  {project.description && (
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Updated {format(new Date(project.updated_at), 'MMM d, yyyy')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
