# Meriden website ownership

Meriden Compliance is an AxiomOrdo Ltd brand with its own website and repository:
https://www.meridencompliance.com — AxiomOrdo/MeridenCompliance.

The group website retains `/platforms/meriden` as a brand introduction with links
to Meriden's shop and articles. It does not publish a second Meriden article feed.
The old `/meriden-compliance` and `/insights` routes permanently redirect to the
Meriden website. Retired empty category hubs go to the article index; existing
article slugs and their category paths are preserved. Legacy raw article URLs
are also redirected. The React fallback sends client-side navigation to the
same site instead of rendering a duplicate article.

Historical resource/pilot pages outside the article migration remain available;
they are not the canonical home for new Meriden products or articles. Raw legacy
article files are retained as migration history, with their public URLs redirected.
AxiomOrdo's `apps/meriden` engine is separate technical work and is not migrated.

Validate routing and the brand introduction with:

    npm run build:site
    node --test tests/meriden-consolidation.test.mjs

Deploy the Meriden website before publishing these redirects. Verify each target
on the public domain before promoting the group-site change. Local route tests
validate the configuration; they do not prove deployed Vercel routing.
