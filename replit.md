# PawConnect - Pet Social Network Platform

## Overview

PawConnect is a modern full-stack web application designed as a social media platform for pet owners. The application allows users to create profiles for their pets, share posts with photos, track medical records, discover other pets, and build a community around pet care. Built with a React frontend and Express backend, it features a mobile-first design optimized for pet lovers to connect and share their furry friends' lives.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component system
- **Styling**: Tailwind CSS with custom design tokens for consistent theming
- **Mobile-First Design**: Responsive layout optimized for mobile devices

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the stack
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Custom email/password authentication with session storage
- **API Design**: RESTful endpoints with consistent error handling
- **Development**: Hot reload with Vite middleware integration

### Database Design
- **Users**: Core user accounts with email/username authentication
- **Pets**: Pet profiles with breed, age, gender, and visibility settings
- **Posts**: Social media posts with images, captions, and engagement metrics
- **Medical Records**: Health tracking for vaccinations, checkups, and medications
- **Social Features**: Likes, follows, and comments for community interaction

## Key Components

### Authentication System
- User registration and login with email validation
- Session-based authentication with localStorage persistence
- Protected routes requiring authentication
- User profile management

### Pet Management
- Pet profile creation with detailed information
- Multiple pets per user account
- Public/private visibility controls
- Profile image support with placeholder fallbacks

### Social Features
- Instagram-style post feed with infinite scroll capability
- Like and comment functionality
- Follow system for connecting with other pets
- Story highlights for featured content
- Discovery page for finding new pets

### Health Tracking
- Medical record management by pet
- Vaccination tracking with due date reminders
- Health status overview with visual indicators
- Record type categorization (vaccination, checkup, medication)

### Mobile-First UI
- Bottom navigation for core app sections
- Touch-optimized interactions
- Responsive card layouts
- Progressive loading states

## Data Flow

### User Journey
1. **Authentication**: Users register/login to access the platform
2. **Pet Setup**: Users create profiles for their pets
3. **Content Creation**: Users share posts with photos and captions
4. **Discovery**: Users explore and follow other pets
5. **Health Management**: Users track medical records and appointments
6. **Social Interaction**: Users like, comment, and engage with content

### API Communication
- Frontend communicates with backend through RESTful APIs
- TanStack Query manages caching, loading states, and error handling
- Optimistic updates for improved user experience
- Real-time data synchronization with query invalidation

### Database Operations
- Drizzle ORM provides type-safe database queries
- PostgreSQL ensures data consistency and relationships
- Migration system for schema evolution
- Connection pooling for performance optimization

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Hook Form for forms
- **UI Framework**: Radix UI components, Lucide React icons
- **Styling**: Tailwind CSS, class-variance-authority for component variants
- **Data Fetching**: TanStack Query for server state management
- **Development**: Vite plugins for enhanced development experience

### Backend Dependencies
- **Core**: Express.js, TypeScript runtime with tsx
- **Database**: Drizzle ORM, @neondatabase/serverless for PostgreSQL
- **Validation**: Zod for runtime type validation
- **Development**: ESBuild for production builds, Drizzle Kit for migrations

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: TypeScript for static type checking
- **Database Management**: Drizzle migrations and schema management
- **Deployment**: Production-ready build configuration

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- Concurrent frontend and backend development
- Database migrations with Drizzle Kit
- Environment variable configuration for database connections

### Production Build
- Vite builds optimized React application
- ESBuild compiles TypeScript backend to ES modules
- Static asset serving through Express
- Database schema deployment through migrations

### Environment Configuration
- PostgreSQL database connection via DATABASE_URL
- Separate development and production configurations
- Build-time optimizations for performance
- Asset bundling and compression

## Changelog

```
Changelog:
- July 07, 2025. Initial setup
- July 07, 2025. Added complete feature set:
  * Photo upload system with 3-photo limit per pet
  * Tinder-style matching system with swipe functionality
  * Match tracking and mutual match detection
  * Enhanced pet profiles with multiple photos
  * Create post functionality with photo uploads
  * Updated navigation to include matching features
  * Environment configuration for upload limits
- July 07, 2025. Added comprehensive medical records system:
  * Complete medical record tracking with CRUD operations
  * Vaccination schedules and appointment management
  * Prescription tracking with detailed medication information
  * Medical record categorization (vaccinations, surgeries, medications)
  * Integration with veterinary clinic database compatibility
- July 07, 2025. Integrated Google Gemini AI for pet care:
  * AI-powered training plans based on breed and age
  * Personalized breeding advice and health screening recommendations
  * Daily care guidelines with nutrition and exercise suggestions
  * Medical recommendations with vaccination schedules
  * Full schema compatibility with veterinary database fields
  * Support for appointment references and veterinarian assignments
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```