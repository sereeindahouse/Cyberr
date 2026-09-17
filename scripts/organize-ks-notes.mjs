import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "client", "src", "data", "ksKnowledge.ts");
const outputRoot = path.join(root, "KS-organized");
const apiUrl = (process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1").replace(/\/+$/, "");
const apiKey = process.env.OPENROUTER_API_KEY?.trim();
const model = process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b";
const dryRun = process.argv.includes("--dry-run");

if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

const catalogText = await readFile(catalogPath, "utf8");
const start = catalogText.indexOf("[");
const end = catalogText.indexOf("] as const;");
if (start < 0 || end < 0) throw new Error("Could not parse knowledge catalog");
const notes = JSON.parse(catalogText.slice(start, end + 1));
const playbookStart = catalogText.indexOf("[", end);
const playbookEnd = catalogText.indexOf("] as const;", playbookStart);
const playbooks = playbookStart >= 0 && playbookEnd >= 0
  ? JSON.parse(catalogText.slice(playbookStart, playbookEnd + 1))
  : [];

const categories = [
  "linux-privilege-escalation",
  "networking-reconnaissance",
  "web-security",
  "windows-active-directory",
  "reverse-engineering-firmware",
  "forensics-files-and-steganography",
  "cloud-and-credentials",
  "personal-roadmap",
  "general-reference",
];

function cleanSlug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "note";
}

function extractJson(text) {
  const clean = String(text).replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = clean.indexOf("[");
  const end = clean.lastIndexOf("]");
  if (start < 0 || end <= start) throw new Error("AI did not return a JSON array");
  return JSON.parse(clean.slice(start, end + 1));
}

async function classifyBatch(batch) {
  const input = batch.map(note => ({
    id: note.id,
    oldTitle: note.title,
    sourcePath: note.sourcePath,
    content: note.content.slice(0, 2600),
  }));
  const response = await fetch(`${apiUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Operator Knowledge Dossier note organizer",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: 2200,
      messages: [
        {
          role: "system",
          content: `You organize cybersecurity study notes. Return ONLY a JSON array with one object per input id. Each object must have: id (number), title (clear concise English title, 3-8 words), category (exactly one of ${categories.join(", ")}), tags (3-6 lowercase kebab-case tags), filename (short lowercase kebab-case filename without extension), reason (short). Preserve the technical meaning. Do not invent facts. Use sourcePath and content together.`,
        },
        { role: "user", content: JSON.stringify(input) },
      ],
    }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`OpenRouter HTTP ${response.status}: ${await response.text()}`);
  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned empty content");
  return extractJson(content);
}

const decisions = new Map();
for (let index = 0; index < notes.length; index += 6) {
  const batch = notes.slice(index, index + 6);
  let result;
  try {
    result = await classifyBatch(batch);
  } catch (error) {
    console.warn(`AI batch ${index + 1}-${index + batch.length} failed: ${error.message}`);
    result = [];
  }
  for (const item of result) {
    if (batch.some(note => note.id === item.id) && categories.includes(item.category)) {
      decisions.set(item.id, {
        title: String(item.title).trim(),
        category: item.category,
        tags: Array.isArray(item.tags) ? item.tags.map(String).slice(0, 6) : [],
        filename: cleanSlug(item.filename || item.title),
        reason: String(item.reason || "").trim(),
      });
    }
  }
  console.log(`classified=${Math.min(index + batch.length, notes.length)}/${notes.length}`);
}

// Never leave a note without an organization record if a provider has a transient failure.
for (const note of notes) {
  if (!decisions.has(note.id)) {
    decisions.set(note.id, {
      title: note.title.replace(/\s+/g, " ").trim() || `Knowledge note ${note.id}`,
      category: "general-reference",
      tags: ["ks-import", "needs-review"],
      filename: cleanSlug(note.title || `note-${note.id}`),
      reason: "AI classification unavailable; review this note manually.",
    });
  }
}

if (dryRun) {
  console.log(JSON.stringify(notes.map(note => ({ id: note.id, sourcePath: note.sourcePath, ...decisions.get(note.id) })), null, 2));
  process.exit(0);
}

await mkdir(outputRoot, { recursive: true });
const organized = notes.map(note => {
  const decision = decisions.get(note.id);
  const duplicateSafe = `${String(note.id).slice(-5)}-${decision.filename}`;
  const organizedPath = `${decision.category}/${duplicateSafe}.md`;
  const frontmatter = [
    "---",
    `title: ${decision.title}`,
    `category: ${decision.category}`,
    `tags: [${[...new Set(["ks-import", ...decision.tags])].join(", ")}]`,
    `source: ${note.sourcePath}`,
    `sourceId: ${note.id}`,
    "---",
    "",
  ].join("\n");
  const content = `${frontmatter}${note.content.trim()}\n`;
  return {
    ...note,
    title: decision.title,
    tags: [...new Set(["ks-import", decision.category, ...decision.tags])],
    category: decision.category,
    organizedPath,
    content: note.content,
    organizedContent: content,
    sourcePath: note.sourcePath,
  };
});

for (const note of organized) {
  const target = path.join(outputRoot, note.organizedPath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, note.organizedContent, "utf8");
}

const generated = `export const importedKnowledgeNotes = ${JSON.stringify(organized, null, 2)} as const;\n\nexport const importedKnowledgePlaybooks = ${JSON.stringify(playbooks, null, 2)} as const;\n`;
await writeFile(catalogPath, generated, "utf8");
console.log(`organized=${organized.length} output=${outputRoot}`);
