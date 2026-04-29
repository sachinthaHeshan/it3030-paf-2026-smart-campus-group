# Smart Campus — IT3030 PAF 2026

A full-stack campus management platform built for SLIIT, enabling students and staff to manage resources, bookings, tickets, notifications, and more.

## Tech Stack

| Layer    | Technology                                     |
| -------- | ---------------------------------------------- |
| Frontend | Next.js 16, React 19, Tailwind CSS, TypeScript |
| Backend  | Spring Boot, Java, PostgreSQL                  |
| Auth     | JWT + Google OAuth                             |
| Deploy   | GitHub Pages (frontend), Railway (backend)     |

## Features

- **Authentication** — JWT-based login & Google OAuth sign-in
- **Resource Management** — Campus resource listing and management
- **Booking System** — Reserve campus resources and spaces
- **Ticketing** — Submit and track support/issue tickets
- **Notifications** — In-app notification system
- **Analytics** — Usage and activity analytics
- **Ratings** — Rate campus resources and services

## Project Structure

```
├── frontend/   # Next.js app (deployed to GitHub Pages)
└── backend/    # Spring Boot REST API (deployed to Railway)
```

## Running Locally

**Frontend**

```bash
cd frontend
pnpm install
pnpm dev        # http://localhost:3000
```

**Backend**

```bash
cd backend
./mvnw spring-boot:run   # http://localhost:8080
```

## Deployment

**Frontend → GitHub Pages**

1. Go to **Settings → Pages** in the GitHub repo.
2. Set **Source** to **GitHub Actions**.
3. Push a commit or re-run the **Deploy frontend to GitHub Pages** workflow.
4. Live at: https://sachinthaheshan.github.io/it3030-paf-2026-smart-campus-group/

**Backend → Railway**

Configured via `railway.json`. Connect the repo in Railway and it deploys automatically on push.
