---
title: Directory Enumeration with Gobuster
category: web-security
tags: [ks-import, gobuster, dirbusting, web-enumeration, feroxbuster, http]
source: gobuster.md
sourceId: 10010
---
gobuster dir -u http://10.48.154.222 \
-w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
-x php,html,js,txt,bak,old,zip \
-t 50 

feroxbuster -u http://10.48.181.78 \
-w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
