---
title: AlwaysInstallElevated Installer Privilege Escalation
category: windows-active-directory
tags: [ks-import, alwaysinstall-elevated, installer-policy, privilege-escalation, windows-registry]
source: windows prev/windows2.md
sourceId: 10055
---
> ```
> 1.Open command prompt and type: reg query HKLM\Software\Policies\Microsoft\Windows\Installer
> 2.From the output, notice that “AlwaysInstallElevated” value is 1.
> 3.In command prompt type: reg query HKCU\Software\Policies\Microsoft\Windows\Installer
> ```


ene 2 iig shalgaj boln basic
