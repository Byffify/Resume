export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="access">
      <h1>Could not load the website</h1>
      <p>Please try again in a moment.</p>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
