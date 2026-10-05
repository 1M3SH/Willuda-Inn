# Willuda Inn - Production Deployment Guide

```
                    WILLUDA INN
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ↓              ↓              ↓
       Vercel         Vercel         Railway
    User Frontend  Admin Frontend  Backend API
          │              │              │
          └──────────────┴──────┬───────┘
                                │
                                ↓
                            Supabase
                           PostgreSQL
```

---

## Architecture Breakdown

| Component | Platform | Source Folder | Configuration File |
| :--- | :--- | :--- | :--- |
| **User Frontend** | [Vercel](https://vercel.com) | `frontend/user` | `frontend/user/vercel.json` |
| **Admin Frontend** | [Vercel](https://vercel.com) | `frontend/admin` | `frontend/admin/vercel.json` |
| **Backend API** | [Railway](https://railway.app) | `backend` | `backend/railway.json`, `backend/Procfile` |
| **Database** | [Supabase](https://supabase.com) | `database/postgresql` | `database/postgresql/init_supabase.sql` |

---

## Step 1: Database Setup on Supabase

1. Create a free account or log in at **[supabase.com](https://supabase.com)**.
2. Click **New Project**:
   - **Name:** `willuda-inn`
   - **Database Password:** Choose a secure password (save this securely).
   - **Region:** Choose the region closest to your users (e.g., `Singapore` or `Frankfurt`).
3. Once the database is ready, go to **SQL Editor** in the left sidebar.
4. Click **New query**, open [database/postgresql/init_supabase.sql](database/postgresql/init_supabase.sql), copy its entire content, paste it into the editor, and click **Run**.
   - This creates all tables (`admins`, `customers`, `facilities`, `bookings`, `events`, `payments`).
   - Seeds default accounts with bcrypt-hashed passwords.
   - Sets up performance indexes.
5. Get your PostgreSQL Connection String:
   - Navigate to **Project Settings** -> **Database**.
   - Scroll to **Connection string** -> Select **URI**.
   - Select **Mode: Transaction** (Port `6543`) or **Direct** (Port `5432`).
   - Copy the URI:
     ```
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
     ```
   - Replace `[YOUR-PASSWORD]` with your actual database password.

---

## Step 2: Backend API Deployment on Railway

1. Log in to **[railway.app](https://railway.app)**.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository: `Willuda-Inn`.
4. In Railway project settings:
   - Set **Root Directory** to `/backend`.
5. Navigate to the **Variables** tab and add:
   ```env
   PORT=5000
   DB_CLIENT=postgres
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
   JWT_SECRET=willuda_inn_production_secure_jwt_key_2026
   PG_SSL=true
   ```
6. Navigate to the **Settings** tab -> **Networking** -> Click **Generate Domain**.
   - You will get a public URL (e.g. `https://willuda-inn-backend.up.railway.app`).
   - Verify health check in your browser: `https://willuda-inn-backend.up.railway.app/api/health`.

---

## Step 3: User Frontend Deployment on Vercel

1. Log in to **[vercel.com](https://vercel.com)**.
2. Click **Add New...** -> **Project**.
3. Import your `Willuda-Inn` GitHub repository.
4. Configure Project:
   - **Project Name:** `willuda-inn-user`
   - **Framework Preset:** `Other`
   - **Root Directory:** Click `Edit` and select `frontend/user`.
   - **Build & Output Settings:** Leave default (no build step needed for static HTML/CSS/JS).
5. Click **Deploy**.
6. (Optional) Set custom API domain:
   - If your Railway URL is different from default, you can set an environment variable or simply store it via the browser:
     ```javascript
     localStorage.setItem("willudaApiUrl", "https://your-railway-app.up.railway.app");
     ```

---

## Step 4: Admin Frontend Deployment on Vercel

1. In Vercel, click **Add New...** -> **Project**.
2. Select the same `Willuda-Inn` GitHub repository.
3. Configure Project:
   - **Project Name:** `willuda-inn-admin`
   - **Framework Preset:** `Other`
   - **Root Directory:** Click `Edit` and select `frontend/admin`.
   - **Build & Output Settings:** Leave default.
4. Click **Deploy**.
5. Once deployed, open your admin dashboard URL (e.g. `https://willuda-inn-admin.vercel.app/admin-login.html`).

---

## Default Login Credentials

| Portal | Email | Default Password | Role |
| :--- | :--- | :--- | :--- |
| **Admin Portal** | `admin@willudainn.com` | `Willuda@123` | Administrator |
| **Customer Portal** | `tharukaprabathiya833@gmail.com` | `Willuda@123` | Customer |
