import assert from 'node:assert/strict';
import test from 'node:test';
import { inlineScriptBodies } from '../apps/aopdf/scripts/inline-scripts.mjs';

test('CSP hashes exclude JSON-LD but retain every executable inline script', () => {
  const html = `<script type="application/ld+json">{"name":"A & B"}</script>
<script TYPE='application/ld+json'>{"name":"Other"}</script>
<script type=application/ld+json>{}</script>
<script>window.executable=true</script><script type="module">import('/local.js')</script>
<script data-note=' type="application/ld+json"'>window.stillExecutable=true</script><script src="/bundle.js"></script>`;
  assert.deepEqual(inlineScriptBodies(html),['window.executable=true',"import('/local.js')",'window.stillExecutable=true']);
});
