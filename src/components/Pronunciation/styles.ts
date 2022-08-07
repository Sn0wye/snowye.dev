import { styled } from '../../../stitches.config';

export const Button = styled('button', {
  background: 'transparent',
  border: 'none',
  color: '$primary',
  cursor: 'pointer',
  margin: '0 0.25rem',
  padding: '0',
  position: 'relative',
  top: '5px',
  transform: 'none',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': { transform: 'scale(1.1) translateZ(0)' },
});

export const Icon = styled('i', {
  fontSize: '1.5rem',
  lineHeight: '2rem',
});
