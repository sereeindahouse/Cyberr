---
title: Passive Subdomain Enumeration Tools
category: networking-reconnaissance
tags: [ks-import, osint, subdomain-enumeration, dnsdumpster, crtsh, shodan]
source: PASSIVE recon/concepts2.md
sourceId: 10038
---
📂 ADD THIS TO YOUR OBSIDIAN VAULT

==**Title: Passive Subdomain Enumeration (DNSDumpster & crt.sh)**==
Tags: #OSINT #Reconnaissance #Subdomains #DNSDumpster #CertificateTransparency

>     **==Attack Vector:==**
>      Subdomains often host forgotten development environments (dev.), administrative panels (admin.), or legacy APIs that lack security controls.

    ==**DNSDumpster**==: 
>     Passive DNS aggregation tool that maps subdomains, IP blocks (ASNs), and infrastructure relationships without active scanning.

```
    ==**Certificate Transparency (==crt.sh==):**==
```

>         A mandatory, publicly auditable ledger of all issued SSL/TLS certificates.
> 
>         Wildcard search syntax: ==%.target.com==
> 
>         Rips subdomains from the certificate's SAN (Subject Alternative Name) field. Fully passive and impossible for a target to detect or hide from.


📂 ADD THIS TO YOUR OBSIDIAN VAULT

==**Title: Shodan & Censys (Internet-Wide Scanning)**==
Tags: #Reconnaissance #OSINT #Shodan #BannerGrabbing

>     ==Shodan: A search engine indexing internet-connected devices via continuous global port scanning and Banner Grabbing.==

>     **Banner: The raw text/metadata a service returns upon connection (software name, version, OS).**

>     S==**earch Facets (Filters): Use syntax to narrow results:**==

```
        ==hostname:
        target.com== (Finds hosts tied to a domain).

        ==org:
        "Company Name"== (Filters by registered enterprise owner).

        ==port:
        443 country:US== (Filters by open port and geographic location).
```

>     ==Censys: An alternative global search engine focusing heavily on X.509 certificates and host configurations, ideal for cross-referencing Shodan data.==
