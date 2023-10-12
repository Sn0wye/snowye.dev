import { projects } from '@/data/projects';

export const AllProjects = () => {
  return (
    <>
      {projects.map((item, index) => (
        <div key={index}>
          <h3>{item.year}</h3>
          <ul>
            {item.projects.map((project, index) => (
              <li key={index}>
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
