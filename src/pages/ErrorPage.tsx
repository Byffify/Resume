import { Button } from "../components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="access">
      <h1>Could not load the website</h1>
      <p>Please try again in a moment.</p>
      <div className="access-actions">
        <Button onClick={reset}>Try again</Button>
        <a href="/">Back to website</a>
      </div>
    </main>
  );
}
