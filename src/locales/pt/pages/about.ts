export const about = {
  title: 'Sobre | Gabriel Trzimajewski',
  description:
    'Sou um engenheiro backend autodidata que gosta de construir sistemas distribuídos confiáveis, quebrar coisas de propósito e ajudar as pessoas ao longo do caminho.',
  tagline: 'Codar. Dormir. Repetir.',
  pronunciation: {
    label: 'Como pronunciar Trzimajewski',
    surname: 'Trzimajewski',
    spell: 'tri ma jés ki',
    ipa: 'tɾi maˈʒɛs.ki',
    spellLabel: 'Mais ou menos',
    ipaLabel: 'IPA'
  },
  bio: {
    p1Before: 'Oi, eu sou o ',
    p1FirstName: 'Gabriel',
    p1After:
      '! Sou engenheiro de software backend, autodidata, e hoje trabalho na <a href="https://paytrack.com.br" target="_blank" rel="noreferrer">Paytrack</a>, em Blumenau. Antes, passei pelo <a href="https://banco.bradesco" target="_blank" rel="noreferrer">Bradesco</a> e pela <a href="https://mundoinvest.com.br" target="_blank" rel="noreferrer">Mundo Invest</a>. O que mais gosto de fazer é deixar sistemas mais rápidos, caçar bugs difíceis e aprender coisas novas. Quando algo quebra, quero entender a causa antes de corrigir. Gosto de entregar rápido, mas com qualidade. Fora do trabalho, acompanho <strong>F1 e GT3</strong>, jogo, escuto muita música e viajo quando dá.',
    p2: 'Trabalho de forma <strong>AI-first</strong>: uso agentes de IA para escrever e revisar código e automatizar o dia a dia, e concentro minha energia em arquitetura e decisões técnicas. Também estudo tudo o que gira em torno disso, como LLMs, agentes e MCP, para acompanhar de perto para onde o mercado está indo.'
  },
  highlights: 'Destaques',
  highlightsList: [
    'Desenhei um fluxo auditado de acesso a logs por incidente no Bradesco, reduzindo o tempo de investigação em <strong>50%+</strong> mantendo rastreabilidade e conformidade total.',
    'Liderei a API de integração com a B3 na Mundo Invest atendendo <strong>~100 mil requisições/dia</strong> para <strong>~10 mil usuários ativos mensais</strong> via REST, webhooks e Kafka.',
    'Migrei infraestrutura AWS entre regiões com Terraform, reduzindo custos de nuvem em <strong>~50%</strong> via análise de carga e rightsizing.',
    'Otimizei busca em PostgreSQL com <code>pg_trgm</code>, levando o tempo de resposta de <strong>~8s para &lt;200ms</strong> sob carga de produção.',
    'Substituí REST síncrono por <strong>gRPC</strong> em rotas sensíveis a latência, melhorando a latência entre serviços.',
    'Automatizei pipelines de CI/CD com GitHub Actions (Docker, ECS, ECR), reduzindo deploys de <strong>15 para 3 minutos</strong>.',
    'Construí dashboards no Datadog e alertas baseados em SLO, reduzindo o tempo de investigação de incidentes em <strong>~80%</strong> e melhorando o MTTR de um time de 5 engenheiros.'
  ],
  career: 'Carreira',
  present: 'Atual',
  education: 'Formação',
  faq: {
    title: 'Perguntas frequentes',
    items: [
      {
        question: 'Quem é Gabriel Trzimajewski?',
        answer:
          'Gabriel Trzimajewski é Engenheiro de Software Backend Sênior de Blumenau, Santa Catarina, Brasil, com mais de 5 anos construindo sistemas distribuídos, APIs e infraestrutura em nuvem. Hoje está na Paytrack, construindo o futuro da gestão de viagens corporativas; antes, atuou no Bradesco em uma plataforma interna de processamento de logs e observabilidade usada em escala bancária.'
      },
      {
        question: 'Com quais tecnologias o Gabriel trabalha?',
        answer:
          'Principalmente Java e Spring Boot, Node.js e TypeScript, e React no frontend. Na infraestrutura: AWS, Terraform, Docker, Kafka, gRPC, PostgreSQL e Datadog para observabilidade e alertas baseados em SLO.'
      },
      {
        question: 'Como se pronuncia Trzimajewski?',
        answer: 'Aproximadamente "tri-ma-jés-ki" (IPA: tɾi maˈʒɛs.ki).'
      },
      {
        question: 'O que o Gabriel já entregou na prática?',
        answer:
          'Liderou uma integração com a B3 atendendo ~100 mil requisições/dia para ~10 mil usuários ativos mensais, reduziu custos de AWS em ~50% com uma migração entre regiões usando Terraform, levou uma query crítica de PostgreSQL de ~8s para menos de 200ms com pg_trgm e reduziu o tempo de deploy de 15 para 3 minutos com GitHub Actions.'
      }
    ]
  },
  languages: 'Idiomas'
};
