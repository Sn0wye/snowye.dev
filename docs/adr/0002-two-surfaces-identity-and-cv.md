# 2. Split the site into an Identity Page and a CV Page

Date: 2026-08-11

## Status

Accepted

## Context

The site had one job description ("personal website") but two incompatible audiences.

A **Searcher** googles the name and wants to know who this person is. They want voice, personality, a face, and a reason to keep reading. Metrics like "reduced MTTR across a 5-engineer team" actively repel them.

An **Evaluator**, and increasingly an **Answer Engine** summarising the name, wants the opposite: complete, unambiguous, dated facts with employers spelled out, and no personality in the way.

Serving both from `/about` produced a page that did neither well, and left `/about` and any future `/cv` with roughly 80% duplicate content — which splits ranking signals for exactly the query the site exists to win.

## Decision

Two surfaces, with a strict division of labour.

The **Identity Page** (`/`, `/about`) speaks in first person and carries voice: bio, pronunciation, personality, a derived Signature Skills strip, a minimal company-and-years timeline, and the derived Open Signal. It carries nothing time-sensitive beyond that signal.

The **CV Page** (`/cv`) speaks in third person and carries the complete résumé, rendered from the Résumé Source. It is optimised for citation by an Answer Engine first and human reading second, and is allowed to be time-sensitive.

Every fact on the CV Page ships in the served HTML. Long bullet lists are progressively disclosed with CSS only, never by conditional rendering, so that crawlers see all of it while humans see a clean page.

The CV Page is a page. There is no PDF.

## Consequences

Each surface can be written in its own voice without compromise, and neither has to apologise for the other. The duplicate-content problem disappears because career detail exists in exactly one place.

Third-person prose on `/cv` will read oddly to Gabriel, who wrote the underlying bullets in first person. This is deliberate: it is written to be quoted, not to be spoken.

The Open Signal, JSON-LD, Signature Skills, and the machine-readable twins are all pure functions of the Résumé Source, so neither surface accumulates hand-maintained state that can go stale — which is the failure this repo already suffered, shipping "Present" for a role that ended two months earlier.

Two surfaces mean two sets of copy in two locales. The Identity Page's voice content cannot be machine-translated from the CV, so Portuguese prose is a real ongoing cost.
