import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Layout } from '.';

vi.mock('next/router', () => {
  return {
    useRouter: () => ({
      asPath: '/',
    }),
  };
});

vi.mock('kbar', () => {
  return {
    useKBar: () => ({
      query: {
        toggle: () => {},
      },
    }),
  };
});

describe('<Layout />', () => {
  it('should render properly', () => {
    const { container } = render(<Layout />);
    expect(container).toBeInTheDocument();
  });
});
