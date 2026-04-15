# DAIRY MANAGEMENT BACKEND - API TESTING GUIDE

Complete testing guide with examples for all API endpoints.

---

## Environment Setup

Before testing, make sure:
- ✅ MongoDB is running on `mongodb://127.0.0.1:27017`
- ✅ Backend is running on `http://localhost:5000`
- ✅ You have Postman or similar API client installed

---

## TEST SUITE 1: AUTHENTICATION APIs

### 1.1 Signup - Create New User

**Request:**
```
POST http://localhost:5000/api/signup
Content-Type: application/json

{
  "username": "farmer1",
  "password": "Pass@123456"
}
```

**Expected Response (201):**
```json
{
  "message": "User created successfully",
  "username": "farmer1",
  "role": "user"
}
```

**Test Cases:**
- ✅ Valid username and password
- ❌ Missing username
- ❌ Missing password
- ❌ Duplicate username (should fail)
- ❌ Empty string username

---

### 1.2 Signup - Duplicate User Prevention

**Request:**
```
POST http://localhost:5000/api/signup
Content-Type: application/json

{
  "username": "farmer1",
  "password": "Pass@123456"
}
```

**Expected Response (400):**
```json
{
  "message": "Username already exists"
}
```

---

### 1.3 Login - Valid Credentials

**Request:**
```
POST http://localhost:5000/api/login
Content-Type: application/json

{
  "username": "farmer1",
  "password": "Pass@123456"
}
```

**Expected Response (200):**
```json
{
  "username": "farmer1",
  "role": "user"
}
```

**Note:** Save this response! Frontend uses it to set localStorage.

---

### 1.4 Login - User Not Found

**Request:**
```
POST http://localhost:5000/api/login
Content-Type: application/json

{
  "username": "nonexistent",
  "password": "Pass@123456"
}
```

**Expected Response (404):**
```json
{
  "message": "User not found. Please signup first."
}
```

---

### 1.5 Login - Wrong Password

**Request:**
```
POST http://localhost:5000/api/login
Content-Type: application/json

{
  "username": "farmer1",
  "password": "WrongPassword"
}
```

**Expected Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

## TEST SUITE 2: FARMERS APIs

### 2.1 Get All Farmers

**Request:**
```
GET http://localhost:5000/api/farmers
```

**Expected Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Ramesh Patel",
    "village": "Rajkot",
    "phone": "9876543210",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Suresh Sharma",
    "village": "Ahmedabad",
    "phone": "9123456789",
    "createdAt": "2024-01-15T11:00:00.000Z"
  }
]
```

If no farmers exist:
```json
[]
```

---

### 2.2 Create Farmer

**Request:**
```
POST http://localhost:5000/api/farmers
Content-Type: application/json

{
  "name": "Rajesh Kumar",
  "village": "Surat",
  "phone": "9988776655"
}
```

**Expected Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "Rajesh Kumar",
  "village": "Surat",
  "phone": "9988776655",
  "createdAt": "2024-01-15T12:15:00.000Z",
  "__v": 0
}
```

**Save the `_id`** for later use in DELETE operations.

---

### 2.3 Delete Farmer

**Request:**
```
DELETE http://localhost:5000/api/farmers/507f1f77bcf86cd799439013
```

**Expected Response (200):**
```json
{
  "message": "Farmer deleted",
  "farmer": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Rajesh Kumar",
    "village": "Surat",
    "phone": "9988776655",
    "createdAt": "2024-01-15T12:15:00.000Z"
  }
}
```

---

### 2.4 Delete Non-existent Farmer

**Request:**
```
DELETE http://localhost:5000/api/farmers/invalidid123
```

**Expected Response (404):**
```json
{
  "message": "Farmer not found"
}
```

---

## TEST SUITE 3: MILK COLLECTION APIs

### 3.1 Get All Milk Collections

**Request:**
```
GET http://localhost:5000/api/milk
```

**Expected Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "farmer": "Ramesh Patel",
    "quantity": 45,
    "fat": 4.2,
    "rate": 25,
    "total": 1125,
    "date": "2024-01-15",
    "createdAt": "2024-01-15T09:00:00.000Z"
  }
]
```

Collections are sorted by newest first (createdAt: -1).

---

### 3.2 Create Milk Collection

**Request:**
```
POST http://localhost:5000/api/milk
Content-Type: application/json

{
  "farmer": "Ramesh Patel",
  "quantity": 50,
  "fat": 4.5,
  "rate": 25,
  "total": 1250,
  "date": "2024-01-15"
}
```

**Expected Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439021",
  "farmer": "Ramesh Patel",
  "quantity": 50,
  "fat": 4.5,
  "rate": 25,
  "total": 1250,
  "date": "2024-01-15",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "__v": 0
}
```

---

### 3.3 Milk Collection - Missing Required Fields

**Request:**
```
POST http://localhost:5000/api/milk
Content-Type: application/json

{
  "farmer": "Ramesh Patel",
  "quantity": 50
}
```

**Expected Response (400):**
```json
{
  "message": "Required fields missing"
}
```

---

## TEST SUITE 4: PAYMENTS APIs

### 4.1 Get All Payments

**Request:**
```
GET http://localhost:5000/api/payments
```

**Expected Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439030",
    "farmer": "Ramesh Patel",
    "amount": 2500,
    "status": "Pending",
    "date": "2024-01-15",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

---

### 4.2 Create Payment

**Request:**
```
POST http://localhost:5000/api/payments
Content-Type: application/json

{
  "farmer": "Ramesh Patel",
  "amount": 2500,
  "status": "Pending",
  "date": "2024-01-15"
}
```

**Expected Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439031",
  "farmer": "Ramesh Patel",
  "amount": 2500,
  "status": "Pending",
  "date": "2024-01-15",
  "createdAt": "2024-01-15T11:00:00.000Z",
  "__v": 0
}
```

---

### 4.3 Update Payment Status

**Request:**
```
PUT http://localhost:5000/api/payments/507f1f77bcf86cd799439031
Content-Type: application/json

{
  "status": "Approved"
}
```

**Expected Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439031",
  "farmer": "Ramesh Patel",
  "amount": 2500,
  "status": "Approved",
  "date": "2024-01-15",
  "createdAt": "2024-01-15T11:00:00.000Z",
  "__v": 0
}
```

---

### 4.4 Update Payment - Missing Status

**Request:**
```
PUT http://localhost:5000/api/payments/507f1f77bcf86cd799439031
Content-Type: application/json

{}
```

**Expected Response (400):**
```json
{
  "message": "Status required"
}
```

---

## TEST SUITE 5: REPORTS APIs

### 5.1 Get All Reports

**Request:**
```
GET http://localhost:5000/api/reports
```

**Expected Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439040",
    "title": "Monthly Milk Collection",
    "description": "Total milk collected: 1500 liters",
    "date": "2024-01-15",
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
]
```

---

### 5.2 Create Report

**Request:**
```
POST http://localhost:5000/api/reports
Content-Type: application/json

{
  "title": "January Summary",
  "description": "Complete monthly statistics"
}
```

**Expected Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439041",
  "title": "January Summary",
  "description": "Complete monthly statistics",
  "date": "1/15/2024",
  "createdAt": "2024-01-15T13:00:00.000Z",
  "__v": 0
}
```

---

### 5.3 Delete Report

**Request:**
```
DELETE http://localhost:5000/api/reports/507f1f77bcf86cd799439041
```

**Expected Response (200):**
```json
{
  "message": "Report deleted",
  "report": {
    "_id": "507f1f77bcf86cd799439041",
    "title": "January Summary",
    "description": "Complete monthly statistics",
    "date": "1/15/2024",
    "createdAt": "2024-01-15T13:00:00.000Z"
  }
}
```

---

## TEST SUITE 6: SCHEMES APIs

### 6.1 Get All Schemes

**Request:**
```
GET http://localhost:5000/api/schemes
```

**Expected Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439050",
    "title": "Cattle Feed Subsidy",
    "description": "Government provides 50% subsidy on cattle feed",
    "createdAt": "2024-01-15T08:00:00.000Z"
  }
]
```

---

### 6.2 Create Scheme

**Request:**
```
POST http://localhost:5000/api/schemes
Content-Type: application/json

{
  "title": "Dairy Growth Fund",
  "description": "Interest-free loan for dairy expansion"
}
```

**Expected Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439051",
  "title": "Dairy Growth Fund",
  "description": "Interest-free loan for dairy expansion",
  "createdAt": "2024-01-15T14:00:00.000Z",
  "__v": 0
}
```

---

### 6.3 Delete Scheme

**Request:**
```
DELETE http://localhost:5000/api/schemes/507f1f77bcf86cd799439051
```

**Expected Response (200):**
```json
{
  "message": "Scheme deleted",
  "scheme": {
    "_id": "507f1f77bcf86cd799439051",
    "title": "Dairy Growth Fund",
    "description": "Interest-free loan for dairy expansion",
    "createdAt": "2024-01-15T14:00:00.000Z"
  }
}
```

---

## TEST SUITE 7: ERROR HANDLING

### 7.1 Invalid Route

**Request:**
```
GET http://localhost:5000/api/invalid-route
```

**Expected Response (404):**
```json
{
  "message": "Route not found"
}
```

---

### 7.2 MongoDB Connection Error

**Scenario:** Stop MongoDB while backend is running

**Request (any):**
```
GET http://localhost:5000/api/farmers
```

**Expected Response (500):**
```json
{
  "message": "Something went wrong."
}
```

---

## POSTMAN COLLECTION TEMPLATE

Import this into Postman as a collection:

```json
{
  "info": {
    "name": "Dairy Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Signup",
      "request": {
        "method": "POST",
        "url": "{{url}}/api/signup",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"farmer1\",\n  \"password\": \"Pass@123456\"\n}"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{url}}/api/login",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"farmer1\",\n  \"password\": \"Pass@123456\"\n}"
        }
      }
    },
    {
      "name": "Get Farmers",
      "request": {
        "method": "GET",
        "url": "{{url}}/api/farmers"
      }
    },
    {
      "name": "Create Farmer",
      "request": {
        "method": "POST",
        "url": "{{url}}/api/farmers",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Ramesh Patel\",\n  \"village\": \"Rajkot\",\n  \"phone\": \"9876543210\"\n}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "url",
      "value": "http://localhost:5000"
    }
  ]
}
```

---

## MANUAL TESTING SCRIPT

Run these commands in PowerShell to test all endpoints:

```powershell
$url = "http://localhost:5000"

# Signup
$signup = @{
    username = "farmer1"
    password = "Pass@123456"
} | ConvertTo-Json

Invoke-WebRequest -Uri "$url/api/signup" -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $signup

# Login
Invoke-WebRequest -Uri "$url/api/login" -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $signup

# Create Farmer
$farmer = @{
    name = "Ramesh Patel"
    village = "Rajkot"
    phone = "9876543210"
} | ConvertTo-Json

Invoke-WebRequest -Uri "$url/api/farmers" -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $farmer

# Get Farmers
Invoke-WebRequest -Uri "$url/api/farmers" -Method GET
```

---

## Checklist for Complete Testing

- [ ] MongoDB running and connected
- [ ] Backend running on port 5000
- [ ] Signup creates user successfully
- [ ] Login returns correct role
- [ ] Can create farmer
- [ ] Can get all farmers
- [ ] Can delete farmer
- [ ] Can create milk collection
- [ ] Can get all milk collections
- [ ] Can create payment
- [ ] Can update payment status
- [ ] Can create report
- [ ] Can delete report
- [ ] Can create scheme
- [ ] Can delete scheme
- [ ] Invalid routes return 404
- [ ] Wrong passwords return proper error

---

## Performance Testing

### Load Testing Example

```bash
# Using Apache Bench (if installed)
ab -n 100 -c 10 http://localhost:5000/api/farmers
```

### Expected Performance
- Response time: < 50ms (typical)
- Throughput: > 100 requests/second
- Database queries: < 20ms

---

## Integration Testing with Frontend

Once APIs are verified, test with frontend:

1. Open `http://localhost:5173/`
2. Click "Signup"
3. Enter credentials
4. Click "Login"
5. Verify dashboard loads
6. Test all features

---

**All tests passed? Your backend is production-ready!** ✅

For any failed tests, check `server.js` console for error messages.
