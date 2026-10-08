# Prediction Markets Demo API

Express + PostgreSQL + Prisma - Demo for YES/NO prediction markets

## Features
- Auth: register / login with JWT + bcrypt
- Markets: create (protected), list, get by id, resolve
- Bets: place YES/NO bet, list user bets
- Postgres + Prisma migrations

## Setup
git clone https://github.com/Devbybaraka/demo-api.git
cd demo-api
npm install


npx prisma migrate dev --name init
npx prisma generate
npm run dev