@echo off
cd /d "%~dp0"
echo Seeding SaveMore Fiji Database...
if exist "C:\Users\user\AppData\Local\Python\pythoncore-3.14-64\python.exe" (
    "C:\Users\user\AppData\Local\Python\pythoncore-3.14-64\python.exe" seed.py
) else if exist "C:\Users\user\AppData\Local\Python\bin\python.exe" (
    "C:\Users\user\AppData\Local\Python\bin\python.exe" seed.py
) else (
    python seed.py
)
pause
