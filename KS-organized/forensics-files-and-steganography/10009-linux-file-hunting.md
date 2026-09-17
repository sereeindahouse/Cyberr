---
title: Linux File Hunting with Find and Grep
category: forensics-files-and-steganography
tags: [ks-import, linux, find, grep, file-search, permissions]
source: finding.md
sourceId: 10009
---
# 🕵️ LINUX FILE HUNTING

## 🗺️ Эхлээд том зураг

```
                 🏠 LINUX
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
   🔎 fFIND       🧠 GREP      🔑 PERMISSIONS
       │            │            │
   "ХААНА?"      "ДОТОР ЮУ?"   "ХЭН ЧАДАХ?"
       │            │            │
       └────────────┼────────────┘
                    ▼
                 ⏰ TIME
                    │
                    ▼
                ⚙️ PROCESSES
                    │
                    ▼
                🤖 CRON
```

Энэ note-ийн хамгийн чухал ялгаа:

> **`find` = “WHERE?”**  
> **`grep` = “WHAT INSIDE?”**

Энэ хоёрыг андуурахгүй байхад ихэнх нь амархан болдог.

---

# 🎬 1. `find` — “Файл хаана байна?”

## 🎯 Яг нэрээр нь хайх

```
find / -name "root.txt" 2>/dev/null
```

Энэ нь:

> **“Бүх filesystem-ээс яг `root.txt` гэдэг файл хаана байна?”**

гэсэн асуулт.

Mental picture:

```
🏠 /
├── home/
├── etc/
├── var/
├── opt/
└── ...
      ↓
🔎 "root.txt байна уу?"
```

---

## 🧩 `user.txt`

```
find / -name "user.txt" 2>/dev/null
```

CTF орчинд ийм нэртэй flag файл таарах тохиолдол элбэг.

Тэгэхээр:

> **`-name` = “Нэрээр нь хай.”**

---

# 🔤 `-iname` — Том жижиг үсэг хамаарахгүй

```
find / -iname "*flag*" 2>/dev/null
```

Энэ:

```
flag
FLAG
Flag
myflag.txt
FLAG_backup
```

гэх мэт match хийж чадна.

### 🧠 Memory

> `-name` = exact case-sensitive pattern  
> `-iname` = ignore case

---

# 🧰 Extension-оор хайх

```
find /home /var /opt -name "*.txt" 2>/dev/null
```

Энэ:

> **“Эдгээр directory-үүд доторх `.txt` файлуудыг өг.”**

Жишээ:

```
/home/a.txt
/home/notes.txt
/var/log.txt
/opt/backup.txt
```

---

# 🗃️ Backup hunting

```
find / -name "*.bak" -o -name "*.old" -o -name "*.backup" 2>/dev/null
```

Энд:

```
.bak
.old
.backup
```

гэдэг нь:

> **“Хуучин/backup файл байж болох зүйлс.”**

гэж бодно.

### 🧠 Memory

> **Backup = “Хүмүүс хуучин нууцаа мартсан байж магадгүй.”**

---

# 🕳️ `2>/dev/null` — Яагаад байнга харагддаг вэ?

Энэ бол маш хэрэгтэй Linux concept.

Жишээ:

```
find / -name "*.txt"
```

гээд ажиллуулахад:

```
find: '/root': Permission denied
find: '/proc/...': Permission denied
...
```

гээд олон error гарна.

Тэгээд:

```
2>/dev/null
```

гэж залгахад:

```
stderr
  ↓
/dev/null
  ↓
🗑️ discard
```

болно.

### 🧠 Memory image

```
Program
 ├── stdout → 👀 дэлгэц
 └── stderr → 🗑️ /dev/null
```

Тэгэхээр:

> **`2>/dev/null` = “алдаа/permission noise-ийг хогийн сав руу хий.”**

Энэ нь permission-ийг тойрч байгаа биш, **зүгээр л error output-ийг нууж байгаа**.

---

# 🎬 2. `grep` — “Файлын дотор юу байна?”

Одоо ялгааг хараарай.

`find`:

> 📍 **файлыг олно**

`grep`:

> 🧠 **файлын доторх текстийг олно**

---

# 🔎 Recursive search

```
grep -rn "THM{" /root /home /var /opt 2>/dev/null
```

Үүнийг:

> **“Эдгээр directory-үүдийн бүх файлуудын дотроос `THM{` гэсэн текст хаана байна?”**

гэж ойлго.

### Flag hunting mental model

```
/home
 ├── a.txt
 ├── notes
 └── app/
       └── config.txt
             ↓
        grep "THM{"
```

---

# 🧠 `grep -rn`

Энийг жижигхэн mnemonic болгоё:

```
-r = 🔁 Recursive
-n = 🔢 line Number
```

Тэгэхээр:

> **R = roam through directories**  
> **N = tell me the line**

---

# 🔤 `grep -rni`

```
grep -rni "password" /var/www/ /opt/ 2>/dev/null
```

Энд:

```
-r → recursive
-n → line number
-i → ignore case
```

Тиймээс:

> **“password гэдэг үгтэй төстэй ямар ч case бүхий мөрийг олоод line number-тай өг.”**

---

# 🎯 File type хязгаарлах

```
grep -rn --include="*.php" "DB_PASSWORD" /var/www/
```

Энэ маш гоё concept.

Чи:

```
/var/www
```

доторх **бүх юм** биш,

зөвхөн:

```
*.php
```

файлуудад хайлт хийж байна.

Mental image:

```
/var/www
 ├── index.php     ✅ search
 ├── config.php    ✅ search
 ├── logo.png      ❌ skip
 └── style.css     ❌ skip
```

### 🧠 Memory

> `--include` = **“Зөвхөн энэ төрлийн файлыг шалга.”**

---

# 📄 `grep -rl`

```
grep -rl "flag" /home/ 2>/dev/null
```

Энэ удаа line биш:

> **“Match гарсан FILE NAME-уудыг л өг.”**

Mental image:

```
a.txt       ❌
notes.txt   ✅
config.php  ❌
secret.txt  ✅
```

Output:

```
notes.txt
secret.txt
```

### 🧠 Memory

> `-l` = **location/file name**

---

# 🔥 FIND vs GREP

Энэ хоёрыг Obsidian дээр томоор бич:

```
🔎 FIND
= WHERE IS THE FILE?

🧠 GREP
= WHAT IS INSIDE THE FILE?
```

Жишээ:

```
find / -name "*.conf"
        ↓
📍 CONFIG хаана?

grep -r "password" /etc
        ↓
🔑 password дотор байна уу?
```

---

# 🎬 3. Permissions & Ownership

Одоо file оллоо.

Дараагийн асуулт:

> **“Энэ файлыг хэн эзэмшдэг вэ?”**
> 
> **“Хэн өөрчилж чаддаг вэ?”**

---

# 👑 SUID

```
find / -perm -4000 -type f 2>/dev/null
```

эсвэл:

```
find / -perm -u=s -type f 2>/dev/null
```

Энэ нь:

> **SUID executable-үүдийг хайж байна.**

Mental image:

```
👤 You
   ↓
⚙️ SUID program
   ↓
🪪 owner-ийн эрхийн context
```

### 🧠

> `4000 = SUID clue`

---

# ✍️ World-writable FILE

```
find / -type f -perm -o+w 2>/dev/null
```

Энэ:

> **“Бүгдэд write permission-тэй file байна уу?”**

`o+w`:

```
o = others
+w = write
```

Тэгэхээр:

```
-rw-rw-rw-
```

шиг зүйл сонирхогдоно.

Гэхдээ:

> **World-writable = automatically exploitable**

биш.

Харин:

```
WRITE
+
TRUSTED/PRIVILEGED USE
```

байвал илүү чухал.

---

# 📂 World-writable DIRECTORY

```
find / -type d -perm -o+w 2>/dev/null
```

Ялгаа:

```
-type f → 📄 file
-type d → 📁 directory
```

---

# 👥 Group writable

```
find / -group cage -writable 2>/dev/null
```

Энэ:

> **“`cage` group-ийн эзэмшдэг, бас write хийж болох file байна уу?”**

гэсэн асуулт.

---

# 👤 User-owned files

```
find / -user weston 2>/dev/null
```

Энэ:

> **“weston user-ийн owner болсон бүх файлыг ол.”**

---

# 🧠 Ownership-ийг ингэж сана

```
📄 FILE
 ├── 👤 OWNER
 ├── 👥 GROUP
 └── 🌍 OTHERS
```

Тэгээд permission:

```
READ
WRITE
EXECUTE
```

гэж 3 талаас нь хар.

---

# 🎬 4. TIME MACHINE — “Хэзээ өөрчлөгдсөн?”

Энэ хэсгийг хүмүүс их мартдаг.

Гэхдээ маш сонирхолтой.

---

# ⏰ `-mmin -10`

```
find / -mmin -10 -not -path "/proc/*" -not -path "/sys/*" 2>/dev/null
```

Энэ:

> **“Сүүлийн 10 минутын дотор modification болсон зүйлсийг ол.”**

Mental image:

```
⏰ 15:00
      ↓
15:10
      ↓
🔎 What changed recently?
```

Яагаад cron investigation-д хэрэгтэй байж болох вэ?

Хэрэв ямар нэг automated process тодорхой файл байнга өөрчилж байвал timestamp нь clue болж болно.

---

# 📅 `-mtime -1`

```
find /etc /var /opt -mtime -1 2>/dev/null
```

Энэ:

> **“Сүүлийн 1 өдөрт modification болсон зүйлс.”**

---

# 🐘 Large files

```
find / -type f -size +50M 2>/dev/null
```

Энэ:

> **“50 MB-аас том файлууд хаана байна?”**

Яагаад хэрэгтэй байж болох вэ?

```
📦 VM image
📦 database dump
📦 backup
📦 archive
📦 log
```

гэх мэт том data байж болно.

Гэхдээ:

> **Том = сонирхолтой**

гэж шууд дүгнэхгүй. Энэ нь зүгээр discovery filter.

---

# 🕳️ Empty files

```
find /var/log -type f -empty
```

Энэ:

> **“Хоосон log files байна уу?”**

гэж хайна.

Энэ нь яг өөрөө privilege escalation technique биш; filesystem housekeeping/debugging зэрэгт ч хэрэгтэй.

---

# 🎬 5. PROCESSES + CRON

Одоо file hunting-ээс:

# ⚙️ “System яг одоо юу хийж байна?”

рүү орно.

---

# ⏰ Cron

```
cat /etc/crontab
```

Энэ:

> **“System ямар automated schedule-уудтай вэ?”**

гэсэн асуулт.

```
ls -la /etc/cron.*
```

гэдэг нь:

> **“Cron-related directories/configuration юу байна?”**

гэж харна.

---

# 👤 User crontabs

```
cat /var/spool/cron/crontabs/* 2>/dev/null
```

Энэ нь user-specific cron definitions байгаа эсэхийг харах зорилготой.

---

# 👀 Processes

```
ps aux
```

Үүнийг:

> 📹 **CCTV**

гэж төсөөл.

```
PID
USER
COMMAND
```

зэрэг information харна.

---

# 🐍 Python process-ууд

```
ps -ef | grep python
```

Энэ:

> **“Python-той холбоотой ажиллаж байгаа process байна уу?”**

гэж filter хийж байна.

Mental image:

```
⚙️  process 1
🐍 python
⚙️  process 2
⚙️  nginx
🐍 python
```

---

# 🧠 БҮХЭЛ НЬ НЭГ МӨРДЛӨГ

Энийг хамгийн сайн remember хийх аргаа үзье.

Чи Linux house дотор орлоо:

```
🏠 LINUX
   │
   ▼
🔎 FIND
"ЮУ ХААНА БАЙНА?"
   │
   ▼
🧠 GREP
"ДОТОР ЮУ БАЙНА?"
   │
   ▼
🔑 PERMISSIONS
"ХЭН УНШИЖ/БИЧИЖ ЧАДАХ ВЭ?"
   │
   ▼
👤 OWNERSHIP
"ХЭНИЙХ ВЭ?"
   │
   ▼
⏰ TIMESTAMPS
"ХЭЗЭЭ ӨӨРЧЛӨГДСӨН ВЭ?"
   │
   ▼
⚙️ PROCESSES
"ЮУ ОДОО АЖИЛЛАЖ БАЙНА?"
   │
   ▼
🤖 CRON
"ЮУ АВТОМАТААР АЖИЛЛАДАГ ВЭ?"
```

---

# 🧠 SUPER MEMORY WALL

## 🔎 FIND

```
-name     → exact name/pattern
-iname    → ignore case
-type f   → files
-type d   → directories
```

> **FIND = WHERE?**

---

## 🧠 GREP

```
-r     → recursive
-n     → line number
-i     → ignore case
-l     → filenames only
--include → certain file types
```

> **GREP = WHAT'S INSIDE?**

---

## 🔑 PERMISSIONS

```
4000   → SUID
2000   → SGID

o+w    → others can write
-user  → owned by user
-group → owned by group
```

> **PERMISSIONS = WHO CAN TOUCH IT?**

---

## ⏰ TIME

```
-mmin -10
→ last 10 minutes

-mtime -1
→ last 1 day
```

> **TIME = WHAT CHANGED RECENTLY?**

---

## ⚙️ PROCESS

```
ps aux
ps -ef
```

> **PROCESS = WHAT IS ALIVE NOW?**

---

## 🤖 CRON

```
/etc/crontab
/etc/cron.*
/var/spool/cron/...
```

> **CRON = WHAT RUNS AUTOMATICALLY?**
