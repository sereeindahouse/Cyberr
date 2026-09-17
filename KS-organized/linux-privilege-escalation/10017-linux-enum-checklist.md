---
title: Initial Linux Enumeration Checklist
category: linux-privilege-escalation
tags: [ks-import, enumeration, linux, privilege-escalation, system-info]
source: linux prev fundd/linux prev.md
sourceId: 10017
---
# 🏠 SCENE: Чи Linux машин дотор орчихлоо

Чи SSH, exploit, web shell гэх мэтээр аль нэг аргаар shell авлаа гэж бодъё.

Одоо:

```
👤 YOU
  ↓
💻 Linux Machine
```

Гэхдээ чи юу ч мэдэхгүй.

```
❓ Ямар machine?
❓ Би хэн бэ?
❓ Root байж болох уу?
❓ Ямар хэрэглэгчид байна?
❓ Сонирхолтой файл байна уу?
❓ Ямар service ажиллаж байна?
❓ Root-оор ажилладаг job байна уу?
❓ Надад бичих permission байгаа газар байна уу?
❓ Kernel хуучин уу?
```

Тэгээд энэ checklist гарч ирнэ.

---

# 🎬 1. “БИ ХААНА БАЙНА?”

Эхний 5 command бол **GPS + паспорт**.

```
id
hostname
uname -a
cat /etc/os-release
pwd
```

---

## 🪪 `id`

```
id
```

Энэ бол:

> **“Би яг хэн бэ?”**

гэсэн асуулт.

Жишээ:

```
uid=1000(karen) gid=1000(karen) groups=...
```

Чи:

```
👤 Karen
UID = 1000
```

гэж мэднэ.

Харин:

```
uid=0(root)
```

гарвал:

```
👑 OMG, би аль хэдийн root!
```

Тиймээс **хамгийн эхний асуулт = би ямар эрхтэй вэ?**

### 🧠 Memory

> `id` = **Identity**

---

# 🏷️ `hostname`

```
hostname
```

Энэ:

> **“Энэ машины нэр юу вэ?”**

Жишээ:

```
web-server-01
```

Тэгэхээр:

```
👤 Би = Karen
🏠 Байшин = web-server-01
```

### 🧠 Memory

> `hostname` = **House name**

---

# 🧬 `uname -a`

```
uname -a
```

Энэ бол машины **рентген зураг** шиг.

Чи kernel болон системийн ерөнхий мэдээлэл авна.

Жишээ:

```
Linux web-server 5.x.x ... x86_64 ...
```

Чамд:

```
🐧 Linux
🧠 Kernel version
💻 Architecture
```

гэх мэт зүйлс харагдана.

### 🧠 Memory

> `uname` = **“What is this machine made of?”**

---

# 📋 `cat /etc/os-release`

```
cat /etc/os-release
```

Энэ нь:

> **“Яг ямар Linux distribution вэ?”**

гэдгийг хэлнэ.

Жишээ:

```
Ubuntu
Debian
Fedora
...
```

Тэгэхээр:

```
uname -a
   ↓
Kernel

/etc/os-release
   ↓
Distribution
```

### Ялгааг анзаараарай

```
🐧 Linux
  │
  ├── Kernel → uname -a
  │
  └── Distribution → /etc/os-release
```

---

# 📍 `pwd`

```
pwd
```

Энэ:

> **“Би яг аль өрөөнд зогсож байна?”**

гэж асууж байна.

Жишээ:

```
/home/karen
```

Тэгэхээр:

```
🏠 Машин
 └── 📂 home
      └── 📂 karen
            ↑
           YOU
```

---

# 🧠 Эдгээр 5-ыг нэг зураг болго

```
        🕵️ YOU ENTERED MACHINE
                 │
       ┌─────────┼─────────┐
       ↓         ↓         ↓
      WHO       WHERE      WHAT
       │         │         │
      id      hostname   uname
       │                    │
       │               /etc/os-release
       │
       └─────── pwd ────────
```

## Memory:

> **ID → NAME → KERNEL → OS → LOCATION**

эсвэл:

> **“Би хэн бэ → ямар машин → ямар kernel → ямар OS → хаана байна?”**

---

# 🎬 2. USER & PRIVILEGE ENUMERATION

Одоо чи байшингаа танилаа.

Дараагийн асуулт:

> **“Энд өөр хэн байна, би юу хийж чадах вэ?”**

---

# 👥 `/etc/passwd`

```
cat /etc/passwd
```

Энэ бол Linux-ийн **хэрэглэгчдийн бүртгэлийн дэвтэр** гэж төсөөл.

```
root
alice
bob
karen
...
```

Бодит password-ууд энд байх ёстой гэж ойлгож болохгүй; энэ файл нь account information агуулдаг.

Төсөөл:

```
🏢 Company employee list

Alice
Bob
Karen
Admin
Backup
ServiceAccount
...
```

### Яагаад сонирхолтой вэ?

Учир нь зарим account:

```
👤 normal user
🤖 service account
👑 root
```

байж болно.

---

# 👪 `/etc/group`

```
cat /etc/group
```

Хэрэв `/etc/passwd`:

> **“Хэн хэн байна?”**

гэвэл `/etc/group`:

> **“Хэн хэнтэй нэг багт байна?”**

гэдэг.

Жишээ:

```
docker:x:999:karen
sudo:x:27:karen
```

гэх мэт.

Төсөөл:

```
Karen
 ├── sudo group
 ├── docker group
 └── developers group
```

Group membership заримдаа privilege-ийн хувьд маш чухал.

---

# 👑 `sudo -l`

```
sudo -l
```

Энэ бол:

> **“Надад админ ямар тусгай зөвшөөрөл өгсөн бэ?”**

гэдэг асуулт.

Жишээ:

```
User karen may run:
    /usr/bin/some-program
```

Чи тэгэхээр:

```
🔑 My permissions
```

гэсэн жагсаалт харж байна.

### 🧠 Memory

> `sudo -l` = **“What am I allowed to borrow from root?”**

---

# 🧟 SUID

```
find / -perm -4000 -type f 2>/dev/null
```

Энийг ойлгохын тулд **хаалганы тусгай түлхүүр** гэж төсөөл.

Ердийн executable:

```
👤 Karen
 ↓
program
 ↓
Karen эрхээр ажиллана
```

SUID executable:

```
👤 Karen
 ↓
🔑 SUID program
 ↓
👑 File owner's privilege
```

Жишээ нь root owner бол:

```
SUID root program
```

ажиллах үед тусгай privileged behavior гарч болно.

### `4000` гэж?

```
4000
 ↑
SUID bit
```

### 🧠 Memory

> **SUID = “Run wearing the owner's ID.”**

---

# 👥 SGID

```
find / -perm -2000 -type f 2>/dev/null
```

Үүнтэй төстэй боловч group identity-тэй холбоотой.

```
4000 → SUID
2000 → SGID
```

### 🧠 Memory

> **SUID = user**
> 
> **SGID = group**

---

# 🪪 Linux Capabilities

```
getcap -r / 2>/dev/null
```

Энэ бүр илүү сонирхолтой.

Root гэдэг нь:

```
👑 MASTER KEY
```

гэж төсөөл.

Capabilities бол:

```
🔑 "Only one special power"
```

Жишээ:

```
Program
 ├── special network power
 ├── special UID-changing power
 └── ...
```

өөрөөр хэлбэл:

> **“Бүх эрх биш, тодорхой нэг root-like capability өгсөн.”**

---

# 🎬 3. INTERESTING FILES & CREDENTIALS

Одоо чи:

> “Хаана нууц юм байна?”

гэж хайна.

Энэ хэсгийг би **🏠 “байшинг нэгжих”** гэж төсөөлдөг.

---

# 📄 Config files

```
find / -name "*.conf" -o -name "*.config" 2>/dev/null | head -20
```

Config file = **program-ын зааврын дэвтэр**.

Жишээ:

```
database.conf
web.config
app.conf
```

Дотор нь:

```
database = ...
username = ...
password = ...
```

гэх мэт sensitive information **байж болох** учраас шалгана.

---

# 🌐 Web application secrets

```
find /var/www -type f -name "*.php" 2>/dev/null | xargs grep -i "password\|passwd\|pwd" 2>/dev/null
```

Энэ:

> **“Web application-ийн код дотор password-тэй холбоотой зүйл байна уу?”**

гэж хайж байна.

Төсөөл:

```
/var/www
   ↓
website source
   ↓
config
   ↓
database credentials?
```

---

# 🧠 Bash history

```
cat ~/.bash_history
```

Энэ бол:

> **“Энэ хэрэглэгч өмнө нь terminal дээр юу бичиж байсан бэ?”**

гэсэн асуулт.

Хүмүүс хааяа command line дээр:

```
mysql ...
ssh ...
export ...
password ...
```

гэх мэт sensitive зүйл биччихдэг.

Тэгээд history нь:

🗒️ **“Өнгөрсөн үйлдлийн дурсамж”**

болно.

---

# 👥 Бусдын history

```
cat /home/*/.bash_history 2>/dev/null
```

Энэ бол:

> “Зөвхөн өөрийнхөө биш, бусад user-ийн history харагдаж байна уу?”

гэж шалгаж байна.

---

# 🔑 Password search

```
grep -r "password" /var/www/ 2>/dev/null
```

Энгийнээр:

> **“Web directory дотор password гэдэг үг хаа хаана байна?”**

---

# 🎬 4. PROCESSES & SERVICES

Одоо:

> **“Одоогоор энэ байшин дотор юу хөдөлж байна?”**

---

# 👀 `ps aux`

```
ps aux
```

Энэ бол **building-ийн CCTV monitor**.

Одоогоор ямар process ажиллаж байна?

```
nginx
apache
mysql
python
backup
...
```

гэх мэт.

---

# 👑 Root processes

```
ps aux | grep root
```

Энэ:

> **“Root ямар process ажиллуулж байна?”**

гэж харж байна.

Хэрэв:

```
root    backup-script
root    custom-service
```

гэх мэт сонирхолтой зүйл байвал анхаарна.

---

# 🚪 Listening ports

```
netstat -tulnp
```

эсвэл:

```
ss -tulnp
```

Энэ бол:

> **“Байшингийн ямар хаалганууд гадна тал руу нээлттэй байна?”**

гэж харахтай адил.

Жишээ:

```
22    SSH
80    HTTP
3306  MySQL
...
```

Төсөөл:

```
🏠 MACHINE

🚪 22
🚪 80
🚪 3306
🚪 8080
```

Аль service аль port дээр сонсож байгааг ойлгоно.

---

# 🎬 5. CRON JOBS

Энэ хэсгийг ойлгох хамгийн сайн арга:

# ⏰ “РОБОТ ЦАГ”

Cron =:

> **“Тодорхой цаг болоход автоматаар ажилладаг ажил.”**

Жишээ:

```
02:00 AM
   ↓
backup.sh
```

Төсөөл:

```
⏰ Every night
      ↓
🤖 Robot wakes up
      ↓
runs backup
```

---

## `/etc/crontab`

```
cat /etc/crontab
```

Cron-ийн schedule харна.

---

## `/etc/cron.*`

```
ls -la /etc/cron.*
```

Бусад scheduled job directories.

---

## `crontab -l`

```
crontab -l
```

Одоогийн user-ийн cron jobs.

---

## `/var/spool/cron/`

```
ls -la /var/spool/cron/
```

Cron configuration-ийн өөр нэг байрлал.

---

# 💡 Яагаад cron сонирхолтой вэ?

Эндээс хоёр асуулт гарна:

```
🤖 What runs automatically?
        +
👑 Who runs it?
        +
✍️ Can I modify what it runs?
```

Жишээ mental model:

```
root
 ↓
⏰ cron
 ↓
/some/script.sh
```

Хэрэв script нь user-д writable байвал:

```
👤 YOU
   ↓
✍️ modify script
   ↓
⏰ cron
   ↓
👑 root runs script
```

Ингэж **privilege escalation-ийн боломж** гарч болно.

---

# 🎬 6. WRITABLE LOCATIONS

Одоо асуулт:

> **“Би хаана юм өөрчилж чаддаг вэ?”**

---

```
find / -writable -type d 2>/dev/null | grep -v proc
```

= writable directories.

```
find / -writable -type f 2>/dev/null | grep -v proc
```

= writable files.

---

# 🔓 Яагаад WRITE permission ийм чухал вэ?

Чи:

```
👀 READ
```

эрхтэй байвал:

> “Би харж чадна.”

Харин:

```
✍️ WRITE
```

эрхтэй байвал:

> “Би өөрчилж чадна.”

Тэгээд system чиний өөрчилсөн зүйлийг **илүү өндөр эрхтэй процесс ажиллуулдаг** эсэхийг шалгах хэрэгтэй болдог.

Тиймээс writable location өөрөө “vulnerability” биш.

Харин:

```
WRITE
  +
PRIVILEGED EXECUTION
  +
TRUST
```

болбол сонирхолтой болно.

---

# 🎬 7. KERNEL & VERSION

Сүүлд:

> **“Machine-ийн суурь өөрөө хуучин, эмзэг юм биш биз?”**

гэж шалгана.

```
uname -a
cat /proc/version
```

Эдгээр нь kernel-ийн талаар илүү мэдээлэл өгнө.

Дараа нь:

```
searchsploit ubuntu 16.04
```

гэж байгаа хэсгийн санаа нь:

> **“Энэ software/version-тэй холбоотой public exploit мэдээлэл байна уу?”**

гэж хайх.

Гэхдээ `searchsploit` олдсон exploit гэдэг нь:

> **“Яг одоо ажиллана”**

гэсэн үг биш.

Эхлээд:

```
Version
Architecture
Patch level
Configuration
Exploit requirements
```

зэрэг нь таарч байгаа эсэхийг шалгана.

---

# 🧠 ОДОО БҮХ CHECKLIST-ИЙГ НЭГ ТҮҮХ БОЛГОЁ

Чи нэг танихгүй байшинд орлоо.

## 🕵️ STEP 1 — “Би хаана байна?”

```
id
hostname
uname -a
cat /etc/os-release
pwd
```

```
🪪 WHO AM I?
🏠 WHICH MACHINE?
🧠 WHICH KERNEL?
🐧 WHICH OS?
📍 WHERE AM I?
```

---

## 👥 STEP 2 — “Энд хэн байна?”

```
/etc/passwd
/etc/group
sudo -l
```

```
👥 USERS
👪 GROUPS
🔑 MY PRIVILEGES
```

---

## 🔐 STEP 3 — “Нууц зүйл байна уу?”

```
configs
history
web files
credentials
```

```
📄 CONFIGS
🧠 HISTORY
🔑 SECRETS
```

---

## 👀 STEP 4 — “Юу ажиллаж байна?”

```
ps aux
ss -tulnp
```

```
⚙️ PROCESSES
🚪 PORTS
```

---

## ⏰ STEP 5 — “Юу автоматаар ажилладаг вэ?”

```
cron
```

```
⏰ SCHEDULED JOBS
```

---

## ✍️ STEP 6 — “Би юуг өөрчилж чадна?”

```
find writable
```

```
✍️ WRITE ACCESS
```

---

## 🧬 STEP 7 — “Систем өөрөө хуучин уу?”

```
uname
/proc/version
searchsploit
```

```
🧠 KERNEL
📦 VERSION
💥 KNOWN VULNS
```

---

# 🔥 Нэг мөрөөр цээжлэх

Энэ бүхнийг би чамд ингэж цээжлүүлэхийг зөвлөе:

> **WHO → WHERE → PRIVILEGE → SECRETS → PROCESSES → PORTS → CRON → WRITE → KERNEL**

эсвэл бүр:

```
👤 WHO AM I?
   ↓
🏠 WHERE AM I?
   ↓
👑 WHAT CAN I DO?
   ↓
🔑 WHAT SECRETS EXIST?
   ↓
⚙️ WHAT IS RUNNING?
   ↓
🚪 WHAT IS OPEN?
   ↓
⏰ WHAT RUNS AUTOMATICALLY?
   ↓
✍️ WHAT CAN I MODIFY?
   ↓
🧬 IS THE SYSTEM OLD/VULNERABLE?
```
