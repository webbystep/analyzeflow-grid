import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Workflow } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Érvénytelen meghívó link');
      setLoading(false);
      return;
    }

    loadInvitation();
  }, [token]);

  useEffect(() => {
    if (user && invitation && !accepted) {
      acceptInvitation();
    }
  }, [user, invitation]);

  const loadInvitation = async () => {
    if (!token) return;

    const { data, error } = await supabase
      .from('workspace_invitations')
      .select(`
        *,
        workspaces (
          id,
          name
        )
      `)
      .eq('token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      setError('A meghívó érvénytelen vagy lejárt');
      setLoading(false);
      return;
    }

    setInvitation(data);
    setLoading(false);
  };

  const acceptInvitation = async () => {
    if (!token || !user) return;
    
    setLoading(true);

    try {
      const { error } = await supabase.rpc('accept_workspace_invitation', {
        _token: token,
      });

      if (error) throw error;

      setAccepted(true);
      toast({
        title: 'Sikeres csatlakozás!',
        description: `Csatlakoztál a(z) ${invitation.workspaces.name} workspace-hez.`,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      setError(err.message || 'Hiba történt a meghívó elfogadása során');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Betöltés...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle>Érvénytelen meghívó</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/auth')}>
              Bejelentkezés
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </div>
            <CardTitle>Sikeres csatlakozás!</CardTitle>
            <CardDescription>
              Csatlakoztál a(z) {invitation?.workspaces?.name} workspace-hez.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <p className="text-sm text-muted-foreground">Átirányítás a dashboard-ra...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Workflow className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle>Workspace meghívó</CardTitle>
            <CardDescription>
              Meghívtak a(z) <strong>{invitation?.workspaces?.name}</strong> workspace-be
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-center text-muted-foreground mb-1">
                Meghívó küldve:
              </p>
              <p className="text-center font-medium">{invitation?.email}</p>
              <p className="text-sm text-center text-muted-foreground mt-3 mb-1">
                Szerepkör:
              </p>
              <p className="text-center font-medium capitalize">{invitation?.role}</p>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              A meghívó elfogadásához először jelentkezz be vagy regisztrálj.
            </p>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => navigate(`/auth?redirect=/accept-invitation?token=${token}`)}
              >
                Bejelentkezés
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate(`/auth?signup=true&redirect=/accept-invitation?token=${token}`)}
              >
                Regisztráció
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
