---
title: SSH Private Key Hunting
category: linux-privilege-escalation
tags: [ks-import, ssh, private-keys, privilege-escalation, linux]
source: linux prev fundd/SSH.md
sourceId: 10018
---
📂 STREAMLINED OBSIDIAN VAULT ENTRY

Title: Linux PrivEsc - Sensitive File Hunting (SSH Keys)
Tags: #Linux #PrivEsc #SSH #AsymmetricCrypto #Keys #Reconnaissance
```
> ssh -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa -i id_rsa root@10.49.158.131
```
> ```
>     Asymmetric Pair Logic: authorized_keys holds the public padlock; id_rsa holds the private key that bypasses password authentication.
> 
>     Enumeration Commands (Searching the Filesystem):
> ```
```

        Hunt Private Keys:
>          find / -name id_rsa 2>/dev/null

        Hunt Authorized Keys:
        find / -name authorized_keys 2>/dev/null

        Hunt Backup Keys:
        find / -name "*.key" -o -name "*.pem" 2>/dev/null
```

> ```
>     Mandatory SSH Client Permissions: ==chmod 600 id_rsa== (or 400). OpenSSH strictly rejects private keys with group/world-readable permissions.
> 
> ```
```
    Authentication Command: ==ssh -i id_rsa root@[TARGET_IP]==
```
