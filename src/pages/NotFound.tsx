export default function NotFound() {
  return (
    <main className="access">
      <span className="eyebrow">404 / NOT FOUND</span>
      <h1>Page not found</h1>
      <p>This page may not be published, or it may have been removed.</p>
      <div className="access-actions">
        <a className="button-link" href="/">Back to website</a>
        <a href="/notes">Explore notes</a>
      </div>
    </main>
  );
}
