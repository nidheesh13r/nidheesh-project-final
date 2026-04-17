@echo off
setlocal

REM One-shot launcher for full local stack:
REM - Docker DB containers (hotels + taste)
REM - Hotels backend (8001)
REM - Taste backend (8002)
REM - Hotels frontend (5174)
REM - Taste frontend (5176)

set ROOT=D:\nidheesh project
set PY=D:\nidheesh project\.venv\Scripts\python.exe

cd /d "%ROOT%"

echo [1/5] Starting Docker databases and seeders...
docker compose -f docker-compose.db.yml up -d hotels-db hotels-seed taste-db taste-seed
if errorlevel 1 (
  echo Failed to start Docker DB services. Ensure Docker Desktop is running.
  pause
  exit /b 1
)

echo [2/5] Starting Hotels backend on 8001 (Docker DB port 5433)...
start "Hotels Backend" cmd /k "cd /d "%ROOT%\hotels\backend" && set DB_HOST=127.0.0.1 && set DB_PORT=5433 && set DB_NAME=hotels && set DB_USER=postgres && set DB_PASSWORD=secret && "%PY%" -m uvicorn main:app --host 0.0.0.0 --port 8001"

echo [3/5] Starting Taste backend on 8002 (Docker DB port 5434)...
start "Taste Backend" cmd /k "cd /d "%ROOT%\taste-explorer\backend" && set DB_HOST=127.0.0.1 && set DB_PORT=5434 && set DB_NAME=taste_explorer && set DB_USER=postgres && set DB_PASSWORD=secret && "%PY%" -m uvicorn main:app --host 0.0.0.0 --port 8002"

echo [4/5] Starting Hotels frontend on 5174...
start "Hotels Frontend" cmd /k "cd /d "%ROOT%\hotels\react-app" && npm.cmd run dev"

echo [5/5] Starting Taste frontend on 5176...
start "Taste Frontend" cmd /k "cd /d "%ROOT%\taste-explorer\react-app" && npm.cmd run dev"

echo.
echo All services launched.
echo Hotels app: http://localhost:5174
echo Taste app : http://localhost:5176
echo APIs      : http://localhost:8001/health and http://localhost:8002/health
echo.

echo Optional: if centralized login is needed, run this in a new CMD:
echo   cd /d "%ROOT%\login\react-app" ^&^& npm.cmd run dev -- --port 5173

echo.
echo Press any key to close this launcher window.
pause >nul
