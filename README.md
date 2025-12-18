# 💼 Billing System - Professional Invoice Management

A modern, full-stack billing and invoice management system built with React, Node.js, and MongoDB Atlas.

## 🚀 Features

- **User Authentication** - Secure JWT-based login and registration
- **Company Management** - Complete business profile setup
- **Invoice Generation** - Professional bill creation with PDF export
- **Customer Management** - Store and manage customer information
- **Analytics Dashboard** - Revenue tracking and billing insights
- **Responsive Design** - Works on all devices
- **Cloud Database** - MongoDB Atlas integration for reliability

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Recharts (for analytics)
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- MongoDB Atlas (Cloud Database)
- Mongoose ODM
- JWT Authentication
- bcryptjs (Password Hashing)
- CORS enabled

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eventify-system
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up MongoDB Atlas**
   - Follow the detailed guide in `MONGODB_ATLAS_SETUP.md`
   - Update `backend/.env` with your Atlas connection string

4. **Start the application**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
billing-system/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── Auth/         # Authentication
│   │   │   ├── Dashboard/    # Analytics
│   │   │   ├── Billing/      # Invoice management
│   │   │   ├── CompanyProfile/ # Company management
│   │   │   └── Layout/       # Navigation
│   │   ├── contexts/         # React context
│   │   └── services/         # API calls
│   └── package.json
├── backend/                  # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/      # API logic
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth middleware
│   │   └── config/          # Server config
│   ├── .env                 # Environment variables
│   └── package.json
├── MONGODB_ATLAS_SETUP.md   # Database setup guide
├── PROJECT_STRUCTURE.md     # Detailed structure
└── README.md
```

## 🔧 Configuration

### MongoDB Atlas Setup
- **Cloud Database**: MongoDB Atlas (recommended)
- **Connection**: Update `MONGODB_URI` in `backend/.env`
- **Setup Guide**: Follow `MONGODB_ATLAS_SETUP.md`

### Environment Variables
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
CLIENT_ORIGIN=http://localhost:3000
```

## 📱 Key Features

- **Modern Authentication** - Clean login/signup interface
- **Dashboard Analytics** - Revenue charts and statistics
- **Invoice Management** - Professional bill creation and PDF export
- **Company Profiles** - Complete business information management
- **Customer Database** - Store and manage customer details
- **Responsive Design** - Works perfectly on all devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This is my personal project. Not for sale. 

Do no use it professionally for any use.

Not licensed or verified. 

Anyone selling or using personally will be dealt with legal actions.

## 🆘 Support

For support, create an issue in the repository or check the documentation files.

---

**Billing System** - Professional invoice management made simple! 💼



