import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';
import type { AppLocale } from '@/i18n/routing';

/**
 * The résumé YAML under `documents/` is the single source of truth for facts
 * (ADR-0001). It is shared with tooling outside this repo, so this module is a
 * read-only consumer: the schema below describes the file, never dictates it.
 *
 * Anything the site needs that the file does not state must be *derived* here.
 */

const profileSchema = z.object({
  network: z.string(),
  username: z.string(),
  url: z.url()
});

const workSchema = z.object({
  name: z.string(),
  position: z.string(),
  location: z.string().optional(),
  url: z.url().optional(),
  /** Month precision: `YYYY-MM`. */
  startDate: z.string().regex(/^\d{4}-\d{2}$/),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([])
});

const educationSchema = z.object({
  institution: z.string(),
  area: z.string(),
  studyType: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  score: z.string().optional(),
  courses: z.array(z.string()).default([])
});

const resumeSchema = z.object({
  meta: z.object({
    locale: z.string(),
    present_label: z.string(),
    section_titles: z.record(z.string(), z.string())
  }),
  basics: z.object({
    name: z.string(),
    label: z.string(),
    email: z.email(),
    phone: z.string().optional(),
    location: z.object({
      city: z.string(),
      region: z.string(),
      countryCode: z.string()
    }),
    summary: z.string(),
    profiles: z.array(profileSchema).default([])
  }),
  work: z.array(workSchema).min(1),
  education: z.array(educationSchema).default([]),
  skills: z
    .array(z.object({ name: z.string(), keywords: z.array(z.string()) }))
    .default([]),
  languages: z
    .array(z.object({ language: z.string(), fluency: z.string() }))
    .default([])
});

export type Resume = z.infer<typeof resumeSchema>;
export type Work = z.infer<typeof workSchema>;

const SOURCE_BY_LOCALE: Record<AppLocale, string> = {
  en: 'backend-en.yml',
  pt: 'backend-pt.yml'
};

const cache = new Map<AppLocale, Resume>();

/**
 * Parses and validates the résumé for a locale. Throws — and so fails the
 * build — if the file drifts from the schema, which is the point.
 */
export const getResume = (locale: AppLocale): Resume => {
  const cached = cache.get(locale);
  if (cached) return cached;

  const path = join(process.cwd(), 'documents', SOURCE_BY_LOCALE[locale]);
  const result = resumeSchema.safeParse(parse(readFileSync(path, 'utf8')));

  if (!result.success) {
    throw new Error(
      `Invalid résumé source ${SOURCE_BY_LOCALE[locale]}:\n${z.prettifyError(result.error)}`
    );
  }

  cache.set(locale, result.data);
  return result.data;
};
