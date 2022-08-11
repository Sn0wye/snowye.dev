import { styled } from '../../stitches.config';

export const Title = styled('h1', {
  background: 'linear-gradient(90deg, #9442FE, #3378FF)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});

export const Container = styled('div', {
  padding: '$navHeightMobile 1.25rem',
  margin: '0 auto',
  overflow: 'hidden',
  flex: '1 1',
  alignItems: 'center',
  display: 'flex',
  maxWidth: '760px',
  '@bp2': { width: 800, padding: '$navHeightDesktop 0' },
});

export const Content = styled('main', {
  fontSize: '1rem',
  lineHeight: '2rem',
  color: '$secondary',
  background: '$background',
  position: 'relative',
  zIndex: 1,
  height: '100%',
  padding: '0 1.25rem',
});
