/**
 * Report templates shared by the reports page and the split-pane editor.
 * (Extracted from Home.tsx so the editor module can use them without a
 * circular import.)
 */

export type ReportSource = "THM" | "picoCTF" | "HTB" | "Cloud" | "Cyber";

export type ReportTemplate = {
  key: string;
  label: string;
  source: ReportSource;
  stage: string;
  tags: string[];
  content: string;
};

export const reportTemplates: ReportTemplate[] = [
  {
    key: "custom",
    label: "Кибер талбарын тэмдэглэл",
    source: "Cyber",
    stage: "Foundations",
    tags: ["pentest-report", "reconnaissance", "evidence"],
    content:
      "# Penetration Test Report\n\n## 1. Executive Summary\n\n\n## 2. Scope and Authorization\n\n- Target / room:\n- Authorized scope:\n- Date and operator:\n\n## 3. Attack Surface and Reconnaissance\n\n### Assets and services\n\n### Commands and evidence\n\n```bash\n# Add only commands run in the authorized lab\n\n```\n\n## 4. Findings\n\n### Finding 01: [Title]\n\n- Severity: Informational / Low / Medium / High / Critical\n- Asset:\n- Evidence:\n- Impact:\n- Reproduction steps:\n\n## 5. Exploitation Path\n\n1. Initial access:\n2. Discovery:\n3. Privilege escalation or lateral movement:\n4. Proof / flag:\n\n## 6. Remediation\n\n## 7. Lessons Learned\n\n## 8. Appendix\n\n- Related playbooks:\n- Related reports:\n- Screenshots / hashes:\n",
  },
  {
    key: "thm",
    label: "THM room тайлан",
    source: "THM",
    stage: "Foundations",
    tags: ["tryhackme", "room-debrief"],
    content:
      "# TryHackMe Room Write-up\n\n## 1. Room Overview\n\n- Room:\n- Difficulty:\n- Objective:\n- Link:\n\n## 2. Enumeration\n\n### Services and attack surface\n\n### Commands\n\n```bash\n\n```\n\n## 3. Initial Access\n\n- Vulnerability / weakness:\n- Evidence:\n- Credentials or foothold:\n\n## 4. Privilege Escalation\n\n- Enumeration:\n- Path selected:\n- Proof:\n\n## 5. Flags and Evidence\n\n## 6. Root Cause and Remediation\n\n## 7. Lessons Learned\n\n## 8. Related Playbooks and Tags\n\n",
  },
  {
    key: "picoctf",
    label: "picoCTF challenge тайлан",
    source: "picoCTF",
    stage: "Live Fire",
    tags: ["picoctf", "challenge"],
    content:
      "## Challenge-ийн ангилал\n\nReverse engineering / Web exploitation шинжилгээ.\n\n## Flag олдсон арга\n\n",
  },
  {
    key: "htb",
    label: "HTB машин тайлан",
    source: "HTB",
    stage: "Pro Arena",
    tags: ["hackthebox", "machine"],
    content:
      "## Машины мэдээлэл\n\nАнхны хандалт (User shell) ба эрх ахиулалт (Root flag).\n\n## Эмзэг байдал\n\n",
  },
  {
    key: "pentest-finding",
    label: "🛡️ CVSS Эмзэг байдлын олдвор",
    source: "Cyber",
    stage: "Live Fire",
    tags: ["cvss-finding", "vulnerability", "high", "poc"],
    content:
      "# [Vulnerability Title]\n\n- **Үнэлгээ (Severity):** HIGH (CVSS:3.1 Base Score: 7.8)\n- **CVSS Vector:** `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H`\n- **Зорилтот систем (Target):** `10.10.11.45:80`\n\n## 1. Эмзэг байдлын тодорхойлолт (Description)\n\n\n## 2. Үр дагавар (Impact)\n\n\n## 3. Баталгаажуулах алхмууд (Proof of Concept)\n\n```bash\n# Reproduce exploit\ncurl -X POST http://10.10.11.45/api/endpoint -d \"payload=...\"\n```\n\n## 4. Засварлах зөвлөмж (Remediation)\n\n",
  },
  {
    key: "cloud",
    label: "Cloud security довтолгооны төлөвлөгөө",
    source: "Cloud",
    stage: "Deployment",
    tags: ["cloud", "iam"],
    content:
      "## Клауд орчны бүтэц\n\nIAM, S3, болон дэд бүтцийн тохиргооны шалгалт.\n\n## Эрсдэлийн үнэлгээ\n\n",
  },
];

export function templateByKey(key: string): ReportTemplate {
  return reportTemplates.find(item => item.key === key) ?? reportTemplates[0];
}
