export const about = {
  title: 'About | Gabriel Trzimajewski',
  description:
    "I'm a self-taught backend engineer who likes building reliable distributed systems, breaking things on purpose, and helping people along the way.",
  tagline: 'Code. Sleep. Repeat.',
  pronunciation: {
    label: 'How to pronounce Trzimajewski',
    surname: 'Trzimajewski',
    spell: 'tree-mah-zhess-key',
    ipa: 'tɾi maˈʒɛs.ki',
    spellLabel: 'Roughly',
    ipaLabel: 'IPA'
  },
  bio: {
    p1Before: "Hey, I'm ",
    p1FirstName: 'Gabriel',
    p1After:
      '! I\'m a self-taught guy who lives, loves and learns, listens to a lot of music, loves coding, traveling and playing piano. I\'ve always been into computers since I was a kid, and then I discovered the beauty of JavaScript at <strong><a href="https://rocketseat.com.br" target="_blank" rel="noreferrer">Rocketseat</a></strong> back in early 2020.',
    p2: 'Most recently I was a <strong>Senior Software Engineer</strong> at <a href="https://banco.bradesco" target="_blank" rel="noreferrer">Bradesco</a>, on the Open Platform team, building an internal log processing and observability platform used at <strong>banking scale</strong> for incident investigation and system monitoring. I\'m from Brazil and a big fan of <strong>twenty one pilots</strong>.',
    p3: "I'm a <strong>backend-focused engineer</strong> with 4+ years shipping <strong>distributed systems</strong>, APIs, and cloud infra. I care about <strong>reliability</strong>, <strong>performance</strong>, and writing code that's actually nice to maintain at 3am when something is on fire. Before Bradesco, I spent a year+ at <strong>Mundo Invest</strong> leading a B3 (Brazilian stock exchange) integration handling <strong>~100k requests/day</strong>, where I cut cloud costs by <strong>~50%</strong> and dropped a critical query from <strong>~8s to under 200ms</strong>."
  },
  highlights: 'Highlights',
  highlightsList: [
    'Designed an audited, incident-based log access workflow at Bradesco, cutting investigation time by <strong>50%+</strong> while keeping full traceability and compliance.',
    'Led a B3 integration API at Mundo Invest serving <strong>~100k requests/day</strong> for <strong>~10K MAUs</strong> over REST, webhooks, and Kafka.',
    'Migrated AWS infra across regions with Terraform, lowering cloud costs by <strong>~50%</strong> through workload analysis and rightsizing.',
    'Optimized PostgreSQL search with <code>pg_trgm</code>, taking response times from <strong>~8s to &lt;200ms</strong> under production load.',
    'Replaced synchronous REST with <strong>gRPC</strong> on latency-sensitive paths, improving inter-service tail latency.',
    'Automated CI/CD with GitHub Actions (Docker, ECS, ECR), bringing deploys from <strong>15 minutes to 3</strong>.',
    'Built Datadog dashboards and SLO-based alerting, reducing incident investigation time by <strong>~80%</strong> and improving MTTR across a 5-engineer team.'
  ],
  career: 'Career',
  present: 'Present',
  education: 'Education',
  educationItem: {
    degree: 'B.Sc. Computer Science',
    school: 'UNINTER',
    location: 'Brazil',
    dates: 'Feb 2025 – Feb 2029',
    gpa: 'GPA 9.32/10',
    focus:
      'Focus on Algorithms, Data Structures, Databases, Distributed Systems, and Applied Mathematics (Calculus, Linear Algebra, Probability & Statistics), with exposure to AI and Cloud Computing.'
  },
  faq: {
    title: 'FAQ',
    items: [
      {
        question: 'Who is Gabriel Trzimajewski?',
        answer:
          'Gabriel Trzimajewski is a Senior Backend Software Engineer from Blumenau, Santa Catarina, Brazil, with 5+ years building distributed systems, APIs and cloud infrastructure. He most recently worked at Bradesco on an internal log processing and observability platform used at banking scale.'
      },
      {
        question: 'What technologies does Gabriel work with?',
        answer:
          'Primarily Java and Spring Boot, Node.js and TypeScript, C#/.NET, and React on the frontend. On the infrastructure side: AWS, Terraform, Docker, Kafka, gRPC, PostgreSQL and Datadog for observability and SLO-based alerting.'
      },
      {
        question: 'How do you pronounce Trzimajewski?',
        answer: 'Roughly "tree-mah-zhess-key" (IPA: tɾi maˈʒɛs.ki).'
      },
      {
        question: 'Is Gabriel available for work?',
        answer:
          'Yes — he is open to senior backend and fullstack roles, remote or based in Brazil. The fastest way to reach him is the contact page at snowye.dev/contact or by email at gabriel@snowye.dev.'
      },
      {
        question: 'What has Gabriel actually shipped?',
        answer:
          'He led a B3 stock exchange integration serving ~100k requests/day for ~10k monthly active users, cut AWS costs by ~50% through a cross-region Terraform migration, took a critical PostgreSQL query from ~8s to under 200ms using pg_trgm, and reduced deploy time from 15 minutes to 3 with GitHub Actions.'
      }
    ]
  },
  languages: 'Languages',
  languagesList: [
    { name: 'Portuguese', level: 'native' },
    { name: 'English', level: 'fluent' }
  ]
};
