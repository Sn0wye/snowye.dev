import { projects } from '@/data/projects';

export const AllProjects = () => {
  return (
    <>
      {projects.map(item => (
        <div key={item.year}>
          <h3>{item.year}</h3>
          <ul>
            {item.projects.map(project => (
              <li key={project.id}>
                <a href={project.url} target="_blank" rel="noreferrer">
                  {project.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
};
