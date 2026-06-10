# ✦ Lumière — Salon Appointment Booking App

A full-stack salon appointment booking application built with React + Vite (frontend) and Node.js + Express + MongoDB (backend).

---

## 📁 Project Structure

```
salon-app/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── serviceController.js
│   │   └── appointmentController.js
│   ├── middleware/
│   │   └── auth.js                # JWT protect + adminOnly
│   ├── models/
│   │   ├── User.js
│   │   ├── Service.js
│   │   └── Appointment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── serviceRoutes.js
│   │   └── appointmentRoutes.js
│   ├── .env.example
│   ├── package.json
│   ├── seed.js                    # Seed sample data + admin user
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ServiceCard.jsx
    │   │   ├── AppointmentCard.jsx
    │   │   ├── Alert.jsx
    │   │   └── LoadingSpinner.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Services.jsx
    │   │   ├── BookAppointment.jsx
    │   │   ├── UserDashboard.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   └── NotFound.jsx
    │   ├── services/
    │   │   └── api.js             # Axios instance + all API calls
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    └── vercel.json
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js ≥ 18
- npm or yarn
- MongoDB Atlas account (free tier works)

---

### 1. Clone / unzip the project

```bash
cd salon-app
```

---

### 2. Backend setup

```bash
cd backend
npm install
```

Create your `.env` file (copy from example):

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/salon-app
JWT_SECRET=change_this_to_a_long_random_string
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Seed the database** (creates 11 services + admin user):

```bash
node seed.js
```

> Admin credentials: `admin@salon.com` / `admin123456`

**Start the backend dev server:**

```bash
npm run dev     # uses nodemon (auto-restart)
# or
npm start       # plain node
```

Backend runs at `http://localhost:5000`

---

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create `.env`:

```bash
cp .env.example .env
```

The default `.env` for local dev:

```env
VITE_API_URL=http://localhost:5000/api
```

> In development Vite also proxies `/api` → `http://localhost:5000` via `vite.config.js`, so you can leave `VITE_API_URL` blank locally and it will still work.

**Start the frontend dev server:**

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 🔑 Default Accounts

| Role  | Email              | Password     |
|-------|--------------------|--------------|
| Admin | admin@salon.com    | admin123456  |
| User  | Register any new account |       |

---

## 📡 API Reference

### Auth
| Method | Endpoint            | Access  | Description        |
|--------|---------------------|---------|--------------------|
| POST   | /api/auth/register  | Public  | Register user      |
| POST   | /api/auth/login     | Public  | Login + get token  |
| GET    | /api/auth/me        | Private | Get current user   |

### Services
| Method | Endpoint              | Access  | Description             |
|--------|-----------------------|---------|-------------------------|
| GET    | /api/services         | Public  | All available services  |
| GET    | /api/services/all     | Admin   | All services (incl. hidden) |
| GET    | /api/services/:id     | Public  | Single service          |
| POST   | /api/services         | Admin   | Create service          |
| PUT    | /api/services/:id     | Admin   | Update service          |
| DELETE | /api/services/:id     | Admin   | Delete service          |

### Appointments
| Method | Endpoint                          | Access  | Description                |
|--------|-----------------------------------|---------|----------------------------|
| GET    | /api/appointments/slots           | Private | Available slots (query: serviceId, date) |
| POST   | /api/appointments                 | Private | Book appointment           |
| GET    | /api/appointments/my              | Private | User's own appointments    |
| PUT    | /api/appointments/:id/cancel      | Private | Cancel own appointment     |
| GET    | /api/appointments/admin/all       | Admin   | All appointments (filterable) |
| PUT    | /api/appointments/admin/:id/status| Admin   | Update appointment status  |

---

## ☁️ Deployment

### MongoDB Atlas
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Add a database user (username + password)
4. Whitelist `0.0.0.0/0` in Network Access (or your server's IP)
5. Get your connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/salon-app
   ```

---

### Backend → Render

1. Push your `backend/` folder to a GitHub repo (or the full monorepo)
2. Go to [https://render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Root directory**: `backend`
   - **Build command**: `npm install`
   - **Start command**: `npm start`
5. Add Environment Variables in Render dashboard:
   ```
   MONGODB_URI=<your Atlas URI>
   JWT_SECRET=<your secret>
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```
6. Deploy — Render gives you a URL like `https://salon-api.onrender.com`
7. After first deploy, run the seed script once:
   ```bash
   # In Render → your service → Shell tab
   node seed.js
   ```

---

### Frontend → Vercel

1. Push your `frontend/` folder to GitHub
2. Go to [https://vercel.com](https://vercel.com) → **New Project**
3. Import the repo
4. Configure:
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
5. Add Environment Variable:
   ```
   VITE_API_URL=https://salon-api.onrender.com/api
   ```
6. Deploy — Vercel gives you `https://salon-app.vercel.app`
7. Go back to **Render** and update `FRONTEND_URL` to your Vercel URL, then redeploy the backend.

> The `vercel.json` in the frontend handles SPA routing (all paths → `index.html`).

---

## 🛠 Tech Stack

| Layer     | Tech                              |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, React Router v6, Axios |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB + Mongoose                |
| Auth      | JWT + bcryptjs                    |
| Hosting   | Vercel (frontend), Render (backend), MongoDB Atlas (DB) |

---

## ✦ Features

- **User authentication** — register, login, JWT sessions persisted in localStorage
- **Service catalogue** — filterable by category with pricing + durations
- **3-step booking flow** — service → date/time → confirm with real-time slot availability
- **User dashboard** — view, filter, and cancel appointments
- **Admin dashboard** — manage all appointments (status updates), full service CRUD
- **Responsive design** — mobile-first, works on all screen sizes
- **Production-ready** — proper CORS, error handling, env variable separation
