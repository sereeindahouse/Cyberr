---
title: Windows PrivEsc via Autorun Permissions
category: windows-active-directory
tags: [ks-import, windows, privesc, autorun, dacl, accesschk]
source: windows prev/window1.md
sourceId: 10054
---
📂 STREAMLINED OBSIDIAN VAULT ENTRY

> 
> Title: Windows PrivEsc - Autorun Insecure File Permissions
> ```
Tags: #Windows #PrivEsc #Autoruns #Sysinternals #DACL #AccessChk #Registry
> ```
> 
>     Vulnerability Root: An executable listed in global startup (HKLM\...\CurrentVersion\Run) has insecure DACL permissions allowing standard users to modify/overwrite the file.
> ```
> 
    Reconnaissance Workflow:

        Inspect Startup Entries: Run ==Autoruns64.exe==

                
        →→

              

> ```
>         Check Logon tab for custom entries.
> ```

```
        Audit File Permissions (CLI):
        accesschk64.exe -wvu "C:\Path\To\Target"
```

> ```
>         Target Permission to Spot: Everyone: FILE_ALL_ACCESS or BUILTIN\Users: FILE_WRITE_DATA.
> ```
```
> . Open command prompt and type: C:\Users\User\Desktop\Tools\Autoruns\Autoruns64.exe
2. In Autoruns, click on the ‘Logon’ tab.
3. From the listed results, notice that the “My Program” entry is pointing to “C:\Program Files\Autorun Program\program.exe”.
4. In command prompt type: C:\Users\User\Desktop\Tools\Accesschk\accesschk64.exe -wvu "C:\Program Files\Autorun Program"
5. From the output, notice that the “Everyone” user group has “FILE_ALL_ACCESS” permission on the “program.exe” file.



```
