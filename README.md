# Hotels + Taste Explorer

Independent Hotels and Taste web apps with separate FastAPI backends, separate PostgreSQL databases, a centralized Supabase login page, and API-driven right-side MFE widgets.

## Workspace Layout

- `hotels/react-app` - Hotels frontend on port `5174`
- `hotels/backend` - Hotels FastAPI backend on port `8001`
- `taste-explorer/react-app` - Taste frontend on port `5176`
- `taste-explorer/backend` - Taste FastAPI backend on port `8002`
- `login/react-app` - Centralized Supabase login on port `5173`

## Database

- Dockerized PostgreSQL with one DB per app
- Hotels DB: `localhost:5433` -> database `hotels`
- Taste DB: `localhost:5434` -> database `taste_explorer`
- PostgreSQL user: `postgres`
- PostgreSQL password: `secret`

### Start Databases With Docker

```bash
docker compose -f docker-compose.db.yml up -d
```

### Stop Databases

```bash
docker compose -f docker-compose.db.yml down
```

To remove persisted data volumes too:

```bash
docker compose -f docker-compose.db.yml down -v
```

### Backend Env Setup

Use these values in [hotels/backend/.env.example](hotels/backend/.env.example) and [taste-explorer/backend/.env.example](taste-explorer/backend/.env.example):

- Hotels backend: `DB_HOST=localhost`, `DB_PORT=5433`, `DB_NAME=hotels`
- Taste backend: `DB_HOST=localhost`, `DB_PORT=5434`, `DB_NAME=taste_explorer`

### First-Time Schema/Seed

Schema and sample data are created automatically by seed containers when you start Docker.
If you want to run the scripts manually, use:

```bash
# Hotels
cd hotels/backend
python setup_hotels_db.py

# Taste
cd ../../taste-explorer/backend
python setup_taste_db.py
```

The seed containers are included in both `docker-compose.db.yml` and `docker-compose.full.yml`, so the tables and starter rows are created even if the Postgres volumes already exist.

## Full Docker Stack

Run the entire system with one command:

```bash
docker compose -f docker-compose.full.yml up -d --build
```

Ports:

- Login app: `http://localhost:5173`
- Hotels app: `http://localhost:5174`
- Taste app: `http://localhost:5176`
- Hotels backend: `http://localhost:8001`
- Taste backend: `http://localhost:8002`

Stop the full stack:

```bash
docker compose -f docker-compose.full.yml down
```

## Current Scope

- Centralized Supabase login flow with return redirect
- Hotels app: hotel search, booking flow, my bookings, cancellation, profile
- Taste app: city-based signature foods, save to library, grouped library, profile
- API-driven right-side MFE widgets between both apps

## Supabase Centralized Login Setup

1. Create a Supabase project.
2. In Supabase Dashboard, go to Authentication -> URL Configuration.
3. Set Site URL to `http://localhost:5173`.
4. Add these Redirect URLs:
	 - `http://localhost:5173`
	 - `http://localhost:5174`
	 - `http://localhost:5176`
5. Copy project keys from Settings -> API.

Set env values in each frontend app:

- `login/react-app/.env`
	- `VITE_SUPABASE_URL=...`
	- `VITE_SUPABASE_ANON_KEY=...`
	- `VITE_ALLOWED_RETURN_ORIGINS=http://localhost:5174,http://localhost:5176`
- `hotels/react-app/.env`
	- `VITE_SUPABASE_URL=...`
	- `VITE_SUPABASE_ANON_KEY=...`
	- `VITE_LOGIN_URL=http://localhost:5173`
- `taste-explorer/react-app/.env`
	- `VITE_SUPABASE_URL=...`
	- `VITE_SUPABASE_ANON_KEY=...`
	- `VITE_LOGIN_URL=http://localhost:5173`

Run apps:

```bash
# terminal 1
cd login/react-app
npm run dev -- --host --port 5173

# terminal 2
cd hotels/react-app
npm run dev -- --host --port 5174

# terminal 3
cd taste-explorer/react-app
npm run dev -- --host --port 5176
```

Flow:

- Hotels/Taste Sign In redirects to centralized login app.
- Login app signs in with Supabase and stores shared auth cookies.
- User is redirected back to source app via `returnTo`.
