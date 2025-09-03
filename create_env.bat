@echo off
echo Creating .env.local file...

(
echo # API Configuration
echo VITE_API_BASE_URL=http://localhost:10000/api
echo.
echo # Clerk Authentication (if using)
echo VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
echo.
echo # WebSocket Configuration
echo VITE_WS_URL=ws://localhost:10000/ws/ups-updates
) > .env.local

echo ✅ .env.local file created successfully!
echo 📝 Please update the Clerk key if you're using authentication
echo 🔄 Restart your frontend dev server to load the new environment variables
pause
