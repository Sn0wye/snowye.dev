import { getMessages } from '@/i18n/messages';
import type { AppLocale } from '@/i18n/routing';
import { stripHtml } from '@/utils/stripHtml';

export const renderHomeMarkdown = (locale: AppLocale): string => {
  const home = getMessages(locale).pages.home;
  const prefix = locale === 'pt' ? '/pt' : '';
  const links =
    locale === 'pt'
      ? [
          ['Sobre', `${prefix}/about`],
          ['Projetos', `${prefix}/projects`],
          ['Currículo', `${prefix}/cv`],
          ['Contato', `${prefix}/contact`],
          ['Privacidade', `${prefix}/privacy`]
        ]
      : [
          ['About', '/about'],
          ['Projects', '/projects'],
          ['CV', '/cv'],
          ['Contact', '/contact'],
          ['Privacy', '/privacy']
        ];

  const lines = [
    `# ${home.title}`,
    '',
    stripHtml(home.meta),
    '',
    home.introduction,
    ''
  ];

  for (const section of home.sections) {
    lines.push(`## ${section.title}`, '', section.body, '');
  }

  lines.push(
    `## ${locale === 'pt' ? 'Páginas principais' : 'Key pages'}`,
    '',
    ...links.map(([label, path]) => `- [${label}](https://snowye.dev${path})`),
    ''
  );

  return lines.join('\n');
};
