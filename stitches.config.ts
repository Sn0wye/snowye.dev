import { createStitches } from '@stitches/react';

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config
} = createStitches({
  theme: {
    colors: {
      yellow: '#ffff80',
      pink: '#ff80bf',
      purple: '#9580ff',
      red: '#ff9580',
      orange: '#ffca80',
      green: '#8aff80',
      cyan: '#80ffea',
      primary: '#f2f2f2',
      secondary: '#8f9ba8',
      background: '#08070b',
      hover: '#212024',
      command: 'rgba(255, 255, 255, 0.05)',
      linkedin: '#0077b5',
      // instagramGradient:
      //   'linear-gradient(90deg, rgba(255,214,0,1) 0%, rgba(255,122,0,1) 50%, rgba(255,0,105,1) 100%)',
      instagram: '#e1306c',
      github: '#777777'
    },
    fonts: {
      body: 'Biotif, sans-serif',
      code: 'Fira Code, monospace',
      heading: 'Neuzeit Grotesk Bold, sans-serif'
    },
    space: {
      navHeightDesktop: '3.75rem',
      navHeightMobile: '6.875rem'
    },
    transitions: {
      duration: '0.2s'
    },
    radii: {
      borderRadius: '0.5rem'
    }
  },
  media: {
    bp1: '(min-width: 425px)',
    bp2: '(min-width: 760px)',
    bp3: '(max-width: 780px)',
    bp4: '(max-width: 1024px)'
  },
  utils: {
    size: (value: string) => ({
      width: value,
      height: value
    })
  }
});

const globalStyles = globalCss({
  '*': {
    fontFamily: '$body'
  },
  'html, body': {
    margin: '0',
    padding: '0',
    WebkitFontSmoothing: 'antialiased',
    background: '$background',
    border: 0
  },
  '::-webkit-scrollbar': {
    width: '0.375rem'
  },
  '::-webkit-scrollbar-track': {
    background: '#151417'
  },
  '::-webkit-scrollbar-thumb': {
    backgroundColor: '$primary',
    borderRadius: '10px',
    border: '10px solid $primary'
  },
  kbd: {
    color: '$background',
    background: '$secondary',
    padding: '0.0625rem 0.375rem',
    borderRadius: '0.25rem',
    transition: 'background $duration ease-in-out',
    fontFamily: '$code',
    fontSize: '0.875rem'
  },
  figure: {
    margin: 0
  },
  twitterwidget: {
    margin: '0 auto'
  },
  code: {
    background: '#151417',
    borderRadius: '$borderRadius',
    color: '$primary',
    fontFamily: '$code',
    fontSize: '0.9375rem'
  },
  ':not(pre) > code': {
    padding: '0.25rem'
  },
  h1: {
    fontFamily: '$heading',
    fontSize: '3rem',
    lineHeight: '3.125rem',
    margin: '0 0 1.25rem',
    color: '$primary'
  },
  h2: {
    color: '$primary',
    margin: '3.75rem 0 0',
    fontSize: '1.5rem'
  },
  'h3, h3 a': {
    color: '$primary',
    fontSize: '1.125rem',
    margin: '1.25rem 0 0'
  },
  ul: {
    margin: 0
  },
  img: {
    borderRadius: '0.5rem',
    minWidth: '100%',
    maxWidth: '100%'
  },
  p: {
    margin: '1.25rem 0',
    color: '$secondary'
  },
  strong: {
    color: '$primary',
    fontWeight: 500
  },
  blockquote: {
    borderLeft: '0.25rem solid $hover',
    color: '$secondary',
    fontStyle: 'italic',
    margin: '0',
    paddingLeft: '1.25rem'
  },
  a: {
    borderBottom: '1px solid $primary',
    color: '$primary',
    textDecoration: 'none',
    transition: 'opacity $duration ease-in-out'
  },
  'a:hover, a:focus': {
    opacity: '0.8'
  },
  '@font-face': [
    {
      fontFamily: 'Neuzeit Grotesk Bold',
      src: `url("/static/font/NeuzeitGrotesk-Bold.woff2") format("woff2"),
        url("/static/font/NeuzeitGrotesk-Bold.woff") format("woff")`,
      fontWeight: 'normal',
      fontStyle: 'normal'
    },
    {
      fontFamily: 'Fira Code',
      src: `url("/static/font/FiraCode-Regular.woff2") format("woff2"),
        url("/static/font/FiraCode-Regular.woff") format("woff")`,
      fontWeight: 'normal',
      fontStyle: 'normal'
    },
    {
      fontFamily: 'Biotif',
      src: `url("/static/font/Biotif-Bold.woff2") format("woff2"),
        url("/static/font/Biotif-Bold.woff") format("woff")`,
      fontWeight: 'bold',
      fontStyle: 'normal'
    },
    {
      fontFamily: 'Biotif',
      src: `url("/static/font/Biotif-Book.woff2") format("woff2"),
        url("/static/font/Biotif-Book.woff") format("woff")`,
      fontWeight: 500,
      fontStyle: 'normal'
    },
    {
      fontFamily: 'Biotif',
      src: `url("/static/font/Biotif-Regular.woff2") format("woff2"),
        url("/static/font/Biotif-Regular.woff") format("woff")`,
      fontWeight: 'normal',
      fontStyle: 'normal'
    },
    {
      fontFamily: 'Biotif',
      src: `url("/static/font/Biotif-RegularItalic.woff2") format("woff2"),
        url("/static/font/Biotif-RegularItalic.woff") format("woff")`,
      fontWeight: 'normal',
      fontStyle: 'italic'
    }
  ]
});

// globalStyles();
