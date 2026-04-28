export interface Job {
  key: string;
  jobTitle: string;
  company: string;
  companyUrl?: string;
  startDate: string;
  endDate?: string;
  location?: string;
}

export const jobs: Job[] = [
  {
    key: 'bradesco',
    jobTitle: 'Software Engineer',
    company: 'Bradesco',
    companyUrl: 'https://banco.bradesco',
    startDate: '2025-04-01',
    location: 'Remote, Brazil'
  },
  {
    key: 'mi',
    jobTitle: 'Software Engineer',
    company: 'Mundo Invest',
    companyUrl: 'https://mundoinvest.com.br',
    startDate: '2024-02-01',
    endDate: '2025-04-01',
    location: 'Remote, Brazil'
  },
  {
    key: 'avaliemais',
    company: 'Avalie Mais',
    companyUrl: '',
    jobTitle: 'Software Engineer',
    startDate: '2021-12-01',
    endDate: '2024-02-01',
    location: 'Remote, Brazil'
  },
  {
    key: 'freelance',
    company: 'Freelance',
    jobTitle: 'Full Stack Engineer',
    startDate: '2021-07-01',
    endDate: '2023-06-01',
    location: 'Remote, Brazil'
  }
];
