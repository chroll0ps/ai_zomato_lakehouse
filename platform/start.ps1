# ============================================================================
# Zomato AI Flagship Platform - Service Launcher
# Starts FastAPI bridge (:8000), Next.js Frontend (:3000), and opens browser
# ============================================================================

$ErrorActionPreference = "Stop"

$PYTHON_EXE = "C:\Users\Y4MIX\Documents\3CI IABD\Bigdata Streaming\finguard_streaming_project-main\.venv\Scripts\python.exe"
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR
$FRONTEND_DIR = Join-Path $SCRIPT_DIR "frontend"

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host " Starting Zomato AI Flagship Platform" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

if (-not (Test-Path $PYTHON_EXE)) {
    Write-Error "Python interpreter not found at: $PYTHON_EXE"
    exit 1
}

# 1. Start FastAPI Bridge on Port 8000
Write-Host "[1/3] Starting FastAPI bridge on http://localhost:8000..." -ForegroundColor Cyan
$apiProcess = Start-Process -FilePath $PYTHON_EXE -ArgumentList "-m", "uvicorn", "api:app", "--app-dir", $SCRIPT_DIR, "--host", "0.0.0.0", "--port", "8000" -PassThru -NoNewWindow

Start-Sleep -Seconds 2

# 2. Start Next.js Frontend on Port 3000
Write-Host "[2/3] Starting Next.js frontend on http://localhost:3000..." -ForegroundColor Cyan
Push-Location $FRONTEND_DIR
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow
Pop-Location

Start-Sleep -Seconds 3

# 3. Open Browser
Write-Host "[3/3] Opening Flagship UI at http://localhost:3000..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "Flagship platform is live! Press Ctrl+C in this terminal to exit." -ForegroundColor Green

try {
    Wait-Process -Id $frontendProcess.Id
} finally {
    Write-Host "Stopping background services..." -ForegroundColor Yellow
    if ($apiProcess -and -not $apiProcess.HasExited) { Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue }
    if ($frontendProcess -and -not $frontendProcess.HasExited) { Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue }
}

