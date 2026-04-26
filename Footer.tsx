export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <h2>Ready to get clarity?</h2>
          <p>
            Request a PFAS review today and know exactly where you stand.
            Deterministic, evidence-linked, and built for defensibility.
          </p>
          <div className="hero-actions" style={{ margin: "2rem 0" }}>
            <a className="button button-primary" href="#contact">
              Request PFAS Review
            </a>
          </div>
          <small>
            &copy; {new Date().getFullYear()} AXIOMORDO LTD. All rights reserved.
            <br />
            Company Number: 17179868
            <br />
            Registered Office: 128 City Road, London, EC1V 2NX, UNITED KINGDOM
          </small>
        </div>
      </div>
    </footer>
  );
}
