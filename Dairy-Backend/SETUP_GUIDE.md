# DAIRY MANAGEMENT BACKEND - SETUP GUIDE

Complete step-by-step guide to install, configure, and run the backend.

---

## STEP 1: Monitor MongoDB

### Windows

**Option A: Using Windows Services (If installed as service)**

MongoDB should be automatically running. Check:
1. Open Services (Win+R → services.msc)
2. Look for "MongoDB"
3. Should show "Running"

**Option B: Manual Start**

```bash
# Open PowerShell as Administrator

# Navigate to MongoDB bin directory
cd "C:\Program Files\MongoDB\Server\7.0\bin"

# Start MongoDB
.\mongod.exe

# You should see:
# {"t":{"$date":"2024-01-15T10:30:00.000Z"},"s":"I", "msg":"Listening on 127.0.0.1:27017"}
```

**Option C: Using MongoDB compass (GUI)**

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. You should see connection successful

### Verify Connection

```bash
# Open another PowerShell
mongosh

# Should show:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000...
# Connected to localhost:27017
```

---

## STEP 2: Install Node.js (if not installed)

### Check if Node.js is installed

```bash
node --version
npm --version
```

If both show versions, skip to STEP 3.

### Install Node.js

1. Download from https://nodejs.org/
2. Choose LTS version (recommended)
3. Run the installer
4. Check installation:

```bash
node --version
npm --version
```

---

## STEP 3: Install Backend Dependencies

```bash
# Navigate to backend folder
cd "c:\Users\rachi\OneDrive\Desktop\AWT Project\Dairy-Backend"

# Install dependencies
npm install
```

**Expected output:**
```
added X packages, audited Y packages in Zs
```

**If you get errors:**
1. Delete `node_modules` folder
2. Delete `package-lock.json` file
3. Run `npm install` again

---

## STEP 4: Verify Backend Structure

Check these files exist:

```
Dairy-Backend/
✅ server.js
✅ package.json
✅ README.md
✅ models/
   ✅ User.js
   ✅ Farmer.js
   ✅ MilkCollection.js
   ✅ Payment.js
   ✅ Report.js
   ✅ Scheme.js
✅ routes/
   ✅ auth.js
   ✅ farmers.js
   ✅ milk.js
   ✅ payments.js
   ✅ reports.js
   ✅ schemes.js
```

---

## STEP 5: Start the Backend

### Terminal 1: Start MongoDB

```bash
# If mongod is not already running
mongod
```

Wait until you see:
```
Listening on 127.0.0.1:27017
```

### Terminal 2: Start Backend Server

```bash
cd "c:\Users\rachi\OneDrive\Desktop\AWT Project\Dairy-Backend"

# Install dependencies (first time only)
npm install

# Start in development mode with auto-reload
npm run dev
```

**Expected output:**
```
╔════════════════════════════════════════════════════════════╗
║          🐄 DAIRY MANAGEMENT SYSTEM BACKEND 🐄            ║
║                                                            ║
║  ✅ Server running on http://localhost:5000               ║
║  ✅ MongoDB connected to mongodb://127.0.0.1:27017/dairyDB║
║                                                            ║
║  API Endpoints: (shows all endpoints)                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## STEP 6: Test Backend (Option A - Browser)

1. Open browser
2. Go to: `http://localhost:5000/`
3. Should see:

```json
{
  "message": "Dairy Management System Backend is running"
}
```

✅ **Backend is working!**

---

## STEP 7: Test Backend (Option B - Postman)

### 1. Download Postman
- Go to https://www.postman.com/downloads/
- Download for Windows
- Install and run

### 2. Create Signup Request

```
Method:  POST
URL:     http://localhost:5000/api/signup
Header:  Content-Type: application/json
Body (raw):
{
  "username": "testuser123",
  "password": "Test@123456"
}
```

Click **Send**

Expected response:
```json
{
  "message": "User created successfully",
  "username": "testuser123",
  "role": "user"
}
```

### 3. Create Login Request

```
Method:  POST
URL:     http://localhost:5000/api/login
Header:  Content-Type: application/json
Body (raw):
{
  "username": "testuser123",
  "password": "Test@123456"
}
```

Click **Send**

Expected response:
```json
{
  "username": "testuser123",
  "role": "user"
}
```

---

## STEP 8: Test Backend (Option C - PowerShell)

```powershell
# Test signup
$body = @{
    username = "testuser123"
    password = "Test@123456"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/signup" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

# Should show Status: 201

# Test login
Invoke-WebRequest -Uri "http://localhost:5000/api/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

# Should show Status: 200
```

---

## STEP 9: Create Sample Data

### Using Postman

Create Farmer:
```
POST: http://localhost:5000/api/farmers
{
  "name": "Ramesh Patel",
  "village": "Rajkot",
  "phone": "9876543210"
}
```

Create Milk Collection:
```
POST: http://localhost:5000/api/milk
{
  "farmer": "Ramesh Patel",
  "quantity": 50,
  "fat": 4.5,
  "rate": 25,
  "total": 1250,
  "date": "2024-04-06"
}
```

Get Farmers:
```
GET: http://localhost:5000/api/farmers
```

Get Milk Collections:
```
GET: http://localhost:5000/api/milk
```

---

## STEP 10: Verify MongoDB Data

```bash
# Open PowerShell
mongosh

# List databases
show databases

# Use dairyDB
use dairyDB

# List collections
show collections

# View all users
db.users.find()

# View all farmers
db.farmers.find()

# View all milk collections
db.milkcollections.find()

# Exit
exit
```

---

## STEP 11: Start Frontend (Terminal 3)

```bash
cd "c:\Users\rachi\OneDrive\Desktop\AWT Project\Dairy-Frontend"

# Install dependencies (first time only)
npm install

# Start frontend
npm run dev
```

Expected output:
```
VITE v8.0.0  ready in 123 ms

➜  Local:   http://localhost:5173/
```

---

## STEP 12: Test Complete System

1. **Open browser** to `http://localhost:5173/`
2. **Click Signup**
   - Username: testuser123
   - Password: Test@123456
   - Click Submit
3. **Click Login**
   - Username: testuser123
   - Password: Test@123456
   - Should see Dashboard
4. **Test Features**
   - Create Farmer
   - Create Milk Collection
   - View Payments
   - etc.

---

## Running Commands Reference

```bash
# Backend folder
cd Dairy-Backend

# Install dependencies
npm install

# Start development (with auto-reload)
npm run dev

# Start production
npm start

# Frontend folder
cd Dairy-Frontend

# Install dependencies
npm install

# Start development
npm run dev

# Build production
npm run build

# MongoDB
mongod          # Start MongoDB
mongosh         # Connect to MongoDB
```

---

## Quick Terminal Setup (All at Once)

**Terminal 1 - MongoDB:**
```bash
mongod
```

**Terminal 2 - Backend:**
```bash
cd "c:\Users\rachi\OneDrive\Desktop\AWT Project\Dairy-Backend"
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd "c:\Users\rachi\OneDrive\Desktop\AWT Project\Dairy-Frontend"
npm run dev
```

---

## Common Issues & Solutions

### Issue 1: MongoDB Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Make sure `mongod` is running in another terminal
- Run: `mongod`
- Wait for "Listening on 127.0.0.1:27017"

### Issue 2: Port 5000 Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with shown number)
taskkill /PID <PID> /F

# Then restart
npm run dev
```

### Issue 3: npm install Fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete old files
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force

# Reinstall
npm install
```

### Issue 4: "Cannot find module"

**Solution:**
```bash
# Make sure you're in correct folder
cd Dairy-Backend

# Reinstall dependencies
npm install

# Delete .env if it exists
Remove-Item .env -Force

# Try again
npm run dev
```

### Issue 5: CORS Error (when connecting frontend to backend)

**Solution:**
- Backend already has CORS enabled
- Make sure both are running:
  - Backend: http://localhost:5000
  - Frontend: http://localhost:5173

---

## Database Reset

To clear all data and start fresh:

```bash
mongosh

use dairyDB

# Delete all collections
db.users.deleteMany({})
db.farmers.deleteMany({})
db.milkcollections.deleteMany({})
db.payments.deleteMany({})
db.reports.deleteMany({})
db.schemes.deleteMany({})

# Verify all empty
db.users.find()
db.farmers.find()

exit
```

---

## Files Created

- ✅ `server.js` - Main server with Express setup
- ✅ `package.json` - Dependencies configuration
- ✅ `.gitignore` - Git ignore file
- ✅ `models/User.js` - User schema
- ✅ `models/Farmer.js` - Farmer schema
- ✅ `models/MilkCollection.js` - Milk collection schema
- ✅ `models/Payment.js` - Payment schema
- ✅ `models/Report.js` - Report schema
- ✅ `models/Scheme.js` - Scheme schema
- ✅ `routes/auth.js` - Authentication routes
- ✅ `routes/farmers.js` - Farmers routes
- ✅ `routes/milk.js` - Milk collection routes
- ✅ `routes/payments.js` - Payments routes
- ✅ `routes/reports.js` - Reports routes
- ✅ `routes/schemes.js` - Schemes routes
- ✅ `README.md` - Complete documentation

---

## Next Steps

1. ✅ Backend Setup Complete
2. ✅ Start MongoDB, Backend, and Frontend
3. ✅ Test signup and login
4. ✅ Create sample data
5. ✅ Test all features

**Everything is ready to use!** 🚀

---

## Support

For any issues:

1. Check MongoDB is running
2. Check port 5000 is not in use
3. Check all npm dependencies installed
4. Check frontend and backend both running
5. Check browser console for errors
6. Check backend terminal for error messages

Questions? Refer to README.md for complete API documentation.
