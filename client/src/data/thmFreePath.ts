export type ThmFreePathLevel = {
  id: string;
  label: string;
  title: string;
};

export type ThmFreePathRoom = {
  id: string;
  levelId: string;
  title: string;
  slug: string;
};

export const thmFreePathLevels: ThmFreePathLevel[] = [
  { id: "level-1", label: "Level 1", title: "Getting Started" },
  { id: "level-2", label: "Level 2", title: "Tooling" },
  { id: "level-3", label: "Level 3", title: "Crypto & Hashes with CTF Practice" },
  { id: "level-4", label: "Level 4", title: "Web" },
  { id: "level-5", label: "Level 5", title: "Reverse Engineering" },
  { id: "level-6", label: "Level 6", title: "Networking" },
  { id: "level-7", label: "Level 7", title: "Privilege Escalation" },
  { id: "level-8", label: "Level 8", title: "CTF Practice" },
  { id: "level-9", label: "Level 9", title: "Windows" },
];

const room = (levelId: string, slug: string, title: string): ThmFreePathRoom => ({
  id: `thm-${slug}`,
  levelId,
  slug,
  title,
});

export const thmFreePathRooms: ThmFreePathRoom[] = [
  room("level-1", "offensivesecurityintro", "Intro to Offensive Security"),
  room("level-1", "defensivesecurityintro", "Intro to Defensive Security"),
  room("level-1", "careersincyber", "Experience Cyber Security"),
  room("level-1", "searchskills", "Search Skills"),
  room("level-1", "linuxfundamentalspart1", "Linux Fundamentals Part 1"),

  room("level-2", "nmap01", "Nmap Live Host Discovery"),
  room("level-2", "hydra", "Hydra"),
  room("level-2", "linuxprivesc", "Linux PrivEsc"),
  room("level-2", "learnowaspzap", "Introduction to OWASP ZAP"),
  room("level-2", "metasploitintro", "Metasploit: Introduction"),
  room("level-2", "vulnversity", "Vulnversity"),
  room("level-2", "blue", "Blue"),
  room("level-2", "easyctf", "Simple CTF"),
  room("level-2", "cowboyhacker", "Bounty Hacker"),
  room("level-2", "bruteit", "Brute It"),

  room("level-3", "crackthehash", "Crack the Hash"),
  room("level-3", "agentsudoctf", "Agent Sudo"),
  room("level-3", "thecodcaper", "The Cod Caper"),
  room("level-3", "lazyadmin", "Lazy Admin"),
  room("level-3", "encryptioncrypto101", "Encryption - Crypto 101"),

  room("level-4", "howwebsiteswork", "How Websites Work"),
  room("level-4", "puttingitalltogether", "Putting it all together"),
  room("level-4", "sqlinjectionlm", "SQL Injection"),
  room("level-4", "dnsindetail", "DNS in Detail"),
  room("level-4", "httpindetail", "HTTP in Detail"),
  room("level-4", "owaspjuiceshop", "OWASP Juice Shop"),
  room("level-4", "overpass", "Overpass"),
  room("level-4", "bolt", "Bolt"),
  room("level-4", "takeover", "Takeover"),
  room("level-4", "corridor", "Corridor"),

  room("level-5", "windowsreversingintro", "Windows Reversing Intro"),
  room("level-5", "basicmalwarere", "Basic Malware RE"),
  room("level-5", "reverselfiles", "Reversing ELF"),
  room("level-5", "rfirmware", "Dumping Router Firmware"),
  room("level-5", "dissectingpeheaders", "Dissecting PE Headers"),

  room("level-6", "whatisnetworking", "What is Networking?"),
  room("level-6", "introtonetworking", "Introduction to Networking"),
  room("level-6", "networkservices", "Network Services"),
  room("level-6", "networkservices2", "Network Services 2"),
  room("level-6", "passiverecon", "Passive Reconnaissance"),
  room("level-6", "activerecon", "Active Reconnaissance"),
  room("level-6", "furthernmap", "Nmap"),
  room("level-6", "trafficanalysisessentials", "Traffic Analysis Essentials"),
  room("level-6", "snort", "Snort"),

  room("level-7", "linprivesc", "Linux Privilege Escalation"),
  room("level-7", "windows10privesc", "Windows PrivEsc"),
  room("level-7", "linuxprivescarena", "Linux PrivEsc Arena"),
  room("level-7", "windowsprivescarena", "Windows Privesc Arena"),
  room("level-7", "sudovulnsbypass", "Sudo Security Bypass"),
  room("level-7", "sudovulnsbof", "Sudo Buffer Overflow"),
  room("level-7", "blaster", "Blaster"),
  room("level-7", "ignite", "Ignite"),
  room("level-7", "kenobi", "Kenobi"),
  room("level-7", "c4ptur3th3fl4g", "C4ptur3-th3-Fl4g"),
  room("level-7", "picklerick", "Pickle Rick"),

  room("level-8", "breakoutthecage1", "Break Out The Cage"),
  room("level-8", "lianyu", "Lian Yu"),
  room("level-8", "b3dr0ck", "B3dr0ck"),
  room("level-8", "startup", "Startup"),
  room("level-8", "vulnnetactive", "VulnNet: Active"),
  room("level-8", "bufferoverflowprep", "Buffer Overflow Prep"),
  room("level-8", "dogcat", "Dogcat"),
  room("level-8", "eavesdropper", "Eavesdropper"),
  room("level-8", "ollie", "Ollie"),

  room("level-9", "windowsfundamentals2x0x", "Windows Fundamentals 2"),
  room("level-9", "windowsfundamentals3xzx", "Windows Fundamentals 3"),
  room("level-9", "winadbasics", "Active Directory Basics"),
  room("level-9", "blue", "Blue"),
  room("level-9", "attacktivedirectory", "Attacktive Directory"),
  room("level-9", "retro", "Retro"),
  room("level-9", "blueprint", "Blueprint"),
  room("level-9", "anthem", "Anthem"),
  room("level-9", "relevant", "Relevant"),
  room("level-9", "windowsforensics1", "Windows Forensics 1"),
  room("level-9", "localpotato", "LocalPotato"),
  room("level-9", "printnightmarec3kj", "PrintNightmare, Thrice!"),
];

export const thmFreePathUrl = "https://tryhackme.com/resources/blog/free_path";
export const thmRoomUrl = (slug: string) => `https://tryhackme.com/room/${slug}`;
