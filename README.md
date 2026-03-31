# Merkova Backend

Production-style Node.js + Express backend for a multi-role ecommerce platform (users, sellers, admin/super admin), built for both real-world use and deep learning.

This README is intentionally detailed so learners can understand not only "what to run", but "why this backend is structured this way".

## Table of Contents

1. Project Overview
2. Tech Stack
3. Core Capabilities
4. Project Structure
5. Quick Start
6. Environment Variables
7. Run and Health Checks
8. API Route Map
9. Authentication and Security Flow
10. File Upload and Media Flow
11. Reliability Review (`api/index.js`)
12. Learning Path for Beginners
13. Troubleshooting
14. License

## Project Overview

Merkova backend powers:

- multi-step user signup/signin with OTP verification
- seller onboarding and shop management
- item/catalog management with media uploads
- campaign and homepage banner management
- category tree management (category/subcategory/brand/material)
- navbar management
- chat endpoints
- profile management and avatar uploads

The backend is organized as:

- `api/index.js`: server bootstrap, middleware pipeline, route mounting
- `Db.js`: MongoDB connection bootstrap
- `src/router/*`: route declarations
- `src/controller/*`: request handling business logic
- `src/models/*`: Mongoose schema models
- `src/middlewares/*`: auth and upload middleware
- `src/utils/*`: helper modules (JWT, mail, cloud upload)

## Tech Stack

- Node.js (CommonJS)
- Express `5.x`
- MongoDB + Mongoose
- JWT (cookie-based auth)
- Multer (multipart uploads)
- Cloudinary (media upload helper)
- Nodemailer (OTP and transactional email)
- CORS + cookie-parser + dotenv

## Core Capabilities

- Cookie-based authentication (`token` cookie)
- OTP-driven signup/signin and password reset flows
- Seller workflows and shop ownership APIs
- Item-level media-rich CRUD
- Admin-facing category and campaign management
- Chat data APIs
- Upload handling for avatar/banner/shop/request documents

## Project Structure

```text
backend/
|-- api/
|   `-- index.js                    # App bootstrap, middleware, routes, health, shutdown
|-- src/
|   |-- controller/                 # Business logic handlers
|   |-- middlewares/
|   |   |-- IsAuth.js               # Cookie JWT verification
|   |   `-- Multer.js               # Disk upload strategy
|   |-- models/                     # MongoDB schemas
|   |-- router/                     # HTTP route definitions
|   `-- utils/
|       |-- token.js                # JWT generator
|       |-- Mail.js                 # OTP email sending
|       `-- Cloudinary.js           # Cloudinary uploader helper
|-- public/                         # Static assets/media
|-- Db.js                           # MongoDB connector
|-- .env.example                    # Safe env template
|-- LICENSE                         # MIT license
`-- README.md
```

## Quick Start

### 1) Install dependencies

```bash
cd backend
npm install
```

### 2) Create env file

PowerShell:

```powershell
Copy-Item .env.example .env
```

Bash:

```bash
cp .env.example .env
```

Then update `.env` values.

### 3) Run in development

```bash
npm run dev
```

### 4) Run in production mode

```bash
npm start
```

## Environment Variables

Use `.env.example` as baseline.

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | Yes | Server port (default fallback in code is `5000`) |
| `MONGO_URL` | Yes | MongoDB connection URI |
| `SECRETKEY` | Yes | JWT signing secret (used in token generation and auth middleware) |
| `NODE_ENV` | Yes | `development` or `production` (affects cookie security settings) |
| `CORS_ORIGINS` | Recommended | Comma-separated frontend origins allowed by CORS |
| `Merkova_GMAIL` | Yes (email features) | Sender gmail for OTP mails |
| `APP_PASS` | Yes (email features) | Gmail app password |
| `CLOUD_NAME` | Yes (cloud upload features) | Cloudinary cloud name |
| `CLOUD_API` | Yes (cloud upload features) | Cloudinary API key |
| `CLOUD_SECRET` | Yes (cloud upload features) | Cloudinary API secret |
| `SUPER_ADMIN` | Yes (super admin flow) | Super admin email |
| `SUPER_ADMIN_PASS` | Yes (super admin flow) | Super admin password gate |
| `SUPER_ADMIN_SECRETCODE` | Yes (super admin flow) | Extra secret layer for super admin login |
| `SUPER_ADMIN_NAME` | Recommended | Display name used in super admin response |

## Run and Health Checks

Once running:

- `GET /` returns server basic status
- `GET /health` returns uptime and timestamp
- `GET /ready` returns readiness based on MongoDB connection state

Local examples:

- `http://localhost:5000/`
- `http://localhost:5000/health`
- `http://localhost:5000/ready`

## API Route Map

All paths below are relative to base URL (for example `http://localhost:5000`).

### Auth and User (`/user`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/user/signup` | No | Multi-step signup (`send-otp`, `verify-otp`, `complete-profile`) |
| POST | `/user/signin` | No | Signin flow (password + OTP, also super admin path) |
| POST | `/user/signout` | No | Clear auth cookie |
| POST | `/user/forgetpass` | No | Send reset OTP |
| POST | `/user/resetpass` | No | Reset password with OTP |
| GET | `/user/getcurrent` | Yes | Get current logged-in user via cookie token |
| POST | `/user/sellersignup` | No | Seller signup |
| POST | `/user/sellersendotp` | No | Send seller verification OTP |
| POST | `/user/sellerverifyotp` | No | Verify seller OTP |
| POST | `/user/googlesignup` | No | Google-style signup path |
| POST | `/user/googlelogin` | No | Google-style login path |

### Profile (`/api/profile`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/profile/` | Yes | Read profile |
| PUT | `/api/profile/update` | Yes | Update profile |
| POST | `/api/profile/avatar` | Yes | Upload/update avatar (`multipart/form-data`) |

### Shop (`/shop`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/shop/create` | Not enforced in route now | Create shop with multiple files |
| POST | `/shop/verify-shopcode` | Yes | Verify seller shop code |
| GET | `/shop/getcurrentshop` | Yes | Get current seller shop |
| PUT | `/shop/editshop` | Yes | Edit shop and media |
| POST | `/shop/follow` | Yes | Follow a shop |
| POST | `/shop/unfollow` | Yes | Unfollow a shop |

### Item (`/item`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/item/create` | Yes | Create item with dynamic uploads |
| PATCH | `/item/edit/:itemid` | Yes | Edit item + upload updates |
| POST | `/item/myshop` | Yes | Seller items for current shop |
| DELETE | `/item/variant/:itemid/:colorname` | Yes | Delete one color variant |
| DELETE | `/item/delete/:itemid` | Yes | Delete full item |
| GET | `/item/related/:itemid` | No | Related items |
| GET | `/item/headoffice/all` | Yes | Admin overview of all items |
| GET | `/item/headoffice/category` | Yes | Items by category |
| GET | `/item/headoffice/justforyou` | Yes | Curated items |
| GET | `/item/itemdetails/:itemid` | No | Public item details |
| GET | `/item/getshopbyid/:shopid` | No | Public shop by id |

### Home Banners (`/homebanner`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/homebanner/create` | No | Create banner with up to 14 images |
| GET | `/homebanner/` | No | List banners |
| PUT | `/homebanner/:bannerid` | No | Update banner content |
| PUT | `/homebanner/add-images/:bannerid` | No | Append images |
| PUT | `/homebanner/image/:bannerid/:imageid` | No | Replace single image |
| DELETE | `/homebanner/image/:bannerid/:imageid` | No | Delete single image |
| PUT | `/homebanner/reorder/:bannerid` | No | Reorder images |
| DELETE | `/homebanner/:bannerid` | No | Delete banner |

### Seller Home Banners (`/sellerhomebanner`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/sellerhomebanner/create` | No | Create seller banner |
| GET | `/sellerhomebanner/` | No | List seller banners |
| PUT | `/sellerhomebanner/:bannerid` | No | Update seller banner |
| PUT | `/sellerhomebanner/reorder/:bannerid` | No | Reorder seller banner images |
| DELETE | `/sellerhomebanner/:bannerid` | No | Delete seller banner |

### Navbar (`/nav`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/nav/admin/upload-image` | Yes | Upload navbar asset |
| POST | `/nav/admin/save` | Yes | Save navbar config |
| GET | `/nav/public` | No | Read public navbar |

### Campaign (`/campaign`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/campaign/admin/campaign` | No | Create campaign with banner |
| POST | `/campaign/admin/campaign/:id/section` | No | Add campaign section image |
| DELETE | `/campaign/admin/campaign/:id` | No | Delete campaign |
| GET | `/campaign/active` | No | Get active campaigns |

### Category (`/category`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/category/create` | No | Create category |
| POST | `/category/add-subcategory/:categoryid` | No | Add subcategory |
| POST | `/category/add-brand/:categoryid` | No | Add brand |
| POST | `/category/add-material/:categoryid` | No | Add material |
| PUT | `/category/edit/:categoryid` | No | Edit category |
| PATCH | `/category/toggle/:categoryid` | No | Toggle category status |
| DELETE | `/category/delete/:categoryid/:type/:subid` | No | Delete sub-document |
| GET | `/category/admin/all` | No | Full category tree |
| GET | `/category/active` | No | Active categories only |

### Shop Request (`/shoprequest`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/shoprequest/create` | No | Seller/shop application with docs upload |
| GET | `/shoprequest/all` | No | List all requests |
| PATCH | `/shoprequest/update-status/:requestId` | No | Approve/reject request |
| DELETE | `/shoprequest/delete/:requestId` | No | Delete request |

### Chat (`/chat`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/chat/access` | No | Open/access chat |
| GET | `/chat/:userId` | No | Get chats by user |
| GET | `/chat/messages/:chatId` | No | Get chat messages |
| POST | `/chat/message` | No | Send message |

## Authentication and Security Flow

### How auth currently works

1. User signs in via `/user/signin`.
2. Server creates JWT using `SECRETKEY`.
3. Server stores JWT in `token` cookie.
4. Protected routes use `src/middlewares/IsAuth.js`.
5. Middleware reads `req.cookies.token`, verifies it, and attaches `req.user`.

### Cookie behavior

- `httpOnly` is enabled
- `secure` and `sameSite` vary by `NODE_ENV` in several controller flows

### Important security note

Some admin-like routes currently do not enforce auth middleware in their router files. For production hardening, apply auth and role-based authorization consistently across all sensitive routes.

## File Upload and Media Flow

- Upload middleware: `src/middlewares/Multer.js`
- Current storage: local disk (`multer.diskStorage`)
- Cloud helper exists: `src/utils/Cloudinary.js`

Current learning insight:

- You can run local uploads now.
- For production scale, moving all uploads to Cloudinary/S3 with signed URLs and cleanup jobs is safer and easier to scale.

## Reliability Review (`api/index.js`)

Server bootstrap has been reviewed and improved for reliability.

### What was improved

- DB connection now happens before server starts accepting traffic.
- `PORT` has a safe fallback (`5000`) if missing.
- CORS origins are configurable via `CORS_ORIGINS`.
- Added `GET /health` and `GET /ready`.
- Added global 404 handler.
- Added centralized error middleware.
- Added graceful shutdown for `SIGINT` and `SIGTERM`.
- Added process-level handlers for unhandled rejections/exceptions.
- Disabled `x-powered-by` header and added body size limits.

### Why this matters in real projects

- Prevents "server alive but DB dead" failures.
- Improves deploy readiness (health/readiness probes).
- Avoids abrupt shutdown data loss and connection leaks.
- Gives safer behavior under unexpected runtime errors.

## Learning Path for Beginners

If you are learning backend with this codebase, follow this order:

1. Read `api/index.js` to understand middleware order and route mounting.
2. Read `src/router/Userroute.js` and map each endpoint to controller methods.
3. Read `src/controller/AuthController.js` for OTP/auth flow.
4. Read `src/middlewares/IsAuth.js` and `src/utils/token.js` for JWT lifecycle.
5. Read one feature end-to-end:
   `router -> controller -> model`.
6. Trace one multipart upload route (for example `/item/create`) to understand Multer usage.
7. Add one small feature (for example a new health metadata endpoint) and test with Postman.
8. Add one validation layer (Joi/Zod) to learn production API hygiene.

## Troubleshooting

### App starts but DB not connected

- check `MONGO_URL` in `.env`
- ensure MongoDB network access allows your IP
- verify connection string username/password

### 401 Unauthorized on protected routes

- confirm signin created `token` cookie
- include credentials from frontend (`withCredentials: true`)
- verify `SECRETKEY` is set and consistent

### CORS blocked in browser

- set `CORS_ORIGINS` with your exact frontend URLs (comma-separated)
- include protocol and port (`http://localhost:5173`)

### OTP email not sending

- verify `Merkova_GMAIL` and `APP_PASS`
- use Gmail App Password, not your Gmail login password

## License

This backend is licensed under the MIT License.

See [LICENSE](./LICENSE) for full text.
