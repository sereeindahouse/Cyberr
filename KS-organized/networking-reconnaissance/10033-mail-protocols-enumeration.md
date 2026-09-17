---
title: SMTP vs POP/IMAP and Enumeration
category: networking-reconnaissance
tags: [ks-import, smtp, imap, pop, metasploit, hydra, enumeration]
source: NETWORK/gojo's domain/task 5,6.md
sourceId: 10033
---
📂 ADD THIS TO YOUR OBSIDIAN VAULT

Title:[[ Mail Protocols - SMTP vs. POP/IMAP]]
Tags: #Networking #Protocols #SMTP #IMAP #POP

0
> `SMTP`
> ## (Push): Simple Mail Transfer Protocol [1]. Handles outgoing mail [1]. Default port is ==Port 25== [1].

> `%% IMAP %%`
> (Pull/Sync): Synchronizes the local inbox with the mail server [1]. Keeps messages on the server so changes persist across multiple devices [1].

> `POP`
> (Pull/Delete): Downloads messages to the local client and deletes them from the server [1].

> `SMTP`
> Queue: Temporary storage on the mail server used to hold emails that cannot be immediately delivered to the recipient due to network or server outages [1].


📂 ADD THIS TO YOUR OBSIDIAN VAULT

Title: [[Metasploit SMTP Enumeration]]
Tags: #Metasploit #SMTP #Enumeration #Reconnaissance

    Metasploit Console Launch: ==msfconsole== [2].

> `Auxiliary Scanner (Version):`
>  ### - **==auxiliary/scanner/smtp/smtp_version==** [2]. **Grabs** the SMTP banner to identify the Mail Transfer Agent (MTA) [2].

> `Auxiliary Scanner (User Enum):` 
> - # - ==auxiliary/scanner/smtp/smtp_enum== [2]. Automates the transmission of ==VRFY== commands against a dictionary list to harvest valid system accounts [1, 2].

> `Target IP Variable`: 
> In Metasploit, the target host is always set using the ==RHOSTS== variable.

> `Wordlist` Variable:\
>  In Metasploit, the path to a username list is set using the ==USER_FILE== variable.


📂 ADD THIS TO YOUR OBSIDIAN VAULT

**Title:**[[Brute-Forcing Network Logins ff(Hydra)]]
Tags: #Attacking #Hydra #SSH #BruteForce

> The Concept: Automating authentication attempts against network services (SSH, FTP, HTTP) using a wordlist.

**`The` Weapon: ==hydra -t 16 -l [USER] -P [WORDLIST] -vV [IP] [PROTOCOL]==[3]**

> %% ``-t 16 = Parallel execution threads[3]. High speed, high detection risk.
> 
>    `` -l [user] = The static target username[3].
> 
> ``-P [file] = The dictionary file (usually rockyou.txt)[3].
> 
> ``-vV = Show all attempts in real-time[3]. %%

Mitigation: To defend against this, Security Engineers implement Fail2Ban (bans IPs after 3 failed login attempts) or enforce Key-Based Authentication instead of passwords.
