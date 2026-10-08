# Slime Fish Demo API

A demo prediction-markets API built with Node.js, Express, Prisma, and PostgreSQL. It supports account registration and login, creating and browsing markets, placing YES/NO bets, and resolving markets as their creator.

> This project is a learning/demo API. Bets are recorded for demonstration only; it does not process real money or provide production-grade financial, authorization, or abuse protections.

## Requirements

- Node.js 18 or newer
- PostgreSQL

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a PostgreSQL database, then copy `.env.example` to `.env` in the project root and update its values:

   ```bash
   cp .env.example .env
   ```

   Replace the database credentials and use a unique, private value for `JWT_SECRET`. On Windows PowerShell, use `Copy-Item .env.example .env`. Do not commit `.env`.

3. Generate the Prisma client and create/update the database tables:

   ```bash
   npm run db:generate
   npm run db:push
   ```

4. Start the API:

   ```bash
   npm start
   ```

   For development with automatic restarts, run `npm run dev`.

The health check is `GET http://localhost:10000/`.

## Authentication

### Register

`POST /api/auth/register`

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "a-secure-demo-password"
}
```

### Log in

`POST /api/auth/login`

```json
{
  "email": "demo@example.com",
  "password": "a-secure-demo-password"
}
```

Both endpoints return a user object and a signed bearer token. Send the token to protected endpoints with:

```http
Authorization: Bearer YOUR_TOKEN
```

Passwords are hashed before storage. Tokens expire after seven days.

## Market endpoints

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/markets` | Public | List markets; optional `search` and `category` query parameters |
| `GET` | `/api/markets/:id` | Public | Get a market, its bets, and indicative odds |
| `POST` | `/api/markets` | Authenticated | Create a market |
| `POST` | `/api/markets/:id/bet` | Authenticated | Place a positive-amount YES or NO bet |
| `PUT` | `/api/markets/:id/resolve` | Market creator | Resolve a market with `YES` or `NO` |

Create a market with `POST /api/markets`:

```json
{
  "question": "Will the demo launch this month?",
  "description": "A sample market for trying the API.",
  "category": "technology",
  "endDate": "2030-12-31T23:59:59.000Z"
}
```

Place a bet with `POST /api/markets/:id/bet`:

```json
{
  "outcome": "YES",
  "amount": 10
}
```

Resolve a market with `PUT /api/markets/:id/resolve`:

```json
{
  "winningOutcome": "YES"
}
```

All request bodies should be sent as JSON with `Content-Type: application/json`. Protected requests also need the bearer token.