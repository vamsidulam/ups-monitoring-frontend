# PowerShell script to create .env.local file
# Run this script from the frontend directory

$envContent = @"
# API Configuration
VITE_API_BASE_URL=http://localhost:10000/api

# Clerk Authentication (if using)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# WebSocket Configuration
VITE_WS_URL=ws://localhost:10000/ws/ups-updates
"@

# Create the .env.local file
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ .env.local file created successfully!" -ForegroundColor Green
Write-Host "📝 Please update the Clerk key if you're using authentication" -ForegroundColor Yellow
Write-Host "🔄 Restart your frontend dev server to load the new environment variables" -ForegroundColor Cyan
