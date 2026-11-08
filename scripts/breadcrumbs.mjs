const origin = 'https://www.axiomordo.com';
export const escapeHtml = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function breadcrumbMarkup(items) {
  const schema = {
    '@context':'https://schema.org', '@type':'BreadcrumbList',
    itemListElement: items.map((item,index) => ({'@type':'ListItem',position:index+1,name:item.name,item:new URL(item.path,origin).href})),
  };
  const json = JSON.stringify(schema).replace(/</g,'\\u003c');
  const list = items.map((item,index) => `<li>${index ? '<span aria-hidden="true">›</span>' : ''}${index === items.length-1 ? `<span aria-current="page">${escapeHtml(item.name)}</span>` : `<a href="${escapeHtml(item.path)}">${escapeHtml(item.name)}</a>`}</li>`).join('');
  return `<nav class="site-breadcrumbs" id="crumbs" aria-label="Breadcrumb"><ol>${list}</ol></nav><script type="application/ld+json" data-breadcrumbs>${json}</script>`;
}
export const breadcrumbStyle = `<style data-breadcrumbs>nav.site-breadcrumbs{display:block;position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:20px 24px 0;font-size:14px;color:inherit}nav.site-breadcrumbs ol{display:flex;flex-wrap:wrap;gap:.4rem .6rem;list-style:none;padding:0;margin:0}nav.site-breadcrumbs li{display:flex;align-items:baseline;gap:.6rem;min-width:0;overflow-wrap:anywhere}nav.site-breadcrumbs a{text-decoration:underline;text-underline-offset:3px}nav.site-breadcrumbs a:focus-visible{outline:2px solid currentColor;outline-offset:4px}</style>`;
