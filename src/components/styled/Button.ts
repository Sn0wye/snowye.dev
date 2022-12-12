import { styled } from '../../../stitches.config';

export const Button = styled('button', {
  appearance: 'none',
  background: 'transparent',
  border: 0,
  borderRadius: '$borderRadius',
  color: '$primary',
  cursor: 'pointer',
  display: 'inline-block',
  fontSize: '1rem',
  fontWeight: 600,
  lineHeight: '1.5rem',
  margin: '0 0 0 -0.625rem',
  outline: '0',
  padding: '0.5rem 0.625rem 0.5rem',
  textDecoration: 'none',
  transition: 'colors $duration ease-in-out',
  '&:hover': { background: '$hover', color: '$primary', opacity: 1 },
  '&:hover kbd': { background: '$primary' }
});
