# Raspberry Pi Educational Platform

Minimal educational web platform for Greek primary school teachers to share Raspberry Pi teaching scenarios.

## Features

- Browse and filter teaching scenarios (grade, difficulty, subject)
- View scenario details
- Create scenarios (guests and logged-in users)
- Comment on scenarios (logged-in users only)
- Simple register / login
- Dashboard for user-created scenarios
- Local JSON file storage (`/data`)

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Server Actions for CRUD

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data Files

- `data/scenarios.json` — teaching scenarios
- `data/comments.json` — scenario comments
- `data/users.json` — registered users

## Guest vs Logged-in Users

| Action | Guest | Logged-in |
|--------|-------|-----------|
| View scenarios | Yes | Yes |
| Create scenarios | Yes | Yes |
| Post comments | No | Yes |
| Dashboard | No | Yes |

## Language

- UI text: Greek
- Code, variables, file names, JSON keys: English
