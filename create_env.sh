#!/bin/bash

echo "Creating .env.local file..."

cat > .env.local << 'EOF'
# API Configuration
VITE_API_BASE_URL=http://localhost:10000/api

# Clerk Authentication (if using)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# WebSocket Configuration
VITE_WS_URL=ws://localhost:10000/ws/ups-updates
EOF

echo "✅ .env.local file created successfully!"
echo "📝 Please update the Clerk key if you're using authentication"
echo "🔄 Restart your frontend dev server to load the new environment variables"
