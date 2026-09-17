---
title: Cybersecurity Field Guide Overview
category: personal-roadmap
tags: [ks-import, cheat-sheet, workflow, recon, enumeration, mapping]
source: cheater/cheatshit 1.md
sourceId: 10003
---
🧠 Cybersecurity Field Guide

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
🛰️ SECTION 1 — RECONNAISSANCE & FOOTPRINTING

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
