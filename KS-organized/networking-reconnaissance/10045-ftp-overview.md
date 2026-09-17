---
title: FTP Server Overview and Exploitation
category: networking-reconnaissance
tags: [ks-import, ftp, file-transfer, anonymous-login, read-write, exploitation]
source: useful things/FTP.md
sourceId: 10045
---
# 📦 FTP SERVER — “ФАЙЛЫН АГУУЛАХЫН ХААЛГА”

Эхлээд:

```
🚪 Port 21
   ↓
📦 FTP service
   ↓
📁 Files
```

FTP-г:

> **“Server-ийн файлын агуулахын хаалга”**

гэж төсөөл.

Чи хаалга `21` дээр очлоо.

---

# 🎬 ACT 1 — FTP яг юу хийдэг вэ?

FTP = **File Transfer Protocol**

Тэгэхээр гол ажил нь:

```
👤 Client
   │
   │ FTP
   ▼
🏠 FTP Server
   │
   ├── 📄 file1
   ├── 📦 backup.zip
   └── 📁 uploads
```

Client server-ээс файл:

```
⬇️ download
```

эсвэл server рүү:

```
⬆️ upload
```

хийж чадна.

Тиймээс FTP харахад хамгийн эхний асуулт:

> **“Энэ server надад яг ямар filesystem access өгч байна?”**

---

# 🧠 ACT 2 — FTP exploitation = “Файл авах” биш

Шинэ сурагчид:

> `21 = FTP = exploit`

гэж боддог.

Буруу.

Зөв mental model:

```
21
↓
FTP
↓
Authentication
↓
Authorization
↓
File access
↓
Configuration
↓
Possible weakness
```

Тэгэхээр FTP бол зүгээр л **хаалга**.

Аюул нь хаалга өөрөө биш.

> **Хаалга хэнийг, хаашаа, ямар эрхтэй оруулж байгаад** байна.

---

# 🔓 ACT 3 — Anonymous Login

FTP-ийн хамгийн алдартай шалгалт:

> **“Надаас жинхэнэ account шаардахгүйгээр оруулах уу?”**

Үүнийг:

# 👤 “Guest key”

гэж төсөөл.

Ердийн:

```
YOU
 ↓
🚪 FTP
 ↓
Username?
Password?
 ↓
✅
```

Anonymous:

```
YOU
 ↓
🚪 FTP
 ↓
"I'm anonymous."
 ↓
"Okay."
 ↓
📁 Access
```

Энд security question:

> **Anonymous user яг юу хийж чаддаг вэ?**

---

## ⚠️ Anonymous access = automatic vulnerability биш

Энэ маш чухал.

Жишээ:

```
Anonymous
   ↓
📁 public/
   ↓
READ ONLY
```

бол application-ийн зорилго байж болно.

Харин:

```
Anonymous
   ↓
📁 sensitive/
   ↓
READ
```

эсвэл:

```
Anonymous
   ↓
⬆️ WRITE
```

бол илүү сонирхолтой.

Тиймээс:

> **Authentication weakness ≠ immediate compromise**

---

# 📖 ACT 4 — READ vs WRITE

FTP дээр хамгийн чухал хоёр үг:

```
READ
WRITE
```

### 👀 READ

> “Би file авч чадна.”

```
SERVER
  ↓
📄 secret.txt
  ↓
👤 YOU can READ
```

### ✍️ WRITE

> “Би file байршуулж/өөрчилж чадна.”

```
👤 YOU
   ↓
⬆️ upload
   ↓
SERVER
```

Тэгэхээр write permission илүү хүчтэй асуулт үүсгэнэ:

> **“Миний оруулсан файл хаана очдог вэ, түүнийг өөр ямар privileged component ашигладаг вэ?”**

---

# 🧩 ACT 5 — FTP дээр “хамгийн сонирхолтой file” гэж юу вэ?

FTP server дээр:

```
📄 backup.zip
📄 config.txt
📄 users.txt
📄 old_backup.tar
📁 uploads/
📁 public/
```

гэх мэт зүйл байж болно.

Security researcher:

> “File байна”

гээд зогсохгүй.

Харин:

```
Who owns it?
Who can read it?
Who can write it?
Is it sensitive?
Is it reused elsewhere?
```

гэж бодно.

---

# 🕵️ ACT 6 — Backup = TIME CAPSULE

FTP дээр `backup` файлууд их сонирхолтой.

Яагаад?

Учир нь backup бол:

> **“Системийн хуучин үеийн snapshot”**

гэж төсөөлж болно.

```
NOW
 ↓
🔐 current config

BACKUP
 ↓
🗃️ old config
🗃️ old credentials
🗃️ old source
🗃️ old secrets
```

Тиймээс:

> **Backup = өнгөрсөн үеийн мартсан нууц**

гэсэн memory hook ашиглаж болно.

Гэхдээ backup-д нууц байгаа нь deterministic биш; шалгаж байж мэднэ.

---

# 🚨 ACT 7 — FTP Service Version

FTP server өөрөө ч software.

Жишээ:

```
vsftpd
ProFTPD
Pure-FTPd
...
```

Тиймээс:

```
🚪 Port 21
     ↓
📦 FTP
     ↓
⚙️ Which FTP implementation?
     ↓
🔢 Which version?
```

гэдгийг мэдэх хэрэгтэй.

Энэ нь чиний өмнөх `uname -a` / `os-release` concept-тэй адил.

> **Software + Version = боломжит attack surface**

Гэхдээ:

> **“Version хуучин байна” ≠ “заавал exploit болно.”**

Patch/configuration шалгана.

---

# 🧠 ACT 8 — Misconfiguration vs Vulnerability

FTP сурахад энэ ялгааг сайн ойлго.

## Misconfiguration

Жишээ:

```
Anonymous access
```

эсвэл:

```
Anonymous write
```

бол configuration-ийн асуудал байж болно.

## Software vulnerability

Харин FTP daemon-ийн code дотор:

```
memory corruption
authentication bypass
command injection
...
```

гэх мэт implementation bug байвал vulnerability.

Mental map:

```
FTP
├── ⚙️ Misconfiguration
│    ├── anonymous access
│    ├── weak permissions
│    └── unsafe sharing
│
└── 🐛 Software vulnerability
     ├── bug
     ├── memory issue
     └── auth flaw
```

---

# 🎬 ACT 9 — FTP-г шалгах логик

Зөвшөөрөлтэй lab дээр чи FTP оллоо гэж бодъё.

Mental checklist:

```
🚪 21 open?
      ↓
📦 Which FTP server?
      ↓
🔢 Which version?
      ↓
👤 Authentication required?
      ↓
👤 Anonymous allowed?
      ↓
👀 What can anonymous READ?
      ↓
✍️ What can anonymous WRITE?
      ↓
📁 What directories are exposed?
      ↓
🔐 Are there sensitive files?
      ↓
⚙️ Is configuration unsafe?
      ↓
🐛 Is there a known software vulnerability?
```

Энэ бол exploit command цээжлэхээс хавьгүй чухал.

---

# 🧠 FTP-ийн “3 Doors”

FTP-г ингэж санаж болно:

```
             📦 FTP
                │
       ┌────────┼────────┐
       ↓        ↓        ↓
    👤 WHO?   👀 WHAT?  ✍️ CAN I CHANGE?
```

### 👤 WHO?

Хэн нэвтэрч чаддаг вэ?

### 👀 WHAT?

Юуг харах/татах боломжтой вэ?

### ✍️ CAN I CHANGE?

Юуг upload/modify хийж болох вэ?

---

# 🧠 “Anonymous FTP”-г бүр амархан санах арга

Төсөөл:

🏢 **File warehouse**

Хаалган дээр:

```
SECURITY:
"ID?"

YOU:
"I'm nobody."

SECURITY:
"Okay, come in."
```

😂

Гэхдээ дараагийн асуулт нь хамгийн чухал:

> **“Guest-д агуулахын аль өрөөнүүд нээлттэй вэ?”**

```
Anonymous
   ↓
📦 Public folder       ✅
📁 Backups             ?
🔐 Private data        ?
⬆️ Upload              ?
```

Ингэж бод.

---

# 🔥 FTP → PRIVESC CONNECTION

FTP өөрөө privilege escalation биш.

Харин заримдаа:

```
FTP
 ↓
file access
 ↓
interesting file / credential / write access
 ↓
another service trusts that file
 ↓
new access
 ↓
potential privilege escalation
```

гэж **chain** үүсч болно.

Энэ бол cybersecurity-ийн маш чухал ойлголт:

> **Нэг weakness ганцаараа root болгох албагүй. Нэг weakness дараагийн хаалгыг нээж болно.**

---

# 🧠 Жишээ Mental Story

```
🏠 SERVER

🚪 21 FTP
     ↓
👤 Anonymous allowed
     ↓
📁 backup.zip visible
     ↓
🔑 useful credential discovered
     ↓
🚪 another service
     ↓
👤 authenticated user
     ↓
⬆️ privilege escalation
     ↓
👑 ROOT
```

Энд FTP **эцсийн exploit биш**.

FTP бол:

> **“Эхний clue”**

байж байна.

---

# 🎯 FTP SUPER MEMORY WALL

```
🚪 21
 ↓
📦 FTP
 ↓
👤 AUTH
 ↓
👀 READ
 ↓
✍️ WRITE
 ↓
📁 FILES
 ↓
🗃️ BACKUPS
 ↓
🔢 VERSION
 ↓
⚙️ CONFIG
 ↓
🐛 SOFTWARE BUG
```
