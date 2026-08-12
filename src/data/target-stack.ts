/**
 * The technologies Gabriel is currently applying for roles with, in the order
 * he wants them read.
 *
 * This is the one piece of positioning the Résumé Source cannot express: the
 * YAML records what he *did*, ranked by frequency, while this records what he
 * wants to be *hired for*. They disagree on purpose — React and C#/.NET rank
 * 38th and 23rd by frequency, but lead most of the job specs he targets.
 *
 * Site-owned by design (the shared YAML must not change shape) and expected to
 * be revisited whenever the job search changes.
 */
export const TARGET_STACK = [
  'Java',
  'Spring Boot',
  'Node.js',
  'React',
  'C#/.NET'
] as const;
