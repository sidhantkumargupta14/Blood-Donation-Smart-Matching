# Blood Donation Network with Smart Matching

React + Vite frontend and Node.js + Express + MongoDB backend for discovering compatible blood donors and creating blood requests.

## Features
- User registration and login with JWT
- Password hashing with bcryptjs
- Donor search by blood-group compatibility and city
- Blood request creation and dashboard
- Smart donor ranking using compatibility, location and urgency
- Health endpoint for deployment checks

## Run locally (Windows / VS Code)

### Backend
```powershell
cd backend
npm install
Copy-Item .env.example .env
```
Edit `backend/.env` with your MongoDB URI and a long random JWT secret, then run:
```powershell
npm start
``
API: http://localhost:5000

### Frontend (new terminal)
```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```
Frontend: http://localhost:5173

## Production deployment

This repository is configured for Vercel (frontend), Render (backend) and MongoDB Atlas (database).

### MongoDB Atlas
1. Create an Atlas project, a free cluster (if available), and a database user.
2. Allow network access from Render. For a student demo, Atlas may use `0.0.0.0/0`; use a strong unique DB password and restrict this later.
3. Copy the connection string and set the database name to `blood_donation`. Keep this URI private; never commit it.

### Render backend
- Connect this GitHub repository.
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Set `NODE_ENV=production`, `MONGO_URI` to the private Atlas URI, `JWT_SECRET` to a long random secret, and `CORS_ORIGINS` to your Vercel production URL.
- Health check: `/health`. It should return HTTP 200 with `database: connected`.

### Vercel frontend
- Import this repository and keep project root at repository root.
- Build/output settings are in `vercel.json`.
- Set `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api`.
- Deploy, then add the exact Vercel URL to Render's `CORS_ORIGINS` and redeploy the backend.

## Important
- Never publish `.env`, database passwords, JWT secrets, or real donor personal details.
- Use fictional sample donor details in public demos.
- Distance is simulated by the donor `distanceKm` field; it is not GPS navigation.
- This is an academic demo, not a verified medical emergency service. Verify donors and hospitals independently.
- Free hosting services may sleep when idle and provider limits can change.

## API endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/donors?bloodGroup=A%2B&city=Kharar`
- `POST /api/donors` (authenticated)
- `PUT /api/donors/:id/availability` (authenticated)
- `GET /api/requests` (authenticated)
- `POST /api/requests` (authenticated)
- `GET /api/requests/:id/matches` (authenticated)
- `PATCH /api/requests/:id/status` (authenticated)
