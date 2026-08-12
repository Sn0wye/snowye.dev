import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Base } from '@/components/base';
import { type AppLocale, routing } from '@/i18n/routing';
import { getT } from '@/i18n/server-t';
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

function Code({ children }: { children: string }) {
  return (
    <pre className="my-4 overflow-x-auto rounded-md border border-white/10 bg-white/5 p-4 text-sm leading-6">
      <code>{children}</code>
    </pre>
  );
}

export default async function Mcp({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getT();

  return (
    <Base
      tagline={t.pages.mcp.tagline}
      title={t.pages.mcp.title}
      primaryColor="purple"
      secondaryColor="cyan"
    >
      <p dangerouslySetInnerHTML={{ __html: t.pages.mcp.description }} />

      <h2>{t.pages.mcp.connect}</h2>
      <p>{t.pages.mcp.connectDescription}</p>
      <Code>{CLIENT_CONFIG}</Code>

      <h2>{t.pages.mcp.discovery}</h2>
      <p>{t.pages.mcp.discoveryDescription}</p>
      <ul>
        <li>
          <a href="/.well-known/mcp.json">/.well-known/mcp.json</a>
        </li>
        <li>
          <a href="/api/mcp">/api/mcp</a> (GET)
        </li>
        <li>
          <a href="/llms.txt">/llms.txt</a>
        </li>
      </ul>

      <h2>{t.pages.mcp.tools}</h2>
      <p>{t.pages.mcp.toolsDescription}</p>
      <dl>
        {tools.map(tool => (
          <div key={tool.name} className="my-3">
            <dt>
              <code className="text-primary">{tool.name}</code>
            </dt>
            <dd className="text-secondary">{tool.description}</dd>
          </div>
        ))}
      </dl>

      <h2>{t.pages.mcp.tryIt}</h2>
      <p>{t.pages.mcp.tryItDescription}</p>
      <Code>{CURL}</Code>

      <h2>{t.pages.mcp.alsoFor}</h2>
      <p dangerouslySetInnerHTML={{ __html: t.pages.mcp.alsoForDescription }} />
    </Base>
  );
}
