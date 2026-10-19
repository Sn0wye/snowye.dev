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
    p1Before: "Hi, I'm ",
    p1FirstName: 'Gabriel',
    p1After:
      '! I\'m a self-taught backend software engineer, currently at <a href="https://paytrack.com.br" target="_blank" rel="noreferrer">Paytrack</a> in Blumenau. Before that, I worked at <a href="https://banco.bradesco" target="_blank" rel="noreferrer">Bradesco</a> and <a href="https://mundoinvest.com.br" target="_blank" rel="noreferrer">Mundo Invest</a>. What I enjoy most is making systems faster, hunting down hard bugs, and learning new things. When something breaks, I want to understand the cause before fixing it. I like shipping fast, without giving up quality. Outside work, I follow <strong>F1 and GT3</strong>, play games, listen to a lot of music, and travel when I can.',
    p2: 'I work <strong>AI-first</strong>: I use AI agents to write and review code and automate day-to-day work, and put my energy into architecture and technical decisions. I also study everything around it, like LLMs, agents, and MCP, to keep up with where the industry is heading.'
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
  faq: {
    title: 'FAQ',
    items: [
      {
        question: 'Who is Gabriel Trzimajewski?',
        answer:
          'Gabriel Trzimajewski is a Senior Backend Software Engineer from Blumenau, Santa Catarina, Brazil, with 5+ years building distributed systems, APIs and cloud infrastructure. He is currently at Paytrack, building the future of corporate travel management; before that he worked at Bradesco on an internal log processing and observability platform used at banking scale.'
      },
      {
        question: 'What technologies does Gabriel work with?',
        answer:
          'Primarily Java and Spring Boot, Node.js and TypeScript, and React on the frontend. On the infrastructure side: AWS, Terraform, Docker, Kafka, gRPC, PostgreSQL and Datadog for observability and SLO-based alerting.'
      },
      {
        question: 'How do you pronounce Trzimajewski?',
        answer: 'Roughly "tree-mah-zhess-key" (IPA: tɾi maˈʒɛs.ki).'
      },
      {
        question: 'What has Gabriel actually shipped?',
        answer:
          'He led a B3 stock exchange integration serving ~100k requests/day for ~10k monthly active users, cut AWS costs by ~50% through a cross-region Terraform migration, took a critical PostgreSQL query from ~8s to under 200ms using pg_trgm, and reduced deploy time from 15 minutes to 3 with GitHub Actions.'
      }
    ]
  },
  languages: 'Languages'
};
