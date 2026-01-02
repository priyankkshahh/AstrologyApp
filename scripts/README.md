# Deployment Scripts

This directory contains deployment scripts for the Holistic Divination App.

## Scripts

### Backend Deployment
**File:** `deploy/backend-deploy.sh`

Deploys the backend API to production using Docker and Railway.

**Usage:**
```bash
./scripts/deploy/backend-deploy.sh
```

**Environment Variables:**
- `REGISTRY` - Container registry (default: ghcr.io)
- `TAG` - Docker image tag (default: latest)
- `SKIP_BACKUP` - Skip database backup (default: false)
- `NODE_ENV` - Environment (development, staging, production)

**Features:**
- Automated database backup
- Health checks
- Rollback on failure
- Docker container management
- Cleanup of old images

### Frontend Deployment
**File:** `deploy/frontend-deploy.sh`

Deploys the frontend (web and mobile) to production.

**Usage:**
```bash
# Deploy all platforms
./scripts/deploy/frontend-deploy.sh

# Deploy web only
./scripts/deploy/frontend-deploy.sh --platform web

# Deploy mobile only
./scripts/deploy/frontend-deploy.sh --platform mobile

# Deploy to staging
./scripts/deploy/frontend-deploy.sh --env staging

# Submit to app stores
./scripts/deploy/frontend-deploy.sh --submit-to-stores true
```

**Environment Variables:**
- `PLATFORM` - Target platform (all, web, ios, android)
- `ENV` - Target environment (production, staging)
- `SKIP_TESTS` - Skip running tests (default: false)
- `SUBMIT_TO_STORES` - Submit to app stores (default: false)
- `EXPO_TOKEN` - Expo authentication token

**Features:**
- Web deployment to Vercel
- Mobile app building with EAS
- App store submission (iOS/Android)
- Health checks
- Bundle size analysis

## Prerequisites

### Backend Deployment
- Docker installed
- Railway CLI installed: `npm install -g @railway/cli`
- PostgreSQL client installed
- MongoDB tools (for backups)
- Environment variables configured

### Frontend Deployment
- Node.js 18+
- Expo EAS CLI: `npm install -g eas-cli`
- Vercel CLI: `npm install -g vercel`
- Expo account configured
- Environment variables configured

## Manual Deployment vs CI/CD

### CI/CD (Recommended)
Most deployments should use the automated GitHub Actions workflows:
- Backend: `.github/workflows/backend-ci.yml`
- Frontend: `.github/workflows/frontend-ci.yml`

Benefits:
- Automated testing
- Code coverage reporting
- Security scanning
- Zero-touch deployment
- Rollback capabilities

### Manual Deployment
Use manual deployment scripts when:
- CI/CD pipeline is down
- Emergency hotfixes
- Testing deployment locally before CI/CD
- Custom deployment scenarios

## Troubleshooting

### Backend Deployment Issues

**Issue: Database connection fails**
```bash
# Check database credentials
cat astrology-app-backend/.env.production

# Test connection
psql $DATABASE_URL
```

**Issue: Docker build fails**
```bash
# Clean up Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t astrology-backend .
```

**Issue: Health check fails**
```bash
# Check health endpoint
curl https://api.astrology-app.com/health

# View logs
docker logs astrology-backend
```

### Frontend Deployment Issues

**Issue: Vercel deployment fails**
```bash
# Check Vercel CLI version
vercel --version

# Logout and login again
vercel logout
vercel login
```

**Issue: EAS build fails**
```bash
# Check Expo account
eas whoami

# Check configuration
eas build:configure

# View build logs
eas build:list
```

**Issue: App store submission fails**
```bash
# Check credentials
eas credentials:list

# Test build locally
eas build --local
```

## Rollback Procedures

### Backend Rollback
```bash
# Find previous version
railway versions

# Rollback
railway rollback <version-id>

# Verify
curl https://api.astrology-app.com/health
```

### Frontend Rollback

**Web:**
```bash
# List deployments
vercel list

# Rollback
vercel rollback <deployment-url>
```

**Mobile:**
Go to App Store Connect or Google Play Console and remove/halt the new version.

## Monitoring

After deployment, monitor:
- Health endpoint: `https://api.astrology-app.com/health`
- Sentry for errors
- Datadog for performance
- UptimeRobot for uptime

## Support

For issues or questions, refer to:
- [Deployment Runbook](../../docs/DEPLOYMENT_RUNBOOK.md)
- [Test Plan](../../docs/TEST_PLAN.md)
- GitHub Issues
