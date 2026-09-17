---
title: Linux Privilege Escalation Checklist
category: linux-privilege-escalation
tags: [ks-import, privilege-escalation, gtfobins, suid, capabilities, cron]
source: linux prev/most important site.md
sourceId: 10025
---
https://gtfobins.github.io.

📂 MASTER OBSIDIAN VAULT ENTRY (Save This)

Copy this consolidated field manual entry into your vault under Linux Privilege Escalation:

Title: Master Field Manual - Linux Local Privilege Escalation
Tags: #Linux #PrivEsc #CheatSheet #SUID #Sudo #Capabilities #Cron #NFS #Kernel

> ```
>     Triage Priority Sequence:
> 
>         ==sudo -l==
> 
>                 
>         →→
> 
>               
> 
>         Check GTFOBins for shell escapes.
> 
>         ==find / -perm -u=s -type f 2>/dev/null==
> 
>                 
>         →→
> 
>               
> 
>         SUID binaries.
> 
>         ==getcap -r / 2>/dev/null==
> 
>                 
>         →→
> 
>               
> 
>         Binaries with cap_setuid+ep.
> 
>         ==cat /etc/crontab==
> 
>                 
>         →→
> 
>               
> 
>         Check for writable scripts / relative paths.
> 
>         ==ls -la /etc/passwd /etc/shadow==
> 
>                 
>         →→
> 
>               
> 
>         Writable passwd or readable shadow.
> 
>         ==cat /etc/exports==
> 
>                 
>         →→
> 
>               
> 
>         Look for no_root_squash.
> 
>         ==uname -a==
> 
>                 
>         →→
> 
>               
> 
>         Kernel version matching against Exploit-DB (Last resort).
> ```
