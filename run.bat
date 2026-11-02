@echo off
title Autonomous Infrastructure Digital Twin Launcher
echo Starting Infrastructure Digital Twin Platform...
powershell -ExecutionPolicy Bypass -File "%~dp0run.ps1"
pause
