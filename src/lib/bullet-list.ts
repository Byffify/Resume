export function bulletEdit(
  value: string,
  start: number,
  end: number,
  key: string,
): { value: string; caret: number } | null {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = value.indexOf("\n", end);
  const line = value.slice(lineStart, lineEnd < 0 ? value.length : lineEnd);

  if (key === "-" && start === end && start === lineStart && !line) {
    return {
      value: value.slice(0, start) + "- " + value.slice(end),
      caret: start + 2,
    };
  }

  if (key !== "Enter" || !line.startsWith("- ")) return null;

  if (!line.slice(2).trim() && start === end && start === lineStart + line.length) {
    return {
      value: value.slice(0, lineStart) + value.slice(end),
      caret: lineStart,
    };
  }

  return {
    value: value.slice(0, start) + "\n- " + value.slice(end),
    caret: start + 3,
  };
}
