# Smart Food Rescue and Redistribution Network

College MVP that connects food providers with orphanages. Providers publish surplus listings, orphanages request quantities, remaining stock is stored in MySQL, pickups are scheduled with QR confirmation, and administrators can see network activity. Natural-language food search uses the Gemini API from the backend only.

## Stack

- Frontend: React + Vite + Axios (`/frontend`)
- Backend: Java 21, Spring Boot 3, Maven, Spring Security, JWT, BCrypt (`/backend`)
- Database: MySQL + Spring Data JPA
- Hosting targets: Vercel (frontend), Render (backend), any cloud MySQL

## Local setup

### 1. MySQL

Install MySQL 8, start the server, then run:

```sql
SOURCE database/schema.sql;
```

Or execute `database/schema.sql` in MySQL Workbench.

Default local connection expected by the backend:

- database: `smartfoodrescue`
- user: `root`
- password: `root`

Change these with environment variables if your machine differs.

### 2. Backend

Requirements: JDK 21 and Maven 3.9+.

```bash
cd backend
set DB_URL=jdbc:mysql://localhost:3306/smartfoodrescue?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
set DB_USERNAME=root
set DB_PASSWORD=root
set JWT_SECRET=replace-with-a-long-random-secret-at-least-32-chars
set CORS_ALLOWED_ORIGINS=http://localhost:5173
set GEMINI_API_KEY=your-gemini-key
mvn spring-boot:run
```

On PowerShell use `$env:DB_PASSWORD="root"` style assignments instead of `set`.

The API starts at `http://localhost:8080`. Health check: `GET /api/health`.

On first boot the app creates an admin user:

- email: `admin@smartfoodrescue.local`
- password: `Admin@12345`

Change `ADMIN_EMAIL` and `ADMIN_PASSWORD` before any real deployment.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to the backend, so no frontend env file is required locally.

Do **not** put `GEMINI_API_KEY` or `JWT_SECRET` in the frontend.

## Demo accounts after local start

Register a provider and an orphanage from the UI, then log in as admin with the seeded credentials above.

Suggested flow:

1. Provider creates a surplus listing.
2. Orphanage browses food and requests a quantity.
3. Provider accepts (remaining quantity decreases in MySQL).
4. Orphanage schedules pickup and opens the QR page.
5. Provider (or orphanage) confirms collection with the QR token.
6. Transaction history shows the completed handoff.
7. Orphanage can try AI search once `GEMINI_API_KEY` is set.

## Tests and builds

```bash
cd backend
mvn test
mvn -DskipTests package
```

```bash
cd frontend
npm install
npm run build
```

## API map

| Method | Path | Who |
| --- | --- | --- |
| POST | `/api/auth/register` | public (PROVIDER or ORPHANAGE) |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | authenticated |
| GET | `/api/listings/available` | ORPHANAGE, ADMIN |
| CRUD | `/api/listings` | PROVIDER |
| POST | `/api/listings/{id}/requests` | ORPHANAGE |
| POST | `/api/requests/{id}/accept` | PROVIDER |
| POST | `/api/pickups/requests/{id}` | participants |
| POST | `/api/pickups/confirm` | participants |
| POST | `/api/ai/search` | ORPHANAGE, ADMIN |
| GET | `/api/admin/stats` | ADMIN |

## Cloud deployment (you must do this)

Deployment is **not** finished until you create the three services below and confirm they work together.

### A. Cloud MySQL

Create a MySQL instance (PlanetScale, Aiven, Railway, Amazon RDS, or Render MySQL if available). Run `database/schema.sql`. Copy the JDBC URL, username and password.

JDBC URL shape:

`jdbc:mysql://HOST:3306/smartfoodrescue?useSSL=true&requireSSL=false&serverTimezone=UTC`

### B. Render backend

1. Push this repo to GitHub.
2. In Render: New Web Service → connect the repo → root directory `backend`.
3. Runtime: Java. Build: `./mvnw clean package -DskipTests` (or `mvn clean package -DskipTests` if you add Maven on the image).
4. Start: `java -jar target/smart-food-rescue-1.0.0.jar`
5. Set environment variables:

```
SPRING_PROFILES_ACTIVE=prod
DB_URL=...
DB_USERNAME=...
DB_PASSWORD=...
JWT_SECRET=<long random string>
CORS_ALLOWED_ORIGINS=https://YOUR-VERCEL-APP.vercel.app
GEMINI_API_KEY=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

6. After the first deploy, open `https://YOUR-SERVICE.onrender.com/api/health`.

Windows note: this repo does not include the Maven wrapper until you generate it. On a machine with Maven run `mvn -N wrapper:wrapper` inside `backend/` before using `./mvnw` on Render. If you skip that, set Render's build command to `mvn clean package -DskipTests` and choose a Java 21 native environment.

### C. Vercel frontend

1. Import `/frontend` as a Vercel project (Root Directory: `frontend`).
2. Framework: Vite.
3. Deploy. Production API requests use the `/api` rewrite in `frontend/vercel.json`; do not set `VITE_API_URL` in Vercel.
4. For local development, set `VITE_API_URL` to the public backend URL and allow the local frontend origin in `CORS_ALLOWED_ORIGINS`.

### D. Verify live

- Vercel landing page loads.
- Register a provider and an orphanage against the live API.
- Create a listing, request it, accept it, schedule pickup, confirm QR.
- Confirm rows appear in the cloud MySQL `food_listings`, `food_requests`, `pickups`, and `food_transactions` tables.

Until those checks pass, treat the app as local-only.

## Security notes

- Passwords are hashed with BCrypt.
- JWT is required for all non-public endpoints.
- Role checks use Spring Security (`ROLE_PROVIDER`, `ROLE_ORPHANAGE`, `ROLE_ADMIN`).
- Remaining quantity is updated inside a database transaction with a pessimistic lock on accept.
- Gemini is called only from the backend.
