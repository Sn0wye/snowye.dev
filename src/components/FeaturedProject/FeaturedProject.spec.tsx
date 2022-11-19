import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { describe } from 'vitest';
import { FeaturedProject } from '.';
import { Project } from '../../data/projects';

const projectMock: Project = {
  title: 'Mock Project',
  description: 'This is a mocked project',
  url: '/test',
  iconName: 'book',
  stats: '400k+ Sales'
}

describe('<FeaturedProject />', () => {
  it('should render properly', () => {
    const { container } = render(<FeaturedProject onHover={() => {}} isHovered project={projectMock} />)
    expect(container).toBeInTheDocument();
  });

  it('should render props correctly', () => {
    const { getByRole, getByText } = render(
      <FeaturedProject onHover={() => {}} isHovered project={projectMock} />
    );

    expect(getByText('Mock Project')).toBeInTheDocument();
    expect(getByText('This is a mocked project')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute('href', '/test');
  });
});
