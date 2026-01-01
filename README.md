# Holistic Divination App - Phase 1 Complete Setup

A comprehensive mystical sciences application combining **Astrology**, **Numerology**, **Tarot**, and **Palmistry**.

## 🌟 Project Overview

This repository contains both the backend API and mobile frontend for a full-stack divination application. Phase 1 establishes the complete foundation with authentication, user management, database setup, and core infrastructure.

## 📁 Project Structure

```
holistic-divination-app/
├── astrology-app-backend/     # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── config/            # Database & Firebase configuration
│   │   ├── models/            # Data models (PostgreSQL & MongoDB)
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── utils/             # JWT, validators, logger
│   │   └── server.ts          # Express server
│   ├── database/              # SQL schema files
│   ├── Dockerfile             # Docker configuration
│   └── README.md
│
├── astrology-app-mobile/      # React Native + Expo + TypeScript frontend
│   ├── src/
│   │   ├── screens/           # UI screens
│   │   ├── components/        # Reusable components
│   │   ├── services/          # API client, auth, storage
│   │   ├── redux/             # State management
│   │   ├── styles/            # Design system
│   │   └── types/             # TypeScript interfaces
│   ├── App.tsx
│   └── README.md
│
└── README.md                  # This file
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Databases**: 
  - PostgreSQL (Supabase) - Structured data
  - MongoDB Atlas - Flexible readings
- **Authentication**: JWT + OAuth (Google/Apple)
- **Storage**: Firebase Cloud Storage
- **Security**: bcrypt, helmet, CORS, rate-limiting

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State**: Redux Toolkit
- **Navigation**: React Navigation
- **API**: Axios with interceptors
- **Storage**: AsyncStorage

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL database (Supabase recommended)
- MongoDB Atlas account
- Firebase project
- Expo CLI (for mobile)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd astrology-app-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Set up databases**
```bash
# Run PostgreSQL schema
psql -h <host> -U <user> -d <database> -f database/schema.sql
```

5. **Run backend**
```bash
npm run dev
```

Backend will run on `http://localhost:3000`

### Frontend Setup

1. **Navigate to mobile directory**
```bash
cd astrology-app-mobile
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your API URL and credentials
```

4. **Run mobile app**
```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser

## 📊 Database Schema

### PostgreSQL Tables

- **users** - User accounts and authentication
- **user_profiles** - Extended user information
- **subscriptions** - Subscription management
- **palm_photos** - Palm reading photos metadata
- **preferences** - User settings

### MongoDB Collections

- **birthcharts** - Astrology birth chart data
- **readinghistory** - All reading history

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/apple` - Apple OAuth
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### User Management
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/complete-onboarding` - Complete onboarding
- `DELETE /api/users/account` - Delete account

### Preferences
- `GET /api/profile/preferences` - Get preferences
- `PUT /api/profile/preferences` - Update preferences

### Palm Reading
- `POST /api/readings/palm-photos/upload` - Upload photo
- `GET /api/readings/palm-photos` - Get photos
- `DELETE /api/readings/palm-photos/:id` - Delete photo

## 🔒 Security Features

- ✅ JWT-based authentication with refresh tokens
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ HTTP-only cookies for refresh tokens
- ✅ CORS configuration
- ✅ Rate limiting on sensitive endpoints
- ✅ Input validation with Joi
- ✅ SQL injection prevention
- ✅ XSS protection with helmet
- ✅ Data encryption for sensitive fields

## ✅ Phase 1 Acceptance Criteria

All acceptance criteria met:

- ✅ Backend Express server running on port 3000
- ✅ Frontend Expo project with navigation
- ✅ PostgreSQL database with all tables and indices
- ✅ MongoDB Atlas connection established
- ✅ JWT authentication system implemented
- ✅ OAuth scaffolding (Google/Apple)
- ✅ All API routes defined and functional
- ✅ Environment variable templates
- ✅ Input validation and error handling
- ✅ Firebase initialization and storage config
- ✅ Docker setup for backend
- ✅ Comprehensive READMEs
- ✅ Proper .gitignore files
- ✅ TypeScript best practices throughout
- ✅ Security measures implemented
- ✅ Database schemas documented
- ✅ Local development environment working

## 🎨 Design System

The mobile app features a mystical cosmic design:

- **Colors**: Deep purples, cosmic gradients, ethereal accents
- **Typography**: Clear hierarchy from 12px to 40px
- **Spacing**: Consistent 4px base scale
- **Components**: Button, Input, Card, Loading

## 🧪 Testing

### Backend
```bash
cd astrology-app-backend
npm test
```

### Frontend
```bash
cd astrology-app-mobile
npm test
```

## 🐳 Docker Deployment

### Backend
```bash
cd astrology-app-backend
docker build -t astrology-backend .
docker run -p 3000:3000 --env-file .env astrology-backend
```

## 🌐 Deployment Options

### Backend
- **Render**: Connect repo, set environment variables
- **Railway**: Connect repo, auto-deploy on push
- **Heroku**: Use Procfile for deployment

### Frontend
- **Expo**: Publish with `expo publish`
- **EAS Build**: Build native apps with `eas build`

## 📱 Mobile App Features

### Current (Phase 1)
- Welcome screen with app introduction
- User signup and login
- OAuth integration scaffolding
- Profile management
- Home dashboard
- Redux state management

### Future Phases
- Astrology birth chart calculations
- Daily horoscope
- Tarot card readings
- Numerology insights
- AI-powered palm reading
- Push notifications
- In-app subscriptions

## 🔧 Development Guidelines

1. **TypeScript**: All code properly typed
2. **Error Handling**: Use asyncHandler and try/catch
3. **Validation**: Validate all inputs
4. **Logging**: Use logger utility, not console.log
5. **Security**: Never log sensitive data
6. **Git**: Meaningful commits, descriptive messages

## 📝 Environment Variables

See `.env.example` files in both projects for required variables:

**Backend**:
- Database connections (PostgreSQL, MongoDB)
- JWT secrets
- Firebase configuration
- OAuth credentials

**Frontend**:
- API URL
- Firebase configuration
- OAuth client IDs

## 🤝 Contributing

1. Create a feature branch
2. Make changes following guidelines
3. Test thoroughly
4. Submit pull request

## 📄 License

MIT

## 🆘 Support

For issues or questions:
1. Check README files in respective directories
2. Review .env.example files
3. Create an issue in the repository

## 🎯 Next Steps (Future Phases)

- **Phase 2**: Astrology calculation engines
- **Phase 3**: Tarot card system
- **Phase 4**: Numerology algorithms
- **Phase 5**: AI palm reading analysis
- **Phase 6**: Payment integration
- **Phase 7**: Admin dashboard

---

**Note**: This is Phase 1 - Foundation complete. All subsequent features will build on this solid infrastructure.
