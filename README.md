# FinanceHub - Finance Dashboard System

A complete finance management system with role-based access control, built with Next.js, TypeScript, PostgreSQL, and Prisma.

## Features

- **Authentication**: JWT-based auth with bcrypt password hashing
- **Role-Based Access**: 3 roles (ADMIN, ANALYST, VIEWER) with proper permissions
- **Financial Records**: Full CRUD operations with filtering and pagination
- **Dashboard Analytics**: Real-time charts (Monthly trends, Category distribution)
- **User Management**: Admin can create, delete, and manage user status
- **Validation**: Zod schema validation for all inputs
- **Error Handling**: Custom error classes with proper HTTP status codes
- **Type Safety**: Full TypeScript implementation

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | Framework (API Routes + Frontend) |
| TypeScript | Type safety |
| PostgreSQL | Database |
| Prisma     | ORM      |
| JWT        | Authentication |
| bcryptjs   | Password hashing |
| Zod        | Validation |
| Tailwind CSS | Styling |
| Recharts | Charts |

## Project Structure


## Project Structure

```
finance-app/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts              # POST - User login
│   │   │   └── register/
│   │   │       └── route.ts              # POST - User registration
│   │   ├── dashboard/
│   │   │   └── analytics/
│   │   │       └── route.ts              # GET - Dashboard charts data
│   │   ├── records/
│   │   │   ├── route.ts                  # GET, POST - List & create records
│   │   │   └── [id]/
│   │   │       └── route.ts              # GET, PUT, PATCH, DELETE - Single record
│   │   ├── users/
│   │   │   ├── route.ts                  # GET, POST - List & create users (Admin)
│   │   │   └── [id]/
│   │   │       └── route.ts              # GET, PUT, DELETE - Single user (Admin)
│   │   └── health/
│   │       └── route.ts                  # GET - Health check
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── Header.tsx                # Dashboard header with logout
│   │   │   ├── KPICards.tsx              # Total Income, Expenses, Net Balance
│   │   │   ├── MonthlyTrendsChart.tsx    # Line chart for income vs expenses
│   │   │   ├── CategoryChart.tsx         # Pie chart for spending by category
│   │   │   ├── RecordsTab.tsx            # Records table with filters & CRUD
│   │   │   ├── UsersTab.tsx              # User management table (Admin only)
│   │   │   ├── AddRecordForm.tsx         # Form to add/edit records
│   │   │   └── FilterBar.tsx             # Auto-filter bar for records
│   │   ├── hooks/
│   │   │   └── useDashboardData.ts       # Custom hook for data fetching
│   │   ├── types/
│   │   │   └── index.ts                  # TypeScript interfaces
│   │   └── page.tsx                      # Main dashboard page
│   ├── layout.tsx                        # Root layout
│   └── page.tsx                          # Login/Register page
├── components/
│   └── ui/                               # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
├── lib/
│   ├── auth.ts                           # JWT & bcrypt utilities
│   ├── errors.ts                         # Custom error classes
│   ├── middleware.ts                     # Auth & role middleware
│   ├── validators.ts                     # Zod validation schemas
│   └── utils.ts                          # Helper functions (cn)
├── prisma/
│   ├── schema.prisma                     # Database schema
│   └── migrations/                       # Prisma migrations
├── public/                               # Static assets
├── .env                                  # Environment variables
├── .gitignore
├── components.json                       # shadcn/ui config
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js 18 or higher
- npm, pnpm, or yarn
- PostgreSQL database
- Environment variables configured

## Installation & Setup

### 1. Clone or Setup Project

```bash
# If using GitHub
git clone https://github.com/sujeets2330/finance-backend.git
cd finance-backend

# Install dependencies
pnpm install
# or: npm install / yarn install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/finance_db"
JWT_SECRET="your-super-secret-key-minimum-32-characters"
JWT_EXPIRES_IN="7d"
BCRYPT_ROUNDS="10"
NODE_ENV="development"

```

### 3. Set Up Database

#### Option A: Using Prisma Migrations

```bash
# Create database in PostgreSQL
createdb finance_db

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```
### 4. Start Development Server

```bash
pnpm dev
```

The API will be available at `http://localhost:3000/api`

### 5. Populate Sample Data

```bash
# Create a test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "VIEWER"  // Optional: VIEWER, ANALYST, ADMIN
}

Response: 201 Created
{
  "status": 201,
  "message": "User registered successfully",
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "VIEWER" },
    "token": "eyJhbGci..."
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "VIEWER" },
    "token": "eyJhbGci..."
  }
}
```

### Financial Records Endpoints

#### Create Financial Record
```
POST /api/records
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "type": "INCOME",
  "category": "Salary",
  "description": "Monthly salary",
  "date": "2024-01-15T00:00:00.000Z"
}

Response: 201 Created
{
  "status": 201,
  "message": "Record created successfully",
  "data": { "record": { ... } }
}

```

#### Get Financial Records (with filtering)
```
GET /api/records?type=INCOME&category=Salary&page=1&limit=10
Authorization: Bearer <token>

Response: 200 OK
{
  "status": 200,
  "message": "Records retrieved successfully",
  "data": {
    "records": [...],
    "pagination": { "page": 1, "limit": 10, "total": 15, "pages": 2 }
  }
}
```

#### Update Financial Record
```
PUT /api/records/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5500,
  "description": "Updated salary"
}

Response: 200 OK
```

#### Delete Financial Record
```
DELETE /api/records/{id}
Authorization: Bearer <token>

Response: 200 OK
{
  "status": 200,
  "message": "Record deleted successfully"
}
```

### Dashboard Endpoints

#### Get Analytics
```
GET /api/dashboard/analytics
Authorization: Bearer <token>

Response: 200 OK
{
  "status": 200,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "summary": {
      "totalIncome": 15000,
      "totalExpenses": 5000,
      "netBalance": 10000,
      "transactionCount": 25
    },
    "analytics": {
      "byCategory": [
        { "category": "Food", "amount": 2000 },
        { "category": "Transport", "amount": 1000 }
      ],
      "byMonth": [
        { "month": "2024-01", "income": 8000, "expenses": 3000 }
      ]
    }
  }
}
```

## Role-Based Access Control

### VIEWER (Default)
- Can only view their own financial records
- Can register and login
- Cannot modify other users' data

### ANALYST
- Can view all records
- Can create and modify records
- Cannot manage user roles

### ADMIN
- Full system access
- Can manage all users and records
- Can assign roles to users

## Security Best Practices

1. **Password Hashing**: All passwords are hashed using bcryptjs with 10 salt rounds
2. **JWT Tokens**: Secure JWT tokens with expiry set to 7 days
3. **Authorization**: Role-based access control enforced at API middleware level
4. **Input Validation**: All inputs validated using Zod schemas before processing
5. **SQL Injection Prevention**: Prisma ORM prevents SQL injection automatically
6. **Soft Deletes**: Records are soft-deleted for audit trail and compliance
7. **Error Handling**: Sensitive information is not exposed in error messages

## Database Schema

### User Table (Hard Delete)
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier (CUID) |
| `email` | String | User email (unique) |
| `name` | String | User full name |
| `passwordHash` | String | Bcrypt hashed password |
| `role` | Enum | VIEWER, ANALYST, ADMIN |
| `isActive` | Boolean | Account activation status |
| `lastLogin` | DateTime | Last login timestamp |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

### FinancialRecord Table (Soft Delete)
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier (CUID) |
| `userId` | String | Foreign key to User |
| `amount` | Decimal(12,2) | Precise financial amount |
| `type` | Enum | INCOME or EXPENSE |
| `category` | String | Transaction category |
| `description` | String | Transaction notes/description |
| `date` | DateTime | Transaction date |
| `status` | Enum | PENDING, COMPLETED, CANCELLED |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |
| `deletedAt` | DateTime | Soft delete timestamp (null if active) |

## Development Commands

```bash
## Development Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run linter

# Database (Prisma)
pnpm prisma generate        # Generate Prisma client
pnpm prisma studio          # Open database UI (http://localhost:5555)
pnpm prisma migrate dev --name init    # Create and apply migration
pnpm prisma migrate deploy  # Apply migrations in production
pnpm prisma db push         # Push schema changes without migration
pnpm prisma db seed         # Run seed script (if configured)

# Database Reset (Development only)
pnpm prisma migrate reset   # Reset database ( deletes all data)

# Install dependencies
pnpm install                # Install all dependencies
pnpm add <package>          # Add specific package
pnpm add -D <package>       # Add dev dependency

# Clean install
rm -rf node_modules && pnpm install
```


## Troubleshooting

### Database Connection Issues
- Verify `POSTGRES_PRISMA_URL` is correct
- Check database credentials
- Ensure database is accessible from your network

### Authentication Errors
- Ensure JWT_SECRET is set correctly
- Verify token is passed in Authorization header as `Bearer <token>`
- Check token expiry (7 days)

### Prisma Issues
```bash
# Reset database (warning: deletes all data)
pnpm prisma migrate reset

# Generate Prisma client
pnpm prisma generate

# Check migrations status
pnpm prisma migrate status
```

### Port Already in Use
```bash
# Change port
PORT=3001 pnpm dev
```

## Performance Optimization

### Database Indexes
Indexes are applied on frequently queried fields in the FinancialRecord table:

```prisma
@@index([userId])           // Filter records by user
@@index([date])             // Date range queries
@@index([type])             // Filter by INCOME/EXPENSE
@@index([status])           // Filter by PENDING/COMPLETED/CANCELLED
@@index([userId, date])     // Combined index for dashboard queries

```

## Future Enhancements

- Two-factor authentication (2FA)
- Multi-currency support
- Recurring transactions
- Budget tracking and alerts
- Export to CSV/PDF
- Mobile app integration
- Real-time notifications
- Advanced reporting and forecasting

## Developer

- **Name**: Sujeet M A
- **Email**: sujeetmalagundi999@gmail.com

---

**Built with 'HEART' for secure and reliable financial management**
