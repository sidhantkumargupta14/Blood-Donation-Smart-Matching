# Blood Donation Network with Smart Matching

A beginner-friendly FSD-II capstone project based on the supplied project idea.

## Features

- User registration and login using JWT
- Donor registration
- Blood-group compatibility matching
- Donor availability
- City/distance based ranking
- Emergency/high urgency priority
- Blood request creation
- Smart donor match scores
- Request dashboard
- React frontend
- Node.js + Express backend
- MongoDB database

## Project structure

```text
Blood_Donation_Smart_Matching/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Requirements

- Node.js 18+
- MongoDB Community Server OR MongoDB Atlas
- VS Code

## Run backend

Open terminal:

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

For Windows PowerShell, if `copy` is unavailable:

```powershell
Copy-Item .env.example .env
```

Edit `.env` if your MongoDB connection is different.

Optional sample donor data:

```bash
node seed.js
```

Backend:
http://localhost:5000

## Run frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:
http://localhost:5173

## Demo flow

1. Register a user.
2. Open Find Donors and search a blood group.
3. Create a Blood Request.
4. The system finds compatible available donors.
5. Matching score uses:
   - exact blood-group match
   - compatibility
   - same city / distance
   - urgency
6. View requests in Dashboard.

## Important academic note

Distance is simulated using the donor's `distanceKm` field. No real GPS or map API is required for this version.

The notification requirement from the project idea is represented as a backend-ready matching workflow; real SMS/email notifications can be added later using a notification provider.

## API endpoints

### Authentication
POST `/api/auth/register`
POST `/api/auth/login`

### Donors
GET `/api/donors?bloodGroup=A%2B&city=Kharar`
POST `/api/donors`
PUT `/api/donors/:id/availability`

### Requests
GET `/api/requests`
POST `/api/requests`
GET `/api/requests/:id/matches`
PATCH `/api/requests/:id/status`

## Suggested future extensions

- Email/SMS notifications
- Admin panel
- Priority queue for emergencies
- Redis caching
- WebSockets for live donor availability
- Hospital verification
- Donation history
- Password hashing with bcrypt
- Production deployment
