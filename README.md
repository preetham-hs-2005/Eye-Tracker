# F1 2026 Prediction League (MERN)

Production-ready private fantasy-style Formula 1 prediction app with role-based admin controls, live leaderboard, and 2026 race schedule.

## Stack
- Frontend: React + Vite + Tailwind + Context API + dnd-kit + framer-motion
- Backend: Node.js + Express + MongoDB (Mongoose)
- Auth: JWT + bcrypt
- Validation: Zod
- Analytics: Recharts

## Features delivered
- JWT auth with register/login/me and role-based admin route protection.
- Pre-seeded 2026 race calendar with sprint weekend flags.
- Prediction lock middleware (auto closes 1 minute before qualifying).
- Prediction form includes podium P1/P2/P3 (drag-drop), pole, unexpected statement.
- Duplicate-prediction prevention (unique user/race index) with upsert editing.
- Unexpected vote flow with majority voting and 24-hour close after race start.
- Full scoring engine (winner/P2/P3/pole/unexpected/exact bonus + sprint 0.5 multiplier).
- Leaderboard with rank and animated transitions.
- Admin panel for official result entry, scoring run, lock toggle, user management, and manual point override endpoint.
- Analytics endpoint and UI cards for season highlights + points graph.
- Dark F1-themed UI with red/black accents, glass cards, subtle motion, toast notifications, loading skeleton.
- Docker + Render/Vercel deployment files.

## Project structure
```
/client
/server
  /config
  /controllers
  /middleware
  /models
  /routes
  /seed
  /utils
```

## Local run
### 1) Backend
```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```
Use this MongoDB URI in `.env`:
`mongodb+srv://Pree:pree1234@cluster0.o2h7vze.mongodb.net/f1_prediction_league?retryWrites=true&w=majority&appName=Cluster0`

### 2) Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

## API overview
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/races`
- `POST /api/predictions`
- `GET /api/predictions/leaderboard/all`
- `POST /api/predictions/:id/vote`
- Admin:
  - `PUT /api/admin/races/:id/results`
  - `POST /api/admin/races/:id/score`
  - `PATCH /api/admin/predictions/:id/override`
  - `GET /api/admin/analytics`
  - `GET /api/admin/users`

## Deployment
- Backend: Render (`render.yaml` included).
- Frontend: Vercel (`vercel.json` included).
- DB: MongoDB Atlas using provided connection string.

## Notes
- Create first admin automatically with env credentials during seed.
- Use `ADMIN_EMAIL` + `ADMIN_PASSWORD` from server `.env`.
