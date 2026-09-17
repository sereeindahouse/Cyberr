/**
 * Local (offline, zero-dependency) semantic search.
 *
 * Real transformer embeddings (Transformers.js ≈ 100 MB download, OpenRouter
 * API = network + cost) are overkill for a personal vault of a few hundred
 * notes — and they break the offline-first promise. Instead this module
 * builds small deterministic vectors from character trigrams + word tokens
 * (feature-hashing with signed accumulation, a.k.a. the "hashing trick"),
 * widened by a bilingual Mongolian↔English cybersecurity glossary so that a
 * query like "хэрэглэгчийн эрх авах" actually matches a "Privilege
 * escalation" note.
 *
 * Quality is deliberately "good enough for ranking", not "true semantics":
 * the server keeps an optional OpenRouter-embeddings upgrade path
 * (server/semantic.ts) behind the same cosine-similarity interface.
 */

export const EMBED_DIM = 256;

/** FNV-1a 32-bit hash — deterministic across runs and platforms. */
export function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Mongolian → English cybersecurity expansions. Applied to QUERIES (and
 * lightly to documents) so cross-language intent matches.
 */
export const MN_CYBER_GLOSSARY: Record<string, string[]> = {
  "эрх ахиулах": ["privilege escalation", "privesc", "root", "elevation"],
  "эрх авах": ["privilege escalation", "privesc", "get root", "elevation"],
  "хэрэглэгчийн эрх": ["privilege", "permission", "privesc", "user"],
  "системийн эрх": ["system privilege", "root", "administrator", "privesc"],
  "нууц үг": ["password", "credential", "hash", "crack"],
  "нууц үг эвдэх": ["password cracking", "hashcat", "john", "hydra"],
  "сүлжээ": ["network", "tcp", "port", "scan"],
  "сүлжээний шинжилгээ": ["network analysis", "packet", "wireshark", "traffic"],
  "скан": ["scan", "nmap", "enumeration", "recon"],
  "тандалт": ["reconnaissance", "recon", "enumeration", "osint"],
  "эмзэг байдал": ["vulnerability", "cve", "exploit", "weakness"],
  "эмзэг": ["vulnerable", "vulnerability", "exploit"],
  "халдлага": ["attack", "exploit", "offensive"],
  "довтолгоо": ["attack", "assault", "exploit", "payload"],
  "шифрлэлт": ["encryption", "crypto", "tls", "cipher"],
  "сертификат": ["certificate", "tls", "mtls", "x509"],
  "домэйн": ["domain", "dns", "active directory", "ad"],
  "багц": ["packet", "pcap", "traffic"],
  "багц шинжилгээ": ["packet analysis", "wireshark", "pcap", "tcpdump"],
  "лог": ["log", "event", "detection", "siem"],
  "бүртгэл": ["log", "record", "event"],
  " хор ": ["malware", "payload", "virus"],
  "ачаалал": ["payload", "shell", "exploit"],
  "бүрхүүл": ["shell", "reverse shell", "terminal"],
  "урвуу бүрхүүл": ["reverse shell", "shell", "callback"],
  "файл": ["file", "binary"],
  "хоёртын файл": ["binary", "elf", "pe", "reverse engineering"],
  "урвуу инженерчлэл": ["reverse engineering", "reversing", "assembly", "ghidra"],
  "вэб": ["web", "http", "application"],
  "вэб халдлага": ["web attack", "xss", "sqli", "injection"],
  "тарилга": ["injection", "sqli", "command injection"],
  "клауд": ["cloud", "aws", "azure", "iam"],
  "үүүл": ["cloud", "aws"],
  "зөвшөөрөл": ["permission", "policy", "iam", "access"],
  "хандалт": ["access", "authentication", "login"],
  "нэвтрэх": ["login", "logon", "authentication", "brute force"],
  "албадан нэвтрэлт": ["brute force", "hydra", "password spraying"],
  "үйлчилгээ": ["service", "daemon", "server"],
  "порт": ["port", "service", "open port"],
  "протокол": ["protocol", "tcp", "udp", "http"],
  "гэрчилгээ": ["certificate", "credential"],
  "түлхүүр": ["key", "ssh key", "api key"],
  "токен": ["token", "jwt", "session"],
  "сесс": ["session", "cookie", "hijack"],
  "далд суваг": ["covert channel", "c2", "exfiltration"],
  "мэдээлэл алдагдал": ["exfiltration", "data leak"],
  "сул тал": ["weakness", "misconfiguration", "vulnerability"],
  "тохиргооны алдаа": ["misconfiguration", "default credentials"],
  "цөм": ["kernel", "exploit", "privilege escalation"],
  "хуваарьт даалгавар": ["cron", "scheduled task", "persistence"],
  "тууштай хандалт": ["persistence", "backdoor", "cron"],
  "арын хаалга": ["backdoor", "persistence", "c2"],
  "диаграм": ["diagram", "graph", "map"],
  "тэмдэглэл": ["note", "report", "writeup"],
  "тайлан": ["report", "writeup", "documentation"],
};

/** English shorthand → canonical expansions (both queries and documents). */
export const EN_CYBER_ALIASES: Record<string, string[]> = {
  privesc: ["privilege escalation", "elevation", "root", "sudo", "suid"],
  "priv esc": ["privilege escalation", "privesc"],
  rce: ["remote code execution", "command execution", "exploit"],
  lfi: ["local file inclusion", "path traversal", "directory traversal"],
  rfi: ["remote file inclusion"],
  sqli: ["sql injection", "database", "union select"],
  xss: ["cross site scripting", "javascript injection"],
  ssti: ["server side template injection"],
  ssrf: ["server side request forgery"],
  xxe: ["xml external entity"],
  idor: ["insecure direct object reference", "access control"],
  jwt: ["json web token", "authentication", "session"],
  c2: ["command and control", "callback", "beacon"],
  av: ["antivirus", "defender", "evasion", "bypass"],
  edr: ["endpoint detection", "evasion", "bypass"],
  pe: ["portable executable", "windows binary"],
  elf: ["linux binary", "executable"],
  soc: ["security operations", "detection", "siem", "triage"],
  siem: ["siem", "siem", "detection", "log analysis"],
  ioc: ["indicator of compromise", "detection", "threat hunting"],
  ttp: ["tactics techniques procedures", "mitre", "att&ck"],
  mitre: ["att&ck", "ttp", "tactics"],
  ad: ["active directory", "domain", "kerberos", "ldap"],
  dc: ["domain controller", "active directory"],
  smb: ["server message block", "share", "ntlm", "445"],
  ntlm: ["windows hash", "pass the hash", "authentication"],
  pth: ["pass the hash", "ntlm", "lateral movement"],
  kerberos: ["active directory", "ticket", "golden ticket", "asrep"],
  ldap: ["active directory", "directory"],
  dns: ["domain name", "resolution", "exfiltration", "tunneling"],
  http: ["web", "request", "response"],
  tls: ["transport layer security", "certificate", "encryption", "https"],
  ssl: ["certificate", "encryption", "tls"],
  ssh: ["secure shell", "key", "login", "22"],
  ftp: ["file transfer", "21", "anonymous"],
  nfs: ["network file system", "share", "mount", "2049"],
  k8s: ["kubernetes", "container", "pod", "escape"],
  docker: ["container", "escape", "socket"],
  iam: ["identity access management", "aws", "policy", "role", "privilege"],
  s3: ["aws bucket", "storage", "misconfiguration"],
  ec2: ["aws instance", "metadata", "ssrf", "imds"],
  suid: ["setuid", "privilege escalation", "binary", "gtfobins"],
  sgid: ["setgid", "privilege escalation"],
  cron: ["scheduled task", "persistence", "privilege escalation"],
  sudo: ["privilege escalation", "gtfobins", "sudoers"],
  nmap: ["port scan", "enumeration", "recon", "network"],
  gobuster: ["directory enumeration", "fuzzing", "wordlist"],
  ffuf: ["fuzzing", "directory enumeration"],
  burp: ["web proxy", "intercept", "repeater"],
  hydra: ["brute force", "password", "login"],
  john: ["john the ripper", "password cracking", "hash"],
  hashcat: ["password cracking", "gpu", "hash"],
  mimikatz: ["credential dumping", "lsass", "windows"],
  bloodhound: ["active directory", "attack path", "graph"],
  linpeas: ["linux enumeration", "privilege escalation", "script"],
  winpeas: ["windows enumeration", "privilege escalation"],
  pspy: ["process monitor", "cron", "linux"],
  gtfobins: ["suid", "sudo", "binary", "privilege escalation"],
  lolbas: ["windows binary", "bypass", "execution"],
  revshell: ["reverse shell", "callback", "payload"],
  shell: ["command execution", "terminal", "reverse shell"],
  webshell: ["web shell", "rce", "upload"],
  pcap: ["packet capture", "wireshark", "network analysis"],
  yara: ["malware", "signature", "detection"],
  osint: ["reconnaissance", "passive", "information gathering"],
  phishing: ["social engineering", "email", "initial access"],
};

/** Extra weight for title-ish text when building document vectors. */
export function expandQueryText(query: string): string {
  const lower = String(query ?? "").toLowerCase();
  if (!lower.trim()) return "";
  const parts = [query];
  for (const [mn, expansions] of Object.entries(MN_CYBER_GLOSSARY)) {
    const key = mn.trim();
    if (key && lower.includes(key)) parts.push(...expansions);
  }
  for (const [alias, expansions] of Object.entries(EN_CYBER_ALIASES)) {
    if (!expansions.length) continue;
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(alias)}([^a-z0-9]|$)`);
    if (pattern.test(lower)) parts.push(...expansions);
  }
  return parts.join(" ");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenize(text: string): string[] {
  return String(text ?? "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(t => t.length >= 2);
}

function charTrigrams(text: string): string[] {
  const clean = String(text ?? "").toLowerCase().replace(/\s+/g, " ");
  const out: string[] = [];
  for (let i = 0; i + 3 <= clean.length; i++) {
    const tri = clean.slice(i, i + 3);
    if (tri.trim().length === 3) out.push(tri);
  }
  return out;
}

/**
 * Deterministic signed feature-hashing embedding. Output is L2-normalised
 * (or all zeros for empty input).
 */
export function embedText(text: string, dim = EMBED_DIM): number[] {
  const vec = new Array<number>(dim).fill(0);
  const tokens = tokenize(text);
  const trigrams = charTrigrams(text);
  if (!tokens.length && !trigrams.length) return vec;

  const add = (feature: string, weight: number) => {
    const h = fnv1a(feature);
    const idx = h % dim;
    const sign = h & 0x80000000 ? -1 : 1;
    vec[idx] += sign * weight;
  };

  // Trigrams dominate (robust to typos + morphology), tokens add precision.
  for (const tri of trigrams) add(`3:${tri}`, 1);
  for (const token of tokens) {
    const w = token.length >= 6 ? 2.2 : token.length >= 4 ? 1.6 : 1.0;
    add(`w:${token}`, w);
  }

  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) vec[i] /= norm;
  }
  return vec;
}

export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < n; i++) dot += a[i] * b[i];
  return dot; // inputs are L2-normalised
}

export type SemanticDoc = {
  id: number;
  title: string;
  tags: string[];
  excerpt: string;
  content: string;
};

/** Document text for embedding: title/tags count triple. */
export function docTextForEmbedding(doc: SemanticDoc): string {
  const head = `${doc.title} ${(doc.tags ?? []).join(" ")}`;
  const body = `${doc.excerpt ?? ""} ${String(doc.content ?? "").slice(0, 3000)}`;
  return `${head} ${head} ${head} ${expandQueryText(head)} ${body}`;
}

export type SemanticHit = { id: number; score: number };

/**
 * Rank documents by cosine similarity to the (expanded) query. Pass cached
 * `vectors` (id → vector) to skip re-embedding on every keystroke.
 */
export function semanticRank(
  query: string,
  docs: readonly SemanticDoc[],
  vectors?: Map<number, readonly number[]>
): SemanticHit[] {
  const expanded = expandQueryText(query);
  if (!expanded.trim() || !docs.length) return [];
  const q = embedText(expanded);
  const hits: SemanticHit[] = [];
  for (const doc of docs) {
    let v = vectors?.get(doc.id);
    if (!v) v = embedText(docTextForEmbedding(doc));
    const score = cosineSimilarity(q, v);
    if (score > 0.02) hits.push({ id: doc.id, score });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits;
}

/** Blend fuzzy (keyword) and semantic scores into one hybrid ranking. */
export function hybridBlend(
  fuzzy: readonly { id: number; score: number }[],
  semantic: readonly { id: number; score: number }[],
  alpha = 0.55
): SemanticHit[] {
  const fMax = Math.max(0.0001, ...fuzzy.map(x => x.score));
  const sMax = Math.max(0.0001, ...semantic.map(x => x.score));
  const acc = new Map<number, number>();
  for (const h of fuzzy) acc.set(h.id, (acc.get(h.id) ?? 0) + alpha * (h.score / fMax));
  for (const h of semantic) acc.set(h.id, (acc.get(h.id) ?? 0) + (1 - alpha) * (h.score / sMax));
  return [...acc.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
}
