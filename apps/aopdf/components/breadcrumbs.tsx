export interface BreadcrumbItem { name: string; path: string }

/** Server-render the navigation and JSON-LD from the same authored trail. */
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const trail = [{ name: 'Home', path: '/' }, ...items];
  const schema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name,
      item: new URL(item.path, 'https://www.axiomordo.com').href,
    })),
  };
  return <>
    <nav className="aopdf-breadcrumbs" aria-label="Breadcrumb">
      <ol>{trail.map((item, index) => <li key={item.path}>
        {index > 0 && <span aria-hidden="true">›</span>}
        {index === trail.length - 1
          ? <span aria-current="page">{item.name}</span>
          : <a href={item.path}>{item.name}</a>}
      </li>)}</ol>
    </nav>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
  </>;
}
