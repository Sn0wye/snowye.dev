import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Pronunciation } from '.';

describe('<Pronunciation />', () => {
  it('should render properly', () => {
    const { container } = render(<Pronunciation />);
    expect(container).toBeInTheDocument();
  });
});
