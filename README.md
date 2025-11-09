# Payrun

A full-stack payroll management application built with React and Express, featuring employee management, payroll processing, and PDF generation capabilities.

## Demo

![Payrun Demo](./Demo.gif)

*See Payrun in action - employee management, payroll processing, and PDF generation*

## Demo Credential
```
email = demo@gmail.com
password = Demo@123 
```

## Project Structure

This is a monorepo containing both frontend and backend applications:

```
payrun/
├── api/                 # Backend API (Express + Prisma)
├── web/                 # Frontend application (React + Parcel)
├── package.json         # Root workspace configuration
└── README.md
```

## Tech Stack

### Frontend (web)
- **React** 19.1.0
- **React Router DOM** - Client-side routing
- **TanStack Query** - Server state management
- **Lucide React** - Icon library
- **Parcel** - Build tool and bundler
- **html2canvas + jsPDF** - PDF generation
- **React Toastify** - Notifications

### Backend (api)
- **Express** 5.1.0 - Web framework
- **Prisma** - ORM and database
- **PostgreSQL** - Database (configured via Prisma)
- **TypeScript** - Type safety
- **JWT** - Authentication
- **Zod** - Schema validation
- **Helmet** - Security middleware
- **Jest + Supertest** - Testing

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Database** (PostgreSQL)

## Backend Status (GitHub Actions)

| Workflow | Status |
|---------|--------|
| Backend Tests | ![CI](https://github.com/shashivardhan-dev/mini-payrun/actions/workflows/deploy.yml/badge.svg) |

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/shashivardhan-dev/mini-payrun.git
cd payrun
```

### 2. Install Dependencies

Install all workspace dependencies from the root:

```bash
npm install
```

This will install dependencies for both `api` and `web` workspaces.

### 3. Environment Configuration

#### Backend Environment Variables

Create a `.env` file in the `api/` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/payrun_db?pgbouncer=true"
DIRECT_URL="postgresql://user:password@localhost:5432/payrun_db"

# Server
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Database Setup

#### Initialize Prisma

```bash
# Navigate to api directory
cd api

# Generate Prisma Client
npx prisma generate

# Run migrations to create database tables
npx prisma migrate dev --name init

# (Optional) Seed the database with sample data
npx prisma db seed
```

### 5. Database Schema

![Database Schema](./api/prisma/schema.svg)

The application uses the following main entities:
- **Employee** - Employee information and records
- **Payroll** - Payroll processing records
- **Timesheets** - Employee Timesheets

For detailed schema definitions, see `api/prisma/schema.prisma`

## Running the Application

### Development Mode

#### Run Both Frontend and Backend Concurrently

From the root directory:

```bash
npm run dev
```

This starts:
- Backend API at `http://localhost:4000`
- Frontend at `http://localhost:3000`

#### Run Services Individually

**Backend only:**
```bash
npm run api:dev
```

**Frontend only:**
```bash
npm run web:dev
```

### Production Build

#### Backend

```bash
cd api
npm run build
npm start
```

#### Frontend

```bash
cd web
npm run build
# Serve the dist/ folder with your preferred static server
```

## Available Scripts

### Root Level

| Script | Description |
|--------|-------------|
| `npm run dev` | Run both frontend and backend in development mode |
| `npm run api:dev` | Run backend only |
| `npm run web:dev` | Run frontend only |
| `npm run api:test` | Run backend tests |
| `npm run api:lint` | Lint backend code |
| `npm run api:typecheck` | Type check backend code |

### Backend (`api/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production build |
| `npm test` | Run Jest tests |
| `npm run lint` | Lint code with ESLint |
| `npm run lint:fix` | Fix linting issues automatically |
| `npm run format` | Check code formatting with Prettier |
| `npm run format:fix` | Fix formatting issues |
| `npm run typecheck` | Type check without emitting files |

### Frontend (`web/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm start` | Start Parcel server |

## Testing

### Backend Tests

Run all tests:
```bash
npm run api:test
```

Run tests in watch mode:
```bash
cd api
npm test -- --watch
```

### Test Structure

Tests are located in `api/src/tests/` directories:
- **Unit tests** - Test individual functions and modules
- **Integration tests** - Test API endpoints with Supertest

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```
## Prisma Commands Reference

```bash
# Generate Prisma Client
npx prisma generate

# Create a migration
npx prisma migrate dev --name migration_name

# Seed database
npx prisma db seed
```


## Project Configuration Files

- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Code formatting rules
- `jest.config.js` - Jest testing configuration
- `nodemon.json` - Nodemon settings for hot reload
- `prisma/schema.prisma` - Database schema definition

## Code Quality

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Jest** for testing

Run quality checks before committing:

```bash
npm run api:lint
npm run api:typecheck
npm run api:test
```
