import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Toast } from '.';

const baseProps = {
  title: 'Title',
  description: 'Description',
  isSuccess: true,
  showToast: true,
  setShowToast: () => {},
  children: <span>Mock</span>
};

describe('<Toast />', () => {
  it('should render properly', () => {
    const { container } = render(<Toast {...baseProps} />);
    expect(container).toBeInTheDocument();
  });

  it('it should render props correctly', () => {
    const { getByText } = render(<Toast {...baseProps} />);

    expect(getByText('Title')).toBeInTheDocument();
    expect(getByText('Description')).toBeInTheDocument();
    expect(getByText('Mock')).toBeInTheDocument();
  });
});
