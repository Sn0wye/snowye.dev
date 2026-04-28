// The actual <html>/<body> shell lives in `app/[locale]/layout.tsx`
// so it can pick the correct `lang` attribute per locale.
// This root layout is a passthrough required by Next.js.
export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
