# PawConnect - Pet Social Network Platform

## Overview
PawConnect is a modern full-stack web application for pet owners to create pet profiles, share posts, track medical records, discover other pets, and build a pet care community. It features a mobile-first React frontend, Express/Node backend, PostgreSQL database, and Google Gemini AI integration for personalized pet care recommendations.

## Features
- User authentication (register/login)
- Pet profile management (multiple pets per user)
- Instagram-style post feed (photo uploads, likes, comments)
- Tinder-style pet matching (swipe, mutual match detection)
- Medical record tracking (vaccinations, checkups, medications)
- AI-powered care recommendations (training, health, nutrition)
- Social features (follows, story highlights, discovery)
- Mobile-first UI with bottom navigation

## System Architecture
### Frontend
- React 18 + TypeScript, Vite, Wouter (routing), TanStack Query (data)
- shadcn/ui + Radix UI + Tailwind CSS for UI
- Mobile-first, responsive, touch-optimized

### Backend
- Node.js + Express, TypeScript
- RESTful API, session-based auth
- PostgreSQL + Drizzle ORM (type-safe DB)
- Google Gemini AI for pet care

### Database
- Users, Pets, Posts, MedicalRecords, Likes, Follows, Matches, Comments
- See `shared/schema.ts` for full schema

## Setup & Development
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment:**
   - Set `DATABASE_URL` in your environment for PostgreSQL
   - (Optional) Set `GEMINI_API_KEY` for AI features
3. **Run development server:**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5000
   - Backend/API: http://localhost:5000/api
4. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```
5. **Database migration:**
   ```bash
   npm run db:push
   ./migrate-to-postgres.sh
   ```
   See `MIGRATION_GUIDE.md` for details.
#reference https://dribbble.com/shots/19826060-Pet-Profile-Update-Phase-1
## Usage Guide
- Register/login to create an account
- Add pets and upload photos
- Create posts, like, comment, and follow other pets
- Swipe to match with other pets
- Track medical records and get AI care advice

## Main Pages
- `/` Home: Feed, stories, create post
- `/discover`: Find new pets
- `/match`: Swipe to match
- `/matches`: View mutual matches
- `/profile`: Manage pets, medical records, AI care
- `/health`: Health tracker, quick actions
- `/auth`: Login/register

## API Highlights
- Auth: `/api/auth/register`, `/api/auth/login`
- Pets: `/api/pets/user/:userId`, `/api/pets/public`, `/api/pets`
- Posts: `/api/posts/feed/:userId`, `/api/posts`, `/api/posts/pet/:petId`
- Medical: `/api/medical-records/pet/:petId`, `/api/medical-records`
- Matches: `/api/matches/potential/:userId`, `/api/matches/user/:userId`, `/api/matches`
- AI: `/api/ai/generate-recommendations`, `/api/ai/chat`

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Radix UI, TanStack Query
- **Backend:** Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL, Zod
- **AI:** Google Gemini API
- **Dev Tools:** Vite, ESBuild, Drizzle Kit, TypeScript, Replit

## Contribution
- Fork and clone the repo
- Create feature branches for changes
- Run tests and lint before PRs
- See `.cursorrules` for code style and conventions

## License
MIT

## Credits
- UI: shadcn/ui, Radix UI, Lucide Icons
- AI: Google Gemini
- ORM: Drizzle ORM
- Inspired by pet social and health apps 