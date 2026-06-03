@echo off
echo Installing dependencies...
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
echo Starting SQL Trainer...
start cmd /k "cd backend && npm run dev"
timeout /t 2
start cmd /k "cd frontend && npm run dev"

echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:3000
echo.
echo Opening browser...
timeout /t 3
start http://localhost:3000
