@echo off
setlocal
cd /d "%~dp0"
echo Starting Spring Boot...
call mvnw.cmd spring-boot:run > backend.log 2>&1
