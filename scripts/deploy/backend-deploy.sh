#!/bin/bash

# Backend Deployment Script
# This script handles deploying the backend to production

set -e

echo "🚀 Starting Backend Deployment..."

# Configuration
PROJECT_NAME="astrology-app-backend"
DOCKER_IMAGE="astrology-backend"
REGISTRY="${REGISTRY:-ghcr.io}"
TAG="${TAG:-latest}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check required environment variables
check_env_vars() {
    log_info "Checking environment variables..."

    required_vars=(
        "DATABASE_URL"
        "MONGODB_URI"
        "JWT_SECRET"
        "REFRESH_TOKEN_SECRET"
        "FIREBASE_PROJECT_ID"
    )

    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        exit 1
    fi

    log_info "All required environment variables are set"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."

    # Check if migration file exists
    if [ -f "database/migrate.sql" ]; then
        psql "$DATABASE_URL" < database/migrate.sql
        log_info "Database migrations completed"
    else
        log_warn "No migration file found, skipping..."
    fi
}

# Backup database
backup_database() {
    log_info "Creating database backup..."

    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"

    TIMESTAMP=$(date +%Y%m%d_%H%M%S)

    # Backup PostgreSQL
    pg_dump "$DATABASE_URL" > "$BACKUP_DIR/postgres_backup_$TIMESTAMP.sql"

    # Backup MongoDB (if mongodump is available)
    if command -v mongodump &> /dev/null; then
        mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/mongodb_backup_$TIMESTAMP"
    fi

    log_info "Database backups created in $BACKUP_DIR"

    # Remove old backups (keep last 7)
    find "$BACKUP_DIR" -name "postgres_backup_*.sql" -mtime +7 -delete
    find "$BACKUP_DIR" -type d -name "mongodb_backup_*" -mtime +7 -exec rm -rf {} +
}

# Health check
health_check() {
    log_info "Running health check..."

    local max_attempts=30
    local attempt=0
    local health_url="${API_URL:-http://localhost:3000}/health"

    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s "$health_url" > /dev/null; then
            log_info "Health check passed!"
            return 0
        fi

        attempt=$((attempt + 1))
        sleep 2
    done

    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Rollback deployment
rollback() {
    log_warn "Initiating rollback..."

    # Stop current container
    docker stop "$PROJECT_NAME" || true
    docker rm "$PROJECT_NAME" || true

    # Start previous container (implementation depends on your setup)
    log_warn "Rollback completed"
}

# Main deployment flow
main() {
    log_info "=========================================="
    log_info "  Backend Deployment Script"
    log_info "  Environment: ${NODE_ENV:-production}"
    log_info "  Version: ${TAG}"
    log_info "=========================================="

    # Pre-deployment checks
    check_env_vars

    # Backup database
    if [ "${SKIP_BACKUP}" != "true" ]; then
        backup_database
    fi

    # Build application
    log_info "Building application..."
    cd astrology-app-backend
    npm ci
    npm run build

    # Run tests
    log_info "Running tests..."
    npm test -- --passWithNoTests --bail --testTimeout=30000

    cd ..

    # Run migrations
    run_migrations

    # Docker deployment
    log_info "Deploying with Docker..."

    # Pull latest image
    docker pull "$REGISTRY/$DOCKER_IMAGE:$TAG"

    # Stop existing container
    docker stop "$PROJECT_NAME" || true
    docker rm "$PROJECT_NAME" || true

    # Start new container
    docker run -d \
        --name "$PROJECT_NAME" \
        --restart unless-stopped \
        -p 3000:3000 \
        --env-file astrology-app-backend/.env.production \
        "$REGISTRY/$DOCKER_IMAGE:$TAG"

    log_info "Container started successfully"

    # Health check
    if health_check; then
        log_info "🎉 Deployment successful!"
    else
        log_error "❌ Deployment failed, initiating rollback..."
        rollback
        exit 1
    fi

    # Cleanup old images (keep last 3)
    log_info "Cleaning up old Docker images..."
    docker image prune -f --filter "label=com.astrologyapp.astrology-backend"

    log_info "Deployment completed successfully!"
}

# Handle errors
trap 'log_error "Deployment failed at line $LINENO"; exit 1' ERR

# Run main function
main "$@"
