# Eventisa Admin Dashboard - Complete Setup Guide

## Prerequisites
- **Node.js LTS** (v18 or higher) - [Download here](https://nodejs.org/)

## Installation Steps

### Option 1: Automatic Setup (Recommended)

**Windows:**
\`\`\`bash
QUICK_START.bat
\`\`\`

**Mac/Linux:**
\`\`\`bash
bash QUICK_START.sh
\`\`\`

### Option 2: Manual Setup

**Step 1: Open Terminal in VS Code**
- Press `Ctrl + ` ` (backtick) to open the integrated terminal
- Or go to **Terminal → New Terminal**

**Step 2: Install Dependencies**
\`\`\`bash
npm install --legacy-peer-deps
\`\`\`
(The `--legacy-peer-deps` flag resolves the React 19 compatibility issue with the vaul package)

**Step 3: Start Development Server**
\`\`\`bash
npm run dev
\`\`\`

**Step 4: Open in Browser**
- Go to `http://localhost:3000`
- You should see the Eventisa Admin Dashboard

---

## Dashboard Pages

Once the dashboard loads, you can navigate to:

1. **Dashboard** - Overview with KPIs and charts
2. **Bookings** - View and manage all event bookings
3. **Calendar** - Interactive event calendar
4. **Events** - Manage events and ticket sales
5. **Financial** - Revenue and expense tracking
6. **Invoices** - Invoice management and downloads
7. **Settings** - Configure dashboard preferences

---

## Troubleshooting

### Problem: "npm is not recognized..."
**Solution:** Node.js is not installed. Download and install from https://nodejs.org/

### Problem: Port 3000 already in use
**Solution:** Run with a different port:
\`\`\`bash
npm run dev -- -p 3001
\`\`\`
Then open http://localhost:3001

### Problem: Module not found errors
**Solution:** Delete and reinstall:
\`\`\`bash
rm -r node_modules package-lock.json
npm install --legacy-peer-deps
\`\`\`

### Problem: Tailwind CSS not loading
**Solution:** Restart the dev server (Ctrl + C, then `npm run dev`)

---

## Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

---

## Need Help?

- Check the console for error messages (F12 → Console tab)
- Restart VS Code completely
- Try the manual setup steps from Option 2

Enjoy your Eventisa Admin Dashboard! 🚀
