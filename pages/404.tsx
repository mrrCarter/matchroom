export default function Custom404() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ maxWidth: 420, padding: 24, textAlign: "center" }}>
        <p style={{ margin: 0, color: "#A9B2C7", fontFamily: "monospace" }}>404</p>
        <h1 style={{ margin: "16px 0 0", color: "#F5F7FB", fontFamily: "sans-serif" }}>
          Page not found
        </h1>
        <p style={{ color: "#A9B2C7", fontFamily: "sans-serif", lineHeight: 1.6 }}>
          This route is not part of the MatchRoom demo surface.
        </p>
      </div>
    </main>
  );
}
