import { faqs } from "./site-content";

export function FaqSection() {
  return (
    <section className="section section-light">
      <div className="container narrow">
        <div className="section-heading">
          <p className="eyebrow">FAQ</p>
          <h2>What buyers normally need clarified</h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq) => (
            <details className="faq-item" key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
