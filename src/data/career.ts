export interface Job {
  jobTitle: string;
  company: string;
  companyUrl: string;
  startDate: string;
  endDate?: string;
  location: string;
}

export const jobs: Job[] = [
  // {
  //   jobTitle: 'Junior Frontend Engineer Freelance',
  //   company: 'Coff3e',
  //   companyUrl: 'https://coff3e.dev/',
  //   startDate: '2022-03-01',
  //   endDate: '2022-04-01',
  //   location: 'São Paulo, SP'
  // }
];
