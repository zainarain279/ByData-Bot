# ByData Auto Bot

An automated bot for completing and claiming tasks on the ByData platform to earn XP rewards.

## 📋 Features

- Automatically fetches available tasks from ByData
- Completes and claims XP for pending tasks
- Supports multiple accounts
- Proxy support (HTTP/HTTPS/SOCKS)
- Rate limiting protection
- Detailed statistics and logging

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/zainarain279/ByData-Bot.git
cd ByData-Bot
```

2. Install dependencies:
```bash
npm install
```

## ⚙️ Configuration

### Setting up your accounts

Create a `config.txt` file in the project root with the following format:
```
walletAddress|token
```

Example:
```
0x1234567890abcdef1234567890abcdef12345678|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
0xabcdef1234567890abcdef1234567890abcdef12|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Setting up proxies (Optional)

Create a `proxies.txt` file in the project root with one proxy per line:

```
ip:port
username:password@ip:port
socks5://ip:port
```

Example:
```
192.168.1.1:8080
user123:pass456@192.168.1.2:8080
socks5://192.168.1.3:1080
```

## 🚀 Usage

Run the bot with:

```bash
npm run start
```

