export function parseMedianPrice(html: string): string | null {
  const match = html.match(/Med\.\s*Price:\s*<a\b[^>]*>\s*([^<]+?)\s*<\/a>/i)
    || html.match(/Med\.\s*Price:\s*([^<\n]+)/i);
  return match ? match[1].trim() : null;
}
