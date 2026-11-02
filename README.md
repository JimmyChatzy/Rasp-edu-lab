# Raspberry Pi Educational Platform

Educational web platform for Greek primary school teachers to share Raspberry Pi teaching scenarios.

This repository is the **frontend** (Next.js). The content, user accounts and uploaded files live in a separate **Strapi** CMS repository: [Strapi-for-raspbEduLab](https://github.com/JimmyChatzy/Strapi-for-raspbEduLab).

- **Installing on a server:** see [DEPLOYMENT.md](DEPLOYMENT.md).
- **Review email setup:** see [email-setup-instructions.txt](email-setup-instructions.txt).

## Features

- Browse published teaching scenarios and view their details
- Register / log in, edit your profile
- Create, edit and delete your own scenarios (rich text, pictures)
- Submit a scenario for review; an admin approves it in Strapi

## Tech Stack

- Next.js (App Router, Server Actions), React, TypeScript, Tailwind CSS
- Strapi 5 (REST API, users-permissions, uploads)

## Local development

Clone both repositories next to each other:

```bash
git clone https://github.com/JimmyChatzy/Rasp-edu-lab.git
git clone https://github.com/JimmyChatzy/Strapi-for-raspbEduLab.git
```

Strapi (uses SQLite in development):

```bash
cd Strapi-for-raspbEduLab
cp .env.example .env      # fill in the secrets
npm install
npm run develop           # http://localhost:1337/admin
```

Frontend:

```bash
cd Rasp-edu-lab
cp .env.example .env.local
npm install
npm run dev               # http://localhost:3000
```

## Language

- UI text: Greek
- Code, variables, file names, JSON keys: English
