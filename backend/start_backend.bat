@echo off
cd /d "%~dp0"
echo ========================================================
echo  Starting SaveMore Fiji Backend API on Port 5001...
echo ========================================================
if exist "C:\Users\user\AppData\Local\Python\pythoncore-3.14-64\python.exe" (
    "C:\Users\user\AppData\Local\Python\pythoncore-3.14-64\python.exe" app.py
) else if exist "C:\Users\user\AppData\Local\Python\bin\python.exe" (
    "C:\Users\user\AppData\Local\Python\bin\python.exe" app.py
) else (
    python app.py
)
pause
