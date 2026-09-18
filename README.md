# PeopleHub — MERN User Management

A responsive user directory built with MongoDB, Express, React, and Node.js. Administrators can create, view, search, edit, and delete users.

## Features

- REST API: `POST /api/users`, `GET /api/users`, `GET /api/users/:id`, `PUT /api/users/:id`, `DELETE /api/users/:id`
- User fields: full name, email, phone, role, and creation date
- Server and client validation, clear API errors, duplicate email handling
- Search by name or email, with server side pagination (10 per page in the UI)
- JWT login, protected routes, and admin role checks
- Responsive dashboard, loading states, empty states, and success/error notifications
- API integration test and production frontend build check

## Technology stack

React 19, Vite, CSS, Lucide icons; Node.js, Express, Mongoose, MongoDB, Zod, bcryptjs, JSON Web Tokens.

## Local setup

Requires Node.js 20+ and a running MongoDB server, local or hosted. MongoDB Atlas is supported through its connection string.

1. From the project root, run `npm install`, `npm install --prefix server`, and `npm install --prefix client`.
2. Copy `server/.env.example` to `server/.env`. Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` of at least 12 characters. Keep this file private.
3. Run `npm run dev` from the project root.
4. Open `http://localhost:5173` and sign in using the admin credentials from `server/.env`.

On first startup, the server creates the initial administrator if that email does not exist. The API runs on port 5000 by default. The frontend dev server proxies `/api` requests to it.

## API

Send `Authorization: Bearer <token>` for protected endpoints. Sign in through `POST /api/auth/login` with `{ "email": "...", "password": "..." }`. `GET /api/auth/me` checks the current session. All `/api/users` endpoints require an admin account. `GET /api/users` accepts `search`, `page`, and `limit` (1–100). Create and update bodies use `fullName`, `email`, `phone`, and `role` (`user` or `admin`). Responses never include password hashes.

## Tests

Run `npm test` at the root. The API test uses an in-memory MongoDB instance; its first run may download a MongoDB binary. The client is checked with a production build.

## Deployment

Deploy the server to Render (Node web service, root directory `server`, build command `npm install`, start command `npm start`). Configure the environment variables from `server/.env.example` and use a MongoDB Atlas connection string for `MONGODB_URI`. Set `CLIENT_URL` to the deployed frontend origin.

Deploy the client to Vercel or Netlify (root directory `client`, build command `npm run build`, output directory `dist`). Set `VITE_API_URL` to the public server origin, with no trailing slash. Redeploy the client after changing this variable.

## Assumptions and challenges

- Only an administrator can manage users. An initial administrator is created from environment variables because public admin signup would undermine role based access control.
- Directory records do not receive login passwords. This keeps user management separate from account provisioning; only the initial administrator can sign in. Adding invitation based account setup would be a sensible next step.
- The app prevents an administrator from deleting or demoting their own account. JWT sessions expire after eight hours; sign in again when they expire.
- A live URL and GitHub repository require accounts and deployment credentials. No URLs are claimed until they actually exist.

## Submission

- GitHub repository: Add the URL after pushing this folder to GitHub.
- Live application: Add the URL after deploying the frontend and API.
