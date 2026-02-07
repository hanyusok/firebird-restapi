@echo off
setlocal EnableDelayedExpansion

echo Starting Firebird REST API deployment...

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: Set Firebird paths
set "FIREBIRD_PATH=C:\Program Files\Firebird\Firebird_2_5"
set "ISQL_PATH=%FIREBIRD_PATH%\bin\isql.exe"

:: Check if Firebird isql exists
if not exist "%ISQL_PATH%" (
    echo Firebird isql not found at: %ISQL_PATH%
    echo Please check your Firebird installation path.
    pause
    exit /b 1
)

:: Check if .env file exists
if not exist .env (
    echo .env file not found. Please create it with proper configuration.
    pause
    exit /b 1
)

:: Load environment variables from .env file
echo Loading environment variables...
for /f "tokens=1,* delims==" %%a in ('findstr /v "^#" .env') do (
    set "%%a=%%b"
    echo Set %%a=%%b
)

:: Verify environment variables are set
echo.
echo Verifying environment variables...
if not defined FIREBIRD_USER (
    echo FIREBIRD_USER is not set in .env file
    pause
    exit /b 1
)
if not defined FIREBIRD_PASSWORD (
    echo FIREBIRD_PASSWORD is not set in .env file
    pause
    exit /b 1
)
if not defined FIREBIRD_DATABASE (
    echo FIREBIRD_DATABASE is not set in .env file
    pause
    exit /b 1
)

:: Verify database connection
echo.
echo Verifying database connection...
echo Using database: !FIREBIRD_DATABASE!
echo Using user: !FIREBIRD_USER!

:: Create temporary SQL file
echo SELECT 1 FROM RDB$DATABASE; > test.sql

:: Execute the query
"%ISQL_PATH%" -user !FIREBIRD_USER! -password !FIREBIRD_PASSWORD! "!FIREBIRD_HOST!/!FIREBIRD_PORT!:!FIREBIRD_DATABASE!" -i test.sql
set ISQL_ERROR=%ERRORLEVEL%

:: Clean up temporary file
del test.sql

if %ISQL_ERROR% neq 0 (
    echo.
    echo Failed to connect to database. Error code: %ISQL_ERROR%
    echo Please check:
    echo 1. Database path is correct: !FIREBIRD_DATABASE!
    echo 2. Username and password are correct
    echo 3. Firebird service is running
    echo 4. Database file exists and is accessible
    pause
    exit /b 1
)

:: Install dependencies
echo.
echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Failed to install dependencies.
    pause
    exit /b 1
)

:: Start the server in the background
echo.
echo Starting the server...
start /B node server.js

:: Wait for server to start (up to 10 seconds)
echo Waiting for server to start...
set /a count=0
:WAIT_LOOP
timeout /t 1 /nobreak >nul
set /a count+=1
curl http://localhost:3000/api/persons >nul 2>nul
if %ERRORLEVEL% equ 0 goto SERVER_STARTED
if %count% geq 10 (
    echo Server failed to start within 10 seconds.
    pause
    exit /b 1
)
goto WAIT_LOOP

:SERVER_STARTED
echo Server is running successfully!
echo.
echo API is available at: http://localhost:3000/api
echo.
echo Press Ctrl+C to stop the server...

:: Wait for Ctrl+C
:WAIT_LOOP2
timeout /t 1 /nobreak >nul
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="1" goto SERVER_STOPPED
goto WAIT_LOOP2

:SERVER_STOPPED
echo Server stopped.

endlocal 