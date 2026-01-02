// k6 Load Testing Script for Dashboard API

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const dashboardLatency = new Trend('dashboard_latency');
const insightsLatency = new Trend('insights_latency');
const requestCount = new Counter('requests');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 10 },      // Stay at 10 users
    { duration: '30s', target: 50 },    // Ramp up to 50 users
    { duration: '1m', target: 50 },     // Stay at 50 users
    { duration: '30s', target: 100 },   // Ramp up to 100 users
    { duration: '2m', target: 100 },    // Stay at 100 users (peak load)
    { duration: '30s', target: 50 },    // Ramp down to 50 users
    { duration: '30s', target: 0 },     // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% of requests under 2s
    http_req_failed: ['rate<0.05'],      // Error rate < 5%
    errors: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api';

// Get auth token (in real scenario, this would authenticate)
function getAuthToken() {
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginRes.status === 200 && loginRes.json('token')) {
    return loginRes.json('token');
  }
  return null;
}

// Test dashboard endpoint
export function testDashboard() {
  const token = getAuthToken();
  if (!token) {
    return;
  }

  const start = Date.now();
  const res = http.get(`${BASE_URL}/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const duration = Date.now() - start;

  dashboardLatency.add(duration);
  requestCount.add(1);

  check(res, {
    'dashboard status is 200': (r) => r.status === 200,
    'dashboard has data': (r) => r.json('astrology') !== undefined,
    'dashboard response time < 2s': (r) => duration < 2000,
  }) || errorRate.add(1);
}

// Test insights endpoint
export function testInsights() {
  const token = getAuthToken();
  if (!token) {
    return;
  }

  const start = Date.now();
  const res = http.get(`${BASE_URL}/dashboard/insights`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const duration = Date.now() - start;

  insightsLatency.add(duration);
  requestCount.add(1);

  check(res, {
    'insights status is 200': (r) => r.status === 200,
    'insights has array': (r) => Array.isArray(r.json('insights')),
    'insights response time < 1s': (r) => duration < 1000,
  }) || errorRate.add(1);
}

// Test readings summary endpoint
export function testReadingsSummary() {
  const token = getAuthToken();
  if (!token) {
    return;
  }

  const res = http.get(`${BASE_URL}/dashboard/readings-summary`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  check(res, {
    'readings summary status is 200': (r) => r.status === 200,
    'readings summary has total': (r) => r.json('totalReadings') !== undefined,
  }) || errorRate.add(1);
}

// Test preferences endpoint
export function testPreferences() {
  const token = getAuthToken();
  if (!token) {
    return;
  }

  const res = http.get(`${BASE_URL}/dashboard/preferences`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  check(res, {
    'preferences status is 200': (r) => r.status === 200,
    'preferences has enabled modules': (r) => Array.isArray(r.json('enabledModules')),
  }) || errorRate.add(1);
}

// Main scenario - test all dashboard endpoints
export default function () {
  // Test dashboard data
  testDashboard();
  sleep(1);

  // Test insights
  testInsights();
  sleep(1);

  // Test readings summary
  testReadingsSummary();
  sleep(1);

  // Test preferences
  testPreferences();
  sleep(1);
}
