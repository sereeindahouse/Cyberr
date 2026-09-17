---
title: Hash Cracking with John and Hashcat
category: general-reference
tags: [ks-import, hash-cracking, john-the-ripper, hashcat, sha512]
source: useful things/hash crack.md
sourceId: 10046
---
bash

> ```
> echo'$6$WHmIjebL7MA7KN9A$C4UBJB4WVI37r.Ct3Hbhd3YOcua3AUowO2w2RUNauW8IigHAyVlHzhLrIUxVSGa.twjHc71MoBJfjCTxrkiLR.' > hash.txt
> 
> Use code with caution.
> Run John the Ripper using a standard wordlist like rockyou.txt:
> bash
> 
> john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
> 
> ```
```
> hashcat -m 1800 unshadowed.txt rockyou.txt -O
```
> ```
> hashcat -m 1800: Hashcat organizes hashing algorithms by numerical modes. Mode ==1800== represents SHA-512(
> 
>         
> pass,pass,
> 
>       
> 
> salt) (the standard $6$ Linux crypt algorithm).
> 
> -O: Enables optimized GPU/CPU kernel routines to maximize cracking speed.
> ```
