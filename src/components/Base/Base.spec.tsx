import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Base } from '.';

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

const baseProps = {
  primaryColor: '',
  secondaryColor: '',
  tagline: '',
  title: '',
  children: <span>mock</span>,
};

describe('<Base />', () => {
  it('should render properly', () => {
    const { container } = render(<Base {...baseProps} />);
    expect(container).toBeInTheDocument();
  });

  it('should render props correctly', () => {
    const { getByText } = render(
      <Base {...baseProps} tagline='Tagline'>
        <span>Children</span>
      </Base>
    );

    expect(getByText('Tagline')).toBeInTheDocument();
    expect(getByText('Children')).toBeInTheDocument();
  });
});
