@echo off
SETLOCAL

echo.
echo  LeafShelf - Starting up
echo  ======================
echo.

REM 1. Build the React frontend
echo  [1/3] Building React frontend...
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

REM 2. Sync build output to webapp directory (so Jetty always serves the latest build)
echo  [2/3] Syncing frontend build to webapp...
if exist "src\main\webapp\assets" (
    del /Q "src\main\webapp\assets\*" 2>nul
)
xcopy /E /Y /Q "client\dist\*" "src\main\webapp\" >nul
echo        Done.

echo.
echo  [3/3] Starting Jetty on http://localhost:8081
echo.
echo  Open http://localhost:8081 once you see the LeafShelf banner.
echo  Press Ctrl+C to stop.
echo.

REM 3. Start the embedded Jetty server
call mvn jetty:run
