# VTry — Virtual Try-On Eyewear Shop

A final-year project: an online eyewear store with a browser-based virtual
try-on feature. Customers pick a pair of glasses, turn on their camera, and
see the frames tracked onto their own face in real time before buying.

## Structure

This repo is two separate apps that run side by side:

```
VTryFYP/
├── Backend/    Node.js + Express + MongoDB API (auth, products, orders, etc.)
└── Frontend/   React + Vite storefront and admin dashboard
```

They're independent projects — each has its own `package.json`, its own
`npm install`, and its own dev server. Nothing at the repo root needs
installing.

## Running it locally

You need both running at the same time, in two terminals.

**1. Backend** (needs a `.env` file — see `Backend/.env.example` for the
required variables: a MongoDB URI, a JWT secret, and Cloudinary
credentials for image uploads):

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

Runs on `http://localhost:5173` and talks to the backend at
`http://localhost:5000` by default (see `Frontend/.env.example` if you need
to point it elsewhere).

See `Backend/README.md` for the full API reference and `Frontend/README.md`
for frontend-specific notes.

## How the try-on feature works

It's entirely client-side — no server-side machine learning involved. The
`FaceTryOn` component (`Frontend/src/Components/Frontend/FaceTryOn.jsx`)
uses Google's MediaPipe Face Landmarker (loaded from a public CDN at
runtime) to track face landmarks from the webcam feed, then draws the
product's glasses PNG onto a canvas overlay, positioned and scaled to match
the tracked face each frame. Each product can carry its own tuning values
(scale, vertical offset, overlay aspect ratio, optional calibration points)
set from the admin product form.
