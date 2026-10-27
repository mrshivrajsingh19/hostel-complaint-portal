# 🏠 Hostel Complaint Portal

A full-stack web application for managing hostel/PG maintenance complaints with role-based access for students and wardens.

---

## 📋 Problem Statement

Students living in hostels and PG accommodations frequently face maintenance issues (plumbing, electrical, internet, etc.) with no structured way to report them or track resolution status. Wardens struggle to prioritize and manage multiple complaints efficiently.

## 👥 Target Users

- **Students** — residents of hostel/PG facilities who need to report maintenance issues
- **Wardens/Admins** — hostel staff who review, assign, and resolve complaints

---

## ✅ Solution

A complaint management platform where:
- Students submit detailed complaints with category, priority, and location
- Wardens see all complaints on a dashboard with analytics and can update statuses with notes
- Both roles track the full lifecycle of every complaint via a timeline

---

## 🔄 Core Workflows

### Student Workflow
```
Register/Login → Submit Complaint (category, priority, description)
      ↓
View complaint status updates in real-time
      ↓
See warden's notes and timeline of actions
      ↓
Withdraw complaint if still pending
```

### Warden Workflow
```
Login → Dashboard with stats (pending, in-progress, resolved)
      ↓
View all complaints with filters (status, category, priority, search)
      ↓
Open complaint → Assign to staff + add notes + update status
      ↓
Mark resolved/rejected → Student sees update with note
```

---

## ✨ Key Features

- **Role-based Authentication** — JWT-based login with separate Student and Warden roles
- **Complaint Submission** — Title, description, category (8 types), priority (4 levels), location
- **Status Workflow** — pending → assigned → in_progress → resolved / rejected
- **Activity Timeline** — Full audit trail of every status change on a complaint
- **Warden Dashboard** — Stats cards, category breakdown chart, priority breakdown, recent complaints
- **Advanced Filtering** — Search + filter by status, category, and priority simultaneously
- **Warden Notes** — Wardens leave notes visible to students on each status update
- **Input Validation** — Client and server-side validation with clear error messages
- **Error Handling** — Unauthorized access, invalid input, not found, and duplicate email errors
- **Demo Accounts** — One-click demo credentials on login page for evaluators

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Storage | JSON file-based persistence (no external DB required) |
| Icons | Lucide React |
| HTTP Client | Axios |

---

## 🏗️ Architecture

```
hostel-complaint-portal/
├── client/                   # React frontend (Vite)
│   └── src/
│       ├── api.js             # Axios instance with JWT interceptors
│       ├── context/           # React Context for auth state
│       ├── components/        # Navbar, StatusBadge, ProtectedRoute
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── student/       # StudentDashboard, NewComplaint, ComplaintDetail
│           └── warden/        # WardenDashboard, AllComplaints, ManageComplaint
└── server/                   # Express backend
    ├── index.js               # App entry point
    ├── db.js                  # JSON file read/write layer
    ├── middleware/auth.js     # JWT authentication middleware
    ├── routes/
    │   ├── auth.js            # /api/auth/register, /login, /me
    │   ├── complaints.js      # /api/complaints CRUD + /stats
    │   └── users.js           # /api/users
    └── data/                  # Auto-created JSON files (gitignored)
        ├── users.json
        └── complaints.json
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- npm

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/hostel-complaint-portal.git
cd hostel-complaint-portal
```

### 2. Setup the backend
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```
PORT=5000
JWT_SECRET=your_secret_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
# or
npm start
```

### 3. Setup the frontend
```bash
cd ../client
npm install
```

Create a `.env` file in `client/`:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 🔑 Environment Variables

### Server (`server/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port for the Express server | `5000` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_here` |
| `NODE_ENV` | Environment (`development`/`production`) | `development` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:5173` |

### Client (`client/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

> ⚠️ Never commit `.env` files. They are in `.gitignore`.

---

## 🎭 Demo Accounts

On the login page, click the demo buttons to auto-fill credentials:

| Role | Email | Password |
|------|-------|----------|
| 🎓 Student | `ravi@student.com` | `student123` |
| 🏢 Warden | `warden@hostel.com` | `warden123` |

---

## 🌐 Live Deployment

- **Deployment Platform:** Vercel (All-in-One Full-Stack Architecture)
  - **Frontend:** React 18 SPA built with Vite and Tailwind CSS
  - **Backend API:** Express Serverless Functions under `/api/*`
  - **Zero-CORS:** Frontend and API share the exact same domain
  - **Publicly Accessible:** Verified with zero authentication wall for evaluators

### 🚀 Deploying to Vercel (1-Click)
1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import **`mrshivrajsingh19/hostel-complaint-portal`**
3. Click **Deploy** (all configurations are pre-defined in `vercel.json`!)



---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/complaints` | JWT | List complaints (role-filtered) |
| GET | `/api/complaints/stats` | Warden | Dashboard statistics |
| GET | `/api/complaints/:id` | JWT | Get single complaint |
| POST | `/api/complaints` | Student | Submit new complaint |
| PATCH | `/api/complaints/:id/status` | Warden | Update complaint status |
| DELETE | `/api/complaints/:id` | JWT | Delete pending complaint |
| GET | `/api/users` | Warden | List all students |

---

## 🔒 Security

- Passwords hashed with bcryptjs (salt rounds: 10)
- JWTs with 7-day expiry
- Role-based authorization on every protected route
- Students cannot access other students' complaints
- Input validation on both client and server
- No credentials committed to Git (`.env` gitignored)
- CORS configured to allow only the client origin

---

## 🧪 Engineering Highlights

- **Application Logic:** The complaint lifecycle implements a real state machine (pending → assigned → in_progress → resolved/rejected) with validation on transitions
- **Timeline Audit Trail:** Every status change is logged immutably with actor, timestamp, and note
- **Authorization Layers:** Role-based access enforced at both route middleware and data layer
- **Stateless Auth:** JWT-based — server holds no session state
- **Error Handling:** Covers invalid input, unauthorized access, not-found resources, duplicate accounts, and failed API calls
