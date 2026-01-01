# Astrology App Backend

Backend API for the Holistic Divination App - A comprehensive mystical sciences platform combining Astrology, Numerology, Tarot, and Palmistry.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Databases**: 
  - PostgreSQL (Supabase) - Structured data
  - MongoDB Atlas - Flexible readings data
- **Authentication**: JWT + OAuth (Google/Apple)
- **Storage**: Firebase Cloud Storage
- **Real-time**: Socket.io
- **Security**: bcrypt, helmet, CORS, rate-limiting

## Project Structure

```
astrology-app-backend/
├── src/
│   ├── config/         # Database & Firebase configuration
│   ├── models/         # Data models
│   ├── controllers/    # Request handlers
│   ├── routes/         # API routes
│   ├── middleware/     # Authentication, validation, error handling
│   ├── utils/          # Helper functions
│   ├── types/          # TypeScript interfaces
│   └── server.ts       # Express app initialization
├── database/           # SQL schema files
├── logs/              # Application logs
├── .env.example       # Environment variables template
├── package.json
├── tsconfig.json
└── Dockerfile
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL database (Supabase recommended)
- MongoDB Atlas account
- Firebase project

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd astrology-app-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:
- PostgreSQL connection string (Supabase)
- MongoDB Atlas URI
- JWT secrets
- Firebase configuration
- OAuth credentials (Google/Apple)

4. **Initialize databases**

For PostgreSQL:
```bash
# Connect to your PostgreSQL database
psql -h <host> -U <user> -d <database>

# Run the schema
\i database/schema.sql
```

For MongoDB:
- Collections will be created automatically on first use
- Ensure your MongoDB Atlas cluster is running

5. **Set up Firebase**
- Download your Firebase Admin SDK JSON file
- Place it in a secure location
- Update `FIREBASE_ADMIN_SDK_JSON` in `.env` with the path

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Testing
```bash
npm test
npm run test:watch
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## API Endpoints

### Health Check
- `GET /api/health` - API status check

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth sign-in
- `POST /api/auth/apple` - Apple OAuth sign-in
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/complete-onboarding` - Mark onboarding complete
- `DELETE /api/users/account` - Delete user account

### Preferences
- `GET /api/profile/preferences` - Get user preferences
- `PUT /api/profile/preferences` - Update preferences

### Palm Reading
- `POST /api/readings/palm-photos/upload` - Upload palm photo
- `GET /api/readings/palm-photos` - Get user's palm photos
- `DELETE /api/readings/palm-photos/:id` - Delete palm photo
- `GET /api/readings/palm-photos/:id/status` - Get processing status

## Authentication

The API uses JWT-based authentication with refresh tokens:

1. **Access Token**: Short-lived (15 minutes), sent in Authorization header
2. **Refresh Token**: Long-lived (7 days), stored in HTTP-only cookie

### Making Authenticated Requests

Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Token Refresh Flow

When access token expires:
1. Call `POST /api/auth/refresh` (refresh token sent automatically via cookie)
2. Receive new access token
3. Retry original request with new token

## Database Schema

### PostgreSQL Tables
- `users` - User accounts and authentication
- `user_profiles` - Extended user information
- `subscriptions` - Subscription management
- `palm_photos` - Palm reading photo metadata
- `preferences` - User preferences and settings

### MongoDB Collections
- `birthcharts` - Astrology birth chart data
- `readinghistory` - All reading history (flexible schema)

## Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT token-based authentication
- HTTP-only cookies for refresh tokens
- CORS configuration
- Rate limiting on sensitive endpoints
- Input validation with Joi
- SQL injection prevention (parameterized queries)
- XSS protection with helmet
- Data encryption for sensitive fields

## Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "error": "Error message",
  "stack": "Stack trace (development only)"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Logging

Logs are stored in the `logs/` directory:
- `app.log` - All logs
- `error.log` - Error logs only

In development, logs are also printed to console with colors.

## Docker Deployment

Build the Docker image:
```bash
docker build -t astrology-app-backend .
```

Run the container:
```bash
docker run -p 3000:3000 --env-file .env astrology-app-backend
```

## Deployment Platforms

### Render
1. Create new Web Service
2. Connect repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables from `.env.example`

### Railway
1. Create new project
2. Connect repository
3. Add environment variables
4. Deploy automatically on push

## Environment Variables

See `.env.example` for all required environment variables.

Critical variables:
- `DATABASE_URL` - PostgreSQL connection string
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret for signing access tokens
- `REFRESH_TOKEN_SECRET` - Secret for signing refresh tokens
- `FIREBASE_*` - Firebase configuration

## Development Guidelines

1. **TypeScript**: All code must be properly typed
2. **Error Handling**: Use `asyncHandler` for async routes
3. **Validation**: Validate all inputs with Joi schemas
4. **Logging**: Use the logger utility, not console.log
5. **Database**: Always use parameterized queries
6. **Security**: Never log sensitive data (passwords, tokens)

## Future Enhancements (Subsequent Phases)

- Astrology calculation engines
- Numerology algorithms
- Tarot card reading logic
- AI-powered palm reading analysis
- Real-time notifications with Socket.io
- Subscription payment integration
- Email service integration
- Admin dashboard

## Support

For issues or questions, please create an issue in the repository.

## License

MIT
