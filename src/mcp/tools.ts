import { projects } from '@/data/projects';
import { getResume } from '@/data/resume';
import {
  getKnownForSet,
  getSignatureSkills,
  isOpenToWork,
  rolesByRecency
} from '@/data/resume-derived';
import { renderResumeMarkdown } from '@/data/resume-markdown';
import { TARGET_STACK } from '@/data/target-stack';
import { type AppLocale, routing } from '@/i18n/routing';

/**
 * The Answer Engine surface, spoken as MCP (ADR-0001 still holds: every answer
 * here is a pure function of the Résumé Source, never a hand-written copy).
 */

type JsonSchema = Record<string, unknown>;

export interface Tool {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  run: (args: Record<string, unknown>) => unknown;
}

const localeArg = (args: Record<string, unknown>): AppLocale => {
  const value = String(args.locale ?? 'en');
  return (routing.locales as readonly string[]).includes(value)
    ? (value as AppLocale)
    : 'en';
};

const localeSchema: JsonSchema = {
  type: 'object',
  properties: {
    locale: {
      type: 'string',
      enum: [...routing.locales],
      description: 'Language of the answer. Defaults to "en".'
    }
  },
  additionalProperties: false
};

const roleLine = (locale: AppLocale) => {
  const resume = getResume(locale);
  return (work: (typeof resume.work)[number]) => ({
    company: work.name,
    position: work.position,
    location: work.location,
    startDate: work.startDate,
    endDate: work.endDate ?? null,
    current: !work.endDate,
    summary: work.summary,
    highlights: work.highlights
  });
};

export const tools: Tool[] = [
  {
    name: 'get_profile',
    description:
      'Who Gabriel Trzimajewski is: name, title, location, contact, summary, and whether he is currently open to roles.',
    inputSchema: localeSchema,
    run: args => {
      const locale = localeArg(args);
      const resume = getResume(locale);
      return {
        name: resume.basics.name,
        title: resume.basics.label,
        location: resume.basics.location,
        email: resume.basics.email,
        summary: resume.basics.summary,
        openToWork: isOpenToWork(resume),
        profiles: resume.basics.profiles,
        website: 'https://snowye.dev'
      };
    }
  },
  {
    name: 'get_resume',
    description:
      'The complete CV as Markdown: roles, dates, achievements, education, skills, languages.',
    inputSchema: localeSchema,
    run: args => renderResumeMarkdown(localeArg(args))
  },
  {
    name: 'get_experience',
    description:
      'Structured work history, most recent first, with employer, position, dates and highlights.',
    inputSchema: localeSchema,
    run: args => {
      const locale = localeArg(args);
      const map = roleLine(locale);
      return rolesByRecency(getResume(locale)).map(map);
    }
  },
  {
    name: 'get_skills',
    description:
      'Technologies: the stack he is applying with, his signature skills, the full known-for set, and the grouped skills from the CV.',
    inputSchema: localeSchema,
    run: args => {
      const locale = localeArg(args);
      return {
        targetStack: [...TARGET_STACK],
        signatureSkills: getSignatureSkills(locale),
        knownFor: getKnownForSet(locale),
        groups: getResume(locale).skills
      };
    }
  },
  {
    name: 'get_projects',
    description:
      'Side projects and open source work, newest year first, with links and descriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        featuredOnly: {
          type: 'boolean',
          description: 'Return only the featured projects. Defaults to false.'
        }
      },
      additionalProperties: false
    },
    run: args =>
      projects
        .map(group => ({
          year: group.year,
          projects: group.projects
            .filter(project => (args.featuredOnly ? project.featured : true))
            .map(({ id: _id, iconName: _icon, ...project }) => project)
        }))
        .filter(group => group.projects.length > 0)
  },
  {
    name: 'search_resume',
    description:
      'Full-text search across the CV. Returns the matching sentences with the role they belong to — use it to answer "has he worked with X?".',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Technology, company, or phrase.'
        },
        locale: { type: 'string', enum: [...routing.locales] }
      },
      required: ['query'],
      additionalProperties: false
    },
    run: args => {
      const locale = localeArg(args);
      const query = String(args.query ?? '')
        .trim()
        .toLowerCase();
      if (!query) return { query, matches: [] };

      const resume = getResume(locale);
      const matches: { source: string; text: string }[] = [];

      const push = (source: string, text?: string) => {
        if (text?.toLowerCase().includes(query)) matches.push({ source, text });
      };

      push('summary', resume.basics.summary);
      for (const work of rolesByRecency(resume)) {
        const source = `${work.position} @ ${work.name}`;
        push(source, work.summary);
        for (const highlight of work.highlights) push(source, highlight);
      }
      for (const group of resume.skills) {
        const hit = group.keywords.filter(keyword =>
          keyword.toLowerCase().includes(query)
        );
        if (hit.length > 0)
          matches.push({
            source: `skills: ${group.name}`,
            text: hit.join(', ')
          });
      }

      return { query, count: matches.length, matches };
    }
  },
  {
    name: 'get_contact',
    description:
      'How to reach Gabriel: email, social profiles, and his booking link.',
    inputSchema: localeSchema,
    run: args => {
      const resume = getResume(localeArg(args));
      return {
        email: resume.basics.email,
        profiles: resume.basics.profiles,
        bookingUrl: 'https://cal.com/trzimajewski',
        openToWork: isOpenToWork(resume)
      };
    }
  }
];

export const toolByName = new Map(tools.map(tool => [tool.name, tool]));
