import { it } from 'vitest';
import { getTotalProjects } from '../getTotalProjects';

const projects = [
  {
    year: '2022',
    projects: [
      {
        title: '1',
        url: '1',
      },
      {
        title: '2',
        url: '2',
      },
      {
        title: '3',
        url: '3',
      },
    ],
  },
];

it('should cont the total projects correctly', () => {
  const result = getTotalProjects(projects);

  expect(result).toEqual(3);
});
