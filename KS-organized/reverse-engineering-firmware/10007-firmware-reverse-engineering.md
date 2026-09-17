---
title: Firmware Reverse Engineering with Binwalk
category: reverse-engineering-firmware
tags: [ks-import, firmware, binwalk, magic-bytes, extraction, reverse-engineering]
source: cheater/cheatshit 5.md
sourceId: 10007
---
🧠 Cybersecurity Field Guide

> **Purpose:** Turn a dense technical cheat sheet into a visual, memorable Obsidian note.
> 
> ⚠️ **Use only on systems, networks, binaries, and labs you are explicitly authorized to test.**

---

# 🗺️ The Big Picture

Think of the whole workflow as a game map:

```
🛰️ RECON
   ↓
🚪 SERVICES
   ↓
🔓 ACCESS
   ↓
⬆️ PRIV ESC
   ↓
🔬 REVERSE ENGINEERING
   ↓
📦 FIRMWARE
```

### 🧩 Memory Hook

> **“See → Enter → Rise → Understand → Extract”**

|Stage|Question to remember|
|---|---|
|🛰️ Recon|**What exists?**|
|🚪 Services|**What is exposed?**|
|🔓 Access|**Can the service be abused?**|
|⬆️ Priv Esc|**How do I go higher?**|
|🔬 RE|**What is the binary doing?**|
|📦 Firmware|**What is hidden inside?**|
# 📦# 📦 SECTION 5 — FIRMWARE & EMBEDDED REVERSE ENGINEERING

Энэ хэсгийг хамгийн түрүүнд ингэж төсөөл:

> 🧠 **Firmware = төхөөрөмжийн “тархи + filesystem + configuration + application” бүгдийг нэг image дотор савласан багц.**

Жишээ нь:

```
📡 Router firmware
      │
      ▼
┌─────────────────────────────┐
│      FIRMWARE IMAGE         │
│                             │
│  🧠 Kernel                  │
│  📁 Root filesystem         │
│  🌐 Web interface           │
│  ⚙️ Config                  │
│  🔑 Credentials             │
│  📦 Libraries               │
│  ⚡ Startup scripts         │
└─────────────────────────────┘
```

Тиймээс firmware RE-ийн гол асуулт:

> **“Энэ төхөөрөмж асаад ажиллахын тулд яг юу авч явж байна?”**

---

# 🎬 5.1 — `binwalk` = 🗺️ “Firmware-ийн рентген зураг”

Firmware файлыг чи:

```
📦 router.bin
```

гэж харахад нэг том файл шиг.

Гэхдээ дотор нь:

```
[HEADER]
[KERNEL]
[COMPRESSED FS]
[CONFIG]
[WEB FILES]
[OTHER DATA]
```

гэх мэт олон давхарга байж болно.

Тиймээс:

```
binwalk firmware.img
```

гэдгийг:

> 🔦 **“Энэ нэг том file дотор ямар ямар зүйл нуугдаж байна?”**

гэж ойлго.

---

# 🔍 Magic bytes гэж юу вэ?

Компьютер зарим file type-ийг extension-ээр биш, **эхний/онцгой byte pattern**-аар таньдаг.

Жишээ mental image:

```
📦 firmware.img

0000  ?????
0010  ????
...
```

Binwalk:

```
👀 "Аан!
Энд compressed archive байна.
Энд filesystem signature байна.
Энд kernel-тэй төстэй data байна."
```

Тэгэхээр:

> **Magic bytes = file-ийн “хурууны хээ”.**

### 🧠 Memory hook

**binwalk = “Нэрийг нь биш, хурууны хээг нь хай.”**

---

# 📦 `binwalk -e` = “Рентгенээс цаашлаад задал”

```
binwalk -e firmware.img
```

Энэ:

```
📦 Firmware
    ↓
🔎 Detect layers
    ↓
✂️ Extract recognized content
    ↓
📁 Files / filesystem / components
```

гэдэг санаа.

Тэгээд:

```
firmware.img
   ↓
_extracted/
   ├── kernel
   ├── filesystem
   ├── ...
```

гэх мэт бүтэц гарч ирж болно.

### 🧠 Difference

```
binwalk
   ↓
👀 "Юу байна?"

binwalk -e
   ↓
✂️ "Задлая."
```

---

# 🧱 5.2 — JFFS2 гэж юу вэ?

Энд нэг том concept нэмэх хэрэгтэй.

Firmware image дотор filesystem байдаг.

Linux PC дээр чи:

```
ext4
xfs
btrfs
```

гэдгийг харж болно.

Embedded төхөөрөмж дээр flash memory-д зориулсан filesystem-үүд элбэг.

**JFFS2 = Journalling Flash File System 2**

гэж сана.

Энийг:

> 🧰 **“Flash memory дээр filesystem хэлбэрээр файл хадгалах систем.”**

гэж ойлго.

---

# 🧠 Яагаад JFFS2 хэрэгтэй вэ?

Embedded device:

```
💾 Flash memory
```

ашигладаг.

Flash-ийн behavior нь энгийн hard disk-ээс өөр.

Тиймээс embedded-oriented filesystem хэрэгтэй.

Mental model:

```
🧠 Linux
   │
   ▼
📁 Filesystem
   │
   ▼
💾 Flash memory
```

---

# 🚪 5.2.1 — Mount гэж яг юу вэ?

Энэ concept маш чухал.

Чи filesystem-ийг:

```
📦 JFFS2 image
```

гэж авлаа.

Гэхдээ тэр одоохондоо “file” байна.

Linux:

> “Би үүнийг folder шиг ашигламаар байна.”

Тэгээд:

```
MOUNT
```

хийнэ.

Mental image:

```
📦 filesystem image
       │
       │ mount
       ▼
📂 /mnt/jffs2_file/
```

Одоо чи:

```
cd /mnt/jffs2_file/
ls
```

гэж filesystem дотор байгаа юм шиг ажиллаж чадна.

### 🧠 Memory

> **Mount = “Filesystem-ийг Linux-ийн directory tree-д залгах.”**

Энийг маш сайн ойлго. Reverse engineering-д байнга таарна.

---

# 🧱 `mknod` — “Linux-д block device байгаа мэт харагдуулах”

```
sudo mknod /dev/mtdblock0 b 31 0
```

Энэ хэсгийг command цээжлэхээс илүү concept-оор ойлго.

`/dev/...` дотор Linux-ийн төхөөрөмжүүдийг **device node** хэлбэрээр төлөөлүүлж болдог.

Энд:

```
/dev/mtdblock0
```

гэдэг нь:

> **Flash/block device-ийг filesystem-д хүргэх interface**

гэж төсөөлж болно.

---

# 🧩 `modprobe`

```
sudo modprobe jffs2 mtdram mtdblock
```

Энэ:

> **“Kernel-д хэрэгтэй module-уудыг ачаал.”**

гэсэн санаа.

Mental image:

```
🧠 Kernel
  │
  ├── JFFS2 knowledge ❌
  │
  ├── MTD support ❌
  │
  ▼
modprobe
  │
  ▼
modules loaded ✅
```

### 🧠 Memory

> **modprobe = “Kernel-д шинэ чадвар суулгах.”**

---

# 💾 `dd` — “Raw bytes зөөх”

```
sudo dd if=filesystem.jffs2 of=/dev/mtdblock0
```

`dd`-г:

> 📦 **“Bytes-ийг яг raw байдлаар хуулдаг машин.”**

гэж ойлго.

```
if = input file
of = output file
```

Тэгэхээр:

```
filesystem.jffs2
       │
       │ raw bytes
       ▼
/dev/mtdblock0
```

### 🧠 Memory

> **`if` = авч байгаа зүйл**
> 
> **`of` = очих газар**

---

# 📂 `mount`

```
sudo mount -t jffs2 /dev/mtdblock0 /mnt/jffs2_file/
```

Одоо:

```
💾 block device
   ↓
🧱 JFFS2
   ↓
📂 /mnt/jffs2_file/
```

гээд Linux filesystem tree-д залгагдана.

---

# ⚠️ Гэхдээ firmware RE дээр илүү чухал арга байдаг

Чиний source энэ JFFS2 mounting workflow-ийг өгч байна. Гэхдээ firmware image бүр:

> **JFFS2 байна**

гэсэн үг биш.

Өөр firmware:

```
SquashFS
UBIFS
CramFS
YAFFS
ext filesystem
custom container
```

гэх мэт байж болно.

Тиймээс зөв workflow:

```
🔎 Identify filesystem
       ↓
🤔 What filesystem is it?
       ↓
🛠️ Choose appropriate extraction/mount method
```

### 🧠 Golden rule

> **Эхлээд filesystem-ийг тань. Дараа нь mount хийх арга сонго.**

---

# 🎯 5.3 — Firmware дотор юуг хамгийн түрүүнд үзэх вэ?

Одоо firmware-г:

# 🏠 Нэг төхөөрөмжийн бүхэл бүтэн байшин

гэж бод.

---

## 🔑 `/etc/shadow` / `/etc/passwd`

```
/etc/passwd
/etc/shadow
```

Энд operating system-ийн account-related information байна.

Mental image:

```
📁 /etc
   │
   ├── 👥 passwd
   └── 🔐 shadow
```

Reverse engineering perspective:

> **“Төхөөрөмж дээр ямар account model ашигласан бэ?”**

гэж харахад тусална.

Hardcoded/default credentials байж болох эсэхийг мөн судална.

---

# 🌐 `/www` / `/htdocs`

Энийг:

# 🖥️ “Router-ийн веб application-ийн арын өрөө”

гэж төсөөл.

```
Browser
   ↓
🌐 Web UI
   ↓
/www
/htdocs
   ↓
HTML
PHP
JS
templates
config
```

Эндээс:

```
🔐 authentication
⚙️ configuration
🌐 API endpoints
🧠 business logic
```

гэх мэт зүйлсийг судалж болно.

Төхөөрөмжийн admin panel-ийн frontend/backend behavior-ийг ойлгоход их үнэ цэнтэй.

---

# 🏭 `/etc/system_defaults`

Энэ зам нь universal Linux standard path биш гэдгийг анхаар.

Гэхдээ тухайн төхөөрөмжийн firmware-д ийм custom path байвал:

```
/etc/system_defaults
```

гэх мэт файл/directory дотор:

```
🏭 Factory defaults
🔑 Default credentials
📡 AP keys
⚙️ Device settings
```

байж болох тул high-value target болдог.

### 🧠 Memory:

> **Factory reset хийсний дараа төхөөрөмж яаж дахин “танил” болдог вэ?**

гэсэн асуулт асуу.

---

# 🧠 Firmware RE дээр ЭНЭ 5 АСУУЛТЫГ асуу

Firmware задласныхаа дараа:

### 1️⃣ 🧩 ЯМАР FORMAT?

```
SquashFS?
JFFS2?
UBIFS?
Custom?
```

### 2️⃣ 🧠 ЯМАР KERNEL?

```
version?
architecture?
modules?
```

### 3️⃣ 👤 ЯМАР USER?

```
/etc/passwd
/etc/shadow
```

### 4️⃣ 🌐 ЯМАР APPLICATION?

```
/www
/htdocs
/cgi-bin
```

### 5️⃣ 🔑 ЯМАР SECRET?

```
config
keys
passwords
certificates
default settings
```

---

# 🔥 Би энэ хэсэгт 4 concept нэмж цээжлүүлэхийг зөвлөе

Энэ нь чиний одоогийн note-ийг илүү сайн болгоно.

---

## 🧠 1. Architecture

Firmware:

```
ARM?
MIPS?
x86?
ARM64?
```

гэдгийг мэдэх хэрэгтэй.

Яагаад?

Учир нь:

```
📦 Binary
   ↓
🧠 CPU architecture
   ↓
🔬 Disassembly / execution
```

architecture буруу ойлговол binary-ийн analysis утгаа алдана.

---

## 🧠 2. Compression vs Filesystem

Firmware дотор:

```
COMPRESSED DATA
```

байж болно.

Энэ нь:

> **filesystem**

гэдэгтэй адил биш.

Mental distinction:

```
🗜️ Compression
= "жижиг болгож багцалсан"

📁 Filesystem
= "файлуудыг зохион байгуулсан бүтэц"
```

Энэ хоёрыг ялга.

---

## 🧠 3. Entropy

Firmware analysis-д data-ийн **entropy** нь заримдаа:

> “Энэ хэсэг compressed/encrypted байх магадлалтай юу?”

гэх мэт асуултад clue өгч болно.

Mental image:

```
📉 Low entropy
→ structure/text илүү харагдах

📈 High entropy
→ compressed/encrypted/random-looking
```

Гэхдээ entropy **дангаараа encrypted гэдгийг батлахгүй**.

---

## 🧠 4. Strings first

Firmware задалсны дараа шууд бүх binary-г reverse engineer хийх хэрэггүй.

Эхлээд:

```
📦 extract
 ↓
🧾 strings
 ↓
🔍 grep/search
 ↓
🎯 interesting binary
 ↓
🔬 deeper RE
```

гэж явбал илүү үр дүнтэй.

Жишээ clue:

```
"admin"
"password"
"http"
"/cgi-bin/"
"telnet"
"ssh"
"factory"
```

гэх мэт strings нь хаашаа ухахаа зааж болно.

---

# 🗺️ FIRMWARE RE — COMPLETE MAP

Одоо бүх хэсгийг нэг зураг болгоё:

```
                 📦 FIRMWARE
                      │
                      ▼
                🔎 BINWALK
                      │
             "Юу дотор байна?"
                      │
                      ▼
                  ✂️ EXTRACT
                      │
                      ▼
             🧩 IDENTIFY FORMAT
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
      JFFS2        SquashFS       UBIFS
        │
        ▼
       🧱 MOUNT
        │
        ▼
       📂 ROOT FS
        │
   ┌────┼────┬─────────┐
   ▼    ▼    ▼         ▼
 /etc  /www  configs  binaries
   │    │      │          │
   ▼    ▼      ▼          ▼
 users web    secrets     🔬 RE
   │    │
   └────┴──────────┬─────────
                   ▼
                🧠 DEVICE
                   LOGIC
```

---

# 🧠 ONE-PAGE MEMORY WALL — Илүү хүчтэй хувилбар

```
📦 FIRMWARE
│
├── 🔎 binwalk
│     └── "What layers exist?"
│
├── ✂️ extract
│     └── "Give me the pieces."
│
├── 🧩 identify FS
│     └── JFFS2 / SquashFS / UBIFS / ...
│
├── 🧱 mount
│     └── "Turn filesystem into folders."
│
├── 🧬 architecture
│     └── ARM / MIPS / x86 / ARM64
│
├── 🧠 kernel
│     └── version / modules
│
├── 👥 accounts
│     └── /etc/passwd / shadow
│
├── 🌐 web
│     └── /www /htdocs /cgi-bin
│
├── 🔑 secrets
│     └── configs / keys / credentials
│
├── 🏭 defaults
│     └── factory settings
│
└── 🔬 binaries
      └── strings → disassemble → trace
```

## 🎯 Firmware-ийн супер memory hook

> **FIND → EXTRACT → IDENTIFY → MOUNT → EXPLORE → RE**

эсвэл бүр Монгол зураг:

> 🔎 **Ол → ✂️ Задал → 🧩 Таних → 🧱 Залга → 🕵️ Судал → 🔬 Reverse engineer**

---

### 🧠 Бүх cybersecurity note-оо нийлүүлбэл

```
🛰️ RECON
"What exists?"

      ↓

🚪 SERVICES
"What is exposed?"

      ↓

🔓 ACCESS
"What can I interact with?"

      ↓

⬆️ PRIV ESC
"What trust/permission can be abused?"

      ↓

🔬 RE
"What is the binary actually doing?"

      ↓

📦 FIRMWARE
"What is hidden inside the device?"
```

Ингээд firmware нь тусдаа сэдэв биш болж байгаа юм.

**Recon**-оор төхөөрөмжийг гаднаас нь харна → **Priv Esc**-ээр OS-ийн доторх эрхийн бүтцийг харна → **Reverse Engineering**-ээр binary-ийн дотор орно → **Firmware RE**-ээр бүхэл төхөөрөмжийн image-ийг задлаад **kernel + filesystem + web application + credentials + binaries**-г нэг дор харна.

Энэ холбоосыг ойлговол note чинь command cheat sheet биш, **нэг бүтэн cybersecurity map** болж эхэлнэ.
