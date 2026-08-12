#!/usr/bin/env python3
"""Fail-closed independent-reader checks for a generated redacted PDF."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import pypdf
from pypdf import PdfReader


PINNED_PYPDF_VERSION = "6.15.0"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--expected-pages", type=int, required=True)
    parser.add_argument("--forbidden-text", required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if pypdf.__version__ != PINNED_PYPDF_VERSION:
        raise RuntimeError(
            f"Expected pypdf {PINNED_PYPDF_VERSION}, found {pypdf.__version__}"
        )

    raw = args.pdf.read_bytes()
    reader = PdfReader(args.pdf, strict=True)
    root = reader.trailer["/Root"]
    names = root.get("/Names")
    embedded_files = names.get("/EmbeddedFiles") if names else None
    extracted_text = "".join(page.extract_text() or "" for page in reader.pages)

    image_counts: list[int] = []
    has_font_resources = False
    has_annotations = False
    for page in reader.pages:
        image_counts.append(len(page.images))
        resources = page.get("/Resources") or {}
        has_font_resources = has_font_resources or bool(resources.get("/Font"))
        has_annotations = has_annotations or bool(page.get("/Annots"))

    assertions = {
        "reopened_strictly": True,
        "expected_page_count": len(reader.pages) == args.expected_pages,
        "zero_extractable_text": extracted_text.strip() == "",
        "no_attachments": not bool(reader.attachments),
        "no_embedded_file_name_tree": embedded_files is None,
        "no_acroform": root.get("/AcroForm") is None,
        "no_xfa": b"/XFA" not in raw,
        "no_annotations": not has_annotations,
        "not_encrypted": not reader.is_encrypted and b"/Encrypt" not in raw,
        "image_on_every_page": bool(image_counts) and all(count >= 1 for count in image_counts),
        "no_page_font_resources": not has_font_resources,
        "one_eof_marker": raw.count(b"%%EOF") == 1,
        "terminal_eof_marker": raw.rstrip().endswith(b"%%EOF"),
        "no_incremental_prev_pointer": b"/Prev" not in raw,
        "source_marker_absent": args.forbidden_text.encode("utf-8") not in raw,
    }
    failed = [name for name, passed in assertions.items() if not passed]
    result = {
        "schema": "aopdf.independent-reader-evidence.v1",
        "reader": f"pypdf {pypdf.__version__}",
        "passed": not failed,
        "assertions": assertions,
        "page_count": len(reader.pages),
        "image_counts": image_counts,
        "limitations": [
            "These checks cover this generated fixture, not universal irrecoverability.",
            "They do not assess whether user-selected rectangles are substantively sufficient.",
            "Raster reconstruction does not preserve source accessibility or document structures.",
        ],
    }
    print(json.dumps(result, sort_keys=True))
    if failed:
        raise AssertionError(f"Independent reader assertions failed: {', '.join(failed)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
