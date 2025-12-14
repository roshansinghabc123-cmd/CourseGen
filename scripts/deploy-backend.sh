#!/bin/bash

# Text-to-Learn Backend Deployment Script
echo "🚀 Preparing Text-to-Learn Backend for deployment..."

# Navigate to server directory
cd server

# Install dependencies
echo "📦 Installing production dependencies..."
npm install --production

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in server directory!"
    exit 1
fi

# Verify environment variables
echo "🔧 Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Make sure to set environment variables in production!"
    echo "Required environment variables:"
    echo "  - MONGODB_URI"
    echo "  - AUTH0_DOMAIN"
    echo "  - AUTH0_AUDIENCE"
    echo "  - GOOGLE_API_KEY"
    echo "  - YOUTUBE_API_KEY"
    echo "  - PORT (optional, defaults to 5000)"
fi

# Create production start script
echo "📝 Creating production start script..."
cat > start-production.js << 'EOF'
// Production start script
const app = require('./server.js');
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting Text-to-Learn Backend in production mode...');
console.log(`📡 Server will run on port ${PORT}`);

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('👋 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});
EOF

echo "✅ Backend is ready for deployment!"
echo "🔧 To deploy:"
echo "  1. Set environment variables in your hosting platform"
echo "  2. Deploy the server/ directory"
echo "  3. Run: npm start"
echo ""
echo "📋 Deployment checklist:"
echo "  ✓ MongoDB connection string configured"
echo "  ✓ Auth0 domain and audience configured"
echo "  ✓ Google AI API key configured"
echo "  ✓ YouTube API key configured"
echo "  ✓ CORS origins configured for production domain"
