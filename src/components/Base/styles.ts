import { styled } from '../../../stitches.config';

export const GradientTitle = styled('h1', {
  backgroundSize: '100%',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  MozBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  MozTextFillColor: 'transparent',
  WebkitBoxDecorationBreak: 'clone'
});

export const Wrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  position: 'relative',
  zIndex: 0
});
