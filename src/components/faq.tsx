import { ChevronRight } from 'lucide-react';
import { Section } from '@/components/shell/section';
import { getT } from '@/i18n/server-t';

/**
 * Visible Q&A + matching FAQPage schema.
 *
 * Both halves matter: schema without visible text is ignored (and can be
 * flagged as spam), and visible text without schema is not reliably parsed
 * as Q&A by Gemini/AI Overviews. The answers sit in closed <details>, so they
 * ship in the HTML while a human sees only the questions.
 */
export const Faq = async () => {
  const t = await getT();
  const faq = t.pages.about.faq;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  return (
    <Section title={faq.title}>
      <div className="-mt-3 divide-y divide-white/[0.06]">
        {faq.items.map(item => (
          <details key={item.question} className="group py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-primary transition-opacity hover:opacity-80 [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronRight
                aria-hidden
                className="size-4 shrink-0 text-secondary transition-transform duration-200 group-open:rotate-90"
              />
            </summary>
            <p className="mt-3 max-w-2xl">{item.answer}</p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Section>
  );
};
