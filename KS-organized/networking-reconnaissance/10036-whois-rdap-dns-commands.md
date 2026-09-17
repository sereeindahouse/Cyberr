---
title: WHOIS, RDAP, and DNS Command Reference
category: networking-reconnaissance
tags: [ks-import, whois, rdap, dns, recon, command-line]
source: PASSIVE recon/commands.md
sourceId: 10036
---
📂 COMMAND REFERENCE: WHOIS vs. RDAP (For Your Vault)

Copy this section directly into your Obsidian Vault under your Passive Reconnaissance folder so you have exact, syntax-checked commands when you need them in the field.
> **A. Traditional WHOIS (==TCP Port 43==)**

```
    Standard Domain Query:
    ==whois tryhackme.com==

    Filtered Query (Extracting Key Fields via Grep):
	==**whois tryhackme.com | grep -iE "Registrar:|Name Server:|Creation Date|Updated Date|Expiration Date"**==
    (Note: -iE makes the search case-insensitive and uses extended regular expressions).

```
B. Modern RDAP Query (==HTTPS Port 443==)

Because RDAP returns structured JSON, we use ==curl== to fetch the web data silently (-s flag) and pipe | the output to ==jq== (Linux JSON parser).
> 
>     **Full Formatted JSON Query:**
>     **==curl -s https://rdap.verisign.com/com/v1/domain/tryhackme.com | jq .==**
> 
>     **Targeted JSON Extraction (Pulling Registration Events & Nameservers):**
>     **==curl -s https://rdap.verisign.com/com/v1/domain/tryhackme.com | jq '.events, .nameservers'==**
> 
>     **Extracting Only the Registrar Name:**
>     **==curl -s https://rdap.verisign.com/com/v1/domain/tryhackme.com | jq '.entities[0].vcardArray[2]'==**



📂 ADD THIS TO YOUR OBSIDIAN VAULT

Title: DNS Architecture & Reconnaissance (dig / nslookup)
Tags: #Networking #DNS #Reconnaissance #OSINT #Dig

    Port: ==UDP Port 53== (Standard queries) / ==TCP Port 53== (Large responses, Zone Transfers).
```
    **nslookup -type=A tryhackme.com 1.1.1.1**
```

    Key Record Types:
> 
>         **==A== (IPv4) / ==AAAA== (IPv6 - Check for WAF bypass).**
> 
>         **==CNAME== (Alias - Check for Subdomain Takeover).**
> 
>         **==MX== (Mail Exchange + Priority Numbers).**
> 
>         **==TXT== (Holds SPF, DKIM, DMARC security policies & verification strings).**
> 
    Tool Syntax (dig):

```
>         **Query specific record type: 
>         ==dig tryhackme.com MX==**
> 
>         **Query via specific public resolver:
>          ==dig @1.1.1.1 tryhackme.com TXT==**
> 
>         **Clean output for Bash scripts:
>          ==dig +short tryhackme.com A==**
```
> 
>     **Time To Live (TTL): Specifies caching duration in seconds before DNS records refresh.**
