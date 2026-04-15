# 🐄 DAIRY MANAGEMENT SYSTEM - BACKEND

A complete Node.js + Express + MongoDB backend for managing dairy farming operations.

## Quick Start

### 1. Install Dependencies

```bash
cd Dairy-Backend
npm install
```

### 2. Make Sure MongoDB is Running

```bash
# On Windows, install MongoDB and run:
mongod

# Or if using MongoDB as a Windows Service:
# MongoDB should be running automatically

# Test MongoDB connection:
# Open PowerShell and type:
mongo
# or
mongosh
# You should see a connection message
```

### 3. Start the Backend

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

You should see:
```
✅ Connected to MongoDB
✅ Server running on http://localhost:5000
```

---

## Project Structure

```
Dairy-Backend/
├── server.js                    # Main server file
├── package.json                 # Dependencies
├── .gitignore                   # Git ignore
│
├── models/                      # Database schemas
│   ├── User.js                  # User schema (username, password, role)
│   ├── Farmer.js                # Farmer schema
│   ├── MilkCollection.js        # Milk collection schema
│   ├── Payment.js               # Payment schema
│   ├── Report.js                # Report schema
│   └── Scheme.js                # Scheme schema
│
└── routes/                      # API routes
    ├── auth.js                  # Signup & Login
    ├── farmers.js               # Farmers CRUD
    ├── milk.js                  # Milk collection CRUD
    ├── payments.js              # Payments CRUD
    ├── reports.js               # Reports CRUD
    └── schemes.js               # Schemes CRUD
```

---

## API Endpoints

### Authentication

#### Signup
```
POST http://localhost:5000/api/signup

Body:
{
  "username": "testuser",
  "password": "Test@123"
}

Response (201):
{
  "message": "User created successfully",
  "username": "testuser",
  "role": "user"
}
```

#### Login
```
POST http://localhost:5000/api/login

Body:
{
  "username": "testuser",
  "password": "Test@123"
}

Response (200):
{
  "username": "testuser",
  "role": "user"
}

Response (404) - User not found:
{
  "message": "User not found. Please signup first."
}

Response (401) - Wrong password:
{
  "message": "Invalid credentials"
}
```

### Farmers

#### Get All Farmers
```
GET http://localhost:5000/api/farmers
```

#### Create Farmer
```
POST http://localhost:5000/api/farmers

Body:
{
  "name": "Ramesh Patel",
  "village": "Rajkot",
  "phone": "9876543210"
}
```

#### Delete Farmer
```
DELETE http://localhost:5000/api/farmers/{id}
```

### Milk Collection

#### Get All Milk Collections
```
GET http://localhost:5000/api/milk
```

#### Create Milk Collection
```
POST http://localhost:5000/api/milk

Body:
{
  "farmer": "Ramesh Patel",
  "quantity": 50,
  "fat": 4.5,
  "rate": 25,
  "total": 1250,
  "date": "2024-04-06"
}
```

### Payments

#### Get All Payments
```
GET http://localhost:5000/api/payments
```

#### Create Payment
```
POST http://localhost:5000/api/payments

Body:
{
  "farmer": "Ramesh Patel",
  "amount": 2000,
  "status": "Pending",
  "date": "2024-04-06"
}
```

#### Update Payment Status
```
PUT http://localhost:5000/api/payments/{id}

Body:
{
  "status": "Approved"
}
```

### Reports

#### Get All Reports
```
GET http://localhost:5000/api/reports
```

#### Create Report
```
POST http://localhost:5000/api/reports

Body:
{
  "title": "Monthly Report",
  "description": "April milk collection summary"
}
```

#### Delete Report
```
DELETE http://localhost:5000/api/reports/{id}
```

### Schemes

#### Get All Schemes
```
GET http://localhost:5000/api/schemes
```

#### Create Scheme
```
POST http://localhost:5000/api/schemes

Body:
{
  "title": "Cattle Feed Support",
  "description": "Subsidized cattle feed"
}
```

#### Delete Scheme
```
DELETE http://localhost:5000/api/schemes/{id}
```

---

## Testing APIs

### Option 1: Using Browser

Open your browser and navigate to:
```
http://localhost:5000/
```

You should see:
```json
{
  "message": "Dairy Management System Backend is running"
}
```

### Option 2: Using Postman

1. **Download and Install Postman** from https://www.postman.com/downloads/
2. **Create a new request:**
   - Select method: POST
   - URL: `http://localhost:5000/api/login`
   - Go to Body tab
   - Select "raw" and "JSON"
   - Paste:
   ```json
   {
     "username": "testuser",
     "password": "Test@123"
   }
   ```
   - Click Send

### Option 3: Using PowerShell

```powershell
# Test signup
$body = @{
    username = "testuser"
    password = "Test@123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/signup" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

# Test login
Invoke-WebRequest -Uri "http://localhost:5000/api/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

### Option 4: Using curl (Command Prompt)

```cmd
# Test signup
curl -X POST http://localhost:5000/api/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"password\":\"Test@123\"}"

# Test login
curl -X POST http://localhost:5000/api/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"password\":\"Test@123\"}"
```

---

## Database Setup

### Verify MongoDB is Running

```bash
# Open PowerShell
mongosh

# You should see:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000...
# Connected to localhost:27017
# test>
```

### View Database

```bash
# In mongosh, type:
show databases

# Switch to dairyDB
use dairyDB

# View collections
show collections

# View users
db.users.find()

# View farmers
db.farmers.find()
```

---

## Frontend Integration

### 1. Update Frontend API URLs

Edit your React components to use:
```javascript
const API_URL = "http://localhost:5000"
```

### 2. Login Example

```javascript
const handleLogin = async () => {
  const response = await fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })

  const data = await response.json()

  if (data.role) {
    localStorage.setItem("role", data.role)
    localStorage.setItem("username", data.username)
    navigate("/dashboard")
  } else {
    alert(data.message)
  }
}
```

### 3. Fetch Data Example

```javascript
// Get farmers
const response = await fetch("http://localhost:5000/api/farmers")
const farmers = await response.json()
setFarmers(farmers)

// Create farmer
const response = await fetch("http://localhost:5000/api/farmers", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, village, phone })
})
```

---

## Troubleshooting

### Issue: MongoDB Connection Failed

**Error:** `connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
1. Make sure MongoDB is installed
2. Start MongoDB:
   ```bash
   mongod
   ```
3. Wait for "Listening on 27017"
4. Then start the backend

### Issue: PORT 5000 Already in Use

**Error:** `listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with the number)
taskkill /PID <PID> /F

# Then restart the server
npm run dev
```

### Issue: CORS Error in Frontend

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
The backend already has CORS enabled. Make sure:
1. Backend is running on `http://localhost:5000`
2. Frontend is running on `http://localhost:5173` (Vite default)
3. Both are running simultaneously

### Issue: "User not found. Please signup first."

**Solution:**
1. First create a user via signup API
2. Then login with those credentials

---

## Default Admin User

To create an admin user, signup with:

```
Username: astro@133790
Password: Admin@123456
```

Then manually update in MongoDB:

```bash
mongosh
use dairyDB
db.users.updateOne(
  { username: "astro@133790" },
  { $set: { role: "admin" } }
)
```

---

## Complete Testing Workflow

### 1. Start MongoDB
```bash
mongod
```

### 2. Start Backend
```bash
cd Dairy-Backend
npm install
npm run dev
```

### 3. Start Frontend (in another terminal)
```bash
cd Dairy-Frontend
npm run dev
```

### 4. Open Frontend
```
http://localhost:5173/
```

### 5. Test Flow
- Click Signup
- Create account (e.g., user123 / Pass@123)
- Login with credentials
- You should see the Dashboard
- All features should work!

---

## Environment Variables

Create a `.env` file if needed:

```
MONGODB_URI=mongodb://127.0.0.1:27017/dairyDB
PORT=5000
NODE_ENV=development
```

---

## Performance Tips

1. **Index the username field** in User collection for faster lookups
2. **Use pagination** for large data sets
3. **Add request validation** middleware
4. **Implement JWT authentication** for production
5. **Add rate limiting** to prevent abuse

---

## Production Deployment

For deploying to production:

1. **Use environment variables** for sensitive data
2. **Enable HTTPS**
3. **Use a proper database** (Atlas MongoDB or similar)
4. **Add authentication middleware**
5. **Enable CORS properly** for your domain only
6. **Add request logging**
7. **Implement error tracking** (Sentry, etc.)

---

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ORM
- **cors** - Cross-Origin Resource Sharing
- **nodemon** (dev) - Auto-reload server

---

**Backend Created Successfully! ✅**

All API endpoints are ready to connect with your React frontend.

Questions? Check the API documentation or test endpoints in Postman.
