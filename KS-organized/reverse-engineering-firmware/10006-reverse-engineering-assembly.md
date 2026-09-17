---
title: Reverse Engineering Assembly Basics
category: reverse-engineering-firmware
tags: [ks-import, reverse-engineering, assembly, x64, registers, rip, rax]
source: cheater/cheatshit 4.md
sourceId: 10006
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
# 🔬 SECTION 4 — REVERSE ENGINEERING & ASSEMBLY

## 🎥 Эхлээд том зураг

Reverse engineering гэж:

> **“Энэ binary-г ажиллуулахад CPU яг юу хийж байгааг араас нь мөрдөх.”**

гэж ойлго.

Жишээ нь:

```
📦 program

     ↓

🔬 Reverse Engineering

     ↓

🧠 CPU:
"Энэ instruction юу хийж байна?"
"Data хаана байна?"
"Яагаад энд үсэрч байна?"
"Энэ function-д ямар argument өгсөн бэ?"
```

---

# 🧠 4.1 x64 CPU — CPU-г НЭГ ОФФИС гэж төсөөл

CPU дотор маш хурдан ажилладаг жижиг storage-ууд байдаг.

Тэднийг:

# 🗃️ REGISTER

гэдэг.

Тэгэхээр register-ийг:

> **CPU-ийн ширээн дээр байгаа маш жижиг, маш хурдан хайрцаг**

гэж төсөөл.

---

# 📍 RIP — GPS

`RIP` = **Instruction Pointer**

Үүнийг хамгийн түрүүнд ойлго.

CPU яг одоо:

```
Program:
100
101
102
103
104
105
...
```

гэсэн instruction-уудаар явж байна гэж бод.

CPU:

```
"Би одоо аль instruction дээр байна?"
```

гэдгийг RIP-ээр мэднэ.

Тиймээс:

```
RIP = 103
        ↓
CPU дараагийн execution context-ээ
эндээс үргэлжлүүлнэ
```

### 🧠 Mental image

```
Program memory

100   instruction
101   instruction
102   instruction
103   👈 RIP
104   instruction
105   instruction
```

Тиймээс RIP бол:

> 🧭 **CPU-ийн GPS**

---

# 💥 Яагаад RIP security дээр чухал вэ?

Хэрэв control flow-д нөлөөлөх хэмжээний memory corruption гарч, RIP-ийг attacker-ийн хүссэн утгаар өөрчлөх нөхцөл бүрдвэл CPU дараагийн execution-ээ өөр газар чиглүүлж болно.

Mental image:

```
Normal:

RIP
 ↓
A → B → C → D


Corrupted control flow:

RIP
 ↓
A → B → 💥 → attacker-controlled location
```

Тиймээс buffer overflow ярьж байх үед:

> **“RIP хаашаа явж байна?”**

гэдэг маш чухал асуулт болдог.

---

# 🧮 RAX — “хариуны хайрцаг”

`RAX`-ийг:

> 🗃️ **Function-ийн answer box**

гэж төсөөл.

Жишээ нь function:

```
is_password_correct()
```

гэж байгаа.

Function ажиллаад:

```
1
```

буцааж болно.

Тэр return value register-үүдийн calling convention-оос хамаараад `RAX`-тай холбогдоно.

Тиймээс mental model:

```
function()
   ↓
computes answer
   ↓
RAX = result
```

Харин note-ийн жишээн дээр:

```
1 = true
0 = false
```

гэж ойлгож болно.

### 🧠 Санах:

> **RIP = “хаашаа?”**
> 
> **RAX = “хариу нь юу?”**

---

# 🪆 REGISTER SLICING — Matryoshka Doll

Энэ хэсэг маш гоё.

`RAX`-ийг нэг том **64-bit хайрцаг** гэж төсөөл.

Түүний дотор:

```
RAX
└── EAX
    └── AX
        └── AL
```

байгаа юм шиг.

Гэхдээ нэг чухал ойлголт:

> Эдгээр нь тус тусдаа “өөр register” биш; **RAX register-ийн өөр хэмжээтэй хэсгүүд/нэршлүүд**.

---

## 🪆 Зураг

```
RAX
┌────────────────────────────────────┐
│             64 bits                │
│                                    │
│   EAX = lower 32 bits              │
│   ┌────────────────────────────┐   │
│   │          32 bits           │   │
│   │                            │   │
│   │ AX = lower 16 bits         │   │
│   │ ┌──────────────────────┐   │   │
│   │ │       16 bits        │   │   │
│   │ │                      │   │   │
│   │ │ AL = lower 8 bits    │   │   │
│   │ └──────────────────────┘   │   │
│   └────────────────────────────┘   │
└────────────────────────────────────┘
```

Тиймээс:

```
RAX = 64
EAX = 32
AX  = 16
AL  = 8
```

---

# 🤯 Яагаад хэрэгтэй вэ?

Жишээ:

```
RAX = 0x1122334455667788
```

Хэрэв `EAX`-ийг харвал lower 32 bits:

```
0x55667788
```

Харин `AX`:

```
0x7788
```

`AL`:

```
0x88
```

болно.

Иймээс:

> **“Нэг register-ийн тодорхой хэсгийг л ашиглах”**

гэдгийг assembly дээр байнга харна.

---

# 📞 4.2 Calling Convention — “Function руу орох утасны дугаарууд”

Function дуудахад:

```
calculate(a, b, c, d)
```

гэж 4 argument байгаа гэж бод.

CPU:

> “Эдгээр 4 зүйлийг хаана тавих вэ?”

гэдэг дүрэм хэрэгтэй.

Тэр дүрэм нь:

# 📞 Calling Convention

Чиний note-ийн дагуу:

```
1st → RCX
2nd → RDX
3rd → R8
4th → R9
5th+ → Stack
```

Тэгэхээр:

```
Argument #1
   ↓
RCX

Argument #2
   ↓
RDX

Argument #3
   ↓
R8

Argument #4
   ↓
R9

Argument #5+
   ↓
STACK
```

### 🧠 Memory rhyme

> **“C D 8 9, then Stack.”**

Үүнийг яг ингэж хэлээд сурчих.

---

# ⚠️ Нэг чухал technical note

Энэ `RCX → RDX → R8 → R9` дараалал нь **Windows x64 calling convention / Microsoft x64**-ийн үндсэн argument register sequence-тэй холбоотой.

Харин Linux x86-64 дээр ихэвчлэн:

```
RDI
RSI
RDX
RCX
R8
R9
```

ашигладаг.

Тиймээс чи reverse engineering хийхдээ:

> **“x64 = заавал RCX, RDX, R8, R9”**

гэж ерөнхийлж болохгүй.

**Calling convention-оо эхлээд тань.**

---

# 🧱 4.3 Assembly — CPU-ийн үйл үгс

Assembly code-ийг хүний хэлээр:

> **CPU-д өгч буй маш жижиг үйлдлүүдийн жагсаалт**

гэж төсөөл.

Жишээ:

```
MOV
LEA
XOR
CMP
JCC
NOP
```

Эдгээрийг зургаар ойлгоё.

---

# 📦 MOV = “ЗӨӨ”

```
MOV destination, source
```

Mental image:

```
📦 SOURCE
   │
   │ MOV
   ▼
📥 DESTINATION
```

Жишээ:

```
mov rax, rbx
```

ойролцоогоор:

> “RBX-ийн утгыг RAX-д тавь.”

---

## 🧠 `[ ]` яагаад чухал вэ?

```
mov rax, rbx
```

= register-ийн утга.

Харин:

```
mov rax, [rbx]
```

гэхэд `[rbx]` нь:

> **“RBX-д байгаа хаяг руу очоод, тэнд байгаа memory value-г ав.”**

гэсэн санаа.

Тэгэхээр:

```
rbx = address
       ↓
     [rbx]
       ↓
   memory there
```

### 🧠 Memory

> **No brackets → value**
> 
> **Brackets → memory at that address**

---

# 🧭 LEA = “Хаягийг тооцоол”

`LEA`:

```
lea destination, [address]
```

Үүнийг:

> **“Энд очихгүй. Зөвхөн хаягийг тооцоолоод өг.”**

гэж төсөөл.

Жишээ mental image:

```
🏠 1000
├── room
├── room
└── room
```

`LEA`:

> “Энэ room хаана байгааг надад тооцоод өг.”

Харин memory-г шууд уншихгүй.

### 🧠

`MOV` + brackets → **очоод ав**

`LEA` → **очих хаягийг тооц**

---

# 🧹 XOR = “өөртэйгөө XOR хийгээд цэвэрлэ”

```
xor rax, rax
```

Өөртэйгөө XOR хийвэл:

```
X XOR X = 0
```

Тиймээс:

```
RAX = ??????
        ↓
xor rax, rax
        ↓
RAX = 0
```

Mental image:

🧹 **CPU register vacuum cleaner**

---

# ⚖️ CMP = “Шүүгч”

```
cmp A, B
```

CPU шууд:

> “A ямар байна? B-ээс том уу? Тэнцүү юу?”

гэж тусад нь boolean хадгалахгүй.

Ерөнхийдөө subtract-тай төстэй байдлаар **flags**-ийг тохируулна.

Жишээ:

```
cmp rax, 0
```

дараа нь:

```
je ...
```

байвал:

> **“Хэрэв тэнцүү бол үсэр.”**

---

# 🚦 JCC = “Замын уулзвар”

CPU замаар явж байлаа:

```
──────────────►
       │
       ├──► road A
       │
       └──► road B
```

`JCC`:

> **“Нөхцөлөөс хамаараад аль замаар явах вэ?”**

---

## Нэрийг нь ингэж төсөөл

```
JE / JZ
↓
"Equal / Zero болсон уу?"

JNE / JNZ
↓
"Equal биш / Zero биш үү?"

JG / JL
↓
Signed comparison

JA / JB
↓
Unsigned comparison
```

---

# 🧠 Маш чухал

`CMP` болон `JCC` ихэвчлэн **хосоороо** ойлгогдоно.

```
CMP
 ↓
flags
 ↓
JCC
 ↓
decision
```

Mental story:

> ⚖️ `CMP` = шүүгч харьцуулна  
> 🚦 `JCC` = үр дүнгээр нь аль замаар явахыг сонгоно

---

# 🧍 NOP = “ЮУ Ч БҮҮ ХИЙ”

```
NOP
```

CPU:

> “Энд юу ч хийхгүй.”

😂

```
Instruction
Instruction
NOP
Instruction
```

NOP = **No Operation**.

---

# 🧠 NOP Sled гэж юу вэ?

Buffer overflow-ийн historical exploit contexts-д:

```
NOP NOP NOP NOP NOP
           ↓
      target region
```

гэх мэт NOP-уудын дараалал ашиглаж, control-flow landing-ийг илүү forgiving болгох санаа байсан.

Mental image:

> 🛝 **Хальтирдаг зам**

Нэг цэг дээр яг онох биш, өргөн NOP region дээр буугаад payload руу “гулсаж” очих санаа.

---

# 🧱 4.4 STACK — “Давхар овоолсон хайрцаг”

Stack-ийг:

```
📚📚📚📚
```

гэж төсөөл.

Function call хийх үед temporary data, saved state, local variables гэх мэт зүйлс stack-тэй холбоотой байрладаг.

x86-64 дээр уламжлалт stack direction:

```
HIGH ADDRESS
     │
     │
     ▼
   STACK
     │
     ▼
LOW ADDRESS
```

Иймээс stack grows **downward**, өөрөөр хэлбэл lower addresses руу.

---

# ⬇️ PUSH = доош

```
PUSH
 ↓
RSP decreases
```

Mental image:

```
📦
📦
📦
⬇️
```

---

# ⬆️ POP = дээш

```
POP
 ↓
RSP increases
```

Тиймээс:

> **Push goes down. Pop comes up.**

гэсэн memory trick чинь маш сайн.

---

# 🌍 Little-Endian — “бага byte түрүүлж явна”

Энэ хэсгийг ойлгоход **byte**-оор бод.

Жишээ:

```
0x77AABBCC
```

Энд byte-ууд:

```
77 AA BB CC
```

Little-endian memory-д:

```
CC BB AA 77
```

гэж байрлана.

---

# 🍬 Яагаад?

“Little endian” гэдгийг:

> **“Number-ийн хамгийн бага significant byte-г эхэнд тавина.”**

гэж сана.

### 🧠 Жижиг зураг

```
Number:

77 AA BB CC

Memory:

[CC][BB][AA][77]
 ↑
 first
```

Тиймээс:

> **Little → little/least significant byte first**

гэж сана.

---

# 🔬 4.5 Reverse Engineering Toolkit

Одоо чи CPU-ийн хэлний үндсийг ойлголоо.

Тэгвэл:

> **“Binary дотор яг юу болоод байгааг яаж харах вэ?”**

гэдэг асуудал гарна.

---

# 🔍 `objdump` = Binary-г задлаад assembly болгоно

```
objdump -M intel -d [BINARY]
```

Mental image:

```
📦 Binary
   ↓
🔬 objdump
   ↓
🧾 Assembly
```

Чамд:

```
mov
cmp
call
jmp
...
```

гэх мэт instruction-ууд харагдана.

---

# 🔎 `grep -B 15` = “Өмнөх 15 алхмыг хар”

```
grep -B 15 "call.*<target_func>" source.asm
```

`-B`:

> **Before**

Тиймээс:

```
target_func
    ↑
15 lines before
```

---

# 🔎 `grep -A 20` = “Дараах 20 алхмыг хар”

`-A`:

> **After**

```
grep -A 20 "target_func" source.asm
```

---

# 🕵️ `ltrace` = “Program хэнийг дуудсаныг чагнах”

```
ltrace ./binary
```

Үүнийг:

> 🎧 **Program-ийн phone calls-ыг сонсох**

гэж төсөөл.

Жишээ:

```
strcmp(...)
strncmp(...)
printf(...)
```

гэх мэт library calls харагдаж болно.

---

# 🧾 `strings` = “Binary доторх хүний унших үгсийг шүүрд”

```
strings -n 6 [BINARY]
```

Binary дотор:

```
Enter password:
Invalid login
Welcome
admin
config
...
```

гэх мэт ASCII strings байж болно.

`strings` бол:

> **“Binary дотор хүний уншиж болох ямар clue байна?”**

гэж хурдан шалгах хэрэгсэл.

---

# 🧠 Одоо RE workflow-ийг movie болго

Чиний note:

> **Disassemble → Locate → Trace → Read strings**

Үүнийг:

```
📦 BINARY
   │
   ▼
🔬 DISASSEMBLE
   │
   ▼
📍 LOCATE interesting function
   │
   ▼
🎧 TRACE behavior
   │
   ▼
🧾 READ strings / clues
```

гэж сана.

---

# 🔥 Хамгийн чухал MEMORY WALL

## 🧠 REGISTERS

```
RIP → 🧭 WHERE CPU GOES
RAX → 🧮 WHAT FUNCTION RETURNS
```

## 🪆 REGISTER SIZE

```
RAX → 64
EAX → 32
AX  → 16
AL  → 8
```

> **Big doll → smaller doll**

## 📞 ARGUMENTS

Чиний source convention:

```
RCX → 1
RDX → 2
R8  → 3
R9  → 4
STACK → 5+
```

> **C D 8 9 → Stack**

Гэхдээ **Linux x86-64 дээр өөр calling convention** байдгийг заавал санаж яв.

---

## 🧱 INSTRUCTIONS

```
MOV → 📦 COPY
LEA → 🧭 ADDRESS
XOR → 🧹 ZERO
CMP → ⚖️ COMPARE
JCC → 🚦 DECIDE
NOP → 🧍 NOTHING
```

---

## 🧠 MEMORY

```
STACK
↓
lower addresses

PUSH → ↓
POP  → ↑

Little-endian
→ smallest-significant byte first
```

---

# 🎯 Эцэст нь нэг жижиг CPU story

CPU:

```
🧠 "RIP хаана байна?"
        ↓
       RIP
        ↓
"Одоо энэ instruction-ийг ажиллуул."

        ↓

📦 MOV
"Data-г энд тавь."

        ↓

⚖️ CMP
"Энэ хоёр адил уу?"

        ↓

🚦 JCC
"Тэгвэл аль замаар явах вэ?"

        ↓

📞 CALL
"Function дуудая."

        ↓

🧮 RAX
"Function-ийн хариу энд байна."

        ↓

🧭 RIP
"Дараагийн instruction руу явъя."
```

Ингэж харвал assembly:

> **“Хачин тэмдэгтүүдийн цуглуулга” биш.**

Харин:

> **CPU-ийн секунд тутам хийж байгаа маш жижиг шийдвэрүүдийн story**

болно.

Тэгээд Reverse Engineering хийх үед хамгийн түрүүнд `RIP`, `RAX`, `RSP`, `RDI/RSI/...` зэрэг **“CPU яг юу мэдэж байгаа вэ?”** гэдгийг хараад, дараа нь `MOV → CMP → JCC → CALL` гэсэн урсгалыг мөрдөхөд binary аажмаар “ярих” шиг болж эхэлдэг.
