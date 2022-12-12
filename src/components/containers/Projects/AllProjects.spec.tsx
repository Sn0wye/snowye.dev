import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { projects } from '../../../data/projects';
import { AllProjects } from './AllProjects';

describe('<AllProjects />', () => {
  it('should render properly', () => {
    const { container } = render(<AllProjects />);
    expect(container).toBeInTheDocument();
  });

  it('should render items correctly', () => {
    const { getByText } = render(<AllProjects />);

    for (const project in projects) {
      projects[project].projects.forEach(project => {
        expect(getByText(project.title)).toBeInTheDocument();
      });
    }
  });
});
