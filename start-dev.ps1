# CodimAi Development Startup Script
# This script starts both the backend and frontend servers

Write-Host "🚀 Starting CodimAi Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path ".\mvp-backend")) {
    Write-Host "❌ Error: mvp-backend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Start Backend
Write-Host "📦 Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mvp-backend; if (Test-Path venv\Scripts\activate.ps1) { .\venv\Scripts\activate } else { Write-Host 'Virtual environment not found. Please run setup first.' -ForegroundColor Red }; uvicorn app.main:app --reload --port 8000"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "⚛️  Starting Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit (this won't stop the servers)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
