# DFMS — Digital Farm Management System
### Full project report

> A full-stack farm-monitoring platform that replaces static dashboards with live sensor streams, computer-vision camera feeds, and a real authentication-protected farmer workspace.

---

## 1. What the product does

DFMS lets a farmer (or an agriculture cooperative) monitor pigs and poultry across multiple pens/houses in real time:

- **Herd overview** — total animals, healthy count, isolated count, active alerts.
- **Animal-level health table** — body temperature, skin-color index, activity score, and per-animal risk classification.
- **Environmental panel** — temperature, humidity, ammonia ppm, hygiene score with 24-hour trend chart.
- **Disease-risk indices** — BRI (Biosecurity Risk Index) and DSI (Disease Susceptibility Index) recomputed on every sensor refresh.
- **Nutrition tracker** — feed records and nutritional profiles per growth stage (Starter / Grower / Finisher).
- **Alerts feed** — triagable alerts (disease / environment / nutrition / behavior) with one-click resolve.
- **Unresolved-issue panel** — farm issues with economic impact and recommended remediation.
- **IoT hardware status** — live ping latency, battery, firmware per device, and a **Live Camera Feed** dialog (HLS / MP4) with empty-state when no cameras are registered.
- **Account workspace** — login / signup (email + Google OAuth), profile editor, notification preferences, password change, sign-out.
- **PDF export** — any dashboard section or the full dashboard exports to a real multi-page PDF (no more blank pages).

---

## 2. Architecture

```
┌─────────────────────────────┐         HTTPS / JWT         ┌────────────────────────────┐
│   React + Vite Frontend     │ ─────────────────────────▶ │   Node + Express API       │
│   (Lovable preview /        │ ◀───── JSON ────────────── │   (Render.com free tier)   │
│    GitHub Pages /DFMS/)     │                            │                            │
└─────────────────────────────┘                            └──────────────┬─────────────┘
        │                                                                 │
        │  hls.js  ▶ RTSP/HLS camera URL (any provider)                   │ Mongoose
        │                                                                 ▼
        │                                                  ┌──────────────────────────────┐
        └─ react-query (30s polling)                       │   MongoDB Atlas (Cloud)      │
                                                           │   users · animals · alerts · │
                                                           │   env · iot · cameras ·      │
                                                           │   nutrition                  │
                                                           └──────────────────────────────┘
```

### 2.1 Frontend
- **React 18 + Vite 5 + TypeScript 5**
- **Tailwind 3 + shadcn/ui** with semantic design tokens (HSL only, no hard-coded colors).
- **React Query** for server state, with 15–30 s polling on the live panels.
- **React Router 6** with `BrowserRouter basename={import.meta.env.BASE_URL}` so the app works at `/` (Lovable) **and** `/DFMS/` (GitHub Pages).
- **`@react-oauth/google`** for Google Sign-In.
- **`hls.js`** for live camera playback (RTSP via your transcoder → HLS, or direct MP4).
- **`jspdf` + `html2canvas`** for real PDF export — fixes the previous "blank page" bug.

### 2.2 Backend (`/server`)
- **Node 20 + Express 4**, deployed via the included `render.yaml` (one-click on Render.com).
- **MongoDB Atlas** via Mongoose 8.
- **JWT auth** (bcrypt password hashing, `google-auth-library` for ID-token verification).
- **Zod** request validation.
- **Live simulation loop** — every 30 s the server jitters the latest environment readings and recomputes BRI/DSI, mimicking real sensor traffic until your hardware is wired in.
- **Auto-seed** on first boot when `ENABLE_SEED=true`.

### 2.3 Hosting plan
| Layer | Where it runs | Why |
| --- | --- | --- |
| Frontend | GitHub Pages (`raghavrk2675.github.io/DFMS/`) | Static, free, already in your domain. |
| API | Render.com Web Service | Node servers cannot run on GitHub Pages. |
| Database | MongoDB Atlas free tier (M0) | Managed, free, durable. |
| Camera transcoder (optional) | Any RTSP→HLS gateway (Wowza, ffmpeg, MediaMTX) | Browsers can't speak RTSP directly. |

---

## 3. Project layout

```
.
├── server/                       # Node + Express + MongoDB API
│   ├── src/
│   │   ├── index.js              # bootstrap, CORS, simulation loop, seed
│   │   ├── seed.js               # demo data seeder
│   │   ├── middleware/auth.js    # JWT verify + signing
│   │   ├── models/               # User, Animal, Alert, EnvReading, IoTDevice, Camera, Nutrition
│   │   └── routes/               # auth, users, animals, alerts, environment, iot, cameras, nutrition, stats
│   ├── render.yaml               # one-click Render deploy
│   ├── .env.example              # MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID, CORS_ORIGINS
│   └── README.md                 # how to run the API locally + on Render
│
├── src/                          # React frontend
│   ├── contexts/AuthContext.tsx  # login, signup, Google, logout, refresh
│   ├── hooks/useDfmsData.ts      # all React Query hooks (no more mock data)
│   ├── lib/api.ts                # axios client, JWT interceptor, base URL
│   ├── lib/pdfExport.ts          # html2canvas + jsPDF multi-page export
│   ├── pages/{Login,Signup,Index,NotFound}.tsx
│   ├── components/
│   │   ├── ProtectedRoute.tsx
│   │   ├── ProfilePanel.tsx           # uses live user, real Sign-Out
│   │   ├── AccountSettingsDialog.tsx  # PATCH /users/me + change-password
│   │   ├── NotificationPrefsDialog.tsx# PATCH /users/me/preferences
│   │   ├── CameraPlayer.tsx           # hls.js playback
│   │   ├── CameraFeedDialog.tsx       # add / view / delete cameras
│   │   ├── IoTStatusPanel.tsx         # live device list + camera launcher
│   │   ├── AnimalHealthTable.tsx      # live animals + Refresh button
│   │   ├── AlertsPanel.tsx            # live alerts + resolve
│   │   ├── EnvironmentPanel.tsx       # live trend chart
│   │   ├── DiseaseRiskPanel.tsx       # BRI / DSI from /stats
│   │   ├── NutritionPanel.tsx         # live feed + profiles
│   │   └── DownloadPDFButton.tsx      # works for any section id
│   └── ...
│
├── .github/workflows/deploy-pages.yml  # auto-builds and deploys frontend to /DFMS/
├── .env.example                        # VITE_API_URL, VITE_GOOGLE_CLIENT_ID
└── REPORT.md                           # this file
```

---

## 4. API surface

All endpoints under `/api`. Auth endpoints are public; everything else requires `Authorization: Bearer <jwt>`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/signup` | Create farmer account |
| POST | `/auth/login` | Email + password login |
| POST | `/auth/google` | Verify Google ID token, login or auto-create user |
| GET | `/auth/me` | Current user from JWT |
| POST | `/auth/logout` | No-op (JWT is client-held) |
| PATCH | `/users/me` | Update profile (name, farm, location, phone, license) |
| PATCH | `/users/me/preferences` | Update notification + theme prefs |
| POST | `/users/me/change-password` | Change password |
| DELETE | `/users/me` | Delete account |
| GET | `/animals` | All animals |
| POST | `/animals/refresh` | Force a new vitals snapshot |
| GET | `/alerts` | All alerts |
| PATCH | `/alerts/:id/resolve` | Mark alert resolved |
| GET | `/environment/trend` | 24-hour env chart data |
| GET | `/environment/current` | Latest reading |
| GET | `/iot` | IoT devices |
| GET | `/cameras` · POST · DELETE | Manage live-feed cameras |
| GET | `/nutrition/feed` · `/nutrition/profiles` | Nutrition data |
| GET | `/stats/summary` | Aggregated KPIs (totals, BRI, DSI, accuracy) |

---

## 5. How "static → dynamic" was achieved

| Before | After |
| --- | --- |
| `src/data/mockData.ts` arrays imported into every panel | All panels now call hooks in `src/hooks/useDfmsData.ts` which hit the API |
| Charts hard-coded with random sample points | `EnvironmentPanel` reads `/environment/trend`, refetched every 30 s |
| Disease indices were constants | `BRI` and `DSI` recomputed on the server from live sensor jitter and exposed via `/stats/summary` |
| Profile object literal in `ProfilePanel.tsx` | Reads `useAuth().user`, edits via `AccountSettingsDialog` |
| IoT cards were a hard-coded array | `useIoTDevices()` hook + relative-time formatting |
| Cameras had no representation | `Camera` model + `CameraPlayer` (hls.js) + `CameraFeedDialog` with empty-state "No cameras detected" |

---

## 6. Bug fixes shipped in this pass

1. **PDF "blank page" bug** — replaced `window.print()` with `html2canvas` rasterization + `jsPDF` slicing into A4 pages. Implementation: `src/lib/pdfExport.ts`.
2. **Refresh button** — IoT panel now invalidates the relevant React Query keys instead of a fake `setTimeout`.
3. **Sign-Out** — wired to `AuthContext.logout()` → clears JWT → redirects to `/login`.
4. **Account Settings & Notification Preferences** — both buttons in `ProfilePanel` now open dialogs that actually persist to MongoDB through `PATCH /users/me` and `PATCH /users/me/preferences`.

---

## 7. Running locally

```bash
# 1. API
cd server
cp .env.example .env       # fill MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID
npm install
npm run dev                # http://localhost:4000

# 2. Frontend (in a separate terminal, project root)
cp .env.example .env       # VITE_API_URL=http://localhost:4000
bun install
bun run dev                # http://localhost:8080
```

Default seed creates a demo farmer:

```
email:    demo@dfms.farm
password: dfmsdemo123
```

---

## 8. Deploying

### Backend → Render.com
1. Push the repo to GitHub (already connected via Lovable).
2. On Render: **New → Blueprint** → pick this repo → Render reads `server/render.yaml`.
3. Set the secrets in the Render dashboard: `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `CORS_ORIGINS=https://raghavrk2675.github.io`.
4. Note the public URL Render hands you (e.g. `https://dfms-api.onrender.com`).

### Frontend → GitHub Pages `/DFMS/`
1. In the GitHub repo: **Settings → Pages → Source = GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables** → add:
   - `VITE_API_URL` = `https://dfms-api.onrender.com`
   - `VITE_GOOGLE_CLIENT_ID` = your Google OAuth client ID
3. Push to `main`. The included workflow `.github/workflows/deploy-pages.yml` builds with `VITE_BASE_PATH=/DFMS/` and publishes to `https://raghavrk2675.github.io/DFMS/`.

### Cameras
- Any RTSP source can be transcoded to HLS by **MediaMTX**, **ffmpeg**, or your NVR.
- Add the `.m3u8` URL via **IoT panel → Live Camera Feed → Add camera**.
- If you have no cameras, the dialog shows a friendly "No cameras detected" empty state.

---

## 9. Security notes

- Passwords are bcrypt-hashed with cost 12.
- JWT signed with `JWT_SECRET` (rotate via Render env vars; old tokens expire in 7 days).
- All write endpoints validate input with **Zod** before touching MongoDB.
- CORS is locked down to the origins in `CORS_ORIGINS`.
- The frontend never stores secrets; only the JWT lives in `localStorage` under `dfms_token`.
- Google Sign-In verifies the ID token server-side using `google-auth-library` — the client cannot forge identities.

---

## 10. What was intentionally left out

- **Real SMS / email delivery** — preferences are stored, but we did not wire Twilio/SendGrid; the toggles drive future integrations.
- **Per-pen RBAC** — only `farmer` / `admin` roles ship; multi-tenant farm sharing is a future enhancement.
- **Push notifications** — the toggle is stored; a service-worker subscription flow is the next step.

Everything else from the original brief is live and wired end-to-end.
