import { Request, Response } from 'express';
import { Pool } from 'pg';
import mongoose from 'mongoose';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheckItem;
    mongodb: HealthCheckItem;
    memory: HealthCheckItem;
    disk: HealthCheckItem;
    api: HealthCheckItem;
  };
}

interface HealthCheckItem {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  message?: string;
}

export const performHealthCheck = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const startTime = Date.now();
  const checks: HealthCheckResult['checks'] = {
    database: { status: 'healthy', responseTime: 0 },
    mongodb: { status: 'healthy', responseTime: 0 },
    memory: { status: 'healthy', responseTime: 0 },
    disk: { status: 'healthy', responseTime: 0 },
    api: { status: 'healthy', responseTime: 0 },
  };

  let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

  // Check PostgreSQL
  try {
    const dbStartTime = Date.now();
    const pool = req.app.get('dbPool') as Pool;
    if (pool) {
      await pool.query('SELECT 1');
      checks.database.responseTime = Date.now() - dbStartTime;
      checks.database.status = 'healthy';
    } else {
      checks.database.status = 'unhealthy';
      checks.database.message = 'Database pool not available';
    }
  } catch (error) {
    checks.database.status = 'unhealthy';
    checks.database.responseTime = Date.now() - startTime;
    checks.database.message = 'Database connection failed';
  }

  // Check MongoDB
  try {
    const mongoStartTime = Date.now();
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      checks.mongodb.responseTime = Date.now() - mongoStartTime;
      checks.mongodb.status = 'healthy';
    } else {
      checks.mongodb.status = 'unhealthy';
      checks.mongodb.message = 'MongoDB not connected';
    }
  } catch (error) {
    checks.mongodb.status = 'unhealthy';
    checks.mongodb.responseTime = Date.now() - startTime;
    checks.mongodb.message = 'MongoDB ping failed';
  }

  // Check Memory Usage
  try {
    const memStartTime = Date.now();
    const usedMemory = process.memoryUsage();
    const totalMemory = process.memoryUsage().heapTotal;
    const memoryUsagePercent = (usedMemory.heapUsed / totalMemory) * 100;

    checks.memory.responseTime = Date.now() - memStartTime;

    if (memoryUsagePercent > 90) {
      checks.memory.status = 'unhealthy';
      checks.memory.message = `Memory usage critical: ${memoryUsagePercent.toFixed(2)}%`;
    } else if (memoryUsagePercent > 75) {
      checks.memory.status = 'degraded';
      checks.memory.message = `Memory usage high: ${memoryUsagePercent.toFixed(2)}%`;
    } else {
      checks.memory.status = 'healthy';
    }
  } catch (error) {
    checks.memory.status = 'unhealthy';
    checks.memory.message = 'Memory check failed';
  }

  // Check Disk Space (if applicable)
  try {
    const diskStartTime = Date.now();
    checks.disk.responseTime = Date.now() - diskStartTime;
    checks.disk.status = 'healthy';
    // Note: Implement disk check if needed
  } catch (error) {
    checks.disk.status = 'degraded';
    checks.disk.message = 'Disk check not available';
  }

  // Overall API health
  try {
    const apiStartTime = Date.now();
    checks.api.responseTime = Date.now() - apiStartTime;
    checks.api.status = 'healthy';
  } catch (error) {
    checks.api.status = 'unhealthy';
  }

  // Determine overall status
  const unhealthyChecks = Object.values(checks).filter(c => c.status === 'unhealthy');
  const degradedChecks = Object.values(checks).filter(c => c.status === 'degraded');

  if (unhealthyChecks.length > 0) {
    overallStatus = 'unhealthy';
  } else if (degradedChecks.length > 0) {
    overallStatus = 'degraded';
  }

  const result: HealthCheckResult = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'unknown',
    checks,
  };

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
  return res.status(statusCode).json(result);
};

export const getLiveness = async (req: Request, res: Response): Promise<Response> => {
  // Simple liveness check - returns 200 if process is running
  return res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
};

export const getReadiness = async (req: Request, res: Response): Promise<Response> => {
  // Readiness check - returns 200 if app is ready to serve traffic
  const startTime = Date.now();
  let ready = true;
  const checks: Record<string, boolean> = {};

  // Check database
  try {
    const pool = req.app.get('dbPool') as Pool;
    if (pool) {
      await pool.query('SELECT 1');
      checks.database = true;
    } else {
      checks.database = false;
      ready = false;
    }
  } catch (error) {
    checks.database = false;
    ready = false;
  }

  // Check MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      checks.mongodb = true;
    } else {
      checks.mongodb = false;
      ready = false;
    }
  } catch (error) {
    checks.mongodb = false;
    ready = false;
  }

  const result = {
    status: ready ? 'ready' : 'not ready',
    timestamp: new Date().toISOString(),
    responseTime: Date.now() - startTime,
    checks,
  };

  return res.status(ready ? 200 : 503).json(result);
};
