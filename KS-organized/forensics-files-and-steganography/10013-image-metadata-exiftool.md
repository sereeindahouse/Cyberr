---
title: Extract Image Metadata with Exiftool
category: forensics-files-and-steganography
tags: [ks-import, exiftool, metadata, grep, image-forensics]
source: Image exploit/commands.md
sourceId: 10013
---
# `exiftool -a -u`

```
exiftool -a -u aa.jpg
```

Энд:

```
-a → duplicate tags-ийг бас харуул
-u → unknown tags-ийг бас харуул
```

Тэгэхээр:

> **“Энгийн metadata-гээс гадна давхардсан болон tool танихгүй tag-уудыг ч харуул.”**

гэсэн санаа.

---

# 🎯 `grep`

```
exiftool aa.jpg | grep -iE "comment|artist|description"
```

Энэ бол:

```
exiftool
   ↓
бүх metadata
   ↓
grep
   ↓
зөвхөн:
comment
artist
description
```

гэж шүүж байна.

`-i` = case-insensitive.

Тэгэхээр:

```
Comment
comment
COMMENT
```

бүгд таарна.

`-E` = extended regular expression.
