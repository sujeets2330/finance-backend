# API Examples - Complete Request & Response Guide

## Authentication Endpoints

### 1. Register New User

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": "John Doe",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!"
  }'
```

**Response (201 Created):**
```json
{
  "status": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clp4x8z9k000808jy8k9k9k9k",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "VIEWER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbHA0eDh6OWswMDA4MDhqeThrOWs5azlrIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6IlZJRVdFUiIsImlhdCI6MTY5NDcwODAwMCwiZXhwIjoxNjk1MzEyODAwfQ.x8k9k9k9k9k9k9k9k9k9k9k9k9k9k9k9k9k9k9k9k9k"
  }
}
```

**Error Response (400 - Validation Error):**
```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": {
    "password": [
      "Password must be at least 6 characters"
    ],
    "email": [
      "Invalid email address"
    ]
  }
}
```

**Error Response (409 - User Exists):**
```json
{
  "status": 409,
  "code": "CONFLICT",
  "message": "User with this email already exists"
}
```

### 2. Login User

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clp4x8z9k000808jy8k9k9k9k",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "VIEWER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbHA0eDh6OWswMDA4MDhqeThrOWs5azlrIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6IlZJRVdFUiIsImlhdCI6MTY5NDcwODAwMCwiZXhwIjoxNjk1MzEyODAwfQ.x8k9k9k9k9k9k9k9k9k9k9k9k9k9k9k9k9k9k9k9k9k"
  }
}
```

**Error Response (401 - Invalid Credentials):**
```json
{
  "status": 401,
  "code": "AUTHENTICATION_ERROR",
  "message": "Invalid email or password"
}
```

## Financial Records Endpoints

### 3. Create Financial Record (Income)

**Request:**
```bash
curl -X POST http://localhost:3000/api/records \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "type": "INCOME",
    "category": "Salary",
    "description": "Monthly salary payment from employer",
    "date": "2024-01-15T10:00:00Z",
    "status": "COMPLETED"
  }'
```

**Response (201 Created):**
```json
{
  "status": 201,
  "message": "Record created successfully",
  "data": {
    "record": {
      "id": "clp4x8z9k000808jy8k9k9k9l",
      "userId": "clp4x8z9k000808jy8k9k9k9k",
      "amount": 5000.00,
      "type": "INCOME",
      "category": "Salary",
      "description": "Monthly salary payment from employer",
      "date": "2024-01-15T10:00:00.000Z",
      "status": "COMPLETED",
      "createdAt": "2024-09-14T10:00:00.000Z",
      "updatedAt": "2024-09-14T10:00:00.000Z"
    }
  }
}
```

### 4. Create Financial Record (Expense)

**Request:**
```bash
curl -X POST http://localhost:3000/api/records \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 45.99,
    "type": "EXPENSE",
    "category": "Groceries",
    "description": "Weekly grocery shopping at supermarket",
    "date": "2024-01-14T14:30:00Z",
    "status": "COMPLETED"
  }'
```

**Response (201 Created):**
```json
{
  "status": 201,
  "message": "Record created successfully",
  "data": {
    "record": {
      "id": "clp4x8z9k000808jy8k9k9k9m",
      "userId": "clp4x8z9k000808jy8k9k9k9k",
      "amount": 45.99,
      "type": "EXPENSE",
      "category": "Groceries",
      "description": "Weekly grocery shopping at supermarket",
      "date": "2024-01-14T14:30:00.000Z",
      "status": "COMPLETED",
      "createdAt": "2024-09-14T14:30:00.000Z",
      "updatedAt": "2024-09-14T14:30:00.000Z"
    }
  }
}
```

### 5. Get All Records (with Pagination)

**Request:**
```bash
curl -X GET "http://localhost:3000/api/records?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Records retrieved successfully",
  "data": {
    "records": [
      {
        "id": "clp4x8z9k000808jy8k9k9k9l",
        "userId": "clp4x8z9k000808jy8k9k9k9k",
        "amount": 5000.00,
        "type": "INCOME",
        "category": "Salary",
        "description": "Monthly salary payment from employer",
        "date": "2024-01-15T10:00:00.000Z",
        "status": "COMPLETED",
        "createdAt": "2024-09-14T10:00:00.000Z",
        "updatedAt": "2024-09-14T10:00:00.000Z"
      },
      {
        "id": "clp4x8z9k000808jy8k9k9k9m",
        "userId": "clp4x8z9k000808jy8k9k9k9k",
        "amount": 45.99,
        "type": "EXPENSE",
        "category": "Groceries",
        "description": "Weekly grocery shopping at supermarket",
        "date": "2024-01-14T14:30:00.000Z",
        "status": "COMPLETED",
        "createdAt": "2024-09-14T14:30:00.000Z",
        "updatedAt": "2024-09-14T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "pages": 1
    }
  }
}
```

### 6. Get Records with Filters

**Request (Filter by Type and Category):**
```bash
curl -X GET "http://localhost:3000/api/records?type=INCOME&category=Salary&page=1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Request (Filter by Date Range):**
```bash
curl -X GET "http://localhost:3000/api/records?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Request (Filter by Amount Range):**
```bash
curl -X GET "http://localhost:3000/api/records?minAmount=100&maxAmount=5000&page=1&limit=5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Records retrieved successfully",
  "data": {
    "records": [
      {
        "id": "clp4x8z9k000808jy8k9k9k9l",
        "userId": "clp4x8z9k000808jy8k9k9k9k",
        "amount": 5000.00,
        "type": "INCOME",
        "category": "Salary",
        "description": "Monthly salary payment from employer",
        "date": "2024-01-15T10:00:00.000Z",
        "status": "COMPLETED"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

### 7. Get Specific Record

**Request:**
```bash
curl -X GET http://localhost:3000/api/records/clp4x8z9k000808jy8k9k9k9l \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Record retrieved successfully",
  "data": {
    "record": {
      "id": "clp4x8z9k000808jy8k9k9k9l",
      "userId": "clp4x8z9k000808jy8k9k9k9k",
      "amount": 5000.00,
      "type": "INCOME",
      "category": "Salary",
      "description": "Monthly salary payment from employer",
      "date": "2024-01-15T10:00:00.000Z",
      "status": "COMPLETED",
      "createdAt": "2024-09-14T10:00:00.000Z",
      "updatedAt": "2024-09-14T10:00:00.000Z"
    }
  }
}
```

### 8. Update Financial Record

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/records/clp4x8z9k000808jy8k9k9k9l \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5100.00,
    "status": "COMPLETED",
    "description": "Monthly salary payment - Updated"
  }'
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Record updated successfully",
  "data": {
    "record": {
      "id": "clp4x8z9k000808jy8k9k9k9l",
      "userId": "clp4x8z9k000808jy8k9k9k9k",
      "amount": 5100.00,
      "type": "INCOME",
      "category": "Salary",
      "description": "Monthly salary payment - Updated",
      "date": "2024-01-15T10:00:00.000Z",
      "status": "COMPLETED",
      "createdAt": "2024-09-14T10:00:00.000Z",
      "updatedAt": "2024-09-14T15:30:00.000Z"
    }
  }
}
```

### 9. Delete Financial Record

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/records/clp4x8z9k000808jy8k9k9k9l \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Record deleted successfully"
}
```

## Dashboard Endpoints

### 10. Get Financial Summary

**Request:**
```bash
curl -X GET http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Summary retrieved successfully",
  "data": {
    "summary": {
      "totalIncome": 15000.00,
      "totalExpenses": 350.45,
      "balance": 14649.55,
      "pendingAmount": 0.00,
      "completedRecords": 25,
      "pendingRecords": 2
    }
  }
}
```

### 11. Get Analytics

**Request:**
```bash
curl -X GET http://localhost:3000/api/dashboard/analytics \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Analytics retrieved successfully",
  "data": {
    "categoryBreakdown": [
      {
        "category": "Salary",
        "totalIncome": 10000.00,
        "totalExpense": 0.00,
        "netAmount": 10000.00,
        "recordCount": 2
      },
      {
        "category": "Groceries",
        "totalIncome": 0.00,
        "totalExpense": 145.99,
        "netAmount": -145.99,
        "recordCount": 5
      },
      {
        "category": "Utilities",
        "totalIncome": 0.00,
        "totalExpense": 120.00,
        "netAmount": -120.00,
        "recordCount": 3
      }
    ],
    "monthlyBreakdown": [
      {
        "month": "2024-01",
        "income": 5000.00,
        "expense": 265.99,
        "net": 4734.01
      },
      {
        "month": "2023-12",
        "income": 10000.00,
        "expense": 84.46,
        "net": 9915.54
      }
    ],
    "topCategories": [
      {
        "category": "Salary",
        "totalIncome": 10000.00,
        "totalExpense": 0.00,
        "netAmount": 10000.00,
        "recordCount": 2
      },
      {
        "category": "Groceries",
        "totalIncome": 0.00,
        "totalExpense": 145.99,
        "netAmount": -145.99,
        "recordCount": 5
      }
    ]
  }
}
```

## Health Check Endpoint

### 12. Health Check

**Request:**
```bash
curl -X GET http://localhost:3000/api/health
```

**Response (200 OK - Healthy):**
```json
{
  "status": 200,
  "message": "API is healthy",
  "timestamp": "2024-09-14T15:30:00.000Z",
  "data": {
    "api": "operational",
    "database": "connected",
    "version": "1.0.0"
  }
}
```

**Response (503 - Database Down):**
```json
{
  "status": 503,
  "message": "API is unavailable",
  "timestamp": "2024-09-14T15:30:00.000Z",
  "data": {
    "api": "operational",
    "database": "disconnected"
  }
}
```

## Error Response Examples

### 401 - Missing Token
```json
{
  "status": 401,
  "code": "AUTHENTICATION_ERROR",
  "message": "Missing authorization token"
}
```

### 403 - Insufficient Permissions
```json
{
  "status": 403,
  "code": "AUTHORIZATION_ERROR",
  "message": "You do not have permission to access this resource"
}
```

### 404 - Resource Not Found
```json
{
  "status": 404,
  "code": "NOT_FOUND",
  "message": "Financial record not found"
}
```

### 500 - Internal Server Error
```json
{
  "status": 500,
  "code": "INTERNAL_ERROR",
  "message": "An unexpected error occurred"
}
```

## Using in Postman

1. **Create Environment Variables:**
   - `base_url`: http://localhost:3000
   - `token`: (set after login)

2. **Set Authorization Header:**
   - Type: Bearer Token
   - Token: {{token}}

3. **URL Pattern:**
   - Use `{{base_url}}/api/...` in request URLs

4. **Pre-request Script:**
   - For login, add script to extract and save token to environment

---