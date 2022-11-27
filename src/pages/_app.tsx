import type { AppProps } from 'next/app';
import CommandBar from '../components/CommandBar';
import { I18nProvider } from '../locales';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <I18nProvider locale={pageProps.locale}>
      <CommandBar>
        <Component {...pageProps} />
      </CommandBar>
    </I18nProvider>
  );
}

export default MyApp;
