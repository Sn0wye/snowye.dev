import { getT } from '@/i18n/server-t';

/**
 * Visible Q&A + matching FAQPage schema.
 *
 * Both halves matter: schema without visible text is ignored (and can be
 * flagged as spam), and visible text without schema is not reliably parsed
 * as Q&A by Gemini/AI Overviews.
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
    <>
      <h2>{faq.title}</h2>
      <dl>
        {faq.items.map(item => (
          <div key={item.question} style={{ marginBottom: 16 }}>
            <dt>
              <strong>{item.question}</strong>
            </dt>
            <dd style={{ margin: 0 }}>{item.answer}</dd>
          </div>
        ))}
      </dl>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
};
