# Usage Guide — Aegis Autonopay Agent

Complete installation and usage guide for developers.

***

## Prerequisites

Before starting, make sure you have installed:

- **Node.js** v18 or higher — https://nodejs.org
- **npm** v9 or higher (included with Node.js)
- **Git** — https://git-scm.com

Verify your versions:

```bash
node --version   # v18.0.0 or higher
npm --version    # 9.0.0 or higher
git --version
```

***

## Installation

### Step 1 — Clone the Repository

```bash
git clone https://github.com/habibafrido/Aegis-Autonopay agent.git
cd Aegis Autonopay
```

### Step 2 — Install Dependencies

```bash
npm install
```

Expected output:
```
added 23 packages, and audited 24 packages
found 0 vulnerabilities
```

### Step 3 — Configure Environment

Copy the environment template:

```bash
# Linux / Mac
cp .env.example .env

# Windows
copy .env.example .env
```

Open `.env` and fill in your values:

```env
# OWS Wallet
OWS_WALLET_PASSWORD=your_strong_password_here
OWS_WALLET_PATH=./wallet.ows

# Chain RPCs
BASE_RPC_URL=https://mainnet.base.org
TEMPO_RPC_URL=https://rpc.tempo.xyz

# API Keys
CDP_API_KEY=your_coinbase_developer_platform_key
MOONPAY_API_KEY=your_moonpay_api_key

# Policy (in USD)
AGENT_SPEND_LIMIT_PER_TX=20
AGENT_DAILY_CAP=200
HUMAN_APPROVAL_THRESHOLD=50

# Server
PORT=3001
```

> **Get your CDP_API_KEY for free** at https://coinbase.com/developer-platform
> First 1,000 transactions per month are free.

### Step 4 — Initialize OWS Wallet

Run once to create the encrypted local wallet:

```bash
npm run init-wallet
```

Expected output:
```
✅ OWS Wallet created!
Address (EVM): 0x...
```

> **Security note:** The private key is stored encrypted in `wallet.ows` on your local filesystem. It never leaves your device. Never commit `wallet.ows` to version control.

***

## Running the Server

```bash
npm run dev
```

Expected output:
```
🚀 Aegis Autonopay Agent running → http://localhost:3001
```

The server is now ready to accept requests at `http://localhost:3001`.

> **Windows users:** Open a second terminal window to send requests while the server is running in the first.

***

## API Reference

### GET /status

Returns agent health and current policy configuration.

**Request:**
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/status"

# curl
curl http://localhost:3001/status
```

**Response:**
```json
{
  "name": "Aegis Autonopay Payment Agent",
  "version": "1.0.0",
  "status": "ok",
  "rails": ["x402 (Base)", "mpp-charge (Tempo)", "mpp-session (Tempo)"],
  "policy": {
    "spendLimitPerTx": 20,
    "dailyCap": 200,
    "approvalThreshold": 50
  },
  "chains": ["eip155:8453 (Base)", "eip155:19012 (Tempo)"],
  "time": "2026-04-03T11:08:49.390Z"
}
```

***

### POST /pay

Triggers a payment from the agent. The router automatically selects the best rail.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | ✅ | Payment amount in USD |
| `recipient` | string | ✅ | Wallet address or service URL |
| `purpose` | string | ✅ | Description for audit log |
| `frequency` | string | ❌ | `"once"` (default) or `"streaming"` |

***

#### Scenario 1 — x402 Micropayment (amount ≤ $10)

```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/pay" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"amount": 2, "recipient": "0xABC123", "purpose": "Buy API credits"}'

# curl (Linux/Mac)
curl -X POST http://localhost:3001/pay \
  -H "Content-Type: application/json" \
  -d '{"amount": 2, "recipient": "0xABC123", "purpose": "Buy API credits"}'
```

**Response:**
```json
{
  "success": true,
  "rail": "x402",
  "receipt": "x402:1775214108071:2USDC",
  "timestamp": 1775214108071
}
```

> **Rail selected:** x402 on Base — fastest and cheapest for small per-request payments.

***

#### Scenario 2 — MPP Charge (amount > $10)

```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/pay" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"amount": 15, "recipient": "0xABC123", "purpose": "Buy VPS server"}'
```

**Response:**
```json
{
  "success": true,
  "rail": "mpp-charge",
  "txHash": "0xe9dbb8acba42",
  "receipt": "mpp-charge:1775214743174:15USDC",
  "timestamp": 1775214743174
}
```

> **Rail selected:** MPP Charge on Tempo — for larger one-shot payments with robust settlement.

***

#### Scenario 3 — MPP Session (streaming)

```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/pay" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"amount": 0.001, "recipient": "0xABC123", "purpose": "Streaming data feed", "frequency": "streaming"}'
```

**Response:**
```json
{
  "success": true,
  "rail": "mpp-session",
  "sessionId": "session_1775214142405",
  "receipt": "mpp-session:1775214142405:0.001USDC/s",
  "timestamp": 1775214142405
}
```

> **Rail selected:** MPP Session on Tempo — opens a streaming channel, pays per second without an onchain transaction per payment.

***

#### Scenario 4 — Policy Denied

```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/pay" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"amount": 8, "recipient": "0xABC123", "purpose": "Overspend test"}'
```

**Response (HTTP 402):**
```json
{
  "error": "Payment denied or pending human approval"
}
```

> **Policy enforced:** The request is logged as `denied` in the audit ledger. No transaction is signed or broadcast.

***

### GET /audit

Returns the full transaction ledger with summary statistics.

```bash
Invoke-RestMethod -Uri "http://localhost:3001/audit"
```

**Response:**
```json
{
  "summary": {
    "total": 4,
    "approved": 2,
    "denied": 2,
    "pending": 0,
    "byRail": {
      "x402": 1,
      "mppCharge": 1,
      "mppSession": 1
    },
    "totalSpentUSD": "17.00"
  },
  "entries": [
    {
      "purpose": "Buy API credits",
      "amount": 2,
      "status": "success",
      "rail": "x402",
      "receipt": "x402:...",
      "ts": "2026-04-03T10:00:00Z"
    }
  ]
}
```

***

### GET /pending

Returns transactions awaiting human approval.

```bash
Invoke-RestMethod -Uri "http://localhost:3001/pending"
```

***

### POST /approve/:id and POST /reject/:id

Approve or reject a pending high-value transaction.

```bash
# Approve
Invoke-RestMethod -Uri "http://localhost:3001/approve/approval_1234" -Method POST

# Reject
Invoke-RestMethod -Uri "http://localhost:3001/reject/approval_1234" -Method POST
```

***

## Rail Selection Logic

The payment router automatically selects the best rail:

```
Incoming request
      ↓
frequency === "streaming"?  →  MPP Session (Tempo)
      ↓
amount > $10?               →  MPP Charge (Tempo)
      ↓
default                     →  x402 (Base)
```

No manual rail selection required — the router handles it based on payment context.

***

## Policy Configuration

All policy values are set via `.env`. No code changes needed.

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENT_SPEND_LIMIT_PER_TX` | 20 | Maximum USD per single transaction |
| `AGENT_DAILY_CAP` | 200 | Maximum USD total per day |
| `HUMAN_APPROVAL_THRESHOLD` | 50 | USD amount that triggers human approval |

After changing `.env`, restart the server:

```bash
# Press Ctrl+C to stop, then:
npm run dev
```

***

## Project Structure

```
Aegis-Autonopay-agent/
├── src/
│   ├── agent/
│   │   └── index.ts              # Main agent loop
│   ├── payment/
│   │   ├── router.ts             # Rail selector — CORE logic
│   │   ├── x402Client.ts         # x402 on Base
│   │   ├── mppClient.ts          # MPP Charge + Session on Tempo
│   │   └── topUp.ts              # Auto top-up via MoonPay CLI
│   ├── policy/
│   │   ├── engine.ts             # OWS Policy Engine
│   │   └── approval.ts           # Human approval handler
│   ├── audit/
│   │   ├── logger.ts             # Local JSONL ledger
│   │   └── onchain.ts            # Onchain audit commit
│   └── server/
│       ├── index.ts              # Hono HTTP server entry point
│       ├── middleware/
│       │   ├── x402Gate.ts       # x402 seller-side gate
│       │   └── mppGate.ts        # MPP seller-side gate
│       └── routes/
│           ├── status.ts         # GET /status
│           ├── pay.ts            # POST /pay
│           └── audit.ts          # GET /audit
├── config/
│   ├── policy.ts                 # Policy schema and defaults
│   └── chains.ts                 # CAIP-2 chain identifiers
├── scripts/
│   ├── init-wallet.ts            # OWS wallet setup (run once)
│   ├── test-x402.ts              # x402 end-to-end test
│   └── test-mpp.ts               # MPP session end-to-end test
├── .env.example                  # Environment variable template
├── package.json
├── tsconfig.json
├── README.md                     # Project overview
└── USAGE.md                      # This file
```

***

## Troubleshooting

### Server starts but port cannot be accessed

Make sure `@hono/node-server` is installed:

```bash
npm install @hono/node-server
```

And verify `src/server/index.ts` uses `serve()` from `@hono/node-server`.

### Policy values not updating after `.env` change

`tsx watch` only detects `.ts` file changes, not `.env` changes. Always do a manual restart (`Ctrl+C` → `npm run dev`) after editing `.env`.

Also make sure `import "dotenv/config"` is the **first line** of `src/server/index.ts`.

### Port conflict

Change `PORT=3001` to another port (e.g. `3002`) in `.env`, then restart the server.

### `tsx` not recognized

```bash
npm install -D tsx
```

### `npm install` fails with `EJSONPARSE`

Your `package.json` is empty or malformed. Replace its content with the correct JSON from the repository.
