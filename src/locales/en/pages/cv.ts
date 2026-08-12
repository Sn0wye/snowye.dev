export const cv = {
  title: 'CV | Gabriel Trzimajewski',
  tagline: 'Curriculum Vitae',
  description:
    'The full professional record of Gabriel Trzimajewski, Senior Backend Software Engineer: roles, achievements, technologies, and education.',
  openToWork: 'Open to backend and full-stack roles — remote.',
  present: 'Present',
  sections: {
    summary: 'Summary',
    experience: 'Experience',
    skills: 'Skills',
    education: 'Education',
    languages: 'Languages',
    contact: 'Contact'
  },
  showAll: 'Show all {count} highlights',
  showLess: 'Show fewer',
  /** Third person, so an answer engine can quote it without resolving "I". */
  sentence: {
    role: '{name} worked as {position} at {company} from {start} to {end}.',
    currentRole: '{name} works as {position} at {company}, since {start}.',
    education:
      '{name} is studying {area} at {institution} ({start} – {end}), with a GPA of {score}.'
  }
};
