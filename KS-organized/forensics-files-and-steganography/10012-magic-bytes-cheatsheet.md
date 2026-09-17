---
title: Magic Bytes Cheat Sheet
category: forensics-files-and-steganography
tags: [ks-import, magic-bytes, file-signatures, hex, identification, forensics]
source: Image exploit/cheatshit.md
sourceId: 10012
---
# 🧬 MAGIC BYTES — ONE-PAGE CHEATSHEET

> **Magic Bytes = File-ийн “хурууны хээ”**  
> Extension-д битгий шууд итгэ. Эхний bytes-ийг шалга.

---

## 🚨 MUST KNOW SIGNATURES

| 📦 File Type    | 🧬 Magic Bytes            | 👀 ASCII   |
| --------------- | ------------------------- | ---------- |
| 🖼️ **PNG**     | `89 50 4E 47 0D 0A 1A 0A` | `.PNG....` |
| 📸 **JPEG/JPG** | `FF D8 FF`                | `...`      |
| 🎞️ **GIF89a**  | `47 49 46 38 39 61`       | `GIF89a`   |
| 🎞️ **GIF87a**  | `47 49 46 38 37 61`       | `GIF87a`   |
| 📦 **ZIP**      | `50 4B 03 04`             | `PK..`     |
| 📄 **PDF**      | `25 50 44 46`             | `%PDF`     |
| 🐧 **ELF**      | `7F 45 4C 46`             | `.ELF`     |
| 🪟 **PE/EXE**   | `4D 5A`                   | `MZ`       |

### 🧠 Memory Hook

```
PNG  → 89 50 4E 47
JPEG → FF D8 FF
GIF  → GIF
ZIP  → PK
PDF  → %PDF
ELF  → ELF
EXE  → MZ
```

---

# 🔬 CHECK THE FILE

### 1️⃣ Identify

```
file image.png
```

> 🕵️ **“Чи үнэхээр PNG мөн үү?”**

---

### 2️⃣ See Raw Bytes

```
xxd -l 32 image.png
```

эсвэл

```
hexdump -C -n 32 image.png
```

> 🔬 **“Надад эхний 32 bytes-ийг харуул.”**

---

### 3️⃣ Check PNG Structure

```
pngcheck image.png
```

> 🩺 **“PNG structure эрүүл үү?”**

---

### 4️⃣ Search Hidden Layers

```
binwalk image.png
```

> 📦 **“Дотор нь өөр file/data нуугдсан уу?”**

---

# 🧠 4 TOOLS = 4 QUESTIONS

```
file
 ↓
❓ WHAT IS IT?

xxd
 ↓
❓ WHAT ARE THE RAW BYTES?

pngcheck
 ↓
❓ IS THE STRUCTURE VALID?

binwalk
 ↓
❓ IS SOMETHING ELSE INSIDE?
```

---

# 💥 CORRUPTED HEADER

### Normal PNG

```
89 50 4E 47 0D 0A 1A 0A
```

### Suspicious

```
00 00 00 00 00 00 00 00
```

Mental model:

```
🏷️ Extension
   ↓
"I am PNG!"

🔬 Magic bytes
   ↓
"Prove it."

❌ Wrong signature
   ↓
Header may be corrupted
```

---

# 🛠️ REPAIR IDEA — PNG

Correct signature:

```
89 50 4E 47 0D 0A 1A 0A
```

Python:

```
with open("bad.png", "rb") as f:
    data = bytearray(f.read())

data[:8] = bytes([
    0x89, 0x50, 0x4E, 0x47,
    0x0D, 0x0A, 0x1A, 0x0A
])

with open("fixed.png", "wb") as f:
    f.write(data)
```

### ⚠️ Remember

> **Зөвхөн header засагдлаа гээд бүх file бүтэн гэсэн үг биш.**

Тиймээс:

```
REPAIR
  ↓
file
  ↓
pngcheck
  ↓
OPEN
```

---

# 🧠 FINAL MEMORY WALL

```
       📦 FILE
          │
          ▼
   🏷️ Extension
   "I say I'm PNG"
          │
          ▼
   🧬 MAGIC BYTES
   "Prove your identity."
          │
          ▼
      🔬 XXD
   "Show raw bytes."
          │
          ▼
    🩺 PNGCHECK
   "Is structure valid?"
          │
          ▼
     📦 BINWALK
   "Anything hidden?"
```

## 🎯 ONE-LINE MEMORY

> **Extension = нэр → Magic Bytes = identity → `xxd` = raw truth → `pngcheck` = health check → `binwalk` = hidden layers**
> ```
>  After fixing the file:
>   
>     # 1. Verify the file command recognizes it:
```
>     file fixed.png
```
>   
>     # 2. View the image:
```
>     eog fixed.png     # GNOME Image Viewer
```
>     # or
```
>     feh fixed.png
```
>     # or
```
>     xdg-open fixed.png
```
>   
> ```
