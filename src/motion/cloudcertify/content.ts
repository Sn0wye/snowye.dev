/**
 * What CloudCertify shows in these moments: questions from its CLF-C02 bank
 * as the pipeline wrote them, and its own en-US copy.
 */

export type Answer = { id: string; text: string; correct?: boolean };

export type Question = {
  id: string;
  text: string;
  selectCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  answers: Answer[];
  explanation: string;
};

const question = (
  id: string,
  text: string,
  answers: [string, boolean][],
  explanation: string,
  selectCount = 1
): Question => ({
  id,
  text,
  selectCount,
  difficulty: 'easy',
  answers: answers.map(([answer, correct], i) => ({
    id: `${id}-${i}`,
    text: answer,
    correct
  })),
  explanation
});

export const backups = question(
  'backups',
  'Which AWS service should be used for long-term, low-cost storage of data backups?',
  [
    ['Amazon RDS.', false],
    ['Amazon Glacier.', true],
    ['AWS Snowball.', false],
    ['AWS EBS.', false]
  ],
  'Amazon S3 Glacier (often referred to as Amazon Glacier) is designed for long-term, low-cost archival storage and backups, making it the correct choice for this use case.'
);

export const serverless = question(
  'serverless',
  'Which of the following compute resources are serverless? (Choose TWO)',
  [
    ['Amazon EC2.', false],
    ['AWS Fargate.', true],
    ['AWS Lambda.', true],
    ['Amazon ECS.', false],
    ['Amazon EMR.', false]
  ],
  'AWS Lambda and AWS Fargate are serverless compute services. AWS Lambda runs code without provisioning servers, and AWS Fargate runs containers without managing the underlying infrastructure.',
  2
);

export const metrics = question(
  'metrics',
  'Which AWS service collects metrics from running EC2 instances?',
  [
    ['Amazon Inspector.', false],
    ['Amazon CloudWatch.', true],
    ['AWS CloudFormation.', false],
    ['AWS CloudTrail.', false]
  ],
  'Amazon CloudWatch is the correct answer because it is the AWS service designed to collect metrics such as CPU utilization and network I/O from EC2 instances.'
);

export const permissions = question(
  'permissions',
  'What can you use to assign permissions directly to an IAM user?',
  [
    ['IAM Identity.', false],
    ['IAM Group.', false],
    ['IAM Role.', false],
    ['IAM Policy.', true]
  ],
  'IAM policies are the mechanism used to assign permissions directly to an IAM user, as they define the allowed or denied actions and resources.'
);

export const support = question(
  'support',
  'Which AWS support plan includes a dedicated Technical Account Manager?',
  [
    ['Developer.', false],
    ['Enterprise.', true],
    ['Business.', false],
    ['Basic.', false]
  ],
  'The Enterprise support plan is the only AWS support plan that includes a dedicated Technical Account Manager (TAM).'
);

/** The Cloud Technology and Services drill: a Drill Mix of 15. */
export const drill = {
  title: 'Cloud Technology and Services (CLF-C02)',
  total: 15,
  composition: { missed: 6, due: 3, unseen: 4, mastered: 2 }
};

export const quiz = {
  title: 'AWS Certified Cloud Practitioner (CLF-C02)',
  total: 65
};

/** en.ts, the strings these screens read. */
export const copy = {
  back: 'Back',
  counter: (index: number, total: number) => `Question ${index} of ${total}`,
  selectAnswers: (count: number) => `Select ${count} answers`,
  check: 'Check',
  checking: 'Checking...',
  continue: 'Continue',
  correct: 'Correct',
  notQuite: 'Not quite',
  shortcuts: {
    select: 'select',
    check: 'check',
    continue: 'continue',
    next: 'next',
    navigate: 'navigate'
  },
  report: 'Report a problem',
  previous: 'Previous',
  next: 'Next',
  finishQuiz: 'Finish Quiz',
  drillLabel: 'Built for you',
  composition: ({ missed, due, unseen, mastered }: typeof drill.composition) =>
    `${missed} missed · ${due} due · ${unseen} new${mastered > 0 ? ` · ${mastered} mastered` : ''}`,
  difficulty: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
  confidence: {
    label: 'How sure are you?',
    revisitHint: 'Marked to revisit before you finish.',
    options: { guess: 'Guess', unsure: 'Unsure', confident: 'Confident' }
  },
  navigator: {
    title: 'Questions',
    answeredCount: (answered: number, total: number) =>
      `${answered} of ${total} answered`,
    reviewCount: (count: number) =>
      count === 1 ? '1 to revisit' : `${count} to revisit`
  },
  footer: {
    coffee: 'Buy me a coffee',
    rights: '© 2026 CloudCertify. All rights reserved.'
  },
  home: {
    badge: 'Free, no card or account',
    lead: 'Pass your',
    cert: 'cert',
    tail: 'the first time.',
    subtitle:
      'Real exam-style questions, focused domain drills and full-length simulations for AWS, Google Cloud and Azure. Built to get you certified, not to upsell you.',
    primary: 'Start learning',
    secondary: 'Browse certifications',
    mockQuestion:
      'Which service runs containers without managing servers or clusters?',
    free: ['100%', 'free'],
    links: ['Certifications', 'Pricing'],
    dashboard: 'Dashboard',
    chips: ['AWS', 'GCP', 'Azure']
  }
};
