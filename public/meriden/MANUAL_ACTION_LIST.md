# Meriden PSC lead magnet — manual action list

## Critical before traffic

1. Create the Formspree form.
   - Notification email: `phil@axiomordo.com`
   - Copy the form ID.
   - Replace `REPLACE_WITH_FORMSPREE_ID` in `public/meriden/index.html`.

2. Upload the final PDF binary.
   - Target path: `public/meriden/PSC_Self_Inspection_Checklist.pdf`
   - The GitHub connector used for this packet can write UTF-8 text files, but not binary PDF/PNG assets.
   - Until the PDF is uploaded, the landing page points users to `/meriden/checklist.html` after form submission.

3. Upload the PNG Open Graph image if required.
   - Target path: `public/meriden/og-image.png`
   - A fallback SVG exists at `/meriden/og-image.svg`.
   - Many social platforms prefer PNG, so use the PNG from the launch pack when you can.

4. Fix Shopify policy/legal text.
   - Replace `meridan-compliance@axiomordo.com`.
   - Use either `phil@axiomordo.com` or create `meriden-compliance@axiomordo.com` first.
   - Replace `AxiomOrdo Group Ltd` with the correct legal entity.

5. Remove default Shopify copy.
   - Replace `Welcome to our store` with:
   - `Digital compliance tools for maritime QHSE, ISM, MLC, PSC readiness, and governed AI adoption.`

6. Test the complete funnel.
   - `/meriden/`
   - form submission
   - Formspree notification
   - checklist access
   - PSC product link
   - mobile view

## Do not do yet

- Do not run paid ads.
- Do not promote unpublished/draft Shopify products.
- Do not claim guaranteed compliance or guaranteed detention avoidance.
- Do not claim legal advice, regulator approval, class approval, or formal validation.
- Do not mass-post to every seafarer group at once.

## Recommended first traffic test

1. Post the LinkedIn launch post from Phil's personal profile.
2. Put the product link in the first comment.
3. Post into one seafarer Facebook group only after checking rules.
4. Send the WhatsApp forwardable to a small trusted maritime circle.
5. Wait 48 hours and review sign-ups before scaling.
