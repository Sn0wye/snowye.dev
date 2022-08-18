import { styled } from '../../../stitches.config';

export const Form = styled('form', {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '400px',
});

export const FormGroup = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '0.625rem',
});

export const Label = styled('label', {
  color: '$secondary',
  textTransform: 'uppercase',
  fontSize: '0.75rem',
  fontWeight: '500',
});

export const Input = styled('input', {
  color: '$primary',
  background: 'none',
  border: '1px solid $secondary',
  borderRadius: '$borderRadius',
  padding: '0.625rem',
  height: '2rem',
  fontSize: '0.95rem',
  '&:focus': { outline: 'none', borderColor: '$purple' },
});

export const Textarea = styled('textarea', {
  color: '$primary',
  background: 'none',
  border: '1px solid $secondary',
  borderRadius: '$borderRadius',
  padding: '0.625rem',
  fontSize: '0.95rem',
  '&:focus': { outline: 'none', borderColor: '$purple' },
});

export const Button = styled('button', {
  color: '$background',
  background: '#fff',
  border: '1px solid #fff',
  borderRadius: '$borderRadius',
  cursor: 'pointer',
  padding: '0.625rem',
  marginTop: '0.3125rem',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    background: 'transparent',
    borderColor: '$purple',
    color: '$purple',
  },
  '&:focus': {
    background: 'transparent',
    borderColor: '$purple',
    color: '$purple',
    outline: 'none',
  },
});
