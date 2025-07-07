# Government Administrative Service Portal

## Overview

This is a comprehensive administrative service portal for the Ninh Chử Ward Administrative Service Center. The application provides a digital platform for citizens to access government procedures, submit applications, provide feedback, and interact with administrative services through a modern web interface.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend and backend:

### Frontend Architecture
- **React with TypeScript**: Modern React application using functional components and hooks
- **Vite**: Fast build tool and development server
- **Shadcn/ui Components**: Comprehensive UI component library built on Radix UI primitives
- **TailwindCSS**: Utility-first CSS framework with custom government color scheme
- **TanStack Query**: Efficient server state management and data fetching
- **Wouter**: Lightweight client-side routing

### Backend Architecture
- **Express.js**: Node.js web framework handling API routes and middleware
- **TypeScript**: Type-safe server-side development
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **Passport.js**: Authentication middleware with local strategy
- **Express Session**: Session management with PostgreSQL store

## Key Components

### Authentication System
- **Strategy**: Local authentication using username/password
- **Password Security**: Scrypt-based password hashing with salt
- **Session Management**: PostgreSQL-backed session store
- **Role-based Access**: Admin and user role differentiation

### Database Layer
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Database**: PostgreSQL with Neon serverless configuration
- **Migrations**: Automated database schema management
- **Schema**: Comprehensive data model covering users, procedures, applications, feedback, and contacts

### UI/UX Design
- **Design System**: Government-themed color palette (red, blue, gold)
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Accessibility**: Radix UI primitives ensure ARIA compliance
- **Vietnamese Language**: Localized interface for government services

### Key Features
- **Procedure Board**: Public listing of administrative procedures with QR codes
- **Application System**: Digital form submission and tracking
- **Feedback System**: Citizen feedback collection and rating system
- **Admin Dashboard**: Administrative interface for procedure and application management
- **AI Chatbot**: Integrated chatbot for citizen assistance

## Data Flow

### User Registration/Authentication Flow
1. User accesses authentication page
2. Registration creates hashed password with scrypt
3. Login validates credentials and creates session
4. Session persisted in PostgreSQL store
5. Role-based access control enforced on protected routes

### Application Submission Flow
1. Citizen selects procedure from public board
2. Form submission creates application record
3. Unique application code generated for tracking
4. Email notifications sent (if configured)
5. Admin can update application status
6. Status changes reflected in user dashboard

### Data Management Flow
1. Frontend components use TanStack Query for data fetching
2. API routes handle CRUD operations through Drizzle ORM
3. Type safety maintained throughout stack with shared schema
4. Real-time updates through optimistic updates and cache invalidation

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **express**: Web application framework
- **passport**: Authentication middleware
- **@tanstack/react-query**: Server state management

### UI Dependencies
- **@radix-ui/***: Comprehensive set of UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form handling and validation

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type safety and development experience
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend development
- **Express Server**: Backend API server with middleware logging
- **Database**: Local or cloud PostgreSQL instance via Neon

### Production Build Process
1. **Frontend Build**: Vite builds optimized React application to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Asset Optimization**: Static assets optimized and fingerprinted
4. **Environment Variables**: Database URLs and session secrets configured

### Production Deployment
- **Server**: Single Node.js process serving both API and static files
- **Database**: PostgreSQL database with connection pooling
- **Session Storage**: PostgreSQL-backed session persistence
- **Static Assets**: Served directly by Express with proper caching headers

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Cryptographic secret for session signing
- **NODE_ENV**: Environment detection for optimization

## Changelog
- July 07, 2025. Initial setup
- July 07, 2025. Added comprehensive admin management panel
- July 07, 2025. Updated location to Khánh Hòa province
- July 07, 2025. Added procedure management with QR codes
- July 07, 2025. Added application management system
- July 07, 2025. Added feedback and contact management
- July 07, 2025. Implemented role-based access control

## User Preferences

Preferred communication style: Simple, everyday language.
Current location: Phường Ninh Chử, TP. Nha Trang, Tỉnh Khánh Hòa
Working hours: Monday-Friday 7:30-11:30, 13:30-17:00, Weekend and holidays off