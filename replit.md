# OnBoard HHRR - HR Management System

## Overview

OnBoard HHRR is a comprehensive Human Resources management application designed specifically for the Venezuelan business context. The system provides complete employee lifecycle management from recruitment through contract administration, with features including authentication, organizational structure management, employee data management, dashboard analytics, and document workflows. Built as a full-stack web application, it serves HR departments with tools for managing employees, contracts, organizational hierarchies, and generating insights through comprehensive dashboards.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- Proyecto preparado completamente para subir a GitHub (Enero 2025)
- Archivos de documentación y configuración creados para repositorio público
- Sistema base funcional con autenticación, dashboard y gestión básica de empleados

## System Architecture

### Frontend Architecture
- **Framework**: React with Vite for fast development and hot module replacement
- **Routing**: Wouter for lightweight client-side routing with protected routes
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **State Management**: Zustand for lightweight global state management
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing
- **Data Fetching**: TanStack Query for server state management and caching
- **UI Components**: Radix UI primitives with custom styling through shadcn/ui

### Backend Architecture
- **Server**: Express.js with TypeScript for type safety
- **API Design**: RESTful API endpoints with proper HTTP status codes
- **Session Management**: Express-session with in-memory store for user sessions
- **Authentication**: Custom implementation with bcrypt for password hashing
- **File Serving**: Vite middleware for development static file serving

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon Database serverless hosting
- **Schema Management**: Drizzle migrations for version-controlled schema changes
- **Connection**: @neondatabase/serverless for optimized serverless connections

### Security Implementation
- **Password Security**: bcryptjs for secure password hashing and validation
- **Session Security**: HTTP-only cookies with configurable expiration
- **Role-Based Access**: Hierarchical role system (admin, gerente_rrhh, admin_rrhh, supervisor, empleado_captacion, empleado)
- **Input Validation**: Zod schemas for comprehensive request validation
- **Venezuelan Context**: Cedula validation with V-/E- prefix format support

### Data Architecture
- **Employee Management**: Complete employee profiles with organizational hierarchy relationships
- **Organizational Structure**: Three-tier hierarchy (Gerencias → Departamentos → Cargos)
- **Contract System**: Multiple contract types (indefinido, determinado, obra, pasantia) with status tracking
- **User System**: Separate user accounts linked to employee records for authentication
- **Dashboard Analytics**: Aggregated statistics for HR insights and reporting

## External Dependencies

### Core Runtime Dependencies
- **React Ecosystem**: React 18 with modern hooks, React DOM, React Hook Form for forms
- **State & Data**: Zustand for state management, TanStack Query for server state
- **UI Framework**: Radix UI primitives, class-variance-authority for component variants
- **Styling**: Tailwind CSS, clsx for conditional classes, Tailwind merge utilities
- **Validation**: Zod for schema validation, hookform/resolvers for form integration
- **Authentication**: bcryptjs for password hashing
- **Utilities**: date-fns for date manipulation, lucide-react for icons

### Database & ORM
- **Database**: Neon Database (PostgreSQL) for serverless database hosting
- **ORM**: Drizzle ORM with Drizzle-Kit for migrations and schema management
- **Session Storage**: Express-session with MemoryStore for development

### Development Tools
- **Build System**: Vite for fast development and optimized production builds
- **Language**: TypeScript for type safety across frontend and backend
- **Bundling**: ESBuild for server-side bundling in production
- **Development**: TSX for TypeScript execution in development

### Replit Integration
- **Platform**: Optimized for Replit hosting environment
- **Error Handling**: @replit/vite-plugin-runtime-error-modal for development debugging
- **Cartographer**: @replit/vite-plugin-cartographer for enhanced Replit development experience
- **Configuration**: Custom Vite configuration for Replit deployment compatibility