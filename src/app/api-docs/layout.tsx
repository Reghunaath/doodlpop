export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light" />
        <style>{`
          :root { color-scheme: light only; }
          body { background: white; color: black; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
