# Independent redaction-reader evidence

The focused evidence test processes a text-bearing PDF through the real
browser-local redaction workflow, saves `redacted.pdf` from the downloaded ZIP,
and passes that PDF to a separately installed `pypdf` reader. The verifier fails
closed if the pinned reader is unavailable or any expected assertion fails.

From `apps/aopdf`, create an isolated reader environment and run the test:

```sh
python3 -m venv /tmp/aopdf-pypdf-6.15.0
/tmp/aopdf-pypdf-6.15.0/bin/python -m pip install \
  --require-hashes -r tests/evidence/requirements.txt
AOPDF_PYPDF_PYTHON=/tmp/aopdf-pypdf-6.15.0/bin/python \
  npm run test:reader-evidence
```

The tested export must reopen strictly and report all assertions as `true`:

- expected page count;
- zero extractable text;
- no attachments or embedded-file name tree;
- no AcroForm, XFA, page annotations, or encryption;
- at least one image per page and no page font resources;
- exactly one terminal `%%EOF` marker and no incremental `/Prev` pointer;
- no supplied source-text marker in the output bytes.

This is reproducible evidence for the generated test fixture. It is not proof of
universal irrecoverability, rectangle sufficiency, legal admissibility, or
preservation of the source document's accessibility or structure.
