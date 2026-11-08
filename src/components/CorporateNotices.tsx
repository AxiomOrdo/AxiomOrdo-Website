import { Fragment } from "react";
import { Link } from "react-router-dom";
import corporate from "../lib/corporate-notices.json";

export const company = corporate.company;
export const corporateNotices = corporate.notices;

export function CompanyIdentity() {
  return <div className="space-y-2 text-sm text-white/70">
    <p>{company.legalName} · Registered in {company.jurisdiction} · Company number <a className="underline" href={company.companyRegisterUrl}>{company.companyNumber}</a></p>
    {company.registeredOffice && <p>Registered office: {company.registeredOffice}</p>}
    <p>Contact: <a className="underline" href={`mailto:${company.contactEmail}`}>{company.contactEmail}</a></p>
    {company.vatNumber && <p>VAT number: {company.vatNumber}</p>}
  </div>;
}

export function CorporatePolicyLinks() {
  return <nav aria-label="Corporate policies" className="flex flex-wrap gap-5 text-sm text-white/80">
    {corporateNotices.map((notice) => <Link key={notice.slug} className="underline" to={`/legal/${notice.slug}`}>{notice.slug === "terms" ? "Website terms" : notice.slug.charAt(0).toUpperCase() + notice.slug.slice(1)}</Link>)}
  </nav>;
}

function NoticeParagraph({ text }: { text: string }) {
  return <p className="mt-4 leading-7 text-slate-200">{text.split(/(https:\/\/ico\.org\.uk\/make-a-complaint\/|\/(?:da\/(?:privacy|cookies|terms|accessibility)|ao-pdf\/(?:privacy|terms)\/))/g).map((part, index) =>
    part.startsWith("/") || part.startsWith("https://")
      ? <a key={index} className="text-cyan-200 underline" href={part}>{part}</a>
      : <Fragment key={index}>{part}</Fragment>)}
  </p>;
}

export function CorporateNoticeContent({ slug }: { slug: string }) {
  const notice = corporateNotices.find((item) => item.slug === slug)!;
  return <main id="main-content" className="mx-auto max-w-4xl px-6 py-16">
    <p className="text-sm text-slate-300">Corporate website · Effective {corporate.effectiveDate}</p>
    <h1 className="mt-4 text-4xl font-semibold">{notice.title}</h1>
    <p className="mt-5 text-lg text-slate-300">{notice.description}</p>
    {notice.sections.map((section) => <section key={section.heading} className="mt-10">
      <h2 className="text-2xl font-semibold">{section.heading}</h2>
      {section.paragraphs.map((paragraph) => <NoticeParagraph key={paragraph} text={paragraph} />)}
    </section>)}
    <aside aria-label="Product notices" className="mt-12 border-t border-white/20 pt-6">
      <p className="font-semibold">Document Assurance trial notices</p>
      <div className="mt-3 flex flex-wrap gap-5">{["privacy", "cookies", "terms", "accessibility"].map((item) => <a key={item} className="text-cyan-200 underline" href={`/da/${item}`}>Trial {item}</a>)}</div>
    </aside>
  </main>;
}
