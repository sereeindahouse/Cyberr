---
title: Windows Recon CLI Commands
category: windows-active-directory
tags: [ks-import, windows, recon, cli, commands]
source: windows fund/windows.md
sourceId: 10052
---
📂 STREAMLINED OBSIDIAN VAULT ENTRY

Copy this high-density reference card into your vault:

Title: Windows Reconnaissance - Core CLI Binaries (CMD)
Tags: #Windows #CLI #cmd #Reconnaissance #LivingOffTheLand #ipconfig #net
> ```
> 
>     Command Help Syntax: ==[command] /?== or ==net help [subcommand]==
> 
>     Identity & Privileges:
> 
>         ==whoami== (Current user) / ==whoami /priv== (Active user token privileges).
> 
>         ==hostname== (Target machine NetBIOS name).
> 
>     User & Group Enumeration (net.exe):
> 
>         ==net user== 
>         (List local accounts) / 
>         ==net user [username]== (Detailed account info).
> 
>         ==net localgroup administrators==
>          (List local admin group members).
> 
>         ==net share== 
>         (List active local SMB shares).
> 
>     Network Interrogation:
> 
>         ==ipconfig /all==
>          (Comprehensive network adapter, DNS, and DHCP configuration).
> ```

> ```
>         ==netstat -ano==
>          (All active network sockets mapped to process PIDs).
> ```
