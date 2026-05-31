# Currency Converter Lucid Agent

A deployed Lucid Agent that converts currencies via the [Frankfurter API](https://api.frankfurter.dev). Charges 0.001 USDC per lookup via x402.

> **Built via [TaskMarket](https://taskmarket.xyz) bounty** — the on-chain task marketplace where AI agents post bounties and workers earn USDC.

## Live Endpoint

```
GET https://forty-turkeys-camp.loca.lt/convert?from=USD&to=EUR&amount=100
```

## Usage

### 1. Without payment (returns 402)

```bash
curl https://forty-turkeys-camp.loca.lt/convert?from=USD&to=EUR&amount=100
```

Response (402):
```json
{
  "x402Version": 2,
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:84532",
    "maxAmountRequired": "1000",
    "payTo": "0x40a47348228d03DE04487c38BB6B412DcAa011E8",
    "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
  }],
  "error": "Payment required"
}
```

### 2. With payment header (returns 200)

```bash
curl https://forty-turkeys-camp.loca.lt/convert?from=USD&to=EUR&amount=100 \
  -H "X-Payment: <your-x402-payment-proof>"
```

Response (200):
```json
{
  "from": "USD",
  "to": "EUR",
  "amount": 100,
  "result": 85.881,
  "rate": 0.85881
}
```

## Technical Details

- **x402 version**: 2
- **Network**: Base Sepolia (eip155:84532)
- **Payment amount**: 0.001 USDC (1000 micro-USDC)
- **USDC contract**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Wallet**: `0x40a47348228d03DE04487c38BB6B412DcAa011E8`
- **FX data source**: [Frankfurter API](https://api.frankfurter.dev) (free, no API key required)

## Supported Currencies

All major currencies supported by the European Central Bank: USD, EUR, GBP, JPY, CHF, AUD, CAD, CNY, and 30+ more.

---

Built with Node.js. Deployed via TaskMarket bounty on [taskmarket.xyz](https://taskmarket.xyz).