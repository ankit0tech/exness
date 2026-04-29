# Exness-like Trading App

This is a full-stack trading simulator inspired by Exness.
It supports user authentication via google, account creation/funding, opening and closing long/short trades, and viewing open/closed trade history.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind, Tradingview Lightweight Charts
- Backend: Node.js, Express, TypeScript, WebSocket
- Database: PostgreSQL + Prisma
- Auth: JWT (with Google login support in UI)

## Project Structure

- `frontend/` - React app (UI, chart, trade/account screens)
- `backend/` - Express API, Prisma schema/migrations, business logic, WebSocket for live price updates

## Main Features

- Create and manage a trading account
- Deposit/withdraw balance
- Open LONG and SHORT trades
- Close positions and calculate realized PnL
- Track open and closed trades
- Ledger entries for balance-impacting events
- Real-time market candle updates in UI using WebSocket

## Backend Routes (high level)

- `POST /auth/*` - authentication flows
- `POST /account/create` - create account
- `GET /account/details` - account overview
- `POST /account/update-balance` - deposit/withdraw
- `POST /trade/create/long` - open long trade
- `POST /trade/create/short` - open short trade
- `POST /trade/close/long/:id` - close long trade
- `POST /trade/close/short/:id` - close short trade
- `GET /trade/open-trades` - list open trades
- `GET /trade/closed-trades` - list closed trades

## Run Locally

### 1) Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

In another terminal, start the WebSocket price stream server:

```bash
cd backend
npm run ws
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create `.env` files in both `backend/` and `frontend/`.
At minimum, configure:

- Backend: database URL, JWT secret, allowed frontend origins
- Frontend: API base URL (for example `VITE_API_URL`)

## Notes

- Monetary values are handled in scaled integer units to avoid floating-point precision issues.
- Binance free api is being used to fetch live price details.
- This is a learning/MVP project and not production trading software.