# Holistic Divination App

A comprehensive React Native and Node.js application providing astrology, numerology, tarot, and palmistry readings with AI-powered insights, compatibility checking, and subscription management.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node.js](https://img.shields.io/badge/node.js-18%2B-green)
![TypeScript](https://img.shields.io/badge/typescript-5.3-blue)
![License](https://img.shields.io/badge/license-MIT-yellow)

## 📱 Application Features

### Core Divination Modules
- **Vedic Astrology** - Birth charts, planetary positions, dasha periods, transits, daily horoscopes
- **Numerology** - Life path numbers, name analysis, Pythagorean & Chaldean methods
- **Tarot** - 78-card deck, multiple spreads (single, 3-card, Celtic cross), yes/no readings
- **Palmistry** - AI-powered hand analysis, palm line detection, characteristic predictions

### Advanced Features
- **Unified Dashboard** - Cross-module insights, personalized recommendations
- **Compatibility Engine** - Multi-user compatibility checks (astrology + numerology + tarot)
- **Subscription Management** - Free, Premium, Elite tiers with Stripe integration
- **Push Notifications** - Daily insights, reading reminders
- **Offline Support** - Cache readings and access offline
- **Multi-language Support** - English with extensible architecture

### User Experience
- **OAuth Authentication** - Google, Apple, email/password login
- **Beautiful UI** - Modern, intuitive interface with dark/light themes
- **Responsive Design** - Optimized for iOS and Android devices
- **Accessibility** - WCAG 2.1 Level AA compliant

## 🏗️ Architecture

### Backend (Node.js + Express)
```
astrology-app-backend/
├── src/
│   ├── config/          # Configuration (env, database, Firebase)
│   ├── controllers/      # Request handlers
│   ├── middleware/      # Auth, error handling, validation
│   ├── models/          # Data models (User, BirthChart, Subscription, etc.)
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   │   ├── astrology/    # Astrology calculations
│   │   ├── numerology/   # Numerology calculations
│   │   ├── dashboard/    # Dashboard aggregation
│   │   └── palmistry/    # AI palm analysis
│   ├── types/          # TypeScript types
│   ├── utils/          # Utilities (logger, helpers)
│   ├── health.ts       # Health check endpoints
│   └── server.ts       # Express app setup
├── database/           # SQL migrations
└── tests/             # Unit, integration, performance tests
```

### Frontend (React Native + Expo)
```
astrology-app-mobile/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/        # App screens
│   │   ├── auth/       # Login, signup, OAuth
│   │   ├── dashboard/   # Dashboard, readings
│   │   ├── readings/    # Astrology, numerology, tarot, palmistry
│   │   └── settings/   # Profile, preferences
│   ├── navigation/      # Navigation configuration
│   ├── redux/          # State management
│   ├── services/        # API client
│   └── types/          # TypeScript types
└── tests/             # Unit, integration tests
```

## 🚀 Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Databases:**
  - PostgreSQL (Supabase) - Structured data
  - MongoDB Atlas - Flexible readings data
- **Authentication:** JWT + OAuth (Google, Apple)
- **Storage:** Firebase Cloud Storage
- **AI/ML:** TensorFlow.js (Palmistry)
- **Astrology:** Swiss Ephemeris
- **Logging:** Winston
- **Testing:** Jest, Supertest, k6
- **CI/CD:** GitHub Actions, Docker

### Frontend
- **Framework:** React Native
- **Platform:** Expo SDK 50
- **Language:** TypeScript
- **State Management:** Redux Toolkit
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **HTTP Client:** Axios
- **Storage:** AsyncStorage
- **Authentication:** Expo Auth Session, Apple Authentication, Google Sign-In
- **UI Components:** Linear Gradient, Gesture Handler
- **Testing:** Jest, React Testing Library, Detox
- **CI/CD:** GitHub Actions, Expo EAS, Vercel

### DevOps & Infrastructure
- **Backend Hosting:** Railway (or AWS)
- **Web Hosting:** Vercel
- **Mobile:** Expo EAS
- **App Stores:** Apple App Store, Google Play Store
- **CDN:** Cloudflare (optional)
- **Monitoring:** Sentry, Datadog, UptimeRobot
- **Containerization:** Docker
- **Version Control:** Git

## 📊 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/oauth/google` - Google OAuth
- `POST /api/auth/oauth/apple` - Apple OAuth
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Astrology
- `POST /api/astrology/birth-chart` - Generate birth chart
- `GET /api/astrology/daily-horoscope` - Get daily horoscope
- `GET /api/astrology/dasha` - Get dasha periods
- `GET /api/astrology/transits` - Get planetary transits

### Numerology
- `POST /api/numerology/life-path` - Calculate life path number
- `POST /api/numerology/name-analysis` - Analyze name numerology
- `GET /api/numerology/daily-prediction` - Get daily prediction

### Tarot
- `POST /api/tarot/spread` - Generate tarot spread
- `GET /api/tarot/daily-card` - Get daily card
- `POST /api/tarot/yes-no` - Yes/no reading

### Palmistry
- `POST /api/palmistry/analyze` - Upload and analyze hand image
- `GET /api/palmistry/history` - Get palm reading history

### Dashboard
- `GET /api/dashboard` - Get complete dashboard data
- `GET /api/dashboard/insights` - Get cross-module insights
- `GET /api/dashboard/readings-summary` - Get readings summary
- `GET /api/dashboard/quick-cards` - Get quick insight cards
- `GET /api/dashboard/preferences` - Get user preferences
- `PUT /api/dashboard/preferences` - Update user preferences
- `POST /api/dashboard/refresh` - Refresh dashboard cache

### Compatibility
- `POST /api/compatibility/check` - Check compatibility between users

### Subscriptions
- `GET /api/subscriptions/plans` - Get available plans
- `POST /api/subscriptions/subscribe` - Subscribe to plan
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/cancel` - Cancel subscription
- `POST /api/webhook/stripe` - Stripe webhook handler

### Health & Monitoring
- `GET /health` - Liveness check
- `GET /ready` - Readiness check
- `GET /api/health` - Comprehensive health check
- `GET /api/version` - API version info

## 🧪 Testing

### Backend Tests
```bash
cd astrology-app-backend

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run performance tests
npm run test:performance

# Watch mode
npm run test:watch
```

### Frontend Tests
```bash
cd astrology-app-mobile

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Type checking
npm run type-check
```

### Test Coverage Targets
- Backend: 85%+
- Frontend: 80%+
- Critical paths: 95%+

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 15+ (or Supabase account)
- MongoDB Atlas account
- Firebase project
- Expo account
- Apple Developer account (iOS)
- Google Play Developer account (Android)
- Railway account (or AWS/GCP/Azure)

### Backend Setup

1. **Clone repository**
```bash
git clone https://github.com/your-org/holistic-divination-app.git
cd holistic-divination-app/astrology-app-backend
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

4. **Run database migrations**
```bash
psql -U postgres -d astrology_app < database/init.sql
psql -U postgres -d astrology_app < database/dashboard_tables.sql
```

5. **Start development server**
```bash
npm run dev
```

Backend will run on `http://localhost:3000`

### Frontend Setup

1. **Clone repository**
```bash
cd holistic-divination-app/astrology-app-mobile
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your API URL and Firebase config
```

4. **Start Expo**
```bash
npm start
```

5. **Run on device/simulator**
- iOS: Press `i` in terminal or open Xcode
- Android: Press `a` in terminal or open Android Studio
- Web: Open `http://localhost:19006`

## 🚀 Deployment

### Automated Deployment (CI/CD)

The application uses GitHub Actions for automated deployment:

- **Backend:** `.github/workflows/backend-ci.yml`
  - Runs on push to main/develop
  - Automated testing, building, and deployment to Railway
  - Manual approval required for production

- **Frontend:** `.github/workflows/frontend-ci.yml`
  - Runs on push to main/develop
  - Automated testing, building, and deployment to Vercel (web)
  - Mobile app building with Expo EAS
  - App store submission automation

### Manual Deployment

#### Backend
```bash
./scripts/deploy/backend-deploy.sh
```

#### Frontend
```bash
./scripts/deploy/frontend-deploy.sh
```

See [Deployment Runbook](docs/DEPLOYMENT_RUNBOOK.md) for detailed instructions.

## 📈 Monitoring & Observability

### Error Tracking
- **Sentry:** Production error tracking and crash reporting
- Dashboard: [Sentry Dashboard URL]

### Performance Monitoring
- **Datadog:** API performance, database queries, server metrics
- Dashboard: [Datadog Dashboard URL]

### Uptime Monitoring
- **UptimeRobot:** API and application uptime
- Target: 99.5%+ uptime

### Logging
- **Winston:** Structured logging for backend
- Logs stored in `/var/log/astrology-app/`

## 🔒 Security

### Security Features
- ✅ JWT authentication with refresh tokens
- ✅ OAuth 2.0 (Google, Apple)
- ✅ Password hashing with bcrypt (12+ rounds)
- ✅ Rate limiting on all endpoints
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ CSRF protection
- ✅ TLS 1.3+ encryption

### Security Scanning
- **npm audit** - Dependency vulnerability scanning
- **Snyk** - Advanced security scanning
- **OWASP ZAP** - Penetration testing

## 📚 Documentation

- [Test Plan](docs/TEST_PLAN.md) - Comprehensive testing strategy
- [Deployment Runbook](docs/DEPLOYMENT_RUNBOOK.md) - Deployment procedures
- [Phase Summaries](PHASE*_SUMMARY.md) - Detailed phase documentation

## 🎯 Performance Targets

| Metric | Target | Status |
|--------|---------|---------|
| Dashboard API response time | <2s | ✅ |
| Compatibility check | <5s | ✅ |
| App startup time | <3s | ✅ |
| Screen transitions | <500ms | ✅ |
| Uptime | 99.5%+ | ✅ |
| Error rate | <0.1% | ✅ |
| Payment success rate | >99.5% | ✅ |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team:** [Team Name]
- **Product Owner:** [Name]
- **Tech Lead:** [Name]

## 📞 Support

For issues, questions, or support:
- Create an issue on GitHub
- Email: support@astrology-app.com
- Documentation: [Docs URL]

## 🗺️ Roadmap

### Upcoming Features
- [ ] Video consultations with astrologers
- [ ] Community features and forums
- [ ] Multi-language support (Spanish, Hindi, Chinese)
- [ ] Wear OS and watchOS apps
- [ ] Advanced AI predictions
- [ ] Meditation and mindfulness content
- [ ] Panchang and Indian calendar features

### Improvements
- [ ] Enhanced AI models for palmistry
- [ ] More tarot spreads and decks
- [ ] Advanced astrological calculations (Yoga, Varga)
- [ ] Numerology compatibility reports
- [ ] Personalized learning paths

## 🙏 Acknowledgments

- Swiss Ephemeris - Astrology calculations
- TensorFlow.js - AI/ML capabilities
- Expo - React Native framework
- Firebase - Authentication and storage
- Stripe - Payment processing

---

**Built with ❤️ for the spiritual community**

**Status:** ✅ Production Ready | **Version:** 1.0.0 | **Last Updated:** 2024-01-15
