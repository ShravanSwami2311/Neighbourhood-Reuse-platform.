# Neighbourhood Reuse & Donation Platform

A community-focused Community Engagement Project that helps people pass usable items to neighbours for free. It supports UN Sustainable Development Goal 12: Responsible Consumption and Production.

## Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MySQL
- Authentication: bcryptjs + JWT

## Setup
1. Install Node.js and MySQL Server.
2. In MySQL Workbench, run `database/schema.sql`.
3. Copy `backend/.env.example` to `backend/.env` and set your MySQL password and a long random JWT secret. The defaults expect MySQL on `localhost:3306` and the database created by `database/schema.sql`.
4. Open a terminal in `backend/` and run `npm install`.
5. Run `npm run dev`. The API will be available at `http://localhost:5000`.
6. In VS Code, use Live Server to open `frontend/index.html` on port 5500. The frontend automatically calls the local API at `http://localhost:5000/api`.

## Live deployment
- Deploy the backend and database to a host reachable over HTTPS. Set `PORT` to the port provided by the backend host and set the database and JWT variables there.
- Set the backend's `FRONTEND_URL` environment variable to the exact deployed frontend origin (scheme and hostname, without a trailing slash). Include multiple comma-separated origins if needed.
- If the frontend and backend are on separate hosts, set `window.API_BASE_URL` in `frontend/js/config.js` to the backend API URL, including `/api` (for example, `https://your-backend.example.com/api`). If they share a host and `/api` is routed to the backend, leave it empty.
- Redeploy the frontend after changing `frontend/js/config.js`. Do not use `localhost` as the backend URL for a public frontend; it refers to each visitor's device.

The `.env` file is local configuration. Never commit it to GitHub.

## Main features
- Register and log in
- Browse/search donation posts
- Create and delete your own posts
- Request an item
- Donors accept/reject requests
- Mark a reserved item as donated
- View/update profile
