@echo off

echo Stopping old backend servers on port 3000...

REM Find and kill process on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /F /PID %%a
)

echo.
echo Starting new backend server...
cd backend
start "Olio Backend" cmd /k "node server.js"

echo.
echo Backend server restarted!
echo Check the new window for server logs.
pause
