import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { describe, expect } from 'vitest';
import { Career } from './Career';
import { Intro } from './Intro';

describe('About components', () => {
  test('Career should render properly', () => {
    const { container } = render(<Career />);
    expect(container).toBeInTheDocument();
  });

  test('Intro should render properly', () => {
    const { container } = render(<Intro />);
    expect(container).toBeInTheDocument();
  });
});
