# ==============================================================================
# Autonomous Infrastructure Digital Twin - One-Click Launcher
# Starts both FastAPI Backend (Port 8000) and Vite React Frontend (Port 5173)
# ==============================================================================

Write-Host "`n[1/3] Detecting Environment Tools..." -ForegroundColor Cyan

$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if ($pythonCmd) {
    $pythonExe = $pythonCmd.Source
} else {
    $pythonExe = "python"
}

$npmCmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npmCmd) {
    $npmCmd = Get-Command npm -ErrorAction SilentlyContinue
}
$npmExe = if ($npmCmd) { $npmCmd.Source } else { "npm.cmd" }

Write-Host "Using Python: $pythonExe" -ForegroundColor Gray
Write-Host "Using npm:    $npmExe" -ForegroundColor Gray

$baseDir = $PSScriptRoot
$backendDir = Join-Path $baseDir "backend"
$frontendDir = Join-Path $baseDir "frontend"

Write-Host "[2/3] Launching FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath $pythonExe -ArgumentList "-m uvicorn app:app --host 0.0.0.0 --port 8000 --reload" -WorkingDirectory $backendDir -PassThru

Start-Sleep -Seconds 2

Write-Host "[3/3] Launching Vite Frontend on http://localhost:5173 ..." -ForegroundColor Green
$frontendProcess = Start-Process -FilePath $npmExe -ArgumentList "run dev -- --host 0.0.0.0 --port 5173" -WorkingDirectory $frontendDir -PassThru

Write-Host "`n==============================================================================" -ForegroundColor Yellow
Write-Host " Infrastructure Digital Twin is Operational!" -ForegroundColor Yellow
Write-Host " Web Application:  http://localhost:5173" -ForegroundColor Cyan
Write-Host " Backend API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "==============================================================================`n" -ForegroundColor Yellow
Write-Host "Press Ctrl+C or close this terminal to stop both servers." -ForegroundColor Gray

try {
    Wait-Process -Id $backendProcess.Id, $frontendProcess.Id
} finally {
    Stop-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProcess.Id -ErrorAction SilentlyContinue
}
