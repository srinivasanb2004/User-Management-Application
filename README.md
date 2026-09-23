# PeopleHub - MERN User Management

A responsive MERN user management application. Administrators can create, view, search, edit, and delete user records through a protected dashboard.

**Live application:** [PeopleHub on Vercel](https://user-management-application-ruddy.vercel.app)
**Live API health check:** [Render API](https://user-management-application-4ryy.onrender.com/api/health)

## Features Implemented

- REST API for create, view all, view by ID, update, and delete users.
- User fields: full name, email address, phone number, role, and date created.
- MongoDB integration using Mongoose.
- Server-side validation with Zod and Mongoose constraints.
- Proper API error handling for validation errors, duplicate emails, invalid IDs, invalid JSON, missing routes, and server errors.
- React dashboard with user create/register form, user list table, edit user, and delete user workflows.
- Client-side form validation.
- Loading indicators, empty states, success notifications, and error notifications.
- Search users by name or email.
- Server-side pagination.
- JWT authentication with protected routes.
- Role-based access control for administrators.
- Production frontend build and backend integration test.

## Technology Stack

- Frontend: React 19, Vite, CSS, Lucide React icons
- Backend: Node.js, Express.js, Mongoose
- Database: MongoDB or MongoDB Atlas
- Validation/Auth: Zod, bcryptjs, JSON Web Tokens
- Testing: Node test runner, Supertest, mongodb-memory-server

## Local Setup

Requires Node.js 20+ and a MongoDB database. MongoDB Atlas is recommended because the same connection string can be used for deployment.

1. Install dependencies from the project root:

   ```powershell
   npm.cmd install
   npm.cmd install --prefix server
   npm.cmd install --prefix client
   ```

2. Copy the backend environment file:

   ```powershell
   Copy-Item server\.env.example server\.env
   ```

3. Update `server/.env`:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=change-this-strong-password
   CLIENT_URL=http://localhost:5173
   ```

   The first server startup creates the initial administrator from `ADMIN_EMAIL` and `ADMIN_PASSWORD` if that email does not already exist.

4. Start the full app:

   ```powershell
   npm.cmd run dev
   ```

5. Open the frontend:

   ```text
   http://localhost:5173
   ```

6. Sign in with the admin credentials from `server/.env`.

The API runs on port 5000 by default. The Vite dev server proxies local `/api` requests to `http://localhost:5000`.

## API Overview

Authentication:

- `POST /api/auth/login`
- `GET /api/auth/me`

Users:

- `POST /api/users`
- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

Protected endpoints require:

```text
Authorization: Bearer <token>
```

`GET /api/users` supports:

- `search`
- `page`
- `limit` from 1 to 100

Create and update bodies use:

```json
{
  "fullName": "Alex Rivera",
  "email": "alex@example.com",
  "phone": "1234567890",
  "role": "user"
}
```

Responses do not expose password hashes.

## Tests

Run the full verification command:

```powershell
npm.cmd test
```

If `mongodb-memory-server` needs a local cache folder on Windows, run:

```powershell
$env:MONGOMS_DOWNLOAD_DIR = "C:\Users\ASUS\Desktop\mern-user-management\.mongodb-binaries"
npm.cmd test --prefix server
```

Run the frontend production build:

```powershell
npm.cmd run build --prefix client
```

## Deployment

The application is deployed with Vercel for the frontend and Render for the API.

### Backend: Render

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- `MONGODB_URI`: a MongoDB Atlas connection string
- `JWT_SECRET`: a unique secret of at least 32 characters
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: credentials for the initial administrator
- `CLIENT_URL`: `https://user-management-application-ruddy.vercel.app`

### Frontend: Vercel

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://user-management-application-4ryy.onrender.com`

Redeploy the frontend after changing `VITE_API_URL`.

## Assumptions And Challenges

- Only administrators can manage users. Public admin signup is intentionally not included because it would weaken role-based access control.
- The user create/register form creates directory records. Normal directory records do not receive login passwords.
- The initial administrator is created from environment variables.
- The app prevents administrators from deleting their own account or removing their own admin role.
- JWT sessions expire after eight hours.
- MongoDB Atlas may require adding the current IP address under Network Access.

## Submission

- GitHub Repository: [srinivasanb2004/User-Management-Application](https://github.com/srinivasanb2004/User-Management-Application)
- Live Application: [https://user-management-application-ruddy.vercel.app](https://user-management-application-ruddy.vercel.app)
- Live API Health Check: [https://user-management-application-4ryy.onrender.com/api/health](https://user-management-application-4ryy.onrender.com/api/health)
