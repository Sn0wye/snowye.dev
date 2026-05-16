import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text
} from 'react-email';

interface EmailProps {
  name: string;
  message: string;
}

export default function EmailTemplate({
  name = 'Sujeito',
  message = 'Aute nisi qui elit esse ipsum eu et veniam aute fugiat sunt incididunt elit. Magna nulla ad non amet. Esse officia in adipisicing ipsum occaecat anim anim minim Lorem cupidatat eu aliquip cupidatat elit enim. Duis commodo aute officia qui. Labore consectetur et irure nisi cillum duis cillum ad ut non anim nulla. Et pariatur amet et dolore sit deserunt reprehenderit officia nisi fugiat labore nulla. Fugiat duis ad aliqua amet consequat mollit consectetur aliqua culpa do. Incididunt aliqua cupidatat cupidatat anim occaecat irure eu irure.'
}: EmailProps) {
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
