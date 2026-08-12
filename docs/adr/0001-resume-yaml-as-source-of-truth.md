# 1. Résumé YAML is the source of truth for facts

Date: 2026-08-11

## Status

Accepted

## Context

Résumé facts existed in four places: `documents/backend-{en,pt}.yml`, `documents/cv-{en,pt}.md`, `CV.md` at the repo root, and the site's own `src/data/career.ts` plus `src/locales/*/pages/about.ts`.

They had already drifted. The site called Mercante "Freelance", gave Avalie Mais and Bradesco the wrong titles, omitted the Senior and Backend qualifiers, and printed a GPA of 9.32 against the YAML's 9.18. None of this was noticed because nothing forced the copies to agree.

The site serves two audiences (see `CONTEXT.md`): a Searcher who wants voice and personality, and an Evaluator who wants verifiable facts. A single generated page would flatten the voice; a single hand-written page keeps drifting.

## Decision

`content/resume/backend-{locale}.yml` is the sole source of truth for **facts**: roles, companies, titles, dates, highlights, skills, education, languages. It lives under `content/` rather than `docs/` because it is a build input the site reads, not documentation for people.

The locale files under `src/locales/` retain only **voice**: bio prose, taglines, pronunciation, and navigation copy. They must not restate any fact the YAML owns.

The YAML is parsed and schema-validated at build time. A validation failure fails the build.

`src/data/career.ts`, `CV.md`, and `documents/cv-*.md` are deleted as duplicate records.

## Consequences

Facts can only be changed in one place, and the CV and the website update together. Drift on anything checkable becomes structurally impossible.

The build gains a YAML parse and schema-validation step, and a schema that must be kept in step with the résumé format. Both locale files must stay structurally identical or validation fails — which is the intended pressure, since a missing Portuguese role is a bug.

The YAML is shared with tooling outside this repo, so the site cannot change its shape to suit itself. Anything the site needs beyond what the file states must be derived from existing content — for example, ranking skill keywords by frequency rather than tagging favourites in the file.

Facts cannot be phrased differently on the site than on the CV without changing the CV. This is accepted: divergent phrasing is how the drift started.
