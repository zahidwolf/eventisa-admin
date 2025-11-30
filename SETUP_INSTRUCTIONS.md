# Eventisa Admin Dashboard - Setup Guide

## Quick Start in VS Code

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- VS Code installed

### Step 1: Open Project in VS Code
1. Open VS Code
2. Go to **File > Open Folder**
3. Select this project folder
4. Wait for VS Code to recognize it as a Node.js project

### Step 2: Install Dependencies
Open the integrated terminal in VS Code:
- Press `Ctrl + `` (backtick) on Windows/Linux or `Cmd + `` on Mac
- Or go to **Terminal > New Terminal**

Then run:
\`\`\`bash
npm install
\`\`\`
or if you use yarn:
\`\`\`bash
yarn install
\`\`\`

**What this does:** Installs all required packages including React, Next.js, Tailwind CSS, and UI components.

### Step 3: Start Development Server
In the same terminal, run:
\`\`\`bash
npm run dev
\`\`\`

**Expected output:**
\`\`\`
> my-v0-project@0.1.0 dev
> next dev

  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
\`\`\`

### Step 4: Open in Browser
- Click the link in terminal or open: **http://localhost:3000**
- You should see the Eventisa Admin Dashboard

## Project Structure

\`\`\`
eventisa-dashboard/
├── app/
│   ├── page.tsx              # Main dashboard page
│   ├── layout.tsx            # Root layout with metadata
│   └── globals.css           # Global styles & design tokens
├── components/
│   ├── dashboard-layout.tsx  # Main dashboard container
│   ├── sidebar.tsx           # Navigation sidebar
│   ├── top-bar.tsx           # Header with settings/notifications
│   ├── pages/                # Dashboard pages
│   │   ├── dashboard.tsx     # Overview page
│   │   ├── bookings.tsx      # Bookings management
│   │   ├── calendar.tsx      # Event calendar
│   │   ├── events.tsx        # Events listing
│   │   ├── financial.tsx     # Financial dashboard
│   │   ├── invoices.tsx      # Invoices management
│   │   └── settings.tsx      # Settings page
│   └── ui/                   # shadcn UI components
├── public/                   # Static assets
└── package.json             # Dependencies & scripts

\`\`\`

## Available Pages

1. **Dashboard** - Overview with KPIs, charts, and recent activity
2. **Bookings** - Manage customer bookings with filters and actions
3. **Calendar** - Interactive calendar view of events
4. **Events** - Event management with status and capacity tracking
5. **Financial** - Revenue analytics and financial metrics
6. **Invoices** - Invoice management system
7. **Settings** - User preferences and account settings

## Key Features

✓ Responsive design (works on desktop, tablet, mobile)
✓ Dark mode by default
✓ Interactive charts and data visualization
✓ Notification system with dropdown
✓ Settings and preferences
✓ Mock data for all pages
✓ Built with React 19, Next.js 16, and Tailwind CSS v4

## Useful VS Code Extensions (Optional)

Install these extensions for better development experience:
- **ES7+ React/Redux/React-Native snippets** - dsznajder.es7-react-js-snippets
- **Tailwind CSS IntelliSense** - bradlc.vscode-tailwindcss
- **Thunder Client** or **REST Client** - for API testing

## Customization

### Change Navigation Items
Edit `components/sidebar.tsx` to modify menu items.

### Update Colors
Modify design tokens in `app/globals.css` (lines 7-62).

### Connect Real Backend API
1. Open any page component in `components/pages/`
2. Replace mock data with actual API calls
3. Update `.env.local` with your backend URL

Example API integration in a page:
\`\`\`tsx
const fetchBookings = async () => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/bookings');
  const data = await response.json();
  setBookings(data);
};
\`\`\`

## Build for Production

When ready to deploy:
\`\`\`bash
npm run build
npm start
\`\`\`

## Troubleshooting

### Port 3000 Already in Use
Run on different port:
\`\`\`bash
npm run dev -- -p 3001
\`\`\`

### Dependencies Won't Install
Clear npm cache:
\`\`\`bash
npm cache clean --force
npm install
\`\`\`

### Styles Look Wrong
Clear `.next` folder:
\`\`\`bash
rm -rf .next
npm run dev
\`\`\`

## Next Steps

1. Replace mock data with real API calls
2. Add authentication
3. Customize colors and branding
4. Connect to your backend database
5. Deploy to Vercel or your hosting platform

## Support

For issues or questions, check:
- Next.js docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

---
Happy coding with Eventisa! 🚀
