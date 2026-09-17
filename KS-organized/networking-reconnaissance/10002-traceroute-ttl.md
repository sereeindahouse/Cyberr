---
title: Traceroute and TTL Mechanics
category: networking-reconnaissance
tags: [ks-import, traceroute, ttl, icmp, tcp-bypass, mtr]
source: active recon/traceroute.md
sourceId: 10002
---
📂 ADD THIS TO YOUR OBSIDIAN VAULT

> ==**Title: Active Reconnaissance - Traceroute & TTL Mechanics**==
Tags: #Networking #ActiveRecon #Traceroute #ICMP #TTL

```
    Mechanism: Exploits the IP header ==TTL (Time To Live)== field. Routers decrement TTL by 1; when TTL=0, the router drops the packet and returns an ==ICMP Type 11 (Time-to-Live Exceeded)== message.

```
    Probe Modes:
> 
>         **Linux default: ==UDP== (Ports 33434+)**
> 
>         **Windows default: ==ICMP== (tracert)**
> 
>         **TCP Mode (WAF/Firewall Bypass): ==traceroute -T -p 80 [TARGET_IP]==**
> 
>         **ICMP Mode on Linux: ==traceroute -I [TARGET_IP]==**

    mtr (My Traceroute): Combines traceroute and ping into a live, real-time diagnostic dashboard showing continuous packet loss and jitter per hop.
