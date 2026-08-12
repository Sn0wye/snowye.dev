import type { AppLocale } from '@/i18n/routing';
import { getResume, type Resume, type Work } from './resume';
import { TARGET_STACK } from './target-stack';

/**
 * Everything the site needs that the Résumé Source does not state outright.
 * All of it is a pure function of the source, so none of it can go stale
 * (ADR-0001, ADR-0002).
 */

/** `2026-06` → last instant of June 2026. Month precision is all the source has. */
export const parseMonth = (value: string, endOfMonth = false): Date => {
  const [year, month] = value.split('-').map(Number);
  return endOfMonth
    ? new Date(year, month, 0, 23, 59, 59)
    : new Date(year, month - 1, 1);
};

export const roleStart = (work: Work) => parseMonth(work.startDate);
export const roleEnd = (work: Work) =>
  work.endDate ? parseMonth(work.endDate, true) : undefined;

/** Roles newest-first, regardless of how the source happens to be ordered. */
export const rolesByRecency = (resume: Resume): Work[] =>
  [...resume.work].sort(
    (a, b) => roleStart(b).getTime() - roleStart(a).getTime()
  );

/**
 * The Open Signal: true when the most recent role has already ended.
 * Derived, never hand-set — it disappears by itself the moment a new role is
 * added to the Résumé Source.
 */
export const isOpenToWork = (resume: Resume, now = new Date()): boolean => {
  const latest = rolesByRecency(resume)[0];
  if (!latest) return true;
  const end = roleEnd(latest);
  return end !== undefined && end.getTime() < now.getTime();
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Counts whole-word occurrences, so `SQL` does not match inside `PostgreSQL`
 * and `Git` does not match inside `GitHub`.
 */
const countOccurrences = (haystack: string, needle: string): number => {
  const pattern = new RegExp(
    `(?<![a-z0-9])${escapeRegExp(needle.toLowerCase())}(?![a-z])`,
    'g'
  );
  return (haystack.match(pattern) ?? []).length;
};

/** The curated summary steers the ranking, so it counts for more. */
const SUMMARY_WEIGHT = 3;
/** Recent roles outrank old ones; the oldest role still counts, just less. */
const RECENCY_WEIGHT = [1.6, 1.3, 1.1, 1] as const;

type ScoredSkill = { keyword: string; score: number; recency: number };

const scoreSkills = (resume: Resume): ScoredSkill[] => {
  const ordered = rolesByRecency(resume);
  const keywords = [...new Set(resume.skills.flatMap(group => group.keywords))];
  const summary = resume.basics.summary.toLowerCase();

  const roleText = ordered.map(work =>
    [work.summary ?? '', ...work.highlights].join(' ').toLowerCase()
  );

  return keywords
    .map(keyword => {
      let score = countOccurrences(summary, keyword) * SUMMARY_WEIGHT;
      // Ties break toward the more recent role.
      let recency = Number.POSITIVE_INFINITY;

      roleText.forEach((text, index) => {
        const hits = countOccurrences(text, keyword);
        if (hits === 0) return;
        score += hits * (RECENCY_WEIGHT[index] ?? 1);
        recency = Math.min(recency, index);
      });

      if (countOccurrences(summary, keyword) > 0)
        recency = Math.min(recency, 0);

      return { keyword, score, recency };
    })
    .filter(skill => skill.score > 0)
    .sort((a, b) => b.score - a.score || a.recency - b.recency);
};

/**
 * ~15 terms shown to humans as what Gabriel is known for.
 *
 * The Target Stack is pinned to the front in its declared order, because the
 * page must lead with what the roles he wants actually ask for. The remaining
 * slots are earned on derived score, so the tail stays honest and automatic.
 */
export const getSignatureSkills = (locale: AppLocale, limit = 15): string[] => {
  const pinned: string[] = [...TARGET_STACK];
  const isPinned = (keyword: string) =>
    pinned.some(
      entry =>
        entry.toLowerCase() === keyword.toLowerCase() ||
        entry.toLowerCase().split('/').includes(keyword.toLowerCase())
    );

  const earned = scoreSkills(getResume(locale))
    .map(skill => skill.keyword)
    .filter(keyword => !isPinned(keyword));

  return [...pinned, ...earned].slice(0, limit);
};

/**
 * The Known-For Set published as JSON-LD `knowsAbout`. Not shown to humans, so
 * it favours breadth: every keyword with real support in the prose.
 */
export const getKnownForSet = (locale: AppLocale): string[] =>
  scoreSkills(getResume(locale)).map(skill => skill.keyword);
