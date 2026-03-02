# Eventify Frontend

Welcome to the Eventify Frontend! This repository contains the React.js client application for the Eventify ecosystem, beautifully designed with Vite and Tailwind CSS.

## 🚀 Quick Start
1. **Install dependencies:** `npm install`
2. **Setup environment:** Create a `.env.local` file and add `VITE_API_BASE_URL=http://localhost:5001/api`
3. **Run development server:** `npm run dev`

## 📁 Folder Structure Guide
- `src/components/` - Houses all reusable React UI components. Grouped by domain (Auth, Billing, Dashboard).
- `src/services/` - Contains API service files for communicating with the Eventify Backend.
- `src/contexts/` - Global React contexts (e.g., AuthProvider).
- `src/assets/` - Static files like images and SVGs.

## 🔒 Security Measures
- Console logs and debuggers are scrubbed from production builds using `esbuild`.
- Uses strict route protection with `ProtectedRoute.jsx`.

## 🛠️ Tech Stack
- React 18
- Vite
- Tailwind CSS
- Recharts (for Analytics)
- React Router DOM
