import type { AppProps } from 'next/app';
import CommandBar from '../components/CommandBar';
import { Layout } from '../components/Layout';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CommandBar>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </CommandBar>
  );
}

export default MyApp;
