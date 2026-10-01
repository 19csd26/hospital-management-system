# MedCare Hospital Management System

A full-stack Hospital Management System built with **Ruby on Rails** (API backend) and **React** (frontend).

## Features

- **Dashboard** — Real-time statistics, charts, and recent activity
- **Patient Management** — Full CRUD with search, pagination, and medical history
- **Doctor Management** — Doctor profiles with department and specialization
- **Appointment Scheduling** — Book, manage, and track appointments by status
- **Medical Records** — Diagnosis, prescriptions, and visit history per patient
- **Room & Ward Management** — Track room availability, types, and rates
- **Billing** — Invoice generation, payment tracking, and financial overview
- **Department Management** — Organize staff and resources by department
- **JWT Authentication** — Secure login with role-based access

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Ruby on Rails 8.1 (API mode) |
| Database | SQLite (development) |
| Authentication | JWT (JSON Web Tokens) |
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS 3 |
| State / Data | TanStack Query (React Query) |
| Charts | Recharts |
| HTTP Client | Axios |
| Icons | Lucide React |

## Getting Started

### Backend

```bash
cd hospital-management-system
bundle install
bin/rails db:migrate
bin/rails db:seed
bin/rails server   # runs on http://localhost:3000
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # runs on http://localhost:5173
```

### Demo Login

| Field | Value |
|-------|-------|
| Email | admin@hospital.com |
| Password | password123 |

## API Endpoints

| Resource | Base Path |
|----------|-----------|
| Auth | `POST /api/v1/auth/login` |
| Dashboard | `GET /api/v1/dashboard/stats` |
| Patients | `/api/v1/patients` |
| Doctors | `/api/v1/doctors` |
| Departments | `/api/v1/departments` |
| Appointments | `/api/v1/appointments` |
| Medical Records | `/api/v1/medical_records` |
| Rooms | `/api/v1/rooms` |
| Bills | `/api/v1/bills` |

## Project Structure

```
hospital-management-system/
├── app/
│   ├── controllers/api/v1/   # API controllers
│   ├── models/               # ActiveRecord models
│   └── services/             # JWT service
├── db/
│   ├── migrate/              # Database migrations
│   └── seeds.rb              # Demo data
├── config/
│   ├── routes.rb             # API routes
│   └── initializers/cors.rb  # CORS config
└── frontend/
    └── src/
        ├── api/              # Axios API layer
        ├── contexts/         # React context (Auth)
        ├── components/       # Reusable UI components
        └── pages/            # Page components
```
