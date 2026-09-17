---
title: TLS and mTLS Cheatsheet
category: web-security
tags: [ks-import, tls, mtls, network-sockets, encryption, certificates]
source: NETWORK/gojo's domain/cheatshit.md
sourceId: 10029
---
# 🔐 TLS / mTLS & NETWORK SOCKETS — CHEATSHEET

> 🧠 **Core idea:**  
> **Plain TCP = шууд ярилцана**  
> **TLS = яриагаа шифрлэнэ**  
> **mTLS = хоёр тал хоёулаа identity-гээ батална**

---

# 1️⃣ 🌐 TLS vs mTLS

## Standard HTTPS

```text
👤 CLIENT
   │
   │ TLS handshake
   ▼
🌐 SERVER
   │
   └── 📜 Server Certificate
```

### Client шалгана:

> “Би жинхэнэ server-тэй холбогдож байна уу?”

```text
Client ✅ verifies Server
Server ❌ does not necessarily require Client Cert
```

---

## Mutual TLS (mTLS)

```text
👤 CLIENT
   │
   │ 📜 Client Certificate
   ▼
🌐 SERVER
   │
   │ 📜 Server Certificate
   ▼
🤝 BOTH VERIFY EACH OTHER
```

### Memory:

> **TLS = Server proves identity**  
> **mTLS = Server + Client prove identity**

---

# 2️⃣ 🪪 IMPORTANT FILES

|File|Meaning|🧠 Think|
|---|---|---|
|`client.key`|Private key|🔑 SECRET|
|`client.crt` / `.pem`|Client certificate|🪪 ID CARD|
|`ca.crt`|CA certificate|🏛️ TRUST|

### Хамгийн чухал:

```text
.crt → "Би хэн бэ?"
.key → "Би үнэхээр тэр хүн гэдгээ батал."
CA   → "Энэ identity-д итгэж болно."
```

> ⚠️ **Private key-г secret гэж үз. Бусадтай бүү хуваалц.**

---

# 3️⃣ 📡 PLAIN TCP SOCKET

Plain socket-д TLS байхгүй.

```bash
nc <TARGET_IP> <PORT>
```

### Mental model

```text
👤 YOU ─────────────► 🌐 SERVER
        plain TCP
```

### `nc` =

> **“Шууд утас залга.”**

Service banner, prompt, text protocol байвал CLI-ээр харилцаж болно.

---

# 4️⃣ 🔐 TLS-WRAPPED SOCKET

TLS-тэй service рүү plain `nc` хангалтгүй байж болно.

```bash
openssl s_client -connect <TARGET_IP>:<PORT> -quiet
```

### Mental model

```text
👤 YOU
  ↓
openssl
  ↓
🤝 TLS handshake
  ↓
🌐 SERVER
```

### Memory:

```text
Plain TCP → nc
TLS TCP   → openssl s_client
```

---

# 5️⃣ 🪪 mTLS WITH `curl`

Web/API service:

```bash
curl \
  --cert client.crt \
  --key client.key \
  https://<TARGET_IP>:<PORT>/
```

### Meaning

```text
--cert → 🪪 Client certificate
--key  → 🔑 Client private key
```

---

## ⚠️ Self-signed / untrusted server certificate

Lab орчинд:

```bash
curl -k \
  --cert client.crt \
  --key client.key \
  https://<TARGET_IP>:<PORT>/
```

### `-k`

> **Server certificate verification-ийг алгасна.**

⚠️ `-k` нь **client certificate authentication-ийг устгахгүй**.

---

# 6️⃣ 🔬 mTLS WITH `openssl`

Custom TLS service:

```bash
openssl s_client \
  -connect <TARGET_IP>:<PORT> \
  -cert client.crt \
  -key client.key \
  -quiet
```

### Flow

```text
📜 client.crt
      +
🔑 client.key
      ↓
🤝 TLS handshake
      ↓
✅ Client authenticated
      ↓
🔐 Protected service
```

---

# 7️⃣ 🌉 `socat` — TLS BRIDGE

Зарим tool client certificate ашиглахад тохиромжгүй.

`socat` bridge болгож болно:

```bash
socat \
TCP-LISTEN:8080,fork,reuseaddr \
OPENSSL:<TARGET_IP>:<PORT>,cert=client.crt,key=client.key,verify=0
```

### Mental model

```text
YOUR TOOL
    │
    │ Plain TCP
    ▼
🧰 socat
    │
    │ TLS + Client Cert
    ▼
🌐 mTLS SERVER
```

> 🧠 **socat = “Хоёр өөр хэлээр ярьдаг хоёр талыг холбох bridge.”**

---

# 8️⃣ 🔍 HOW TO DECIDE WHICH TOOL

```text
Is service plain TCP?
        │
       YES
        ↓
       nc

        NO
        ↓
Is service TLS?
        │
       YES
        ↓
openssl s_client
```

Хэрэв mTLS required:

```text
TLS
 ↓
Need client cert?
 ↓
YES
 ↓
-cert client.crt
-key client.key
```

---

# 9️⃣ 🗺️ RECON WORKFLOW

```text
🔎 PORT SCAN
      ↓
⚙️ IDENTIFY SERVICE
      ↓
📡 Plain TCP?
   │
   ├── YES → nc
   │
   └── NO
        ↓
     🔐 TLS?
        ↓
   openssl s_client
        ↓
🪪 Client certificate required?
        ↓
📜 client.crt
+
🔑 client.key
        ↓
✅ mTLS authentication
        ↓
🔐 Protected service
```

---

# 🔟 🧠 QUICK COMMAND TABLE

| Goal                              | Command                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------- |
| Plain TCP                         | `nc <IP> <PORT>`                                                                |
| TLS socket                        | `openssl s_client -connect <IP>:<PORT> -quiet`                                  |
| HTTPS + mTLS                      | `curl --cert client.crt --key client.key https://<IP>:<PORT>/`                  |
| HTTPS + lab/untrusted server cert | `curl -k --cert client.crt --key client.key https://<IP>:<PORT>/`               |
| TLS + client cert                 | `openssl s_client -connect <IP>:<PORT> -cert client.crt -key client.key -quiet` |
| Local TLS bridge                  | `socat TCP-LISTEN:8080,... OPENSSL:...`                                         |

---

# 🧠 11️⃣ THE 5 THINGS TO REMEMBER

```text
🚪 PORT
   ↓
📡 SOCKET
   ↓
🔐 TLS?
   ↓
🪪 CLIENT CERT?
   ↓
🔑 PRIVATE KEY?
```

### Golden memory

> **`nc` = plain**

> **`openssl s_client` = TLS**

> **`curl --cert --key` = HTTPS + mTLS**

> **`.crt` = identity**

> **`.key` = secret proof**

> **CA = trust**

> **mTLS = BOTH SIDES IDENTIFY**
