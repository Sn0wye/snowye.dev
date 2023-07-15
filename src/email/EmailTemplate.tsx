import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text
} from '@react-email/components';

interface EmailProps {
  name: string;
  message: string;
}

export function EmailTemplate({ name = 'Sujeito', message = '' }: EmailProps) {
  return (
    <Html>
      <Head title="teste" />
      <Preview>{name} - via snowye.dev</Preview>
      <Body
        style={{
          backgroundColor: '#fff',
          fontFamily: 'sans-serif'
        }}
      >
        <Container
          style={{
            border: '1px solid #eaeaea',
            padding: '20px',
            borderRadius: '6px',
            width: '560px',
            boxShadow:
              '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
          }}
        >
          <Heading
            style={{
              marginBottom: '32px',
              lineHeight: '20px',
              fontSize: '24px',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              paddingTop: '16px',
              color: '#18181b'
            }}
          >
            {name}
          </Heading>
          <Text
            style={{
              marginBottom: '14px',
              fontSize: '14px',
              lineHeight: '20px',
              color: '#52525b'
            }}
          >
            {message}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
