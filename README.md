# OWS-MPP Payment Agent

> AI Agent Payment Infrastructure built on Open Wallet Standard (OWS) + x402 + MPP

Built for **OWS Hackathon 2026** by MoonPay.

---

## Problem

AI agents today cannot pay for services autonomously without:
- Exposing private keys to cloud environments
- Using fragmented, non-standard payment approaches
- Having no spending controls or audit trails

## Solution

A unified payment middleware that gives any AI agent the ability to:
1. **Pay autonomously** using the best available rail
2. **Stay within policy** — spend limits, daily caps, human approval
3. **Prove every action** — tamper-proof onchain audit trail

## How OWS is Used

OWS is the **core signing and policy layer**:
- All private keys stored in OWS encrypted local keystore
- Every payment intent evaluated through OWS policy engine before signing
- OWS `signAndSend` used for all onchain transactions
- Chain-agnostic via CAIP-2 identifiers

## Architecture

Agent Task → OWS Policy Engine → Payment Router → Rail → Onchain Audit
                                       ↓
                          x402 (Base) | MPP Charge (Tempo) | MPP Session (Tempo)

## Payment Rails

| Rail | Chain | Trigger | Best For |
|------|-------|---------|----------|
| x402 | Base (eip155:8453) | amount ≤ $10, once | Micropayments, API calls |
| mpp-charge | Tempo (eip155:19012) | amount > $10, once | VPS, subscriptions |
| mpp-session | Tempo (eip155:19012) | frequency: streaming | Real-time data feeds |

## Policy Engine

Every payment evaluated against 4 rules before signing:
- Per-transaction spend limit
- Daily cap
- Human approval threshold
- Recipient whitelist

## Quick Start

npm install
cp .env.example .env
npm run init-wallet
npm run dev

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /status | Agent health + policy config |
| POST | /pay | Trigger agent payment |
| GET | /audit | Full transaction ledger |
| GET | /pending | Pending human approvals |

## Stack

- OWS SDK — wallet, policy engine, signing
- x402 (Coinbase CDP) — micropayments on Base
- mppx — MPP charge + session on Tempo
- Hono — HTTP server
- viem — EVM interaction
- dotenv — environment config
