import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface MemberInvitationEmailProps {
  workspaceName: string;
  inviterName: string;
  role: string;
  acceptUrl: string;
}

export const MemberInvitationEmail = ({
  workspaceName,
  inviterName,
  role,
  acceptUrl,
}: MemberInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>Meghívó a {workspaceName} workspace-be</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Workspace meghívó</Heading>
        <Text style={text}>
          Szia!
        </Text>
        <Text style={text}>
          <strong>{inviterName}</strong> meghívott téged a <strong>{workspaceName}</strong> workspace-be <strong>{role}</strong> jogosultsággal.
        </Text>
        <Link
          href={acceptUrl}
          target="_blank"
          style={{
            ...link,
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold',
            marginTop: '16px',
            marginBottom: '16px',
          }}
        >
          Meghívó elfogadása
        </Link>
        <Text style={text}>
          Ezzel teljes hozzáférést kapsz a workspace projektjeihez és együttműködhetsz a csapattal.
        </Text>
        <Text
          style={{
            ...text,
            color: '#6b7280',
            fontSize: '12px',
            marginTop: '24px',
          }}
        >
          A meghívó 7 napig érvényes. Ha nem te kérted ezt a meghívót, nyugodtan hagyd figyelmen kívül ezt az emailt.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default MemberInvitationEmail;

const main = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const h1 = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  padding: '0',
};

const text = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};

const link = {
  color: '#2563eb',
  fontSize: '14px',
  textDecoration: 'underline',
};
