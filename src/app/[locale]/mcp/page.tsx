import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { CodeBlock } from '@/components/shell/code-block';
import { PageShell } from '@/components/shell/page-shell';
import { richText, Section } from '@/components/shell/section';
import { WebPageJsonLd } from '@/components/web-page-json-ld';
import { type AppLocale, routing } from '@/i18n/routing';
import { getT } from '@/i18n/server-t';
import { cn } from '@/lib/cn';
import { MCP_ENDPOINT } from '@/mcp/manifest';
import { tools } from '@/mcp/tools';
import { stripHtml } from '@/utils/stripHtml';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

type PageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getT();
  const description = stripHtml(t.pages.mcp.description);
  const localePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: t.pages.mcp.title,
    description,
    openGraph: { description, url: `${localePath}/mcp` }
  };
}

const CLIENT_CONFIG = `{
  "mcpServers": {
    "snowye": {
      "type": "http",
      "url": "${MCP_ENDPOINT}"
    }
  }
}`;

const CURL = `curl -X POST ${MCP_ENDPOINT} \\
  -H 'content-type: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call",
       "params":{"name":"search_resume",
                 "arguments":{"query":"kafka"}}}'`;

const DISCOVERY = [
  { href: '/.well-known/mcp.json', note: 'JSON' },
  { href: '/api/mcp', note: 'GET' },
  { href: '/llms.txt', note: 'TXT' }
];

export default async function Mcp({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getT();
  const m = t.pages.mcp;

  return (
    <PageShell current="/mcp" title={t.common.navbar.mcp} tagline={m.tagline}>
      <WebPageJsonLd
        locale={locale}
        path="/mcp"
        name={m.title}
        description={stripHtml(m.description)}
      />
      <p
        className={cn('mt-6 max-w-2xl', richText)}
        dangerouslySetInnerHTML={{ __html: m.description }}
      />

      <div className="mt-20">
        <Section title={m.connect}>
          <p>{m.connectDescription}</p>
          <CodeBlock label="client config">{CLIENT_CONFIG}</CodeBlock>
        </Section>

        <Section title={m.discovery}>
          <p>{m.discoveryDescription}</p>
          <ul className="-mx-4 mt-4">
            {DISCOVERY.map(item => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex items-baseline justify-between rounded-xl px-4 py-2.5 transition-colors hover:bg-white/[0.035]"
                >
                  <span className="font-mono text-[14px] text-primary">
                    {item.href}
                  </span>
                  <span className="text-[13px] text-secondary/60">
                    {item.note}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={m.tools}>
          <p>{m.toolsDescription}</p>
          <dl className="mt-6 space-y-5">
            {tools.map(tool => (
              <div key={tool.name}>
                <dt className="font-mono text-[14px] text-primary">
                  {tool.name}
                </dt>
                <dd className="mt-1">{tool.description}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title={m.tryIt}>
          <p>{m.tryItDescription}</p>
          <CodeBlock label="curl command">{CURL}</CodeBlock>
        </Section>

        <Section title={m.alsoFor}>
          <p
            className={richText}
            dangerouslySetInnerHTML={{ __html: m.alsoForDescription }}
          />
        </Section>
      </div>
    </PageShell>
  );
}
