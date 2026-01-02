# Test Plan - Holistic Divination App

## Document Information
- **Version:** 1.0
- **Date:** 2024-01-15
- **Project:** Holistic Divination App
- **Phase:** Phase 8 - Testing, QA & Production Deployment

---

## 1. Overview

### 1.1 Purpose
This document outlines the comprehensive testing strategy for the Holistic Divination App, covering unit tests, integration tests, end-to-end tests, performance tests, and security tests for both backend and frontend components.

### 1.2 Scope
- Backend API testing (Node.js + Express + TypeScript)
- Frontend testing (React Native + Expo + TypeScript)
- Database testing (PostgreSQL + MongoDB)
- Performance testing
- Security testing
- User acceptance testing

### 1.3 Testing Goals
- Achieve 85%+ code coverage for backend
- Achieve 80%+ code coverage for frontend
- Ensure critical paths have 95%+ coverage
- Meet performance targets (<2s dashboard API response)
- Zero critical bugs in production
- 99.5%+ uptime

---

## 2. Testing Strategy

### 2.1 Test Levels

| Test Level | Description | Tools | Coverage Target |
|------------|-------------|-------|-----------------|
| Unit Tests | Test individual functions, components, and services in isolation | Jest, React Testing Library | 85% backend, 80% frontend |
| Integration Tests | Test interactions between components and modules | Jest, Supertest | 70% |
| E2E Tests | Test complete user workflows | Detox, Cypress | Critical paths 95% |
| Performance Tests | Load testing and performance optimization | k6, Apache JMeter | N/A |
| Security Tests | Identify vulnerabilities | OWASP ZAP, npm audit | N/A |

### 2.2 Test Automation Strategy
- **Unit Tests:** Automated on every push (GitHub Actions)
- **Integration Tests:** Automated on every push
- **E2E Tests:** Automated on merge to main
- **Performance Tests:** Run weekly and before major releases
- **Security Scans:** Run weekly and before releases

---

## 3. Backend Testing

### 3.1 Unit Tests

#### Service Layer Tests
**Location:** `src/tests/unit/services/`

| Service | Test Cases | Priority |
|---------|------------|----------|
| AstrologyService | Birth chart calculation, dasha calculation, transits, edge cases | High |
| NumerologyService | Life path calculation, name analysis, Chaldean/Pythagorean methods | High |
| TarotService | Card selection, spread generation, yes/no readings | Medium |
| PalmistryService | Image processing, line detection, AI analysis | High |
| DashboardAggregator | Data aggregation, caching, preferences | High |
| CrossModuleInsights | Correlation logic, insight generation | Medium |
| CompatibilityEngine | Match calculation, score generation | Medium |

#### Controller Tests
**Location:** `src/tests/unit/controllers/`

| Controller | Test Cases | Priority |
|------------|------------|----------|
| AuthController | Login, register, OAuth, password reset | High |
| DashboardController | All 7 dashboard endpoints | High |
| ReadingController | Create reading, get reading, history | Medium |
| ProfileController | CRUD operations, validation | Medium |

#### Model Tests
**Location:** `src/tests/unit/models/`

| Model | Test Cases | Priority |
|-------|------------|----------|
| User | Validation, password hashing, relationships | High |
| UserProfile | Validation, date conversions | Medium |
| BirthChart | JSON schema validation | Low |
| Subscription | Plan validation, status transitions | Medium |

### 3.2 Integration Tests

**Location:** `src/tests/integration/`

| Test Suite | Test Cases | Priority |
|------------|------------|----------|
| Auth Flow | Signup → Login → Get Profile → Logout | High |
| Dashboard API | Complete dashboard data retrieval | High |
| Reading Flow | Create → Retrieve → History | High |
| Compatibility Check | Two-user compatibility | Medium |
| Subscription Flow | Purchase → Feature access | Medium |
| Dashboard Preferences | CRUD operations | Medium |

### 3.3 API Testing

**Test Scenarios:**
- ✅ All 50+ endpoints return correct responses
- ✅ Authentication/authorization works correctly
- ✅ Rate limiting prevents abuse
- ✅ Input validation rejects invalid data
- ✅ Error responses are consistent
- ✅ Pagination works correctly
- ✅ CORS headers are properly set
- ✅ SSL/TLS is enforced

**Edge Cases:**
- Invalid JWT tokens
- Expired tokens
- Malformed JSON
- SQL injection attempts
- XSS payloads
- CSRF tokens
- Very large payloads
- Unicode characters
- Empty/null data

### 3.4 Database Testing

**PostgreSQL Tests:**
- Schema integrity
- Index effectiveness
- Query performance
- Transaction rollback
- Connection pooling
- Migration rollback

**MongoDB Tests:**
- Schema validation
- Index performance
- Query optimization
- Document size limits
- Sharding (if applicable)

### 3.5 Performance Testing

**Load Testing Scenarios:**
- 10 concurrent users (baseline)
- 50 concurrent users (moderate)
- 100 concurrent users (peak)
- 500 concurrent users (stress test)

**Performance Targets:**
| Endpoint | Target Response Time | Max Concurrent Users |
|----------|---------------------|----------------------|
| GET /api/dashboard | <2s | 100 |
| GET /api/dashboard/insights | <1s | 100 |
| POST /api/compatibility/check | <5s | 50 |
| POST /api/readings | <3s | 100 |
| Auth endpoints | <1s | 50 |

**Test Duration:**
- Ramp-up: 5 minutes
- Sustained load: 10 minutes
- Ramp-down: 5 minutes

---

## 4. Frontend Testing

### 4.1 Component Tests

**Location:** `src/tests/unit/components/`

| Component | Test Cases | Priority |
|-----------|------------|----------|
| DashboardWidget | Rendering, interactions, accessibility | High |
| QuickInsightCard | Props handling, different modules | High |
| DashboardHeader | Date formatting, greeting | Low |
| InsightCarousel | Swiping, auto-scroll | Medium |
| All screens | Navigation, state management | High |

### 4.2 Integration Tests

**Location:** `src/tests/integration/`

| Flow | Test Cases | Priority |
|------|------------|----------|
| Login Flow | Email/password login, OAuth, error handling | High |
| Dashboard Flow | Data loading, refresh, error states | High |
| Navigation Flow | Tab navigation, stack navigation | High |
| Profile Flow | Update profile, upload image | Medium |
| Settings Flow | Preferences, logout | Medium |

### 4.3 E2E Tests

**Test Scenarios:**

#### Critical User Journeys
1. **New User Onboarding**
   - Download app → Signup → Complete profile → View dashboard
   - Priority: Critical

2. **Daily Reading Workflow**
   - Open app → Login → View dashboard → Read daily horoscope
   - Priority: Critical

3. **Compatibility Check**
   - Navigate to compatibility → Enter user ID → View results
   - Priority: High

4. **Subscription Purchase**
   - Navigate to settings → Select plan → Complete purchase
   - Priority: Medium

5. **Offline Mode**
   - Load data → Disconnect network → View cached data
   - Priority: Medium

### 4.4 Visual Testing

**Test Scenarios:**
- Screenshot comparison for all screens
- Test on different device sizes (iPhone SE, iPhone 14 Pro, iPad)
- Test dark/light mode
- Test font rendering
- Test accessibility (color contrast, text size)

### 4.5 Accessibility Testing

**WCAG 2.1 Level AA Compliance:**
- ✅ Color contrast ratio ≥ 4.5:1 for text
- ✅ Touch target size ≥ 48x48px
- ✅ Screen reader compatibility (VoiceOver, TalkBack)
- ✅ Keyboard navigation (where applicable)
- ✅ Semantic HTML/React Native components
- ✅ Proper labeling for form inputs

### 4.6 Performance Testing

**Metrics:**
| Metric | Target |
|--------|--------|
| App startup time | <3s |
| Screen transition | <500ms |
| First contentful paint | <2s |
| Time to interactive | <5s |
| Bundle size | <5MB |

**Tools:**
- React Native Performance Monitor
- Flipper
- Bundle analyzer (source-map-explorer)

---

## 5. Security Testing

### 5.1 Authentication & Authorization

**Test Cases:**
- ✅ JWT tokens expire correctly
- ✅ Refresh tokens rotate properly
- ✅ OAuth flow is secure (PKCE, state parameter)
- ✅ Password encryption (bcrypt 12+ rounds)
- ✅ Rate limiting on auth endpoints
- ✅ Session timeout works

### 5.2 Data Protection

**Test Cases:**
- ✅ Sensitive data encrypted at rest
- ✅ All data transmitted over TLS 1.3+
- ✅ API keys not exposed in client code
- ✅ Passwords never logged
- ✅ PII masked in logs

### 5.3 API Security

**Test Cases:**
- ✅ SQL injection attempts blocked
- ✅ XSS payloads sanitized
- ✅ CSRF protection active
- ✅ Rate limiting effective
- ✅ CORS configured correctly
- ✅ Input validation comprehensive

### 5.4 Vulnerability Scanning

**Tools:**
- npm audit (dependency vulnerabilities)
- Snyk (security scanner)
- OWASP ZAP (penetration testing)
- SonarQube (code quality)

**Scanning Schedule:**
- Automated: Weekly on develop branch
- Manual: Before each release

---

## 6. Test Environment

### 6.1 Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| Local Development | Development | http://localhost:3000 |
| Staging | Pre-production testing | https://staging-api.astrology-app.com |
| Production | Live environment | https://api.astrology-app.com |

### 6.2 Test Data

**Types of Test Data:**
- Valid user data (various scenarios)
- Invalid data (negative testing)
- Edge case data (boundary conditions)
- Performance test data (large datasets)
- Security test data (malicious payloads)

**Data Management:**
- Test database reset between test runs
- Masked production data for realistic tests
- Synthetic data for privacy compliance

---

## 7. Test Execution

### 7.1 Unit Tests
- **Trigger:** Every push to any branch
- **Duration:** ~5-10 minutes
- **Tools:** Jest
- **Coverage Report:** Generated and uploaded to Codecov

### 7.2 Integration Tests
- **Trigger:** Every push to any branch
- **Duration:** ~10-15 minutes
- **Tools:** Jest, Supertest
- **Database:** Test databases (PostgreSQL + MongoDB)

### 7.3 E2E Tests
- **Trigger:** On merge to main/develop
- **Duration:** ~15-20 minutes
- **Tools:** Detox (iOS/Android), Cypress (Web)
- **Emulators:** iOS Simulator, Android Emulator

### 7.4 Performance Tests
- **Trigger:** Weekly, before major releases
- **Duration:** ~30 minutes
- **Tools:** k6
- **Environment:** Staging

### 7.5 Security Tests
- **Trigger:** Weekly, before releases
- **Duration:** ~20-30 minutes
- **Tools:** npm audit, Snyk, OWASP ZAP

---

## 8. Bug Reporting

### 8.1 Bug Categories

| Severity | Description | Example |
|----------|-------------|---------|
| Critical | App crash, data loss, security breach | App crashes on login |
| High | Major feature broken, performance degraded | Dashboard API times out |
| Medium | Minor feature broken, UI issues | Button doesn't respond |
| Low | Cosmetic issues, typos | Text overflow |

### 8.2 Bug Report Template

```
**Title:** [Brief description]

**Severity:** Critical/High/Medium/Low

**Steps to Reproduce:**
1. 
2. 
3.

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- OS: iOS 17.0 / Android 14
- App Version: 1.0.0
- Backend Version: 1.0.0

**Screenshots/Logs:**
[Attach any relevant files]

**Additional Context:**
[Any other information]
```

### 8.3 Bug Tracking
- **Tool:** GitHub Issues
- **Labels:** bug, critical, high, medium, low, needs-review
- **SLA:**
  - Critical: Fix within 24 hours
  - High: Fix within 48 hours
  - Medium: Fix within 1 week
  - Low: Fix within 2 weeks

---

## 9. Release Criteria

### 9.1 Must Have (Blockers)
- ✅ All unit tests passing
- ✅ All integration tests passing
- ✅ All critical E2E tests passing
- ✅ Zero critical bugs
- ✅ Zero high-severity security vulnerabilities
- ✅ Code coverage ≥ 85% (backend), ≥ 80% (frontend)
- ✅ Performance targets met
- ✅ Security scan passed

### 9.2 Should Have
- ✅ All medium E2E tests passing
- ✅ Documentation updated
- ✅ Release notes prepared
- ✅ Rollback plan tested

### 9.3 Nice to Have
- ✅ Accessibility audit passed
- ✅ Performance benchmarks exceeded
- ✅ Load tests with 100+ concurrent users passed

---

## 10. Test Metrics & Reporting

### 10.1 Key Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Backend Code Coverage | ≥85% | TBD |
| Frontend Code Coverage | ≥80% | TBD |
| API Response Time (p95) | <500ms | TBD |
| App Startup Time | <3s | TBD |
| Test Execution Time | <30 min | TBD |
| Bug Escape Rate | <5% | TBD |

### 10.2 Reporting

**Daily:**
- Test results in Slack/Teams
- Failed test notifications

**Weekly:**
- Test coverage report
- Performance metrics
- Security scan results

**Per Release:**
- Comprehensive test report
- Quality metrics summary
- Known issues list

---

## 11. Continuous Improvement

### 11.1 Retrospectives
- Hold test retrospectives after each release
- Identify areas for improvement
- Update test plan based on feedback

### 11.2 Test Maintenance
- Regularly review and update test cases
- Remove obsolete tests
- Add tests for new features
- Optimize slow tests

### 11.3 Training
- Team training on testing best practices
- Documentation updates
- Knowledge sharing sessions

---

## Appendix

### A. Test Tools Reference
- **Jest:** Unit and integration testing
- **React Testing Library:** Component testing
- **Supertest:** HTTP testing
- **Detox:** E2E testing (React Native)
- **Cypress:** E2E testing (Web)
- **k6:** Load testing
- **npm audit:** Security scanning
- **Snyk:** Dependency security

### B. Useful Commands

```bash
# Run all backend tests
cd astrology-app-backend && npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Run specific test file
npm test -- dashboardAggregator.test.ts

# Run frontend tests
cd astrology-app-mobile && npm test

# Run E2E tests
npx detox test

# Run performance tests
k6 run tests/performance/load-test.js

# Security audit
npm audit
```

### C. Contact Information
- **QA Lead:** [Email]
- **DevOps Engineer:** [Email]
- **Tech Lead:** [Email]

---

**Document Status:** ✅ Approved
**Last Updated:** 2024-01-15
**Next Review:** 2024-02-15
