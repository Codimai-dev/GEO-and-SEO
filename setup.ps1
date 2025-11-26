# CodimAi Setup Script
# This script sets up the development environment for both frontend and backend

Write-Host "🔧 Setting up CodimAi Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path ".\mvp-backend")) {
    Write-Host "❌ Error: mvp-backend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Setup Backend
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📦 Setting up Backend..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Set-Location mvp-backend

# Check for Python
try {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.8 or higher." -ForegroundColor Red
    exit 1
}

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "✅ Virtual environment already exists" -ForegroundColor Green
}

# Activate virtual environment and install dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
.\venv\Scripts\activate
pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Check .env file
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found in mvp-backend/" -ForegroundColor Yellow
    Write-Host "Creating default .env file..." -ForegroundColor Yellow
    @"
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=sqlite:///./app.db
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ Default .env file created" -ForegroundColor Green
} else {
    Write-Host "✅ Backend .env file exists" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "⚛️  Setting up Frontend..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check for Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js 16 or higher." -ForegroundColor Red
    exit 1
}

# Check for npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found! Please install npm." -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

# Check .env file
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found in project root" -ForegroundColor Yellow
    Write-Host "Please create a .env file with your API keys:" -ForegroundColor Yellow
    Write-Host "  GEMINI_API_KEY=your-gemini-api-key" -ForegroundColor Yellow
    Write-Host "  PAGESPEED_API_KEY=your-pagespeed-api-key" -ForegroundColor Yellow
} else {
    Write-Host "✅ Frontend .env file exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure your .env files are configured with API keys" -ForegroundColor White
Write-Host "2. Run .\start-dev.ps1 to start both servers" -ForegroundColor White
Write-Host "3. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "Or manually start the servers:" -ForegroundColor Cyan
Write-Host "  Backend:  cd mvp-backend; .\venv\Scripts\activate; uvicorn app.main:app --reload --port 8000" -ForegroundColor White
Write-Host "  Frontend: npm run dev" -ForegroundColor White
Write-Host ""
