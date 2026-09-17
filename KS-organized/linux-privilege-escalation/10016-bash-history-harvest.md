---
title: Shell History Credential Harvesting
category: linux-privilege-escalation
tags: [ks-import, bash-history, credential-spill, privilege-escalation, linux]
source: linux prev fundd/linux prev fund.md
sourceId: 10016
---
📂 STREAMLINED OBSIDIAN VAULT ENTRY

Copy this high-density reference card into your vault:

Title: Linux PrivEsc - Shell History & Credential Spills
Tags: #Linux #PrivEsc #Credentials #BashHistory #PostExploitation #AntiForensics

> ```
>     Vulnerability Mechanism: Command history flushes from RAM buffer (HISTSIZE) to disk (~/.bash_history / HISTFILESIZE) upon session termination.
> 
>     Key Audit Files:
> ```

```
        ==cat ~/.bash_history==

        ==cat /root/.bash_history== (If readable)

        ==cat /home/*/.bash_history==

```
    High-Value Search Filter:

```
        grep -iE "passw|user|admin|ssh|mysql|key|token" ~/.bash_history
```

> ```
>     Operator Anti-Forensics (Preventing History Logging):
> 
>         Leading space before command: [command] (Requires HISTCONTROL=ignorespace).
> 
>         Session-wide suppression: ==unset HISTFILE && export HISTSIZE=0==.
> ```
