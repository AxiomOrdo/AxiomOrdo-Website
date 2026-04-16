:root {
  --bg: #071018;
  --panel: #0f1c27;
  --panel-soft: #233844;
  --ink: #f5f7fa;
  --ink-muted: #b6c3cb;
  --cyan: #78c4e6;
  --cyan-soft: #8ad3f4;
  --accent: #ff8b6a;
  --line: rgba(255, 255, 255, 0.12);
  --card-ink: #091118;
  --max-width: 1180px;
  --radius: 20px;
  --shadow: 0 30px 80px rgba(0, 0, 0, 0.28);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  line-height: 1.5;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
textarea {
  font: inherit;
}

.container {
  width: min(calc(100% - 2rem), var(--max-width));
  margin: 0 auto;
}

.container.narrow {
  width: min(calc(100% - 2rem), 820px);
}

.hero {
  position: relative;
  overflow: hidden;
  padding: 1.2rem 0 6rem;
  background:
    radial-gradient(circle at 50% 15%, rgba(120, 196, 230, 0.28), transparent 24%),
    linear-gradient(180deg, #111b24 0%, #04080d 100%);
}

.hero::after {
  content: "";
  position: absolute;
  inset: auto 0 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(120, 196, 230, 0.55), transparent);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  padding: 0.5rem 0 3rem;
  color: var(--ink-muted);
}

.brand-mark {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(120, 196, 230, 0.08);
  color: var(--cyan-soft);
  font-weight: 800;
}

.brand-name {
  font-weight: 700;
  letter-spacing: 0.02em;
}

.hero-content {
  max-width: 920px;
  margin: 0 auto;
  text-align: center;
}

.eyebrow {
  margin: 0 0 1rem;
  color: var(--cyan-soft);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.78rem;
  font-weight: 800;
}

.hero h1,
.section-heading h2,
.footer h2 {
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.05;
  font-weight: 800;
}

.hero h1 {
  font-size: clamp(2.8rem, 7vw, 5.6rem);
  max-width: 12ch;
  margin: 0 auto;
}

.lead {
  margin: 1.4rem auto 0;
  max-width: 760px;
  font-size: clamp(1.08rem, 2vw, 1.38rem);
  color: var(--ink-muted);
}

.hero-points {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.85rem;
  margin: 2rem 0 0;
}

.hero-points span {
  padding: 0.9rem 1rem;
  border: 1px solid rgba(120, 196, 230, 0.25);
  border-radius: 999px;
  background: rgba(120, 196, 230, 0.08);
  font-weight: 600;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 2.2rem;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0.9rem 1.3rem;
  border: 1px solid transparent;
  border-radius: 999px;
  font-weight: 800;
  transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}

.button:hover {
  transform: translateY(-1px);
}

.button-primary {
  background: var(--accent);
  color: #0f1114;
}

.button-secondary {
  border-color: rgba(120, 196, 230, 0.35);
  background: rgba(255, 255, 255, 0.02);
}

.full-width {
  width: 100%;
}

.problem-strip {
  background: #0b141d;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.problem-strip p {
  margin: 0;
  padding: 1.15rem 0;
  color: var(--ink-muted);
  text-align: center;
  font-size: 1rem;
}

.section {
  padding: 5.5rem 0;
}

.section-dark {
  background: linear-gradient(180deg, #152532, #213544);
}

.section-slate {
  background: #2b4350;
}

.section-light {
  background: #eaf1f5;
  color: #0d1720;
}

.section-black {
  background: linear-gradient(180deg, #111, #171717);
}

.section-heading {
  max-width: 820px;
  margin: 0 auto 2.5rem;
  text-align: center;
}

.section-heading.left {
  text-align: left;
  max-width: none;
}

.section-heading h2 {
  font-size: clamp(2rem, 4.2vw, 3.6rem);
}

.section-heading p {
  margin: 1rem 0 0;
  font-size: 1.08rem;
  color: inherit;
  opacity: 0.8;
}

.card-grid,
.pricing-grid {
  display: grid;
  gap: 1.2rem;
}

.card-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.small-gap {
  gap: 1rem;
}

.trigger-card,
.price-card,
.faq-item {
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.trigger-card {
  padding: 1.4rem;
  background: linear-gradient(180deg, rgba(125, 200, 233, 0.98), rgba(108, 183, 216, 0.95));
  color: var(--card-ink);
  font-weight: 700;
  min-height: 124px;
}

.pricing-grid {
  align-items: stretch;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.price-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.6rem;
  background: linear-gradient(180deg, rgba(125, 200, 233, 0.99), rgba(109, 184, 216, 0.97));
  color: var(--card-ink);
}

.price-card.featured {
  outline: 3px solid rgba(255, 139, 106, 0.7);
  transform: translateY(-8px);
}

.badge {
  align-self: flex-start;
  margin-bottom: 1rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 139, 106, 0.95);
  font-weight: 800;
  font-size: 0.82rem;
}

.price-card h3 {
  margin: 0;
  font-size: 1.8rem;
  line-height: 1.1;
}

.price {
  margin: 1rem 0 0;
  font-size: clamp(2.6rem, 5vw, 4rem);
  line-height: 1;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.card-intro {
  margin: 1rem 0 0;
  color: rgba(9, 17, 24, 0.82);
  font-size: 1.02rem;
}

.check-list {
  margin: 1.2rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.8rem;
}

.check-list li {
  position: relative;
  padding-left: 1.6rem;
}

.check-list li::before {
  content: "✓";
  position: absolute;
  left: 0;
  top: 0;
  font-weight: 900;
}

.best-for {
  margin: 1.3rem 0 1.4rem;
  color: rgba(9, 17, 24, 0.88);
}

.faq-list {
  display: grid;
  gap: 1rem;
}

.faq-item {
  padding: 1.2rem 1.3rem;
  background: #fff;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.08);
}

.faq-item summary {
  cursor: pointer;
  list-style: none;
  font-weight: 800;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item p {
  margin: 0.9rem 0 0;
  color: #33414b;
}

.contact-form {
  display: grid;
  gap: 1rem;
}

.contact-form label {
  display: grid;
  gap: 0.55rem;
  font-weight: 700;
}

.contact-form span {
  color: var(--accent);
}

.contact-form input,
.contact-form textarea {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.96);
  color: #10151a;
  padding: 0.95rem 1rem;
}

.contact-form textarea {
  resize: vertical;
  min-height: 160px;
}

.contact-form button[disabled] {
  opacity: 0.72;
  cursor: wait;
}

.form-message {
  margin: 0.25rem 0 0;
  padding: 0.95rem 1rem;
  border-radius: 14px;
  font-weight: 700;
}

.form-message.success {
  background: rgba(123, 224, 174, 0.14);
  color: #baf0cc;
  border: 1px solid rgba(123, 224, 174, 0.3);
}

.form-message.error {
  background: rgba(255, 139, 106, 0.14);
  color: #ffd5cb;
  border: 1px solid rgba(255, 139, 106, 0.3);
}

.footer {
  padding: 4rem 0;
  background: linear-gradient(180deg, rgba(122, 197, 230, 0.98), rgba(104, 177, 209, 0.94));
  color: #10161c;
}

.footer-inner {
  text-align: center;
}

.footer h2 {
  font-size: clamp(2rem, 4vw, 3.4rem);
}

.footer p {
  max-width: 760px;
  margin: 0.9rem auto 1rem;
  font-size: 1.05rem;
}

.footer small {
  opacity: 0.8;
}

@media (max-width: 980px) {
  .card-grid,
  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .price-card.featured {
    transform: none;
  }
}

@media (max-width: 640px) {
  .hero {
    padding-bottom: 4.25rem;
  }

  .topbar {
    padding-bottom: 2rem;
  }

  .hero-points {
    gap: 0.7rem;
  }

  .hero-points span {
    width: 100%;
    border-radius: 18px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .button,
  .full-width {
    width: 100%;
  }

  .section {
    padding: 4.25rem 0;
  }
}
