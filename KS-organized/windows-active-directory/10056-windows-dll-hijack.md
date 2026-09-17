---
title: Windows DLL Hijacking and Unquoted Paths
category: windows-active-directory
tags: [ks-import, dll-hijacking, unquoted-service-paths, token-impersonation, windows-priv-esc]
source: windows3.md
sourceId: 10056
---
📂 STREAMLINED OBSIDIAN VAULT ENTRY

Copy this high-density reference card into your vault:

Title: Windows PrivEsc - DLL Hijacking, Unquoted Paths & Token Impersonation
Tags: #Windows #PrivEsc #DLLHijacking #UnquotedPaths #Tokens #Potato #SeImpersonate

> ```
>         unprivileged user drops malicious DLL into writable directory.
> 
>         Detection: 
>         Procmon.exe filter: Process Name is [service.exe] + Result is NAME NOT FOUND.
> 
>         C Payload (windows_dll.c): Place administrative command inside DllMain under DLL_PROCESS_ATTACH. Compile with ==x86_64-w64-mingw32-gcc windows_dll.c -shared -o [name].dll==.
> 
>     2. Unquoted Service Paths:
> 
>         Mechanism: Unquoted path with spaces causes Windows to attempt executing earlier space-delimited binary substrings (e.g., C:\Program.exe before C:\Program Files\App\svc.exe).
> 
>         Audit: ==sc qc [ServiceName]== (Check BINARY_PATH_NAME).
> 
>         Payload Delivery: Place executable payload named after the intercepted segment in the writable parent folder.
> 
>     3. Token Impersonation / Potato Attacks (Tater):
> 
>         Prerequisite: ==whoami /priv== shows ==SeImpersonatePrivilege== or ==SeAssignPrimaryTokenPrivilege==.
> 
>         Mechanism: Local NTLM reflection/relay via NBNS spoofing and RPC authentication to duplicate and spawn processes under NT AUTHORITY\SYSTEM.
> 
>         PowerShell Execution: ==Import-Module .\Tater.ps1; Invoke-Tater -Trigger 1 -Command "[CMD]"==
> ```
