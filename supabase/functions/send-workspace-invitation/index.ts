import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend@4.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  email: string;
  token: string;
  invitationType: 'member' | 'guest';
  workspaceName: string;
  inviterName: string;
  role?: string;
  projectId?: string;
  projectName?: string;
}

const getMemberInvitationHTML = (workspaceName: string, inviterName: string, role: string, acceptUrl: string) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; }
    h1 { color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 24px; }
    p { color: #374151; font-size: 14px; line-height: 24px; margin: 16px 0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 16px 0; }
    .footer { color: #6b7280; font-size: 12px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Workspace meghívó</h1>
    <p>Szia!</p>
    <p><strong>${inviterName}</strong> meghívott téged a <strong>${workspaceName}</strong> workspace-be <strong>${role}</strong> jogosultsággal.</p>
    <a href="${acceptUrl}" class="button">Meghívó elfogadása</a>
    <p>Ezzel teljes hozzáférést kapsz a workspace projektjeihez és együttműködhetsz a csapattal.</p>
    <p class="footer">A meghívó 7 napig érvényes. Ha nem te kérted ezt a meghívót, nyugodtan hagyd figyelmen kívül ezt az emailt.</p>
  </div>
</body>
</html>
`;
};

const getGuestInvitationHTML = (projectName: string, inviterName: string, guestUrl: string) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; }
    h1 { color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 24px; }
    p { color: #374151; font-size: 14px; line-height: 24px; margin: 16px 0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: #ffffff; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 16px 0; }
    .notice { padding: 12px; background-color: #fef3c7; border-radius: 4px; border-left: 4px solid #f59e0b; margin-top: 24px; }
    .footer { color: #6b7280; font-size: 12px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Projekt megosztás</h1>
    <p>Szia!</p>
    <p><strong>${inviterName}</strong> megosztott veled egy projektet (<strong>${projectName}</strong>) megtekintésre.</p>
    <a href="${guestUrl}" class="button">Projekt megtekintése</a>
    <p>Nem szükséges regisztráció, azonnal megtekintheted a projektet!</p>
    <div class="notice">
      <p style="margin: 0;"><strong>📌 Csak megtekintés:</strong> Ez a link csak olvasási jogot ad, szerkeszteni nem tudod a projektet.</p>
    </div>
    <p class="footer">Ez a link nem jár le, bármikor visszatérhetsz a projekt megtekintéséhez. Ha kérdésed van, lépj kapcsolatba ${inviterName} kollégával.</p>
  </div>
</body>
</html>
`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      token,
      invitationType,
      workspaceName,
      inviterName,
      role,
      projectId,
      projectName,
    }: InvitationRequest = await req.json();

    console.log('Sending invitation:', { email, invitationType, workspaceName });

    let html: string;
    let subject: string;

    if (invitationType === 'guest') {
      const baseUrl = req.headers.get('origin') || 'http://localhost:5173';
      const guestUrl = `${baseUrl}/canvas/${projectId}/guest?token=${token}`;
      
      html = getGuestInvitationHTML(projectName || 'Projekt', inviterName, guestUrl);
      subject = `Megosztottak veled egy projektet: ${projectName}`;
    } else {
      const baseUrl = req.headers.get('origin') || 'http://localhost:5173';
      const acceptUrl = `${baseUrl}/accept-invitation?token=${token}`;
      
      html = getMemberInvitationHTML(workspaceName, inviterName, role || 'viewer', acceptUrl);
      subject = `Meghívó a ${workspaceName} workspace-be`;
    }

    const { data, error } = await resend.emails.send({
      from: 'Workspace <onboarding@resend.dev>',
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-workspace-invitation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
