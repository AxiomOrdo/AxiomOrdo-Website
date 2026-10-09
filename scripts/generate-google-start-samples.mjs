import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(repositoryRoot, "public", "samples");

function escapePdfText(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function createPdf({ title, heading, reference, description }) {
  const textLines = [
    "SYNTHETIC DEMONSTRATION DOCUMENT",
    heading,
    `Fictional project reference: ${reference}`,
    description,
    "This file contains no customer, project or regulatory submission data.",
    "Use it with the second sample in AO-PDF to create a two-page merged file.",
  ];
  const operators = ["BT", "/F1 11 Tf", "54 760 Td"];
  textLines.forEach((line, index) => {
    if (index > 0) operators.push("0 -28 Td");
    operators.push(`(${escapePdfText(line)}) Tj`);
  });
  operators.push("ET");
  const stream = `${operators.join("\n")}\n`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}endstream`,
    `<< /Title (${escapePdfText(title)}) /Author (AxiomOrdo Ltd) /Subject (Synthetic AO-PDF demonstration source) /Creator (AxiomOrdo deterministic sample generator) >>`,
  ];

  let pdf = "%PDF-1.4\n%AXIO\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "ascii"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 6 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, "ascii");
}

const samples = [
  {
    filename: "axiomordo-synthetic-source-a.pdf",
    title: "Synthetic Gateway 2 Source A",
    heading: "Gateway 2 evidence register - source A",
    reference: "AO-DEMO-001",
    description: "Illustrative fire strategy evidence record for public product testing.",
  },
  {
    filename: "axiomordo-synthetic-source-b.pdf",
    title: "Synthetic Gateway 2 Source B",
    heading: "Gateway 2 design decision note - source B",
    reference: "AO-DEMO-002",
    description: "Illustrative structural design decision for public product testing.",
  },
];

mkdirSync(outputDirectory, { recursive: true });
for (const sample of samples) {
  writeFileSync(join(outputDirectory, sample.filename), createPdf(sample));
}

console.log(`generate-google-start-samples: generated ${samples.length} deterministic PDFs`);
