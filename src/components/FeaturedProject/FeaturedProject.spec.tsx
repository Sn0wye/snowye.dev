import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FeaturedProject } from '.';

describe('<FeaturedProject />', () => {
  it('should render properly', () => {
    const { container } = render(
      <FeaturedProject onHover={() => {}} isHovered title='' url='' />
    );

    expect(container).toBeInTheDocument();
  });

  it('should render props correctly', () => {
    const { getByRole, getByText } = render(
      <FeaturedProject
        onHover={() => {}}
        isHovered
        title='Title'
        url='/test'
        description='description'
        icon={<></>}
        stats='stats'
      />
    );

    expect(getByText('Title')).toBeInTheDocument();
    expect(getByText('description')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute('href', '/test');
  });
});
