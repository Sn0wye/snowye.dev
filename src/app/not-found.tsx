// Catches any unmatched route outside the [locale] segment.
// next-intl middleware normally rewrites unknown paths into a locale,
// so this is a safety net for static/edge edge-cases.
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#08070b',
            color: '#fafafa',
            fontFamily: 'system-ui, sans-serif'
          }}
        >
          <h1 style={{ fontSize: '2rem', margin: 0 }}>four oh four</h1>
          <p>This page doesn&apos;t exist</p>
          <a
            href="/"
            style={{ marginTop: 16, color: '#9442FE', textDecoration: 'none' }}
          >
            ← Go home
          </a>
        </div>
      </body>
    </html>
  );
}
