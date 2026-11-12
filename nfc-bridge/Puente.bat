@echo off
setlocal
title Puente NFC MediTunja
cd /d "%~dp0"

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0puente.ps1"

if errorlevel 1 (
    echo.
    echo El puente NFC se detuvo por un error.
    pause
)
