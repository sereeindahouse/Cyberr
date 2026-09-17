---
title: Steghide Info and Extraction
category: forensics-files-and-steganography
tags: [ks-import, steghide, hidden-data, extraction, image-steganography]
source: Image exploit/commands2.md
sourceId: 10014
---
# 🔍 `steghide info`

```
steghide info image.jpg
```

Энэ:

> **“Энэ image file-д steghide ашиглан нуусан data байгаа юу?”**

гэж шалгаж байна.

---

# 📤 `steghide extract`

```
steghide extract -sf image.jpg
```

Энд:

```
-sf = stegofile
```

өөрөөр хэлбэл:

> **“Энэ бол hidden data агуулж болох source image.”**

Тэгээд tool password/passphrase асууж болно.

---

# 🔑 `-p`

```
steghide extract -sf image.jpg -p "keyword"
```

`-p`:

> **“Passphrase ийм байна.”**
