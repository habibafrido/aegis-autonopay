# Aegis Autonopay 🤖

>A policy-governed autonomous payment agent built on the Open Wallet Standard (OWS).
Aegis shields every transaction through a smart policy engine before routing payments across multiple rails — with human-in-the-loop approval for high-value transfers.

***

##  Hackathon Tracks

-  **Agent Spend Governance & Identity** — Policy engine with per-tx limits, daily caps, and approval thresholds
-  **Pay-Per-Call Services & API Monetization** — HTTP 402 / x402 micropayment rail
-  **Agentic Storefronts & Real-World Commerce** — Multi-rail autonomous payments (x402, MPP charge, MPP session)

***

## Architecture

```
POST /pay
    │
    ▼
┌─────────────────────────────────────────────┐
│              Agent (index.ts)               │
│                                             │
│  1. PolicyEngine.evaluate()                 │
│     ├── approved  → route payment           │
│     ├── warn      → enqueue() → POST /approve│
│     └── denied    → return null (402)       │
│                                             │
│  2. Router.route()                          │
│     ├── amount ≤ $10  → x402 rail           │
│     ├── amount > $10  → mpp-charge rail     │
│     └── streaming     → mpp-session rail    │
│                                             │
│  3. AuditLogger.log() → audit/ledger.jsonl  │
└─────────────────────────────────────────────┘
```

## HOW It WORKs
```
POST /pay
    │
    ▼
┌─────────────────────────────────────────────────┐
│              Aegis Policy Engine                │
│                                                 │
│  dailySpent + amount > dailyCap?  → ❌ denied   │
│  amount > spendLimitPerTx?        → ❌ denied   │
│  amount >= approvalThreshold?     → ⚠️  queue   │
│  recipient not in whitelist?      → ❌ denied   │
│  all checks passed?               → ✅ approved │
└──────────────────┬──────────────────────────────┘
                   │ approved
                   ▼
┌─────────────────────────────────────────────────┐
│            Autonopay Rail Router                │
│                                                 │
│  amount ≤ $10,  once       →  x402             │
│  amount > $10,  once       →  mpp-charge       │
│  frequency = "streaming"   →  mpp-session      │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
           AuditLogger → audit/ledger.jsonl
```
***

## Features

### Policy Engine
- **Per-transaction spend limit** — hard cap per payment
- **Daily cap** — cumulative daily spend limit with auto-reset
- **Human approval threshold** — amounts above threshold require manual approval
- **Recipient whitelist** — optional allowlist of approved recipients

### 🚦 Multi-Rail Payment Router
| Rail | Trigger | Use Case |
|------|---------|----------|
| `x402` | amount ≤ $10, once | Micropayments, API pay-per-call |
| `mpp-charge` | amount > $10, once | Larger one-shot payments |
| `mpp-session` | frequency = "streaming" | Streaming / real-time payments |

###  Human-in-the-Loop
Payments that exceed the approval threshold are queued — not denied — and require explicit human approval via `POST /approve/:id`.

###  Audit Ledger
Every transaction (approved, pending, denied) is appended to `audit/ledger.jsonl` with full receipt trail.

***

## Quick Start

### Prerequisites
- Node.js v20+
- `pnpm` or `npm`

### Install
```bash
git clone https://github.com/your-username/Aegis-Autonopay-agent
cd Aegis-Autonopay-agent
pnpm install
```

### Configure `.env`
```env
# OWS Wallet
OWS_WALLET_PASSWORD=your_strong_password
OWS_WALLET_PATH=./wallet.ows

# Chain RPCs
BASE_RPC_URL=https://mainnet.base.org
TEMPO_RPC_URL=https://rpc.tempo.xyz

# Policy (USD)
AGENT_SPEND_LIMIT_PER_TX=100
AGENT_DAILY_CAP=200
HUMAN_APPROVAL_THRESHOLD=50

# Server
PORT=3001
```

### Run
```bash
pnpm dev
```

Server starts at `http://localhost:3001`

***

## API Reference

### `POST /pay`
Submit a payment request to the agent.

**Request body:**
```json
{
  "amount": 2,
  "recipient": "0xABC123",
  "purpose": "Buy API credits",
  "frequency": "once"
}
```

**Responses:**
| Status | Meaning |
|--------|---------|
| `200` | Payment approved and executed |
| `402` | Payment denied or pending human approval |
| `400` | Missing required fields |

**200 Example:**
```json
{
  "success": true,
  "rail": "x402",
  "receipt": "x402:1775221842906:2USDC",
  "timestamp": 1775221842906
}
```

***

### `GET /approve`
List all pending payments awaiting human approval.

**Response:**
```json
{
  "pending": [
    {
      "id": "pending_1775230302960_rct0p",
      "req": { "amount": 55, "recipient": "0xABC123", "purpose": "Big payment" },
      "reason": "Amount $55 requires human approval",
      "createdAt": "2026-04-03T15:31:42.960Z"
    }
  ],
  "count": 1
}
```

***

### `POST /approve/:id`
Approve a pending payment. The payment is executed immediately.

```bash
curl -X POST http://localhost:3001/approve/pending_1775230302960_rct0p
```

**Response:**
```json
{
  "success": true,
  "rail": "mpp-charge",
  "txHash": "0x20a4fd0ef6524",
  "receipt": "mpp-charge:1775230372685:55USDC",
  "timestamp": 1775230372685
}
```

***

### `POST /approve/:id/deny`
Deny a pending payment.

```json
{ "success": true, "message": "Payment denied" }
```

***

## Demo Flow

```powershell
# 1. Micropayment → x402 rail
Invoke-RestMethod -Uri "http://localhost:3001/pay" -Method POST `
  -ContentType "application/json" `
  -Body '{"amount": 2, "recipient": "0xABC123", "purpose": "Buy API credits"}'

# 2. Large payment → mpp-charge rail
Invoke-RestMethod -Uri "http://localhost:3001/pay" -Method POST `
  -ContentType "application/json" `
  -Body '{"amount": 15, "recipient": "0xABC123", "purpose": "Premium data feed"}'

# 3. Streaming → mpp-session rail
Invoke-RestMethod -Uri "http://localhost:3001/pay" -Method POST `
  -ContentType "application/json" `
  -Body '{"amount": 0.001, "recipient": "0xABC123", "purpose": "Streaming compute", "frequency": "streaming"}'

# 4. Triggers human approval (amount >= threshold $50)
Invoke-RestMethod -Uri "http://localhost:3001/pay" -Method POST `
  -ContentType "application/json" `
  -Body '{"amount": 55, "recipient": "0xABC123", "purpose": "Big payment"}'

# 5. Check pending queue
Invoke-RestMethod -Uri "http://localhost:3001/approve" -Method GET

# 6. Approve (replace ID with actual from step 5)
Invoke-RestMethod -Uri "http://localhost:3001/approve/pending_XXXX" -Method POST

# 7. Policy hard deny (amount > spendLimitPerTx $100)
Invoke-RestMethod -Uri "http://localhost:3001/pay" -Method POST `
  -ContentType "application/json" `
  -Body '{"amount": 105, "recipient": "0xABC123", "purpose": "Exceed limit test"}'
```

***

## Project Structure

```
Aegis-Autonopay-agent/
├── src/
│   ├── agent/
│   │   ├── index.ts          # Core agent: policy → route → audit
│   │   └── queue.ts          # Human-in-the-loop pending queue
│   ├── policy/
│   │   └── engine.ts         # PolicyEngine: evaluate, recordSpend, getStats
│   ├── payment/
│   │   └── router.ts         # Rail selector: x402 / mpp-charge / mpp-session
│   ├── audit/
│   │   └── logger.ts         # AuditLogger: append to ledger.jsonl
│   └── server/
│       ├── index.ts          # Hono server entry
│       └── routes/
│           ├── pay.ts        # POST /pay
│           └── approve.ts    # GET|POST /approve
├── config/
│   └── policy.ts             # getDefaultPolicy() from .env
├── audit/
│   └── ledger.jsonl          # Auto-generated audit trail
├── .env.example
└── README.md
```

***

## Roadmap

- [ ] Integrate `@x402/fetch` + OWS signer for real x402 payments
- [ ] Integrate `mppx` for real MPP charge & session payments
- [ ] Persistent queue (survive server restart)
- [ ] WebSocket notifications for pending approvals
- [ ] Multi-agent support (agent-to-agent payment delegation)

***

## Built With

- [Hono](https://hono.dev) — lightweight web framework
- [Open Wallet Standard (OWS)](https://openwallet.sh) — wallet & policy layer
- [x402](https://x402.org) — HTTP 402 payment protocol
- [TypeScript](https://www.typescriptlang.org) + Node.js v24

***

## License

MIT
