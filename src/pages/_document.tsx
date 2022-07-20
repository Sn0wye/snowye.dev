import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { getCssText } from '../../stitches.config';

export default class MyDocument extends Document {
  render() {
    const lang = this.props.__NEXT_DATA__.props.pageProps?.post?.lang;

    return (
      <Html lang={lang ? lang : 'en-US'}>
        <Head>
          <meta charSet='utf-8' />
          <meta content='Gabriel Trzimajewski' name='author' />
          <meta property='og:type' content='website' />
          <meta content='summary_large_image' name='twitter:card' />
          <meta name='theme-color' content='#08070b' />
          <style
            id='stitches'
            dangerouslySetInnerHTML={{ __html: getCssText() }}
          />

          <link
            rel='icon'
            href='/favicon.svg'
            sizes='any'
            type='image/svg+xml'
          />
        </Head>
        <Main />
        <NextScript />
      </Html>
    );
  }
}
