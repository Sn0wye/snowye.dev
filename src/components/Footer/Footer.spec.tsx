import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from '.';

describe('<Footer />', () => {
  it('should render properly', () => {
    const { container } = render(<Footer />);
    expect(container).toBeInTheDocument();
  });

  it('should render items correctly', () => {
    const { getByText } = render(<Footer />);
    expect(getByText('Email')).toBeInTheDocument();
    expect(getByText('GitHub')).toBeInTheDocument();
    expect(getByText('LinkedIn')).toBeInTheDocument();
    expect(getByText('Instagram')).toBeInTheDocument();
  });
});
