import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "KS");
const outputPath = path.join(root, "client", "src", "data", "ksKnowledge.ts");

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".obsidian") continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(fullPath));
    else if (/\.(md|markdown|txt)$/i.test(entry.name)) files.push(fullPath);
  }
  return files.sort((left, right) => left.localeCompare(right));
}

function classify(relativePath) {
  const lower = relativePath.toLowerCase();
  const personal = /personal goal|thought|about me|learned thing|untitled|n2\.md|roadmap\.md|tactik\.md|sd\.md|most important/.test(lower);
  const source = lower.includes("cloud") || lower.includes("iam") ? "Cloud" : lower.includes("htb") ? "HTB" : lower.includes("pico") ? "picoCTF" : lower.includes("thm") || lower.includes("tryhack") ? "THM" : "Cyber";
  const stage = /windows|linux|active recon|passive recon|image exploit|cheater/.test(lower) ? "Foundations" : lower.includes("network") ? "Live Fire" : "Pro Arena";
  const category = lower.includes("windows") ? "windows" : lower.includes("linux") || lower.includes("cheater") ? "linux" : lower.includes("cloud") || lower.includes("hash") || lower.includes("hydra") ? "cloud" : /image|gobuster|passive|active|network/.test(lower) ? "network" : "linux";
  return { personal, source, stage, category };
}

/**
 * Stable note id derived from the note's path (FNV-1a). The old
 * `10000 + index + 1` scheme remapped ids whenever the file list changed,
 * so a report the user edited in the vault would silently attach to a
 * different note after regeneration.
 */
function stableId(relativePath) {
  let h = 2166136261;
  for (let i = 0; i < relativePath.length; i += 1) {
    h ^= relativePath.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 100000 + (h >>> 0) % 900000;
}

function commandsFrom(content, base) {
  const commands = [];
  const blocks = content.matchAll(/```[^\r\n]*\r?\n([\s\S]*?)```/g);
  let index = 0;
  for (const match of blocks) {
    const block = match[1].trim();
    if (block) commands.push({ label: `Source ${base} - block ${++index}`, cmd: block });
  }
  if (commands.length) return commands;
  for (const line of content.split(/\r?\n/)) {
    if (/^\s*(?:[$>]\s*)?(?:sudo\s+|nmap\s|find\s|cat\s|python3\s|python\s|curl\s|dig\s|ssh\s|mysql\s|hydra\s|john\s|hashcat\s|showmount\s|mount\s|nc\s|openssl\s|gobuster\s|feroxbuster\s|exiftool\s|steghide\s|binwalk\s|Get-WinEvent\s|whoami\s|hostname\s|ipconfig\s|net\s|reg\s|certutil\s|sc\s|strings\s|gcc\s|chmod\s|echo\s)/.test(line)) {
      commands.push({ label: `Source ${base} - command ${++index}`, cmd: line.trim() });
    }
  }
  return commands;
}

const files = await collectFiles(sourceRoot);
const notes = [];
const playbooks = [];
for (let index = 0; index < files.length; index += 1) {
  const file = files[index];
  const relativePath = path.relative(sourceRoot, file).split(path.sep).join("/");
  const content = await readFile(file, "utf8");
  const base = path.basename(file, path.extname(file));
  const folder = path.dirname(relativePath) === "." ? "" : path.dirname(relativePath);
  const info = classify(relativePath);
  const tags = ["ks-import", ...(folder ? folder.split("/").map(value => value.toLowerCase().replaceAll(" ", "-").replaceAll("'", "")) : []), info.personal ? "personal-note" : "field-reference"];
  notes.push({ id: stableId(relativePath), title: base, room: folder || "KS", source: info.source, stage: info.stage, tags: [...new Set(tags)], status: "Draft", readTime: `${Math.max(1, Math.ceil(content.length / 1800))} min`, date: "KS import", excerpt: `KS source: ${relativePath}`, content, sourcePath: relativePath });
  const commands = commandsFrom(content, base);
  if (commands.length && !info.personal) {
    playbooks.push({ id: `ks-playbook-${index + 1}`, title: base, category: info.category, description: `Imported command reference from KS: ${relativePath}`, methodology: `Source file: ${relativePath}\n\nUse commands only in an authorized lab or on systems you own.`, commands, tips: ["Use only in an authorized lab or on systems you own.", "Review target, IP, username, and wordlist placeholders before running.", "Record command output back in the related note or report."] });
  }
}

await mkdir(path.dirname(outputPath), { recursive: true });
const output = `export const importedKnowledgeNotes = ${JSON.stringify(notes, null, 2)} as const;\n\nexport const importedKnowledgePlaybooks = ${JSON.stringify(playbooks, null, 2)} as const;\n`;
await writeFile(outputPath, output, "utf8");
console.log(`Generated ${files.length} notes and ${playbooks.length} playbooks at ${outputPath}`);
