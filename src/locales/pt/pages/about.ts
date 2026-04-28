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
    p1Before: 'Hey, eu sou o ',
    p1FirstName: 'Gabriel',
    p1After:
      '! Sou um cara autodidata que vive, ama e aprende, escuta muita música, ama programar, viajar e tocar piano. Sempre fui apaixonado por computadores desde criança, e descobri a beleza do JavaScript na <strong><a href="https://rocketseat.com.br" target="_blank" rel="noreferrer">Rocketseat</a></strong> no início de 2020.',
    p2: 'Atualmente sou <strong>Engenheiro de Software</strong> no <a href="https://banco.bradesco" target="_blank" rel="noreferrer">Bradesco</a>, trabalhando no time Open construindo uma plataforma interna de processamento de logs e observabilidade usada em <strong>escala bancária</strong> para investigação de incidentes e monitoramento de sistemas. Sou Brasileiro com muito orgulho e fã de carteirinha do <strong>twenty one pilots</strong>.',
    p3: 'Sou um <strong>engenheiro focado em backend</strong> com mais de 4 anos entregando <strong>sistemas distribuídos</strong>, APIs e infraestrutura na nuvem. Me importo com <strong>confiabilidade</strong>, <strong>performance</strong> e escrever código que seja gostoso de manter às 3 da manhã quando algo pega fogo. Antes do Bradesco, passei mais de um ano na <strong>Mundo Invest</strong> liderando uma integração com a B3 que processava <strong>~100 mil requisições/dia</strong>, onde reduzi custos de nuvem em <strong>~50%</strong> e derrubei uma query crítica de <strong>~8s para menos de 200ms</strong>.'
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
  educationItem: {
    degree: 'Bacharelado em Ciência da Computação',
    school: 'UNINTER',
    location: 'Brasil',
    dates: 'Fev 2025 – Fev 2029',
    gpa: 'CR 9,32/10',
    focus:
      'Foco em Algoritmos, Estruturas de Dados, Bancos de Dados, Sistemas Distribuídos e Matemática Aplicada (Cálculo, Álgebra Linear, Probabilidade e Estatística), com exposição a IA e Computação em Nuvem.'
  },
  languages: 'Idiomas',
  languagesList: [
    { name: 'Português', level: 'nativo' },
    { name: 'Inglês', level: 'fluente' }
  ]
};
