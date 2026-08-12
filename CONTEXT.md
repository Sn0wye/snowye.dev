# Context

Glossary for snowye.dev. Terms only — no implementation details, no specs.

## Audience

**Searcher** — someone who typed "Gabriel Trzimajewski" into a search engine and landed here. May be a recruiter, a colleague, a conference organiser, or a stranger. Wants to know *who this is*.

**Evaluator** — someone already considering Gabriel for a role. Wants evidence: metrics, scope, stack, availability. Arrives via a link he sent, not via search.

## Surfaces

**Identity Page** — the durable, personality-carrying surface aimed at the Searcher. Optimised to be the canonical result for the name. Must stay true for years without edits; contains nothing time-sensitive.

**CV Page** — the facts surface, aimed at the Evaluator *and* at the Answer Engine. Carries the full résumé: metrics, stack, seniority claim, availability. Explicitly allowed to be time-sensitive. Optimised for citation first and reading second — but it must never stop being readable by a human.

**Answer Engine** — an LLM-backed search or assistant answering "who is Gabriel Trzimajewski?". A first-class audience for the CV Page, not an afterthought. It rewards completeness, unambiguous phrasing, explicit dates and employers, and semantic HTML; it is defeated by content that only exists after JavaScript runs. Every fact must therefore be present in the served HTML.

**Availability** — current openness to work. Lives in exactly one place (the CV Page), never on the Identity Page, because it goes stale the day a contract is signed.

**Voice** — grammatical person, chosen per surface. The Identity Page speaks in **first person** ("I build…") because it is Gabriel talking to a Searcher. The CV Page speaks in **third person** ("Gabriel Trzimajewski worked as…") because an Answer Engine can quote a self-contained third-person sentence but must guess at "I".

## Identity claims

**Résumé Source** — `documents/backend-{locale}.yml`. The single authoritative record of roles, dates, highlights, skills, and education. Any other CV-shaped file in the repo is a copy and is wrong by default. It is shared with other tooling outside this repo, so the website is a **read-only consumer**: its shape is fixed, and the site adapts to it. Anything the site needs but the file does not express must be *derived* from the existing content, never added to it.

**Signature Skills** — the ~15 terms the site presents to humans as what Gabriel is known for. The **Target Stack** is pinned to the front in its declared order; the remaining slots are earned by derived score — skill keywords ranked by how often they occur in the Résumé Source prose, weighted so recent roles and the summary count for more, ties breaking toward the more recent role.

**Target Stack** — the technologies Gabriel is currently applying for roles with: Java, Spring Boot, Node.js, React, C#/.NET. Site-owned, not in the Résumé Source, because it records what he wants to be *hired for* rather than what he *did*. The two deliberately disagree: React and C#/.NET rank 38th and 23rd by frequency but lead most target job specs. Revisited when the job search changes.

**Known-For Set** — the machine-readable counterpart to Signature Skills, published as JSON-LD `knowsAbout`. Not shown to humans, so it favours breadth (every keyword with real support in the prose) over the curated fifteen.

**Positioning** — *Senior Backend Software Engineer*. Backend is the role being sold; full-stack work is real history and is welcome, but it is texture, never the headline. Full-stack roles are accepted, so the site must not read as backend-exclusive.

**Allocation** — Gabriel was employed by K2 Partnering Solutions and allocated to Bradesco. "Where he worked" (Bradesco) and "who employed him" (K2) are distinct facts and must not be collapsed into one. The engagement ended June 2026, so both are past tense and no current employer is named anywhere on the site.

**Between roles** — the current state: no active engagement, actively looking. Every "Present"/current-employer construct on the site is therefore a factual error until fixed.

**Open Signal** — a calm "open to roles" line on the Identity Page. Derived, never hand-set: it appears when the most recent role in the Résumé Source has an end date in the past, and vanishes when a new role is added. It states openness, not urgency — "available immediately" is Evaluator voice and belongs on the CV Page.

