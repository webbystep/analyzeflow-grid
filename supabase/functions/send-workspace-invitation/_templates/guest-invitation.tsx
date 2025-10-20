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

interface GuestInvitationEmailProps {
  projectName: string;
  inviterName: string;
  guestUrl: string;
}

export const GuestInvitationEmail = ({
  projectName,
  inviterName,
  guestUrl,
}: GuestInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>Megosztottak veled egy projektet: {projectName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Projekt megosztás</Heading>
        <Text style={text}>
          Szia!
        </Text>
        <Text style={text}>
          <strong>{inviterName}</strong> megosztott veled egy projektet (<strong>{projectName}</strong>) megtekintésre.
        </Text>
        <Link
          href={guestUrl}
          target="_blank"
          style={{
            ...link,
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold',
            marginTop: '16px',
            marginBottom: '16px',
          }}
        >
          Projekt megtekintése
        </Link>
        <Text style={text}>
          Nem szükséges regisztráció, azonnal megtekintheted a projektet!
        </Text>
        <Text style={{
          ...text,
          padding: '12px',
          backgroundColor: '#fef3c7',
          borderRadius: '4px',
          borderLeft: '4px solid #f59e0b',
          marginTop: '24px',
        }}>
          📌 <strong>Csak megtekintés:</strong> Ez a link csak olvasási jogot ad, szerkeszteni nem tudod a projektet.
        </Text>
        <Text
          style={{
            ...text,
            color: '#6b7280',
            fontSize: '12px',
            marginTop: '24px',
          }}
        >
          Ez a link nem jár le, bármikor visszatérhetsz a projekt megtekintéséhez. Ha kérdésed van, lépj kapcsolatba {inviterName} kollégával.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default GuestInvitationEmail;

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
