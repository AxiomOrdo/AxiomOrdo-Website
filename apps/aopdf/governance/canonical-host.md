# AO-PDF canonical host

The canonical public origin is `https://www.axiomordo.com`.

Repository routing redirects apex-host requests to the equivalent `www` URL before
path redirects or rewrites. The redirect preserves the request path, trailing slash,
and query string. AO-PDF HTML and its JavaScript, CSS, font, image, and worker assets
must therefore remain on the `www` origin under the existing self-only Content
Security Policy.

The alternate apex host is not an additional application-asset origin and must not
be added to the AO-PDF Content Security Policy.
