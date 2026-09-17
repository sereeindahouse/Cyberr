---
title: Netcat Banner Grabbing & Shells
category: networking-reconnaissance
tags: [ks-import, netcat, banner-grabbing, reverse-shell, tcp-udp, active-recon]
source: active recon/netcat.md
sourceId: 10001
---
📂 ADD THIS TO YOUR OBSIDIAN VAULT

> ==**Title: Active Reconnaissance - Netcat (nc) Swiss Army Knife**==
Tags: #ActiveRecon #Netcat #Networking #BannerGrabbing #ReverseShell

>     ==**Client Mode (Banner Grabbing):**==

>         TCP Banner Grab: ==nc [TARGET_IP] [PORT]==
> 
>         UDP Probing: ==nc -u [TARGET_IP] [PORT]==

>     ==**Server Mode (The Catcher's Mitt):**==

>         ==Catch Reverse Shells / File Transfers: ==nc -lvnp [PORT]====
> 
>         ==-n = Numeric only (prevents DNS resolution delays and log leaks).==

>     **==Protocol Differences:==**

>         **==Port 80 (HTTP): Requires manual GET / HTTP/1.1 request.**==
> 
>         ==**Port 21 (FTP) & Port 25 (SMTP): Transmits automatic 220 service greeting banners upon connection.==**

```
    Modern Alternative: ==ncat== (from Nmap project) supports ==--ssl== for encrypted listeners and banner grabs on TLS ports (Port 443 / 465).
```
