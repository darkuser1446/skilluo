/**
 * Extracts a numeric index from question prompt (e.g. "Q1", "Q19", "[Section A... - Q4]")
 * or falls back to 9999.
 */
export function extractQuestionNumber(prompt: string): number {
  if (!prompt) return 9999;
  const match = prompt.match(/\bQ(?:uestion)?\s*(\d+)\b/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 9999;
}

/**
 * Sorts questions sequentially (Q1, Q2, Q3 ... Q27).
 */
export function sortQuestionsByNumber<T extends { prompt?: string | null }>(questions: T[]): T[] {
  if (!Array.isArray(questions)) return [];
  return [...questions].sort((a, b) => {
    const numA = extractQuestionNumber(a.prompt || "");
    const numB = extractQuestionNumber(b.prompt || "");
    return numA - numB;
  });
}
