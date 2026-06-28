# Spotlight Salon Appointment App

Spotlight Salon is a full-stack appointment booking app for a salon. Customers can browse services, register or sign in, book appointments, and manage their own bookings. Admin users can manage services and appointment statuses.

The current project uses a static frontend and a consolidated Express backend:

- Frontend: `index.html`, `style.css`, and `script.js`
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, and bcryptjs
- Deployment: Vercel for the frontend, Render or any Node host for the backend

## Features

- User registration and login with JWT
- Protected customer dashboard
- Service catalog with categories, prices, durations, and images
- Booking flow with date and slot selection
- User appointment cancellation
- Admin appointment management
- Admin service CRUD with image URL support
- Static frontend build for Vercel
- Backend can also serve the static frontend at `/`

## Project Structure

```text
Salon Appointment App/
├── backend/
│   ├── models/
│   │   ├── Appointment.js
│   │   ├── Service.js
│   │   └── User.js
│   ├── .env.example
│   ├── package.json
│   ├── seed.js
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── script.js
│   ├── style.css
│   └── vercel.json
├── .gitignore
├── README.md
├── _config.yml
└── vercel.json
```

`backend/server.js` contains the database connection, Mongoose schemas, JWT helpers, auth middleware, and all API routes in one file.

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB Atlas or a local MongoDB connection string

## Environment Variables

Create `backend/.env`:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/salon-app
JWT_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
```

## Backend Setup

```bash
cd backend
npm install
npm run seed
npm run dev
```

The API runs at:

```text
http://localhost:5001/api
```

The backend also serves the frontend files at:

```text
http://localhost:5001
```

Default seeded admin:

```text
Email: admin@salon.com
Password: admin123456
```

## Frontend Setup

The frontend is plain HTML, CSS, and JavaScript. No React or Vite is required.

To build the static frontend for deployment:

```bash
cd frontend
npm run build
```

This copies the three static files into `frontend/dist`.

During local development, the frontend script calls:

- `http://localhost:5001/api` when opened from localhost
- the deployed Render API when hosted elsewhere

You can also override the API URL before `script.js` loads by setting `window.API_BASE`.

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create a user account |
| POST | `/api/auth/login` | Public | Login and receive a JWT |
| GET | `/api/auth/me` | User | Get the current user |

### Services

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/services` | Public | List available services |
| GET | `/api/services/all` | Admin | List all services |
| GET | `/api/services/:id` | Public | Get one service |
| POST | `/api/services` | Admin | Create a service |
| PUT | `/api/services/:id` | Admin | Update a service |
| DELETE | `/api/services/:id` | Admin | Delete a service |

### Appointments

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/appointments/slots?serviceId=&date=` | User | Get available slots |
| POST | `/api/appointments` | User | Book an appointment |
| GET | `/api/appointments/my` | User | List current user's appointments |
| PUT | `/api/appointments/:id/cancel` | User/Admin | Cancel an appointment |
| GET | `/api/appointments/admin/all` | Admin | List all appointments |
| PUT | `/api/appointments/admin/:id/status` | Admin | Update appointment status |

## Deployment

### Backend on Render

Use these settings:

```text
Root directory: backend
Build command: npm install
Start command: npm start
```

Add environment variables:

```env
MONGODB_URI=<your MongoDB connection string>
JWT_SECRET=<your JWT secret>
NODE_ENV=production
```

Run the seed script once after deployment if your database is empty:

```bash
npm run seed
```

### Frontend on Vercel

This repo includes `frontend/vercel.json` for a static frontend deployment.

Use these settings if Vercel asks:

```text
Root directory: frontend
Install command: npm install
Build command: npm run build
Output directory: dist
```

The frontend build does not bundle JavaScript. It copies:

- `index.html`
- `style.css`
- `script.js`

into `dist`.

## Service Images

Services support an `image` field in the database. If a service has no image URL, `frontend/script.js` chooses a fallback image based on the service name, description, or category. This keeps service cards from showing blank image blocks.

Admins can set or update image URLs from the service form in the admin dashboard.

## Useful Commands

```bash
# Backend
cd backend
npm install
npm run seed
npm run dev
npm start

# Frontend
cd frontend
npm run build

# Syntax checks
node --check backend/server.js
node --check frontend/script.js
```

## Notes

- Keep `JWT_SECRET` private.
- Do not commit `.env` files.
- `node_modules` and `frontend/dist` are ignored and should not be committed.
- The frontend is intentionally small and framework-free.
