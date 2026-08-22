# VTry — Virtual Try-On Accessories Shop

A final-year project: an online accessories store with a browser-based
virtual try-on feature. Customers pick a product, turn on their camera, and
see it tracked onto themselves in real time before buying.

**Status**: Eyewear (glasses) try-on is fully working today. Earrings and
necklaces exist in the data model and admin UI as planned future work, but
their tracking/positioning logic isn't built yet — selecting them in the
admin product form is currently disabled with a "not built yet" note.

## Structure

This repo is two independent apps that run side by side — each has its own
`package.json`, its own `npm install`, and its own dev server. Nothing at
the repo root needs installing.

```
VTryFYP/
├── Backend/    Node.js + Express + MongoDB API (auth, products, orders, etc.)
└── Frontend/   React + Vite storefront and admin dashboard
```

## Prerequisites

- [Node.js](https://nodejs.org) v18 or newer (includes npm)
- [Git](https://git-scm.com)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account
- A free [Cloudinary](https://cloudinary.com/users/register_free) account

## Environment setup

Everything the backend needs lives in `Backend/.env`, which is gitignored —
you create it yourself from `Backend/.env.example`. Here's how to get each
value.

### 1. MongoDB (`MONGO_URI`)

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   and create a free **M0** cluster (any provider/region).
2. **Database Access** → add a database user (username + password).
3. **Network Access** → add an IP address. For local development, "Allow
   access from anywhere" (`0.0.0.0/0`) is the simplest option.
4. **Database → Connect → Drivers** → copy the connection string. It looks
   like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Fill in your username/password, and add a database name after the host,
   e.g. `.../vtryfyp?retryWrites=...`.

### 2. Cloudinary (`CLOUDINARY_*`)

Used for product images and try-on overlay PNG uploads.

1. Sign up at [Cloudinary](https://cloudinary.com/users/register_free).
2. Your dashboard home page shows **Cloud name**, **API Key**, and
   **API Secret** directly — copy all three.

### 3. JWT secret (`JWT_SECRET`)

Just a random string, no account needed:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4. Email (`EMAIL_USER` / `EMAIL_PASS`) — optional

Password-reset emails use a shared Mailtrap sandbox inbox as a fallback if
these are left blank, so you can skip this for local development — you just
won't be able to see the reset emails yourself. If you want to receive them,
sign up free at [Mailtrap](https://mailtrap.io), create an inbox, and use
its SMTP credentials here.

### 5. Fill in `Backend/.env`

Copy `Backend/.env.example` to `Backend/.env` and fill in the values above:

```env
PORT=5000
MONGO_URI=<your connection string>
JWT_SECRET=<your random string>
CORS_ORIGIN=http://localhost:5173,http://localhost:5000
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your api key>
CLOUDINARY_API_SECRET=<your api secret>
EMAIL_USER=
EMAIL_PASS=
```

### 6. Frontend env — optional

`Frontend/.env.example` documents `VITE_API_URL`, which every page already
defaults to `http://localhost:5000`. You only need a `Frontend/.env` if your
backend runs somewhere other than that.

## Running it locally

You need both apps running at the same time, in two terminals.

**1. Backend**:

```bash
cd Backend
npm install
npm run dev
```

Runs on `http://localhost:5000`. Swagger API docs at `/api-docs`.

**2. Frontend**:

```bash
cd Frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`.

See `Backend/README.md` for the full API reference and `Frontend/README.md`
for frontend-specific notes.

## Getting an admin account

There's no seed script, and the "create user" API endpoint itself requires
an existing admin, so the first admin has to be created by hand:

1. Sign up a normal account through the site's regular signup form
   (`/signup`).
2. In MongoDB Atlas, go to **Browse Collections** → your database → `users`
   collection, find that user, and edit `isAdmin` to `true`.
3. Log in at `/admin/login` with that account. Once you have one admin, it
   can create/promote others from the admin Users page.

## How the try-on feature works

It's entirely client-side — no server-side machine learning involved. The
`FaceTryOn` component (`Frontend/src/Components/Frontend/FaceTryOn.jsx`)
uses Google's MediaPipe Face Landmarker (loaded from a public CDN at
runtime) to track face landmarks from the webcam feed, then draws the
product's overlay PNG onto a canvas, positioned and scaled to match the
tracked face each frame. Each product carries its own tuning values (scale,
vertical offset, overlay aspect ratio, optional per-point calibration) set
from the admin product form, which also has a live "Test on Camera" preview
and a click-to-calibrate tool for lining up the overlay precisely.

**Working now**: glasses. **Planned**: earrings (ear-position tracking) and
necklaces (neck/shoulder-position tracking) — the data model and admin UI
already have placeholders for these, but the actual positioning logic for
either doesn't exist yet.
