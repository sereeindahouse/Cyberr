---
title: NFS No‑Root‑Squash Privilege Escalation
category: linux-privilege-escalation
tags: [ks-import, nfs, privilege-escalation, suid, linux, exploit]
source: NETWORK/gojo's domain/task 4.md
sourceId: 10032
---
📂 ADD THIS TO YOUR OBSIDIAN VAULT
[[Networking 2 task 3]]
Title[[: NFS Privilege Escalation (no_root_squash)]]
Tags: #Linux #PrivEsc #NFS #SUID #ConfigurationError

    The Vulnerability: The NFS share is configured with the no_root_squash flag in /etc/exports. This allows a remote client with local root privileges to write files to the share while maintaining root ownership on the host.

    The SUID Bit (-rws------): Set User ID. Allows an executable to run with the privileges of its owner.

    The Exploit Process:

        Mount the NFS share on your attacking machine (Kali).

        Copy a compatible bash binary into the mount point.

        As local root (on Kali), set the owner to root: ==chown root bash==.

        Set the SUID bit: ==chmod +s bash== (Verify permissions show rws).

        On the target machine (via low-privilege shell), execute: ==./bash -p==.

    The -p Flag: Tells bash to preserve the effective user ID (eUID) of root instead of dropping it back to the real user ID of the low-privilege user.



sudo chown root:root bash
sudo chmod +s bash
