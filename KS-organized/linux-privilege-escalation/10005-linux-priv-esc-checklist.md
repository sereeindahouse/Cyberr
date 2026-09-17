---
title: Linux Privilege Escalation Checklist
category: linux-privilege-escalation
tags: [ks-import, privilege-escalation, linux, enumeration, commands, checklist]
source: cheater/cheatshit 3.md
sourceId: 10005
---
# 🏰 LINUX CASTLE — Privilege Escalation Story

Чи аль хэдийн Linux machine-д shell-тэй болсон.

```
🌐 Outside
    ↓
👤 YOU
    ↓
🏰 Linux
```

Гэхдээ чи одоогоор:

```
UID = 1000
👤 ordinary user
```

байж магадгүй.

Харин дээд давхарт:

```
👑 ROOT
```

сууж байна.

Чиний зорилго:

> **“Би root болох ямар legitimate weakness / misconfiguration байгааг олох вэ?”**

Тэгээд чи castle-аа нэг бүрчлэн шалгана.

---

# 🗺️ Бүх storyline

```
           🏰 LINUX CASTLE
                  │
                  ▼
           👤 WHO AM I?
                  │
                  ▼
        🔑 WHAT POWER DO I HAVE?
                  │
                  ▼
        🚪 WHAT SPECIAL DOORS?
                  │
                  ▼
          ⏰ WHAT RUNS BY ITSELF?
                  │
                  ▼
          📄 WHAT FILES EXIST?
                  │
                  ▼
         👀 WHAT IS RUNNING?
                  │
                  ▼
          ✍️ WHAT CAN I WRITE?
                  │
                  ▼
          🧬 IS KERNEL OLD?
                  │
                  ▼
               👑 ROOT?
```

Одоо хэсэг хэсгээр нь.

---

# 🎬 ACT 1 — “Би яг ХЭН бэ?”

Эхний хэсэг:

```
id
hostname
uname -a
cat /etc/os-release
pwd
```

Энэ бол **өөрийгөө болон байшингаа таних 5 асуулт**.

---

## 🪪 `id` = Би хэн бэ?

```
id
```

Чи өөрийн:

```
UID
GID
groups
```

зэргийг харна.

Жишээ:

```
uid=1000(karen)
```

гэсэн бол:

```
👤 Karen
UID 1000
```

Хэрэв:

```
uid=0(root)
```

бол...

😂

```
"Яагаад би root-ын өрөөнд аль хэдийн сууж байгаа юм?"
```

---

## 🏷️ `hostname` = Энэ ямар байшин бэ?

```
hostname
```

жишээ:

```
web-server-01
```

Тэгэхээр:

```
👤 You
🏠 web-server-01
```

---

## 🧬 `uname -a` = Ямар дотор эрхтэнтэй вэ?

Энэ бол машины **kernel + architecture** мэдээллийг харах.

```
🐧 Linux
🧠 Kernel
💻 Architecture
```

---

## 📋 `/etc/os-release` = Ямар төрлийн Linux вэ?

```
cat /etc/os-release
```

Энэ:

```
Ubuntu
Debian
Fedora
...
```

гэх мэт distribution-ийг хэлнэ.

---

## 📍 `pwd` = Би яг аль өрөөнд байна?

```
pwd
```

Жишээ:

```
/home/karen
```

Тэгэхээр:

```
🏰 /home
   └── 👤 karen
          ↑
         YOU
```

---

# 🧠 ACT 1 MEMORY

Энэ 5-ыг:

> **WHO → HOUSE → ENGINE → OS → ROOM**

гэж сана.

```
id                → 👤 WHO?
hostname          → 🏠 WHICH MACHINE?
uname -a          → 🧠 WHICH KERNEL?
os-release        → 🐧 WHICH OS?
pwd               → 📍 WHERE AM I?
```

---

# 🎬 ACT 2 — “Надад ямар 🔑 түлхүүр байна?”

Одоо чи:

```
cat /etc/passwd
cat /etc/group
sudo -l
```

гэж харна.

---

# 👥 `/etc/passwd`

Энэ бол **castle-ийн иргэдийн бүртгэл**.

```
root
alice
bob
karen
service-user
...
```

гэдэг шиг account-ууд байж болно.

Mental image:

```
📖 PEOPLE BOOK

👑 root
👤 alice
👤 bob
🤖 backup
🤖 service
```

Чи:

> “Энд ямар төрлийн хүмүүс байна?”

гэж асууж байна.

---

# 👪 `/etc/group`

Харин энэ:

> **“Хэн ямар клубт ордог вэ?”**

гэдгийг харуулна.

```
Karen
 ├── users
 ├── sudo
 ├── docker
 └── developers
```

гэх мэт.

### Гол санаа:

```
passwd → WHO
group  → WHO WITH WHOM
```

---

# 👑 `sudo -l`

Энэ бол хамгийн чухал асуултуудын нэг:

> **“Root надад ямар түлхүүр зээлүүлсэн бэ?”**

```
sudo -l
```

Жишээ нь хэрэглэгчид тодорхой command privileged context-д ажиллуулах эрх өгсөн байж болно.

Тэгээд чи:

```
🔑 My allowed privileges
```

гэсэн жагсаалт харж байна.

### 🧠 Memory:

> **`sudo -l` = “What power has root already given me?”**

---

# 🎬 ACT 3 — “Нууц хаалга байна уу?”

Одоо SUID / SGID / capabilities руу орно.

Эндээс гол idea:

> **Зарим программ энгийн хэрэглэгчээс илүү тусгай эрхтэй ажиллаж чаддаг.**

---

# 🗝️ SUID = Owner-ийн ID card өмсөх

```
find / -perm -4000 -type f 2>/dev/null
```

Энд:

```
4000 = SUID
```

гэж сана.

Mental image:

```
👤 YOU
   ↓
🚪 SUID PROGRAM
   ↓
🪪 "Би owner-ийн badge зүүсэн."
```

Тиймээс SUID executable харагдвал:

> **“Энэ программ ямар эрхтэй ажиллаж байна?”**

гэж асууна.

---

# 👥 SGID

```
find / -perm -2000 -type f 2>/dev/null
```

Энэ удаа:

```
2000 = SGID
```

Group identity-тэй холбоотой тусгай behavior.

### Санах арга:

```
4000 → SUID → 👤 USER
2000 → SGID → 👥 GROUP
```

---

# 🧩 Capabilities

```
getcap -r / 2>/dev/null
```

Энэ нь бүр сонирхолтой.

Root бол:

```
👑 MASTER KEY
```

Capabilities бол:

```
🔑 нэг жижиг special power
```

Жишээ mental model:

```
Program
   │
   ├── normal powers
   │
   └── + one special capability
```

Тэгэхээр:

> **“Энэ программ бүх root биш ч root-ын аль нэг тусгай чадварыг авсан уу?”**

гэдгийг шалгаж байна.

---

# 🧠 ACT 3 MEMORY

```
SUID
 ↓
"Owner-ийн badge байна уу?"

SGID
 ↓
"Group-ийн badge байна уу?"

Capabilities
 ↓
"Нууц special power байна уу?"
```

---

# 🎬 ACT 4 — “Хүмүүс хаа сайгүй нууц үлдээдэг”

Одоо:

```
📄 config
🧠 history
🔑 credentials
```

хайна.

Энийг би:

# 🕵️ “Хүний мартсан юмс”

гэж нэрлэнэ.

---

## 📄 Config files

```
*.conf
*.config
```

гэдэг нь программын **зааврын ном**.

Жишээ mental picture:

```
📘 application.conf

database = ...
username = ...
password = ...
```

Тиймээс config:

> **“Программ өөрөө ямар нууцтай вэ?”**

гэсэн асуултад хариулж болно.

---

# 🧠 Bash History = Хүний ой санамж

```
cat ~/.bash_history
```

гэдэг нь:

> **“Энэ user өмнө нь terminal дээр юу хийж байсан бэ?”**

гэдгийг хардаг.

Хүмүүс заримдаа command line дээр:

```
ssh ...
mysql ...
export ...
```

зэрэг sensitive мэдээллийг санамсаргүй үлдээж чадна.

Тиймээс:

```
🧠 history = хүний өнгөрсөн мөр
```

---

# 🌐 `/var/www` = Website-ийн арын өрөө

Website source code дотор configuration, connection information, application secrets зэрэг зүйл **байж болох**.

Тиймээс:

```
/var/www
   ↓
web source
   ↓
config
   ↓
possible credentials
```

гэж харна.

---

# 🎬 ACT 5 — “Одоо энэ castle-д ЮУ амьдарч байна?”

Одоо:

```
ps aux
ps aux | grep root
```

---

# 👀 `ps aux` = CCTV

Энэ бол:

> **“Одоогоор ямар process ажиллаж байна?”**

гэсэн асуулт.

```
⚙️ nginx
⚙️ apache
⚙️ mysql
⚙️ python
⚙️ backup
...
```

гэх мэт.

---

# 👑 `ps aux | grep root`

Энэ бол:

> **“Root яг юу хийж байна?”**

гэсэн камер.

Яагаад сонирхолтой вэ?

Учир нь зарим privileged service эсвэл custom process системийн trust relationship дээр тулгуурладаг.

---

# 🚪 `ss -tulnp` / `netstat -tulnp`

Энийг:

> **Castle-ийн нээлттэй хаалгууд**

гэж төсөөл.

```
22    → 🚪
80    → 🚪
3306  → 🚪
8080  → 🚪
```

гэх мэт.

Тэгээд асуулт:

> **“Ямар service аль хаалганы цаана сонсож байна?”**

---

# 🎬 ACT 6 — “Хэзээ юу автоматаар ажилладаг вэ?”

Энд:

# ⏰ CRON

орж ирнэ.

Cron бол **шөнийн робот**.

```
⏰ 02:00
   ↓
🤖 backup runs
```

Тэгэхээр:

```
cat /etc/crontab
crontab -l
ls -la /etc/cron.*
```

гэх мэтээр:

> **“Ямар ажил хэзээ автоматаар ажилладаг вэ?”**

гэж шалгана.

---

# 🧠 Cron-ийн жинхэнэ асуулт

Зүгээр:

> “Cron байна уу?”

биш.

Харин:

```
🤖 WHAT?
+
⏰ WHEN?
+
👤 WHO?
+
✍️ CAN IT BE CHANGED?
```

гэдгийг бод.

Жишээлбэл:

```
👑 root
   ↓
⏰ cron
   ↓
📄 script
```

гэсэн chain байвал:

> **“Root автоматаар юуг ажиллуулдаг вэ?”**

гэдэг асуулт маш чухал болно.

---

# 🎬 ACT 7 — “Би хаана 📝 бичиж чаддаг вэ?”

Энэ:

```
find / -writable -type d 2>/dev/null
find / -writable -type f 2>/dev/null
```

гэсэн хэсэг.

Энийг:

# ✍️ “Би юунд гар хүрч чадах вэ?”

гэж сана.

Чи ямар нэг файлд:

```
👀 READ
```

эрхтэй байж болно.

Гэхдээ:

```
✍️ WRITE
```

эрхтэй бол илүү их боломжтой.

Гэхдээ **writable = automatically vulnerable** биш.

Хамгийн чухал chain:

```
✍️ WRITE
   +
👑 PRIVILEGED PROCESS TRUSTS IT
   +
⚙️ IT GETS EXECUTED/LOADED
```

байх үед асуудал болж болно.

---

# 🎬 ACT 8 — “Castle-ийн foundation хуучин уу?”

Сүүлд:

```
uname -a
cat /proc/version
```

гээд kernel-ийн хувилбарыг шалгана.

Тэгээд:

```
searchsploit ubuntu 16.04
```

гэх мэтээр public exploit мэдээлэл хайж болно.

Гэхдээ энд маш чухал:

> **“Exploit олдлоо” ≠ “энэ машин дээр ажиллана.”**

Чи version, architecture, configuration, patch level, шаардлагатай нөхцөл зэргийг тулгах хэрэгтэй.

---

# ☠️ Kernel = BIG HAMMER

Яагаад хамгийн сүүлд?

Учир нь:

```
Sudo
SUID
Capabilities
Cron
Credentials
Writable files
```

гээд илүү энгийн зам байхад:

```
💣 KERNEL EXPLOIT
```

рүү шууд үсрэх шаардлагагүй.

Mental model:

```
🔑 жижиг түлхүүр олдож магадгүй
        ↓
🚪 эхлээд энгийн хаалгыг шалга
        ↓
💣 том hammer-ийг хамгийн сүүлд
```

---

# 🧠 ОДОО БҮХ NOTES-ИЙГ НЭГ STORY БОЛГО

Чи Linux machine дотор орлоо:

```
                 🏰 LINUX
                    │
                    ▼
              👤 WHO AM I?
                    │
                    ▼
          🔑 WHAT POWER DO I HAVE?
                    │
           ┌────────┼────────┐
           ▼        ▼        ▼
         SUDO     SUID      CAPS
           │        │        │
           └────────┼────────┘
                    ▼
             📄 WHAT EXISTS?
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       CONFIG     HISTORY   CREDS
          │
          ▼
           ⚙️ WHAT IS RUNNING?
                    │
                    ▼
                🚪 PORTS
                    │
                    ▼
             ⏰ WHAT RUNS
                AUTOMATICALLY?
                    │
                    ▼
                ✍️ WHAT
              CAN I WRITE?
                    │
                    ▼
             🧬 OLD KERNEL?
                    │
                    ▼
                  👑
                 ROOT
```

---

# 🔥 Харин энэ note-ийн хамгийн чухал concept

Чи **“8 exploit цээжлэх”** гэж бүү бод.

Чи ердөө:

> **“Privilege escalation гэдэг нь системээс аль хэдийн надад өгөгдсөн итгэлцэл, permission, automation, configuration-ийн хаана нь алдаа байгааг олох процесс.”**

гэж ойлго.

Тэгээд 8 vector-ийг ингэж хар:

|Vector|Толгойдоо харах зураг|
|---|---|
|👑 Sudo|“Root надад ямар түлхүүр өгсөн?”|
|🧷 SUID|“Ямар program owner-ийн badge өмсдөг?”|
|🧬 Capabilities|“Хэнд root-ийн жижиг power өгсөн?”|
|⏰ Cron|“Root хэзээ юу автоматаар ажиллуулдаг?”|
|📄 Files/creds|“Хүмүүс хаана нууцаа үлдээсэн?”|
|🛣️ PATH|“Program яг аль command-ийг сонгох вэ?”|
|🧪 .so|“Program ямар library-д итгэдэг вэ?”|
|☠️ Kernel|“Системийн суурь өөрөө эмзэг үү?”|

## 🧠 SUPER MEMORY HOOK

> **👤 WHO → 🔑 POWER → 📄 SECRETS → ⚙️ RUNNING → ⏰ AUTOMATION → ✍️ WRITE → 🧬 KERNEL**
