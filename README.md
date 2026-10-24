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
6. In VS Code, use Live Server to open `frontend/index.html` on port 5500. The frontend calls the API at `http://localhost:5000/api`; `FRONTEND_URL` controls which frontend origins are allowed by CORS.

The `.env` file is local configuration. Never commit it to GitHub.

## Main features
- Register and log in
- Browse/search donation posts
- Create and delete your own posts
- Request an item
- Donors accept/reject requests
- Mark a reserved item as donated
- View/update profile
