#!/bin/bash

# Frontend Deployment Script
# This script handles deploying the frontend to web and mobile stores

set -e

echo "🚀 Starting Frontend Deployment..."

# Configuration
PROJECT_NAME="astrology-app-mobile"
PLATFORM="${PLATFORM:-all}" # all, web, ios, android
ENV="${ENV:-production}"   # production, staging

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

    if [ "$ENV" == "production" ]; then
        required_vars=("EXPO_TOKEN")
    else
        required_vars=("EXPO_TOKEN")
    fi

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

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."

    cd "$PROJECT_NAME"
    npm ci
    cd ..
}

# Run tests
run_tests() {
    log_info "Running tests..."

    cd "$PROJECT_NAME"

    # Unit tests
    npm run test -- --passWithNoTests --bail --testTimeout=30000

    # Type checking
    npx tsc --noEmit

    cd ..

    log_info "All tests passed"
}

# Build web version
build_web() {
    log_info "Building web version..."

    cd "$PROJECT_NAME"

    if [ "$ENV" == "production" ]; then
        npm run build:web || npx expo export:web
    else
        npm run build:web || npx expo export:web
    fi

    cd ..

    log_info "Web build completed"
}

# Deploy web to Vercel
deploy_web() {
    log_info "Deploying web to Vercel..."

    cd "$PROJECT_NAME"

    if [ "$ENV" == "production" ]; then
        npx vercel --prod
    else
        npx vercel
    fi

    cd ..

    log_info "Web deployment completed"
}

# Build mobile apps with EAS
build_mobile() {
    log_info "Building mobile apps with EAS..."

    cd "$PROJECT_NAME"

    if [ "$PLATFORM" == "all" ] || [ "$PLATFORM" == "ios" ]; then
        log_info "Building iOS app..."

        local profile="production"
        if [ "$ENV" == "staging" ]; then
            profile="preview"
        fi

        npx eas build --platform ios --profile "$profile" --non-interactive
        log_info "iOS build completed"
    fi

    if [ "$PLATFORM" == "all" ] || [ "$PLATFORM" == "android" ]; then
        log_info "Building Android app..."

        local profile="production"
        if [ "$ENV" == "staging" ]; then
            profile="preview"
        fi

        npx eas build --platform android --profile "$profile" --non-interactive
        log_info "Android build completed"
    fi

    cd ..
}

# Submit mobile apps to stores
submit_mobile() {
    log_info "Submitting mobile apps to stores..."

    cd "$PROJECT_NAME"

    if [ "$PLATFORM" == "all" ] || [ "$PLATFORM" == "ios" ]; then
        log_info "Submitting to App Store..."

        if [ "$ENV" == "production" ]; then
            npx eas submit --platform ios --non-interactive
        else
            npx eas submit --platform ios --non-interactive
        fi

        log_info "iOS submission completed"
    fi

    if [ "$PLATFORM" == "all" ] || [ "$PLATFORM" == "android" ]; then
        log_info "Submitting to Google Play..."

        npx eas submit --platform android --non-interactive
        log_info "Android submission completed"
    fi

    cd ..
}

# Health check for web
health_check_web() {
    log_info "Running web health check..."

    local url=""
    if [ "$ENV" == "production" ]; then
        url="https://astrology-app.com"
    else
        url="https://staging.astrology-app.com"
    fi

    local max_attempts=10
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s "$url" > /dev/null; then
            log_info "Web health check passed!"
            return 0
        fi

        attempt=$((attempt + 1))
        sleep 5
    done

    log_error "Web health check failed after $max_attempts attempts"
    return 1
}

# Analyze bundle size
analyze_bundle() {
    log_info "Analyzing bundle size..."

    cd "$PROJECT_NAME"

    if command -v npx bundle-alyzer &> /dev/null; then
        npx bundle-alyzer || echo "Bundle analyzer not installed"
    fi

    cd ..

    log_info "Bundle size analysis completed"
}

# Main deployment flow
main() {
    log_info "=========================================="
    log_info "  Frontend Deployment Script"
    log_info "  Platform: ${PLATFORM}"
    log_info "  Environment: ${ENV}"
    log_info "=========================================="

    # Pre-deployment checks
    check_env_vars

    # Install dependencies
    install_dependencies

    # Run tests
    if [ "${SKIP_TESTS}" != "true" ]; then
        run_tests
    fi

    # Web deployment
    if [ "$PLATFORM" == "all" ] || [ "$PLATFORM" == "web" ]; then
        build_web
        deploy_web

        if health_check_web; then
            analyze_bundle
        else
            log_error "Web deployment failed health check"
            exit 1
        fi
    fi

    # Mobile deployment
    if [ "$PLATFORM" == "all" ] || [ "$PLATFORM" == "ios" ] || [ "$PLATFORM" == "android" ]; then
        build_mobile

        # Only submit to stores if explicitly requested
        if [ "${SUBMIT_TO_STORES}" == "true" ]; then
            submit_mobile
        fi
    fi

    log_info "🎉 Deployment successful!"
}

# Handle errors
trap 'log_error "Deployment failed at line $LINENO"; exit 1' ERR

# Run main function
main "$@"
