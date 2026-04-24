# DFMS API

Node + Express + MongoDB Atlas backend for the **Digital Farm Management System** (DFMS) dashboard.

## Quick start (local)

```bash
cd server
cp .env.example .env        # then fill MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID
npm install
npm run dev                  # http://localhost:4000
```

On first start with an empty DB, the server **auto-seeds** ~13 animals, ~6 alerts, 11 IoT devices, 12h of environment readings, feed records, and nutrition profiles. A simulator updates sensors every 30 s.

## Deploy to Render.com (free)

1. Push the repo to GitHub (Lovable already syncs).
2. On render.com → **New +** → **Blueprint** → pick this repo. Render reads `server/render.yaml`.
3. In the Render dashboard, set the env vars marked `sync: false`:
   - `MONGODB_URI` — from MongoDB Atlas → Connect → Drivers
   - `GOOGLE_CLIENT_ID` — from Google Cloud Console → Credentials
4. Render gives you a URL like `https://dfms-api.onrender.com`. Put that into the frontend's `VITE_API_URL`.

## Endpoints (all `/api/...`, JWT in `Authorization: Bearer <token>` unless noted)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/signup` | – | Create account `{email,password,name,farmName?}` |
| POST | `/auth/login` | – | Log in `{email,password}` → `{token,user}` |
| POST | `/auth/google` | – | Sign in with Google `{credential}` (ID token) |
| GET  | `/auth/me` | ✓ | Current user |
| POST | `/auth/logout` | ✓ | Server-side ack (client clears token) |
| PATCH | `/users/me` | ✓ | Update profile fields |
| PATCH | `/users/me/preferences` | ✓ | Update notification + theme prefs |
| POST | `/users/me/change-password` | ✓ | Change password |
| DELETE | `/users/me` | ✓ | Delete account |
| GET  | `/animals` | ✓ | List animals |
| POST | `/animals` | ✓ | Add animal |
| POST | `/animals/refresh` | ✓ | Trigger sensor jitter (used by Refresh button) |
| PATCH | `/animals/:id/isolate` | ✓ | Toggle isolation |
| GET  | `/alerts?resolved=false` | ✓ | List alerts |
| PATCH | `/alerts/:id/resolve` | ✓ | Resolve alert |
| GET  | `/environment/trend` | ✓ | Last 12 h env readings |
| GET  | `/environment/current` | ✓ | Latest reading |
| GET  | `/iot` | ✓ | All hardware devices |
| GET  | `/cameras` | ✓ | All cameras (HLS streams) |
| POST | `/cameras` | ✓ | Add camera `{name,location,streamUrl,streamType}` |
| DELETE | `/cameras/:id` | ✓ | Remove camera |
| GET  | `/nutrition/feed` | ✓ | Weekly feed records |
| GET  | `/nutrition/profiles` | ✓ | Pig + poultry nutrition profiles |
| GET  | `/stats/summary` | ✓ | KPIs incl. computed BRI / DSI |

BRI / DSI are **computed live** from current animal vitals using the formulas from the research paper:

```
BRI = w₁·Td + w₂·Hd + w₃·Ad + w₄·Bs
DSI = α·Ed + β·Nd + γ·Bs
```
