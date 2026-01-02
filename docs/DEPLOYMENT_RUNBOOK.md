# Deployment Runbook - Holistic Divination App

## Document Information
- **Version:** 1.0
- **Date:** 2024-01-15
- **Project:** Holistic Divination App
- **Phase:** Phase 8 - Testing, QA & Production Deployment

---

## 1. Overview

### 1.1 Purpose
This runbook provides step-by-step procedures for deploying the Holistic Divination App to production environments, including backend API, web frontend, and mobile applications.

### 1.2 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Production Environment               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐      ┌──────────────┐              │
│  │   Backend    │◄────►│ PostgreSQL   │              │
│  │   (Node.js)  │      │  (Supabase)  │              │
│  └──────────────┘      └──────────────┘              │
│         ▲                      ▲                       │
│         │                      │                       │
│         │              ┌──────────────┐              │
│         └──────────────►│  MongoDB     │              │
│                        │    Atlas     │              │
│                        └──────────────┘              │
│                                                         │
│  ┌──────────────┐      ┌──────────────┐              │
│  │   Web App    │◄────►│   Firebase    │              │
│  │   (Vercel)   │      │   Storage    │              │
│  └──────────────┘      └──────────────┘              │
│                                                         │
│  ┌──────────────┐      ┌──────────────┐              │
│  │  Mobile Apps │      │  App Stores  │              │
│  │  (EAS/Expo)  │      │              │              │
│  └──────────────┘      └──────────────┘              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Environments

| Environment | Purpose | URL | Deployment Method |
|-------------|---------|-----|-------------------|
| Development | Local development | localhost:3000 | Manual |
| Staging | Pre-production testing | https://staging-api.astrology-app.com | Railway (Auto) |
| Production | Live environment | https://api.astrology-app.com | Railway (Manual approval) |

---

## 2. Pre-Deployment Checklist

### 2.1 Code Quality ✅
- [ ] All code changes merged to main branch
- [ ] All unit tests passing (85%+ coverage)
- [ ] All integration tests passing
- [ ] All E2E tests passing (critical paths)
- [ ] ESLint checks passing
- [ ] TypeScript compilation successful
- [ ] No console.log statements in production code
- [ ] No TODO/FIXME comments in critical paths

### 2.2 Security ✅
- [ ] npm audit passed (no high/critical vulnerabilities)
- [ ] Snyk security scan passed
- [ ] Environment variables secured
- [ ] No sensitive data in code
- [ ] JWT secrets rotated (if applicable)
- [ ] API keys not exposed in client code
- [ ] SSL/TLS certificates valid

### 2.3 Performance ✅
- [ ] Performance tests passing
- [ ] Dashboard API response time <2s
- [ ] Mobile app startup time <3s
- [ ] Bundle size <5MB
- [ ] Database queries optimized
- [ ] Caching strategy implemented

### 2.4 Documentation ✅
- [ ] API documentation updated (Swagger/OpenAPI)
- [ ] Release notes prepared
- [ ] Deployment plan reviewed
- [ ] Rollback plan documented
- [ ] User documentation updated
- [ ] Change log updated

### 2.5 Monitoring ✅
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring enabled (Datadog)
- [ ] Analytics configured (Google Analytics)
- [ ] Uptime monitoring active (UptimeRobot)
- [ ] Alerts configured
- [ ] Log aggregation set up

---

## 3. Backend Deployment

### 3.1 Automated Deployment (CI/CD)

#### Trigger
- Push to `main` branch
- Manual approval required for production

#### Pipeline Stages
1. **Lint & Format Check** (~2 min)
2. **Unit Tests** (~5 min)
3. **Integration Tests** (~8 min)
4. **Security Scan** (~3 min)
5. **Docker Build** (~5 min)
6. **Deploy to Staging** (~2 min)
7. **Smoke Tests** (~2 min)
8. **Await Approval** (Manual)
9. **Deploy to Production** (~2 min)
10. **Health Checks** (~1 min)

**Total Duration:** ~30-40 minutes

### 3.2 Manual Deployment

#### Step 1: Preparation
```bash
# Checkout main branch
git checkout main
git pull origin main

# Verify you're on the correct version
git log -1

# Ensure environment variables are set
cd astrology-app-backend
cat .env.production
```

#### Step 2: Run Tests Locally
```bash
# Install dependencies
npm ci

# Run all tests
npm test

# Build project
npm run build

# Verify build output
ls -la dist/
```

#### Step 3: Create Database Backup
```bash
# Backup PostgreSQL
pg_dump $DATABASE_URL > backups/postgres_backup_$(date +%Y%m%d_%H%M%S).sql

# Backup MongoDB (if applicable)
mongodump --uri="$MONGODB_URI" --out=backups/mongodb_backup_$(date +%Y%m%d_%H%M%S)
```

#### Step 4: Deploy using Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Select project
railway project select

# Deploy backend
railway up
```

#### Step 5: Verify Deployment
```bash
# Check health endpoint
curl https://api.astrology-app.com/health

# Check version endpoint
curl https://api.astrology-app.com/api/version

# Test authentication
curl -X POST https://api.astrology-app.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}'
```

### 3.3 Zero-Downtime Deployment (Blue-Green)

#### Step 1: Create New Environment
```bash
# Create new service on Railway
railway service create backend-green

# Deploy new version to green environment
railway service backend-green
```

#### Step 2: Test Green Environment
```bash
# Run smoke tests against green environment
curl https://green-api.astrology-app.com/health

# Run integration tests
npm run test:integration -- --apiUrl=https://green-api.astrology-app.com
```

#### Step 3: Switch Traffic
```bash
# Update DNS or load balancer to point to green environment
# This is typically done through Railway's dashboard or DNS provider
```

#### Step 4: Verify & Cleanup
```bash
# Monitor for errors
# Check logs: railway logs

# If successful, delete old blue environment
railway service delete backend-blue
```

### 3.4 Rollback Procedure

#### Immediate Rollback (<5 minutes)
```bash
# Identify previous working version
railway versions

# Rollback to previous version
railway rollback <version-id>

# Verify rollback
curl https://api.astrology-app.com/health
```

#### Database Rollback (if needed)
```bash
# Restore PostgreSQL backup
psql $DATABASE_URL < backups/postgres_backup_YYYYMMDD_HHMMSS.sql

# Restore MongoDB backup
mongorestore --uri="$MONGODB_URI" --drop backups/mongodb_backup_YYYYMMDD_HHMMSS
```

---

## 4. Frontend Web Deployment

### 4.1 Automated Deployment (CI/CD)

#### Trigger
- Push to `main` branch
- Manual approval required for production

#### Pipeline Stages
1. **Lint & Format Check** (~2 min)
2. **TypeScript Check** (~1 min)
3. **Unit Tests** (~5 min)
4. **Integration Tests** (~5 min)
5. **Security Scan** (~3 min)
6. **Build Web** (~5 min)
7. **Deploy to Vercel (Staging)** (~2 min)
8. **Smoke Tests** (~2 min)
9. **Await Approval** (Manual)
10. **Deploy to Vercel (Production)** (~2 min)
11. **Health Checks** (~1 min)

**Total Duration:** ~30 minutes

### 4.2 Manual Deployment to Vercel

#### Step 1: Preparation
```bash
# Checkout main branch
git checkout main
git pull origin main

cd astrology-app-mobile

# Ensure environment variables are set
cat .env.production
```

#### Step 2: Build Web Version
```bash
# Install dependencies
npm ci

# Build web version
npm run build:web
# or
npx expo export:web
```

#### Step 3: Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Step 4: Verify Deployment
```bash
# Check web app
curl https://astrology-app.com

# Test critical flows
# Open browser and manually test:
# - User login
# - Dashboard loading
# - Navigation
```

### 4.3 Rollback Procedure

#### Using Vercel Dashboard
1. Go to Vercel Dashboard
2. Select the project
3. Go to Deployments
4. Find the previous successful deployment
5. Click "Promote to Production"

#### Using Vercel CLI
```bash
# List deployments
vercel list

# Rollback to specific deployment
vercel rollback <deployment-url>
```

---

## 5. Mobile App Deployment

### 5.1 iOS Deployment (App Store)

#### Prerequisites
- Apple Developer Account
- Provisioning profiles configured
- Certificates installed
- EAS CLI installed
- TestFlight configured

#### Step 1: Build with EAS
```bash
cd astrology-app-mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS (production)
eas build --platform ios --profile production --non-interactive
```

#### Step 2: Submit to App Store Connect
```bash
# Submit to TestFlight (internal testing)
eas submit --platform ios --non-interactive

# Or manually upload via:
# - Open Xcode
# - Upload archive
```

#### Step 3: App Store Review Process
1. **Internal Testing:** Distribute to internal team
2. **External Testing (Optional):** Beta testers via TestFlight
3. **App Store Review:** Submit for review (usually 1-3 days)

#### Step 4: Release to Production
- Select "Release" in App Store Connect
- Choose release date or immediate release
- Monitor for crash reports

### 5.2 Android Deployment (Google Play)

#### Prerequisites
- Google Play Developer Account
- Service account JSON key configured
- Signing key created
- EAS CLI installed
- Internal testing track configured

#### Step 1: Build with EAS
```bash
cd astrology-app-mobile

# Build for Android (production)
eas build --platform android --profile production --non-interactive
```

#### Step 2: Submit to Google Play
```bash
# Submit to internal testing
eas submit --platform android --non-interactive
```

#### Step 3: Google Play Review Process
1. **Internal Testing:** Test with internal team
2. **Closed Testing (Optional):** Beta testers
3. **Open Testing (Optional):** Public beta
4. **Production Release:** Full rollout

#### Step 4: Release to Production
- Create release in Google Play Console
- Upload APK/AAB
- Complete store listing
- Submit for review (usually 1-2 days)
- Approve for production

### 5.3 Staged Rollout Strategy

#### iOS (Phased Release)
1. **Day 1:** Release to 1% of users
2. **Day 3:** Expand to 5% of users
3. **Day 5:** Expand to 10% of users
4. **Day 7:** Expand to 25% of users
5. **Day 10:** Expand to 50% of users
6. **Day 14:** Release to 100% of users

#### Android (Staged Rollout)
1. **Stage 1:** 1% of users (24-48 hours)
2. **Stage 2:** 5% of users (24-48 hours)
3. **Stage 3:** 10% of users (24-48 hours)
4. **Stage 4:** 50% of users (24-48 hours)
5. **Stage 5:** 100% of users

### 5.4 Rollback Procedure

#### iOS Rollback
1. Go to App Store Connect
2. Select the app
3. Go to "TestFlight" or "App Store" tab
4. Find the problematic version
5. Click "Remove from Sale" or "Reject Version"
6. Promote previous stable version

#### Android Rollback
1. Go to Google Play Console
2. Select the app
3. Go to "Release" section
4. Find the active release
5. Click "Pause Rollout" or "Halt Rollout"
6. Promote previous stable version

---

## 6. Post-Deployment Verification

### 6.1 Health Checks
```bash
# Backend health
curl https://api.astrology-app.com/health

# Web health
curl https://astrology-app.com

# API version check
curl https://api.astrology-app.com/api/version
```

### 6.2 Smoke Tests

#### Backend Tests
```bash
# Test authentication
curl -X POST https://api.astrology-app.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}'

# Test dashboard API
curl https://api.astrology-app.com/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Frontend Tests
- Open web app in browser
- Test login flow
- Test dashboard loading
- Test navigation
- Test responsive design

#### Mobile Tests
- Download app from TestFlight/Internal Testing
- Install on test device
- Test critical flows
- Test offline functionality
- Test push notifications

### 6.3 Monitoring

#### Check Error Rates (Sentry)
- Dashboard: [Sentry Dashboard URL]
- Check for new errors
- Check error rate trend
- Check crash rate

#### Check Performance (Datadog)
- Dashboard: [Datadog Dashboard URL]
- Check API response times
- Check database query performance
- Check server resource usage

#### Check Uptime (UptimeRobot)
- Dashboard: [UptimeRobot Dashboard URL]
- Verify all monitors are green
- Check response times
- Check downtime history

---

## 7. Emergency Procedures

### 7.1 Major Outage

#### Detection
- Multiple alerts from monitoring
- Error rate > 5%
- Response time > 5s
- Service unavailable

#### Immediate Actions
1. **Declare incident** (Slack channel, email)
2. **Check status page** (update with incident)
3. **Identify root cause** (logs, metrics)
4. **Implement quick fix** or **rollback**
5. **Verify recovery**
6. **Update status**
7. **Document incident**

#### Rollback Decision Tree
```
Is there a recent deployment?
├─ Yes ──> Rollback to previous version
└─ No ──>
    Is database issue?
    ├─ Yes ──> Restore from backup or failover
    └─ No ──> Restart services / Scale up
```

### 7.2 Database Failure

#### PostgreSQL Failover
```bash
# Check primary database status
railway status

# Switch to replica (if available)
# Update DATABASE_URL to point to replica

# Or restore from backup
psql $DATABASE_URL < backups/postgres_backup_latest.sql
```

#### MongoDB Failover
```bash
# MongoDB Atlas has automatic failover
# Check cluster status in Atlas dashboard

# Or restore from backup
mongorestore --uri="$MONGODB_URI" --drop backups/mongodb_backup_latest
```

### 7.3 Security Incident

#### Immediate Actions
1. **Isolate affected systems**
2. **Change all secrets/keys**
3. **Rotate JWT tokens**
4. **Enable additional monitoring**
5. **Notify security team**
6. **Document incident**
7. **Post-incident review**

#### Communication Template
```
SUBJECT: Security Incident - [APP_NAME]

Dear [USERS],

We detected a security incident on [DATE]. Here's what we're doing:

[WHAT HAPPENED]
[WHAT WE'RE DOING]
[WHAT YOU SHOULD DO]

We apologize for any inconvenience and are working to resolve this.

Best regards,
[TEAM]
```

---

## 8. Maintenance Procedures

### 8.1 Daily Maintenance

- [ ] Check error rates in Sentry
- [ ] Check performance metrics in Datadog
- [ ] Review system logs
- [ ] Monitor disk space
- [ ] Check backup completion

### 8.2 Weekly Maintenance

- [ ] Review and deploy security patches
- [ ] Run npm audit and update dependencies
- [ ] Review database performance
- [ ] Check SSL certificate expiration
- [ ] Update documentation
- [ ] Review and close old issues

### 8.3 Monthly Maintenance

- [ ] Full security audit
- [ ] Performance review and optimization
- [ ] Backup restoration test
- [ ] Capacity planning
- [ ] Cost optimization review
- [ ] Team retrospective

---

## 9. Contact Information

| Role | Name | Email | Phone |
|------|------|-------|-------|
| DevOps Lead | [Name] | [Email] | [Phone] |
| Backend Lead | [Name] | [Email] | [Phone] |
| Frontend Lead | [Name] | [Email] | [Phone] |
| QA Lead | [Name] | [Email] | [Phone] |
| On-Call Engineer | [Name] | [Email] | [Phone] |

### Escalation Contacts
- **Level 1:** DevOps Team (on-call rotation)
- **Level 2:** Engineering Manager
- **Level 3:** CTO

---

## 10. Appendices

### A. Useful Commands

```bash
# Railway CLI
railway login                    # Login to Railway
railway up                       # Deploy current directory
railway status                   # Check status
railway logs                     # View logs
railway rollback <version>      # Rollback version

# Vercel CLI
vercel login                     # Login to Vercel
vercel --prod                    # Deploy to production
vercel list                      # List deployments
vercel rollback <url>            # Rollback deployment

# EAS CLI
eas login                        # Login to Expo
eas build --platform ios        # Build iOS
eas build --platform android    # Build Android
eas submit --platform ios       # Submit to App Store

# Docker
docker ps                        # List containers
docker logs <container>          # View logs
docker stop <container>          # Stop container
docker restart <container>       # Restart container
```

### B. Environment Variables Reference

See `.env.production` files for complete list of environment variables.

### C. Monitoring Dashboards

| Service | URL | Purpose |
|---------|-----|---------|
| Sentry | https://sentry.io/organizations/your-org/ | Error tracking |
| Datadog | https://app.datadoghq.com/dashboard/ | Performance monitoring |
| UptimeRobot | https://uptimerobot.com/dashboard | Uptime monitoring |
| Codecov | https://codecov.io/gh/your-org/your-repo | Code coverage |

---

**Document Status:** ✅ Approved
**Last Updated:** 2024-01-15
**Next Review:** 2024-04-15

**Change Log:**
| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2024-01-15 | 1.0 | Initial version | Team |
