import { crafts } from '@/data/projects';

export const Crafts = () => {
  return (
    <>
      {crafts.map(item => (
        <div key={item.year}>
          <h3>{item.year}</h3>
          <ul>
            {item.crafs.map(project => (
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
