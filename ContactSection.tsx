import Image from "next/image";

export function HeroSection() {
  return (
    <section className="hero">
      <div className="container">
        <div className="topbar">
          <Image
            src="/logo.png"
            alt="AxiomOrdo logo"
            width={32}
            height={32}
          />
          <div className="brand-name">AxiomOrdo</div>
        </div>

        <div className="hero-content">
          <p className="eyebrow">PFAS Review</p>
          <h1>Know where you stand on PFAS — before you&apos;re asked.</h1>
          <p className="lead">
            AxiomOrdo gives you a defensible position across your products:
            what&apos;s exposed, what&apos;s unsupported, and what you cannot safely
            stand behind yet.
          </p>

          <div className="hero-points">
            <span>Where are we exposed?</span>
            <span>What can we actually defend?</span>
            <span>What is missing to support market access?</span>
          </div>

          <div className="hero-actions">
            <a className="button button-primary" href="#contact">
              Request PFAS Review
            </a>
            <a className="button button-secondary" href="#packages">
              See Packages
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
