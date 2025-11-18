<p align="center">
  <img src="public/name_logo.png" alt="Lost & Found Logo" width="160" />
</p>

<p align="center">
  <strong>Lost & Found</strong> — A modern platform to manage lost and found items with real-time messaging, robust search, and role-based access.
</p>

<p align="center">
  <a href="https://github.com/Paurakh977/Lost-nd-Found.git">Repo</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#environment-setup">Environment</a> ·
  <a href="#docker-compose">Compose</a> ·
  <a href="#build-from-source">Build</a> ·
  <a href="#troubleshooting">Troubleshooting</a>
</p>

---

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stacks)
- [Quick Start](#quick-start)
- [Install Prerequisites](#install-prerequisites)
  - [Docker Installation](#docker-installation)
  - [Git Installation](#git-installation)
- [Environment Setup](#environment-setup)
- [Docker Compose](#docker-compose)
- [Build from Source](#build-from-source)
- [Configuration Details](#configuration-details)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Links](#links)

## Overview
A comprehensive digital platform for managing lost and found items with real-time notifications, multi-role access, and advanced search capabilities. Built with Next.js and deployed via Docker.

## Tech Stack
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Backend: Next.js API Routes, MongoDB (Mongoose), Redis (optional)
- Auth & Security: Clerk, JWT, Next.js Middleware
- Realtime & PWA: Socket.io, Web Push Notifications, PWA
- Email & Export: Nodemailer (Gmail SMTP), XLSX

<p>
  <img src="https://skillicons.dev/icons?i=nextjs,react,typescript,tailwind,nodejs,mongodb,redis,docker" alt="Tech Icons" />
</p>

## Quick Start
Use the pre-built image published to GHCR: `ghcr.io/paurakh977/lost-nd-found:1.0.0`.

### Run with Docker (no git clone)
```bash
# 1) Create a working directory
mkdir lost-n-found && cd lost-n-found

# 2) Download env template (Linux/macOS)
curl -o .env https://raw.githubusercontent.com/Paurakh977/Lost-nd-Found/main/.env.example

# Windows (PowerShell)
Invoke-WebRequest -Uri https://raw.githubusercontent.com/Paurakh977/Lost-nd-Found/main/.env.example -OutFile .env

# 3) Create uploads directory (required for file storage)
mkdir uploads

# 4) Edit .env with your configuration (see Environment Setup)

# 5) Pull and run the container
docker pull ghcr.io/paurakh977/lost-nd-found:1.0.0
docker run -d \
  --name lost-n-found \
  -p 3000:3000 \
  -v ${PWD}/uploads:/app/uploads \
  --env-file .env \
  --restart unless-stopped \
  ghcr.io/paurakh977/lost-nd-found:1.0.0

# 6) Verify
docker ps | grep lost-n-found
docker logs -f lost-n-found
```

Access the app at `http://localhost:3000`.

Expected:
- Homepage loads, sign-in/sign-up routes work
- File uploads persist to `uploads/`
- Data persists in your MongoDB

## Install Prerequisites
### Docker Installation
- Windows/macOS: https://www.docker.com/products/docker-desktop/
- Linux: https://docs.docker.com/engine/install/

### Git Installation
- All platforms: https://git-scm.com/downloads

## Environment Setup
Edit `.env` using the template:
- Direct link: `https://raw.githubusercontent.com/Paurakh977/Lost-nd-Found/main/.env.example`

Required:
- `MONGODB_URI` — MongoDB connection (Atlas or local)
- `JWT_SECRET` — at least 32 characters
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` — from Clerk dashboard

Optional:
- `REDIS_URL` — if you use Redis
- `SMTP_*` — for email notifications via Gmail
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_AGENT_SERVER_URL` — URLs for your deployment
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — initial admin seeding

## Docker Compose
Use the pre-built GHCR image in Compose:
```yaml
version: "3.8"
services:
  app-prod:
    container_name: app-prod
    image: ghcr.io/paurakh977/lost-nd-found:1.0.0
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - ./uploads:/app/uploads
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/', r => process.exit(r.statusCode===200?0:1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
    restart: unless-stopped
```

Start with:
```bash
mkdir uploads
docker-compose up -d
```

## Build from Source
For development or custom builds:
```bash
git clone https://github.com/Paurakh977/Lost-nd-Found.git
cd Lost-nd-Found

# Dev
npm install
npm run dev

# Prod build via Compose
docker-compose --profile prod up -d --build

# Or manual build
docker build -f Dockerfile.prod -t lost-n-found:latest .
docker run -p 3000:3000 --env-file .env lost-n-found:latest
```

## Configuration Details
- Image: `ghcr.io/paurakh977/lost-nd-found:1.0.0`
- Base: Distroless Node.js 22 (production) / Node 22 Alpine (dev)
- Ports: `3000`
- Volume: `./uploads:/app/uploads`
- Healthcheck: Node HTTP request to `/`

Build args (only used when building from source):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`, `NEXT_PUBLIC_AGENT_SERVER_URL`, `NEXT_PUBLIC_APP_URL`

## Troubleshooting
- Container won’t start: check `docker logs lost-n-found`
- 3000 already in use: stop other services or remap port
- MongoDB errors: verify `MONGODB_URI` and network access/whitelisting
- Auth errors: ensure Clerk keys and redirect URLs are correct
- Uploads: confirm `uploads/` exists and is writable; on Windows, ensure volume path resolves

## License
Licensed under MIT — see `LICENSE`.

## Links
- Repo: `https://github.com/Paurakh977/Lost-nd-Found.git`
- Image: `docker pull ghcr.io/paurakh977/lost-nd-found:1.0.0`

---

Ready to deploy?
```bash
docker pull ghcr.io/paurakh977/lost-nd-found:1.0.0
docker-compose up -d
```
