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
    p2: 'I\'m currently a <strong>Software Engineer</strong> at <a href="https://banco.bradesco" target="_blank" rel="noreferrer">Bradesco</a>, working on the Open Platform team building an internal log processing and observability platform used at <strong>banking scale</strong> for incident investigation and system monitoring. I\'m from Brazil and a big fan of <strong>twenty one pilots</strong>.',
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
  languages: 'Languages',
  languagesList: [
    { name: 'Portuguese', level: 'native' },
    { name: 'English', level: 'fluent' }
  ]
};
