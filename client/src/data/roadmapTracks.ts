import {
  thmFreePathLevels,
  thmFreePathRooms,
  thmRoomUrl,
} from "./thmFreePath";

/** Roadmap item — the smallest unit you tick off. */
export type TrackItem = {
  id: string;
  title: string;
  /** Optional external link (challenge/room/lab). Omit when it's a sub-goal. */
  url?: string;
  /**
   * THM Free Path items map 1:1 to the curated rooms so the "Report" flow
   * keeps working. Present only on the thm-free-path track.
   */
  thmRoomId?: string;
};

/** A group of items inside a track (a "chapter" of the roadmap). */
export type TrackSection = {
  id: string;
  label: string;
  title: string;
  items: TrackItem[];
};

export type Track = {
  id: string;
  name: string;
  detail: string;
  /** Official source link shown on the roadmap page. */
  sourceUrl?: string;
  sections: TrackSection[];
};

export const defaultTrackId = "thm-free-path";

/**
 * THM Free Path is derived from the existing curated data (single source of
 * truth) so room links and the "Report" editor keep working unchanged.
 */
const thmFreePathTrack: Track = {
  id: "thm-free-path",
  name: "THM Free Path",
  detail: "Суурь мэдлэгээс Windows PrivEsc хүртэл — 9 level, 74 curated room.",
  sourceUrl: "https://tryhackme.com/resources/blog/free_path",
  sections: thmFreePathLevels.map(level => {
    const rooms = thmFreePathRooms.filter(room => room.levelId === level.id);
    return {
      id: level.id,
      label: level.label,
      title: level.title,
      items: rooms.map(room => ({
        id: room.id,
        title: room.title,
        url: thmRoomUrl(room.slug),
        thmRoomId: room.id,
      })),
    };
  }),
};

const picoUrl = "https://ctf.picoctf.org";

const picoCtfCyLabTrack: Track = {
  id: "pico-ctf-cylab",
  name: "picoCTF / CyLab",
  detail: "CTF бодлогууд (picoCTF категориуд) + хувийн lab орчин (CyLab).",
  sourceUrl: picoUrl,
  sections: [
    {
      id: "pico-challenges",
      label: "Challenges",
      title: "picoCTF — хуучин жилүүдийн бодлогууд",
      items: [
        { id: "pico-baby-step", title: "Baby Step", url: picoUrl },
        { id: "pico-cave-system", title: "Cave System", url: picoUrl },
        { id: "pico-cipher-systems", title: "Cipher Systems", url: picoUrl },
        { id: "pico-crypto-challenge", title: "The Crypto Challenge", url: picoUrl },
        { id: "pico-pwnage", title: "Pwnage", url: picoUrl },
        { id: "pico-priv-esc", title: "Priv Esc", url: picoUrl },
      ],
    },
    {
      id: "pico-categories",
      label: "Categories",
      title: "picoCTF — албан ёсны категориуд",
      items: [
        { id: "pico-general", title: "General Skills" },
        { id: "pico-web", title: "Web Exploitation" },
        { id: "pico-crypto", title: "Cryptography" },
        { id: "pico-forensics", title: "Forensics" },
        { id: "pico-re", title: "Reverse Engineering" },
        { id: "pico-pwn", title: "Binary Exploitation" },
        { id: "pico-privesc", title: "Privilege Escalation" },
        { id: "pico-misc", title: "Miscellaneous" },
      ],
    },
    {
      id: "cylab-local",
      label: "Local lab",
      title: "CyLab — хувийн lab орчин",
      items: [
        { id: "cylab-juice-shop", title: "OWASP Juice Shop", url: "https://owasp-juice.shop" },
        { id: "cylab-dvwa", title: "DVWA (Damn Vulnerable Web App)", url: "https://github.com/digininja/DVWA" },
        { id: "cylab-metasploitable", title: "Metasploitable 2 / 3" },
        { id: "cylab-vulnhub", title: "VulnHub машинууд", url: "https://www.vulnhub.com" },
        { id: "cylab-ad-lab", title: "Windows + Samba AD lab" },
      ],
    },
  ],
};

const thmAdUrl = "https://tryhackme.com";

const thmPaidAdTrack: Track = {
  id: "thm-paid-ad",
  name: "THM Paid Sub / AD",
  detail: "Active Directory довтолгоо — THM-ийн AD замууд + subscription lab-ууд.",
  sourceUrl: thmAdUrl,
  sections: [
    {
      id: "ad-fundamentals",
      label: "Fundamentals",
      title: "AD-ийн суурь",
      items: [
        { id: "ad-domain-ou", title: "Domain, OU, Group Policy бүтэц" },
        { id: "ad-kerberos-flow", title: "Kerberos authentication flow" },
        { id: "ad-trusts", title: "Trusts ба forest-ууд" },
        { id: "ad-enum", title: "AD enum: PowerView, LDAP, NetBIOS" },
        {
          id: "ad-thm-fundamentals",
          title: "THM: Active Directory Fundamentals",
          url: "https://tryhackme.com/room/active-directory-fundamentals",
        },
        {
          id: "ad-thm-basics",
          title: "THM: Active Directory Basics",
          url: "https://tryhackme.com/room/winadbasics",
        },
      ],
    },
    {
      id: "ad-attacks",
      label: "Attacks",
      title: "AD-ын довтолгоонууд",
      items: [
        { id: "ad-lateral", title: "Lateral movement: PSEXEC, WMI, pass-the-hash" },
        { id: "ad-kerberoasting", title: "Kerberoasting ба AS-REP roasting" },
        { id: "ad-tickets", title: "Golden / Silver ticket" },
        { id: "ad-dcsync", title: "DCSync ба diamond backdoor" },
        { id: "ad-bloodhound", title: "BloodHound — attack path analysis" },
        { id: "ad-adcs", title: "AD CS (AD Certificate Services) abuse" },
      ],
    },
    {
      id: "thm-paid-sub",
      label: "Subscription",
      title: "Paid subscription — learning path",
      items: [
        { id: "ad-path", title: "THM Active Directory learning path", url: thmAdUrl },
        { id: "ad-premium", title: "Premium AD lab-ууд", url: thmAdUrl },
        { id: "ad-cloud", title: "AD + Cloud (Azure/Entra) integration" },
      ],
    },
  ],
};

const htbUrl = (slug: string) => `https://app.hackthebox.com/machines/${slug}`;

const htbFlawsTrack: Track = {
  id: "htb-flaws",
  name: "HTB / flAWS",
  detail: "HackTheBox бодит машинууд + flAWS (AD/Cloud hybrid) track.",
  sourceUrl: "https://www.hackthebox.com",
  sections: [
    {
      id: "htb-starting-point",
      label: "Retired",
      title: "Starting Point (Retired) машинууд",
      items: [
        { id: "htb-lame", title: "Lame", url: htbUrl("lame") },
        { id: "htb-peekaboo", title: "Peekaboo", url: htbUrl("peekaboo") },
        { id: "htb-juno", title: "Juno", url: htbUrl("juno") },
        { id: "htb-mercy", title: "Mercy", url: htbUrl("mercy") },
      ],
    },
    {
      id: "htb-intermediate",
      label: "Intermediate",
      title: "Дунд шатны машинууд",
      items: [
        { id: "htb-active", title: "Active (AD)", url: htbUrl("active") },
        { id: "htb-dharma", title: "Dharma", url: htbUrl("dharma") },
        { id: "htb-obsidian", title: "Obsidian", url: htbUrl("obsidian") },
        { id: "htb-tartarus", title: "Tartarus", url: htbUrl("tartarus") },
        { id: "htb-pancake", title: "Pancake", url: htbUrl("pancake") },
        { id: "htb-knead", title: "Knead", url: htbUrl("knead") },
        { id: "htb-neuron", title: "Neuron", url: htbUrl("neuron") },
        { id: "htb-carnifex", title: "Carnifex", url: htbUrl("carnifex") },
        { id: "htb-flaws", title: "flAWS", url: htbUrl("flaws") },
      ],
    },
    {
      id: "htb-flaws-track",
      label: "flAWS track",
      title: "flAWS — AD + Cloud хосолсон замнал",
      items: [
        { id: "flaws-foothold", title: "Initial foothold + AD enumeration" },
        { id: "flaws-cloud", title: "AWS/cloud lateral movement" },
        { id: "flaws-da", title: "DA privilege escalation + flag" },
      ],
    },
  ],
};

const oscpCloudTrack: Track = {
  id: "oscp-cloud",
  name: "OSCP / Cloud",
  detail: "OffSec OSCP (PnP) бэлтгэл + Cloud security чиглэл.",
  sourceUrl: "https://offsec.com",
  sections: [
    {
      id: "oscp-core",
      label: "OSCP",
      title: "OSCP — OffSec PnP модулиуд",
      items: [
        { id: "oscp-lab", title: "Lab setup: OffSec lab, services", url: "https://offsec.com" },
        { id: "oscp-recon", title: "Information gathering: nmap, enum4linux" },
        { id: "oscp-exploit", title: "Exploitation: Metasploit + manual" },
        { id: "oscp-post", title: "Post-exploitation: PTH, psexec, C2" },
        { id: "oscp-privesc", title: "PrivEsc: LinPEAS / WinPEAS" },
        { id: "oscp-report", title: "Lab report бичих" },
      ],
    },
    {
      id: "cloud-core",
      label: "Cloud",
      title: "Cloud security",
      items: [
        { id: "cloud-iam", title: "Cloud IAM & identity (AWS/Azure/GCP)" },
        { id: "cloud-aws", title: "AWS misconfig: S3, IAM roles, metadata SSRF" },
        { id: "cloud-k8s", title: "Containers & Kubernetes security" },
        { id: "cloud-cicd", title: "CI/CD pipeline security" },
        { id: "cloud-serverless", title: "Serverless & secrets management" },
      ],
    },
    {
      id: "portfolio",
      label: "Portfolio",
      title: "Баталгаажуулалт & багц",
      items: [
        { id: "pf-writeups", title: "CTF writeup-уудын цуглуулга" },
        { id: "pf-bugbounty", title: "Bug bounty бэлтгэл (HackerOne)" },
        { id: "pf-exam", title: "OSCP шалгалт өгөх төлөвлөгөө" },
      ],
    },
  ],
};

/** All roadmap tracks, in the user's desired order. */
export const roadmapTracks: Track[] = [
  thmFreePathTrack,
  picoCtfCyLabTrack,
  thmPaidAdTrack,
  htbFlawsTrack,
  oscpCloudTrack,
];

export type TrackStats = { total: number; done: number; percent: number };

/** Completion stats for a track given a `${trackId}:${itemId}` progress map. */
export function trackStats(track: Track, progress: Record<string, boolean>): TrackStats {
  let total = 0;
  let done = 0;
  for (const section of track.sections) {
    for (const item of section.items) {
      total += 1;
      if (progress[`${track.id}:${item.id}`]) done += 1;
    }
  }
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}
