import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Hiányzó meghívó kód');
      setLoading(false);
      return;
    }

    if (!authLoading) {
      if (!user) {
        // Redirect to auth with return URL
        navigate(`/auth?redirect=/accept-invitation?token=${token}`);
      } else {
        loadInvitation();
      }
    }
  }, [token, user, authLoading]);

  const loadInvitation = async () => {
    if (!token) return;

    const { data, error: inviteError } = await supabase
      .from('workspace_invitations')
      .select(`
        *,
        workspaces (
          id,
          name
        )
      `)
      .eq('token', token)
      .maybeSingle();

    if (inviteError || !data) {
      setError('Érvénytelen vagy lejárt meghívó');
      setLoading(false);
      return;
    }

    // Check if already accepted
    if (data.accepted_at) {
      setError('Ez a meghívó már felhasználásra került');
      setLoading(false);
      return;
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      setError('Ez a meghívó lejárt');
      setLoading(false);
      return;
    }

    setInvitation(data);
    setLoading(false);
  };

  const handleAccept = async () => {
    if (!token) return;

    setLoading(true);

    const { data, error } = await supabase
      .rpc('accept_workspace_invitation', { _token: token });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Hiba történt',
        description: error.message,
      });
      setLoading(false);
      return;
    }

    setAccepted(true);
    toast({
      title: 'Meghívó elfogadva',
      description: `Sikeresen csatlakoztál a(z) ${invitation.workspaces.name} workspace-hez!`,
    });

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {error ? (
            <>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Meghívó Hiba</CardTitle>
              <CardDescription>{error}</CardDescription>
            </>
          ) : accepted ? (
            <>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <CardTitle>Sikeresen Csatlakoztál!</CardTitle>
              <CardDescription>
                Átirányítunk a dashboard-ra...
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Workspace Meghívó</CardTitle>
              <CardDescription>
                Meghívtak a(z) <strong>{invitation?.workspaces?.name}</strong> workspace-be
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {!error && !accepted && invitation && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Workspace:</span>
                  <span className="font-medium">{invitation.workspaces.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Szerepkör:</span>
                  <span className="font-medium capitalize">{invitation.role}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{invitation.email}</span>
                </div>
              </div>
              <Button onClick={handleAccept} className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Meghívó Elfogadása
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Mégse
              </Button>
            </div>
          )}
          {error && (
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Vissza a Dashboard-ra
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
