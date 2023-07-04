const start = {
  mobile: 'Tap to start →',
  mac: 'Press {keys} to start →',
  pc: 'Press {keys} to start →'
} as const;

const actions = {
  copy: 'Copy URL',
  email: 'Send Email',
  source: 'View Source',
  home: 'Home',
  about: 'About',
  projects: 'Projects'
} as const;

const sections = {
  general: 'General',
  goto: 'Go To',
  follow: 'Follow'
} as const;

const toast = {
  title: 'Copied :D',
  description: 'You can now share it with anyone.'
} as const;

export const kbar = {
  start,
  actions,
  sections,
  toast
} as const;
