#!/bin/bash

echo "🚀 Eventisa Admin Dashboard - Quick Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed!"
    echo "📥 Download from: https://nodejs.org/ (LTS version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies with legacy peer deps flag
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🎉 Setup complete! To start the dashboard:"
    echo "   npm run dev"
    echo ""
    echo "📱 Your dashboard will be available at:"
    echo "   http://localhost:3000"
else
    echo "❌ Installation failed. Please try again."
    exit 1
fi
