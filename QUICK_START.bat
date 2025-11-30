@echo off
echo 🚀 Eventisa Admin Dashboard - Quick Setup
echo ==========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo 📥 Download from: https://nodejs.org/ (LTS version)
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ npm version:
npm --version
echo.

REM Install dependencies with legacy peer deps flag
echo 📦 Installing dependencies...
npm install --legacy-peer-deps

if errorlevel 1 (
    echo ❌ Installation failed. Please try again.
    exit /b 1
) else (
    echo ✅ Dependencies installed successfully!
    echo.
    echo 🎉 Setup complete! To start the dashboard:
    echo    npm run dev
    echo.
    echo 📱 Your dashboard will be available at:
    echo    http://localhost:3000
)
