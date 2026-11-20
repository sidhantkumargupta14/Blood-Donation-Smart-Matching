# BloodConnect AI Integration

Feature branch adds an authenticated AI Hub to the existing BloodConnect donor/request CRUD application.

## Features
- AI natural-language donor search (AI extraction with regex fallback)
- AI donor recommendations/explanations for your own requests
- AI assistant for application guidance
- Aggregated donor/request analytics
- Existing MongoDB donor and request data; no seed/demo donor records required

## Backend setup
From the repository root:
```bash
cd backend
npm install
```
Set environment variables in backend/.env (never commit secrets):
- MONGO_URI: MongoDB connection string for the donor database
- JWT_SECRET: secret used by existing authentication
- OPENAI_API_KEY: optional key; without it deterministic fallbacks are used
- OPENAI_MODEL: optional (defaults to gpt-4o-mini)
- CORS_ORIGINS: comma-separated frontend origin(s)

Run `npm start`. API routes are under /api; AI endpoints under /api/ai.

## Frontend
```bash
cd frontend
npm install
```
Set VITE_API_URL to the backend API base URL, e.g. https://your-api.onrender.com/api, then `npm run build`.

## Deployment
For Render, repository root is the repo root; build command `cd backend && npm install`, start command `cd backend && npm start`. Configure MONGO_URI, JWT_SECRET, OPENAI_API_KEY, OPENAI_MODEL, CORS_ORIGINS in Render environment settings.
For Vercel, configure frontend root directory `frontend`, Vite framework/build settings, and VITE_API_URL.

## Privacy & limitations
AI services do not receive donor names or phone numbers during recommendation explanation prompts; search and response endpoints are authenticated. Search results/contact details are still returned to authenticated users. Ensure authorization, consent, and appropriate donor data visibility policies before public launch. Recommendation ranks are heuristics, not clinical eligibility/compatibility decisions; verify with healthcare professionals.
