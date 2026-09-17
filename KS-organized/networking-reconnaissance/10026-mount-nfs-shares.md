---
title: Mount NFS Shares
category: networking-reconnaissance
tags: [ks-import, nfs, mount, network-filesystem, linux]
source: linux prev/mount.md
sourceId: 10026
---
| **Command**                           | **Meaning**                                 |
| ------------------------------------- | ------------------------------------------- |
| **`showmount -e IP`**                 | **List available NFS shares on the target** |
| **`mkdir /tmp/nfs`**                  | **Create a local folder to mount into**     |
| **`mount -t nfs IP:/share /tmp/nfs`** | **Mount the remote share**                  |
| **`df -h`**                           | **Check if the mount was successful**       |
| **`ls /tmp/nfs`**                     | **See the content of the mounted share**    |
| **`umount /tmp/nfs`**                 | **Unmount the share when finished**         |
| **`mount \| grep nfs`**               | **See currently mounted NFS shares**        |

**Common useful options:**

| **Option**  | **Purpose**                              |
| ------- | ------------------------------------ |
| **-o name** | **Set the name of the output file**      |
| **-Wall**   | **Show all warnings**                    |
| **-g**      | **Include debugging information**        |
| **-m32**    | **Compile as 32-bit (sometimes needed)** |
| **-static** | **Create a static binary**               |

**Example:**

Bash

> ```
> gcc shell.c -o shell          # Simple compile
> gcc -Wall shell.c -o shell    # Compile with warnings
> ```
