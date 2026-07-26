(() => {
  const applyMeridenEarlyAccess = () => {
    if (window.location.pathname !== "/meriden" && window.location.pathname !== "/meriden/") return;

    document.querySelectorAll("a, button").forEach((element) => {
      const label = element.textContent?.trim();
      if (label === "Start Free Trial" || label === "Start Free 30-Day Trial") {
        element.textContent = "Request Early Access";
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

  const observer = new MutationObserver(applyMeridenEarlyAccess);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("DOMContentLoaded", applyMeridenEarlyAccess);
  window.addEventListener("popstate", applyMeridenEarlyAccess);
  applyMeridenEarlyAccess();
})();
