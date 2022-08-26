import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Navbar, pages } from '.';

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

describe('<Navbar />', () => {
  it('should render properly', () => {
    const { container } = render(<Navbar />);
    expect(container).toBeInTheDocument();
  });

  it('should render the links correctly', () => {
    const { getByText } = render(<Navbar />);

    pages.forEach((page) => {
      expect(getByText(page)).toBeInTheDocument();
    });
  });
});
