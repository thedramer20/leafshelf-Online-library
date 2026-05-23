@echo off
SETLOCAL

echo.
echo  LeafShelf - Starting up
echo  ======================
echo.

REM 1. Build the React frontend
echo  [1/2] Building React frontend...
pushd client
if not exist node_modules (
    echo        Installing npm dependencies (one time)...
    call npm install
    if errorlevel 1 (
        echo  ERROR: npm install failed.
        popd
        exit /b 1
    )
)
call npm run build
if errorlevel 1 (
    echo  ERROR: React build failed.
    popd
    exit /b 1
)
popd

echo.
echo  [2/2] Starting Jetty on http://localhost:8080
echo.
echo  Open http://localhost:8080 once you see the LeafShelf banner.
echo  Press Ctrl+C to stop.
echo.

REM 2. Start the embedded Jetty server
call mvn jetty:run
