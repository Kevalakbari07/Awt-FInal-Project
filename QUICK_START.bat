@echo off
REM Dairy Management System - Quick Start Script
REM This batch script helps you start all services

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║      🐄 DAIRY MANAGEMENT SYSTEM - QUICK START 🐄          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo Please follow these steps to start the system:
echo.
echo STEP 1: Open PowerShell Terminal 1 and run:
echo   mongod
echo.
echo STEP 2: Open PowerShell Terminal 2 and run:
echo   cd "c:\Users\rachi\OneDrive\Desktop\AWT Project\Dairy-Backend"
echo   npm run dev
echo.
echo STEP 3: Open PowerShell Terminal 3 and run:
echo   cd "c:\Users\rachi\OneDrive\Desktop\AWT Project\Dairy-Frontend"
echo   npm run dev
echo.
echo STEP 4: Open your browser and go to:
echo   http://localhost:5173/
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║               HELPFUL COMMANDS REFERENCE                   ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║                                                            ║
echo ║ Backend Development:                                      ║
echo ║   npm run dev          (Auto-reload with nodemon)         ║
echo ║   npm start            (Production mode)                  ║
echo ║   npm install          (Install dependencies)             ║
echo ║                                                            ║
echo ║ MongoDB:                                                  ║
echo ║   mongod               (Start MongoDB)                    ║
echo ║   mongosh              (Connect to MongoDB)               ║
echo ║                                                            ║
echo ║ Frontend Development:                                     ║
echo ║   npm run dev          (Start dev server)                 ║
echo ║   npm run build        (Build for production)             ║
echo ║                                                            ║
echo ║ Ports:                                                    ║
echo ║   MongoDB:   27017 (default)                              ║
echo ║   Backend:   5000                                         ║
echo ║   Frontend:  5173                                         ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.
pause
