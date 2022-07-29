import * as ToastPrimitive from '@radix-ui/react-toast';
import { keyframes, styled } from '../../../stitches.config';

const slideUpAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(1.25rem)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const slideDownAndFade = keyframes({
  '0%': { opacity: 1, transform: 'translateY(0)' },
  '100%': { opacity: 0, transform: 'translateY(1.25rem)' },
});

export const Root = styled(ToastPrimitive.Root, {
  background: '$hover',
  borderRadius: '0.25rem',
  border: '1px solid rgb(48, 50, 54)',
  boxShadow: 'rgb(0 0 0 / 8%) 0px 4px 13px',
  color: 'rgb(138, 143, 152)',
  fontSize: '0.875rem',
  overflow: 'hidden',
  margin: 0,
  padding: '0.75rem',
  display: 'flex',
  '&[data-state="open"]': {
    animation: `100ms ease-in forwards ${slideUpAndFade}`,
  },
  '&[data-state="closed"]': {
    animation: `100ms ease-in forwards ${slideDownAndFade}`,
  },
});

export const IconContainer = styled('div', {
  margin: '0.25rem 0.5rem 0 0',
  '& svg': {
    width: '1rem',
    height: '1rem',
  },
});

export const Title = styled(ToastPrimitive.Title, {
  color: '$primary',
  lineHeight: '1.75rem',
});

export const Description = styled(ToastPrimitive.Description, {
  marginTop: '-5px',
  lineHeight: '1.75rem',
});

export const Close = styled(ToastPrimitive.Close, {
  position: 'absolute',
  right: '0',
  top: '0',
  width: '2rem',
  height: '2rem',
  background: 'transparent',
  border: '0',
  fontSize: '1.125rem',
  color: 'rgb(138, 143, 152)',
  transition: 'color 0.2s ease-in-out',
  '&:hover': { color: '$primary' },
});

export const Viewport = styled(ToastPrimitive.Viewport, {
  position: 'fixed',
  bottom: '1.25rem',
  right: '1.25rem',
  zIndex: 2,
});
