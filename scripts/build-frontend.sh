#!/bin/bash

# Text-to-Learn Frontend Build Script
echo "🚀 Building Text-to-Learn Frontend..."

# Navigate to client directory
cd client

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Frontend build completed successfully!"
    echo "📁 Build files are ready in client/dist/"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "🎉 Frontend is ready for deployment!"
