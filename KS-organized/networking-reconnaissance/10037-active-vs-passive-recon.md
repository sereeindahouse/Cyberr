---
title: Active vs Passive Reconnaissance
category: networking-reconnaissance
tags: [ks-import, reconnaissance, osint, passive-recon, kill-chain]
source: PASSIVE recon/CONCEPTS].md
sourceId: 10037
---
> 
> 
> 
> ====📂 ADD THIS TO YOUR OBSIDIAN VAULT

> ==**Title: Reconnaissance - Active vs. Passive (OSINT)**==
Tags: #Reconnaissance #OSINT #PassiveRecon #KillChain

>     **Active Reconnaissance: Direct interaction with target systems (==nmap==, ==ping==, port scans). High probability of detection by firewalls, WAFs, and SIEM/IDS logs.**
> 
```
    Passive Reconnaissance (OSINT): Indirect intelligence gathering via third-party repositories (==WHOIS==, public ==DNS== servers, ==Shodan==, ==Google Dorks==). Zero direct packet interaction with the target; leave no trace in target logs.

```
>     ==Strategic Purpose: Map the target's domain structure, subdomains, employee emails, IP ranges, and legacy infrastructure before launching active scans.==
> 


📂 THE DEEP LOGIC: DNS Architecture & Attacker Mechanics

DNS (Domain Name System) is the phonebook of the internet. It operates primarily over ==UDP Port 53== for quick queries, but falls back to ==TCP Port 53== if the response data is larger than 512 bytes (such as large TXT records or DNS Zone Transfers).
code Code

[Your Machine] ──> [Public Resolver: 1.1.1.1] ──> [Authoritative DNS Server]
   (Passive)           (Queries on your behalf)          (Holds Master Records)

> When you query a public resolver like ==Cloudflare (1.1.1.1==) or Google (8.8.8.8), your IP never touches the target's DNS server. ==**Cloudflare queries the target's authoritative nameserver for you**== and returns the cached answer. This keeps your recon 100% passive and invisible to the target's SOC.
> 

Stand fast, Operator. Flag confirmed on thmlabs.com.

You completed the task, but you realized the DNS concepts under the hood are dense. You want the deep architectural breakdown so you aren't just typing dig without knowing what the packets are doing.

Here is the complete, un-skipped theoretical framework for DNS Passive Reconnaissance.
📂 THE DEEP LOGIC: DNS Architecture & Attacker Mechanics

DNS (Domain Name System) is the phonebook of the internet. It operates primarily over ==UDP Port 53== for quick queries, but falls back to ==TCP Port 53== if the response data is larger than 512 bytes (such as large TXT records or DNS Zone Transfers).
code Code

[Your Machine] ──> [Public Resolver: 1.1.1.1] ──> [Authoritative DNS Server]
   (Passive)           (Queries on your behalf)          (Holds Master Records)

When you query a public resolver like Cloudflare (1.1.1.1) or Google (8.8.8.8), your IP never touches the target's DNS server. Cloudflare queries the target's authoritative nameserver for you and returns the cached answer. This keeps your recon 100% passive and invisible to the target's SOC.
🔬 The Anatomy of DNS Records (The Hacker's Blueprint)

```
Every DNS record type serves a specific function in web architecture. Here is how a Pentester reads them:
```
1. ==**A and AAAA Records (The IPv4 / IPv6 Map)==**
> 
>     A records map a domain to an IPv4 address (172.67.69.208).
> 
>     AAAA (Quad-A) records map a domain to an IPv6 address (2606:4700:3033::...).

    Hacker Insight: Never ignore AAAA records. Many corporate IT teams configure strict Web Application Firewalls (WAFs) and IDS rules on their IPv4 addresses, but completely forget to secure their IPv6 endpoints. Attacking the IPv6 address directly often bypasses WAF protections.

2. ==**CNAME Records (Subdomain Takeover Target)**==

>     A Canonical Name (CNAME) is an alias. It points one domain to another domain (e.g., blog.target.com CNAME target.github.io).

    Hacker Insight (Subdomain Takeover): Imagine blog.target.com points to target.github.io. If the company deletes their GitHub page, but forgets to delete the CNAME record in their DNS, the alias is now pointing to a dead endpoint! An attacker can go to GitHub, create an account under target, claim that dead endpoint, and suddenly own blog.target.com. Any user visiting the company's official blog will now load the hacker's site.

3. ==**MX Records (Mail Routing & Priority)**==

    Mail Exchange records tell the internet which mail servers receive email for @target.com.

    The number before the server name is the Priority Preference (e.g., MX 1 aspmx.l.google.com vs MX 10 alt3.aspmx.l.google.com).

        Lower number = Higher priority (Mail goes to priority 1 first).

        If priority 1 is busy or down, sending servers failover to priority 5 or 10.

    Hacker Insight: Secondary/Backup mail servers (higher priority numbers like 10 or 20) are often running older, less-maintained software than the primary mail server. Attacking the backup mail server can yield success when the primary server is patched.

4. ==TXT== Records (Arbitrary Strings & Security Policies)

    TXT records hold raw text strings. Developers use them for domain ownership verification (e.g., google-site-verification=...) and email anti-spoofing policies:

        ==SPF== (Sender Policy Framework): Lists which IP addresses are legally authorized to send emails on behalf of the domain.

        ==DKIM== (DomainKeys Identified Mail): Holds the public cryptographic key used to verify email signatures.

        ==DMARC== (Domain-based Message Authentication): Instructs receiving servers what to do (e.g., p=reject or p=none) if an email fails SPF/DKIM checks.

    Hacker Insight: If DMARC is set to p=none or SPF has a loose policy (~all), an attacker can easily forge phishing emails appearing to originate directly from @target.com.
