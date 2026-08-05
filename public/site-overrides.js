(() => {
  const replaceElementLabelText = (element, nextLabel) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let currentNode = walker.nextNode();

    while (currentNode) {
      if (currentNode.nodeValue?.trim()) {
        textNodes.push(currentNode);
      }
      currentNode = walker.nextNode();
    }

    if (textNodes.length === 0) {
      element.appendChild(document.createTextNode(nextLabel));
      return;
    }

    textNodes[0].nodeValue = nextLabel;
    for (let index = 1; index < textNodes.length; index += 1) {
      textNodes[index].nodeValue = "";
    }
  };

  const applyMeridenEarlyAccess = () => {
    if (window.location.pathname !== "/meriden" && window.location.pathname !== "/meriden/") return;

    document.querySelectorAll("a, button").forEach((element) => {
      const label = element.textContent?.trim();
      if (label === "Start Free Trial" || label === "Start Free 30-Day Trial") {
        replaceElementLabelText(element, "Request Early Access");
        if (element instanceof HTMLAnchorElement) {
          element.href = "mailto:hello@axiomordo.com?subject=Meriden%20Compliance%20Early%20Access";
        }
      }
    });

    document.querySelectorAll("p").forEach((element) => {
      if (element.textContent?.includes("30-day free trial, no credit card required")) {
        element.textContent = "Meriden Compliance is currently accepting early-access enquiries from maritime operators.";
      }
    });
  };

  const addLatestArticleCard = () => {
    const path = window.location.pathname.replace(/\/$/, "");
    if (path !== "/meriden-compliance/insights") return;
    if (document.getElementById("latest-false-assurance-article")) return;

    const hubHeading = Array.from(document.querySelectorAll("h2")).find(
      (heading) => heading.textContent?.trim() === "Maritime AI and Governance"
    );
    const hubSection = hubHeading?.closest("section");
    if (!hubSection?.parentElement) return;

    const section = document.createElement("section");
    section.id = "latest-false-assurance-article";
    section.className = "border-b border-white/8 bg-white/[0.015] py-16 sm:py-20";
    section.innerHTML = `
      <div class="mx-auto max-w-7xl px-5 sm:px-8">
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Latest article</p>
        <a
          href="/meriden-compliance/insights/maritime-qhse/false-assurance-maritime-compliance"
          class="group mt-6 block rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/[0.08] to-white/[0.02] p-7 transition hover:border-cyan-300/45 sm:p-10"
        >
          <div class="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/75">Maritime QHSE · Published 4 August 2026</p>
              <h2 class="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">False Assurance in Maritime Compliance: When Good Records Hide Poor Control</h2>
              <p class="mt-5 max-w-3xl text-base leading-7 text-white/55 sm:text-lg">Why documented controls, certificates, permits, audit scores and green dashboards do not by themselves prove that operational risk is controlled.</p>
            </div>
            <span class="text-sm font-semibold text-cyan-300 transition group-hover:translate-x-1">Read article →</span>
          </div>
        </a>
      </div>
    `;

    hubSection.parentElement.insertBefore(section, hubSection);
  };

  const applyOverrides = () => {
    applyMeridenEarlyAccess();
    addLatestArticleCard();
  };

  const observer = new MutationObserver(applyOverrides);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("DOMContentLoaded", applyOverrides);
  window.addEventListener("popstate", applyOverrides);
  applyOverrides();
})();
