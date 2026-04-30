# Team Task Manager

Full-stack web app for managing projects, assigning tasks, and tracking progress with role-based access control.

## Stack

- **Backend**: Node.js + Express + Prisma ORM + PostgreSQL
- **Frontend**: React + Vite + Tailwind CSS
- **Auth**: JWT
- **Deployment**: Railway

## Features

- Signup / Login with JWT auth
- Role-based access: Global Admin vs Member
- Project creation and management
- Per-project roles (Admin / Member)
- Task creation, assignment, status & priority tracking
- Dashboard with stats and overdue tasks
- My Tasks view with inline status updates
- Admin user management panel

## Local Development

### Backend

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

## Deploy to Railway

### 1. Backend Service

1. Create a new Railway project
2. Add a **PostgreSQL** plugin — Railway auto-sets `DATABASE_URL`
3. Add a new service from this repo, set root directory to `backend`
4. Set environment variables:
   - `JWT_SECRET` = a long random string
   - `CLIENT_URL` = your frontend Railway URL (set after deploying frontend)
5. Railway will run `npx prisma migrate deploy && node src/index.js` automatically

### 2. Frontend Service

1. Add another service from the same repo, set root directory to `frontend`
2. Set environment variable:
   - `VITE_API_URL` = `https://<your-backend-service>.railway.app/api`
3. Deploy — Railway builds with Vite and serves the `dist` folder

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/signup | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/projects | List projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Project detail + tasks + members |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |
| POST | /api/projects/:id/members | Add member |
| DELETE | /api/projects/:id/members/:userId | Remove member |
| GET | /api/tasks/dashboard | Dashboard stats |
| GET | /api/tasks/my | My assigned tasks |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/users | List all users |
| PATCH | /api/users/:id/role | Change user role (Admin only) |
