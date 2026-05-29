# InstaBrain MVP — Production Deployment Guide

This document describes the steps required to deploy the InstaBrain MVP to production under the domain `instabrain.co.in`.

---

## 1. Domain & DNS Configuration

The production domain is `instabrain.co.in`. Set up the following DNS records in your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

| Type  | Host | Value / Target | Purpose |
|-------|------|----------------|---------|
| **A** | `@`  | `76.76.21.21` (Vercel IP) | Points main domain to Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com` | Points www subdomain to Vercel |
| **CNAME** | `api` | `instabrain-backend.up.railway.app` (or Render equivalent) | Points API subdomain to Backend Host |

*Ensure TTL is set to Auto or 3600 seconds.*

---

## 2. Neon PostgreSQL Database Setup

1. Sign up/log in to [Neon Console](https://neon.tech).
2. Create a new project named `instabrain-db`.
3. Select **PostgreSQL 16** (or latest stable) and choose your preferred region.
4. Copy the connection string from the dashboard. Ensure it looks like:
   `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`
5. Save this connection string as `DATABASE_URL` in your backend environment configuration.

---

## 3. Railway Redis Setup

1. Sign up/log in to [Railway](https://railway.app).
2. Click **New Project** -> **Provision Redis**.
3. Railway will provision a Redis instance.
4. From the Redis service dashboard, copy the **Redis Connection URL** (e.g. `redis://default:[password]@[host]:[port]`).
5. Save this as `REDIS_URL` in your backend environment configuration, and ensure `REDIS_ENABLED` is set to `true` (if background workers are active).

---

## 4. Google OAuth 2.0 Credentials Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com).
2. Select or create a project.
3. Navigate to **APIs & Services** -> **OAuth consent screen**:
   - Set User Type to **External**.
   - App Name: `InstaBrain`.
   - Support email & Developer contact info.
4. Navigate to **APIs & Services** -> **Credentials**:
   - Click **Create Credentials** -> **OAuth client ID**.
   - Application type: **Web application**.
   - **Authorized JavaScript origins**:
     - `https://instabrain.co.in`
     - `http://localhost:5173` (for local development)
   - **Authorized redirect URIs**:
     - `https://api.instabrain.co.in/api/auth/google/callback`
5. Copy the **Client ID** and **Client Secret**.
6. Set `VITE_GOOGLE_CLIENT_ID` in your frontend env, and `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in your backend env.

---

## 5. Meta Developer Portal Setup

1. Log in to the [Meta Developer Portal](https://developers.facebook.com).
2. Create a new App of type **Business**.
3. Under App Dashboard, add the **Facebook Login** and **Instagram Graph API** products.
4. Configure OAuth settings under Facebook Login:
   - **Client OAuth Settings**:
     - Valid OAuth Redirect URIs: `https://api.instabrain.co.in/api/social/instagram/callback`
5. Copy the **App ID** and **App Secret**.
6. Save these as `META_CLIENT_ID` and `META_CLIENT_SECRET` in your backend environment variables.

---

## 6. Backend Hosting Setup (Railway)

1. Create a new service on Railway connected to your backend repository `second-brain-backend`.
2. In the **Variables** tab, add the following production values:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://... (from Neon)
JWT_SECRET=... (random 64-char string)
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=... (random 64-char string)
REFRESH_TOKEN_EXPIRES_IN=7d
FRONTEND_URL=https://instabrain.co.in
GOOGLE_CLIENT_ID=... (from Google Console)
GOOGLE_CLIENT_SECRET=... (from Google Console)
REDIS_ENABLED=true
REDIS_URL=redis://... (from Railway Redis)
OPENAI_API_KEY=... (your OpenAI key)
COOKIE_DOMAIN=.instabrain.co.in
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
```

3. Ensure Railway builds using `npm run build` and starts using `npm start`.
4. Under **Settings** -> **Domains**, click **Custom Domain** and bind `api.instabrain.co.in`. Railway will provision SSL certificate automatically.

---

## 7. Frontend Hosting Setup (Vercel)

1. Create a new project in Vercel connected to your frontend repository `second-brain`.
2. In the **Environment Variables** section, add the following values:

```env
VITE_API_URL=https://api.instabrain.co.in
VITE_GOOGLE_CLIENT_ID=... (from Google Console)
```

3. Configure Build Settings:
   - Framework Preset: **Vite** (Vercel auto-detects this).
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy the project.
5. Under **Settings** -> **Domains**:
   - Add `instabrain.co.in` (and check redirect `www.instabrain.co.in` to `instabrain.co.in`). Vercel will verify the DNS record and issue Let's Encrypt SSL certificates automatically.

---

## 8. Database Migrations Deployment

Before users access the app, you must apply the database migrations in Neon PostgreSQL:
1. In your backend repository folder, run the migration deployment command locally targeting the production database:
   `npx prisma migrate deploy`
2. Validate that the schema tables exist and there are no migration version conflicts.

---

## 9. Post-Deployment Verification

1. Query `https://api.instabrain.co.in/health` and verify the output returns status code `200` with the following payload structure:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-05-29T10:00:00.000Z",
     "services": {
       "database": "connected",
       "redis": "connected",
       "queues": {
         "analyzeReelQueue": "active",
         "rewriteDumpQueue": "active",
         "generateHooksQueue": "active",
         "generatePitchQueue": "active",
         "scanBrandQueue": "active",
         "generateCaptionsQueue": "active"
       }
     }
   }
   ```
2. Open `https://instabrain.co.in` in a web browser. Verify:
   - Registration and login flows succeed.
   - Google Sign-In button redirects and returns credentials correctly.
   - Refresh token is successfully stored in cookies under domain `.instabrain.co.in` and access tokens refresh successfully.

---

## 10. Rollback Procedures

If critical errors occur in production:
1. **Frontend Rollback**:
   - In the Vercel dashboard, click **Deployments**, locate the last stable deployment, click the three dots, and select **Promote to Production**. This instantly rolls back the routing.
2. **Backend Rollback**:
   - In the Railway dashboard, select the backend service, go to **Deployments**, choose the previous stable deployment, and click **Rollback**.
3. **Database Schema Rollback**:
   - If a migration caused failures, restore the last automatic backup in Neon Console (Point-in-Time recovery).
