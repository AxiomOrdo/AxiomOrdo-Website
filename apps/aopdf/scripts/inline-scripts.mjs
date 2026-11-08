/** JSON-LD is a data block, not executable JavaScript; do not add it to script-src. */
export function inlineScriptBodies(html) {
  const bodies = [];
  for (const match of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script[^>]*>/gi)) {
    const attributes = new Map();
    for (const attr of (match[1] ?? '').matchAll(/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      const name = attr[1].toLowerCase();
      if (!attributes.has(name)) attributes.set(name, attr[2] ?? attr[3] ?? attr[4] ?? '');
    }
    if (attributes.get('type')?.trim().toLowerCase() === 'application/ld+json') continue;
    if (match[2]) bodies.push(match[2]);
  }
  return bodies;
}
