import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
const config=JSON.parse(readFileSync('vercel.json','utf8'));
const mapping={"/meriden/psc-checklist": "/resources/psc-self-inspection-checklist", "/meriden/ai-readiness-pilot": "/ai-readiness-pilot", "/meriden-compliance/insights": "/insights", "/meriden-compliance/insights/maritime-qhse": "/insights/maritime-qhse", "/meriden-compliance/insights/maritime-qhse/false-assurance-maritime-compliance": "/insights/maritime-qhse/false-assurance-maritime-compliance", "/meriden-compliance/insights/maritime-qhse/why-work-should-not-start-just-because-the-permit-is-approved": "/insights/maritime-qhse/why-work-should-not-start-just-because-the-permit-is-approved"};
test('six verified Meriden route pairs permanently redirect to exact canonical successors',()=>{
for(const [source,dest] of Object.entries(mapping))for(const suffix of ['', '/']){
const r=config.redirects.find(r=>r.source===source+suffix);
assert.equal(r?.destination,'https://www.meridencompliance.com'+dest);
assert.equal(r?.permanent,true);
}
assert.ok(!config.redirects.some(r=>r.source==='/meriden/:path*'||r.source==='/meriden-compliance/:path*'));
});
test('migrated canonical paths are absent from generated group sitemap',()=>{
const sitemap=readFileSync('public/sitemap.xml','utf8');
for(const source of Object.keys(mapping))assert.ok(!sitemap.includes('https://www.axiomordo.com'+source+'</loc>'));
});
test('no store checkout routes are redirected and host canonical rules remain first',()=>{
assert.ok(!config.redirects.some(r=>r.source.startsWith('/products/')));
const canonical=config.redirects.findIndex(r=>r.has?.some(h=>h.value==='axiomordo.com'));
const migration=config.redirects.findIndex(r=>r.source==='/meriden/psc-checklist');
assert.ok(canonical>=0&&canonical<migration);
});
