---
title: Linux Post-Compromise Enumeration
category: linux-privilege-escalation
tags: [ks-import, enumeration, linux, post-compromise, privilege-escalation, system-info]
source: linux prev/Tools.md
sourceId: 10027
---
📂 STREAMLINED OBSIDIAN VAULT ENTRY

Copy this high-density reference card into your vault:

> ==**Title: Linux Local Enumeration (Post-Compromise)**==
Tags: #Linux #PrivEsc #Enumeration #CLI #Netstat #Find

>     ==**System & Kernel Info:**==

> ```
>         Kernel Release: ==uname -a== or ==cat /proc/version==
> 
>         OS Distribution: ==cat /etc/issue== or ==cat /etc/os-release==
> ```

>     ==**User & Permissions Context:**==

> ```
>         Current ID & Groups: ==id==
> 
>         Sudo Privileges: ==sudo -l==
> 
>         System Users: ==cat /etc/passwd | grep -E "home|sh$"==
> ```

>     ==**Network & Internal Sockets:**==

> ```
>         Listening Ports: ==netstat -tlpn== or ==ss -tulpn==
> 
>         Routing Table: ==ip route==
> ```

>     ==**Precision File Hunting (find):**==

> ```
>         SUID Binaries: 
>         
>         find / -perm -u=s -type f 2>/dev/null
>         
>         find / -type f -perm -04000 -ls 2>/dev/null
>         
>         find / -type f -name "*flag*" 2>/dev/null
>         
>         find / -name "root.txt" 2>/dev/null
>         
> 
>         World-Writable Directories: ==
>         find -w/ ritable -type d 2>/dev/null==
> ```


### 1. What SUID actually means

When a binary has the **SUID bit** set (you see rws instead of rwx in the permissions), it runs with the privileges of the **file owner**, not the user who ran it.

In your case:

Bash

```
-rwsr-xr-x 1 root root ... /usr/bin/base64
```

This means: When **any** user runs /usr/bin/base64, the program temporarily becomes **root**.

That is why SUID binaries are dangerous and very useful for privilege escalation.
