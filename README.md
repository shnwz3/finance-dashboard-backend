# Finance Data Processing & Access Control Backend

A backend API for a finance dashboard system built with **Node.js**, **Express**, and **MongoDB**. Supports user management with role-based access control, financial transaction CRUD, and dashboard-level analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (v18+) |
| Framework | Express.js |
| Database | MongoDB (via Mongoose) |
| Authentication | JWT (jsonwebtoken) |
| Password hashing | bcryptjs |
| Input validation | express-validator |
| Environment config | dotenv |

---

## Getting Started

### Prerequisites

- **Node.js** v18 or above
- **MongoDB** running locally (or a remote URI)

### Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd finance-backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Open .env and set your MongoDB URI and a JWT secret

# 4. (Optional) Seed the database with sample data
npm run seed

# 5. Start the server
npm run dev
# Server starts at http://localhost:5000
```

### Seed Users

If you ran `npm run seed`, the following users are available:

| Email | Password | Role |
|---|---|---|
| admin@example.com | password123 | admin |
| analyst@example.com | password123 | analyst |
| viewer@example.com | password123 | viewer |

---

## API Endpoints

### Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Get current user profile |

### Users (Admin only)

| Method | Path | Description |
|---|---|---|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get single user |
| PATCH | `/api/users/:id` | Update role or status |
| DELETE | `/api/users/:id` | Deactivate user (soft) |

### Transactions

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/api/transactions` | Any | List + filter transactions |
| GET | `/api/transactions/:id` | Any | Get single transaction |
| POST | `/api/transactions` | Admin | Create transaction |
| PUT | `/api/transactions/:id` | Admin | Full update |
| PATCH | `/api/transactions/:id` | Admin | Partial update |
| DELETE | `/api/transactions/:id` | Admin | Soft delete |

**Filtering query params:** `type`, `category`, `startDate`, `endDate`, `page`, `limit`

### Dashboard

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/api/dashboard/recent` | Any | Last 10 transactions |
| GET | `/api/dashboard/summary` | Analyst, Admin | Income/expense/balance totals |
| GET | `/api/dashboard/by-category` | Analyst, Admin | Category-wise breakdown |
| GET | `/api/dashboard/trends` | Analyst, Admin | Monthly trends (default last 6 months) |

---

## Role-Based Access Control

| Endpoint | Viewer | Analyst | Admin |
|---|---|---|---|
| Auth (register/login) | ✓ | ✓ | ✓ |
| GET /transactions | ✓ | ✓ | ✓ |
| POST/PUT/DELETE /transactions | ✗ | ✗ | ✓ |
| GET /users | ✗ | ✗ | ✓ |
| PATCH/DELETE /users | ✗ | ✗ | ✓ |
| GET /dashboard/recent | ✓ | ✓ | ✓ |
| GET /dashboard/summary, by-category, trends | ✗ | ✓ | ✓ |

---

## Production-Ready Features

To ensure the API is professional and battle-tested, the following enhancements have been implemented:

- **Security Headers (`helmet`):** Automatically configures secure HTTP headers to protect against common web vulnerabilities.
- **Request Logging (`morgan`):** Real-time logging of all incoming requests (method, path, status, response time) for better observability.
- **Rate Limiting:** Prevents brute-force attacks and DDoS by limiting each IP to 100 requests per 15-minute window.
- **Keyword Search:** The `/api/transactions` endpoint now supports a `search` query parameter, allowing users to find records by searching through both `category` and `notes` fields.
- **Health Check API:** A dedicated `/api/health` endpoint allows monitoring tools to verify server and database connectivity status.

---

## Project Structure

```
finance-backend/
├── server.js                    # Entry point
├── src/
│   ├── app.js                   # Express app setup
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── models/
│   │   ├── User.js              # User schema + bcrypt hooks
│   │   └── Transaction.js       # Transaction schema + soft delete hook
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── rbac.js              # Role-based access guard
│   │   └── validate.js          # express-validator error handler
│   ├── controllers/
│   │   ├── auth.controller.js   # Register, login, me
│   │   ├── user.controller.js   # Admin user management
│   │   └── transaction.controller.js  # CRUD + filtering
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── transaction.routes.js
│   │   └── dashboard.routes.js
│   ├── services/
│   │   └── dashboard.service.js # Aggregation pipeline logic
│   ├── utils/
│   │   └── apiResponse.js       # Standardised response helpers
│   └── scripts/
│       └── seed.js              # Database seeder
├── .env.example
├── .gitignore
└── package.json
```

---

## Error Handling

All responses follow a consistent JSON format:

```json
// Success
{
  "success": true,
  "message": "Transaction created",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "msg": "Valid email is required" }]
}
```

Status codes used:
- `200` — OK
- `201` — Created
- `401` — Unauthorized (bad/missing token)
- `403` — Forbidden (insufficient role)
- `404` — Not found
- `409` — Conflict (duplicate email)
- `422` — Validation error
- `500` — Server error

---

## Assumptions & Tradeoffs

| Decision | Reasoning |
|---|---|
| Role is settable at registration | Makes testing easier. In production, only admins should assign roles. |
| Soft delete on transactions | `isDeleted: true` preserves audit trail. A pre-find hook automatically excludes deleted records. |
| Stateless JWT auth | No refresh tokens or blacklist — simple for this scope. Tokens expire after 7 days. |
| Aggregation pipelines for dashboard | All summary calculations happen in MongoDB. Efficient for this data volume. |
| Analyst role is read-only | The assignment says analysts "may" read and access insights. Interpreted conservatively. |
| No rate limiting | Out of scope for this submission but would use `express-rate-limit` in production. |

---

## Testing the API

### Register an admin

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Feroz","email":"feroz@example.com","password":"secret123","role":"admin"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"feroz@example.com","password":"secret123"}'
```

### Create a transaction (use the token from login)

```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"type":"income","category":"Salary","date":"2025-04-01","notes":"April salary"}'
```

### Get dashboard summary

```bash
curl http://localhost:5000/api/dashboard/summary \
  -H "Authorization: Bearer <token>"
```

### Filter transactions

```bash
curl "http://localhost:5000/api/transactions?type=expense&category=food&startDate=2025-01-01&endDate=2025-04-30&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```
