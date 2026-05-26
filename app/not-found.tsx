export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-text">
      <div className="max-w-md text-center">
        <p className="font-mono text-sm text-muted">404</p>
        <h1 className="mt-4 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          This route is not part of the MatchRoom demo surface.
        </p>
      </div>
    </main>
  );
}
