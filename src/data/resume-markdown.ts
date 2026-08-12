import { getMessages } from '@/i18n/messages';
import type { AppLocale } from '@/i18n/routing';
import { interpolate } from '@/utils/interpolate';
import { getResume } from './resume';
import { getSignatureSkills, rolesByRecency } from './resume-derived';

/**
 * The résumé as plain Markdown, for crawlers that prefer text over markup.
 *
 * Third person throughout, so every line is quotable on its own. Section names
 * come from the Résumé Source's own `meta.section_titles`, and the connective
 * sentences from the CV copy, so the output is entirely in the target language.
 */
export const renderResumeMarkdown = (locale: AppLocale): string => {
  const resume = getResume(locale);
  const { basics, meta } = resume;
  const c = getMessages(locale).pages.cv;
  const section = (key: string, fallback: string) =>
    meta.section_titles[key] ?? fallback;

  const lines: string[] = [];

  lines.push(`# ${basics.name}`, '');
  lines.push(
    `${basics.name} — ${basics.label}, ${basics.location.city}, ${basics.location.region}, ${basics.location.countryCode}.`,
    ''
  );
  lines.push(
    `## ${section('summary', c.sections.summary)}`,
    '',
    basics.summary,
    ''
  );

  lines.push(`## ${section('work', c.sections.experience)}`, '');
  for (const role of rolesByRecency(resume)) {
    lines.push(`### ${role.position} — ${role.name}`, '');
    lines.push(
      interpolate(role.endDate ? c.sentence.role : c.sentence.currentRole, {
        name: basics.name,
        position: role.position,
        company: role.name,
        start: role.startDate,
        end: role.endDate ?? c.present
      }),
      ''
    );
    if (role.summary) lines.push(role.summary, '');
    for (const highlight of role.highlights) lines.push(`- ${highlight}`);
    lines.push('');
  }

  lines.push(
    `## ${section('skills', c.sections.skills)}`,
    '',
    getSignatureSkills(locale).join(', '),
    ''
  );

  lines.push(`## ${section('education', c.sections.education)}`, '');
  for (const item of resume.education) {
    lines.push(
      interpolate(c.sentence.education, {
        name: basics.name,
        area: item.area,
        institution: item.institution,
        start: item.startDate,
        end: item.endDate ?? c.present,
        score: item.score ?? '—'
      })
    );
  }

  lines.push('', `## ${section('languages', c.sections.languages)}`, '');
  for (const language of resume.languages) {
    lines.push(`- ${language.language}: ${language.fluency}`);
  }

  lines.push('', `## ${c.sections.contact}`, '');
  lines.push(`- ${basics.email}`);
  for (const profile of basics.profiles) {
    lines.push(`- ${profile.network}: ${profile.url}`);
  }

  return `${lines.join('\n')}\n`;
};
