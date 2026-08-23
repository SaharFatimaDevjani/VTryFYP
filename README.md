# VTry — Virtual Try-On Accessories Shop

A full-stack **MERN**-style (MongoDB, Express, React, Node.js) e-commerce app
for accessories, with a browser-based **virtual try-on** feature. Customers
pick a product, turn on their camera, and see it tracked onto themselves in
real time before buying. This README is a complete manual: what the project
does, how the two halves fit together, how to set it up from scratch, and
how to use every feature.

---

## Table of Contents

1. [What this project is](#1-what-this-project-is)
2. [Tech stack](#2-tech-stack)
3. [Project structure](#3-project-structure)
4. [Prerequisites](#4-prerequisites)
5. [Setup — step by step](#5-setup--step-by-step)
6. [Running the app](#6-running-the-app)
7. [Using the app (user guide)](#7-using-the-app-user-guide)
8. [Backend API reference](#8-backend-api-reference)
9. [Data models](#9-data-models)
10. [How the try-on feature works](#10-how-the-try-on-feature-works)
11. [Security notes](#11-security-notes)
12. [Testing](#12-testing)
13. [Troubleshooting](#13-troubleshooting)
14. [Deploying](#14-deploying)

---

## 1. What this project is

An online accessories store, similar in spirit to a small Shopify-style
shop, with a distinguishing feature: **virtual try-on**.

- Anyone can browse products by category, search, and view product detail
  pages with image galleries.
- On a product page, clicking **Try On** opens the camera and overlays that
  product's image onto the customer's face in real time, tracked frame by
  frame as they move — no app download, entirely in the browser.
- Customers can check out as a **guest** or as a **logged-in user** (cart →
  shipping details → cash-on-delivery order), and logged-in users can see
  their order history and cancel pending orders from a profile page.
- An **admin dashboard** manages products (including try-on overlay upload
  and calibration), categories, orders, and users.

**Status**: **Glasses** try-on is fully working today — position, scale,
rotation, and a subtle gloss highlight all track a live face. **Earrings**
and **necklaces** exist in the data model and admin UI as planned future
work (the option is visible but disabled with a "not built yet" note),
since they'd need different landmark tracking (ear/neck position) that
hasn't been built yet.

It's split into two independently run applications that talk to each other
over HTTP:

- **`Backend/`** — a Node.js/Express REST API, backed by MongoDB.
- **`Frontend/`** — a React single-page app (built with Vite) that consumes
  that API, and hosts the on-device try-on tracking.

---

## 2. Tech stack

**Backend**

| Purpose             | Library |
|---------------------|---------|
| Web server/routing  | Express 5 |
| Database            | MongoDB via Mongoose |
| Auth                | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` password hashing |
| Image uploads       | Multer (memory storage) → Cloudinary |
| Email               | Nodemailer (password reset links) |
| API docs            | `swagger-jsdoc` + `swagger-ui-express`, served at `/api-docs` |
| CORS                | `cors`, origin allowlist read from `CORS_ORIGIN` |

**Frontend**

| Purpose             | Library |
|---------------------|---------|
| UI framework        | React 18 |
| Build tool/dev server | Vite |
| Routing             | React Router v7 |
| Styling             | Tailwind CSS + `@storefront-ui/react` |
| Face tracking       | `@mediapipe/tasks-vision` (FaceLandmarker, loaded from a CDN at runtime) |
| Icons               | `lucide-react`, `react-icons` |
| Image zoom / carousel | `react-medium-image-zoom`, `react-slick` |

---

## 3. Project structure

```
VTryFYP/
├── Backend/
│   ├── server.js                    # App entry point: middleware, routes, server startup
│   ├── config/
│   │   ├── database.js              # MongoDB connection
│   │   ├── cloudinary.js            # Cloudinary SDK config
│   │   ├── email.js                 # Nodemailer transporter (Mailtrap sandbox fallback)
│   │   └── swagger.js               # Swagger/OpenAPI spec generation
│   ├── controllers/
│   │   ├── authController.js        # register/login/forgot-reset/change-password
│   │   ├── productController.js     # product CRUD + counters
│   │   ├── categoryController.js    # category CRUD
│   │   ├── orderController.js       # order CRUD, guest checkout, stock deduction
│   │   └── userController.js        # admin user management
│   ├── middleware/
│   │   ├── authMiddleware.js        # `protect` — verifies the JWT
│   │   └── adminMiddleware.js       # `adminOnly` — requires req.user.isAdmin
│   ├── models/                      # User, Product, Category, Order (Mongoose schemas)
│   ├── routes/                      # one file per resource, mounted under /api/*
│   ├── test/
│   │   └── test-apis.ps1            # manual PowerShell API smoke-test script
│   └── package.json
│
├── Frontend/
│   ├── index.html                    # Vite HTML entry
│   ├── src/
│   │   ├── main.jsx                   # Mounts <App/> (wrapped in CartProvider)
│   │   ├── App.jsx                    # Renders the router
│   │   ├── AppRoutes/                 # Route definitions (Frontend/Admin/Auth) + AdminGuard
│   │   ├── Layout/                    # Shared layout shells per route group
│   │   ├── Components/
│   │   │   ├── Frontend/              # Storefront components — Navbar, ProductSection,
│   │   │   │                          #   FaceTryOn.jsx (the try-on engine), TryOnModal, Cart...
│   │   │   ├── Admin/                 # sidebar, OverlayCalibrator (click-to-calibrate tool)
│   │   │   └── Common/                # LoadingSpinner, ErrorMessage, ErrorMessageDark
│   │   ├── pages/
│   │   │   ├── Frontend/              # Main, Shop, ProductDetail, Checkout, Viewcart, Profile...
│   │   │   ├── Admin/                 # overview, product, categories, orders, users
│   │   │   └── Auth/                  # LoginUser, SignupUser, AdminLogin, Forgot/ResetPassword
│   │   ├── context/CartContext.jsx    # cart state, persisted to localStorage
│   │   └── utils/                     # api.js (fetch wrapper), Auth.js (token storage)
│   └── package.json
│
└── README.md                          # This file
```

---

## 4. Prerequisites

Install/create these before you start:

- **Node.js 18+** and **npm** (comes with Node) — [nodejs.org](https://nodejs.org)
- **Git**
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account (or a local MongoDB server)
- A free [Cloudinary](https://cloudinary.com/users/register_free) account (for product/overlay image uploads)
- A webcam, if you want to actually test the try-on feature

---

## 5. Setup — step by step

### 5.1 Get the code

```bash
git clone https://github.com/SaharFatimaDevjani/VTryFYP.git
cd VTryFYP
```

### 5.2 Create a MongoDB database

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free **M0** cluster (any provider/region).
2. **Database Access** → add a database user (username + password).
3. **Network Access** → add an IP address. For local development, "Allow access from anywhere" (`0.0.0.0/0`) is simplest.
4. **Database → Connect → Drivers** → copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Fill in your username/password and add a database name after the host, e.g. `.../vtryfyp?retryWrites=...`.

### 5.3 Create a Cloudinary account

1. Sign up at [Cloudinary](https://cloudinary.com/users/register_free).
2. Your dashboard home page shows **Cloud name**, **API Key**, and **API Secret** directly — copy all three.

### 5.4 Generate a JWT secret

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 5.5 Configure the backend

Copy `Backend/.env.example` to `Backend/.env` and fill it in:

```env
PORT=5000
MONGO_URI=<your connection string from 5.2>
JWT_SECRET=<your random string from 5.4>
CORS_ORIGIN=http://localhost:5173,http://localhost:5000
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=<from 5.3>
CLOUDINARY_API_KEY=<from 5.3>
CLOUDINARY_API_SECRET=<from 5.3>
EMAIL_USER=
EMAIL_PASS=
```

`EMAIL_USER`/`EMAIL_PASS` are optional — password-reset emails fall back to
a shared Mailtrap sandbox inbox if left blank, so local dev works either
way (you just can't see the reset email yourself unless you fill these in
with your own [Mailtrap](https://mailtrap.io) inbox credentials).

Install dependencies:

```bash
cd Backend
npm install
```

### 5.6 Configure the frontend — optional

Every page already defaults to `http://localhost:5000` for the API, so no
`Frontend/.env` is needed unless your backend runs elsewhere — see
`Frontend/.env.example` (`VITE_API_URL`).

Install dependencies:

```bash
cd Frontend
npm install
```

---

## 6. Running the app

You need **two terminals** running at the same time.

**Terminal 1 — backend (from `Backend/`):**
```bash
npm run dev      # nodemon, http://localhost:5000
# or: npm start  # plain node, no auto-restart
```
You should see `MongoDB Connected: ...` and `Server running on port 5000`.
Swagger API docs are at `http://localhost:5000/api-docs`.

**Terminal 2 — frontend (from `Frontend/`):**
```bash
npm run dev      # Vite, http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### Getting an admin account

There's no seed script, and the admin-only "create user" API endpoint
itself requires an existing admin, so the first admin has to be created by
hand:

1. Sign up a normal account through the site's signup form (`/signup`).
2. In MongoDB Atlas, go to **Browse Collections** → your database → `users`
   collection, find that user, and edit `isAdmin` to `true`.
3. Log in at `/admin/login` with that account. From there it can
   create/promote other admins from the admin Users page.

---

## 7. Using the app (user guide)

1. **Browse the shop** — home page shows featured/trending products;
   `/shop` lists everything, with search and category filters from the
   navbar dropdown.
2. **View a product** — click any product for its detail page: image
   gallery, price (with sale-price strike-through if discounted),
   quantity picker, description, and related products from the same
   category.
3. **Try it on** — click **TRY ON** (enabled only if the product has a
   try-on overlay configured). Grant camera access; the product tracks
   onto your face live. Click **📸 Save Photo** to download a snapshot of
   how it looks.
4. **Add to cart / Buy now** — cart is stored in `localStorage`, so it
   survives page reloads without needing an account.
5. **Checkout** — as a guest (name/email/phone + shipping address) or,
   logged in, with your saved details pre-filled. Cash-on-delivery only.
6. **Sign up / log in** — `/signup` and `/login`; "remember me" keeps you
   logged in across browser restarts (stored in `localStorage` instead of
   `sessionStorage`).
7. **Profile page** — view your order history, cancel a pending order, and
   change your password.
8. **Admin dashboard** (`/admin`, requires an admin account — see above):
   - **Products** — create/edit/delete, upload gallery images, upload a
     try-on overlay PNG, tune scale/offset/height-ratio, use the
     **🔍 Test on Camera** live preview and the click-to-calibrate tool to
     line up the overlay precisely.
   - **Categories**, **Orders** (view details, update status, cancel), and
     **Users** (create/edit/delete, promote to admin).

---

## 8. Backend API reference

All endpoints are prefixed with `/api`. Protected endpoints require
`Authorization: Bearer <token>` (the token returned by register/login).
Admin-only endpoints additionally require the logged-in user to have
`isAdmin: true`.

### Auth — `/api/auth`

| Method | Path                       | Auth | Body | Description |
|--------|----------------------------|:---:|------|--------------|
| POST   | `/register`                | No  | `{ first_name, last_name, dob, gender, email, phone, password }` | Create an account; returns `{ user, token }`. |
| POST   | `/login`                   | No  | `{ email, password }` | Log in; returns `{ user, token }`. |
| POST   | `/forgot-password`         | No  | `{ email }` | Emails a reset link if the address exists (response is identical either way, so it never reveals whether an account exists). |
| POST   | `/reset-password/:token`   | No  | `{ password }` | Resets the password if the token is valid and unexpired (15 min). |
| PUT    | `/change-password`         | Yes | `{ oldPassword, newPassword }` | Change the logged-in user's password. |

### Products — `/api/products`

| Method | Path              | Auth | Description |
|--------|-------------------|:---:|--------------|
| GET    | `/`               | No | Published products only. Query params: `category`, `inStock=true`, `search`. |
| GET    | `/counters`       | No | Product counts per category (published only). |
| GET    | `/:id`            | No | A single product. |
| GET    | `/admin/list`     | Admin | All products, including drafts. |
| POST   | `/`               | Admin | Create a product. |
| PUT    | `/:id`            | Admin | Update a product. |
| DELETE | `/:id`            | Admin | Delete a product. |

### Categories — `/api/categories`

| Method | Path      | Auth | Description |
|--------|-----------|:---:|--------------|
| GET    | `/`       | No | List all categories. |
| GET    | `/:id`    | No | A single category. |
| POST   | `/`       | Admin | Create a category. |
| PUT    | `/:id`    | Admin | Update a category. |
| DELETE | `/:id`    | Admin | Delete a category. |

### Orders — `/api/orders`

| Method | Path             | Auth | Description |
|--------|------------------|:---:|--------------|
| POST   | `/guest`         | No | Guest checkout — requires `guest: { fullName, email, phone }` and a shipping address. |
| POST   | `/`              | Yes | Checkout as the logged-in user. |
| GET    | `/`              | Yes | Admins get every order; regular users get only their own. |
| GET    | `/:id`           | Yes | A single order (owner or admin only). |
| PUT    | `/:id/status`    | Admin | Update order status (`pending`/`confirmed`/`shipped`/`delivered`/`cancelled`) — cancelling restocks the items. |
| POST   | `/:id/cancel`    | Yes | Cancel your own (or, as admin, any) still-pending order. |

### Users — `/api/users` (admin only, all routes)

| Method | Path      | Description |
|--------|-----------|--------------|
| GET    | `/`       | List all users. |
| GET    | `/:id`    | Get a user. |
| POST   | `/`       | Create a user (optionally as admin). |
| PUT    | `/:id`    | Update a user. |
| DELETE | `/:id`    | Delete a user. |

### Upload — `/api/upload`

| Method | Path | Auth | Description |
|--------|------|:---:|--------------|
| POST   | `/`  | Yes | Multipart form upload (field name `images`, up to 20 files) → returns Cloudinary URLs. |

---

## 9. Data models

**User** (`Backend/models/User.js`)
```
first_name, last_name   String   required
dob                     String   required
gender                  String   required
email                   String   required, unique, lowercase
phone                   String
password                String   required   (bcrypt hash, never plaintext)
isAdmin                 Boolean  default false
resetPasswordToken / resetPasswordExpire   (set temporarily during password reset)
createdAt / updatedAt   (automatic timestamps)
```

**Product** (`Backend/models/Product.js`)
```
title          String   required
images         [String]           Cloudinary URLs
description    String
brand          String
category       String
price          Number   required
salePrice      Number|null
stockQuantity  Number
status         String   enum: draft | published
tryOn: {
  type          String   enum: glasses | earring | necklace   (only "glasses" is implemented)
  overlayUrl     String                transparent PNG for the camera overlay
  scaleMult      Number                overlay width multiplier
  yOffsetMult    Number                vertical position adjustment
  heightRatio    Number                overlay height as a fraction of its width
  meta: {                             optional per-point pixel calibration
    leftLensPx, rightLensPx, bridgePx, leftTempleEndPx, rightTempleEndPx: { x, y }
  }
}
createdAt / updatedAt
```

**Category** (`Backend/models/Category.js`)
```
title         String   required
description   String
createdAt / updatedAt
```

**Order** (`Backend/models/Order.js`)
```
user             ObjectId (User)   optional — absent for guest orders
guest            { fullName, email, phone }   only set for guest orders
items            [{ product: ObjectId (Product), title, qty, price }]
totalAmount      Number   required
status           String   enum: pending | confirmed | shipped | delivered | cancelled
shippingAddress  { fullName, phone, address, city, postalCode, country }
paymentMethod    String   default "COD"
paymentResult    Mixed
createdAt / updatedAt
```

---

## 10. How the try-on feature works

It's entirely client-side — no server-side machine learning involved. The
`FaceTryOn` component (`Frontend/src/Components/Frontend/FaceTryOn.jsx`)
uses Google's MediaPipe Face Landmarker (loaded from a public CDN at
runtime, cached after first load so it doesn't re-download every time the
try-on modal opens) to track face landmarks from the webcam feed, then
draws the product's overlay PNG onto a canvas each frame — position,
rotation, and scale computed from eye/temple/nose landmarks, with
exponential smoothing and a brief grace period if tracking drops for a
frame. Each product carries its own tuning values (scale, vertical offset,
overlay aspect ratio, optional per-point calibration) set from the admin
product form, which has a live "Test on Camera" preview and a
click-to-calibrate tool for lining up the overlay precisely.

**Working now**: glasses. **Planned**: earrings (ear-position tracking) and
necklaces (neck/shoulder-position tracking) — the data model and admin UI
already have placeholders, but the actual positioning logic for either
doesn't exist yet.

---

## 11. Security notes

- Passwords are hashed with **bcrypt** before being stored; the plaintext
  password is never saved.
- Auth uses **JWTs** (7-day expiry); `protect` middleware verifies the
  signature on every request to a protected route and loads the user.
- Every mutation on products/categories/users, and admin-only order
  listing, is gated by `adminOnly` middleware (or an equivalent check
  inside the controller for orders) — checked directly against
  `req.user.isAdmin`, never trusted from the client.
- The forgot-password flow returns an identical response whether or not
  the email exists, so it can't be used to enumerate registered accounts;
  reset tokens are hashed (SHA-256) before being stored and expire after
  15 minutes.
- CORS only allows origins listed in `CORS_ORIGIN` (comma-separated).
- **Known trade-offs, worth knowing about**: the JWT is stored in
  `localStorage`/`sessionStorage` rather than an httpOnly cookie (simpler,
  but readable by any script that runs on the page — a bigger concern if
  you ever add third-party scripts); there's no rate limiting yet on
  `/api/auth/login` or `/forgot-password`. Always set a real, random
  `JWT_SECRET` — never rely on a placeholder value.

---

## 12. Testing

There's no automated test suite yet for either half of the project:

- **Backend**: `Backend/test/test-apis.ps1` is a manual PowerShell script
  that exercises the public and protected endpoints end-to-end against a
  running server. Run it with the backend already up on port 5000:
  ```powershell
  cd Backend/test
  powershell -ExecutionPolicy Bypass -File test-apis.ps1
  ```
  It requires PowerShell (Windows, or PowerShell Core cross-platform).
- **Frontend**: no test setup exists yet.

Adding a small automated suite (e.g. Jest/Supertest for the API, Vitest for
components) would be a good next step if you're extending this project.

---

## 13. Troubleshooting

- **"MongoDB connection error" in the backend logs** — check `MONGO_URI` is
  correct (username/password URL-encoded if they contain special
  characters), and that your current IP is allow-listed in Atlas under
  Network Access.
- **CORS errors in the browser console** — the frontend's origin must be
  listed in the backend's `CORS_ORIGIN` env var.
- **Camera won't start for try-on** — browsers require HTTPS (or
  `localhost`) for camera access; check the browser didn't block the
  permission prompt; make sure no other app/tab is already using the
  camera.
- **Try-on button is disabled** — the product needs a `tryOn.overlayUrl`
  set from the admin product form first.
- **Admin pages redirect to login** — your account needs `isAdmin: true`
  in the database; see [Getting an admin account](#getting-an-admin-account).
- **`npm run build` fails on Linux/CI with a "could not resolve" error for
  a `components/...` import** — a few files import from
  `../../components/...` (lowercase) when the real folder is `Components`
  (capital C). This only breaks on case-sensitive filesystems; harmless on
  Windows/Mac dev machines, but needs fixing before a Linux-based
  production build.
- **`npm install` fails** — make sure you're on Node.js 18 or newer
  (`node -v`).

---

## 14. Deploying

This repo is set up for local development. For a real deployment:

1. **Backend**: deploy `Backend/` to any Node host (Render, Railway,
   Fly.io, a VPS, etc.) and set `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`
   (your deployed frontend's URL), `FRONTEND_URL`, and the `CLOUDINARY_*`
   variables as environment variables there — never commit real values.
2. **Frontend**: set `VITE_API_URL` to your deployed backend's URL at
   build time, then `npm run build` inside `Frontend/` and deploy the
   generated `dist/` folder to any static host (Vercel, Netlify, GitHub
   Pages, etc.).
3. Fix the case-sensitivity import bug mentioned in Troubleshooting first
   if deploying to a Linux-based build pipeline (most CI/CD is).
