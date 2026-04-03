# OWS-MPP Payment Agent

> A policy-controlled payment infrastructure for autonomous AI agents — built on Open Wallet Standard (OWS), x402, and MPP.

Built for **OWS Hackathon 2026** by MoonPay.

***

## The Problem

AI agents increasingly need to pay for services — APIs, compute, data feeds, VPS servers. But today's implementations are broken:

- Raw private keys stored in environment variables
- No spending controls or policy enforcement
- Fragmented payment flows with no standard interface
- No audit trail for agent actions

There is no standard infrastructure layer for agent payments.

***

## The Solution

**OWS-MPP Payment Agent** is a unified payment middleware that gives any AI agent:

- ✅ A secure, locally-encrypted wallet via OWS
- ✅ Policy-gated signing — every payment evaluated before execution
- ✅ Automatic rail selection across three payment protocols
- ✅ Tamper-proof onchain audit trail

***

## How It Works

```
Agent Task
    ↓
OWS Policy Engine
(spend limit / daily cap / whitelist / human approval)
    ↓
Payment Router
    ↓
┌───────────────┬───────────────┬──────────────────┐
│  x402         │  MPP Charge   │  MPP Session      │
│  Base         │  Tempo        │  Tempo            │
│  ≤$10, once   │  >$10, once   │  streaming        │
└───────────────┴───────────────┴──────────────────┘
    ↓
Onchain Audit Commit
```

The router selects the best rail automatically based on amount and frequency — no manual configuration per payment.

***

## How OWS Is Used

OWS is the **foundation**, not an add-on:

| OWS Feature | How We Use It |
|---|---|
| Encrypted local keystore | All private keys stored locally — never touch the cloud |
| Policy engine | Every payment evaluated before signing |
| Agent access delegation | AI agent operates within defined boundaries |
| CAIP-2 chain identifiers | Chain-agnostic: Base (`eip155:8453`) and Tempo (`eip155:19012`) |
| `signAndSend` interface | Used for all onchain transaction execution |

***

## Payment Rails

| Rail | Chain | Trigger | Best For |
|------|-------|---------|----------|
| **x402** | Base (`eip155:8453`) | amount ≤ $10, once | API calls, micropayments |
| **MPP Charge** | Tempo (`eip155:19012`) | amount > $10, once | VPS, subscriptions, tools |
| **MPP Session** | Tempo (`eip155:19012`) | frequency: streaming | Real-time feeds, continuous usage |

***

## Policy Engine

Four rules evaluated before every payment:

1. **Per-tx spend limit** — reject if amount exceeds threshold
2. **Daily cap** — reject if cumulative daily spend would exceed limit
3. **Human approval threshold** — route to human approval queue if amount is high
4. **Recipient whitelist** — reject if address not in approved list

All configurable via `.env` — no code changes required.

***

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/status` | Agent health + current policy config |
| POST | `/pay` | Trigger a payment from the agent |
| GET | `/audit` | Full transaction ledger with summary |
| GET | `/pending` | Transactions awaiting human approval |
| POST | `/approve/:id` | Approve a pending transaction |
| POST | `/reject/:id` | Reject a pending transaction |

***

## Quick Demo

```bash
# Start agent
npm run dev

# Micropayment → x402 on Base
curl -X POST http://localhost:3001/pay \
  -d '{"amount": 2, "recipient": "0x...", "purpose": "Buy API credits"}'
# → { "rail": "x402", "receipt": "..." }

# Large payment → MPP Charge on Tempo
curl -X POST http://localhost:3001/pay \
  -d '{"amount": 15, "recipient": "0x...", "purpose": "Buy VPS"}'
# → { "rail": "mpp-charge", "txHash": "0x..." }

# Streaming → MPP Session on Tempo
curl -X POST http://localhost:3001/pay \
  -d '{"amount": 0.001, "recipient": "0x...", "purpose": "Stream data", "frequency": "streaming"}'
# → { "rail": "mpp-session", "sessionId": "..." }
```

***

## Tech Stack

| Layer | Package |
|-------|---------|
| Wallet & Policy | `@ows/sdk` |
| Micropayments | `x402-hono`, `@x402/fetch` |
| MPP Payments | `mppx` |
| HTTP Server | `hono`, `@hono/node-server` |
| EVM Interaction | `viem` |
| Config & Validation | `dotenv`, `zod` |

***

## Why This Matters

This project turns OWS from a wallet standard into a **complete agent payment infrastructure**. Any developer can drop this middleware into their AI agent stack and immediately have:

- Controlled autonomous payments
- Multi-rail support (Base + Tempo)
- Policy enforcement out of the box
- Full audit trail

> See [USAGE.md](./USAGE.md) for full installation and usage guide.

***

## License

MIT — Built for OWS Hackathon 2026
